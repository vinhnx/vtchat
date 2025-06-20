'use client';

import { DotSpinner } from '@repo/common/components';
import {
    useMathCalculator,
    useSubscriptionAccess,
    useWebSearch as useWebSearchHook,
} from '@repo/common/hooks';
import { useApiKeysStore, useChatStore, type ApiKeys } from '@repo/common/store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    cn,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Input,
    Kbd,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Calculator, ChevronDown, Globe, Paperclip, Square } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BYOKIcon, NewIcon } from '../icons';
import { LoginRequiredDialog } from '../login-required-dialog';
import { chatOptions, modelOptions, modelOptionsByProvider } from './chat-config';

export function AttachmentButton() {
    return (
        <Button
            size="icon"
            tooltip="Attachment (coming soon)"
            variant="ghost"
            className="gap-2"
            rounded="full"
            disabled
        >
            <Paperclip size={18} strokeWidth={2} className="text-muted-foreground" />
        </Button>
    );
}

export function ChatModeButton() {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const { push } = useRouter();
    const [showGateAlert, setShowGateAlert] = useState<{
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    } | null>(null);

    // Use the unified subscription system
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    const selectedOption =
        [...chatOptions, ...modelOptions].find(option => option.value === chatMode) ??
        modelOptions[0];

    const currentModeConfig = ChatModeConfig[chatMode];

    // Check if current mode is gated using the unified system
    const isCurrentModeGated = (() => {
        if (!isLoaded) return false; // Don't show as gated while loading

        if (!currentModeConfig?.requiredFeature && !currentModeConfig?.requiredPlan) {
            return false; // Not gated if no requirements
        }

        let hasRequiredAccess = true;

        if (currentModeConfig.requiredFeature) {
            hasRequiredAccess = hasAccess({
                feature: currentModeConfig.requiredFeature as FeatureSlug,
            });
        }

        if (currentModeConfig.requiredPlan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: currentModeConfig.requiredPlan as PlanSlug });
        }

        return !hasRequiredAccess;
    })();

    const handleGatedFeature = (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => {
        setShowGateAlert(gateInfo);
        setIsChatModeOpen(false); // Close the dropdown
    };

    return (
        <>
            <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
                <DropdownMenuTrigger asChild>
                    {isCurrentModeGated ? (
                        <Button variant={'secondary'} size="xs" className="opacity-70">
                            {selectedOption?.icon}
                            {selectedOption?.label} (VT+)
                            <ChevronDown size={14} strokeWidth={2} />
                        </Button>
                    ) : (
                        <Button variant={'secondary'} size="xs">
                            {selectedOption?.icon}
                            {selectedOption?.label}
                            <ChevronDown size={14} strokeWidth={2} />
                        </Button>
                    )}
                </DropdownMenuTrigger>
                <ChatModeOptions
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    onGatedFeature={handleGatedFeature}
                />
            </DropdownMenu>

            {/* Gated Feature Alert Modal */}
            <Dialog open={!!showGateAlert} onOpenChange={open => !open && setShowGateAlert(null)}>
                <DialogContent
                    ariaTitle={showGateAlert?.title || 'Upgrade Required'}
                    className="max-w-md rounded-xl"
                >
                    <div className="flex flex-col items-center gap-4 p-6 text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                            <ArrowUp size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">{showGateAlert?.title}</h3>
                            <p className="text-muted-foreground text-sm">
                                {showGateAlert?.message}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outlined" onClick={() => setShowGateAlert(null)}>
                                Cancel
                            </Button>
                            <Button onClick={() => push('/plus')}>Upgrade Now</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function WebSearchButton() {
    const { useWebSearch, webSearchType } = useWebSearchHook();
    const chatMode = useChatStore(state => state.chatMode);
    const setActiveButton = useChatStore(state => state.setActiveButton);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { canAccess } = useSubscriptionAccess();

    // Hide web search button if chat mode doesn't support it (like Deep Research and Pro Search)
    if (!ChatModeConfig[chatMode]?.webSearch) {
        return null;
    }

    // Hide web search button if no API key is available for this chat mode
    if (!hasApiKeyForChatMode(chatMode, isSignedIn)) {
        return null;
    }

    // Hide web search button for non-subscribers to simplify workflow
    if (!isSignedIn || !canAccess(FeatureSlug.PRO_SEARCH)) {
        return null;
    }

    const handleWebSearchToggle = () => {
        setActiveButton('webSearch');
    };

    return (
        <>
            <Button
                size={useWebSearch ? 'sm' : 'icon-sm'}
                tooltip={
                    useWebSearch
                    ? webSearchType === 'native'
                    ? 'Web Search - by Gemini (Native)'
                    : webSearchType === 'unsupported'
                    ? 'Web Search - by Gemini (models only)'
                    : 'Web Search - by Gemini'
                    : 'Web Search - by Gemini'
                }
                variant={useWebSearch ? 'secondary' : 'ghost'}
                className={cn('gap-2', useWebSearch && 'bg-blue-500/10 text-blue-500')}
                onClick={handleWebSearchToggle}
            >
                <Globe
                    size={16}
                    strokeWidth={2}
                    className={cn(useWebSearch ? '!text-blue-500' : 'text-muted-foreground')}
                />
                {useWebSearch && (
                    <p className="text-xs">
                        {webSearchType === 'native'
                            ? 'Web Search (Native)'
                            : webSearchType === 'unsupported'
                              ? 'N/A'
                              : 'Web Search'}
                    </p>
                )}
            </Button>
        </>
    );
}

export function MathCalculatorButton() {
    const { useMathCalculator: mathCalculatorEnabled } = useMathCalculator();
    const setActiveButton = useChatStore(state => state.setActiveButton);

    // Always show math calculator for all users (including free users)
    const handleMathCalculatorToggle = () => {
        setActiveButton('mathCalculator');
    };

    return (
        <>
            <Button
                size={mathCalculatorEnabled ? 'sm' : 'icon-sm'}
                tooltip={mathCalculatorEnabled ? 'Math Calculator - Enabled' : 'Math Calculator'}
                variant={mathCalculatorEnabled ? 'secondary' : 'ghost'}
                className={cn('gap-2', mathCalculatorEnabled && 'bg-green-500/10 text-green-500')}
                onClick={handleMathCalculatorToggle}
            >
                <Calculator
                    size={16}
                    strokeWidth={2}
                    className={cn(
                        mathCalculatorEnabled ? '!text-green-500' : 'text-muted-foreground'
                    )}
                />
                {mathCalculatorEnabled && <p className="text-xs">Math Calculator</p>}
            </Button>
        </>
    );
}

export function NewLineIndicator() {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
}

export function GeneratingStatus() {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-1 px-2 text-xs">
            <DotSpinner /> Generating...
        </div>
    );
}

// BYOK Setup Modal Component
export function BYOKSetupModal({
    isOpen,
    onClose,
    requiredApiKey,
    modelName,
    onApiKeySaved,
}: {
    isOpen: boolean;
    onClose: () => void;
    requiredApiKey: keyof ApiKeys;
    modelName: string;
    onApiKeySaved: () => void;
}) {
    const setApiKey = useApiKeysStore(state => state.setKey);
    const getAllKeys = useApiKeysStore(state => state.getAllKeys);
    const [apiKeyValue, setApiKeyValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const getProviderInfo = (key: keyof ApiKeys) => {
        switch (key) {
            case 'OPENAI_API_KEY':
                return {
                    name: 'OpenAI',
                    url: 'https://platform.openai.com/api-keys',
                    placeholder: 'sk-...',
                };
            case 'ANTHROPIC_API_KEY':
                return {
                    name: 'Anthropic',
                    url: 'https://console.anthropic.com/settings/keys',
                    placeholder: 'sk-ant-...',
                };
            case 'GEMINI_API_KEY':
                return {
                    name: 'Google Gemini',
                    url: 'https://ai.google.dev/api',
                    placeholder: 'AIza...',
                };
            case 'FIREWORKS_API_KEY':
                return {
                    name: 'Fireworks AI',
                    url: 'https://app.fireworks.ai/settings/users/api-keys',
                    placeholder: 'fw-...',
                };
            case 'XAI_API_KEY':
                return {
                    name: 'xAI Grok',
                    url: 'https://x.ai/api',
                    placeholder: 'xai-...',
                };
            case 'OPENROUTER_API_KEY':
                return {
                    name: 'OpenRouter',
                    url: 'https://openrouter.ai/keys',
                    placeholder: 'sk-or-...',
                };
            default:
                return {
                    name: 'API Provider',
                    url: '#',
                    placeholder: 'Enter API key...',
                };
        }
    };

    const provider = getProviderInfo(requiredApiKey);

    const handleSave = async () => {
        if (!apiKeyValue.trim()) return;

        setIsSaving(true);
        try {
            console.log(`[BYOK Modal] Saving API key for ${requiredApiKey}...`);

            // Save the API key
            setApiKey(requiredApiKey, apiKeyValue.trim());

            // Verify the key was saved by checking storage immediately
            setTimeout(() => {
                const savedKeys = getAllKeys();
                if (savedKeys[requiredApiKey] === apiKeyValue.trim()) {
                    console.log(`[BYOK Modal] API key for ${requiredApiKey} verified as saved`);
                } else {
                    console.error(`[BYOK Modal] API key verification failed for ${requiredApiKey}`);
                }
            }, 100);

            setApiKeyValue('');
            onApiKeySaved();
            onClose();
        } catch (error) {
            console.error('Failed to save API key:', error);
            // Show error to user
            alert('Failed to save API key. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        setApiKeyValue('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md rounded-xl" ariaTitle="Setup API Key Required">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BYOKIcon />
                        Setup API Key Required
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-6">
                    <div className="space-y-2">
                        <p className="text-muted-foreground text-sm">
                            To use <span className="font-medium">{modelName}</span>, you need to
                            provide your own {provider.name} API key.
                        </p>
                        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/20">
                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                Your API key is stored locally and never sent to our servers.
                            </p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">{provider.name} API Key</label>
                            <Input
                                type="password"
                                placeholder={provider.placeholder}
                                value={apiKeyValue}
                                onChange={e => setApiKeyValue(e.target.value)}
                                className="font-mono"
                            />
                        </div>
                        <a
                            href={provider.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-blue-500 underline-offset-2 hover:text-blue-600 hover:underline"
                        >
                            Get {provider.name} API key →
                        </a>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outlined" onClick={handleClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!apiKeyValue.trim() || isSaving}
                            className="flex-1"
                        >
                            {isSaving ? 'Saving...' : 'Save & Continue'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ChatModeOptions({
    setChatMode,
    onGatedFeature,
    _isRetry = false,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
    onGatedFeature: (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => void;
    _isRetry?: boolean;
}) {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const apiKeys = useApiKeysStore(state => state.getAllKeys());
    const _isChatPage = usePathname().startsWith('/chat');
    const { push } = useRouter();

    // Login prompt state
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // BYOK modal state
    const [byokModalOpen, setBYOKModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState<{
        mode: ChatMode;
        requiredApiKey: keyof ApiKeys;
        modelName: string;
    } | null>(null);

    // Use the unified subscription system
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    const handleModeSelect = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];
        const option = [...chatOptions, ...modelOptions].find(opt => opt.value === mode);
        const modelOption = modelOptions.find(opt => opt.value === mode);

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

        // BYOK Check: For model options, check if required API key exists
        if (modelOption?.requiredApiKey) {
            const hasRequiredApiKey = !!apiKeys[modelOption.requiredApiKey];

            if (!hasRequiredApiKey) {
                // Store the pending mode selection and open BYOK modal
                setPendingMode({
                    mode,
                    requiredApiKey: modelOption.requiredApiKey,
                    modelName: option?.label || 'this model',
                });
                setBYOKModalOpen(true);
                return;
            }
        }

        // Check subscription requirements using the unified system
        if (config?.requiredFeature || config?.requiredPlan) {
            // Wait for subscription status to load
            if (!isLoaded) {
                return; // Don't allow selection while loading
            }

            let hasRequiredAccess = true;

            // Check feature access
            if (config.requiredFeature) {
                hasRequiredAccess = hasAccess({ feature: config.requiredFeature as FeatureSlug });
            }

            // Check plan access
            if (config.requiredPlan && hasRequiredAccess) {
                hasRequiredAccess = hasAccess({ plan: config.requiredPlan as PlanSlug });
            }

            // If user doesn't have access, show gated feature dialog
            if (!hasRequiredAccess) {
                onGatedFeature({
                    feature: config.requiredFeature,
                    plan: config.requiredPlan,
                    title: `${option?.label}`,
                    message: `${option?.label} is a premium feature. Upgrade to VT+ to access advanced AI models and features.`,
                });
                return;
            }
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

    // Helper function to check if a mode is gated
    const isModeGated = (mode: ChatMode): boolean => {
        if (!isLoaded) return false; // Don't show as gated while loading

        const config = ChatModeConfig[mode];
        if (!config?.requiredFeature && !config?.requiredPlan) {
            return false; // Not gated if no requirements
        }

        let hasRequiredAccess = true;

        if (config.requiredFeature) {
            hasRequiredAccess = hasAccess({ feature: config.requiredFeature as FeatureSlug });
        }

        if (config.requiredPlan && hasRequiredAccess) {
            hasRequiredAccess = hasAccess({ plan: config.requiredPlan as PlanSlug });
        }

        return !hasRequiredAccess;
    };

    return (
        <>
            <DropdownMenuContent
                align="start"
                side="bottom"
                className="no-scrollbar max-h-[300px] w-[300px] overflow-y-auto"
            >
                {/* Always show Advanced Mode options regardless of page context */}
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Advanced Mode</DropdownMenuLabel>
                    {chatOptions.map(option => {
                        const isGated = isModeGated(option.value);
                        const config = ChatModeConfig[option.value];

                        return (
                            <DropdownMenuItem
                                key={`advanced-${option.value}`}
                                onSelect={() => handleModeSelect(option.value)}
                                className={cn('h-auto', isGated && 'opacity-80')}
                            >
                                <div className="flex w-full flex-row items-start gap-1.5 px-1.5 py-1.5">
                                    <div className="flex flex-col gap-0 pt-1">{option.icon}</div>
                                    <div className="flex flex-col gap-0">
                                        <p className="m-0 text-sm font-medium">
                                            {option.label}
                                            {isGated && (
                                                <span className="ml-1 text-xs text-blue-600">
                                                    (VT+)
                                                </span>
                                            )}
                                        </p>
                                        {option.description && (
                                            <p className="text-muted-foreground text-xs font-light">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex-1" />
                                    {config?.isNew && <NewIcon />}
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
                            {options.map(option => {
                                const isGated = isModeGated(option.value);
                                const config = ChatModeConfig[option.value];

                                return (
                                    <DropdownMenuItem
                                        key={`model-${option.value}`}
                                        onSelect={() => handleModeSelect(option.value)}
                                        className={cn('h-auto pl-4', isGated && 'opacity-80')}
                                    >
                                        <div className="flex w-full flex-row items-center gap-2.5 px-1.5 py-1.5">
                                            <div className="flex flex-col gap-0">
                                                <p className="text-sm font-medium">
                                                    {option.label}
                                                    {isGated && (
                                                        <span className="ml-1 text-xs text-blue-600">
                                                            (VT+)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex-1" />
                                            {option.icon && (
                                                <div className="flex items-center">
                                                    {option.icon}
                                                </div>
                                            )}
                                            {config?.isNew && <NewIcon />}
                                            {hasApiKeyForChatMode(option.value, isSignedIn) && (
                                                <BYOKIcon />
                                            )}
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
                    onClose={handleBYOKClose}
                    requiredApiKey={pendingMode.requiredApiKey}
                    modelName={pendingMode.modelName}
                    onApiKeySaved={handleBYOKSaved}
                />
            )}

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to select and use different AI models."
            />
        </>
    );
}

export function SendStopButton({
    isGenerating,
    isChatPage,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: {
    isGenerating: boolean;
    isChatPage: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}) {
    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence mode="wait" initial={false}>
                {isGenerating && !isChatPage ? (
                    <motion.div
                        key="stop-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            variant="default"
                            onClick={stopGeneration}
                            tooltip="Stop Generation"
                        >
                            <Square size={14} strokeWidth={2} />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="send-button"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            size="icon-sm"
                            tooltip="Send Message"
                            variant={hasTextInput ? 'default' : 'secondary'}
                            disabled={!hasTextInput || isGenerating}
                            onClick={() => {
                                sendMessage();
                            }}
                        >
                            <ArrowUp size={16} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
