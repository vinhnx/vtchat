'use client';

import { PlanSlug } from '@repo/shared/types/subscription';
import { useToast } from '@repo/ui';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSubscription } from '../hooks/use-subscription';
import { useGlobalSubscriptionStatus } from '../providers/subscription-provider';

// Extend window interface for order details
declare global {
    interface Window {
        vtChatOrderDetails?: any;
    }
}

export enum CheckoutPackageType {
    VT_PLUS = PlanSlug.VT_PLUS, // Matches PlanSlug.VT_PLUS ('vt_plus')
}

/**
 * This component processes the Creem.io checkout success response
 * It should be added to the success page to handle VT+ subscription activation
 */
export function CreemCheckoutProcessor() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshSubscriptionStatus } = useGlobalSubscriptionStatus();
    const { refetch: refetchSubscription } = useSubscription();
    const { toast } = useToast();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [processed, setProcessed] = useState(false); // Track if we've already processed this checkout

    useEffect(() => {
        // Extract ALL possible checkout parameters from Creem redirect URL
        const checkoutId = searchParams.get('checkout_id');
        const orderId = searchParams.get('order_id');
        const packageType = searchParams.get('package');
        const quantity = parseInt(searchParams.get('quantity') || '1', 10);
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

        console.log('[CreemCheckoutProcessor] Extracted parameters:', {
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
        });

        // Check for valid checkout parameters - be more comprehensive
        if (!checkoutId && !orderId && !customerId && !sessionId && success !== 'true') {
            console.log('[CreemCheckoutProcessor] No valid checkout parameters found, skipping');
            return;
        }

        // If this looks like a Creem success redirect but missing customer_id, log warning
        if ((checkoutId || orderId || success === 'true') && !customerId) {
            console.warn(
                '[CreemCheckoutProcessor] Creem redirect detected but customer_id missing:',
                allParams
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

                console.log('[CreemCheckoutProcessor] Processing checkout success:', {
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
                });

                // Update database with payment success - this is critical as webhook may not fire
                if (customerId) {
                    try {
                        console.log(
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
                            amount: amount ? parseFloat(amount) : undefined,
                            currency: currency || undefined,
                            session_id: sessionId || undefined,
                        };

                        console.log(
                            '[CreemCheckoutProcessor] Sending payment data to API:',
                            paymentData
                        );

                        const response = await fetch('/api/payment-success', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(paymentData),
                        });

                        console.log(
                            '[CreemCheckoutProcessor] API response status:',
                            response.status
                        );

                        if (response.ok) {
                            const result = await response.json();
                            console.log(
                                '[CreemCheckoutProcessor] Database updated successfully:',
                                result
                            );

                            toast({
                                title: 'Account Updated! ✅',
                                description:
                                    'Your payment has been processed and your account has been updated.',
                            });
                        } else {
                            const error = await response.json();
                            console.error(
                                '[CreemCheckoutProcessor] Database update failed:',
                                error
                            );
                            toast({
                                title: 'Account Update Issue',
                                description:
                                    'Your payment was successful, but there was an issue updating your account. Please contact support.',
                                variant: 'destructive',
                            });
                        }
                    } catch (dbError) {
                        console.error('[CreemCheckoutProcessor] Error updating database:', dbError);
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
                    // Process VT+ subscription
                    toast({
                        title: 'Welcome to VT+! 🎉',
                        description:
                            'Your subscription is now active. Enjoy Pro Search, Dark Mode, and Deep Research features!',
                    });

                    console.log('[CreemCheckoutProcessor] VT+ subscription activated');
                } else {
                    // Invalid purchase type for VT+ only system
                    toast({
                        title: 'Invalid Purchase',
                        description: 'Only VT+ subscriptions are supported.',
                        variant: 'destructive',
                    });
                }

                // Refresh subscription status to get updated subscription from database
                console.log(
                    '[CreemCheckoutProcessor] Refreshing subscription status from database...'
                );
                await refreshSubscriptionStatus();
                await refetchSubscription();

                // Don't reload the page as it causes infinite redirect loop
                // The subscription refresh above should be sufficient

                // Log successful purchase for analytics
                console.log('[CreemCheckoutProcessor] Purchase completed successfully:', {
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
                });

                // Redirect to appropriate page after a short delay
                setTimeout(() => {
                    if (isVtPlusSubscription) {
                        // Redirect VT+ subscribers to the main chat page
                        router.push('/chat');
                    } else {
                        // Redirect to main app
                        router.push('/');
                    }
                }, 3000); // 3 second delay to allow user to see success message
            } catch (error) {
                console.error('[CreemCheckoutProcessor] Error processing checkout success:', error);
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
    }, [searchParams, toast, refreshSubscriptionStatus, refetchSubscription]);

    // This component doesn't render anything visible, but we could add order details
    if (orderDetails) {
        // Store order details in a way that the success page can access them
        if (typeof window !== 'undefined') {
            window.vtChatOrderDetails = orderDetails;
        }
    }

    return null;
}
