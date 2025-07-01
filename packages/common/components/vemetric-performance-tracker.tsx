'use client';

import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { useSession } from '@repo/shared/lib/auth-client';
import { logger } from '@repo/shared/logger';
import { ANALYTICS_EVENTS } from '../utils/analytics';
import { PerformanceEventData, ToolEventData } from '@repo/shared/types/analytics';

/**
 * Performance and reliability tracking for critical operations
 * Monitors system health and user experience metrics
 */
export function VemetricPerformanceTracker() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();
    const responseTimeRef = useRef<{ [key: string]: number }>({});

    // Track page performance metrics
    useEffect(() => {
        if (!isEnabled || typeof window === 'undefined') return;

        const trackPagePerformance = () => {
            try {
                const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                if (navigation) {
                    trackEvent(ANALYTICS_EVENTS.PAGE_LOAD_TIME, {
                        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                        firstPaint: navigation.responseEnd - navigation.responseStart,
                        ttfb: navigation.responseStart - navigation.requestStart,
                        resourceCount: performance.getEntriesByType('resource').length,
                        timestamp: Date.now(),
                    });
                }
            } catch (error) {
                logger.error({ error }, 'Failed to track page performance');
            }
        };

        // Track performance after page load
        if (document.readyState === 'complete') {
            trackPagePerformance();
        } else {
            window.addEventListener('load', trackPagePerformance);
            return () => window.removeEventListener('load', trackPagePerformance);
        }
    }, [isEnabled, trackEvent]);

    return null; // This component doesn't render anything
}

/**
 * Hook for tracking performance, tools, and reliability events
 * Focuses on system health and user experience metrics
 */
export function useVemetricPerformanceTracking() {
    const { trackEvent, trackPerformance, isEnabled, createTimer } = useVemetric();
    const { data: session } = useSession();

    const trackApiResponseTime = async (params: {
        endpoint: string;
        method: string;
        responseTime: number;
        statusCode: number;
        success: boolean;
        retryCount?: number;
        cacheHit?: boolean;
    }) => {
        if (!isEnabled) return;

        try {
            // Extract domain only for privacy
            const domain = new URL(params.endpoint).hostname;
            
            const eventData: PerformanceEventData = {
                endpoint: domain,
                method: params.method,
                duration: params.responseTime,
                statusCode: params.statusCode,
                success: params.success,
                retryCount: params.retryCount,
                cacheHit: params.cacheHit,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.API_RESPONSE_TIME, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track API response time');
        }
    };

    const trackResponseTimeout = async (params: {
        endpoint: string;
        timeoutDuration: number;
        expectedResponseTime: number;
        retryAttempt: number;
    }) => {
        if (!isEnabled) return;

        try {
            const domain = new URL(params.endpoint).hostname;
            
            const eventData: PerformanceEventData = {
                endpoint: domain,
                duration: params.timeoutDuration,
                expectedDuration: params.expectedResponseTime,
                retryCount: params.retryAttempt,
                resourceType: 'api',
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.RESPONSE_TIMEOUT, eventData);

            logger.warn({ 
                domain,
                timeoutDuration: params.timeoutDuration,
                retryAttempt: params.retryAttempt
            }, 'Response timeout tracked');
        } catch (error) {
            logger.error({ error }, 'Failed to track response timeout');
        }
    };

    const trackRateLimitExceeded = async (params: {
        endpoint: string;
        limitType: 'requests' | 'tokens' | 'bandwidth';
        currentUsage: number;
        limit: number;
        resetTime?: number;
    }) => {
        if (!isEnabled) return;

        try {
            const domain = new URL(params.endpoint).hostname;
            
            const eventData = {
                endpoint: domain,
                limitType: params.limitType,
                currentUsage: params.currentUsage,
                limit: params.limit,
                usagePercentage: (params.currentUsage / params.limit) * 100,
                resetTime: params.resetTime,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.RATE_LIMIT_EXCEEDED, eventData);

            logger.warn({ 
                domain,
                limitType: params.limitType,
                usagePercentage: eventData.usagePercentage
            }, 'Rate limit exceeded tracked');
        } catch (error) {
            logger.error({ error }, 'Failed to track rate limit');
        }
    };

    const trackQuotaExceeded = async (params: {
        quotaType: 'monthly' | 'daily' | 'concurrent';
        resource: string;
        currentUsage: number;
        quota: number;
        tier: string;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = {
                quotaType: params.quotaType,
                resource: params.resource,
                currentUsage: params.currentUsage,
                quota: params.quota,
                usagePercentage: (params.currentUsage / params.quota) * 100,
                tier: params.tier,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.QUOTA_EXCEEDED, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track quota exceeded');
        }
    };

    const trackWebSearchExecution = async (params: {
        query: string;
        searchProvider: string;
        executionTime: number;
        resultCount: number;
        success: boolean;
        errorType?: string;
        cached?: boolean;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData: ToolEventData = {
                toolName: 'web_search',
                searchProvider: params.searchProvider,
                executionTime: params.executionTime,
                // Store query length, not content for privacy
                inputSize: params.query.length,
                outputSize: params.resultCount,
                success: params.success,
                errorType: params.errorType,
                cached: params.cached,
                timestamp: Date.now(),
            };

            if (params.success) {
                await trackEvent(ANALYTICS_EVENTS.WEB_SEARCH_EXECUTED, eventData);
            } else {
                await trackEvent(ANALYTICS_EVENTS.WEB_SEARCH_FAILED, eventData);
            }

            logger.debug({ 
                searchProvider: params.searchProvider,
                executionTime: params.executionTime,
                resultCount: params.resultCount,
                success: params.success
            }, 'Web search execution tracked');
        } catch (error) {
            logger.error({ error }, 'Failed to track web search');
        }
    };

    const trackMathCalculationExecution = async (params: {
        calculationType: string;
        complexity: 'simple' | 'medium' | 'complex';
        executionTime: number;
        success: boolean;
        errorType?: string;
        inputSize?: number;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData: ToolEventData = {
                toolName: 'math_calculator',
                calculationType: params.calculationType,
                complexity: params.complexity,
                executionTime: params.executionTime,
                inputSize: params.inputSize,
                success: params.success,
                errorType: params.errorType,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.MATH_CALCULATION_EXECUTED, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track math calculation');
        }
    };

    const trackChartGeneration = async (params: {
        chartType: string;
        dataPoints: number;
        executionTime: number;
        outputFormat: string;
        success: boolean;
        errorType?: string;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData: ToolEventData = {
                toolName: 'chart_generator',
                chartType: params.chartType,
                executionTime: params.executionTime,
                inputSize: params.dataPoints,
                outputFormat: params.outputFormat,
                success: params.success,
                errorType: params.errorType,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.CHART_GENERATED, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track chart generation');
        }
    };

    const trackServiceUnavailable = async (params: {
        service: string;
        errorCode?: string;
        downtime?: number;
        retryAfter?: number;
    }) => {
        if (!isEnabled) return;

        try {
            const eventData: PerformanceEventData = {
                resourceType: params.service,
                errorCode: params.errorCode,
                duration: params.downtime,
                retryAfter: params.retryAfter,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SERVICE_UNAVAILABLE, eventData);

            logger.error({ 
                service: params.service,
                errorCode: params.errorCode,
                downtime: params.downtime
            }, 'Service unavailable tracked');
        } catch (error) {
            logger.error({ error }, 'Failed to track service unavailable');
        }
    };

    const trackFeatureLimitReached = async (params: {
        featureName: string;
        currentUsage: number;
        limit: number;
        tier: string;
        upgradePrompted?: boolean;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = {
                featureName: params.featureName,
                currentUsage: params.currentUsage,
                limit: params.limit,
                tier: params.tier,
                upgradePrompted: params.upgradePrompted,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.FEATURE_LIMIT_REACHED, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track feature limit reached');
        }
    };

    const trackPremiumFeatureAccess = async (params: {
        featureName: string;
        accessMethod: 'subscription' | 'trial' | 'promotional';
        tier: string;
        featureUsageCount?: number;
    }) => {
        if (!isEnabled || !session) return;

        try {
            const eventData = {
                featureName: params.featureName,
                accessMethod: params.accessMethod,
                tier: params.tier,
                featureUsageCount: params.featureUsageCount,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.PREMIUM_FEATURE_ACCESSED, eventData);
        } catch (error) {
            logger.error({ error }, 'Failed to track premium feature access');
        }
    };

    return {
        trackApiResponseTime,
        trackResponseTimeout,
        trackRateLimitExceeded,
        trackQuotaExceeded,
        trackWebSearchExecution,
        trackMathCalculationExecution,
        trackChartGeneration,
        trackServiceUnavailable,
        trackFeatureLimitReached,
        trackPremiumFeatureAccess,
        createTimer,
        trackPerformance,
        isEnabled,
    };
}
