'use client';

import { useCredits } from '@repo/common/store';
import { CREEM_CREDIT_PACKAGES, CreemService } from '@repo/shared/utils';
import { useToast } from '@repo/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Extend window interface for order details
declare global {
    interface Window {
        vtChatOrderDetails?: any;
    }
}

/**
 * This component processes the Creem.io checkout success response
 * It should be added to the success page to handle credit updates
 */
export function CreemCheckoutProcessor() {
    const searchParams = useSearchParams();
    const { addCredits } = useCredits();
    const { toast } = useToast();
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Extract checkout parameters from URL
        const checkoutId = searchParams.get('checkout_id');
        const orderId = searchParams.get('order_id');
        const packageType = searchParams.get('package');
        const quantity = parseInt(searchParams.get('quantity') || '1', 10);
        const isPlusSubscription = searchParams.get('plan') === 'vt_plus';
        const paymentStatus = searchParams.get('status');

        if (!checkoutId && !orderId && !packageType && !isPlusSubscription) {
            // Success page accessed directly without checkout info
            return;
        }

        const processCheckout = async () => {
            if (processing) return;
            setProcessing(true);

            try {
                console.log('[CreemCheckoutProcessor] Processing checkout success:', {
                    checkoutId,
                    orderId,
                    packageType,
                    quantity,
                    isPlusSubscription,
                    paymentStatus,
                });

                // Set order details for display
                if (checkoutId || orderId) {
                    setOrderDetails({
                        id: checkoutId || orderId,
                        status: paymentStatus || 'completed',
                        timestamp: new Date().toISOString(),
                        type: isPlusSubscription ? 'subscription' : 'credits',
                        package: packageType,
                        quantity,
                    });
                }

                if (isPlusSubscription) {
                    // Process VT+ subscription
                    toast({
                        title: 'Welcome to VT+! 🎉',
                        description:
                            'Your subscription is now active with monthly credits included.',
                    });

                    // Apply initial credits for subscription
                    if (CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION) {
                        const subscriptionCredits = CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION.credits;
                        addCredits(
                            subscriptionCredits,
                            'VT+ Subscription Monthly Credits',
                            'bonus'
                        );

                        console.log(
                            '[CreemCheckoutProcessor] Added VT+ subscription credits:',
                            subscriptionCredits
                        );
                    }
                } else if (packageType) {
                    // Process one-time credit purchase
                    const packageKey = packageType as keyof typeof CREEM_CREDIT_PACKAGES;
                    if (CREEM_CREDIT_PACKAGES[packageKey]) {
                        const purchasedCredits = CreemService.calculateCredits(
                            packageKey,
                            quantity
                        );

                        addCredits(
                            purchasedCredits,
                            `Purchased ${purchasedCredits} credits`,
                            'purchase'
                        );

                        toast({
                            title: 'Credits Added Successfully! ✨',
                            description: `${purchasedCredits.toLocaleString()} credits have been added to your account.`,
                        });

                        console.log(
                            '[CreemCheckoutProcessor] Added purchased credits:',
                            purchasedCredits
                        );
                    }
                }

                // Log successful purchase for analytics
                console.log('[CreemCheckoutProcessor] Purchase completed successfully:', {
                    checkoutId,
                    orderId,
                    packageType,
                    quantity,
                    isPlusSubscription,
                    timestamp: new Date().toISOString(),
                });
            } catch (error) {
                console.error('[CreemCheckoutProcessor] Error processing checkout success:', error);
                toast({
                    title: 'Processing Issue',
                    description:
                        'There was an issue applying your purchase. Your payment was successful - please contact support if credits are not reflected.',
                    variant: 'destructive',
                });
            } finally {
                setProcessing(false);
            }
        };

        processCheckout();
    }, [searchParams, addCredits, toast, processing]);

    // This component doesn't render anything visible, but we could add order details
    if (orderDetails) {
        // Store order details in a way that the success page can access them
        if (typeof window !== 'undefined') {
            window.vtChatOrderDetails = orderDetails;
        }
    }

    return null;
}
