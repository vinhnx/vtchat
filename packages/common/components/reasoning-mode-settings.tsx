'use client';

import { REASONING_BUDGETS } from '@repo/ai/constants/reasoning';
import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useAppStore, useChatStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { FeatureSlug } from '@repo/shared/types/subscription';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    Label,
    Slider,
    Switch,
    TypographyH3,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
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

            // DeepSeek reasoning models
            ChatMode.DEEPSEEK_R1,
            ChatMode.DEEPSEEK_R1,
            // Anthropic reasoning models
            ChatMode.CLAUDE_4_SONNET,
            ChatMode.CLAUDE_4_OPUS,
            // OpenAI o-series models
            ChatMode.O4_Mini,
            ChatMode.O3_Mini,
            ChatMode.O1_MINI,
            ChatMode.O1,
        ];
        return reasoningModels.some((model) => chatMode.includes(model.replace(/-/g, '_')));
    }, [chatMode]);

    const handleToggleEnabled = (enabled: boolean) => {
        setThinkingMode({
            enabled,
        });
    };

    const handleMaxDepthChange = (value: number[]) => {
        setThinkingMode({
            maxDepth: value[0],
        });
    };

    const handleBudgetChange = (value: number[]) => {
        setThinkingMode({
            budget: value[0],
        });
    };

    // Check for access
    if (!hasThinkingModeAccess) {
        return (
            <Card>
                <CardHeader>
                    <TypographyH3 className="text-foreground">Reasoning Mode</TypographyH3>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <div className="mx-auto w-fit rounded-full bg-muted p-4">
                            <div className="h-8 w-8 bg-foreground rounded" />
                        </div>
                        <p className="mt-3 text-base font-medium text-foreground">VT+ Feature</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Advanced reasoning capabilities for complex problem-solving. Available
                            exclusively for VT+ subscribers.
                        </p>
                        <Button
                            className="mt-4"
                            size="sm"
                            onClick={() => {
                                window.location.href = '/plus';
                            }}
                        >
                            Upgrade to VT+
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Main toggle section */}
            <Card>
                <CardHeader>
                    <TypographyH3 className="text-foreground">Reasoning Mode</TypographyH3>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-medium text-foreground">
                                Enable Reasoning
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Show detailed thinking process when analyzing complex problems
                            </p>
                        </div>
                        <Switch
                            checked={thinkingMode.enabled}
                            onCheckedChange={handleToggleEnabled}
                        />
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence>
                {thinkingMode.enabled && (
                    <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        initial={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-6">
                                    {/* Max Depth Setting */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-medium text-foreground">
                                                Reasoning Depth
                                            </Label>
                                            <span className="text-sm text-muted-foreground">
                                                {thinkingMode.maxDepth} steps
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Controls how deeply the AI reasons through problems
                                        </p>
                                        <Slider
                                            className="w-full"
                                            max={10}
                                            min={1}
                                            onValueChange={handleMaxDepthChange}
                                            step={1}
                                            value={[thinkingMode.maxDepth]}
                                        />
                                    </div>

                                    {/* Budget Setting */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-base font-medium text-foreground">
                                                Thinking Budget
                                            </Label>
                                            <span className="text-sm text-muted-foreground">
                                                {REASONING_BUDGETS[thinkingMode.budget]?.label ||
                                                    'Custom'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Balances response speed vs thinking thoroughness
                                        </p>
                                        <Slider
                                            className="w-full"
                                            max={Object.keys(REASONING_BUDGETS).length - 1}
                                            min={0}
                                            onValueChange={handleBudgetChange}
                                            step={1}
                                            value={[thinkingMode.budget]}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
