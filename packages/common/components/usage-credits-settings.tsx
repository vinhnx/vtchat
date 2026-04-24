'use client';

import { useCurrentPlan } from '@repo/common/hooks';
import { PLANS, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { RateLimitMeter } from './rate-limit-meter';
import { UserTierBadge } from './user-tier-badge';

interface UsageCreditsSettingsProps {
    onClose?: () => void;
}

interface FeatureItem {
    name: string;
    description: string;
}

export function UsageCreditsSettings({ onClose }: UsageCreditsSettingsProps) {
    void onClose;
    const { planSlug } = useCurrentPlan();

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];
    const includedFeatures: ReadonlyArray<FeatureItem> = [
        {
            name: 'Research workflows',
            description: 'Structured research modes for deeper answers and source-backed output.',
        },
        {
            name: 'Model controls',
            description: 'Flexible model selection, thinking settings, and caching controls.',
        },
        {
            name: 'Core chat tools',
            description: 'Image, document, and chart tooling are available in the standard flow.',
        },
    ];

    return (
        <>
            <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center gap-3'>
                    <div>
                        <TypographyH3>Usage</TypographyH3>
                        <TypographyMuted>Review included features and usage limits</TypographyMuted>
                    </div>
                </div>

                {/* Current Plan Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>Current Plan</CardTitle>
                        <CardDescription>
                            All features are included by default
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-3'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <div className='text-foreground text-lg font-semibold'>
                                                {currentPlan.name}
                                            </div>
                                            <UserTierBadge />
                                        </div>
                                        <div className='text-muted-foreground max-w-md text-sm'>
                                            {currentPlan.description}
                                        </div>
                                    </div>
                                </div>
                                <div className='shrink-0'>
                                    <Button disabled size='sm' variant='outline'>
                                        Included
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Features Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>Included Features</CardTitle>
                        <CardDescription>
                            What's included in your {currentPlan.name} access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-3'>
                            {includedFeatures.map((feature) => (
                                <div
                                    className='border-border/50 bg-muted/20 flex items-start gap-3 rounded-lg border p-3'
                                    key={feature.name}
                                >
                                    <div className='min-w-0 flex-1'>
                                        <div className='text-foreground text-sm font-medium'>
                                            {feature.name}
                                        </div>
                                        <div className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                                            {feature.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <RateLimitMeter />
            </div>
        </>
    );
}
