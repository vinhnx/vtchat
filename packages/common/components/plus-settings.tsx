'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { VT_PLUS_FEATURES } from '@repo/shared/config/vt-plus-features';
import { THINKING_MODE } from '@repo/shared/constants';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Alert, AlertDescription, Badge, Label, Slider, Switch } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    Brain,
    Crown,
    FileText,
    Info,
    Link,
    Palette,
    Search,
    Sparkles,
    Zap,
} from 'lucide-react';

export const PlusSettings = () => {
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const thinkingMode = useChatStore(state => state.thinkingMode);
    const setThinkingMode = useChatStore(state => state.setThinkingMode);

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

    if (!hasThinkingModeAccess) {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Crown size={20} className="text-amber-500" />
                        VT+ Features
                    </h3>
                    <p className="text-muted-foreground text-sm">
                        Premium features available with VT+ subscription
                    </p>
                </div>

                <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                        Upgrade to VT+ to access advanced features like Thinking Mode and enhanced
                        AI capabilities.
                    </AlertDescription>
                </Alert>

                <div className="space-y-4">
                    <h4 className="font-medium text-[#BFB38F]">VT+ Features Preview</h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {Object.values(VT_PLUS_FEATURES).map(feature => {
                            const getFeatureIcon = (featureId: FeatureSlug) => {
                                switch (featureId) {
                                    case FeatureSlug.DOCUMENT_PARSING:
                                        return <FileText className="h-4 w-4 text-blue-500" />;
                                    case FeatureSlug.STRUCTURED_OUTPUT:
                                        return <Activity className="h-4 w-4 text-green-500" />;
                                    case FeatureSlug.THINKING_MODE_TOGGLE:
                                        return <Zap className="h-4 w-4 text-purple-500" />;
                                    case FeatureSlug.REASONING_CHAIN:
                                        return <Link className="h-4 w-4 text-orange-500" />;
                                    case FeatureSlug.PRO_SEARCH:
                                    case FeatureSlug.DEEP_RESEARCH:
                                        return <Search className="h-4 w-4 text-cyan-500" />;
                                    case FeatureSlug.DARK_THEME:
                                        return <Palette className="h-4 w-4 text-indigo-500" />;
                                    default:
                                        return <Sparkles className="h-4 w-4 text-amber-500" />;
                                }
                            };

                            return (
                                <div
                                    key={feature.id}
                                    className="border-muted-foreground/30 rounded-lg border border-dashed p-4 opacity-60"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 grayscale">
                                            {getFeatureIcon(feature.id)}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-medium">{feature.name}</h5>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {feature.description}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            VT+ Only
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="border-muted-foreground/30 rounded-lg border border-dashed p-4 opacity-60">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Brain size={20} className="text-purple-500" />
                                <div>
                                    <Label className="text-base font-medium">Reasoning Mode</Label>
                                    <p className="text-muted-foreground text-sm">
                                        See how AI models reason through problems
                                    </p>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                VT+ Only
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <Crown size={20} className="text-amber-500" />
                    VT+ Features
                    <Badge
                        variant="default"
                        className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100"
                    >
                        Active
                    </Badge>
                </h3>
                <p className="text-muted-foreground text-sm">
                    Premium features for enhanced AI interactions
                </p>
            </div>

            {/* VT+ Features Overview */}
            <div className="space-y-4">
                <h4 className="font-medium text-[#BFB38F]">Available Features</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Object.values(VT_PLUS_FEATURES).map(feature => {
                        const getFeatureIcon = (featureId: FeatureSlug) => {
                            switch (featureId) {
                                case FeatureSlug.DOCUMENT_PARSING:
                                    return <FileText className="h-4 w-4 text-blue-500" />;
                                case FeatureSlug.STRUCTURED_OUTPUT:
                                    return <Activity className="h-4 w-4 text-green-500" />;
                                case FeatureSlug.THINKING_MODE_TOGGLE:
                                    return <Zap className="h-4 w-4 text-purple-500" />;
                                case FeatureSlug.REASONING_CHAIN:
                                    return <Link className="h-4 w-4 text-orange-500" />;
                                case FeatureSlug.PRO_SEARCH:
                                case FeatureSlug.DEEP_RESEARCH:
                                    return <Search className="h-4 w-4 text-cyan-500" />;
                                case FeatureSlug.DARK_THEME:
                                    return <Palette className="h-4 w-4 text-indigo-500" />;
                                default:
                                    return <Sparkles className="h-4 w-4 text-amber-500" />;
                            }
                        };

                        return (
                            <motion.div
                                key={feature.id}
                                whileHover={{ scale: 1.02 }}
                                className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-[#262626] via-[#262626]/95 to-[#262626]/90 p-4"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{getFeatureIcon(feature.id)}</div>
                                    <div className="flex-1">
                                        <h5 className="font-medium text-[#BFB38F]">
                                            {feature.name}
                                        </h5>
                                        <p className="mt-1 text-sm text-[#BFB38F]/70">
                                            {feature.description}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="border-green-500/20 bg-green-500/10 text-green-500"
                                    >
                                        Active
                                    </Badge>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Thinking Mode Settings */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="rounded-lg bg-gradient-to-r from-[#262626] to-[#262626]/95 p-3"
                    >
                        <Brain className="h-6 w-6 text-[#D99A4E]" />
                    </motion.div>
                    <div>
                        <h4 className="flex items-center gap-2 font-medium text-[#BFB38F]">
                            Reasoning Mode
                            <Badge
                                variant="secondary"
                                className="border-[#D99A4E]/20 bg-[#D99A4E]/10 text-[#D99A4E]"
                            >
                                Multi-Model
                            </Badge>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Configure AI reasoning and thinking capabilities
                        </p>
                    </div>
                </div>

                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        Reasoning Mode shows how AI models think through problems step by step.
                        Supported models: Gemini 2.5 Flash/Pro variants, DeepSeek R1, and Claude 4
                        models. The thinking budget controls the depth of reasoning for supported
                        models.
                    </AlertDescription>
                </Alert>

                <div className="space-y-6">
                    {/* Enable Thinking Mode */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-[#262626] via-[#262626]/95 to-[#262626]/90 p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Label
                                        htmlFor="thinking-mode-enabled"
                                        className="text-base font-medium text-[#BFB38F]"
                                    >
                                        Enable Reasoning Mode
                                    </Label>
                                    <Zap className="h-4 w-4 text-[#D99A4E]" />
                                </div>
                                <p className="text-sm text-[#BFB38F]/70">
                                    Allow AI models to show their reasoning process
                                </p>
                            </div>
                            <Switch
                                id="thinking-mode-enabled"
                                checked={thinkingMode.enabled}
                                onCheckedChange={setThinkingModeEnabled}
                                className="data-[state=checked]:bg-[#D99A4E]"
                            />
                        </div>
                    </motion.div>

                    <AnimatePresence>
                        {thinkingMode.enabled && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="space-y-6"
                            >
                                {/* Include Thoughts in Responses */}
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-[#262626] via-[#262626]/95 to-[#262626]/90 p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <Label
                                                htmlFor="thinking-mode-include-thoughts"
                                                className="text-base font-medium text-[#BFB38F]"
                                            >
                                                Show Reasoning Details
                                            </Label>
                                            <p className="text-sm text-[#BFB38F]/70">
                                                Display the AI's step-by-step reasoning in responses
                                            </p>
                                        </div>
                                        <Switch
                                            id="thinking-mode-include-thoughts"
                                            checked={thinkingMode.includeThoughts}
                                            onCheckedChange={setThinkingModeIncludeThoughts}
                                            disabled={!thinkingMode.enabled}
                                            className="data-[state=checked]:bg-[#D99A4E]"
                                        />
                                    </div>
                                </motion.div>

                                {/* Thinking Budget Slider */}
                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-[#262626] via-[#262626]/95 to-[#262626]/90 p-6"
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <Label
                                                htmlFor="reasoning-budget"
                                                className="text-base font-medium text-[#BFB38F]"
                                            >
                                                Reasoning Budget:{' '}
                                                {thinkingMode.budget.toLocaleString()} tokens
                                            </Label>
                                            <p className="mt-1 text-sm text-[#BFB38F]/70">
                                                Control how much the AI can reason (higher = more
                                                thorough reasoning)
                                            </p>
                                        </div>
                                        <div className="space-y-3">
                                            <Slider
                                                id="reasoning-budget"
                                                min={THINKING_MODE.MIN_BUDGET}
                                                max={THINKING_MODE.MAX_BUDGET}
                                                step={256}
                                                value={[thinkingMode.budget]}
                                                onValueChange={value =>
                                                    setThinkingMode({
                                                        enabled:
                                                            value[0] > 0
                                                                ? true
                                                                : thinkingMode.enabled,
                                                        budget: value[0],
                                                        includeThoughts:
                                                            thinkingMode.includeThoughts,
                                                    })
                                                }
                                                disabled={!thinkingMode.enabled}
                                                className="[&_.bg-primary]:bg-[#D99A4E] [&_[role=slider]]:border-[#D99A4E] [&_[role=slider]]:bg-[#D99A4E]"
                                            />
                                            <div className="flex justify-between text-xs text-[#BFB38F]/60">
                                                <span>Quick (2K)</span>
                                                <span>Balanced (8K)</span>
                                                <span>Deep (24K)</span>
                                            </div>
                                            <div className="text-center">
                                                <span className="text-sm font-medium text-[#D99A4E]">
                                                    {thinkingMode.budget.toLocaleString()} tokens
                                                </span>
                                            </div>
                                            {thinkingMode.budget === 0 && (
                                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                                    Thinking is disabled when budget is set to 0
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Reasoning Tips */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/5 to-[#BFB38F]/5 p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <Brain className="mt-0.5 h-5 w-5 text-[#D99A4E]" />
                                        <div>
                                            <h4 className="mb-2 font-medium text-[#BFB38F]">
                                                Reasoning Mode Tips
                                            </h4>
                                            <ul className="space-y-1 text-sm text-[#BFB38F]/70">
                                                <li>
                                                    • Higher budgets allow more detailed reasoning
                                                    but use more tokens
                                                </li>
                                                <li>
                                                    • Reasoning is most effective for complex
                                                    analytical tasks
                                                </li>
                                                <li>
                                                    • Some models show redacted content for
                                                    sensitive reasoning steps
                                                </li>
                                                <li>
                                                    • Reasoning content is rendered with full
                                                    markdown support
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
