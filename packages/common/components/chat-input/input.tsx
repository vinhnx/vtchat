'use client';
import {
    BYOKValidationDialog,
    ImageAttachment,
    ImageDropzoneRoot,
    InlineLoader,
    ShineText,
} from '@repo/common/components';
import { useDocumentAttachment, useImageAttachment } from '@repo/common/hooks';
import { useApiKeysStore } from '@repo/common/store';
import { ChatModeConfig, STORAGE_KEYS, supportsMultiModal } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { cn, Flex } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { useAgentStream } from '../../hooks/agent-provider';
import { useChatEditor } from '../../hooks/use-editor';
import { useChatStore } from '../../store';
import { ExamplePrompts } from '../example-prompts';
import { LoginRequiredDialog } from '../login-required-dialog';
import { UserTierBadge } from '../user-tier-badge';

import { StructuredDataDisplay } from '../structured-data-display';
import {
    ChartsButton,
    ChatModeButton,
    GeneratingStatus,
    MathCalculatorButton,
    SendStopButton,
    WebSearchButton,
} from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ChatFooter } from './chat-footer';
import { DocumentAttachment } from './document-attachment';
import { DocumentUploadButton } from './document-upload-button';
import { ImageUpload } from './image-upload';
import { MultiModalAttachmentButton } from './multi-modal-attachment-button';
import { MultiModalAttachmentsDisplay } from './multi-modal-attachments-display';
import { StructuredOutputButton } from './structured-output-button';
import { logger } from '@repo/shared/logger';

export const ChatInput = ({
    showGreeting = true,
    showBottomBar = true,
    isFollowUp = false,
}: {
    showGreeting?: boolean;
    showBottomBar?: boolean;
    isFollowUp?: boolean;
}) => {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showBYOKDialog, setShowBYOKDialog] = useState(false);
    const [pendingMessage, setPendingMessage] = useState<(() => void) | null>(null);
    const router = useRouter(); // Use the full router object for clarity

    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor({
        placeholder: isFollowUp ? 'Ask follow up' : 'Ask anything',
        onInit: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp && !isSignedIn) {
                const draftMessage = window.localStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE);
                if (draftMessage) {
                    editor.commands.setContent(draftMessage, true, { preserveWhitespace: true });
                }
            }
            // Removed automatic login prompt on focus - users should be able to type without being forced to login
            // Login will be prompted only when they try to send a message
        },
        onUpdate: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp) {
                window.localStorage.setItem(STORAGE_KEYS.DRAFT_MESSAGE, editor.getText());
            }
        },
    });
    const size = currentThreadId ? 'base' : 'sm';
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const threadItemsLength = useChatStore(useShallow(state => state.threadItems.length));
    const { handleSubmit } = useAgentStream();
    const createThread = useChatStore(state => state.createThread);
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const useMathCalculator = useChatStore(state => state.useMathCalculator);
    const useCharts = useChatStore(state => state.useCharts);

    const isGenerating = useChatStore(state => state.isGenerating);
    const isChatPage = usePathname().startsWith('/chat');
    const imageAttachment = useChatStore(state => state.imageAttachment);
    const documentAttachment = useChatStore(state => state.documentAttachment);
    const clearImageAttachment = useChatStore(state => state.clearImageAttachment);
    const clearDocumentAttachment = useChatStore(state => state.clearDocumentAttachment);
    const stopGeneration = useChatStore(state => state.stopGeneration);
    const hasTextInput = !!editor?.getText();
    const { dropzonProps, handleImageUpload } = useImageAttachment();
    const { dropzoneProps: docDropzoneProps } = useDocumentAttachment();
    // const { push } = useRouter(); // router is already defined above
    const chatMode = useChatStore(state => state.chatMode);
    const { hasApiKeyForChatMode } = useApiKeysStore();

    // Multi-modal attachments state
    const [multiModalAttachments, setMultiModalAttachments] = useState<
        Array<{
            url: string;
            name: string;
            contentType: string;
            size?: number;
        }>
    >([]);

    const removeMultiModalAttachment = (index: number) => {
        const newAttachments = multiModalAttachments.filter((_, i) => i !== index);
        setMultiModalAttachments(newAttachments);
    };

    const handleApiKeySet = () => {
        // Clear the pending message and execute the original send
        setPendingMessage(null);
        // Re-execute sendMessage after API key is set
        sendMessage();
    };

    const sendMessage = async () => {
        if (!isSignedIn) {
            // This specific check for chat mode auth requirement might be redundant
            // if the focus prompt already directs to login.
            // However, keeping it for cases where send is triggered programmatically or by other means.
            if (ChatModeConfig[chatMode as keyof typeof ChatModeConfig]?.isAuthRequired) {
                setShowLoginPrompt(true); // Show prompt instead of direct push
                return;
            }
            // For non-auth-required modes, if any, allow sending.
            // Or, if all interactions require login, this block can be simplified to:
            // if (!isSignedIn) { setShowLoginPrompt(true); return; }
        }

        if (!editor?.getText()) {
            return;
        }

        // Check if user has valid API key for the selected chat mode
        // This applies to all users (signed in or not) for modes that require API keys
        if (!hasApiKeyForChatMode(chatMode, isSignedIn)) {
            if (!isSignedIn) {
                // For non-signed in users, show login prompt first
                setShowLoginPrompt(true);
                return;
            } else {
                // For signed-in users, show BYOK dialog
                setPendingMessage(() => sendMessage);
                setShowBYOKDialog(true);
                return;
            }
        }

        let threadId = currentThreadId?.toString();

        if (!threadId) {
            const optimisticId = uuidv4();
            router.push(`/chat/${optimisticId}`); // use router.push
            createThread(optimisticId, {
                title: editor?.getText(),
            });
            threadId = optimisticId;
        }
        // Removed duplicated block and misplaced return

        // First submit the message
        const formData = new FormData();
        formData.append('query', editor.getText());
        imageAttachment?.base64 && formData.append('imageAttachment', imageAttachment?.base64);
        documentAttachment?.base64 &&
            formData.append('documentAttachment', documentAttachment?.base64);
        documentAttachment?.mimeType &&
            formData.append('documentMimeType', documentAttachment?.mimeType);
        documentAttachment?.fileName &&
            formData.append('documentFileName', documentAttachment?.fileName);

        // Add multi-modal attachments
        if (multiModalAttachments.length > 0) {
            formData.append('multiModalAttachments', JSON.stringify(multiModalAttachments));
        }

        const threadItems = currentThreadId ? await getThreadItems(currentThreadId.toString()) : [];

        logger.info('threadItems', { data: threadItems });

        logger.info('🚀 Sending to handleSubmit with flags:', {
            useWebSearch,
            useMathCalculator,
            useCharts,
        });
        handleSubmit({
            formData,
            newThreadId: threadId,
            messages: threadItems.sort(
                (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            ),
            useWebSearch,
            useMathCalculator,
            useCharts,
        });
        window.localStorage.removeItem(STORAGE_KEYS.DRAFT_MESSAGE);
        editor.commands.clearContent();
        clearImageAttachment();
        clearDocumentAttachment();
        setMultiModalAttachments([]);
    };

    const renderChatInput = () => (
        <AnimatePresence>
            <motion.div
                className="w-full px-1 md:px-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={`chat-input`}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Flex
                    direction="col"
                    className={cn(
                        'bg-background border-hard/50 shadow-subtle-sm relative z-10 w-full rounded-xl border'
                    )}
                >
                    <ImageDropzoneRoot dropzoneProps={dropzonProps}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.15 }}
                            className="flex w-full flex-shrink-0 overflow-hidden rounded-lg"
                        >
                            {editor?.isEditable ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.15, ease: 'easeOut' }}
                                    className="w-full"
                                >
                                    <div className="flex flex-col gap-2">
                                        <ImageAttachment />
                                        <DocumentAttachment />
                                        <StructuredDataDisplay />
                                        {multiModalAttachments.length > 0 && (
                                            <MultiModalAttachmentsDisplay
                                                attachments={multiModalAttachments}
                                                onRemove={removeMultiModalAttachment}
                                            />
                                        )}
                                    </div>
                                    <Flex className="flex w-full flex-row items-end gap-0">
                                        <ChatEditor
                                            sendMessage={sendMessage}
                                            editor={editor}
                                            className="px-3 pt-3"
                                        />
                                    </Flex>

                                    <Flex
                                    className="border-border w-full gap-2 border-t border-dashed px-2 py-2"
                                    gap="none"
                                    items="center"
                                    justify="between"
                                    >
                                        {isGenerating && !isChatPage ? (
                                            <GeneratingStatus />
                                        ) : (
                                            <Flex
                                            gap="xs"
                                            items="center"
                                            className="flex-1 flex-nowrap overflow-x-auto scrollbar-hide md:flex-wrap"
                                            >
                                                <ChatModeButton />

                                                {/* AI Enhancement Tools Group */}
                                                <div className="bg-border/50 mx-1 h-4 w-px" />
                                                <WebSearchButton />
                                                <MathCalculatorButton />
                                                <ChartsButton />

                                                {/* File Upload Tools Group */}
                                                <div className="bg-border/50 mx-1 h-4 w-px" />
                                                <DocumentUploadButton />
                                                {supportsMultiModal(chatMode) ? (
                                                    <MultiModalAttachmentButton
                                                        onAttachmentsChange={
                                                            setMultiModalAttachments
                                                        }
                                                        attachments={multiModalAttachments}
                                                        disabled={isGenerating}
                                                    />
                                                ) : (
                                                    <ImageUpload
                                                        id="image-attachment"
                                                        label="Image"
                                                        tooltip="Image Attachment"
                                                        showIcon={true}
                                                        handleImageUpload={handleImageUpload}
                                                    />
                                                )}

                                                {/* Data Processing Tools Group */}
                                                <div className="bg-border/50 mx-1 h-4 w-px" />
                                                <StructuredOutputButton />
                                            </Flex>
                                        )}

                                        <Flex gap="sm" items="center" className="flex-shrink-0 ml-auto">
                                            <SendStopButton
                                                isGenerating={isGenerating}
                                                isChatPage={isChatPage}
                                                stopGeneration={stopGeneration}
                                                hasTextInput={hasTextInput}
                                                sendMessage={sendMessage}
                                            />
                                        </Flex>
                                    </Flex>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="flex h-24 w-full items-center justify-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <InlineLoader />
                                </motion.div>
                            )}
                        </motion.div>
                    </ImageDropzoneRoot>
                </Flex>
            </motion.div>
        </AnimatePresence>
    );

    const renderChatBottom = () => (
        <>
            <Flex items="center" justify="center" gap="sm">
                {/* <ScrollToBottomButton /> */}
            </Flex>
            {renderChatInput()}
        </>
    );

    useEffect(() => {
        editor?.commands.focus('end');
    }, [currentThreadId]);

    return (
        <div
            className={cn(
                'bg-secondary w-full',
                currentThreadId
                    ? 'absolute bottom-0 pb-safe'
                    : 'absolute inset-0 flex h-full w-full flex-col items-center justify-center pb-safe'
            )}
        >
            <div
                className={cn(
                    'mx-auto flex w-full max-w-3xl flex-col items-start',
                    !threadItemsLength && 'justify-start',
                    size === 'sm' && 'px-8',
                    'px-2 md:px-0' // Reduced mobile padding for better space usage
                )}
            >
                <Flex
                    items="start"
                    justify="start"
                    direction="col"
                    className={cn('w-full pb-4 md:pb-4 pb-safe', threadItemsLength > 0 ? 'mb-0' : 'h-full')}
                >
                    {!currentThreadId && showGreeting && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="mb-2 flex w-full flex-col items-center gap-2"
                        >
                            <UserTierBadge showUpgradePrompt={true} />
                            <PersonalizedGreeting session={session} />
                        </motion.div>
                    )}

                    {renderChatBottom()}
                    {!currentThreadId && showGreeting && <ExamplePrompts />}

                    {/* Show simplified footer only if not logged in */}
                    {!session && <ChatFooter />}
                </Flex>
            </div>
            {showLoginPrompt && (
                <LoginRequiredDialog
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    title="Login Required"
                    description="Please log in to start chatting or save your conversation."
                />
            )}
            {showBYOKDialog && (
                <BYOKValidationDialog
                    isOpen={showBYOKDialog}
                    onClose={() => {
                        setShowBYOKDialog(false);
                        setPendingMessage(null);
                    }}
                    chatMode={chatMode}
                    onApiKeySet={handleApiKeySet}
                />
            )}
        </div>
    );
};

type PersonalizedGreetingProps = {
    session?: any;
};

const PersonalizedGreeting = ({ session }: PersonalizedGreetingProps) => {
    const [greeting, setGreeting] = React.useState<string>('');

    React.useEffect(() => {
        const getTimeBasedGreeting = () => {
            const hour = new Date().getHours();
            const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
            const userNamePart = userName ? `, ${userName}!` : '';

            if (hour >= 5 && hour < 12) {
                return `Good morning${userNamePart}`;
            } else if (hour >= 12 && hour < 18) {
                return `Good afternoon${userNamePart}`;
            } else {
                return `Good evening${userNamePart}`;
            }
        };

        setGreeting(getTimeBasedGreeting());

        // Update the greeting if the component is mounted during a time transition
        const interval = setInterval(() => {
            const newGreeting = getTimeBasedGreeting();
            if (newGreeting !== greeting) {
                setGreeting(newGreeting);
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [greeting, session]);

    return (
        <Flex
            direction="col"
            className="relative h-[100px] w-full items-center justify-center overflow-hidden"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={greeting}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{
                        duration: 0.8,
                        ease: 'easeInOut',
                    }}
                    className="text-center"
                >
                    <ShineText className="text-xl font-medium leading-relaxed tracking-tight sm:text-2xl md:text-3xl">
                        {greeting}
                    </ShineText>
                </motion.div>
            </AnimatePresence>
        </Flex>
    );
};
