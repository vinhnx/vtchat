'use client';

import React, { useState } from 'react';
import {
    getModelFromChatMode,
    ModelEnum,
    supportsReasoning,
    supportsTools,
    supportsWebSearch,
} from '@repo/ai/models';
import { RateLimitIndicator } from '@repo/common/components';
import { type ApiKeys, useApiKeysStore } from '@repo/common/store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
// Types imported by useChatModeAccess
import {
    Badge,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
} from '@repo/ui';
import { Brain, Globe, Wrench } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { chatOptions, modelOptions, modelOptionsByProvider } from '../../chat-config';
import { useLoginPrompt } from '../../hooks/useLoginPrompt';
import { useSubscriptionAccess } from '@repo/common/hooks';
import { LoginRequiredDialog } from '../../../login-required-dialog';
import { BYOKSetupModal } from '../../modals/BYOKSetupModal';
import { getIconByName } from '../../config/icons';

interface ChatModeOptionsProps {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
    onGatedFeature: (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => void;
}

export function ChatModeOptions({
    chatMode: _chatMode,
    setChatMode,
    onGatedFeature,
}: ChatModeOptionsProps) {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const apiKeys = useApiKeysStore((state) => state.getAllKeys());
    const { push } = useRouter();
    const { showLoginPrompt, setShowLoginPrompt } = useLoginPrompt();
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    // Helper function to check if a mode is gated (replaces useChatModeAccess hook logic)
    const isModeGated = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];

        // If not loaded, show as gated to prevent unauthorized access
        if (!isLoaded) {
            return true;
        }

        // If no requirements, not gated
        if (!(config?.requiredFeature || config?.requiredPlan)) {
            return false;
        }

        // CRITICAL: Special handling for Deep Research and Pro Search
        if (mode === ChatMode.Deep || mode === ChatMode.Pro) {
            // Check BYOK bypass first for these specific modes
            const hasByokGeminiKey = !!apiKeys['GEMINI_API_KEY'];
            if (hasByokGeminiKey) {
                return false; // Not gated if user has BYOK Gemini key
            }

            // For Deep Research and Pro Search, user MUST have VT+ subscription
            const hasVtPlusAccess = hasAccess({ plan: 'VT_PLUS' as any });
            const hasFeatureAccess =
                mode === ChatMode.Deep
                    ? hasAccess({ feature: 'DEEP_RESEARCH' as any })
                    : hasAccess({ feature: 'PRO_SEARCH' as any });

            return !(hasVtPlusAccess && hasFeatureAccess);
        }

        // For other modes, use regular logic
        let hasRequiredAccess = true;

        if (config.requiredFeature) {
            hasRequiredAccess = hasAccess({
                feature: config.requiredFeature as any,
            });
        }

        if (config.requiredPlan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: config.requiredPlan as any });
        }

        return !hasRequiredAccess;
    };

    // BYOK modal state
    const [byokModalOpen, setBYOKModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<{
        mode: ChatMode;
        requiredApiKey: keyof ApiKeys;
        modelName: string;
    } | null>(null);

    const handleModeSelect = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];
        const option = [...chatOptions, ...modelOptions].find((opt) => opt.value === mode);
        const modelOption = modelOptions.find((opt) => opt.value === mode);

        // Check if user is signed in for any model selection
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        // Check auth requirement
        if (config?.isAuthRequired && !isSignedIn) {
            push('/login');
            return;
        }

        // BYOK Check: For both chat options and model options, check if required API key exists
        const requiredApiKey = modelOption?.requiredApiKey || (option as any)?.requiredApiKey;
        if (requiredApiKey) {
            const hasRequiredApiKey = !!apiKeys[requiredApiKey];

            if (!hasRequiredApiKey) {
                // Store the pending mode selection and open BYOK modal
                setPendingMode({
                    mode,
                    requiredApiKey,
                    modelName: option?.label || 'this model',
                });
                setBYOKModalOpen(true);
                return;
            }
        }

        // Use the centralized gating logic
        const isGated = isModeGated(mode);

        if (isGated) {
            const config = ChatModeConfig[mode];
            onGatedFeature({
                feature: config?.requiredFeature,
                plan: config?.requiredPlan,
                title: `${option?.label}`,
                message: `${option?.label} is a premium feature. Upgrade to VT+ to access advanced AI models and features.`,
            });
            return;
        }

        // Otherwise proceed with the mode change
        setChatMode(mode);
    };

    const handleBYOKSaved = () => {
        // After API key is saved, retry the mode selection
        if (pendingMode) {
            setChatMode(pendingMode.mode);
            setPendingMode(null);
        }
    };

    const handleBYOKClose = () => {
        setBYOKModalOpen(false);
        setPendingMode(null);
    };

    const handleDropdownSelect = (mode: ChatMode) => {
        // Just proceed with normal selection - access check is handled in handleModeSelect
        handleModeSelect(mode);
    };

    return (
        <>
            <DropdownMenuContent
                align="start"
                className="no-scrollbar max-h-[300px] w-[320px] touch-pan-y overflow-y-auto overscroll-contain md:w-[300px]"
                side="bottom"
            >
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Advanced Mode</DropdownMenuLabel>
                    {chatOptions.map((option) => {
                        return (
                            <DropdownMenuItem
                                className="h-auto"
                                key={`advanced-${option.value}`}
                                onSelect={() => handleDropdownSelect(option.value)}
                            >
                                <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                                    <div className="flex flex-col gap-0 pt-1">
                                        {'iconName' in option
                                            ? getIconByName(option.iconName as string)
                                            : option.icon}
                                    </div>
                                    <div className="flex flex-col gap-0">
                                        <div className="flex items-center gap-2">
                                            <p className="m-0 text-sm font-medium">
                                                {option.label}
                                            </p>
                                            {(option.value === ChatMode.Deep ||
                                                option.value === ChatMode.Pro) && (
                                                <Badge
                                                    className="bg-[#BFB38F]/20 px-1.5 py-0.5 text-[10px] text-[#D99A4E]"
                                                    variant="secondary"
                                                >
                                                    VT+
                                                </Badge>
                                            )}
                                        </div>
                                        {option.description && (
                                            <p className="text-muted-foreground text-xs font-light">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1" />
                                    {supportsReasoning(getModelFromChatMode(option.value)) && (
                                        <Brain
                                            className="text-purple-500"
                                            size={14}
                                            title="Reasoning Model"
                                        />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        );
                    })}
                </DropdownMenuGroup>
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Models</DropdownMenuLabel>
                    {Object.entries(modelOptionsByProvider).map(([providerName, options]) => (
                        <div key={providerName}>
                            <DropdownMenuLabel className="text-muted-foreground py-1 pl-2 text-xs font-normal">
                                {providerName}
                            </DropdownMenuLabel>
                            {options.map((option) => {
                                const isFreeModel = option.value === ChatMode.GEMINI_2_5_FLASH_LITE;

                                return (
                                    <DropdownMenuItem
                                        className="h-auto pl-4"
                                        key={`model-${option.value}`}
                                        onSelect={() => handleDropdownSelect(option.value)}
                                    >
                                        <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                                            <div className="flex flex-col gap-0">
                                                <p className="text-sm font-medium">
                                                    {option.label}
                                                </p>
                                                {isFreeModel && (option as any).description && (
                                                    <p className="text-muted-foreground text-xs">
                                                        {(option as any).description}
                                                    </p>
                                                )}
                                                {isFreeModel && isSignedIn && (
                                                    <RateLimitIndicator
                                                        className="mt-1"
                                                        compact
                                                        modelId={ModelEnum.GEMINI_2_5_FLASH_LITE}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1" />
                                            <div className="flex items-center gap-1">
                                                {/* Model capability indicators */}
                                                {(() => {
                                                    const model = getModelFromChatMode(
                                                        option.value
                                                    );
                                                    if (!model) return null;

                                                    return (
                                                        <>
                                                            {supportsTools(model) && (
                                                                <Wrench
                                                                    className="text-gray-500"
                                                                    size={12}
                                                                    title="Supports Tools"
                                                                />
                                                            )}
                                                            {supportsReasoning(model) && (
                                                                <Brain
                                                                    className="text-purple-500"
                                                                    size={12}
                                                                    title="Reasoning Model"
                                                                />
                                                            )}
                                                            {supportsWebSearch(model) && (
                                                                <Globe
                                                                    className="text-blue-500"
                                                                    size={12}
                                                                    title="Web Search"
                                                                />
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                                {/* Original icon (free/gift) */}
                                                {option.icon && (
                                                    <div className="flex items-center">
                                                        {option.icon}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>

            {/* BYOK Setup Modal */}
            {pendingMode && (
                <BYOKSetupModal
                    isOpen={byokModalOpen}
                    modelName={pendingMode.modelName}
                    onApiKeySaved={handleBYOKSaved}
                    onClose={handleBYOKClose}
                    requiredApiKey={pendingMode.requiredApiKey}
                />
            )}

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                description="Please log in to select and use different AI models."
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
            />
        </>
    );
}
