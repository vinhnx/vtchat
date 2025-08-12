'use client';

import {
    useCreemSubscription,
    useCurrentPlan,
    useFeatureAccess,
    useVtPlusAccess,
} from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { BUTTON_TEXT, THINKING_MODE, VT_PLUS_PRICE_WITH_INTERVAL } from '@repo/shared/constants';
import { log } from '@repo/shared/logger';
import { FeatureSlug, PLANS, PlanSlug } from '@repo/shared/types/subscription';
import {
    Alert,
    AlertDescription,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    Skeleton,
    Slider,
    Switch,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Brain, CreditCard, FileText, Sparkles, Zap } from 'lucide-react';
import { PaymentRedirectLoader } from './payment-redirect-loader';
import { UserTierBadge } from './user-tier-badge';

interface CombinedSubscriptionSettingsProps {
    onClose?: () => void;
}

export function CombinedSubscriptionSettings({ onClose }: CombinedSubscriptionSettingsProps) {
    const isVtPlus = useVtPlusAccess();
    const { planSlug, isLoaded } = useCurrentPlan();
    const {
        openCustomerPortal,
        isPortalLoading,
        isLoading: isPaymentLoading,
    } = useCreemSubscription();

    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const hasGeminiCachingAccess = useFeatureAccess(FeatureSlug.GEMINI_EXPLICIT_CACHING);
    const thinkingMode = useAppStore((state) => state.thinkingMode);
    const setThinkingMode = useAppStore((state) => state.setThinkingMode);
    const geminiCaching = useAppStore((state) => state.geminiCaching);
    const setGeminiCaching = useAppStore((state) => state.setGeminiCaching);
    const embeddingModel = useAppStore((state) => state.embeddingModel);
    const setEmbeddingModel = useAppStore((state) => state.setEmbeddingModel);
    const ragChatModel = useAppStore((state) => state.ragChatModel);
    const setRagChatModel = useAppStore((state) => state.setRagChatModel);
    const profile = useAppStore((state) => state.profile);

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];

    const setThinkingModeEnabled = (enabled: boolean) => {
        setThinkingMode({
            enabled,
        });
    };

    const setThinkingModeIncludeThoughts = (includeThoughts: boolean) => {
        setThinkingMode({
            includeThoughts,
        });
    };

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error) {
            log.error({ error }, 'Failed to open subscription portal');
        }
    };

    const handleUpgradeToPlus = () => {
        onClose?.();
        window.location.href = '/pricing';
    };

    return (
        <>
            <PaymentRedirectLoader isLoading={isPaymentLoading || isPortalLoading} />
            <div className='space-y-6'>
                {/* Header */}
                <div className='flex items-center gap-3'>
                    <div>
                        <TypographyH3 className='text-lg md:text-xl'>VT+</TypographyH3>
                        <TypographyMuted className='text-sm md:text-base'>
                            Premium features and subscription management
                        </TypographyMuted>
                    </div>
                </div>

                {/* Current Plan & Billing Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <CreditCard className='h-5 w-5' />
                            Plan & Billing
                        </CardTitle>
                        <CardDescription>
                            Your subscription details and billing management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
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
                                    </div>
                                </div>
                                {isLoaded
                                    ? (
                                        <div className='shrink-0'>
                                            {isVtPlus
                                                ? (
                                                    <Button
                                                        disabled={isPortalLoading}
                                                        onClick={handleManageSubscription}
                                                        size='sm'
                                                        variant='outline'
                                                    >
                                                        {isPortalLoading
                                                            ? BUTTON_TEXT.LOADING
                                                            : BUTTON_TEXT.MANAGE_BILLING}
                                                    </Button>
                                                )
                                                : (
                                                    <Button onClick={handleUpgradeToPlus} size='sm'>
                                                        Upgrade to VT+
                                                    </Button>
                                                )}
                                        </div>
                                    )
                                    : (
                                        <div className='shrink-0'>
                                            <Skeleton className='h-9 w-28 rounded-md' />
                                        </div>
                                    )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* VT+ Features Section - Only show if user has VT+ */}
                {hasThinkingModeAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Brain className='h-5 w-5' />
                                Thinking Mode
                            </CardTitle>
                            <CardDescription>
                                Advanced reasoning mode that shows AI thought process for better
                                understanding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {/* Enable/Disable Toggle */}
                            <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                            <Zap className='h-4 w-4' />
                                        </div>
                                        <div>
                                            <Label
                                                className='cursor-pointer text-sm font-medium'
                                                htmlFor='thinking-mode'
                                            >
                                                Enable Thinking Mode
                                            </Label>
                                            <div className='text-muted-foreground text-xs'>
                                                Show detailed reasoning process in responses
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={thinkingMode.enabled}
                                        id='thinking-mode'
                                        onCheckedChange={setThinkingModeEnabled}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode='wait'>
                                {thinkingMode.enabled && (
                                    <motion.div
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className='space-y-4'
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Include Thoughts Toggle */}
                                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                            <div className='flex items-center justify-between'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                                        <FileText className='h-4 w-4' />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            className='cursor-pointer text-sm font-medium'
                                                            htmlFor='include-thoughts'
                                                        >
                                                            Show Thought Process
                                                        </Label>
                                                        <div className='text-muted-foreground text-xs'>
                                                            Display internal reasoning steps in chat
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={thinkingMode.includeThoughts}
                                                    id='include-thoughts'
                                                    onCheckedChange={setThinkingModeIncludeThoughts}
                                                />
                                            </div>
                                        </div>

                                        {/* Thinking Budget Slider */}
                                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                                        <Activity className='h-4 w-4' />
                                                    </div>
                                                    <div className='flex-1'>
                                                        <Label className='text-sm font-medium'>
                                                            Thinking Budget: {thinkingMode.budget}
                                                        </Label>
                                                        <div className='text-muted-foreground text-xs'>
                                                            Higher values allow deeper reasoning
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className='w-full'
                                                    max={THINKING_MODE.MAX_BUDGET}
                                                    min={THINKING_MODE.MIN_BUDGET}
                                                    onValueChange={([value]) =>
                                                        setThinkingMode({
                                                            budget: value,
                                                        })}
                                                    step={256}
                                                    value={[thinkingMode.budget]}
                                                />
                                                <div className='text-muted-foreground flex justify-between text-xs'>
                                                    <span>Quick ({THINKING_MODE.MIN_BUDGET})</span>
                                                    <span>Deep ({THINKING_MODE.MAX_BUDGET})</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Gemini Explicit Caching Section - Only show if user has VT+ */}
                {hasGeminiCachingAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Zap className='h-5 w-5' />
                                Gemini Explicit Caching
                            </CardTitle>
                            <CardDescription>
                                Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API
                                costs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            {/* Enable/Disable Toggle */}
                            <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                            <Zap className='h-4 w-4' />
                                        </div>
                                        <div>
                                            <Label
                                                className='cursor-pointer text-sm font-medium'
                                                htmlFor='gemini-caching'
                                            >
                                                Enable Explicit Caching
                                            </Label>
                                            <div className='text-muted-foreground text-xs'>
                                                Cache conversation context to reduce API costs
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={geminiCaching.enabled}
                                        id='gemini-caching'
                                        onCheckedChange={(enabled) => setGeminiCaching({ enabled })}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode='wait'>
                                {geminiCaching.enabled && (
                                    <motion.div
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className='space-y-4'
                                        exit={{ opacity: 0, height: 0 }}
                                        initial={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {/* Cache TTL Slider */}
                                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                                        <FileText className='h-4 w-4' />
                                                    </div>
                                                    <div className='flex-1'>
                                                        <Label className='text-sm font-medium'>
                                                            Cache Duration: {Math.round(
                                                                geminiCaching.ttlSeconds / 60,
                                                            )} minutes
                                                        </Label>
                                                        <div className='text-muted-foreground text-xs'>
                                                            How long to keep cached conversations
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className='w-full'
                                                    max={3600}
                                                    min={60} // 1 minute
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            ttlSeconds: value,
                                                        })} // 1 hour
                                                    step={60}
                                                    value={[geminiCaching.ttlSeconds]}
                                                />
                                                <div className='text-muted-foreground flex justify-between text-xs'>
                                                    <span>1 minute</span>
                                                    <span>60 minutes</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Max Caches Setting */}
                                        <div className='border-border/50 bg-muted/20 rounded-lg border p-4'>
                                            <div className='space-y-3'>
                                                <div className='flex items-center gap-3'>
                                                    <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                                                        <Activity className='h-4 w-4' />
                                                    </div>
                                                    <div className='flex-1'>
                                                        <Label className='text-sm font-medium'>
                                                            Max Cached Conversations:{' '}
                                                            {geminiCaching.maxCaches}
                                                        </Label>
                                                        <div className='text-muted-foreground text-xs'>
                                                            Maximum number of conversations to cache
                                                            simultaneously
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    className='w-full'
                                                    max={20}
                                                    min={1}
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            maxCaches: value,
                                                        })}
                                                    step={1}
                                                    value={[geminiCaching.maxCaches]}
                                                />
                                                <div className='text-muted-foreground flex justify-between text-xs'>
                                                    <span>1 conversation</span>
                                                    <span>20 conversations</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </CardContent>
                    </Card>
                )}

                {/* Simple Upgrade Promotion for Free Users */}
                {!isVtPlus && (
                    <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'>
                        <Sparkles className='h-4 w-4' />
                        <AlertDescription className='text-amber-800 dark:text-amber-200'>
                            <strong>Ready to upgrade?</strong> Get VT+ for{' '}
                            {VT_PLUS_PRICE_WITH_INTERVAL}{' '}
                            with free trial included and cancel anytime. Unlock premium AI models,
                            research capabilities, and AI memory.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    );
}
