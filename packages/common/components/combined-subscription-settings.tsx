'use client';

import {
    useCreemSubscription,
    useCurrentPlan,
    useFeatureAccess,
    useVtPlusAccess,
} from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { getEnabledVTPlusFeatures, VT_PLUS_FEATURES } from '@repo/shared/config/vt-plus-features';
import { BUTTON_TEXT, THINKING_MODE } from '@repo/shared/constants';
import { FeatureSlug, PLANS, PlanSlug } from '@repo/shared/types/subscription';
import {
    Alert,
    AlertDescription,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    Slider,
    Switch,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    Brain,
    Check,
    Crown,
    FileText,
    Lock,
    Sparkles,
    Zap,
    CreditCard,
    Shield,
    Search,
    MessageSquare,
    Palette,
} from 'lucide-react';
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
    const thinkingMode = useChatStore(state => state.thinkingMode);
    const setThinkingMode = useChatStore(state => state.setThinkingMode);

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];
    const vtPlusFeatures = getEnabledVTPlusFeatures();

    const setThinkingModeEnabled = (enabled: boolean) => {
        setThinkingMode({
            enabled,
            budget: thinkingMode.budget,
            includeThoughts: thinkingMode.includeThoughts,
        });
    };

    const setThinkingModeIncludeThoughts = (includeThoughts: boolean) => {
        setThinkingMode({
            enabled: thinkingMode.enabled,
            budget: thinkingMode.budget,
            includeThoughts,
        });
    };

    const getFeatureDetails = (featureId: FeatureSlug) => {
        switch (featureId) {
            case FeatureSlug.DOCUMENT_PARSING:
                return {
                    icon: <FileText className="h-4 w-4" />,
                    benefit: 'Upload and analyze documents',
                    description: 'Process PDFs, Word docs, spreadsheets, and other files directly in chat. Extract insights, summarize content, and ask questions about your documents.',
                };
            case FeatureSlug.STRUCTURED_OUTPUT:
                return {
                    icon: <MessageSquare className="h-4 w-4" />,
                    benefit: 'Organized, structured responses',
                    description: 'Get AI responses in clean tables, bullet points, numbered lists, and other organized formats for better readability and usability.',
                };
            case FeatureSlug.THINKING_MODE_TOGGLE:
                return {
                    icon: <Brain className="h-4 w-4" />,
                    benefit: 'AI reasoning transparency',
                    description: 'See exactly how the AI thinks through problems step-by-step. Understand the reasoning process for better learning and trust.',
                };
            case FeatureSlug.REASONING_CHAIN:
                return {
                    icon: <Activity className="h-4 w-4" />,
                    benefit: 'Step-by-step problem solving',
                    description: 'Watch AI break down complex problems into logical steps, showing the chain of reasoning for transparent decision making.',
                };
            case FeatureSlug.PRO_SEARCH:
                return {
                    icon: <Search className="h-4 w-4" />,
                    benefit: 'Advanced web search integration',
                    description: 'Get real-time information from the web with intelligent search capabilities that understand context and provide accurate results.',
                };
            case FeatureSlug.DEEP_RESEARCH:
                return {
                    icon: <Shield className="h-4 w-4" />,
                    benefit: 'Comprehensive research tools',
                    description: 'Conduct thorough research across multiple sources with AI-powered analysis, fact-checking, and synthesis of information.',
                };
            case FeatureSlug.DARK_THEME:
                return {
                    icon: <Palette className="h-4 w-4" />,
                    benefit: 'Comfortable dark mode',
                    description: 'Beautiful dark theme designed for extended use, reducing eye strain during long sessions and late-night work.',
                };
            default:
                return {
                    icon: <Sparkles className="h-4 w-4" />,
                    benefit: 'Enhanced AI capabilities',
                    description: 'Premium features that unlock the full potential of AI assistance.',
                };
        }
    };

    const handleManageSubscription = async () => {
        try {
            await openCustomerPortal();
        } catch (error) {
            console.error('Failed to open subscription portal:', error);
        }
    };

    const handleUpgradeToPlus = () => {
        onClose?.();
        window.location.href = '/plus';
    };

    return (
        <>
            <PaymentRedirectLoader
                isLoading={isPaymentLoading || isPortalLoading}
                message={
                    isPaymentLoading
                        ? 'Redirecting to secure payment...'
                        : 'Opening subscription portal...'
                }
            />
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                        <Crown className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <TypographyH3>VT+</TypographyH3>
                        <TypographyMuted>
                            Premium features and subscription management
                        </TypographyMuted>
                    </div>
                </div>

                {/* Current Plan & Billing Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-500" />
                            Plan & Billing
                        </CardTitle>
                        <CardDescription>
                            Your subscription details and billing management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="text-foreground text-lg font-semibold">
                                                {currentPlan.name}
                                            </div>
                                            <UserTierBadge />
                                        </div>
                                        <div className="text-muted-foreground text-sm">
                                            {isVtPlus ? '$9.99/month • Renews automatically' : currentPlan.description}
                                        </div>
                                    </div>
                                </div>
                                {isLoaded && (
                                    <div className="shrink-0">
                                        {isVtPlus ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleManageSubscription}
                                                disabled={isPortalLoading}
                                            >
                                                {isPortalLoading
                                                    ? BUTTON_TEXT.LOADING
                                                    : BUTTON_TEXT.MANAGE_BILLING}
                                            </Button>
                                        ) : (
                                            <Button size="sm" onClick={handleUpgradeToPlus}>
                                                Upgrade to VT+
                                            </Button>
                                        )}
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
                            <CardTitle className="flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                Thinking Mode
                                <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                >
                                    VT+ Active
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Advanced reasoning mode that shows AI thought process for better
                                understanding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                                            <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="thinking-mode"
                                                className="cursor-pointer text-sm font-medium"
                                            >
                                                Enable Thinking Mode
                                            </Label>
                                            <div className="text-muted-foreground text-xs">
                                                Show detailed reasoning process in responses
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        id="thinking-mode"
                                        checked={thinkingMode.enabled}
                                        onCheckedChange={setThinkingModeEnabled}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {thinkingMode.enabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        {/* Include Thoughts Toggle */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <Label
                                                            htmlFor="include-thoughts"
                                                            className="cursor-pointer text-sm font-medium"
                                                        >
                                                            Show Thought Process
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Display internal reasoning steps in chat
                                                        </div>
                                                    </div>
                                                </div>
                                                <Switch
                                                    id="include-thoughts"
                                                    checked={thinkingMode.includeThoughts}
                                                    onCheckedChange={setThinkingModeIncludeThoughts}
                                                />
                                            </div>
                                        </div>

                                        {/* Thinking Budget Slider */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Thinking Budget: {thinkingMode.budget}
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Higher values allow deeper reasoning
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    value={[thinkingMode.budget]}
                                                    onValueChange={([value]) =>
                                                        setThinkingMode({
                                                            enabled: thinkingMode.enabled,
                                                            budget: value,
                                                            includeThoughts:
                                                                thinkingMode.includeThoughts,
                                                        })
                                                    }
                                                    min={THINKING_MODE.MIN_BUDGET}
                                                    max={THINKING_MODE.MAX_BUDGET}
                                                    step={256}
                                                    className="w-full"
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
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

                {/* Features Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {isVtPlus ? (
                                <>
                                    <Check className="h-5 w-5 text-green-500" />
                                    Your VT+ Features
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5 text-amber-500" />
                                    Available with VT+
                                </>
                            )}
                        </CardTitle>
                        <CardDescription>
                            {isVtPlus
                                ? 'Premium capabilities included in your subscription'
                                : 'Powerful features to enhance your AI experience'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {isVtPlus ? (
                                // VT+ Features for subscribed users
                                vtPlusFeatures.map(feature => {
                                    const details = getFeatureDetails(feature.id);
                                    return (
                                        <div
                                            key={feature.id}
                                            className="border-border/50 bg-muted/20 rounded-lg border p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                                    {details.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className="text-foreground font-medium">
                                                            {feature.name}
                                                        </div>
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    </div>
                                                    <div className="text-muted-foreground text-sm mb-2">
                                                        {details.benefit}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs leading-relaxed">
                                                        {details.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                // Features showcase for free users
                                <>
                                    {/* Current free plan feature */}
                                    <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <div className="text-foreground font-medium">
                                                        Basic Chat
                                                    </div>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </div>
                                                <div className="text-muted-foreground text-sm mb-2">
                                                    Essential AI conversations
                                                </div>
                                                <div className="text-muted-foreground text-xs leading-relaxed">
                                                    Access to basic AI conversation features with standard models for everyday assistance and support.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* VT+ features for upgrade promotion */}
                                    {Object.values(VT_PLUS_FEATURES).map(feature => {
                                        const details = getFeatureDetails(feature.id);
                                        return (
                                            <div
                                                key={feature.id}
                                                className="border-border/50 bg-muted/20 hover:bg-muted/30 group relative overflow-hidden rounded-lg border p-4 transition-colors"
                                            >
                                                {/* Lock overlay */}
                                                <div className="bg-background/90 absolute right-3 top-3 rounded-full p-1.5 backdrop-blur-sm">
                                                    <Lock className="text-muted-foreground h-3.5 w-3.5" />
                                                </div>

                                                <div className="flex items-start gap-3 pr-12">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
                                                        {details.icon}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-foreground font-medium mb-1">
                                                            {feature.name}
                                                        </div>
                                                        <div className="text-muted-foreground text-sm mb-2">
                                                            {details.benefit}
                                                        </div>
                                                        <div className="text-muted-foreground text-xs leading-relaxed">
                                                            {details.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {!isVtPlus && (
                            <div className="mt-6 flex items-center justify-center">
                                <Button className="group gap-2" onClick={handleUpgradeToPlus}>
                                    <Crown className="h-4 w-4" />
                                    Upgrade to VT+
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Simple Upgrade Promotion for Free Users */}
                {!isVtPlus && (
                    <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                            <strong>Ready to upgrade?</strong> Get VT+ for $9.99/month and unlock advanced AI reasoning, document parsing, and premium tools.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    );
}
