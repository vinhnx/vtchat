import { vemetricBackend } from '@repo/common/services/vemetric-backend';
import { ANALYTICS_EVENTS } from '@repo/shared/types/analytics';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';

/**
 * Vemetric integrations for critical user actions
 * These functions should be called from API routes and server actions
 * to ensure reliable tracking of important business events
 */

/**
 * Track successful payment completion
 * Call this from payment webhook handlers
 */
export async function trackPaymentSuccess(
    userId: string,
    paymentData: {
        amount: number;
        currency: string;
        subscriptionTier: PlanSlug;
        paymentMethod: string;
        subscriptionId: string;
        processingTime?: number;
    }
) {
    try {
        await vemetricBackend.trackPaymentEvent(
            userId,
            'completed',
            {
                amount: paymentData.amount,
                currency: paymentData.currency,
                tier: paymentData.subscriptionTier,
                paymentMethod: paymentData.paymentMethod,
                subscriptionId: paymentData.subscriptionId,
                processingTime: paymentData.processingTime,
            }
        );

        log.info({ 
            userId, 
            tier: paymentData.subscriptionTier,
            amount: paymentData.amount 
        }, 'Payment success tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track payment success');
    }
}

/**
 * Track payment failure
 * Call this from payment webhook handlers
 */
export async function trackPaymentFailure(
    userId: string,
    errorData: {
        errorCode: string;
        paymentMethod: string;
        amount?: number;
        currency?: string;
        subscriptionTier?: PlanSlug;
    }
) {
    try {
        await vemetricBackend.trackPaymentEvent(
            userId,
            'failed',
            {
                errorCode: errorData.errorCode,
                paymentMethod: errorData.paymentMethod,
                amount: errorData.amount,
                currency: errorData.currency || 'USD',
                tier: errorData.subscriptionTier,
            }
        );

        log.info({ userId, errorCode: errorData.errorCode }, 'Payment failure tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track payment failure');
    }
}

/**
 * Track user registration
 * Call this from auth callback handlers
 */
export async function trackUserRegistration(
    userId: string,
    registrationData: {
        provider: string;
        email?: string;
        referralSource?: string;
    }
) {
    try {
        await vemetricBackend.trackUserRegistration(
            userId,
            {
                authMethod: registrationData.provider,
                referralSource: registrationData.referralSource,
                subscriptionTier: 'VT_BASE',
            }
        );

        log.info({ userId, provider: registrationData.provider }, 'User registration tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track user registration');
    }
}

/**
 * Track subscription creation
 * Call this when a new subscription is created
 */
export async function trackSubscriptionCreated(
    userId: string,
    subscriptionData: {
        tier: PlanSlug;
        plan: string;
        price: number;
        currency: string;
    }
) {
    try {
        await vemetricBackend.trackSubscriptionEvent(
            userId,
            'created',
            subscriptionData
        );

        log.info({ userId, tier: subscriptionData.tier }, 'Subscription creation tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track subscription creation');
    }
}

/**
 * Track subscription cancellation
 * Call this when a subscription is cancelled
 */
export async function trackSubscriptionCancelled(
    userId: string,
    subscriptionData: {
        tier: PlanSlug;
        plan: string;
        reason?: string;
    }
) {
    try {
        await vemetricBackend.trackSubscriptionEvent(
            userId,
            'cancelled',
            {
                tier: subscriptionData.tier,
                plan: subscriptionData.plan,
            }
        );

        log.info({ userId, tier: subscriptionData.tier }, 'Subscription cancellation tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track subscription cancellation');
    }
}

/**
 * Track API usage for premium features
 * Call this from API routes that use premium features
 */
export async function trackPremiumFeatureUsage(
    userId: string,
    featureData: {
        featureName: string;
        context: string;
        inputSize?: number;
        outputSize?: number;
        processingTime?: number;
    }
) {
    try {
        await vemetricBackend.trackCriticalFeatureUsage(
            userId,
            featureData.featureName,
            featureData.context,
            {
                inputSize: featureData.inputSize,
                outputSize: featureData.outputSize,
                processingTime: featureData.processingTime,
                timestamp: Date.now(),
            }
        );

        log.debug({ 
            userId, 
            feature: featureData.featureName,
            context: featureData.context 
        }, 'Premium feature usage tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track premium feature usage');
    }
}

/**
 * Track critical API errors
 * Call this from API error handlers
 */
export async function trackCriticalAPIError(
    userId: string,
    errorData: {
        endpoint: string;
        errorCode: string;
        errorMessage?: string;
        statusCode?: number;
    }
) {
    try {
        await vemetricBackend.trackAPIError(
            userId,
            errorData.endpoint,
            errorData.errorCode,
            errorData.errorMessage
        );

        log.warn({ 
            userId, 
            endpoint: errorData.endpoint,
            errorCode: errorData.errorCode 
        }, 'Critical API error tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track critical API error');
    }
}

/**
 * Track user onboarding completion
 * Call this when user completes onboarding steps
 */
export async function trackOnboardingCompletion(
    userId: string,
    onboardingData: {
        step: string;
        completedSteps: number;
        totalSteps: number;
        timeToComplete?: number;
    }
) {
    try {
        await vemetricBackend.trackEvent(
            userId,
            ANALYTICS_EVENTS.ONBOARDING_COMPLETED,
            {
                step: onboardingData.step,
                completedSteps: onboardingData.completedSteps,
                totalSteps: onboardingData.totalSteps,
                timeToComplete: onboardingData.timeToComplete,
                completionRate: onboardingData.completedSteps / onboardingData.totalSteps,
            }
        );

        log.info({ 
            userId, 
            step: onboardingData.step,
            completionRate: onboardingData.completedSteps / onboardingData.totalSteps 
        }, 'Onboarding completion tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track onboarding completion');
    }
}

/**
 * Track first message sent (important conversion metric)
 * Call this when user sends their first message
 */
export async function trackFirstMessage(
    userId: string,
    messageData: {
        modelName: string;
        messageLength: number;
        hasAttachments: boolean;
        timeToFirstMessage?: number;
    }
) {
    try {
        await vemetricBackend.trackEvent(
            userId,
            ANALYTICS_EVENTS.FIRST_MESSAGE_SENT,
            {
                modelName: messageData.modelName,
                messageLength: messageData.messageLength,
                hasAttachments: messageData.hasAttachments,
                timeToFirstMessage: messageData.timeToFirstMessage,
            }
        );

        log.info({ 
            userId, 
            modelName: messageData.modelName,
            messageLength: messageData.messageLength 
        }, 'First message tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track first message');
    }
}

/**
 * Track feature gate encounters
 * Call this when user hits a premium feature gate
 */
export async function trackFeatureGateEncounter(
    userId: string,
    gateData: {
        featureName: string;
        userTier: PlanSlug;
        context: string;
        actionTaken?: 'upgraded' | 'cancelled' | 'ignored';
    }
) {
    try {
        await vemetricBackend.trackEvent(
            userId,
            ANALYTICS_EVENTS.FEATURE_GATE_ENCOUNTERED,
            {
                featureName: gateData.featureName,
                userTier: gateData.userTier,
                context: gateData.context,
                actionTaken: gateData.actionTaken,
            }
        );

        log.info({ 
            userId, 
            feature: gateData.featureName,
            tier: gateData.userTier,
            action: gateData.actionTaken 
        }, 'Feature gate encounter tracked');
    } catch (error) {
        log.error({ error, userId }, 'Failed to track feature gate encounter');
    }
}
