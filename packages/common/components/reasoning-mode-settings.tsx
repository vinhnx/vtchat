'use client';

import { REASONING_BUDGETS } from '@repo/ai/constants/reasoning';
import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore, useAppStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Button, Label, Slider, Switch, TypographyH3, TypographyH4 } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { useMemo } from 'react';

export const ReasoningModeSettings = () => {
    const thinkingMode = useAppStore(state => state.thinkingMode);
    const setThinkingMode = useAppStore(state => state.setThinkingMode);
    const chatMode = useChatStore(state => state.chatMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);

    // Check if current model supports reasoning
    const supportsReasoning = useMemo(() => {
        const reasoningModels = [
            // Gemini models with thinking support
            ChatMode.GEMINI_2_5_FLASH,
            ChatMode.GEMINI_2_5_FLASH_LITE,
            ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20,
            ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06,
            ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05,
            // DeepSeek reasoning models
            ChatMode.DEEPSEEK_R1_MAIN,
            ChatMode.DEEPSEEK_R1_FREE,
            ChatMode.DEEPSEEK_R1_0528_FREE,
            // Anthropic reasoning models
            ChatMode.CLAUDE_4_SONNET,
            ChatMode.CLAUDE_4_OPUS,
            ChatMode.CLAUDE_3_7_SONNET,
            // OpenAI o-series models
            ChatMode.O4_Mini,
            ChatMode.O3_Mini,
            ChatMode.O1_MINI,
            ChatMode.O1_PREVIEW,
        ];
        return reasoningModels.some(model => chatMode.includes(model.replace(/-/g, '_')));
    }, [chatMode]);

    const handleToggleEnabled = (enabled: boolean) => {
        setThinkingMode({
            enabled,
        });
    };

    const handleToggleIncludeThoughts = (includeThoughts: boolean) => {
        setThinkingMode({
            includeThoughts,
        });
    };

    const handleBudgetChange = (budget: number[]) => {
        setThinkingMode({
            budget: budget[0],
        });
    };

    if (!hasThinkingModeAccess) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 p-3">
                        <Sparkles className="h-6 w-6 text-[#D99A4E]" />
                    </div>
                    <div>
                        <TypographyH3 className="text-lg font-semibold text-[#BFB38F]">
                            Reasoning Mode
                        </TypographyH3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Advanced AI reasoning and thinking capabilities
                        </p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                >
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-fit rounded-full bg-[#D99A4E]/10 p-4">
                            <Brain className="h-8 w-8 text-[#D99A4E]" />
                        </div>
                        <div>
                            <TypographyH4 className="mb-2 font-semibold text-[#BFB38F]">
                                VT+ Required
                            </TypographyH4>
                            <p className="mb-4 text-sm text-[#BFB38F]/70">
                                Reasoning Mode reveals the AI's step-by-step thinking process before
                                generating responses. This advanced feature requires a VT+
                                subscription.
                            </p>
                            <Button className="bg-[#BFB38F] hover:bg-[#BFB38F]/90 font-medium text-black border border-[#262626]">
                                Upgrade to VT+
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 p-3"
                >
                    <Sparkles className="h-6 w-6 text-[#D99A4E]" />
                </motion.div>
                <div>
                    <TypographyH3 className="text-lg font-semibold text-[#BFB38F]">
                        Reasoning Mode
                    </TypographyH3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configure AI reasoning and thinking capabilities
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Enable Reasoning Mode */}
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Label
                                    htmlFor="reasoning-enabled"
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
                            id="reasoning-enabled"
                            checked={thinkingMode.enabled}
                            onCheckedChange={handleToggleEnabled}
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
                            {/* Include Reasoning Details */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label
                                            htmlFor="include-thoughts"
                                            className="text-base font-medium text-[#BFB38F]"
                                        >
                                            Show Reasoning Details
                                        </Label>
                                        <p className="text-sm text-[#BFB38F]/70">
                                            Display the AI's step-by-step reasoning in responses
                                        </p>
                                    </div>
                                    <Switch
                                        id="include-thoughts"
                                        checked={thinkingMode.includeThoughts}
                                        onCheckedChange={handleToggleIncludeThoughts}
                                        className="data-[state=checked]:bg-[#D99A4E]"
                                    />
                                </div>
                            </motion.div>

                            {/* Reasoning Budget */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            htmlFor="reasoning-budget"
                                            className="text-base font-medium text-[#BFB38F]"
                                        >
                                            Reasoning Budget: {thinkingMode.budget.toLocaleString()}{' '}
                                            tokens
                                        </Label>
                                        <p className="mt-1 text-sm text-[#BFB38F]/70">
                                            Control how much the AI can reason (higher = more
                                            thorough reasoning)
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <Slider
                                            id="reasoning-budget"
                                            min={REASONING_BUDGETS.QUICK}
                                            max={REASONING_BUDGETS.DEEP}
                                            step={1000}
                                            value={[thinkingMode.budget]}
                                            onValueChange={handleBudgetChange}
                                            className="[&_.bg-primary]:bg-[#D99A4E] [&_[role=slider]]:border-[#D99A4E] [&_[role=slider]]:bg-[#D99A4E]"
                                        />
                                        <div className="flex justify-between text-xs text-[#BFB38F]/60">
                                            <span>Quick ({REASONING_BUDGETS.QUICK / 1000}K)</span>
                                            <span>
                                                Balanced ({REASONING_BUDGETS.BALANCED / 1000}K)
                                            </span>
                                            <span>Deep ({REASONING_BUDGETS.DEEP / 1000}K)</span>
                                        </div>
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
                                        <TypographyH4 className="mb-2 font-medium text-[#BFB38F]">
                                            Reasoning Mode Tips
                                        </TypographyH4>
                                        <ul className="space-y-1 text-sm text-[#BFB38F]/70">
                                            <li>
                                                • Higher budgets allow more detailed reasoning but
                                                use more tokens
                                            </li>
                                            <li>
                                                • Reasoning is most effective for complex analytical
                                                tasks
                                            </li>
                                            <li>
                                                • Some models show redacted content for sensitive
                                                reasoning steps
                                            </li>
                                            <li>
                                                • Reasoning content is rendered with full markdown
                                                support
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
    );
};
