'use client';
import { DotSpinner } from '@repo/common/components';
import { useSubscriptionAccess, useWebSearch as useWebSearchHook } from '@repo/common/hooks';
import { useApiKeysStore, useChatStore } from '@repo/common/store';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug, PlanSlug } from '@repo/shared/types/subscription';
import {
    Button,
    cn,
    Dialog,
    DialogContent,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Kbd,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Atom, ChevronDown, Globe, Paperclip, Square, Star } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BYOKIcon, NewIcon } from '../icons';

// Create a wrapper component for Globe to match expected icon prop type
const WorldIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <Globe size={size} className={className} />;

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        icon: <Atom size={16} className="text-muted-foreground" strokeWidth={2} />,
    },
    {
        label: 'Pro Search',
        description: 'Enhanced web search with Gemini grounding',
        value: ChatMode.Pro,
        icon: <Star size={16} className="text-muted-foreground" strokeWidth={2} />,
    },
];

export const modelOptions = [
    {
        label: 'GPT 4o Mini',
        value: ChatMode.GPT_4o_Mini,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'GPT 4.1 Nano',
        value: ChatMode.GPT_4_1_Nano,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'GPT 4.1 Mini',
        value: ChatMode.GPT_4_1_Mini,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'GPT 4.1',
        value: ChatMode.GPT_4_1,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'GPT 4o',
        value: ChatMode.GPT_4o,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'o4 mini',
        value: ChatMode.O4_Mini,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Gemini 2.0 Flash',
        value: ChatMode.GEMINI_2_0_FLASH,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Gemini 2.0 Flash Lite',
        value: ChatMode.GEMINI_2_0_FLASH_LITE,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Gemini 2.5 Flash Preview',
        value: ChatMode.GEMINI_2_5_FLASH_PREVIEW,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Gemini 2.5 Pro',
        value: ChatMode.GEMINI_2_5_PRO,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Gemini 2.5 Pro Preview',
        value: ChatMode.GEMINI_2_5_PRO_PREVIEW,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Claude 4 Sonnet',
        value: ChatMode.CLAUDE_4_SONNET,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'Claude 4 Opus',
        value: ChatMode.CLAUDE_4_OPUS,
        webSearch: true,
        icon: undefined,
    },
    {
        label: 'DeepSeek R1',
        value: ChatMode.DEEPSEEK_R1,
        webSearch: true,
        icon: undefined,
    },
];

export const AttachmentButton = () => {
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
};

export const ChatModeButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const setChatMode = useChatStore(state => state.setChatMode);
    const [isChatModeOpen, setIsChatModeOpen] = useState(false);
    const isChatPage = usePathname().startsWith('/chat');
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
};

export const WebSearchButton = () => {
    const { useWebSearch, setUseWebSearch, webSearchType, supportsNativeSearch } =
        useWebSearchHook();
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { canAccess } = useSubscriptionAccess();

    // Hide web search button if chat mode doesn't support it and no API key
    if (!ChatModeConfig[chatMode]?.webSearch && !hasApiKeyForChatMode(chatMode, isSignedIn))
        return null;

    // Hide web search button for non-subscribers to simplify workflow
    if (!isSignedIn || !canAccess(FeatureSlug.PRO_SEARCH)) {
        return null;
    }

    const handleWebSearchToggle = () => {
        // Since we already filtered out non-subscribers, simply toggle web search
        setUseWebSearch(!useWebSearch);
    };

    return (
        <>
            <Button
                size={useWebSearch ? 'sm' : 'icon-sm'}
                tooltip={
                    useWebSearch
                        ? webSearchType === 'native'
                            ? 'Grounding Web Search - by Gemini (Native)'
                            : webSearchType === 'unsupported'
                              ? 'Grounding Web Search - by Gemini (models only)'
                              : 'Grounding Web Search - by Gemini'
                        : 'Grounding Web Search - by Gemini'
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
};

export const NewLineIndicator = () => {
    const editor = useChatStore(state => state.editor);
    const hasTextInput = !!editor?.getText();

    if (!hasTextInput) return null;

    return (
        <p className="flex flex-row items-center gap-1 text-xs text-gray-500">
            use <Kbd>Shift</Kbd> <Kbd>Enter</Kbd> for new line
        </p>
    );
};

export const GeneratingStatus = () => {
    return (
        <div className="text-muted-foreground flex flex-row items-center gap-1 px-2 text-xs">
            <DotSpinner /> Generating...
        </div>
    );
};

export const ChatModeOptions = ({
    chatMode,
    setChatMode,
    onGatedFeature,
    isRetry = false,
}: {
    chatMode: ChatMode;
    setChatMode: (chatMode: ChatMode) => void;
    onGatedFeature: (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => void;
    isRetry?: boolean;
}) => {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);
    const isChatPage = usePathname().startsWith('/chat');
    const { push } = useRouter();

    // Use the unified subscription system
    const { hasAccess, isLoaded } = useSubscriptionAccess();

    const handleModeSelect = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];
        const option = [...chatOptions, ...modelOptions].find(opt => opt.value === mode);

        // Check if user is signed in for any model selection
        if (!isSignedIn) {
            onGatedFeature({
                title: 'Login Required',
                message: 'Please log in to select and use different AI models.',
            });
            return;
        }

        // Check auth requirement
        if (config?.isAuthRequired && !isSignedIn) {
            push('/login');
            return;
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
                    title: `${option?.label} requires upgrade`,
                    message: `${option?.label} is a premium feature. Upgrade to VT+ to access advanced AI models and features.`,
                });
                return;
            }
        }

        // Otherwise proceed with the mode change
        setChatMode(mode);
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
                {modelOptions.map(option => {
                    const isGated = isModeGated(option.value);
                    const config = ChatModeConfig[option.value];

                    return (
                        <DropdownMenuItem
                            key={`model-${option.value}`}
                            onSelect={() => handleModeSelect(option.value)}
                            className={cn('h-auto', isGated && 'opacity-80')}
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
                                {config?.isNew && <NewIcon />}
                                {hasApiKeyForChatMode(option.value, isSignedIn) && <BYOKIcon />}
                            </div>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuGroup>
        </DropdownMenuContent>
    );
};

export const SendStopButton = ({
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
}) => {
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
};
