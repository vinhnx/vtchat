'use client';

import {
    BYOKValidationDialog,
    ImageAttachment,
    ImageDropzoneRoot,
    InlineLoader,
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
import { DocumentAttachment } from './document-attachment';
import { DocumentUploadButton } from './document-upload-button';
import { ImageUpload } from './image-upload';
import { MultiModalAttachmentButton } from './multi-modal-attachment-button';
import { MultiModalAttachmentsDisplay } from './multi-modal-attachments-display';
import { StructuredOutputButton } from './structured-output-button';
import { Send, Sparkles, Mic, Paperclip, Zap } from 'lucide-react';

export const PremiumChatInput = ({
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
    const [inputFocused, setInputFocused] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);
    const router = useRouter();

    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor({
        placeholder: isFollowUp ? 'Ask a follow-up question...' : 'Type your message... ✨',
        onInit: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp && !isSignedIn) {
                const draftMessage = window.localStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE);
                if (draftMessage) {
                    editor.commands.setContent(draftMessage, true, { preserveWhitespace: true });
                }
            }
        },
        onUpdate: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp) {
                window.localStorage.setItem(STORAGE_KEYS.DRAFT_MESSAGE, editor.getText());
                setHasTyped(!!editor.getText().trim());
            }
        },
        onFocus: () => setInputFocused(true),
        onBlur: () => setInputFocused(false),
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
        setPendingMessage(null);
        sendMessage();
    };

    const sendMessage = async () => {
        if (!isSignedIn) {
            if (ChatModeConfig[chatMode as keyof typeof ChatModeConfig]?.isAuthRequired) {
                setShowLoginPrompt(true);
                return;
            }
        }

        if (!editor?.getText()) {
            return;
        }

        if (!hasApiKeyForChatMode(chatMode, isSignedIn)) {
            if (!isSignedIn) {
                setShowLoginPrompt(true);
                return;
            } else {
                setPendingMessage(() => sendMessage);
                setShowBYOKDialog(true);
                return;
            }
        }

        let threadId = currentThreadId?.toString();

        if (!threadId) {
            const optimisticId = uuidv4();
            router.push(`/chat/${optimisticId}`);
            createThread(optimisticId, {
                title: editor?.getText(),
            });
            threadId = optimisticId;
        }

        const formData = new FormData();
        formData.append('query', editor.getText());
        imageAttachment?.base64 && formData.append('imageAttachment', imageAttachment?.base64);
        documentAttachment?.base64 &&
            formData.append('documentAttachment', documentAttachment?.base64);
        documentAttachment?.mimeType &&
            formData.append('documentMimeType', documentAttachment?.mimeType);
        documentAttachment?.fileName &&
            formData.append('documentFileName', documentAttachment?.fileName);

        if (multiModalAttachments.length > 0) {
            formData.append('multiModalAttachments', JSON.stringify(multiModalAttachments));
        }

        const threadItems = currentThreadId ? await getThreadItems(currentThreadId.toString()) : [];

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
        setHasTyped(false);
    };

    const renderPremiumChatInput = () => (
        <AnimatePresence>
            <motion.div
                className="w-full px-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Enhanced input container with premium styling */}
                <motion.div
                    className={cn(
                        'relative z-10 w-full overflow-hidden transition-all duration-300',
                        'bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800',
                        'border border-gray-200 dark:border-gray-700',
                        'shadow-lg shadow-black/5 dark:shadow-black/20',
                        inputFocused 
                            ? 'ring-2 ring-blue-500/20 border-blue-300 dark:border-blue-600 shadow-xl scale-[1.01]' 
                            : 'hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-600',
                        'rounded-2xl'
                    )}
                    animate={{
                        scale: inputFocused ? 1.01 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <ImageDropzoneRoot dropzoneProps={dropzonProps}>
                        {editor?.isEditable ? (
                            <>
                                {/* Attachments Display */}
                                <AnimatePresence>
                                    {(imageAttachment || documentAttachment || multiModalAttachments.length > 0) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
                                        >
                                            <div className="p-3 space-y-2">
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
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Enhanced editor area */}
                                <div className="relative">
                                    {/* AI assistance indicator */}
                                    <AnimatePresence>
                                        {inputFocused && !hasTextInput && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-blue-500 pointer-events-none"
                                            >
                                                <Sparkles size={16} className="animate-pulse" />
                                                <span className="font-medium">AI is ready to help</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <ChatEditor
                                        sendMessage={sendMessage}
                                        editor={editor}
                                        className="px-4 py-4 min-h-[60px] text-base"
                                    />
                                </div>

                                {/* Enhanced toolbar */}
                                <motion.div
                                    className={cn(
                                        'border-t border-gray-200 dark:border-gray-700 px-3 py-3',
                                        'bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-900/50'
                                    )}
                                    layout
                                >
                                    <Flex
                                        className="w-full gap-2"
                                        items="center"
                                        justify="between"
                                    >
                                        {isGenerating && !isChatPage ? (
                                            <GeneratingStatus />
                                        ) : (
                                            <div className="flex items-center gap-1 overflow-x-auto">
                                                {/* Chat mode with premium indicator */}
                                                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                                    <Zap size={14} className="text-blue-500" />
                                                    <ChatModeButton />
                                                </div>

                                                {/* Tool buttons with enhanced styling */}
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                    <WebSearchButton />
                                                    <MathCalculatorButton />
                                                    <ChartsButton />
                                                </div>

                                                {/* File upload tools */}
                                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                                    <Paperclip size={14} className="text-green-500" />
                                                    <DocumentUploadButton />
                                                    {supportsMultiModal(chatMode) ? (
                                                        <MultiModalAttachmentButton
                                                            onAttachmentsChange={setMultiModalAttachments}
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
                                                </div>

                                                <StructuredOutputButton />
                                            </div>
                                        )}

                                        {/* Enhanced send button */}
                                        <motion.div
                                            animate={{
                                                scale: hasTextInput ? 1.05 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <SendStopButton
                                                isGenerating={isGenerating}
                                                isChatPage={isChatPage}
                                                stopGeneration={stopGeneration}
                                                hasTextInput={hasTextInput}
                                                sendMessage={sendMessage}
                                            />
                                        </motion.div>
                                    </Flex>
                                </motion.div>
                            </>
                        ) : (
                            <motion.div
                                className="flex h-24 w-full items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <InlineLoader />
                            </motion.div>
                        )}
                    </ImageDropzoneRoot>
                </motion.div>

                {/* Smart suggestions */}
                <AnimatePresence>
                    {inputFocused && !hasTextInput && !currentThreadId && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3"
                        >
                            {[
                                '✨ Explain a concept',
                                '📝 Write something',
                                '💡 Brainstorm ideas',
                                '🔍 Research topic',
                                '📊 Analyze data',
                                '🎨 Be creative'
                            ].map((suggestion, index) => (
                                <motion.button
                                    key={suggestion}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        editor?.commands.setContent(suggestion.split(' ').slice(1).join(' '));
                                        editor?.commands.focus();
                                    }}
                                    className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:scale-105"
                                >
                                    {suggestion}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );

    useEffect(() => {
        editor?.commands.focus('end');
    }, [currentThreadId]);

    return (
        <div
            className={cn(
                'bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-950 w-full',
                currentThreadId
                    ? 'absolute bottom-0'
                    : 'absolute inset-0 flex h-full w-full flex-col items-center justify-center'
            )}
        >
            <div
                className={cn(
                    'mx-auto flex w-full max-w-4xl flex-col items-start',
                    !threadItemsLength && 'justify-start',
                    size === 'sm' && 'px-8',
                    'px-4 md:px-6'
                )}
            >
                <Flex
                    items="start"
                    justify="start"
                    direction="col"
                    className={cn('w-full pb-6', threadItemsLength > 0 ? 'mb-0' : 'h-full')}
                >
                    {!currentThreadId && showGreeting && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="mb-8 flex w-full flex-col items-center gap-3"
                        >
                            <PremiumPersonalizedGreeting session={session} />
                        </motion.div>
                    )}

                    {renderPremiumChatInput()}
                    {!currentThreadId && showGreeting && <ExamplePrompts />}
                </Flex>
            </div>

            {/* Login and BYOK dialogs */}
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

const PremiumPersonalizedGreeting = ({ session }: { session?: any }) => {
    const [greeting, setGreeting] = React.useState<string>('');

    React.useEffect(() => {
        const getTimeBasedGreeting = () => {
            const hour = new Date().getHours();
            const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
            const userNamePart = userName ? `, ${userName}` : '';

            if (hour >= 5 && hour < 12) {
                return `Good morning${userNamePart}! ☀️`;
            } else if (hour >= 12 && hour < 18) {
                return `Good afternoon${userNamePart}! 🌤️`;
            } else {
                return `Good evening${userNamePart}! 🌙`;
            }
        };

        setGreeting(getTimeBasedGreeting());
    }, [session]);

    return (
        <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <motion.h2 
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3"
                animate={{ 
                    backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{ 
                    duration: 8,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            >
                {greeting}
            </motion.h2>
            <motion.p 
                className="text-gray-600 dark:text-gray-300 text-lg font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
            >
                How can I help you today? ✨
            </motion.p>
        </motion.div>
    );
};
