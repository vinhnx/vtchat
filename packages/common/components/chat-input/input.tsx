'use client';
import { BYOKValidationDialog, ImageDropzoneRoot, InlineLoader } from '@repo/common/components';
import { useDocumentAttachment, useImageAttachment } from '@repo/common/hooks';
import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useApiKeysStore, useAppStore } from '@repo/common/store';
import { isGeminiModel } from '@repo/common/utils';
import { ChatModeConfig, STORAGE_KEYS, supportsMultiModal } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { http } from '@repo/shared/lib/http-client';
import { generateThreadId } from '@repo/shared/lib/thread-id';
import { log } from '@repo/shared/logger';
import { resizeImageDataUrl } from '@repo/shared/utils';
import { hasImageAttachments, validateByokForImageAnalysis } from '@repo/shared/utils';
import { cn, Flex, useToast } from '@repo/ui';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useShallow } from 'zustand/react/shallow';
import { useAgentStream } from '../../hooks/agent-provider';
import { useChatEditor } from '../../hooks/use-editor';
import { useChatStore } from '../../store';
import { ExamplePrompts } from '../example-prompts';
import { LMStudioSetupBanner } from '../lm-studio-setup-banner';
import { LoginRequiredDialog } from '../login-required-dialog';
import { OllamaSetupBanner } from '../ollama-setup-banner';
import { PersonalizedGreeting } from '../personalized-greeting';
import { StructuredDataDisplay } from '../structured-data-display';
import { UserTierBadge } from '../user-tier-badge';
import {
    ChartsButton,
    ChatModeButton,
    GeneratingStatus,
    ImageGenButton,
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

export const ChatInput = ({
    showGreeting = true,
    isFollowUp = false,
}: {
    showGreeting?: boolean;
    isFollowUp?: boolean;
}) => {
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const isPlusTier = useVtPlusAccess();
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showBYOKDialog, setShowBYOKDialog] = useState(false);
    const { toast } = useToast();
    const [_pendingMessage, setPendingMessage] = useState<(() => void) | null>(null);
    const router = useRouter(); // Use the full router object for clarity

    // Add flag to prevent multiple rapid sendMessage calls
    const [isSending, setIsSending] = useState(false);

    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor({
        placeholder: isFollowUp ? 'Ask follow up' : 'Ask anything',
        onInit: ({ editor }) => {
            if (typeof window !== 'undefined' && !isFollowUp && !isSignedIn) {
                const draftMessage = window.localStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE);
                if (draftMessage) {
                    editor.commands.setContent(draftMessage, true);
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
    const getThreadItems = useChatStore((state) => state.getThreadItems);
    const threadItemsLength = useChatStore(useShallow((state) => state.threadItems.length));
    const { handleSubmit } = useAgentStream();
    const createThread = useChatStore((state) => state.createThread);
    const useWebSearch = useChatStore((state) => state.useWebSearch);
    const useMathCalculator = useChatStore((state) => state.useMathCalculator);
    const useCharts = useChatStore((state) => state.useCharts);

    const isGenerating = useChatStore((state) => state.isGenerating);
    const setIsGenerating = useChatStore((state) => state.setIsGenerating);
    const pathname = usePathname();
    const isChatPage = pathname.startsWith('/chat/');
    const imageAttachment = useChatStore((state) => state.imageAttachment);
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const clearImageAttachment = useChatStore((state) => state.clearImageAttachment);

    const stopGeneration = useChatStore((state) => state.stopGeneration);
    const hasTextInput = !!editor?.getText();
    const { handleImageUpload } = useImageAttachment();
    useDocumentAttachment();
    // const { push } = useRouter(); // router is already defined above
    const chatMode = useChatStore((state) => state.chatMode);
    const { hasApiKeyForChatMode, getAllKeys } = useApiKeysStore();

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
        const removed = multiModalAttachments[index];
        const newAttachments = multiModalAttachments.filter((_, i) => i !== index);
        setMultiModalAttachments(newAttachments);
        // If removed the same as preview, clear preview
        if (removed && removed.url === imageAttachment?.base64) {
            clearImageAttachment();
        }
    };

    // Image prompt tips banner state (dismissable)
    const globalShowImageTips = useAppStore((s) => s.showImageTips);
    const [showImageTips, setShowImageTips] = useState<boolean>(() => {
        if (typeof window === 'undefined') return globalShowImageTips;
        const dismissed = window.localStorage.getItem(STORAGE_KEYS.IMAGE_TIPS_DISMISSED);
        return globalShowImageTips && !dismissed;
    });
    // Collapse/expand state for the image tips per-thread
    const [isImageTipsCollapsed, setIsImageTipsCollapsed] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEYS.IMAGE_TIPS_STATE);
            if (!raw) return false;
            const map = JSON.parse(raw || '{}') as Record<string, 'collapsed' | 'expanded'>;
            const key = String(
                (typeof currentThreadId === 'string'
                    ? currentThreadId
                    : currentThreadId?.toString()) || 'home',
            );
            return map[key] === 'collapsed';
        } catch {
            return false;
        }
    });
    const persistImageTipsState = (collapsed: boolean) => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEYS.IMAGE_TIPS_STATE);
            const map = raw ? (JSON.parse(raw) as Record<string, 'collapsed' | 'expanded'>) : {};
            const key = String(
                (typeof currentThreadId === 'string'
                    ? currentThreadId
                    : currentThreadId?.toString()) || 'home',
            );
            map[key] = collapsed ? 'collapsed' : 'expanded';
            window.localStorage.setItem(STORAGE_KEYS.IMAGE_TIPS_STATE, JSON.stringify(map));
        } catch {}
    };
    const dismissImageTips = () => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(STORAGE_KEYS.IMAGE_TIPS_DISMISSED, '1');
        }
        setShowImageTips(false);
    };

    // React to global settings changes: enabling should re-show (clear dismissal), disabling hides
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (globalShowImageTips) {
            // Clear dismissal and show banner again
            window.localStorage.removeItem(STORAGE_KEYS.IMAGE_TIPS_DISMISSED);
            setShowImageTips(true);
        } else {
            setShowImageTips(false);
        }
    }, [globalShowImageTips]);

    // Keep collapse state synced when switching threads
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const raw = window.localStorage.getItem(STORAGE_KEYS.IMAGE_TIPS_STATE);
            const map = raw ? (JSON.parse(raw) as Record<string, 'collapsed' | 'expanded'>) : {};
            const key = String(
                (typeof currentThreadId === 'string'
                    ? currentThreadId
                    : currentThreadId?.toString()) || 'home',
            );
            setIsImageTipsCollapsed(map[key] === 'collapsed');
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentThreadId]);

    const handleApiKeySet = () => {
        // Clear the pending message and execute the original send
        setPendingMessage(null);
        // Re-execute sendMessage after API key is set
        sendMessage();
    };

    // Removed mirror effect: attachments are the single source of truth

    // If attachments exist but preview is empty, use first image for preview
    useEffect(() => {
        if (imageAttachment?.base64) return;
        const firstImage = multiModalAttachments.find((a) => a.contentType.startsWith('image/'));
        if (firstImage?.url) {
            useChatStore.getState().setImageAttachment({ base64: firstImage.url });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [multiModalAttachments.length]);

    const sendMessage = async () => {
        const messageText = editor?.getText();
        log.info('📤 sendMessage called', {
            messageText: messageText?.substring(0, 50) + '...',
            isSignedIn,
            currentThreadId,
            timestamp: Date.now(),
            isSending,
        });

        // Prevent multiple rapid calls
        if (isSending) {
            log.warn('🚫 sendMessage already in progress, ignoring duplicate call');
            return;
        }

        setIsSending(true);

        try {
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

            const messageText = editor?.getText();
            if (!messageText || !editor) {
                return;
            }

            // Detect image intent and route to image generation flow
            const isImagePrompt = (text: string) => {
                const t = text.toLowerCase();
                return (
                    /(generate|create|make) (an |a )?(image|picture|photo|logo|sticker)/.test(t)
                    || /(photorealistic|sticker|product photograph|aspect ratio|comic panel|minimalist composition)/
                        .test(t)
                );
            };

            const runImageFlow = async (prompt: string) => {
                const { getAllKeys } = useApiKeysStore.getState();
                const apiKeys = getAllKeys();
                if (!isPlusTier && !apiKeys.GEMINI_API_KEY) {
                    // Trigger BYOK modal if not configured
                    setPendingMessage(() => sendMessage);
                    setShowBYOKDialog(true);
                    return;
                }

                // Use same flow as ImageGenButton
                try {
                    let threadId = currentThreadId?.toString();
                    const threadItemId = await generateThreadId();
                    const now = new Date();
                    if (!threadId) {
                        const optimisticThreadId = await generateThreadId();
                        await createThread(optimisticThreadId, { title: prompt.slice(0, 60) });
                        threadId = optimisticThreadId;
                        router.push(`/chat/${optimisticThreadId}`);
                    }

                    // Determine parent for continuity (last item with image outputs)
                    let parentId: string | undefined = undefined;
                    try {
                        if (threadId) {
                            const items = await useChatStore.getState().getThreadItems(threadId);
                            const sorted = (items || []).sort(
                                (a, b) =>
                                    new Date(a.createdAt).getTime()
                                    - new Date(b.createdAt).getTime(),
                            );
                            const lastWithImages = [...sorted]
                                .reverse()
                                .find(
                                    (it) =>
                                        Array.isArray(it.imageOutputs)
                                        && it.imageOutputs.length > 0,
                                );
                            if (lastWithImages) parentId = lastWithImages.id;
                        }
                    } catch {}

                    await useChatStore.getState().createThreadItem({
                        id: threadItemId,
                        threadId: threadId!,
                        parentId,
                        createdAt: now,
                        updatedAt: now,
                        status: 'PENDING',
                        query: prompt,
                        mode: chatMode,
                    } as any);

                    setIsGenerating(true);
                    const images: Array<
                        { base64?: string; url?: string; mediaType?: string; name?: string; }
                    > = [];
                    const seen = new Set<string>();
                    const pushUnique = (
                        img: { base64?: string; url?: string; mediaType?: string; name?: string; },
                    ) => {
                        const key = img.base64 ? `b64:${img.base64}` : `url:${img.url}`;
                        if (key && !seen.has(key)) {
                            seen.add(key);
                            images.push(img);
                        }
                    };
                    if (imageAttachment?.base64) {
                        pushUnique({ base64: imageAttachment.base64, mediaType: 'image/png' });
                    }
                    if (multiModalAttachments?.length) {
                        for (const a of multiModalAttachments) {
                            if (a.url?.startsWith('data:')) {
                                const match = a.url.match(/^data:(.+);base64,(.*)$/);
                                if (match) {
                                    pushUnique({
                                        base64: match[2] || '',
                                        mediaType: match[1] || a.contentType,
                                        name: a.name,
                                    });
                                    continue;
                                }
                            }
                            pushUnique({ url: a.url, mediaType: a.contentType, name: a.name });
                        }
                    }

                    // If no explicit images attached, try to use the last generated image for edit continuity
                    if (images.length === 0 && threadId) {
                        try {
                            const items = await useChatStore.getState().getThreadItems(threadId);
                            const sorted = (items || []).sort(
                                (a, b) =>
                                    new Date(a.createdAt).getTime()
                                    - new Date(b.createdAt).getTime(),
                            );
                            const lastWithImages = [...sorted]
                                .reverse()
                                .find(
                                    (it) =>
                                        Array.isArray(it.imageOutputs)
                                        && it.imageOutputs.length > 0,
                                );
                            const img = lastWithImages?.imageOutputs?.[0];
                            if (img) {
                                if (img.url) {
                                    images.push({
                                        url: img.url,
                                        mediaType: img.mediaType,
                                        name: img.name,
                                    });
                                } else if (img.dataUrl) {
                                    const match = String(img.dataUrl).match(
                                        /^data:(.+);base64,(.*)$/,
                                    );
                                    if (match) {
                                        images.push({
                                            base64: match[2] || '',
                                            mediaType: match[1] || 'image/png',
                                        });
                                    }
                                }
                            }
                        } catch {}
                    }

                    const result = await http.post<{ text: string; images: any[]; }>(
                        '/api/image',
                        { body: { prompt, images }, apiKeys, timeout: 120000 },
                    );

                    await useChatStore.getState().updateThreadItem(threadId!, {
                        id: threadItemId,
                        answer: { text: result.text || '' },
                        imageOutputs: result.images || [],
                        status: 'COMPLETED',
                        persistToDB: true,
                    });

                    editor?.commands.clearContent();
                    clearImageAttachment();
                    setShowImageTips(true);
                } catch (error: any) {
                    let friendly = error?.message || 'Please try again later.';
                    if (error?.response && typeof error.response.json === 'function') {
                        try {
                            const data = await error.response.json();
                            if (data?.message) friendly = data.message;
                        } catch {}
                    }
                    setIsGenerating(false);
                    const threadId = currentThreadId?.toString()
                        || useChatStore.getState().currentThreadId || '';
                    const lastItem = useChatStore.getState().getCurrentThreadItem(threadId);
                    if (threadId && lastItem) {
                        await useChatStore.getState().updateThreadItem(threadId, {
                            id: lastItem.id,
                            status: 'ERROR',
                            error: friendly,
                            persistToDB: true,
                        });
                    }
                    toast({
                        title: 'Image generation failed',
                        description: friendly,
                        variant: 'destructive',
                    });
                } finally {
                    setIsGenerating(false);
                }
            };

            // Decide if this message is an image generation/edit request
            let isImageFollowup = false;
            if (currentThreadId) {
                try {
                    const items = await getThreadItems(currentThreadId.toString());
                    const last = items.sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                    ).at(-1);
                    isImageFollowup = Array.isArray(last?.imageOutputs)
                        && last!.imageOutputs!.length > 0;
                } catch {}
            }

            if (isImagePrompt(messageText) || isImageFollowup) {
                await runImageFlow(messageText);
                return;
            }

            // Check if user has valid API key for the selected chat mode
            // This applies to all users (signed in or not) for modes that require API keys
            // SPECIAL CASE: VT+ users don't need API keys for any Gemini models
            const needsApiKeyCheck = (() => {
                if (isGeminiModel(chatMode)) {
                    // VT+ users don't need API keys for any Gemini models
                    return !isPlusTier;
                }
                return true;
            })();

            if (needsApiKeyCheck && !hasApiKeyForChatMode(chatMode, isSignedIn, isPlusTier)) {
                if (isSignedIn) {
                    // For signed-in users, show BYOK dialog
                    setPendingMessage(() => sendMessage);
                    setShowBYOKDialog(true);
                    return;
                }
                // For non-signed in users, show login prompt first
                setShowLoginPrompt(true);
                return;
            }

            // Get thread items for BYOK validation
            const existingThreadItems = currentThreadId
                ? await getThreadItems(currentThreadId.toString())
                : [];

            // BYOK validation for image analysis - ALL users must provide their own API keys for image processing
            const hasImages = hasImageAttachments({
                imageAttachment,
                attachments: multiModalAttachments,
                messages: existingThreadItems || [],
            });

            if (hasImages) {
                const apiKeys = getAllKeys();
                const validation = validateByokForImageAnalysis({
                    chatMode,
                    apiKeys,
                    hasImageAttachments: hasImages,
                });

                if (!validation.isValid) {
                    toast({
                        title: 'API Key Required for Image Analysis',
                        description: validation.errorMessage,
                        variant: 'destructive',
                    });
                    return;
                }
            }

            let threadId = currentThreadId?.toString();
            let optimisticThreadItemId: string | undefined;

            if (!threadId) {
                const optimisticId = await generateThreadId();

                // Create optimistic user thread item BEFORE creating thread to prevent blank screen
                optimisticThreadItemId = await generateThreadId();
                const optimisticUserThreadItem = {
                    id: optimisticThreadItemId,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    status: 'QUEUED' as const,
                    threadId: optimisticId,
                    query: editor?.getText() || '',
                    imageAttachment: imageAttachment?.base64 || '',
                    documentAttachment: documentAttachment
                        ? {
                            base64: documentAttachment.base64,
                            mimeType: documentAttachment.mimeType,
                            fileName: documentAttachment.fileName,
                        }
                        : undefined,
                    attachments: multiModalAttachments.length > 0
                        ? multiModalAttachments
                        : undefined,
                    mode: chatMode,
                };

                // Create thread first (this sets currentThreadId and clears threadItems)
                log.info({ optimisticId }, '🆕 Creating new thread');
                await createThread(optimisticId, {
                    title: editor?.getText() || 'New Chat',
                });
                threadId = optimisticId;

                // Add the optimistic thread item to store after thread creation
                const createThreadItem = useChatStore.getState().createThreadItem;

                log.info({ optimisticUserThreadItem }, '📝 Creating optimistic thread item');
                await createThreadItem(optimisticUserThreadItem);

                // Verify the thread item was created
                const verifyItem = useChatStore.getState().getCurrentThreadItem(optimisticId);
                const allThreadItems = useChatStore
                    .getState()
                    .threadItems.filter((item) => item.threadId === optimisticId);
                log.info(
                    {
                        verifyItem: !!verifyItem,
                        itemId: verifyItem?.id,
                        totalItemsForThread: allThreadItems.length,
                        threadExists: useChatStore
                            .getState()
                            .threads.some((t) => t.id === optimisticId),
                    },
                    '✅ Verified optimistic thread item and thread state',
                );

                // Set loading state and navigate - user message will be immediately visible
                setIsGenerating(true);
                log.info({ optimisticId }, '🚀 Navigating to thread page');
                router.push(`/chat/${optimisticId}`);
            }
            // Removed duplicated block and misplaced return

            // First submit the message
            const formData = new FormData();
            formData.append('query', editor?.getText() || '');
            imageAttachment?.base64 && formData.append('imageAttachment', imageAttachment?.base64);
            documentAttachment?.base64
                && formData.append('documentAttachment', documentAttachment?.base64);
            documentAttachment?.mimeType
                && formData.append('documentMimeType', documentAttachment?.mimeType);
            documentAttachment?.fileName
                && formData.append('documentFileName', documentAttachment?.fileName);

            // Add multi-modal attachments
            if (multiModalAttachments.length > 0) {
                formData.append('multiModalAttachments', JSON.stringify(multiModalAttachments));
            }

            const threadItems = currentThreadId
                ? await getThreadItems(currentThreadId.toString())
                : [];

            log.info({ data: threadItems }, 'threadItems');

            log.info(
                {
                    useWebSearch,
                    useMathCalculator,
                    useCharts,
                },
                '🚀 Sending to handleSubmit with flags',
            );

            // For new threads, pass the optimistic thread item ID to update the existing item
            const existingThreadItemId = !currentThreadId ? optimisticThreadItemId : undefined;

            handleSubmit({
                formData,
                newThreadId: threadId,
                existingThreadItemId,
                messages: threadItems.sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
                ),
                useWebSearch,
                useMathCalculator,
                useCharts,
            });

            window.localStorage.removeItem(STORAGE_KEYS.DRAFT_MESSAGE);
            editor?.commands.clearContent();
            clearImageAttachment();
            // Don't clear document attachment to support structured output after message submission
            // clearDocumentAttachment();
            setMultiModalAttachments([]);
        } finally {
            setIsSending(false);
            log.info('📤 sendMessage completed, resetting isSending flag');
        }
    };

    const renderChatInput = () => (
        <div
            className={cn(
                'w-full', // Removed all padding/margins
                currentThreadId ? 'pb-2 md:pb-0' : 'mb-2 md:mb-0',
            )}
        >
            <Flex
                className={cn(
                    'bg-background border-border/60 relative z-10 mx-auto w-full max-w-4xl rounded-2xl border',
                )}
                direction='col'
            >
                <ImageDropzoneRoot dropzoneProps={multiDropzone}>
                    <div className='flex w-full flex-shrink-0 overflow-hidden rounded-lg'>
                        {editor?.isEditable
                            ? (
                                <div className='w-full'>
                                    <div className='flex flex-col gap-2'>
                                        <DocumentAttachment />
                                        <StructuredDataDisplay />
                                        {multiModalAttachments.length > 0 && (
                                            <MultiModalAttachmentsDisplay
                                                attachments={multiModalAttachments}
                                                onRemove={removeMultiModalAttachment}
                                            />
                                        )}
                                    </div>
                                    <Flex className='flex w-full flex-row items-end gap-0'>
                                        <ChatEditor
                                            className=''
                                            editor={editor}
                                            sendMessage={sendMessage}
                                        />
                                    </Flex>{' '}
                                    <Flex
                                        className='border-border w-full gap-3 border-t border-dashed px-4 py-3'
                                        gap='none'
                                        items='center'
                                        justify='between'
                                    >
                                        {isGenerating && !isChatPage
                                            ? <GeneratingStatus />
                                            : (
                                                <div className='flex w-full flex-1 flex-col gap-2'>
                                                    {/* Row 1: Primary controls */}
                                                    <div className='flex items-center gap-2'>
                                                        <ChatModeButton />
                                                        <ImageGenButton
                                                            attachments={multiModalAttachments}
                                                            imageBase64={imageAttachment?.base64}
                                                            onAfterGenerate={() =>
                                                                setShowImageTips(true)}
                                                        />
                                                    </div>
                                                    {/* Row 2: Secondary tools - horizontally scrollable */}
                                                    <div className='scrollbar-hide flex items-center gap-2 overflow-x-auto'>
                                                        <WebSearchButton />
                                                        <ChartsButton />
                                                        <MathCalculatorButton />
                                                        <DocumentUploadButton />
                                                        {supportsMultiModal(chatMode)
                                                            ? (
                                                                <MultiModalAttachmentButton
                                                                    attachments={multiModalAttachments}
                                                                    disabled={isGenerating}
                                                                    onAttachmentsChange={setMultiModalAttachments}
                                                                />
                                                            )
                                                            : (
                                                                <ImageUpload
                                                                    handleImageUpload={handleImageUpload}
                                                                    id='image-attachment'
                                                                    label='Image'
                                                                    showIcon={true}
                                                                    tooltip='Image Attachment'
                                                                />
                                                            )}
                                                        <StructuredOutputButton />
                                                    </div>
                                                </div>
                                            )}

                                        <Flex
                                            className='ml-auto flex-shrink-0'
                                            gap='sm'
                                            items='center'
                                        >
                                            <SendStopButton
                                                hasTextInput={hasTextInput}
                                                isGenerating={isGenerating}
                                                sendMessage={sendMessage}
                                                stopGeneration={() => stopGeneration('user')}
                                            />
                                        </Flex>
                                    </Flex>
                                    {/* Image prompting tips (dismissable) - homepage only */}
                                    {!currentThreadId && showImageTips && (
                                        <div className='border-border/40 bg-muted/30 mt-2 w-full rounded-md border px-3 py-2'>
                                            <div className='mb-1 flex items-center justify-between'>
                                                <div className='text-xs font-medium'>
                                                    Nano Banana - Image Prompting Tips
                                                </div>
                                                <button
                                                    type='button'
                                                    className='text-muted-foreground text-[11px] underline underline-offset-2'
                                                    onClick={() => {
                                                        const next = !isImageTipsCollapsed;
                                                        setIsImageTipsCollapsed(next);
                                                        persistImageTipsState(next);
                                                    }}
                                                    aria-expanded={!isImageTipsCollapsed}
                                                    aria-controls='image-tips-content'
                                                >
                                                    {isImageTipsCollapsed ? 'Expand' : 'Collapse'}
                                                </button>
                                            </div>
                                            {!isImageTipsCollapsed && (
                                                <ul
                                                    id='image-tips-content'
                                                    className='text-muted-foreground ml-4 list-disc space-y-1 text-[11px]'
                                                >
                                                    <li>
                                                        Describe the scene in full sentences, not
                                                        keywords.
                                                    </li>
                                                    <li>
                                                        For photorealism: shot type, lens, lighting,
                                                        mood, textures.
                                                    </li>
                                                    <li>
                                                        For stickers/illustrations: style, palette,
                                                        line/shading, transparent background.
                                                    </li>
                                                    <li>
                                                        To edit an image: attach it and describe
                                                        precise changes only.
                                                    </li>
                                                    <li>
                                                        Use aspect hints like “16:9” or “square” if
                                                        you care about layout.
                                                    </li>
                                                </ul>
                                            )}
                                            {/* Template chips */}
                                            {!isImageTipsCollapsed && (
                                                <div className='mt-2 flex flex-wrap gap-1.5'>
                                                    {[
                                                        {
                                                            label: 'Photorealistic',
                                                            text:
                                                                'A photorealistic [shot type] of [subject], [expression], set in [environment]. Illuminated by [lighting] to create a [mood] atmosphere. Captured with a [camera/lens], emphasizing [key textures]. [16:9]',
                                                        },
                                                        {
                                                            label: 'Sticker',
                                                            text:
                                                                'A [style] sticker of a [subject], featuring [key characteristics] and a [color palette]. [line style] lines, [shading style] shading. Background must be transparent.',
                                                        },
                                                        {
                                                            label: 'Product',
                                                            text:
                                                                'A high-resolution, studio-lit product photograph of [product] on a [surface/background]. Lighting: [setup] to [purpose]. Camera angle: [angle] to showcase [feature]. Ultra-realistic, sharp focus on [detail]. [1:1]',
                                                        },
                                                        {
                                                            label: 'Minimalist',
                                                            text:
                                                                'A minimalist composition featuring a single [subject] positioned at the [position] with a vast [color] negative space background. Soft, subtle lighting. [16:9]',
                                                        },
                                                        {
                                                            label: 'Comic',
                                                            text:
                                                                'A single comic panel in [art style]. Foreground: [character] [action]. Background: [setting details]. Include a [dialogue/caption] box with the text "[Text]". Lighting creates a [mood] mood. [4:3]',
                                                        },
                                                        {
                                                            label: 'Edits',
                                                            text:
                                                                'Using the provided image, change only the [specific element] to [new element/description]. Keep all other content exactly the same (style, lighting, composition).',
                                                        },
                                                    ].map((chip) => (
                                                        <button
                                                            key={chip.label}
                                                            type='button'
                                                            onClick={() =>
                                                                editor?.commands.insertContent(
                                                                    chip.text,
                                                                )}
                                                            className='vt-plus-glass border-[#D99A4E]/30 text-[#D99A4E] rounded-full px-2.5 py-1 text-[11px] transition-colors hover:bg-[#D99A4E]/10'
                                                        >
                                                            {chip.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            <div className='mt-2'>
                                                <button
                                                    className='text-primary text-xs underline underline-offset-2'
                                                    onClick={dismissImageTips}
                                                    type='button'
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                            : (
                                <div className='flex h-24 w-full items-center justify-center'>
                                    <InlineLoader />
                                </div>
                            )}
                    </div>
                </ImageDropzoneRoot>
            </Flex>
        </div>
    );

    const renderChatBottom = () => (
        <>
            <Flex gap='sm' items='center' justify='center'>
                {/* <ScrollToBottomButton /> */}
            </Flex>
            {renderChatInput()}
        </>
    );

    useEffect(() => {
        editor?.commands.focus('end');
    }, [currentThreadId]);

    // Multi-image drag & drop: add all dropped images to attachments and set first as preview
    const multiDropzone = useDropzone({
        multiple: true,
        noClick: true,
        onDrop: async (acceptedFiles: File[]) => {
            if (!acceptedFiles || acceptedFiles.length === 0) return;
            const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
            const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB

            const newItems: { url: string; name: string; contentType: string; size?: number; }[] =
                [];
            let firstDataUrl: string | null = null;
            for (const f of acceptedFiles) {
                if (!fileTypes.includes(f.type)) {
                    toast({
                        title: 'Invalid format',
                        description: 'Use JPEG, PNG or GIF images.',
                        variant: 'destructive',
                    });
                    continue;
                }
                if (f.size > MAX_FILE_SIZE) {
                    toast({
                        title: 'File too large',
                        description: 'Image must be under 3MB.',
                        variant: 'destructive',
                    });
                    continue;
                }
                const dataUrl: string = await new Promise((res, rej) => {
                    const reader = new FileReader();
                    reader.onload = () => (typeof reader.result === 'string'
                        ? res(reader.result)
                        : rej(new Error('read error')));
                    reader.onerror = () => rej(new Error('read error'));
                    reader.readAsDataURL(f);
                });
                const resized = await resizeImageDataUrl(dataUrl, f.type, 768);
                newItems.push({
                    url: resized,
                    name: f.name || 'image',
                    contentType: f.type || 'image/png',
                    size: f.size,
                });
                if (!firstDataUrl) firstDataUrl = resized;
            }
            if (newItems.length > 0) {
                setMultiModalAttachments((prev) => {
                    const seen = new Set(prev.map((a) => a.url));
                    const deduped = newItems.filter((n) => !seen.has(n.url));
                    return [...deduped, ...prev];
                });
            }
            // Set preview to first image
            if (firstDataUrl) {
                useChatStore.getState().setImageAttachment({ base64: firstDataUrl });
            }
        },
    });

    // Auto-focus input when user types anywhere on the page
    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            // Don't auto-focus if:
            // 1. User is already typing in an input, textarea, or contenteditable element
            // 2. User is using keyboard shortcuts (Ctrl/Cmd + key)
            // 3. User pressed non-printable keys (arrows, escape, etc.)
            // 4. Editor is not available or not editable
            const target = event.target as HTMLElement;
            const isInputElement = target.tagName === 'INPUT'
                || target.tagName === 'TEXTAREA'
                || target.contentEditable === 'true'
                || target.closest('[contenteditable="true"]');

            const isModifierKey = event.ctrlKey || event.metaKey || event.altKey;
            const isSpecialKey = event.key.length > 1 && !['Enter', 'Space'].includes(event.key);

            if (isInputElement || isModifierKey || isSpecialKey || !editor?.isEditable) {
                return;
            }

            // Focus the editor and let the character be typed
            editor?.commands.focus('end');
        };

        // Add global keydown listener
        document.addEventListener('keydown', handleGlobalKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [editor?.commands, editor?.isEditable]);

    return (
        <div
            className={cn(
                'bg-secondary w-full',
                currentThreadId
                    ? 'chat-input-thread pb-safe' // Removed margin-top
                    : 'chat-input-homepage pb-safe', // Center positioning for homepage
            )}
        >
            <div
                className={cn(
                    'mx-auto flex w-full max-w-3xl flex-col',
                    !threadItemsLength && !currentThreadId && 'homepage-center-layout',
                    currentThreadId && 'items-start justify-start',
                    size === 'sm' && 'px-8',
                    'px-2 md:px-0', // Reduced mobile padding for better space usage
                    currentThreadId && 'pb-safe', // Add safe area padding for thread mode
                )}
            >
                <Flex
                    className={cn(
                        'pb-safe w-full pb-2 md:pb-4', // Reduced mobile bottom padding
                        threadItemsLength > 0 ? 'mb-2 md:mb-4' : '', // Reduced mobile margin
                        // Dynamic alignment based on context
                        !currentThreadId && !threadItemsLength
                            ? 'flex-1 items-center justify-center'
                            : 'items-start justify-start',
                    )}
                    direction='col'
                    items={!currentThreadId && !threadItemsLength ? 'center' : 'start'}
                    justify={!currentThreadId && !threadItemsLength ? 'center' : 'start'}
                >
                    {!currentThreadId && showGreeting && (
                        <div className='mb-6 flex w-full flex-col items-center gap-2'>
                            {!isPlusTier && <UserTierBadge showUpgradePrompt={true} />}
                            <PersonalizedGreeting session={session} />
                        </div>
                    )}

                    {renderChatBottom()}

                    {/* Show LM Studio setup banner for local models */}
                    {!currentThreadId && chatMode.startsWith('lmstudio-')
                        && <LMStudioSetupBanner />}

                    {/* Show Ollama setup banner for local models */}
                    {!currentThreadId && chatMode.startsWith('ollama-') && <OllamaSetupBanner />}

                    {!currentThreadId && showGreeting && <ExamplePrompts />}
                </Flex>
            </div>
            {showLoginPrompt && (
                <LoginRequiredDialog
                    description='Please log in to start chatting or save your conversation.'
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    title='Login Required'
                />
            )}
            {showBYOKDialog && (
                <BYOKValidationDialog
                    chatMode={chatMode}
                    isOpen={showBYOKDialog}
                    onApiKeySet={handleApiKeySet}
                    onClose={() => {
                        setShowBYOKDialog(false);
                        setPendingMessage(null);
                    }}
                />
            )}
        </div>
    );
};
