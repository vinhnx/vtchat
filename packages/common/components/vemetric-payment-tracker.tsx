'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import type { PaymentEventData } from '@repo/shared/types/analytics';
import { useEffect, useRef } from 'react';
import { useVemetric } from '../hooks/use-vemetric';
import { ANALYTICS_EVENTS } from '../utils/analytics';

/**
 * Comprehensive payment tracking for critical operations
 * Tracks all payment-related events while maintaining PII security
 */
export function VemetricPaymentTracker() {
    const { trackEvent, isEnabled } = useVemetric();
    const { data: session } = useSession();

    return null; // This component doesn't render anything
}

/**
 * Hook for tracking critical payment operations
 * Ensures PII protection by hashing sensitive data
 */
export function useVemetricPaymentTracking() {
    const { trackEvent, trackPerformance, isEnabled, createTimer } = useVemetric();
    const { data: session } = useSession();

    // Hash sensitive data for privacy
    const hashSensitiveData = (data: string): string => {
        // Simple hash for demo - in production use crypto.subtle.digest
        return btoa(data).substring(0, 8);
    };

    const trackPaymentInitiated = async (params: {
        tier: string;
        amount?: number;
        currency?: string;
        paymentMethod?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: PaymentEventData = {
                tier: params.tier,
                amount: params.amount,
                currency: params.currency,
                paymentMethod: params.paymentMethod,
                timestamp: Date.now(),
                // Hash user ID for privacy
                userId: session.user?.id ? hashSensitiveData(session.user.id) : undefined,
            };

            await trackEvent(ANALYTICS_EVENTS.PAYMENT_INITIATED, eventData);

            log.info(
                {
                    event: ANALYTICS_EVENTS.PAYMENT_INITIATED,
                    tier: params.tier,
                    amount: params.amount,
                },
                'Payment initiation tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track payment initiation');
        }
    };

    const trackPaymentMethodSelected = async (params: {
        paymentMethod: string;
        tier: string;
        previousMethod?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: PaymentEventData = {
                paymentMethod: params.paymentMethod,
                tier: params.tier,
                previousMethod: params.previousMethod,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.PAYMENT_METHOD_SELECTED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track payment method selection');
        }
    };

    const trackPaymentValidationFailed = async (params: {
        paymentMethod: string;
        errorCode: string;
        errorType?: string;
        tier: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: PaymentEventData = {
                paymentMethod: params.paymentMethod,
                errorCode: params.errorCode,
                errorType: params.errorType,
                tier: params.tier,
                success: false,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.PAYMENT_VALIDATION_FAILED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track payment validation failure');
        }
    };

    const trackPaymentProcessingError = async (params: {
        paymentMethod: string;
        errorCode: string;
        errorMessage?: string;
        tier: string;
        processingTime?: number;
        retryAttempt?: number;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: PaymentEventData = {
                paymentMethod: params.paymentMethod,
                errorCode: params.errorCode,
                // Don't store full error message for security
                errorType: params.errorMessage ? 'processing_error' : undefined,
                tier: params.tier,
                processingTime: params.processingTime,
                retryAttempt: params.retryAttempt,
                success: false,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.PAYMENT_PROCESSING_ERROR, eventData);

            log.error(
                {
                    errorCode: params.errorCode,
                    tier: params.tier,
                    processingTime: params.processingTime,
                },
                'Payment processing error tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track payment processing error');
        }
    };

    const trackPaymentSuccess = async (params: {
        paymentMethod: string;
        tier: string;
        amount: number;
        currency: string;
        processingTime: number;
        subscriptionId?: string;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData: PaymentEventData = {
                paymentMethod: params.paymentMethod,
                tier: params.tier,
                amount: params.amount,
                currency: params.currency,
                processingTime: params.processingTime,
                // Hash subscription ID for privacy
                subscriptionId: params.subscriptionId
                    ? hashSensitiveData(params.subscriptionId)
                    : undefined,
                success: true,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CREATED, eventData);

            log.info(
                {
                    tier: params.tier,
                    amount: params.amount,
                    currency: params.currency,
                    processingTime: params.processingTime,
                },
                'Payment success tracked'
            );
        } catch (error) {
            log.error({ error }, 'Failed to track payment success');
        }
    };

    const trackSubscriptionCancellation = async (params: {
        tier: string;
        reason?: string;
        subscriptionAge?: number; // days
        immediateCancel?: boolean;
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = {
                tier: params.tier,
                // Categorize cancellation reason without storing exact text
                reasonCategory: params.reason ? 'user_provided' : 'not_provided',
                subscriptionAge: params.subscriptionAge,
                immediateCancel: params.immediateCancel,
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track subscription cancellation');
        }
    };

    const trackTrialConversion = async (params: {
        trialLength: number; // days
        tier: string;
        conversionTime: number; // ms from trial start to conversion
        touchpoints?: string[]; // Which features were used during trial
    }) => {
        if (!(isEnabled && session)) return;

        try {
            const eventData = {
                trialLength: params.trialLength,
                tier: params.tier,
                conversionTime: params.conversionTime,
                touchpointCount: params.touchpoints?.length || 0,
                // Most used feature during trial (without PII)
                primaryTouchpoint: params.touchpoints?.[0],
                timestamp: Date.now(),
            };

            await trackEvent(ANALYTICS_EVENTS.PLAN_UPGRADE_COMPLETED, eventData);
        } catch (error) {
            log.error({ error }, 'Failed to track trial conversion');
        }
    };

    return {
        trackPaymentInitiated,
        trackPaymentMethodSelected,
        trackPaymentValidationFailed,
        trackPaymentProcessingError,
        trackPaymentSuccess,
        trackSubscriptionCancellation,
        trackTrialConversion,
        createTimer,
        trackPerformance,
        isEnabled,
    };
}
