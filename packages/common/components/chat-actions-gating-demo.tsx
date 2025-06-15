'use client';

import { ChatMode } from '@repo/shared/config';
import { useState } from 'react';
import { ChatModeButton } from './chat-input/chat-actions';
import { GatedFeatureExamples } from './gated-feature-examples';

/**
 * Comprehensive demo showing the integrated gated features in chat actions
 */
export const ChatActionsGatingDemo = () => {
    const [chatMode, setChatMode] = useState(ChatMode.GEMINI_2_0_FLASH);

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-6">
            <div>
                <h1 className="mb-4 text-2xl font-bold">Chat Actions Gating Integration Demo</h1>
                <p className="text-muted-foreground">
                    This demo shows how the GatedFeatureAlert component has been integrated into the
                    chat mode selection system to provide subscription-based access control.
                </p>
            </div>

            {/* Chat Actions Integration */}
            <div className="space-y-6">
                <div>
                    <h2 className="mb-4 text-xl font-semibold">🚀 Integrated Chat Actions</h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        The chat mode selection now includes subscription gating for premium
                        features.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Chat Mode Button</h3>
                        <p className="text-muted-foreground mb-3 text-sm">
                            The current mode button shows visual indicators for gated features:
                        </p>
                        <div className="bg-muted/50 rounded-lg border p-4">
                            <ChatModeButton />
                        </div>
                        <ul className="text-muted-foreground space-y-1 text-xs">
                            <li>• Shows "(VT+)" suffix for premium modes</li>
                            <li>• Reduced opacity indicates gated status</li>
                            <li>• No intrusive alerts for current selection</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Mode Selection Dropdown</h3>
                        <p className="text-muted-foreground mb-3 text-sm">
                            Each gated option shows upgrade prompts when clicked:
                        </p>
                        <div className="bg-muted/50 rounded-lg border p-4">
                            <div className="inline-block">
                                <select
                                    value={chatMode}
                                    onChange={e => setChatMode(e.target.value as ChatMode)}
                                    className="rounded border px-3 py-2 text-sm"
                                >
                                    <option value={ChatMode.GEMINI_2_0_FLASH}>
                                        Gemini 2.0 Flash
                                    </option>
                                    <option value={ChatMode.CLAUDE_4_SONNET}>
                                        Claude 4 Sonnet (VT+)
                                    </option>
                                    <option value={ChatMode.Deep}>
                                        Grounding Web Search (VT+)
                                    </option>
                                    <option value={ChatMode.Pro}>Grounding Web Search (VT+)</option>
                                </select>
                            </div>
                        </div>
                        <ul className="text-muted-foreground space-y-1 text-xs">
                            <li>• Gated options trigger upgrade alerts</li>
                            <li>• Custom messages for each feature</li>
                            <li>• Integrates with existing auth flow</li>
                        </ul>
                    </div>
                </div>

                {/* Feature Mapping */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">🔒 Gated Features Mapping</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-3 text-sm font-medium">Advanced Chat Modes</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Grounding Web Search</span>
                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                        VT+ Required
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-3 text-sm font-medium">Premium Models</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Claude 4 Sonnet</span>
                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                        VT+ Required
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>DeepSeek R1</span>
                                    <span className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                        VT+ Required
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Implementation Details */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium">⚙️ Implementation Features</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 text-sm font-medium">Smart Detection</h4>
                            <p className="text-muted-foreground text-xs">
                                Automatically detects gated features from ChatModeConfig
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 text-sm font-medium">Custom Messages</h4>
                            <p className="text-muted-foreground text-xs">
                                Feature-specific upgrade prompts with context
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-2 text-sm font-medium">Non-Intrusive</h4>
                            <p className="text-muted-foreground text-xs">
                                Visual indicators without blocking user experience
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Original Examples */}
            <div className="border-t pt-8">
                <h2 className="mb-4 text-xl font-semibold">
                    📚 Original GatedFeatureAlert Examples
                </h2>
                <p className="text-muted-foreground mb-6 text-sm">
                    These are the original examples showing the component's versatility:
                </p>
                <GatedFeatureExamples />
            </div>
        </div>
    );
};
