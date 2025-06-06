'use client';

import { Button } from '@repo/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';
import { CreditCard, Loader2, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface User {
    id: string;
    email?: string | null;
    credits?: number | null;
    planSlug?: string | null;
}

interface CreditsDisplayProps {
    user?: User | null;
    showUpgradeButton?: boolean;
    className?: string;
}

export function CreditsDisplay({
    user,
    showUpgradeButton = true,
    className = '',
}: CreditsDisplayProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [credits, setCredits] = useState(user?.credits || 0);

    useEffect(() => {
        if (user?.credits !== undefined) {
            setCredits(user.credits);
        }
    }, [user?.credits]);

    const handleUpgrade = async () => {
        setIsLoading(true);
        try {
            // Open customer portal
            const response = await fetch('/api/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const { url } = await response.json();
                if (url) {
                    window.open(url, '_blank');
                } else {
                    // Fallback to credits page
                    window.location.href = '/credits';
                }
            } else {
                // Fallback to credits page
                window.location.href = '/credits';
            }
        } catch (error) {
            console.error('Failed to open portal:', error);
            // Fallback to credits page
            window.location.href = '/credits';
        } finally {
            setIsLoading(false);
        }
    };

    const handleBuyCredits = () => {
        window.location.href = '/credits';
    };

    const isVTPlus = user?.planSlug === 'vt_plus';
    const creditsRemaining = credits || 0;

    return (
        <Card className={`w-full ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <CardTitle className="text-lg">Credits</CardTitle>
                </div>
                <CardDescription>
                    {isVTPlus
                        ? 'VT+ subscriber with monthly credits'
                        : 'Purchase credits to unlock premium features'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-foreground text-2xl font-bold">
                        {creditsRemaining.toLocaleString()}
                    </div>
                    <div className="text-muted-foreground text-sm">
                        {isVTPlus ? 'Monthly Credits' : 'Available'}
                    </div>
                </div>

                {showUpgradeButton && (
                    <div className="flex gap-2">
                        {!isVTPlus && (
                            <Button
                                onClick={handleUpgrade}
                                disabled={isLoading}
                                className="flex-1"
                                variant="default"
                            >
                                {isLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Get VT+
                            </Button>
                        )}
                        <Button
                            onClick={handleBuyCredits}
                            variant={isVTPlus ? 'default' : 'outline'}
                            className={isVTPlus ? 'flex-1' : 'flex-1'}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Buy Credits
                        </Button>
                    </div>
                )}

                {creditsRemaining === 0 && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-600">
                        <div className="font-medium">No credits remaining</div>
                        <div className="mt-1 text-amber-700">
                            {isVTPlus
                                ? 'Your monthly credits will refresh at the start of next billing cycle.'
                                : 'Purchase credits or upgrade to VT+ to continue using premium features.'}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default CreditsDisplay;
