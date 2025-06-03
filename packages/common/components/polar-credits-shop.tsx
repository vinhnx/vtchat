'use client';

/**
 * Polar Credits Purchase Component
 *
 * Allows users to purchase credits using Polar.sh
 * Integrates with existing chat credit system
 */

import { useSubscriptionAccess } from '@repo/common/hooks/use-subscription-access';
import { useCreditPurchasing, useCredits } from '@repo/common/store';
import { POLAR_CREDIT_PACKAGES, PolarService } from '@repo/shared/utils/polar';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    useToast,
} from '@repo/ui';
import { CheckIcon, StarIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CreditPackageCardProps {
    packageData: ReturnType<typeof PolarService.getCreditPackages>[0];
    onPurchase: (packageId: keyof typeof POLAR_CREDIT_PACKAGES) => void;
    isLoading?: boolean;
}

function CreditPackageCard({ packageData, onPurchase, isLoading }: CreditPackageCardProps) {
    const costPerCredit = (packageData.price / packageData.credits).toFixed(3);
    const isPopular = 'popular' in packageData && packageData.popular;

    return (
        <Card className={`relative ${isPopular ? 'border-blue-500 shadow-lg' : ''}`}>
            {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                    <Badge className="bg-blue-500 text-white">
                        <StarIcon className="mr-1 h-3 w-3" />
                        Most Popular
                    </Badge>
                </div>
            )}

            <CardHeader className="text-center">
                <CardTitle className="text-lg">{packageData.name}</CardTitle>
                <CardDescription>{packageData.description}</CardDescription>

                <div className="space-y-2">
                    <div className="text-3xl font-bold">${packageData.price}</div>
                    <div className="text-muted-foreground text-sm">
                        {packageData.credits.toLocaleString()} credits
                    </div>
                    <div className="text-muted-foreground text-xs">${costPerCredit} per credit</div>
                </div>
            </CardHeader>

            <CardContent>
                <Button
                    onClick={() => onPurchase(packageData.packageKey)}
                    disabled={isLoading}
                    className="w-full"
                    variant={isPopular ? 'default' : 'outlined'}
                >
                    {isLoading ? 'Processing...' : `Purchase ${packageData.credits} Credits`}
                </Button>

                <div className="mt-4 space-y-2">
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        Instant credit delivery
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        No expiration date
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        Secure payment via Polar.sh
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface SubscriptionPlanCardProps {
    planData: ReturnType<typeof PolarService.getSubscriptionPlans>[0];
    onSubscribe: () => void;
    isLoading?: boolean;
}

function SubscriptionPlanCard({ planData, onSubscribe, isLoading }: SubscriptionPlanCardProps) {
    // Extract interval property if it exists
    const interval = 'interval' in planData ? planData.interval : 'month';

    return (
        <Card className="border-purple-500 shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-xl text-purple-600">{planData.name}</CardTitle>
                <CardDescription>{planData.description}</CardDescription>

                <div className="space-y-2">
                    <div className="text-3xl font-bold">${planData.price}</div>
                    <div className="text-muted-foreground text-sm">per {interval}</div>
                    <div className="text-sm font-medium text-purple-600">
                        + {planData.credits.toLocaleString()} monthly credits
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Button
                    onClick={onSubscribe}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                >
                    {isLoading ? 'Processing...' : 'Subscribe to VT+'}
                </Button>

                <div className="mt-4 space-y-2">
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        All VT+ features included
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        {planData.credits.toLocaleString()} credits every month
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        Advanced chat modes & features
                    </div>
                    <div className="text-muted-foreground flex items-center text-sm">
                        <CheckIcon className="mr-2 h-4 w-4 text-green-500" />
                        Cancel anytime
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function PolarCreditsShop() {
    const { balance } = useCredits();
    const { purchasePackage, isLoading, getCreditPackages, getSubscriptionPlans } =
        useCreditPurchasing();
    const { isVtPlus } = useSubscriptionAccess();
    const router = useRouter();
    const { toast } = useToast();

    const [purchasingPackage, setPurchasingPackage] = useState<string | null>(null);

    const handlePurchase = async (packageId: keyof typeof POLAR_CREDIT_PACKAGES) => {
        try {
            setPurchasingPackage(packageId);
            // Map the package ID from the credit package to the POLAR_CREDIT_PACKAGES key
            // This is needed because the package IDs returned by getCreditPackages()
            // are different from the keys in POLAR_CREDIT_PACKAGES
            await purchasePackage(packageId);
        } catch (error) {
            console.error('Purchase failed:', error);

            // Handle authentication errors
            if (
                error instanceof Error &&
                (error.message.includes('Authentication required') ||
                    error.message.includes('Please sign in'))
            ) {
                toast({
                    title: 'Please sign in to purchase credits',
                    description: 'You need to be logged in to make a purchase.',
                    variant: 'destructive',
                });
                // Redirect to sign-in page
                setTimeout(() => {
                    router.push('/sign-in?redirect_url=' + encodeURIComponent('/plus'));
                }, 2000);
            } else if (
                error instanceof Error &&
                (error.message.includes('Payment system configuration error') ||
                    error.message.includes('Subscription service temporarily unavailable'))
            ) {
                // Handle Polar API token errors specifically
                toast({
                    title: 'Service Temporarily Unavailable',
                    description:
                        'The payment service is temporarily unavailable. Please try again later or contact support if the issue persists.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Purchase failed',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'An unexpected error occurred. Please try again.',
                    variant: 'destructive',
                });
            }
        } finally {
            setPurchasingPackage(null);
        }
    };

    const handleSubscribe = async () => {
        try {
            setPurchasingPackage('PLUS_SUBSCRIPTION');
            const checkout = await PolarService.subscribeToVtPlus();
            if (checkout.url) {
                window.location.href = checkout.url;
            }
        } catch (error) {
            console.error('Subscription failed:', error);

            // Handle authentication errors specifically
            if (
                error instanceof Error &&
                (error.message.includes('Authentication required') ||
                    error.message.includes('Please sign in'))
            ) {
                toast({
                    title: 'Please sign in to subscribe',
                    description: 'You need to be logged in to subscribe to VT+.',
                    variant: 'destructive',
                });
                // Redirect to sign-in page
                setTimeout(() => {
                    router.push('/sign-in?redirect_url=' + encodeURIComponent('/plus'));
                }, 2000);
            } else if (
                error instanceof Error &&
                (error.message.includes('Payment system configuration error') ||
                    error.message.includes('Subscription service temporarily unavailable'))
            ) {
                // Handle Polar API token errors specifically
                toast({
                    title: 'Service Temporarily Unavailable',
                    description:
                        'The subscription service is temporarily unavailable. Please try again later or contact support if the issue persists.',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Subscription failed',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to start subscription process. Please try again.',
                    variant: 'destructive',
                });
            }
        } finally {
            setPurchasingPackage(null);
        }
    };

    const creditPackages = getCreditPackages();
    const subscriptionPlans = getSubscriptionPlans();

    return (
        <div className="space-y-8">
            {/* Current Balance */}
            <div className="text-center">
                <h2 className="mb-2 text-2xl font-bold">Your Credit Balance</h2>
                <div className="text-4xl font-bold text-blue-600">
                    {balance.toLocaleString()} credits
                </div>
                <p className="text-muted-foreground mt-2">
                    Credits are used for advanced chat modes and features
                </p>
            </div>

            {/* Subscription Plan (if not already VT+) */}
            {!isVtPlus && subscriptionPlans.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-center text-xl font-semibold">Subscription Plan</h3>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                            {subscriptionPlans.map(plan => (
                                <SubscriptionPlanCard
                                    key={plan.id}
                                    planData={plan}
                                    onSubscribe={handleSubscribe}
                                    isLoading={
                                        isLoading || purchasingPackage === 'PLUS_SUBSCRIPTION'
                                    }
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Credit Packages */}
            <div className="space-y-4">
                <h3 className="text-center text-xl font-semibold">
                    {isVtPlus ? 'Additional Credits' : 'Credit Packages'}
                </h3>
                <p className="text-muted-foreground text-center">
                    Purchase credits for pay-per-use access to premium features
                </p>

                <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                    {creditPackages.map(package_ => (
                        <CreditPackageCard
                            key={package_.packageKey}
                            packageData={package_}
                            onPurchase={handlePurchase}
                            isLoading={isLoading || purchasingPackage === package_.packageKey}
                        />
                    ))}
                </div>
            </div>

            {/* Usage Info */}
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">How Credits Work</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                            <div>
                                <h4 className="mb-2 font-medium">Credit Costs:</h4>
                                <ul className="text-muted-foreground space-y-1">
                                    <li>• GPT-4o Mini: 1 credit</li>
                                    <li>• GPT-4o: 3 credits</li>
                                    <li>• Claude Sonnet: 5 credits</li>
                                    <li>• Claude Opus: 8 credits</li>
                                    <li>• Deep Research: 10 credits</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="mb-2 font-medium">Benefits:</h4>
                                <ul className="text-muted-foreground space-y-1">
                                    <li>• No monthly commitments</li>
                                    <li>• Credits never expire</li>
                                    <li>• Use across all chat modes</li>
                                    <li>• Better value with larger packages</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PolarCreditsShop;
