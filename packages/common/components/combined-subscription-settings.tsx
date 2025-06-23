'use client';

import {
    useCreemSubscription,
    useCurrentPlan,
    useFeatureAccess,
    useVtPlusAccess,
} from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Label,
    Skeleton,
    Slider,
    Switch,
    TypographyH3,
    TypographyMuted,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowRight,
    BarChart3,
    Brain,
    Check,
    ChevronDown,
    Crown,
    Database,
    FileText,
    Lock,
    Settings,
    Sparkles,
    Zap,
    CreditCard,
    Shield,
    Search,
    MessageSquare,
    Palette,
} from 'lucide-react';
import { EMBEDDING_MODEL_CONFIG, DEFAULT_EMBEDDING_MODEL } from '@repo/shared/config/embedding-models';
import { ModelEnum, models } from '@repo/ai/models';
import { PaymentRedirectLoader } from './payment-redirect-loader';
import { UserTierBadge } from './user-tier-badge';
import { Combobox } from './combobox';

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
    const thinkingMode = useAppStore(state => state.thinkingMode);
    const setThinkingMode = useAppStore(state => state.setThinkingMode);
    const geminiCaching = useAppStore(state => state.geminiCaching);
    const setGeminiCaching = useAppStore(state => state.setGeminiCaching);
    const embeddingModel = useAppStore(state => state.embeddingModel);
    const setEmbeddingModel = useAppStore(state => state.setEmbeddingModel);
    const ragChatModel = useAppStore(state => state.ragChatModel);
    const setRagChatModel = useAppStore(state => state.setRagChatModel);

    // Ensure embeddingModel is valid, reset to default if not
    const safeEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel] ? embeddingModel : DEFAULT_EMBEDDING_MODEL;

    const currentPlan = planSlug && PLANS[planSlug] ? PLANS[planSlug] : PLANS[PlanSlug.VT_BASE];
    const vtPlusFeatures = getEnabledVTPlusFeatures();

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

    const getFeatureDetails = (featureId: FeatureSlug) => {
        switch (featureId) {
            case FeatureSlug.DOCUMENT_PARSING:
                return {
                    icon: <FileText className="h-4 w-4" />,
                    benefit: 'Upload and analyze documents',
                    description:
                        'Process PDFs, Word docs, spreadsheets, and other files directly in chat. Extract insights, summarize content, and ask questions about your documents.',
                };
            case FeatureSlug.STRUCTURED_OUTPUT:
                return {
                    icon: <MessageSquare className="h-4 w-4" />,
                    benefit: 'Organized, structured responses',
                    description:
                        'Get AI responses in clean tables, bullet points, numbered lists, and other organized formats for better readability and usability.',
                };
            case FeatureSlug.THINKING_MODE_TOGGLE:
                return {
                    icon: <Brain className="h-4 w-4" />,
                    benefit: 'AI reasoning transparency',
                    description:
                        'See exactly how the AI thinks through problems step-by-step. Understand the reasoning process for better learning and trust.',
                };
            case FeatureSlug.REASONING_CHAIN:
                return {
                    icon: <Activity className="h-4 w-4" />,
                    benefit: 'Step-by-step problem solving',
                    description:
                        'Watch AI break down complex problems into logical steps, showing the chain of reasoning for transparent decision making.',
                };
            case FeatureSlug.PRO_SEARCH:
                return {
                    icon: <Search className="h-4 w-4" />,
                    benefit: 'Advanced web search integration',
                    description:
                        'Get real-time information from the web with intelligent search capabilities that understand context and provide accurate results.',
                };
            case FeatureSlug.DEEP_RESEARCH:
                return {
                    icon: <Shield className="h-4 w-4" />,
                    benefit: 'Comprehensive research tools',
                    description:
                        'Conduct thorough research across multiple sources with AI-powered analysis, fact-checking, and synthesis of information.',
                };
            case FeatureSlug.DARK_THEME:
                return {
                    icon: <Palette className="h-4 w-4" />,
                    benefit: 'Comfortable dark mode',
                    description:
                        'Beautiful dark theme designed for extended use, reducing eye strain during long sessions and late-night work.',
                };
            case FeatureSlug.GEMINI_EXPLICIT_CACHING:
                return {
                    icon: <Zap className="h-4 w-4" />,
                    benefit: 'Cost-effective Gemini caching',
                    description:
                        'Reduce API costs for Gemini 2.5 and 2.0 models by reusing conversation context across multiple queries.',
                };
            case FeatureSlug.CHART_VISUALIZATION:
                return {
                    icon: <BarChart3 className="h-4 w-4" />,
                    benefit: 'Interactive chart generation',
                    description:
                        'Create beautiful interactive charts and graphs directly from AI conversations. Visualize data with bar charts, line charts, pie charts, and more.',
                };
            default:
                return {
                    icon: <Sparkles className="h-4 w-4" />,
                    benefit: 'Enhanced AI capabilities',
                    description:
                        'Premium features that unlock the full potential of AI assistance.',
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
            <PaymentRedirectLoader isLoading={isPaymentLoading || isPortalLoading} />
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
                                            {isVtPlus
                                                ? '$9.99/month • Renews automatically'
                                                : currentPlan.description}
                                        </div>
                                    </div>
                                </div>
                                {isLoaded ? (
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
                                ) : (
                                    <div className="shrink-0">
                                        <Skeleton className="h-9 w-28 rounded-md" />
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
                                                            budget: value,
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

                {/* Gemini Explicit Caching Section - Only show if user has VT+ */}
                {hasGeminiCachingAccess && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-orange-500" />
                                Gemini Explicit Caching
                                <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                                >
                                    VT+ Active
                                </Badge>
                            </CardTitle>
                            <CardDescription>
                                Cost-effective caching for Gemini 2.5 and 2.0 models to reduce API
                                costs
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Enable/Disable Toggle */}
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                                            <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="gemini-caching"
                                                className="cursor-pointer text-sm font-medium"
                                            >
                                                Enable Explicit Caching
                                            </Label>
                                            <div className="text-muted-foreground text-xs">
                                                Cache conversation context to reduce API costs
                                            </div>
                                        </div>
                                    </div>
                                    <Switch
                                        id="gemini-caching"
                                        checked={geminiCaching.enabled}
                                        onCheckedChange={enabled => setGeminiCaching({ enabled })}
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {geminiCaching.enabled && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-4"
                                    >
                                        {/* Cache TTL Slider */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Cache Duration:{' '}
                                                            {Math.round(
                                                                geminiCaching.ttlSeconds / 60
                                                            )}{' '}
                                                            minutes
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            How long to keep cached conversations
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    value={[geminiCaching.ttlSeconds]}
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            ttlSeconds: value,
                                                        })
                                                    }
                                                    min={60} // 1 minute
                                                    max={3600} // 1 hour
                                                    step={60}
                                                    className="w-full"
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
                                                    <span>1 minute</span>
                                                    <span>60 minutes</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Max Caches Setting */}
                                        <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                                        <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-sm font-medium">
                                                            Max Cached Conversations:{' '}
                                                            {geminiCaching.maxCaches}
                                                        </Label>
                                                        <div className="text-muted-foreground text-xs">
                                                            Maximum number of conversations to cache
                                                            simultaneously
                                                        </div>
                                                    </div>
                                                </div>
                                                <Slider
                                                    value={[geminiCaching.maxCaches]}
                                                    onValueChange={([value]) =>
                                                        setGeminiCaching({
                                                            maxCaches: value,
                                                        })
                                                    }
                                                    min={1}
                                                    max={20}
                                                    step={1}
                                                    className="w-full"
                                                />
                                                <div className="text-muted-foreground flex justify-between text-xs">
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

                {/* RAG Embedding Model Selection */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Database className="h-5 w-5" />
                                RAG Embedding Model
                            </CardTitle>
                            <CardDescription>
                                Choose which AI model to use for generating embeddings in your RAG knowledge base.
                                Different models may provide varying quality and performance characteristics.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="text-foreground text-sm font-medium">
                                            Embedding Provider
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {EMBEDDING_MODEL_CONFIG[safeEmbeddingModel].description}
                                        </div>
                                    </div>
                                    <Combobox
                                        options={Object.entries(EMBEDDING_MODEL_CONFIG).map(([key, config]) => ({
                                            value: key,
                                            label: config.name,
                                            description: `${config.provider} • ${config.dimensions}D`,
                                        }))}
                                        value={safeEmbeddingModel}
                                        onValueChange={(value) => setEmbeddingModel(value as any)}
                                        placeholder="Select embedding model..."
                                        searchPlaceholder="Search models..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* RAG Chat Model Selection */}
                {isVtPlus && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                                <Settings className="h-5 w-5" />
                                RAG Chat Model
                            </CardTitle>
                            <CardDescription>
                                Choose which AI model to use for conversations in your RAG knowledge chat.
                                Different models may provide varying quality, speed, and capabilities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border-border/50 bg-muted/20 rounded-lg border p-4">
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <div className="text-foreground text-sm font-medium">
                                            Chat Model
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {models.find(m => m.id === ragChatModel)?.name || 'Unknown Model'}
                                        </div>
                                    </div>
                                    <Combobox
                                        options={models.filter(model => 
                                            // Filter to show commonly used models for RAG
                                            [
                                                ModelEnum.GPT_4o,
                                                ModelEnum.GPT_4o_Mini,
                                                ModelEnum.CLAUDE_4_SONNET,
                                                ModelEnum.CLAUDE_4_OPUS,
                                                ModelEnum.GEMINI_2_5_PRO,
                                                ModelEnum.GEMINI_2_5_FLASH,
                                                ModelEnum.GEMINI_2_0_FLASH
                                            ].includes(model.id)
                                        ).map((model) => ({
                                            value: model.id,
                                            label: model.name,
                                            description: `${model.provider} • ${model.contextWindow} tokens`,
                                        }))}
                                        value={ragChatModel}
                                        onValueChange={(value) => setRagChatModel(value as ModelEnum)}
                                        placeholder="Select chat model..."
                                        searchPlaceholder="Search models..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
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
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                                    {details.icon}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <div className="text-foreground font-medium">
                                                            {feature.name}
                                                        </div>
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    </div>
                                                    <div className="text-muted-foreground mb-2 text-sm">
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
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                                <MessageSquare className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <div className="text-foreground font-medium">
                                                        Basic Chat
                                                    </div>
                                                    <Check className="h-4 w-4 text-green-500" />
                                                </div>
                                                <div className="text-muted-foreground mb-2 text-sm">
                                                    Essential AI conversations
                                                </div>
                                                <div className="text-muted-foreground text-xs leading-relaxed">
                                                    Access to basic AI conversation features with
                                                    standard models for everyday assistance and
                                                    support.
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
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                                                        {details.icon}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-foreground mb-1 font-medium">
                                                            {feature.name}
                                                        </div>
                                                        <div className="text-muted-foreground mb-2 text-sm">
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
                            <strong>Ready to upgrade?</strong> Get VT+ for $9.99/month and unlock
                            advanced AI reasoning, document parsing, and premium tools.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </>
    );
}
