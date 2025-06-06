'use client';
import { DotSpinner } from '@repo/common/components';
import { useChatModeAccess } from '@repo/common/hooks/use-chat-mode-access';
import { useApiKeysStore, useChatStore, useCreditsStore } from '@repo/common/store';
import { CHAT_MODE_CREDIT_COSTS, ChatMode, ChatModeConfig } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    Kbd,
} from '@repo/ui';
import {
    IconArrowUp,
    IconAtom,
    IconChevronDown,
    IconNorthStar,
    IconPaperclip,
    IconPlayerStopFilled,
    IconWorld,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { BYOKIcon, NewIcon } from '../icons';

export const chatOptions = [
    {
        label: 'Deep Research',
        description: 'In depth research on complex topic',
        value: ChatMode.Deep,
        icon: <IconAtom size={16} className="text-muted-foreground" strokeWidth={2} />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Deep],
    },
    {
        label: 'Pro Search',
        description: 'Pro search with web search',
        value: ChatMode.Pro,
        icon: <IconNorthStar size={16} className="text-muted-foreground" strokeWidth={2} />,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.Pro],
    },
];

export const modelOptions = [
    {
        label: 'GPT 4.1',
        value: ChatMode.GPT_4_1,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4_1],
    },
    {
        label: 'GPT 4o',
        value: ChatMode.GPT_4o,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4o],
    },
    {
        label: 'GPT 4.1 Mini',
        value: ChatMode.GPT_4_1_Mini,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4_1_Mini],
    },
    {
        label: 'GPT 4.1 Nano',
        value: ChatMode.GPT_4_1_Nano,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4_1_Nano],
    },
    {
        label: 'GPT 4o Mini',
        value: ChatMode.GPT_4o_Mini,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GPT_4o_Mini],
    },
    {
        label: 'o4 mini',
        value: ChatMode.O4_Mini,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.O4_Mini],
    },
    {
        label: 'Gemini 2.0 Flash',
        value: ChatMode.GEMINI_2_0_FLASH,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GEMINI_2_0_FLASH],
    },
    {
        label: 'Gemini 2.5 Pro',
        value: ChatMode.GEMINI_2_5_PRO,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.GEMINI_2_5_PRO],
    },
    {
        label: 'Claude 4 Sonnet',
        value: ChatMode.CLAUDE_4_SONNET,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.CLAUDE_4_SONNET],
    },
    {
        label: 'Claude 4 Opus',
        value: ChatMode.CLAUDE_4_OPUS,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.CLAUDE_4_OPUS],
    },
    {
        label: 'Deepseek R1',
        value: ChatMode.DEEPSEEK_R1,
        webSearch: true,
        icon: undefined,
        creditCost: CHAT_MODE_CREDIT_COSTS[ChatMode.DEEPSEEK_R1],
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
            <IconPaperclip size={18} strokeWidth={2} className="text-muted-foreground" />
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

    const selectedOption =
        (isChatPage
            ? [...chatOptions, ...modelOptions].find(option => option.value === chatMode)
            : [...modelOptions].find(option => option.value === chatMode)) ?? modelOptions[0];

    const currentModeConfig = ChatModeConfig[chatMode];
    const isCurrentModeGated = !!(
        currentModeConfig?.requiredFeature || currentModeConfig?.requiredPlan
    );

    const handleGatedFeature = (gateInfo: {
        feature?: string;
        plan?: string;
        title: string;
        message: string;
    }) => {
        setShowGateAlert(gateInfo);
        setIsChatModeOpen(false); // Close the dropdown
    };

    const dropdownTrigger = (
        <Button variant={'secondary'} size="xs">
            {selectedOption?.icon}
            {selectedOption?.label}
            <IconChevronDown size={14} strokeWidth={2} />
        </Button>
    );

    return (
        <>
            <DropdownMenu open={isChatModeOpen} onOpenChange={setIsChatModeOpen}>
                <DropdownMenuTrigger asChild>
                    {isCurrentModeGated ? (
                        <Button variant={'secondary'} size="xs" className="opacity-70">
                            {selectedOption?.icon}
                            {selectedOption?.label} (VT+)
                            <IconChevronDown size={14} strokeWidth={2} />
                        </Button>
                    ) : (
                        dropdownTrigger
                    )}
                </DropdownMenuTrigger>
                <ChatModeOptions
                    chatMode={chatMode}
                    setChatMode={setChatMode}
                    onGatedFeature={handleGatedFeature}
                />
            </DropdownMenu>

            {/* Gated Feature Alert Modal */}
            <AlertDialog
                open={!!showGateAlert}
                onOpenChange={open => !open && setShowGateAlert(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{showGateAlert?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{showGateAlert?.message}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowGateAlert(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => push('/plus')}>
                            Upgrade Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export const WebSearchButton = () => {
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const setUseWebSearch = useChatStore(state => state.setUseWebSearch);
    const chatMode = useChatStore(state => state.chatMode);
    const hasApiKeyForChatMode = useApiKeysStore(state => state.hasApiKeyForChatMode);

    if (!ChatModeConfig[chatMode]?.webSearch && !hasApiKeyForChatMode(chatMode)) return null;

    return (
        <Button
            size={useWebSearch ? 'sm' : 'icon-sm'}
            tooltip="Web Search"
            variant={useWebSearch ? 'secondary' : 'ghost'}
            className={cn('gap-2', useWebSearch && 'bg-blue-500/10 text-blue-500')}
            onClick={() => setUseWebSearch(!useWebSearch)}
        >
            <IconWorld
                size={16}
                strokeWidth={2}
                className={cn(useWebSearch ? '!text-blue-500' : 'text-muted-foreground')}
            />
            {useWebSearch && <p className="text-xs">Web</p>}
        </Button>
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
    const { checkAccess, getCreditCost } = useChatModeAccess();
    const { balance: userCredits } = useCreditsStore();

    const handleModeSelect = (mode: ChatMode) => {
        const config = ChatModeConfig[mode];
        const option = [...chatOptions, ...modelOptions].find(opt => opt.value === mode);

        // Check auth requirement first
        if (config?.isAuthRequired && !isSignedIn) {
            push('/login');
            return;
        }

        // Check unified access (subscription + credits)
        const access = checkAccess(mode);

        // Allow if free, subscription, or affordable credits
        if (access.canAccess) {
            // If using credits, show a confirmation if it's a high-cost mode
            if (access.accessType === 'credits' && access.creditCost >= 5) {
                // For expensive modes, confirm the user wants to spend credits
                onGatedFeature({
                    title: `Confirm Credit Usage`,
                    message: `This will use ${access.creditCost} credits. You have ${userCredits} credits remaining. Continue?`,
                    feature: 'credit-confirmation', // Using a feature flag instead
                });
                return;
            }

            // Otherwise proceed with the mode change
            setChatMode(mode);
            return;
        }

        // Access denied - show appropriate message
        onGatedFeature({
            feature:
                access.requiredFeature ||
                (access.creditCost > 0 ? `credit-cost-${access.creditCost}` : undefined),
            plan: access.requiredPlan,
            title: `${option?.label} requires ${access.accessType === 'blocked' && access.reason?.includes('credits') ? 'credits' : 'upgrade'}`,
            message:
                access.reason ||
                `${option?.label} is a premium feature. Upgrade or purchase credits to access.`,
        });
        return;

        setChatMode(mode);
    };

    return (
        <DropdownMenuContent
            align="start"
            side="bottom"
            className="no-scrollbar max-h-[300px] w-[300px] overflow-y-auto"
        >
            {isChatPage && (
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Advanced Mode</DropdownMenuLabel>
                    {chatOptions.map(option => {
                        const config = ChatModeConfig[option.value];
                        const isGated = !!(config?.requiredFeature || config?.requiredPlan);

                        return (
                            <DropdownMenuItem
                                key={option.label}
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
            )}
            <DropdownMenuGroup>
                <DropdownMenuLabel>Models</DropdownMenuLabel>
                {modelOptions.map(option => {
                    const config = ChatModeConfig[option.value];
                    const isGated = !!(config?.requiredFeature || config?.requiredPlan);

                    return (
                        <DropdownMenuItem
                            key={option.label}
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
                                {hasApiKeyForChatMode(option.value) && <BYOKIcon />}
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
                            <IconPlayerStopFilled size={14} strokeWidth={2} />
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
                            <IconArrowUp size={16} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
