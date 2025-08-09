"use client";
import {
    BYOKValidationDialog,
    ImageAttachment,
    ImageDropzoneRoot,
    InlineLoader,
} from "@repo/common/components";
import { useDocumentAttachment, useImageAttachment } from "@repo/common/hooks";
import { useVtPlusAccess } from "@repo/common/hooks/use-subscription-access";
import { useApiKeysStore } from "@repo/common/store";
import { isGeminiModel } from "@repo/common/utils";
import { ChatModeConfig, STORAGE_KEYS, supportsMultiModal } from "@repo/shared/config";
import { useSession } from "@repo/shared/lib/auth-client";
import { generateThreadId } from "@repo/shared/lib/thread-id";
import { log } from "@repo/shared/logger";
import { hasImageAttachments, validateByokForImageAnalysis } from "@repo/shared/utils";
import { cn, Flex, useToast } from "@repo/ui";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useAgentStream } from "../../hooks/agent-provider";
import { useChatEditor } from "../../hooks/use-editor";
import { useChatStore } from "../../store";
import { ExamplePrompts } from "../example-prompts";
import { LMStudioSetupBanner } from "../lm-studio-setup-banner";
import { LoginRequiredDialog } from "../login-required-dialog";
import { OllamaSetupBanner } from "../ollama-setup-banner";
import { PersonalizedGreeting } from "../personalized-greeting";
import { StructuredDataDisplay } from "../structured-data-display";
import { UserTierBadge } from "../user-tier-badge";
import {
    ChartsButton,
    ChatModeButton,
    GeneratingStatus,
    MathCalculatorButton,
    SendStopButton,
    WebSearchButton,
} from "./chat-actions";
import { ChatEditor } from "./chat-editor";
import { DocumentAttachment } from "./document-attachment";
import { DocumentUploadButton } from "./document-upload-button";
import { ImageUpload } from "./image-upload";
import { MultiModalAttachmentButton } from "./multi-modal-attachment-button";
import { MultiModalAttachmentsDisplay } from "./multi-modal-attachments-display";
import { StructuredOutputButton } from "./structured-output-button";

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

    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor({
        placeholder: isFollowUp ? "Ask follow up" : "Ask anything",
        onInit: ({ editor }) => {
            if (typeof window !== "undefined" && !isFollowUp && !isSignedIn) {
                const draftMessage = window.localStorage.getItem(STORAGE_KEYS.DRAFT_MESSAGE);
                if (draftMessage) {
                    editor.commands.setContent(draftMessage, true);
                }
            }
            // Removed automatic login prompt on focus - users should be able to type without being forced to login
            // Login will be prompted only when they try to send a message
        },
        onUpdate: ({ editor }) => {
            if (typeof window !== "undefined" && !isFollowUp) {
                window.localStorage.setItem(STORAGE_KEYS.DRAFT_MESSAGE, editor.getText());
            }
        },
    });
    const size = currentThreadId ? "base" : "sm";
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
    const isChatPage = pathname.startsWith("/chat/");
    const imageAttachment = useChatStore((state) => state.imageAttachment);
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const clearImageAttachment = useChatStore((state) => state.clearImageAttachment);

    const stopGeneration = useChatStore((state) => state.stopGeneration);
    const hasTextInput = !!editor?.getText();
    const { dropzonProps, handleImageUpload } = useImageAttachment();
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

        const messageText = editor?.getText();
        if (!messageText || !editor) {
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
                    title: "API Key Required for Image Analysis",
                    description: validation.errorMessage,
                    variant: "destructive",
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
                status: "QUEUED" as const,
                threadId: optimisticId,
                query: editor?.getText() || "",
                imageAttachment: imageAttachment?.base64 || "",
                documentAttachment: documentAttachment
                    ? {
                          base64: documentAttachment.base64,
                          mimeType: documentAttachment.mimeType,
                          fileName: documentAttachment.fileName,
                      }
                    : undefined,
                attachments: multiModalAttachments.length > 0 ? multiModalAttachments : undefined,
                mode: chatMode,
            };

            // Create thread first (this sets currentThreadId and clears threadItems)
            log.info({ optimisticId }, "🆕 Creating new thread");
            await createThread(optimisticId, {
                title: editor?.getText() || "New Chat",
            });
            threadId = optimisticId;

            // Add the optimistic thread item to store after thread creation
            const createThreadItem = useChatStore.getState().createThreadItem;

            log.info({ optimisticUserThreadItem }, "📝 Creating optimistic thread item");
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
                "✅ Verified optimistic thread item and thread state",
            );

            // Set loading state and navigate - user message will be immediately visible
            setIsGenerating(true);
            log.info({ optimisticId }, "🚀 Navigating to thread page");
            router.push(`/chat/${optimisticId}`);
        }
        // Removed duplicated block and misplaced return

        // First submit the message
        const formData = new FormData();
        formData.append("query", editor?.getText() || "");
        imageAttachment?.base64 && formData.append("imageAttachment", imageAttachment?.base64);
        documentAttachment?.base64 &&
            formData.append("documentAttachment", documentAttachment?.base64);
        documentAttachment?.mimeType &&
            formData.append("documentMimeType", documentAttachment?.mimeType);
        documentAttachment?.fileName &&
            formData.append("documentFileName", documentAttachment?.fileName);

        // Add multi-modal attachments
        if (multiModalAttachments.length > 0) {
            formData.append("multiModalAttachments", JSON.stringify(multiModalAttachments));
        }

        const threadItems = currentThreadId ? await getThreadItems(currentThreadId.toString()) : [];

        log.info({ data: threadItems }, "threadItems");

        log.info(
            {
                useWebSearch,
                useMathCalculator,
                useCharts,
            },
            "🚀 Sending to handleSubmit with flags",
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
    };

    const renderChatInput = () => (
        <div
            className={cn(
                "w-full", // Removed all padding/margins
                currentThreadId ? "pb-2 md:pb-0" : "mb-2 md:mb-0",
            )}
        >
            <Flex
                className={cn(
                    "bg-background border-border/60 relative z-10 mx-auto w-full max-w-4xl rounded-2xl border",
                )}
                direction="col"
            >
                <ImageDropzoneRoot dropzoneProps={dropzonProps}>
                    <div className="flex w-full flex-shrink-0 overflow-hidden rounded-lg">
                        {editor?.isEditable ? (
                            <div className="w-full">
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
                                        className=""
                                        editor={editor}
                                        sendMessage={sendMessage}
                                    />
                                </Flex>{" "}
                                <Flex
                                    className="border-border w-full gap-3 border-t border-dashed px-4 py-3"
                                    gap="none"
                                    items="center"
                                    justify="between"
                                >
                                    {isGenerating && !isChatPage ? (
                                        <GeneratingStatus />
                                    ) : (
                                        <Flex
                                            className="scrollbar-hide flex-1 flex-nowrap overflow-x-auto md:flex-wrap"
                                            gap="xs"
                                            items="center"
                                        >
                                            <ChatModeButton />

                                            {/* AI Enhancement Tools Group */}
                                            <div className="bg-border/50 mx-1 h-4 w-px" />
                                            <WebSearchButton />
                                            <ChartsButton />
                                            <MathCalculatorButton />

                                            {/* File Upload Tools Group */}
                                            <div className="bg-border/50 mx-1 h-4 w-px" />
                                            <DocumentUploadButton />
                                            {supportsMultiModal(chatMode) ? (
                                                <MultiModalAttachmentButton
                                                    attachments={multiModalAttachments}
                                                    disabled={isGenerating}
                                                    onAttachmentsChange={setMultiModalAttachments}
                                                />
                                            ) : (
                                                <ImageUpload
                                                    handleImageUpload={handleImageUpload}
                                                    id="image-attachment"
                                                    label="Image"
                                                    showIcon={true}
                                                    tooltip="Image Attachment"
                                                />
                                            )}

                                            {/* Data Processing Tools Group */}
                                            <div className="bg-border/50 mx-1 h-4 w-px" />
                                            <StructuredOutputButton />
                                        </Flex>
                                    )}

                                    <Flex className="ml-auto flex-shrink-0" gap="sm" items="center">
                                        <SendStopButton
                                            hasTextInput={hasTextInput}
                                            isGenerating={isGenerating}
                                            sendMessage={sendMessage}
                                            stopGeneration={stopGeneration}
                                        />
                                    </Flex>
                                </Flex>
                            </div>
                        ) : (
                            <div className="flex h-24 w-full items-center justify-center">
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
            <Flex gap="sm" items="center" justify="center">
                {/* <ScrollToBottomButton /> */}
            </Flex>
            {renderChatInput()}
        </>
    );

    useEffect(() => {
        editor?.commands.focus("end");
    }, [currentThreadId]);

    // Auto-focus input when user types anywhere on the page
    useEffect(() => {
        const handleGlobalKeyDown = (event: KeyboardEvent) => {
            // Don't auto-focus if:
            // 1. User is already typing in an input, textarea, or contenteditable element
            // 2. User is using keyboard shortcuts (Ctrl/Cmd + key)
            // 3. User pressed non-printable keys (arrows, escape, etc.)
            // 4. Editor is not available or not editable
            const target = event.target as HTMLElement;
            const isInputElement =
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.contentEditable === "true" ||
                target.closest('[contenteditable="true"]');

            const isModifierKey = event.ctrlKey || event.metaKey || event.altKey;
            const isSpecialKey = event.key.length > 1 && !["Enter", "Space"].includes(event.key);

            if (isInputElement || isModifierKey || isSpecialKey || !editor?.isEditable) {
                return;
            }

            // Focus the editor and let the character be typed
            editor?.commands.focus("end");
        };

        // Add global keydown listener
        document.addEventListener("keydown", handleGlobalKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [editor?.commands, editor?.isEditable]);

    return (
        <div
            className={cn(
                "bg-secondary w-full",
                currentThreadId
                    ? "chat-input-thread pb-safe" // Removed margin-top
                    : "chat-input-homepage pb-safe", // Center positioning for homepage
            )}
        >
            <div
                className={cn(
                    "mx-auto flex w-full max-w-3xl flex-col",
                    !threadItemsLength && !currentThreadId && "homepage-center-layout",
                    currentThreadId && "items-start justify-start",
                    size === "sm" && "px-8",
                    "px-2 md:px-0", // Reduced mobile padding for better space usage
                    currentThreadId && "pb-safe", // Add safe area padding for thread mode
                )}
            >
                <Flex
                    className={cn(
                        "pb-safe w-full pb-2 md:pb-4", // Reduced mobile bottom padding
                        threadItemsLength > 0 ? "mb-2 md:mb-4" : "", // Reduced mobile margin
                        // Dynamic alignment based on context
                        !currentThreadId && !threadItemsLength
                            ? "flex-1 items-center justify-center"
                            : "items-start justify-start",
                    )}
                    direction="col"
                    items={!currentThreadId && !threadItemsLength ? "center" : "start"}
                    justify={!currentThreadId && !threadItemsLength ? "center" : "start"}
                >
                    {!currentThreadId && showGreeting && (
                        <div className="mb-6 flex w-full flex-col items-center gap-2">
                            {!isPlusTier && <UserTierBadge showUpgradePrompt={true} />}
                            <PersonalizedGreeting session={session} />
                        </div>
                    )}

                    {renderChatBottom()}

                    {/* Show LM Studio setup banner for local models */}
                    {!currentThreadId && chatMode.startsWith("lmstudio-") && (
                        <LMStudioSetupBanner />
                    )}

                    {/* Show Ollama setup banner for local models */}
                    {!currentThreadId && chatMode.startsWith("ollama-") && <OllamaSetupBanner />}

                    {!currentThreadId && showGreeting && <ExamplePrompts />}
                </Flex>
            </div>
            {showLoginPrompt && (
                <LoginRequiredDialog
                    description="Please log in to start chatting or save your conversation."
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    title="Login Required"
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
