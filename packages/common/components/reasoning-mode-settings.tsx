'use client';

import { REASONING_BUDGETS } from '@repo/ai/constants/reasoning';
import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useAppStore, useChatStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Button, Label, Slider, Switch, TypographyH3, TypographyH4 } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { useMemo } from 'react';

export const ReasoningModeSettings = () => {
    const thinkingMode = useAppStore((state) => state.thinkingMode);
    const setThinkingMode = useAppStore((state) => state.setThinkingMode);
    const chatMode = useChatStore((state) => state.chatMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);

    // Check if current model supports reasoning
    const _supportsReasoning = useMemo(() => {
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
        return reasoningModels.some((model) => chatMode.includes(model.replace(/-/g, '_')));
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
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                >
                    <div className="space-y-4 text-center">
                        <div className="mx-auto w-fit rounded-full bg-[#D99A4E]/10 p-4">
                            <Brain className="h-8 w-8 text-[#D99A4E]" />
                        </div>
                        <div>
                            <TypographyH4 className="mb-2 font-semibold text-blue-600">
                                Sign In Required
                            </TypographyH4>
                            <p className="mb-4 text-sm text-blue-600/70">
                                Reasoning Mode reveals the AI's step-by-step thinking process before
                                generating responses. This advanced feature is available to all
                                registered users.
                            </p>
                            <Button className="bg-blue-600 font-medium text-white hover:bg-blue-600/90">
                                Sign In
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
                    className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 p-3"
                    whileHover={{ scale: 1.05 }}
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
                    className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                    whileHover={{ scale: 1.01 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Label
                                    className="text-base font-medium text-[#BFB38F]"
                                    htmlFor="reasoning-enabled"
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
                            checked={thinkingMode.enabled}
                            className="data-[state=checked]:bg-[#D99A4E]"
                            id="reasoning-enabled"
                            onCheckedChange={handleToggleEnabled}
                        />
                    </div>
                </motion.div>

                <AnimatePresence>
                    {thinkingMode.enabled && (
                        <motion.div
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                            exit={{ opacity: 0, y: 20 }}
                            initial={{ opacity: 0, y: 20 }}
                        >
                            {/* Include Reasoning Details */}
                            <motion.div
                                className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label
                                            className="text-base font-medium text-[#BFB38F]"
                                            htmlFor="include-thoughts"
                                        >
                                            Show Reasoning Details
                                        </Label>
                                        <p className="text-sm text-[#BFB38F]/70">
                                            Display the AI's step-by-step reasoning in responses
                                        </p>
                                    </div>
                                    <Switch
                                        checked={thinkingMode.includeThoughts}
                                        className="data-[state=checked]:bg-[#D99A4E]"
                                        id="include-thoughts"
                                        onCheckedChange={handleToggleIncludeThoughts}
                                    />
                                </div>
                            </motion.div>

                            {/* Reasoning Budget */}
                            <motion.div
                                className="rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 p-6 backdrop-blur-sm"
                                whileHover={{ scale: 1.01 }}
                            >
                                <div className="space-y-4">
                                    <div>
                                        <Label
                                            className="text-base font-medium text-[#BFB38F]"
                                            htmlFor="reasoning-budget"
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
                                            className="[&_.bg-primary]:bg-[#D99A4E] [&_[role=slider]]:border-[#D99A4E] [&_[role=slider]]:bg-[#D99A4E]"
                                            id="reasoning-budget"
                                            max={REASONING_BUDGETS.DEEP}
                                            min={REASONING_BUDGETS.QUICK}
                                            onValueChange={handleBudgetChange}
                                            step={1000}
                                            value={[thinkingMode.budget]}
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
                                animate={{ opacity: 1 }}
                                className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/5 to-[#BFB38F]/5 p-6"
                                initial={{ opacity: 0 }}
                                transition={{ delay: 0.3 }}
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
