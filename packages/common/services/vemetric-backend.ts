import { Vemetric } from '@vemetric/node';
import { log } from '@repo/shared/logger';
import {
    ANALYTICS_EVENTS,
    type VemetricEventData,
    type PaymentEventData,
    type SubscriptionEventData,
    type UserProperties,
} from '@repo/shared/types/analytics';
import { AnalyticsUtils } from '../utils/analytics';

/**
 * Backend Vemetric Analytics Service
 * Handles server-side event tracking for critical user actions
 */
class VemetricBackendService {
    private client: Vemetric | null = null;
    private isEnabled = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            const token = process.env.VEMETRIC_TOKEN || process.env.NEXT_PUBLIC_VEMETRIC_TOKEN;
            
            if (!token) {
                log.debug('Vemetric token not found, backend tracking disabled');
                return;
            }

            this.client = new Vemetric({
                token,
                host: process.env.VEMETRIC_HOST,
            });

            this.isEnabled = true;
            log.info('Vemetric backend service initialized');
        } catch (error) {
            log.error({ error }, 'Failed to initialize Vemetric backend service');
        }
    }

    /**
     * Track custom event for identified user
     */
    async trackEvent(
        userIdentifier: string,
        eventName: string,
        eventData?: VemetricEventData,
        userData?: Partial<UserProperties>
    ): Promise<void> {
        if (!this.isEnabled || !this.client) {
            log.debug('Vemetric backend tracking disabled');
            return;
        }

        try {
            const sanitizedEventData = eventData ? AnalyticsUtils.sanitizeData(eventData) : undefined;
            const sanitizedUserData = userData ? AnalyticsUtils.createUserProperties(userData) : undefined;

            await this.client.trackEvent(eventName, {
                userIdentifier,
                eventData: sanitizedEventData,
                userData: sanitizedUserData ? {
                    set: sanitizedUserData,
                } : undefined,
            });

            log.debug({ 
                eventName, 
                userId: userIdentifier,
                eventDataKeys: sanitizedEventData ? Object.keys(sanitizedEventData) : [],
            }, 'Backend event tracked');
        } catch (error) {
            log.error({ 
                error, 
                eventName, 
                userId: userIdentifier 
            }, 'Failed to track backend event');
        }
    }

    /**
     * Update user properties
     */
    async updateUser(
        userIdentifier: string, 
        userData: Partial<UserProperties>
    ): Promise<void> {
        if (!this.isEnabled || !this.client) return;

        try {
            const sanitizedUserData = AnalyticsUtils.createUserProperties(userData);

            await this.client.updateUser({
                userIdentifier,
                userData: {
                    set: sanitizedUserData,
                },
            });

            log.debug({ 
                userId: userIdentifier,
                userDataKeys: Object.keys(sanitizedUserData),
            }, 'User properties updated on backend');
        } catch (error) {
            log.error({ 
                error, 
                userId: userIdentifier 
            }, 'Failed to update user properties on backend');
        }
    }

    /**
     * Track payment events (critical for revenue tracking)
     */
    async trackPaymentEvent(
        userIdentifier: string,
        eventType: 'initiated' | 'completed' | 'failed',
        paymentData: PaymentEventData
    ): Promise<void> {
        const eventMap = {
            initiated: ANALYTICS_EVENTS.PAYMENT_INITIATED,
            completed: ANALYTICS_EVENTS.PLAN_UPGRADE_COMPLETED,
            failed: ANALYTICS_EVENTS.PAYMENT_PROCESSING_ERROR,
        };

        await this.trackEvent(
            userIdentifier,
            eventMap[eventType],
            {
                paymentMethod: paymentData.paymentMethod,
                amount: paymentData.amount,
                currency: paymentData.currency || 'USD',
                tier: paymentData.tier,
                processingTime: paymentData.processingTime,
                errorCode: paymentData.errorCode,
            },
            {
                subscriptionTier: paymentData.tier as any,
            }
        );
    }

    /**
     * Track subscription events
     */
    async trackSubscriptionEvent(
        userIdentifier: string,
        eventType: 'created' | 'cancelled' | 'renewed' | 'upgraded',
        subscriptionData: SubscriptionEventData
    ): Promise<void> {
        const eventMap = {
            created: ANALYTICS_EVENTS.SUBSCRIPTION_CREATED,
            cancelled: ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
            renewed: ANALYTICS_EVENTS.SUBSCRIPTION_RENEWED,
            upgraded: ANALYTICS_EVENTS.PLAN_UPGRADE_COMPLETED,
        };

        await this.trackEvent(
            userIdentifier,
            eventMap[eventType],
            {
                tier: subscriptionData.tier,
                plan: subscriptionData.plan,
                price: subscriptionData.price,
                currency: subscriptionData.currency || 'USD',
            },
            {
                subscriptionTier: subscriptionData.tier,
            }
        );
    }

    /**
     * Track user registration (reliable backend tracking)
     */
    async trackUserRegistration(
        userIdentifier: string,
        registrationData: {
            authMethod: string;
            referralSource?: string;
            subscriptionTier?: string;
        }
    ): Promise<void> {
        await this.trackEvent(
            userIdentifier,
            ANALYTICS_EVENTS.USER_REGISTERED,
            {
                authMethod: registrationData.authMethod,
                referralSource: registrationData.referralSource,
                registrationTimestamp: Date.now(),
            },
            {
                subscriptionTier: registrationData.subscriptionTier as any || 'VT_BASE',
                accountAge: 0,
                messageCount: 0,
                referralSource: registrationData.referralSource,
            }
        );
    }

    /**
     * Track critical feature usage on backend
     */
    async trackCriticalFeatureUsage(
        userIdentifier: string,
        featureName: string,
        context?: string,
        metadata?: Record<string, any>
    ): Promise<void> {
        await this.trackEvent(
            userIdentifier,
            ANALYTICS_EVENTS.PREMIUM_FEATURE_ACCESSED,
            {
                featureName,
                context,
                timestamp: Date.now(),
                ...metadata,
            }
        );
    }

    /**
     * Track API errors and issues
     */
    async trackAPIError(
        userIdentifier: string,
        endpoint: string,
        errorCode: string,
        errorMessage?: string
    ): Promise<void> {
        await this.trackEvent(
            userIdentifier,
            ANALYTICS_EVENTS.API_ERROR,
            {
                endpoint: AnalyticsUtils.sanitizeUrl(endpoint),
                errorCode,
                errorMessage: errorMessage?.substring(0, 100), // Truncate for privacy
                timestamp: Date.now(),
            }
        );
    }

    /**
     * Batch track multiple events
     */
    async trackBatchEvents(
        userIdentifier: string,
        events: Array<{
            eventName: string;
            eventData?: VemetricEventData;
        }>
    ): Promise<void> {
        if (!this.isEnabled) return;

        // Process events sequentially to avoid rate limiting
        for (const event of events) {
            await this.trackEvent(userIdentifier, event.eventName, event.eventData);
            // Small delay to prevent overwhelming the API
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }

    /**
     * Check if backend tracking is enabled
     */
    get enabled(): boolean {
        return this.isEnabled;
    }
}

// Export singleton instance
export const vemetricBackend = new VemetricBackendService();

// Export convenience functions
export const trackBackendEvent = vemetricBackend.trackEvent.bind(vemetricBackend);
export const trackPaymentEvent = vemetricBackend.trackPaymentEvent.bind(vemetricBackend);
export const trackSubscriptionEvent = vemetricBackend.trackSubscriptionEvent.bind(vemetricBackend);
export const trackUserRegistration = vemetricBackend.trackUserRegistration.bind(vemetricBackend);
export const trackCriticalFeatureUsage = vemetricBackend.trackCriticalFeatureUsage.bind(vemetricBackend);
export const trackAPIError = vemetricBackend.trackAPIError.bind(vemetricBackend);
