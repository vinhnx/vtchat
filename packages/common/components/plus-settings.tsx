'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { THINKING_MODE } from '@repo/shared/constants';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Alert, AlertDescription, Badge, Label, Slider, Switch } from '@repo/ui';
import { Brain, Crown, Info, Sparkles } from 'lucide-react';

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

            {/* Thinking Mode Settings */}
            <div className="space-y-4">
                <h4 className="flex items-center gap-2 font-medium">
                    <Brain size={16} className="text-purple-500" />
                    Reasoning Mode
                    <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                        Multi-Model
                    </Badge>
                </h4>

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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="thinking-mode-enabled" className="text-base">
                                Enable Reasoning Mode
                            </Label>
                            <p className="text-muted-foreground text-sm">
                                Allow Gemini models to use their reasoning capabilities
                            </p>
                        </div>
                        <Switch
                            id="thinking-mode-enabled"
                            checked={thinkingMode.enabled}
                            onCheckedChange={setThinkingModeEnabled}
                        />
                    </div>

                    {/* Include Thoughts in Responses */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <Label htmlFor="thinking-mode-include-thoughts" className="text-base">
                                Show Reasoning Process
                            </Label>
                            <p className="text-muted-foreground text-sm">
                                Display the AI's thought process in chat responses
                            </p>
                        </div>
                        <Switch
                            id="thinking-mode-include-thoughts"
                            checked={thinkingMode.includeThoughts}
                            onCheckedChange={setThinkingModeIncludeThoughts}
                            disabled={!thinkingMode.enabled}
                        />
                    </div>

                    {/* Thinking Budget Slider */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Label className="text-base">Reasoning Budget</Label>
                            <p className="text-muted-foreground text-sm">
                                Maximum tokens the AI can use for reasoning (0 = disabled)
                            </p>
                        </div>
                        <div className="space-y-4">
                            <Slider
                                value={[thinkingMode.budget]}
                                onValueChange={value =>
                                    setThinkingMode({
                                        enabled: value[0] > 0 ? true : thinkingMode.enabled,
                                        budget: value[0],
                                        includeThoughts: thinkingMode.includeThoughts,
                                    })
                                }
                                max={THINKING_MODE.MAX_BUDGET}
                                min={THINKING_MODE.MIN_BUDGET}
                                step={256}
                                disabled={!thinkingMode.enabled}
                                className="w-full"
                            />
                            <div className="text-muted-foreground flex justify-between text-xs">
                                <span>0 (Disabled)</span>
                                <span className="font-medium">{thinkingMode.budget} tokens</span>
                                <span>{THINKING_MODE.MAX_BUDGET} (Max)</span>
                            </div>
                            {thinkingMode.budget === 0 && (
                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                    Thinking is disabled when budget is set to 0
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
