/**
 * Advanced Subscription Session Cache
 * Per-account caching with session tracking and non-logged-in user handling
 */

import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { logger } from '@repo/shared/logger';

export interface SessionSubscriptionStatus {
    plan: PlanSlug;
    status: SubscriptionStatusEnum;
    isPlusSubscriber: boolean;
    currentPeriodEnd?: Date;
    hasSubscription: boolean;
    subscriptionId?: string;
    userId: string | null; // null for non-logged-in users
    sessionId: string;
    cachedAt: Date;
    expiresAt: Date;
    fetchCount: number;
    lastRefreshTrigger: 'initial' | 'payment' | 'expiration' | 'page_refresh' | 'manual';
}

// Session-based cache - tracks per user session
const sessionSubscriptionCache = new Map<string, SessionSubscriptionStatus>();

// Track which users have been fetched in current session
const sessionFetchTracker = new Map<string, boolean>();

// Track in-flight requests to prevent duplicates
const inFlightRequests = new Map<string, Promise<SessionSubscriptionStatus>>();

// Cache durations based on subscription type and trigger
const CACHE_DURATIONS = {
    [PlanSlug.VT_PLUS]: {
        initial: 2 * 60 * 60 * 1000, // 2 hours for initial fetch (longer for logged-in users)
        payment: 5 * 60 * 1000, // 5 minutes after payment (fresher data)
        expiration: 1 * 60 * 1000, // 1 minute around expiration
        page_refresh: 60 * 60 * 1000, // 1 hour for page refresh
        manual: 10 * 60 * 1000, // 10 minutes for manual refresh
    },
    [PlanSlug.VT_BASE]: {
        initial: 60 * 60 * 1000, // 1 hour for free users
        payment: 2 * 60 * 1000, // 2 minutes after payment
        expiration: 1 * 60 * 1000, // 1 minute around expiration
        page_refresh: 30 * 60 * 1000, // 30 minutes for page refresh
        manual: 5 * 60 * 1000, // 5 minutes for manual refresh
    },
    anonymous: {
        initial: 20 * 60 * 1000, // 20 minutes for anonymous users (increased from 10)
        payment: 0, // No payment for anonymous
        expiration: 0, // No expiration for anonymous
        page_refresh: 10 * 60 * 1000, // 10 minutes for page refresh
        manual: 2 * 60 * 1000, // 2 minutes for manual refresh
    },
};

/**
 * Generate session-specific cache key
 */
function getSessionCacheKey(userId: string | null, sessionId: string): string {
    let cacheKey: string;
    if (!userId) {
        cacheKey = `subscription:anonymous:${sessionId}`;
    } else {
        // For logged-in users, use user ID as the primary key (no session dependency)
        cacheKey = `subscription:user:${userId}`;
    }

    console.log(
        `[Session Cache] Generated cache key: ${cacheKey} for userId: ${userId}, sessionId: ${sessionId}`
    );
    return cacheKey;
}

/**
 * Get current session ID (use headers for anonymous users)
 */
function getSessionId(request?: Request): string {
    if (typeof window !== 'undefined') {
        // Client-side: use session storage for persistent session ID
        let sessionId = sessionStorage.getItem('vtchat_session_id');
        if (!sessionId) {
            sessionId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem('vtchat_session_id', sessionId);
        }
        return sessionId;
    }

    // Server-side: try to create session from IP + User-Agent for anonymous users
    if (request) {
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded
            ? forwarded.split(',')[0]
            : request.headers.get('x-real-ip') || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Create deterministic session ID based on IP and User-Agent
        const sessionData = `${ip}_${userAgent}`;
        const hash = simpleHash(sessionData);
        const sessionId = `anon_${hash}`;

        console.log(
            `[Session Cache] Generated session ID: ${sessionId} for IP: ${ip.substring(0, 10)}... UA: ${userAgent.substring(0, 30)}...`
        );
        return sessionId;
    }

    // Fallback: generate unique ID for this request
    const fallbackId = `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[Session Cache] Using fallback session ID: ${fallbackId}`);
    return fallbackId;
}

/**
 * Simple hash function for creating deterministic session IDs
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Determine cache duration based on subscription type and trigger
 */
function getCacheDuration(
    isPlusSubscriber: boolean,
    trigger: SessionSubscriptionStatus['lastRefreshTrigger'],
    userId: string | null
): number {
    const type = !userId ? 'anonymous' : isPlusSubscriber ? PlanSlug.VT_PLUS : PlanSlug.VT_BASE;
    return CACHE_DURATIONS[type][trigger] || CACHE_DURATIONS[type].initial;
}

/**
 * Check if cache entry is valid
 */
function isSessionCacheValid(cached: SessionSubscriptionStatus, request?: Request): boolean {
    const now = new Date();

    // Cache expired by time
    if (now > cached.expiresAt) {
        return false;
    }

    // If subscription has an end date and we're past it, invalidate cache
    if (cached.currentPeriodEnd && now > cached.currentPeriodEnd) {
        return false;
    }

    // For non-logged-in users, validate session matches
    if (!cached.userId && cached.sessionId !== getSessionId(request)) {
        return false;
    }

    return true;
}

/**
 * Get cached subscription status for current session
 */
export function getSessionSubscriptionStatus(
    userId: string | null,
    trigger: SessionSubscriptionStatus['lastRefreshTrigger'] = 'initial',
    request?: Request
): SessionSubscriptionStatus | null {
    const sessionId = getSessionId(request);
    const cacheKey = getSessionCacheKey(userId, sessionId);
    const cached = sessionSubscriptionCache.get(cacheKey);

    console.log(`[Session Cache] Looking for cache with key: ${cacheKey}, found: ${!!cached}`);

    if (!cached) {
        return null;
    }

    if (!isSessionCacheValid(cached, request)) {
        console.log(`[Session Cache] Cache expired for key: ${cacheKey}`);
        sessionSubscriptionCache.delete(cacheKey);
        return null;
    }

    // For page refresh, check if we should allow cached data
    if (trigger === 'page_refresh') {
        const userKey = userId || 'anonymous';
        const hasBeenFetched = sessionFetchTracker.get(userKey);

        if (!hasBeenFetched) {
            // First time in session, invalidate cache to get fresh data
            console.log(`[Session Cache] First page refresh for ${userKey}, invalidating cache`);
            sessionSubscriptionCache.delete(cacheKey);
            return null;
        }
    }

    console.log(
        `[Session Cache] Cache hit for key: ${cacheKey}, fetch count: ${cached.fetchCount}`
    );
    return cached;
}

/**
 * Cache subscription status for current session
 */
export function cacheSessionSubscriptionStatus(
    status: Omit<
        SessionSubscriptionStatus,
        'cachedAt' | 'expiresAt' | 'sessionId' | 'fetchCount' | 'lastRefreshTrigger'
    >,
    trigger: SessionSubscriptionStatus['lastRefreshTrigger'] = 'initial',
    request?: Request
): SessionSubscriptionStatus {
    const now = new Date();
    const sessionId = getSessionId(request);
    const cacheKey = getSessionCacheKey(status.userId, sessionId);

    // Get existing cache to preserve fetch count
    const existing = sessionSubscriptionCache.get(cacheKey);
    const fetchCount = existing ? existing.fetchCount + 1 : 1;

    const cacheDuration = getCacheDuration(status.isPlusSubscriber, trigger, status.userId);

    const cached: SessionSubscriptionStatus = {
        ...status,
        sessionId,
        cachedAt: now,
        expiresAt: new Date(now.getTime() + cacheDuration),
        fetchCount,
        lastRefreshTrigger: trigger,
    };

    sessionSubscriptionCache.set(cacheKey, cached);

    // Mark user as fetched in this session
    const userKey = status.userId || 'anonymous';
    sessionFetchTracker.set(userKey, true);

    console.log(
        `[Session Cache] Cached subscription for ${userKey} with key ${cacheKey} (${trigger}), expires in ${Math.round(cacheDuration / 1000 / 60)}min, fetch count: ${fetchCount}`
    );

    return cached;
}

/**
 * Invalidate session cache for specific user
 */
export function invalidateSessionSubscriptionCache(userId: string | null, request?: Request): void {
    const sessionId = getSessionId(request);
    const cacheKey = getSessionCacheKey(userId, sessionId);
    sessionSubscriptionCache.delete(cacheKey);

    // Reset fetch tracker for this user
    const userKey = userId || 'anonymous';
    sessionFetchTracker.delete(userKey);

    console.log(`[Session Cache] Invalidated cache for ${userKey} with session: ${sessionId}`);
}

/**
 * Check if user subscription has been fetched in current session
 */
export function hasBeenFetchedInSession(userId: string | null): boolean {
    const userKey = userId || 'anonymous';
    return sessionFetchTracker.get(userKey) || false;
}

/**
 * Get anonymous user default subscription status
 */
export function getAnonymousSubscriptionStatus(): Omit<
    SessionSubscriptionStatus,
    'cachedAt' | 'expiresAt' | 'sessionId' | 'fetchCount' | 'lastRefreshTrigger'
> {
    return {
        plan: PlanSlug.VT_BASE,
        status: SubscriptionStatusEnum.ACTIVE,
        isPlusSubscriber: false,
        hasSubscription: false,
        userId: null,
    };
}

/**
 * Clean up expired session caches
 */
export function cleanupExpiredSessionCaches(): void {
    let cleanedCount = 0;

    // Convert to array to avoid iterator issues
    const entries = Array.from(sessionSubscriptionCache.entries());
    for (const [key, cached] of entries) {
        if (!isSessionCacheValid(cached, undefined)) {
            sessionSubscriptionCache.delete(key);
            cleanedCount++;
        }
    }

    if (cleanedCount > 0) {
        console.log(`[Session Cache] Cleaned up ${cleanedCount} expired session cache entries`);
    }
}

/**
 * Get session cache statistics
 */
export function getSessionCacheStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    let anonymousEntries = 0;
    let userEntries = 0;

    // Convert to array to avoid iterator issues
    const entries = Array.from(sessionSubscriptionCache.entries());
    for (const [_key, cached] of entries) {
        if (isSessionCacheValid(cached, undefined)) {
            validEntries++;
            if (cached.userId) {
                userEntries++;
            } else {
                anonymousEntries++;
            }
        } else {
            expiredEntries++;
        }
    }

    return {
        totalEntries: sessionSubscriptionCache.size,
        validEntries,
        expiredEntries,
        anonymousEntries,
        userEntries,
        sessionsFetched: sessionFetchTracker.size,
        cacheHitRate: validEntries / (validEntries + expiredEntries) || 0,
    };
}

/**
 * Get or create a deduplicated subscription fetch request
 * Prevents multiple simultaneous requests for the same user/trigger combination
 */
export async function getOrCreateSubscriptionRequest(
    userId: string | null,
    trigger: SessionSubscriptionStatus['lastRefreshTrigger'],
    request: Request,
    fetchFunction: () => Promise<
        Omit<
            SessionSubscriptionStatus,
            'cachedAt' | 'expiresAt' | 'sessionId' | 'fetchCount' | 'lastRefreshTrigger'
        >
    >
): Promise<SessionSubscriptionStatus> {
    const sessionId = getSessionId(request);
    const cacheKey = getSessionCacheKey(userId, sessionId);
    const requestKey = `${cacheKey}:${trigger}`;

    console.log(`[Session Cache] Checking for in-flight request: ${requestKey}`);

    // Check if there's already an in-flight request for this user/trigger combination
    const existingRequest = inFlightRequests.get(requestKey);
    if (existingRequest) {
        console.log(
            `[Session Cache] Found in-flight request, waiting for completion: ${requestKey}`
        );
        return existingRequest;
    }

    // Create new request
    const requestPromise = (async () => {
        try {
            console.log(`[Session Cache] Starting new request: ${requestKey}`);
            const data = await fetchFunction();
            const cached = cacheSessionSubscriptionStatus(data, trigger, request);
            console.log(`[Session Cache] Request completed and cached: ${requestKey}`);
            return cached;
        } finally {
            // Clean up in-flight request tracking
            inFlightRequests.delete(requestKey);
        }
    })();

    // Track the in-flight request
    inFlightRequests.set(requestKey, requestPromise);

    return requestPromise;
}

// Periodic cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(cleanupExpiredSessionCaches, 5 * 60 * 1000);
}

export default {
    getSessionSubscriptionStatus,
    cacheSessionSubscriptionStatus,
    invalidateSessionSubscriptionCache,
    hasBeenFetchedInSession,
    getAnonymousSubscriptionStatus,
    cleanupExpiredSessionCaches,
    getSessionCacheStats,
    getOrCreateSubscriptionRequest,
};
