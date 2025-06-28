/**
 * Arcjet security configuration constants
 */

// Environment variable keys
export const ARCJET_ENV_KEYS = {
    ARCJET_KEY: 'ARCJET_KEY',
} as const;

// Rate limit configurations for different endpoints
export const ARCJET_RATE_LIMITS = {
    // Chat endpoints - allow bursts but limit sustained usage
    CHAT: {
        algorithm: 'slidingWindow' as const,
        max: 50,
        interval: '1h',
    },
    
    // Authentication endpoints - strict limits to prevent brute force
    AUTH: {
        algorithm: 'fixedWindow' as const,
        max: 10,
        interval: '10m',
    },
    
    // API endpoints - token bucket for flexibility
    API: {
        algorithm: 'tokenBucket' as const,
        max: 100,
        interval: '1m',
        capacity: 100,
        refillRate: 50,
    },
    
    // Feedback/contact forms - very limited
    FEEDBACK: {
        algorithm: 'slidingWindow' as const,
        max: 5,
        interval: '10m',
    },
    
    // Upload endpoints - moderate limits
    UPLOAD: {
        algorithm: 'slidingWindow' as const,
        max: 20,
        interval: '1h',
    },
    
    // Webhook endpoints - higher limits for legitimate traffic
    WEBHOOK: {
        algorithm: 'fixedWindow' as const,
        max: 1000,
        interval: '1h',
    },
} as const;

// Bot protection configurations
export const ARCJET_BOT_CONFIG = {
    // Default allowed bots
    DEFAULT_ALLOW: [
        'CATEGORY:SEARCH_ENGINE', // Google, Bing, etc.
        'CATEGORY:MONITOR', // Uptime monitoring
    ],
    
    // Strict mode - no bots allowed
    STRICT_DENY: [],
    
    // Relaxed mode - allow more bot categories
    RELAXED_ALLOW: [
        'CATEGORY:SEARCH_ENGINE',
        'CATEGORY:MONITOR',
        'CATEGORY:PREVIEW', // Link previews (Slack, Discord)
        'CATEGORY:SOCIAL', // Social media crawlers
    ],
} as const;

// Email validation rules
export const ARCJET_EMAIL_RULES = {
    STRICT: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS', 'FREE'],
    MODERATE: ['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS'],
    BASIC: ['DISPOSABLE', 'INVALID'],
} as const;

// Characteristic configurations
export const ARCJET_CHARACTERISTICS = {
    IP_ONLY: ['ip.src'],
    USER_AND_IP: ['userId', 'ip.src'],
    API_KEY: ['apiKey'],
    SESSION: ['sessionId', 'ip.src'],
} as const;

// Error response types
export const ARCJET_ERROR_TYPES = {
    BOT_DENIED: 'BOT_DENIED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    EMAIL_INVALID: 'EMAIL_INVALID',
    SHIELD_BLOCKED: 'SHIELD_BLOCKED',
    GENERAL_DENIED: 'GENERAL_DENIED',
} as const;

// HTTP status codes for different Arcjet responses
export const ARCJET_STATUS_CODES = {
    BOT_DENIED: 403,
    RATE_LIMIT_EXCEEDED: 429,
    EMAIL_INVALID: 400,
    SHIELD_BLOCKED: 403,
    GENERAL_DENIED: 403,
} as const;

// Route patterns that should be protected
export const ARCJET_PROTECTED_ROUTES = {
    // API routes that need protection
    API_ROUTES: [
        '/api/chat/**',
        '/api/auth/**',
        '/api/feedback/**',
        '/api/upload/**',
        '/api/user/**',
    ],
    
    // Public routes that don't need protection
    PUBLIC_ROUTES: [
        '/api/health',
        '/api/webhook/**', // Webhooks have their own protection
    ],
} as const;

export type ArcjetErrorType = keyof typeof ARCJET_ERROR_TYPES;
export type ArcjetRateLimit = typeof ARCJET_RATE_LIMITS[keyof typeof ARCJET_RATE_LIMITS];
