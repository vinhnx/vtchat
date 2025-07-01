'use client';

import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { ANALYTICS_EVENTS } from '../utils/analytics';
import { SecurityEventData } from '@repo/shared/types/analytics';

/**
 * Security and threat monitoring tracker
 * Tracks security events while protecting user privacy
 */
export function VemetricSecurityTracker() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();
    const securityEventsRef = useRef<Map<string, number>>(new Map());

    return null; // This component doesn't render anything
}

/**
 * Hook for tracking security and authentication events
 * Ensures sensitive data is hashed or anonymized
 */
export function useVemetricSecurityTracking() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    // Hash IP addresses for privacy
    const hashIP = async (ip: string): Promise<string> => {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            try {
                const encoder = new TextEncoder();
                const data = encoder.encode(ip + 'salt'); // Add salt for security
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
            } catch (error) {
                // Fallback to simple hash
                return btoa(ip).substring(0, 8);
            }
        }
        return btoa(ip).substring(0, 8);
    };

    // Sanitize user agent for privacy
    const sanitizeUserAgent = (userAgent: string): string => {
        // Remove version numbers and specific identifiers
        return userAgent
            .replace(/\d+\.\d+\.\d+/g, 'X.X.X') // Version numbers
            .replace(/\([^)]+\)/g, '(...)') // Detailed system info
            .substring(0, 100); // Limit length
    };

    const trackSuspiciousActivity = async (params: {
        activityType: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        details?: string;
        userAgent?: string;
        ipAddress?: string;
        blocked?: boolean;
    }) => {
        if (!isEnabled) return;

        try {
            const eventData: SecurityEventData = {
                eventType: params.activityType,
                severity: params.severity,
                blocked: params.blocked,
                userAgent: params.userAgent ? sanitizeUserAgent(params.userAgent) : undefined,
                ipHash: params.ipAddress ? await hashIP(params.ipAddress) : undefined,
                // Don't store detailed suspicious activity for privacy
                hasDetails: !!params.details,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, eventData);

            log.warn({ 
                activityType: params.activityType,
                severity: params.severity,
                blocked: params.blocked
            }, 'Suspicious activity tracked');
        } catch (error) {
            log.error({ error }, 'Failed to track suspicious activity');
        }
    };

    const trackSessionExpiration = async (params: {
        sessionLength: number; // minutes
        expirationType: 'timeout' | 'forced' | 'manual';
        wasActive?: boolean;
        deviceType?: string;
    }) => {
        if (!isEnabled) return;

        try {
            const eventData = {
                sessionLength: params.sessionLength,
                expirationType: params.expirationType,
                wasActive: params.wasActive,
                deviceType: params.deviceType,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SESSION_EXPIRED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track session expiration');
        }
    };

    const trackAuthenticationAttempt = async (params: {
        method: 'email' | 'oauth' | 'magic_link' | 'api_key';
        success: boolean;
        errorCode?: string;
        attemptNumber?: number;
        userAgent?: string;
        ipAddress?: string;
        timeTaken?: number;
    }) => {
        if (!isEnabled) return;

        try {
            const eventData = {
                method: params.method,
                success: params.success,
                errorCode: params.errorCode,
                attemptNumber: params.attemptNumber,
                timeTaken: params.timeTaken,
                userAgent: params.userAgent ? sanitizeUserAgent(params.userAgent) : undefined,
                ipHash: params.ipAddress ? await hashIP(params.ipAddress) : undefined,
                timestamp: Date.now(),
            };

            if (params.success) {
                await trackEvent(ANALYTICS_EVENTS.USER_SIGNED_IN, eventData);
            } else {
                // Track failed auth attempts for security monitoring
                await trackEvent(ANALYTICS_EVENTS.ERROR_ENCOUNTERED, {
                    ...eventData,
                    errorType: 'authentication_failed',
                });
            }
        } catch (error) {
            log.error({ error }, 'Failed to track authentication attempt');
        }
    };

    const trackPermissionViolation = async (params: {
        resource: string;
        action: string;
        requiredPermission: string;
        userTier: string;
        escalationAttempted?: boolean;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData: SecurityEventData = {
                eventType: 'permission_violation',
                resource: params.resource,
                action: params.action,
                requiredPermission: params.requiredPermission,
                userTier: params.userTier,
                escalationAttempted: params.escalationAttempted,
                severity: params.escalationAttempted ? 'high' : 'medium',
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track permission violation');
        }
    };

    const trackDataAccessAttempt = async (params: {
        dataType: string;
        accessType: 'read' | 'write' | 'delete' | 'export';
        authorized: boolean;
        dataOwner?: 'self' | 'other' | 'shared';
        ipAddress?: string;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = {
                dataType: params.dataType,
                accessType: params.accessType,
                authorized: params.authorized,
                dataOwner: params.dataOwner,
                ipHash: params.ipAddress ? await hashIP(params.ipAddress) : undefined,
                timestamp: Date.now(),
            };

            if (!params.authorized) {
                await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, {
                    ...eventData,
                    eventType: 'unauthorized_data_access',
                    severity: 'high' as const,
                });
            } else {
                // Track authorized access for audit purposes
                await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                    ...eventData,
                    setting: 'data_access',
                    action: params.accessType,
                });
            }
        } catch (error) {
            log.error({ error }, 'Failed to track data access attempt');
        }
    };

    const trackApiKeyUsage = async (params: {
        keyType: 'openai' | 'anthropic' | 'google' | 'other';
        operation: 'validation' | 'usage' | 'rotation' | 'revocation';
        success: boolean;
        errorCode?: string;
        usageCount?: number;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = {
                keyType: params.keyType,
                operation: params.operation,
                success: params.success,
                errorCode: params.errorCode,
                usageCount: params.usageCount,
                timestamp: Date.now(),
            };

            // Don't use API_KEY events to avoid redaction
            await trackEvent(ANALYTICS_EVENTS.SETTINGS_CHANGED, {
                ...eventData,
                setting: 'api_configuration',
                action: params.operation,
            });
        } catch (error) {
            log.error({ error }, 'Failed to track API key usage');
        }
    };

    const trackRateLimitBypass = async (params: {
        endpoint: string;
        bypassMethod: string;
        severity: 'low' | 'medium' | 'high';
        blocked: boolean;
        ipAddress?: string;
    }) => {
        if (!isEnabled) return;

        try {
            const domain = new URL(params.endpoint).hostname;
            
            const eventData: SecurityEventData = {
                eventType: 'rate_limit_bypass',
                endpoint: domain,
                bypassMethod: params.bypassMethod,
                severity: params.severity,
                blocked: params.blocked,
                ipHash: params.ipAddress ? await hashIP(params.ipAddress) : undefined,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, eventData);

            log.warn({ 
                domain,
                bypassMethod: params.bypassMethod,
                blocked: params.blocked
            }, 'Rate limit bypass attempt tracked');
        } catch (error) {
            log.error({ error }, 'Failed to track rate limit bypass');
        }
    };

    const trackContentPolicyViolation = async (params: {
        violationType: string;
        contentType: 'text' | 'image' | 'file';
        automated: boolean;
        severity: 'low' | 'medium' | 'high';
        action: 'blocked' | 'flagged' | 'reviewed';
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData: SecurityEventData = {
                eventType: 'content_policy_violation',
                violationType: params.violationType,
                contentType: params.contentType,
                automated: params.automated,
                severity: params.severity,
                action: params.action,
                blocked: params.action === 'blocked',
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track content policy violation');
        }
    };

    const trackCrossOriginRequest = async (params: {
        origin: string;
        destination: string;
        allowed: boolean;
        requestType: string;
    }) => {
        if (!isEnabled) return;

        try {
            const eventData = {
                origin: new URL(params.origin).hostname,
                destination: new URL(params.destination).hostname,
                allowed: params.allowed,
                requestType: params.requestType,
                timestamp: Date.now(),
            };

            if (!params.allowed) {
                await trackEvent(ANALYTICS_EVENTS.SUSPICIOUS_ACTIVITY, {
                    ...eventData,
                    eventType: 'cross_origin_violation',
                    severity: 'medium' as const,
                });
            }
        } catch (error) {
            log.error({ error }, 'Failed to track cross-origin request');
        }
    };

    return {
        trackSuspiciousActivity,
        trackSessionExpiration,
        trackAuthenticationAttempt,
        trackPermissionViolation,
        trackDataAccessAttempt,
        trackApiKeyUsage,
        trackRateLimitBypass,
        trackContentPolicyViolation,
        trackCrossOriginRequest,
        isEnabled,
    };
}
