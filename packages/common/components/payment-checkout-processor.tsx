'use client';

import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { useToast } from '@repo/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider';

// Extend window interface for order details
declare global {
    interface Window {
        vtChatOrderDetails?: any;
    }
}

export const CheckoutPackageType = {
    VT_PLUS: PlanSlug.VT_PLUS, // Matches PlanSlug.VT_PLUS ('vt_plus')
} as const;

export type CheckoutPackageType = typeof CheckoutPackageType[keyof typeof CheckoutPackageType];

/**
 * This component processes the Creem.io checkout success response
 * It should be added to the success page to handle VT+ subscription activation
 */
export function CreemCheckoutProcessor() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshSubscriptionStatus } = useGlobalSubscriptionStatus();
    const { toast } = useToast();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [processed, setProcessed] = useState(false); // Track if we've already processed this checkout

    useEffect(() => {
        // Extract ALL possible checkout parameters from Creem redirect URL
        const checkoutId = searchParams.get('checkout_id');
        const orderId = searchParams.get('order_id');
        const packageType = searchParams.get('package');
        const quantity = Number.parseInt(searchParams.get('quantity') || '1', 10);
        const isPlusSubscription = searchParams.get('plan') === PlanSlug.VT_PLUS;
        const paymentStatus = searchParams.get('status') || searchParams.get('payment_status');
        const customerId = searchParams.get('customer_id') || searchParams.get('customerId');
        const productId = searchParams.get('product_id') || searchParams.get('productId');
        const subscriptionId =
            searchParams.get('subscription_id') || searchParams.get('subscriptionId');

        // Additional Creem redirect parameters
        const amount = searchParams.get('amount');
        const currency = searchParams.get('currency');
        const planParam = searchParams.get('plan');
        const sessionId = searchParams.get('session_id');
        const success = searchParams.get('success');

        // Check all parameters to see if we have a valid Creem redirect
        const allParams = Object.fromEntries(searchParams.entries());

        log.info(
            {
                checkoutId,
                orderId,
                packageType,
                quantity,
                isPlusSubscription,
                paymentStatus,
                customerId,
                productId,
                subscriptionId,
                amount,
                currency,
                planParam,
                sessionId,
                success,
                allParams,
            },
            '[CreemCheckoutProcessor] Extracted parameters'
        );

        // Check for valid checkout parameters - be more comprehensive
        if (!(checkoutId || orderId || customerId || sessionId) && success !== 'true') {
            log.info({}, '[CreemCheckoutProcessor] No valid checkout parameters found, skipping');
            return;
        }

        // If this looks like a Creem success redirect but missing customer_id, log warning
        if ((checkoutId || orderId || success === 'true') && !customerId) {
            log.warn(
                { allParams },
                '[CreemCheckoutProcessor] Creem redirect detected but customer_id missing'
            );
        }

        const processCheckout = async () => {
            if (processing || processed) return; // Don't process if already processing or processed
            setProcessing(true);

            try {
                // Detect VT+ subscription based on multiple indicators
                const isVtPlusSubscription =
                    isPlusSubscription || // plan === PlanSlug.VT_PLUS
                    planParam === PlanSlug.VT_PLUS ||
                    subscriptionId !== null ||
                    productId === process.env.CREEM_PRODUCT_ID ||
                    packageType === CheckoutPackageType.VT_PLUS; // package === 'vt_plus'

                log.info(
                    {
                        checkoutId,
                        orderId,
                        packageType,
                        quantity,
                        isPlusSubscription,
                        isVtPlusSubscription,
                        paymentStatus,
                        customerId,
                        productId,
                        subscriptionId,
                        planParam,
                        amount,
                        currency,
                    },
                    '[CreemCheckoutProcessor] Processing checkout success'
                );

                // Update database with payment success - this is critical as webhook may not fire
                if (customerId) {
                    try {
                        log.info(
                            {},
                            '[CreemCheckoutProcessor] Updating database with payment success...'
                        );

                        const paymentData = {
                            customer_id: customerId,
                            order_id: orderId || undefined,
                            checkout_id: checkoutId || undefined,
                            subscription_id: subscriptionId || undefined,
                            product_id: productId || undefined,
                            plan: isVtPlusSubscription ? PlanSlug.VT_PLUS : undefined,
                            package: packageType || undefined,
                            quantity,
                            status: paymentStatus || 'completed',
                            amount: amount ? Number.parseFloat(amount) : undefined,
                            currency: currency || undefined,
                            session_id: sessionId || undefined,
                        };

                        const response = await fetch('/api/payment-success', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(paymentData),
                        });

                        log.info(
                            { status: response.status },
                            '[CreemCheckoutProcessor] API response status'
                        );

                        if (response.ok) {
                            const result = await response.json();
                            log.info(
                                { result },
                                '[CreemCheckoutProcessor] Database updated successfully'
                            );

                            // Invalidate subscription cache to ensure fresh data
                            try {
                                log.info(
                                    {},
                                    '[CreemCheckoutProcessor] Invalidating subscription cache...'
                                );
                                const cacheResponse = await fetch(
                                    '/api/subscription/invalidate-cache',
                                    {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    }
                                );

                                if (cacheResponse.ok) {
                                    log.info(
                                        {},
                                        '[CreemCheckoutProcessor] Subscription cache invalidated successfully'
                                    );
                                } else {
                                    log.warn(
                                        {},
                                        '[CreemCheckoutProcessor] Failed to invalidate subscription cache'
                                    );
                                }
                            } catch (cacheError) {
                                log.error(
                                    { cacheError },
                                    '[CreemCheckoutProcessor] Error invalidating cache'
                                );
                            }

                            toast({
                                title: 'Payment Successful!',
                                description:
                                    'Your payment has been processed successfully. Activating your subscription...',
                            });
                        } else {
                            const error = await response.json();
                            log.error({ error }, '[CreemCheckoutProcessor] Database update failed');
                            toast({
                                title: 'Account Update Issue',
                                description:
                                    'Your payment was successful, but there was an issue updating your account. Please contact support.',
                                variant: 'destructive',
                            });
                        }
                    } catch (dbError) {
                        log.error({ dbError }, '[CreemCheckoutProcessor] Error updating database');
                        toast({
                            title: 'Database Update Issue',
                            description:
                                'Your payment was successful, but there was an issue updating your account. Please contact support.',
                            variant: 'destructive',
                        });
                    }
                }

                // Set order details for display
                if (checkoutId || orderId || customerId) {
                    setOrderDetails({
                        id: checkoutId || orderId || customerId,
                        status: paymentStatus || 'completed',
                        timestamp: new Date().toISOString(),
                        type: isVtPlusSubscription ? 'subscription' : 'purchase',
                        package: packageType,
                        quantity,
                        customerId,
                        productId,
                        subscriptionId,
                    });
                }

                if (isVtPlusSubscription) {
                    log.info({}, '[CreemCheckoutProcessor] VT+ subscription activated');
                } else {
                    // Invalid purchase type for VT+ only system
                    toast({
                        title: 'Invalid Purchase',
                        description: 'Only VT+ subscriptions are supported.',
                        variant: 'destructive',
                    });
                }

                // Skip subscription refresh since we'll do a full page reload
                // This prevents double refresh and ensures clean state

                // Log successful purchase for analytics
                log.info(
                    {
                        checkoutId,
                        orderId,
                        packageType,
                        quantity,
                        isPlusSubscription,
                        isVtPlusSubscription,
                        customerId,
                        productId,
                        subscriptionId,
                        timestamp: new Date().toISOString(),
                    },
                    '[CreemCheckoutProcessor] Purchase completed successfully'
                );

                // Show welcome toast and redirect after delay
                setTimeout(() => {
                    if (isVtPlusSubscription) {
                        // Show welcome toast right before redirect
                        toast({
                            title: 'Welcome to VT+!',
                            description: 'Redirecting to chat to enjoy your new features...',
                        });

                        // Redirect after showing welcome toast
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 1500); // Short delay to show welcome message
                    } else {
                        // Force full page reload to ensure all state is fresh
                        window.location.href = '/';
                    }
                }, 2000); // 2 second delay after payment success message
            } catch (error) {
                log.error({ error }, '[CreemCheckoutProcessor] Error processing checkout success');
                toast({
                    title: 'Processing Issue',
                    description:
                        'There was an issue applying your purchase. Your payment was successful - please contact support if your subscription is not reflected.',
                    variant: 'destructive',
                });
            } finally {
                setProcessing(false);
                setProcessed(true); // Mark as processed to prevent re-processing
            }
        };

        processCheckout();
    }, [searchParams, toast, refreshSubscriptionStatus, processing, processed, router]);

    // This component doesn't render anything visible, but we could add order details
    if (orderDetails) {
        // Store order details in a way that the success page can access them
        if (typeof window !== 'undefined') {
            window.vtChatOrderDetails = orderDetails;
        }
    }

    return null;
}
