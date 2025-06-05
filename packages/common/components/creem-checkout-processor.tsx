'use client';

import { useCredits } from '@repo/common/store';
import { CREEM_CREDIT_PACKAGES, CreemService } from '@repo/shared/utils';
import { useToast } from '@repo/ui';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This component processes the Creem.io checkout success response
 * It should be added to the success page to handle credit updates
 */
export function CreemCheckoutProcessor() {
    const searchParams = useSearchParams();
    const { addCredits } = useCredits();
    const { toast } = useToast();

    useEffect(() => {
        // Extract checkout parameters from URL
        const checkoutId = searchParams.get('checkout_id');
        const packageType = searchParams.get('package');
        const quantity = parseInt(searchParams.get('quantity') || '1', 10);
        const isPlusSubscription = searchParams.get('plan') === 'vt_plus';

        if (!checkoutId && !packageType && !isPlusSubscription) {
            // Success page accessed directly without checkout info
            return;
        }

        const processCheckout = async () => {
            try {
                if (isPlusSubscription) {
                    // Process VT+ subscription
                    toast({
                        title: 'Subscription Activated',
                        description: 'Your VT+ subscription and monthly credits are now active.',
                    });

                    // Apply initial credits for subscription
                    if (CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION) {
                        const subscriptionCredits = CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION.credits;
                        addCredits(
                            subscriptionCredits,
                            'VT+ Subscription Monthly Credits',
                            'bonus'
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
                            title: 'Credits Added',
                            description: `${purchasedCredits.toLocaleString()} credits have been added to your account.`,
                        });
                    }
                }

                // Log successful purchase for analytics
                console.log('Purchase completed successfully:', {
                    checkoutId,
                    packageType,
                    quantity,
                    isPlusSubscription,
                });
            } catch (error) {
                console.error('Error processing checkout success:', error);
                toast({
                    title: 'Processing Issue',
                    description:
                        'There was an issue applying your purchase. Please contact support if credits are not reflected.',
                    variant: 'destructive',
                });
            }
        };

        processCheckout();
    }, [searchParams, addCredits, toast]);

    // This component doesn't render anything visible
    return null;
}
