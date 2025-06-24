'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useAppStore } from '@repo/common/store';
import { VT_PLUS_FEATURES } from '@repo/shared/config/vt-plus-features';
import { THINKING_MODE } from '@repo/shared/constants';
import { FeatureSlug } from '@repo/shared/types/subscription';
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
    BarChart3,
    Brain,
    FileText,
    Link,
    Palette,
    Search,
    Sparkles,
    Zap,
    ArrowRight,
    Check,
    Lock,
} from 'lucide-react';

export const PlusSettings = () => {
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const thinkingMode = useAppStore(state => state.thinkingMode);
    const setThinkingMode = useAppStore(state => state.setThinkingMode);

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

    const getFeatureIcon = (featureId: FeatureSlug) => {
        switch (featureId) {
            case FeatureSlug.DOCUMENT_PARSING:
                return <FileText className="h-5 w-5 text-blue-500" />;
            case FeatureSlug.STRUCTURED_OUTPUT:
                return <Activity className="h-5 w-5 text-green-500" />;
            case FeatureSlug.THINKING_MODE_TOGGLE:
                return <Zap className="h-5 w-5 text-purple-500" />;
            case FeatureSlug.REASONING_CHAIN:
                return <Link className="h-5 w-5 text-orange-500" />;
            case FeatureSlug.PRO_SEARCH:
            case FeatureSlug.DEEP_RESEARCH:
                return <Search className="h-5 w-5 text-cyan-500" />;
            case FeatureSlug.DARK_THEME:
                return <Palette className="h-5 w-5 text-indigo-500" />;
            case FeatureSlug.CHART_VISUALIZATION:
                return <BarChart3 className="h-5 w-5 text-purple-500" />;
            default:
                return <Sparkles className="h-5 w-5 text-amber-500" />;
        }
    };

    const getFeatureBenefit = (featureId: FeatureSlug) => {
        switch (featureId) {
            case FeatureSlug.DOCUMENT_PARSING:
                return 'Upload and analyze PDFs, Word docs, and more';
            case FeatureSlug.STRUCTURED_OUTPUT:
                return 'Get organized responses in tables, lists, and structured formats';
            case FeatureSlug.THINKING_MODE_TOGGLE:
                return 'See AI reasoning process for better understanding';
            case FeatureSlug.REASONING_CHAIN:
                return 'Follow step-by-step logical reasoning';
            case FeatureSlug.PRO_SEARCH:
                return 'Advanced search capabilities with web integration';
            case FeatureSlug.DEEP_RESEARCH:
                return 'Comprehensive research with multiple sources';
            case FeatureSlug.DARK_THEME:
                return 'Elegant dark mode for comfortable viewing';
            case FeatureSlug.CHART_VISUALIZATION:
                return 'Create interactive charts and graphs from AI conversations';
            default:
                return 'Enhanced AI capabilities and premium features';
        }
    };

    if (!hasThinkingModeAccess) {
        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                        <Sparkles className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                        <TypographyH3>VT+ Features</TypographyH3>
                        <TypographyMuted>
                            Premium AI capabilities and advanced tools
                        </TypographyMuted>
                    </div>
                </div>

                {/* Upgrade Alert */}
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 dark:text-amber-200">
                        <strong>Unlock VT+ Features:</strong> Get access to advanced AI reasoning,
                        document parsing, and premium tools with your VT+ subscription.
                    </AlertDescription>
                </Alert>

                {/* Features Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Available with VT+
                        </CardTitle>
                        <CardDescription>
                            Powerful features to enhance your AI conversations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {Object.values(VT_PLUS_FEATURES).map(feature => (
                                <div
                                    key={feature.id}
                                    className="border-border/50 bg-muted/20 hover:bg-muted/30 group relative overflow-hidden rounded-lg border p-4 transition-all"
                                >
                                    {/* Lock overlay */}
                                    <div className="bg-background/80 absolute right-3 top-3 rounded-full p-1.5 backdrop-blur-sm">
                                        <Lock className="text-muted-foreground h-3 w-3" />
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-background/50 flex h-10 w-10 items-center justify-center rounded-lg">
                                            {getFeatureIcon(feature.id)}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div>
                                                <div className="text-foreground font-medium">
                                                    {feature.name}
                                                </div>
                                                <div className="text-muted-foreground text-sm">
                                                    {feature.description}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-green-500"></div>
                                                <span className="text-muted-foreground text-xs">
                                                    {getFeatureBenefit(feature.id)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-center">
                            <Button
                                className="group gap-2"
                                onClick={() => (window.location.href = '/plus')}
                            >
                                <Sparkles className="h-4 w-4" />
                                Upgrade to VT+
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                    <Sparkles className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                    <TypographyH3>VT+ Features</TypographyH3>
                    <TypographyMuted>Configure your premium AI experience</TypographyMuted>
                </div>
            </div>

            {/* Thinking Mode Configuration */}
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
                                            step={1000}
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

            {/* Available Features Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-500" />
                        Your VT+ Features
                    </CardTitle>
                    <CardDescription>
                        All the premium features included in your subscription
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {Object.values(VT_PLUS_FEATURES).map(feature => (
                            <div
                                key={feature.id}
                                className="border-border/50 bg-muted/20 flex items-start gap-3 rounded-lg border p-3"
                            >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-foreground text-sm font-medium">
                                        {feature.name}
                                    </div>
                                    <div className="text-muted-foreground mt-1 text-xs">
                                        {getFeatureBenefit(feature.id)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
