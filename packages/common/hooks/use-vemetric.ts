'use client';

import { useCallback, useEffect, useRef } from 'react';
import { vemetric } from '@vemetric/react';
import { log } from '@repo/shared/logger';
import { 
    ANALYTICS_EVENTS,
    type VemetricUser,
    type VemetricEventData,
    type UserProperties
} from '@repo/shared/types/analytics';
import { PlanSlug } from '@repo/shared/types/subscription';
import { AnalyticsUtils } from '../utils/analytics';

interface UseVemetricOptions {
    debug?: boolean;
    autoTrack?: boolean;
}

/**
 * Custom hook for Vemetric analytics integration
 * Provides type-safe event tracking and user identification
 */
export function useVemetric(options: UseVemetricOptions = {}) {
    const { debug = false, autoTrack: _autoTrack = true } = options;
    const isInitialized = useRef(false);
    const currentUser = useRef<VemetricUser | null>(null);

    // Check if Vemetric is available and enabled
    const isEnabled = useCallback(() => {
        return (
            typeof window !== 'undefined' &&
            process.env.NEXT_PUBLIC_VEMETRIC_TOKEN &&
            vemetric
        );
    }, []);

    // Initialize Vemetric tracking
    useEffect(() => {
        if (!isEnabled() || isInitialized.current) return;

        try {
            if (debug) {
                log.debug('Vemetric initialized');
            }
            isInitialized.current = true;
        } catch (error) {
            log.error({ error }, 'Failed to initialize Vemetric');
        }
    }, [isEnabled, debug]);

    // Identify user with Better-Auth integration
    const identifyUser = useCallback(async (user: VemetricUser) => {
        if (!isEnabled()) {
            if (debug) log.debug('Vemetric not enabled, skipping user identification');
            return;
        }

        try {
            const userData = {
                identifier: user.identifier,
                displayName: user.displayName,
                allowCookies: user.allowCookies ?? false,
                data: AnalyticsUtils.createUserProperties({
                    subscriptionTier: user.subscriptionTier || 'VT_BASE',
                    ...AnalyticsUtils.getDeviceInfo(),
                    ...user.data,
                }),
            };

            await vemetric.identify(userData);
            currentUser.current = user;

            // Track sign-in event
            await trackEvent(ANALYTICS_EVENTS.USER_SIGNED_IN, {
                authMethod: 'oauth',
                subscriptionTier: user.subscriptionTier || 'VT_BASE',
            });

            if (debug) {
                log.debug({ userId: user.identifier }, 'User identified in Vemetric');
            }
        } catch (error) {
            log.error({ error, userId: user.identifier }, 'Failed to identify user in Vemetric');
        }
    }, [isEnabled, debug]);

    // Update user properties
    const updateUser = useCallback(async (properties: Partial<UserProperties>) => {
        if (!isEnabled() || !currentUser.current) {
            if (debug) log.debug('Cannot update user - not identified or Vemetric not enabled');
            return;
        }

        try {
            const sanitizedProperties = AnalyticsUtils.createUserProperties({
                subscriptionTier: currentUser.current.subscriptionTier || PlanSlug.VT_BASE,
                ...properties,
            });

            await vemetric.updateUser({
                data: sanitizedProperties,
            });

            if (debug) {
                log.debug({ properties: sanitizedProperties }, 'User properties updated');
            }
        } catch (error) {
            log.error({ error, properties }, 'Failed to update user properties');
        }
    }, [isEnabled, debug]);

    // Track custom events
    const trackEvent = useCallback(async (
        eventName: string, 
        data?: VemetricEventData,
        skipLogging = false
    ) => {
        if (!isEnabled()) {
            if (debug && !skipLogging) log.debug('Vemetric not enabled, skipping event tracking');
            return;
        }

        try {
            const sanitizedData = data ? AnalyticsUtils.sanitizeData(data) : undefined;
            
            await vemetric.trackEvent(eventName, sanitizedData);

            if (!skipLogging) {
                AnalyticsUtils.logEvent(eventName, sanitizedData);
            }
        } catch (error) {
            // Silently handle CORS and network errors - don't spam console
            if (error instanceof TypeError && error.message.includes('NetworkError')) {
                // CORS/Network error - use fallback analytics if needed
                if (debug) {
                    log.debug({ eventName, error: error.message }, 'Vemetric CORS error - using fallback');
                }
            } else {
                log.error({ error, eventName, data }, 'Failed to track event');
            }
        }
    }, [isEnabled, debug]);

    // Batch track multiple events
    const trackEvents = useCallback(async (events: Array<{ name: string; data?: VemetricEventData }>) => {
        if (!isEnabled()) return;

        for (const event of events) {
            await trackEvent(event.name, event.data, true);
        }
    }, [trackEvent, isEnabled]);

    // Track page views manually (if auto-tracking is disabled)
    const trackPageView = useCallback(async (path?: string, title?: string) => {
        if (!isEnabled()) return;

        try {
            await vemetric.trackPageView({
                path: path || window.location.pathname,
                title: title || document.title,
            });

            if (debug) {
                log.debug({ path, title }, 'Page view tracked');
            }
        } catch (error) {
            log.error({ error, path }, 'Failed to track page view');
        }
    }, [isEnabled, debug]);

    // Sign out user
    const signOutUser = useCallback(async () => {
        if (!isEnabled() || !currentUser.current) return;

        try {
            await trackEvent(ANALYTICS_EVENTS.USER_SIGNED_OUT, {
                sessionDuration: Date.now(), // Will be calculated on backend
            });

            // Reset user
            currentUser.current = null;

            if (debug) {
                log.debug('User signed out from Vemetric');
            }
        } catch (error) {
            log.error({ error }, 'Failed to track sign out event');
        }
    }, [trackEvent, isEnabled, debug]);

    // Performance tracking helper
    const trackPerformance = useCallback(async (
        eventName: string,
        startTime: number,
        additionalData?: VemetricEventData
    ) => {
        const performanceData = AnalyticsUtils.createPerformanceData(startTime);
        await trackEvent(eventName, {
            ...performanceData,
            ...additionalData,
        });
    }, [trackEvent]);

    // Create timer for performance tracking
    const createTimer = useCallback(() => {
        const startTime = performance.now();
        return {
            end: (eventName: string, additionalData?: VemetricEventData) =>
                trackPerformance(eventName, startTime, additionalData)
        };
    }, [trackPerformance]);

    // Track user journey events
    const trackUserJourney = useCallback(async (
        step: string,
        category?: string,
        value?: number
    ) => {
        await trackEvent(ANALYTICS_EVENTS.ONBOARDING_STARTED, 
            AnalyticsUtils.createUserJourneyEventData({ step, category, value })
        );
    }, [trackEvent]);

    return {
        // State
        isEnabled: isEnabled(),
        isInitialized: isInitialized.current,
        currentUser: currentUser.current,

        // Core functions
        identifyUser,
        updateUser,
        signOutUser,
        trackEvent,
        trackEvents,
        trackPageView,

        // Specialized tracking
        trackPerformance,
        trackUserJourney,
        createTimer,

        // Utilities
        utils: AnalyticsUtils,
        events: ANALYTICS_EVENTS,
    };
}

// Export singleton instance for global use
let globalVemetric: ReturnType<typeof useVemetric> | null = null;

export function getVemetricInstance() {
    if (typeof window === 'undefined') return null;
    
    if (!globalVemetric) {
        // This is a bit of a hack, but allows us to use the hook outside of React
        globalVemetric = useVemetric();
    }
    
    return globalVemetric;
}

// Convenience functions for common events
export const vemetricHelpers = {
    // Chat events
    trackMessageSent: async (data: { 
        modelName: string; 
        messageLength: number; 
        hasAttachments?: boolean;
        toolsUsed?: string[];
    }) => {
        const instance = getVemetricInstance();
        if (!instance) return;
        
        await instance.trackEvent(
            ANALYTICS_EVENTS.MESSAGE_SENT,
            AnalyticsUtils.createChatEventData(data)
        );
    },

    // Feature usage
    trackFeatureUsed: async (featureName: string, context?: string) => {
        const instance = getVemetricInstance();
        if (!instance) return;
        
        await instance.trackEvent(
            ANALYTICS_EVENTS.TOOL_USED,
            AnalyticsUtils.createFeatureEventData({ featureName, context })
        );
    },

    // File upload
    trackFileUploaded: async (fileType: string, fileSize: number) => {
        const instance = getVemetricInstance();
        if (!instance) return;
        
        await instance.trackEvent(
            ANALYTICS_EVENTS.FILE_UPLOADED,
            AnalyticsUtils.createFileEventData({ fileType, fileSize })
        );
    },
};
