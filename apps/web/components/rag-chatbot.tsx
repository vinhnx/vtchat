'use client';

import { models } from '@repo/ai/models';
import { useSubscriptionAccess } from '@repo/common/hooks';
import { useApiKeysStore, useAppStore } from '@repo/common/store';
import { EMBEDDING_MODEL_CONFIG } from '@repo/shared/config/embedding-models';
import { API_KEY_NAMES } from '@repo/shared/constants/api-keys';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/lib/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import {
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    ScrollArea,
    Sheet,
    SheetContent,
} from '@repo/ui';
import { useChat } from 'ai/react';
import { Database, Eye, Menu, Send, Settings, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';


interface KnowledgeItem {
    id: string;
    content: string;
    createdAt: string;
}

export function RAGChatbot() {
    const { data: session } = useSession();
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
    const { hasAccess } = useSubscriptionAccess();
    const hasVTPlusAccess = hasAccess({ plan: PlanSlug.VT_PLUS });
    const embeddingModel = useAppStore((state) => state.embeddingModel);
    const ragChatModel = useAppStore((state) => state.ragChatModel);
    const profile = useAppStore((state) => state.profile);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);

    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);



    // Mobile sidebar state
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Enhanced error handling function
    const showErrorToast = (error: any) => {
        // Debug logging to understand error structure
        log.error(
            { error, errorMessage: error?.message, errorType: typeof error },
            'showErrorToast called'
        );

        // Extract error message from various possible structures
        let errorMessage = '';
        if (typeof error === 'string') {
            errorMessage = error;
        } else if (error?.message) {
            errorMessage = error.message;
        } else if (error?.error?.message) {
            errorMessage = error.error.message;
        } else if (error?.toString) {
            errorMessage = error.toString();
        } else {
            errorMessage = 'Unknown error occurred';
        }

        const message = errorMessage.toLowerCase();
        log.info({ message, originalError: error }, 'Processing error message for toast');

        try {
            if (message.includes('api key is required') || message.includes('unauthorized')) {
                toast.error('API Key Required', {
                    description:
                        'Please configure your API keys in Settings to use the Knowledge Assistant.',
                    action: {
                        label: 'Add Keys',
                        onClick: () => window.open('/settings', '_blank'),
                    },
                });
            } else if (message.includes('rate limit') || message.includes('too many requests')) {
                toast.error('Rate Limit Exceeded', {
                    description: 'Too many requests. Please try again in a few minutes.',
                });
            } else if (
                message.includes('insufficient credits') ||
                message.includes('quota exceeded')
            ) {
                toast.error('Credits Exhausted', {
                    description:
                        'Your API credits have been exhausted. Please check your provider account.',
                });
            } else if (message.includes('network') || message.includes('fetch')) {
                toast.error('Network Error', {
                    description: 'Please check your internet connection and try again.',
                });
            } else if (message.includes('timeout')) {
                toast.error('Request Timeout', {
                    description: 'The request took too long. Please try again.',
                });
            } else if (message.includes('server error') || message.includes('internal server')) {
                toast.error('Server Error', {
                    description: 'Our servers are experiencing issues. Please try again later.',
                });
            } else if (message.includes('invalid') || message.includes('bad request')) {
                toast.error('Invalid Request', {
                    description: 'There was an issue with your request. Please try again.',
                });
            } else {
                toast.error('Chat Error', {
                    description: errorMessage || 'Something went wrong. Please try again.',
                });
            }
            log.info({}, 'Toast error shown successfully');
        } catch (toastError) {
            log.error(
                { toastError, originalError: error },
                'Failed to show error toast - this indicates a problem with the toast system'
            );
        }
    };

    const allApiKeys = getAllKeys();
    const hasGeminiKey = !!allApiKeys[API_KEY_NAMES.GOOGLE];

    // VT+ users can chat with or without BYOK (server API key used automatically)
    // Free users must have their own Gemini API key
    const canChat = hasVTPlusAccess || hasGeminiKey;



    // Ref for auto-scroll functionality
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
        api: '/api/chat/assistant',
        maxSteps: 3,
        body: {
            apiKeys: allApiKeys,
            embeddingModel,
            ragChatModel,
            profile,
        },
        onError: (error) => {
            log.error(
                { error, errorKeys: Object.keys(error), errorProto: Object.getPrototypeOf(error) },
                'RAG Chat Error in onError handler'
            );

            // Show error toast immediately and also with slight delay as fallback
            showErrorToast(error);

            // Fallback with delay in case immediate call doesn't work
            setTimeout(() => {
                log.info({}, 'Showing error toast with delay fallback');
                showErrorToast(error);
            }, 100);
        },
        onFinish: (message) => {
            // Check if the assistant message contains error indicators
            if (message.content) {
                const content = message.content.toLowerCase();
                if (
                    content.includes('error:') ||
                    content.includes('failed to') ||
                    content.includes('unable to')
                ) {
                    // Extract error from message content if it looks like an error
                    const errorMatch =
                        message.content.match(/error:\s*(.*)/i) ||
                        message.content.match(/failed to\s*(.*)/i) ||
                        message.content.match(/unable to\s*(.*)/i);

                    if (errorMatch) {
                        const errorMsg = errorMatch[1].trim();
                        setTimeout(() => {
                            showErrorToast(new Error(errorMsg));
                        }, 100);
                    }
                }
            }
        },
    });

    // Track if we're currently processing to avoid duplicate indicators
    const isProcessing =
        isLoading || messages.some((msg) => msg.role === 'assistant' && !msg.content.trim());

    const fetchKnowledgeBase = async () => {
        try {
            const response = await fetch('/api/agent/knowledge');
            if (response.ok) {
                const data = await response.json();
                const resources = data.resources || data.knowledge || [];
                log.info({ total: resources.length, data }, '📚 Agent fetched');
                setKnowledgeBase(resources);
            } else {
                const errorText = await response.text();
                const error = new Error(
                    errorText || `HTTP ${response.status}: ${response.statusText}`
                );
                log.error(
                    { status: response.status, statusText: response.statusText, errorText },
                    'Failed to fetch knowledge base'
                );
                showErrorToast(error);
            }
        } catch (error) {
            log.error({ error }, 'Error fetching knowledge base');
            showErrorToast(error as Error);
        }
    };

    const clearKnowledgeBase = async () => {
        if (!session?.user?.id) return;

        setIsClearing(true);
        try {
            const response = await fetch('/api/agent/clear', {
                method: 'DELETE',
            });
            if (response.ok) {
                setKnowledgeBase([]);
                setIsClearDialogOpen(false);
                reload();
                toast.success('Knowledge base cleared successfully');
            } else {
                const errorText = await response.text();
                const error = new Error(
                    errorText || `HTTP ${response.status}: Failed to clear knowledge base`
                );
                log.error({ status: response.status, errorText }, 'Error clearing knowledge base');
                showErrorToast(error);
            }
        } catch (error) {
            log.error({ error }, 'Error clearing knowledge base');
            showErrorToast(error as Error);
        } finally {
            setIsClearing(false);
        }
    };

    const deleteKnowledgeItem = async (id: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/agent/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setKnowledgeBase((prev) => prev.filter((item) => item.id !== id));
                setDeleteItemId(null);
                reload();
                toast.success('Knowledge item deleted successfully');
            } else {
                const errorText = await response.text();
                const error = new Error(
                    errorText || `HTTP ${response.status}: Failed to delete knowledge item`
                );
                log.error({ status: response.status, errorText }, 'Error deleting knowledge item');
                showErrorToast(error);
            }
        } catch (error) {
            log.error({ error }, 'Error deleting knowledge item');
            showErrorToast(error as Error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        fetchKnowledgeBase();
    }, []);

    // Scroll to bottom when messages change or when processing state changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Filter to only show Gemini models for RAG
    const geminiModels = models.filter((m) => m.id.startsWith('gemini-'));

    // Get model info for display
    const currentEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel];
    const currentRagChatModel = geminiModels.find((m) => m.id === ragChatModel);

    return (
        <div className="flex h-full flex-col gap-4 md:flex-row md:gap-6">
            <div className="flex flex-1 flex-col min-h-0">
                {/* Chat Messages */}
                <ScrollArea className="w-full flex-1">
                    <div className="space-y-4 p-2 sm:p-4">
                        {messages.length === 0 && (
                        <div className="text-muted-foreground py-16 text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-primary/20 bg-background overflow-hidden">
                        <img
                                alt="VT Assistant"
                                className="h-full w-full object-cover"
                            src="/icon-192x192.png"
                        />
                        </div>
                                <h3 className="text-foreground mb-2 text-lg font-medium">
                            VT Personal AI Assistant
                        </h3>
                        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        Start chatting to build your personal knowledge base
                        </p>
                        </div>
                        )}

                        {messages
                            .filter((message) => message.content && message.content.trim())
                            .map((message, index) => (
                                <div
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    key={index}
                                >
                                    {message.role === 'user' ? (
                                        <Avatar
                                            className="h-8 w-8 shrink-0"
                                            name={session?.user?.name || 'User'}
                                            size="md"
                                            src={session?.user?.image ?? undefined}
                                        />
                                    ) : (
                                        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-primary/20 bg-background">
                                            <img
                                                alt="VT Assistant"
                                                className="h-full w-full object-cover"
                                                src="/icon-192x192.png"
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={`flex-1 space-y-2 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-3 ${
                                                message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground ml-auto'
                                                    : 'bg-muted'
                                            }`}
                                        >
                                            <div className="text-sm">{message.content}</div>
                                            {message.role === 'assistant' && (
                                                <div className="border-border text-muted-foreground mt-2 border-t pt-2 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span>
                                                            {currentRagChatModel?.name || 'Unknown'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            {currentEmbeddingModel?.name ||
                                                                'Unknown'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                        {/* Single consolidated loading indicator */}
                        {isProcessing && (
                            <div className="flex gap-3" key="loading-indicator">
                                <div className="flex-1 space-y-2">
                                    <div className="bg-muted max-w-[80%] rounded-lg p-3">
                                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                                            </div>
                                            <span className="ml-2">VT is thinking...</span>
                                        </div>
                                        <div className="text-muted-foreground/70 mt-1 text-xs">
                                            Searching knowledge base and generating response
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scroll target */}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Chat Input */}
                <div className="border-t p-4">
                    {/* Show message when no API keys */}
                    {!canChat && (
                        <div className="mb-4 rounded-lg bg-amber-50 p-3 text-sm">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <span className="text-amber-700">
                                    VT+ subscription or Gemini API key required
                                </span>
                                <Button
                                    className="text-xs w-full sm:w-auto"
                                    onClick={() => setIsSettingsOpen(true)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Upgrade or Add Key
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <div className="md:hidden">
                            <Button
                                onClick={() => setIsMobileSidebarOpen(true)}
                                size="sm"
                                variant="outline"
                                className="w-full"
                            >
                                <Menu className="mr-2 h-4 w-4" />
                                Agent
                            </Button>
                        </div>

                        <form className="flex gap-3" onSubmit={handleSubmit}>
                            <Input
                                className="flex-1"
                                disabled={isLoading || !canChat}
                                onChange={handleInputChange}
                                placeholder={
                                    canChat
                                        ? 'Message VT...'
                                        : 'VT+ subscription or API key required...'
                                }
                                value={input}
                            />
                            <Button
                                disabled={isLoading || !input.trim() || !canChat}
                                size="icon"
                                type="submit"
                                className="shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-72 border-l">
                <RagSidebar
                    knowledgeBase={knowledgeBase}
                    isViewDialogOpen={isViewDialogOpen}
                    setIsViewDialogOpen={setIsViewDialogOpen}
                    fetchKnowledgeBase={fetchKnowledgeBase}
                    isClearDialogOpen={isClearDialogOpen}
                    setIsClearDialogOpen={setIsClearDialogOpen}
                    clearKnowledgeBase={clearKnowledgeBase}
                    isClearing={isClearing}
                    deleteItemId={deleteItemId}
                    setDeleteItemId={setDeleteItemId}
                    deleteKnowledgeItem={deleteKnowledgeItem}
                    isDeleting={isDeleting}
                    currentRagChatModel={currentRagChatModel}
                    currentEmbeddingModel={currentEmbeddingModel}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            </div>

            {/* Mobile Sidebar Sheet */}
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
                <SheetContent className="w-full" title="Agent">
                    <div className="border-b p-4">
                        <h2 className="text-lg font-semibold">Agent</h2>
                    </div>
                    <RagSidebar
                        knowledgeBase={knowledgeBase}
                        isViewDialogOpen={isViewDialogOpen}
                        setIsViewDialogOpen={setIsViewDialogOpen}
                        fetchKnowledgeBase={fetchKnowledgeBase}
                        isClearDialogOpen={isClearDialogOpen}
                        setIsClearDialogOpen={setIsClearDialogOpen}
                        clearKnowledgeBase={clearKnowledgeBase}
                        isClearing={isClearing}
                        deleteItemId={deleteItemId}
                        setDeleteItemId={setDeleteItemId}
                        deleteKnowledgeItem={deleteKnowledgeItem}
                        isDeleting={isDeleting}
                        currentRagChatModel={currentRagChatModel}
                        currentEmbeddingModel={currentEmbeddingModel}
                        setIsSettingsOpen={setIsSettingsOpen}
                        isMobile={true}
                        onClose={() => setIsMobileSidebarOpen(false)}
                    />
                </SheetContent>
            </Sheet>


        </div>
    );
}

interface RagSidebarProps {
    knowledgeBase: KnowledgeItem[];
    isViewDialogOpen: boolean;
    setIsViewDialogOpen: (open: boolean) => void;
    fetchKnowledgeBase: () => void;
    isClearDialogOpen: boolean;
    setIsClearDialogOpen: (open: boolean) => void;
    clearKnowledgeBase: () => void;
    isClearing: boolean;
    deleteItemId: string | null;
    setDeleteItemId: (id: string | null) => void;
    deleteKnowledgeItem: (id: string) => void;
    isDeleting: boolean;
    currentRagChatModel: any;
    currentEmbeddingModel: any;
    setIsSettingsOpen: (open: boolean) => void;
    isMobile?: boolean;
    onClose?: () => void;
}

function RagSidebar({
    knowledgeBase,
    isViewDialogOpen,
    setIsViewDialogOpen,
    fetchKnowledgeBase,
    isClearDialogOpen,
    setIsClearDialogOpen,
    clearKnowledgeBase,
    isClearing,
    deleteItemId,
    setDeleteItemId,
    deleteKnowledgeItem,
    isDeleting,
    currentRagChatModel,
    currentEmbeddingModel,
    setIsSettingsOpen,
    onClose,
}: RagSidebarProps) {
    return (
        <ScrollArea className="h-full w-full">
            <div className="space-y-4 p-4">
                {/* Agent Management */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Database className="h-4 w-4" />
                            Agent
                            <Badge className="ml-auto" variant="secondary">
                                {knowledgeBase.length}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex gap-2">
                            <Dialog
                                onOpenChange={(open) => {
                                    setIsViewDialogOpen(open);
                                    if (open) {
                                        fetchKnowledgeBase();
                                    }
                                }}
                                open={isViewDialogOpen}
                            >
                                <DialogTrigger asChild>
                                    <Button className="flex-1" size="sm" variant="outline">
                                        <Eye className="mr-2 h-3 w-3" />
                                        View
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>
                                            Agent ({knowledgeBase.length} items)
                                        </DialogTitle>
                                        <DialogDescription>
                                            Your personal knowledge stored for AI assistance
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ScrollArea className="max-h-96">
                                        <div className="space-y-3">
                                            {knowledgeBase.length === 0 ? (
                                                <div className="text-muted-foreground py-8 text-center">
                                                    No knowledge items yet. Start chatting to build
                                                    your knowledge base!
                                                </div>
                                            ) : (
                                                knowledgeBase.map((item) => (
                                                    <div
                                                        className="flex items-start justify-between gap-3 rounded-lg border p-3"
                                                        key={item.id}
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="break-words text-sm">
                                                                {item.content}
                                                            </p>
                                                            <p className="text-muted-foreground mt-1 text-xs">
                                                                {new Date(
                                                                    item.createdAt
                                                                ).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => setDeleteItemId(item.id)}
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </DialogContent>
                            </Dialog>

                            <Dialog onOpenChange={setIsClearDialogOpen} open={isClearDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="flex-1" size="sm" variant="outline">
                                        <Trash2 className="mr-2 h-3 w-3" />
                                        Clear
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Clear Agent</DialogTitle>
                                        <DialogDescription>
                                            This will permanently delete all {knowledgeBase.length}{' '}
                                            items from your knowledge base. This action cannot be
                                            undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() => setIsClearDialogOpen(false)}
                                            variant="outline"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            disabled={isClearing}
                                            onClick={clearKnowledgeBase}
                                            variant="destructive"
                                        >
                                            {isClearing ? 'Clearing...' : 'Clear All'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Individual Delete Confirmation Dialog */}
                        <Dialog onOpenChange={() => setDeleteItemId(null)} open={!!deleteItemId}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Delete Knowledge Item</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this item from your
                                        knowledge base?
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                    <Button onClick={() => setDeleteItemId(null)} variant="outline">
                                        Cancel
                                    </Button>
                                    <Button
                                        disabled={isDeleting}
                                        onClick={() =>
                                            deleteItemId && deleteKnowledgeItem(deleteItemId)
                                        }
                                        variant="destructive"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>

                {/* Model Configuration */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Settings className="h-4 w-4" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-xs font-medium">
                                CHAT MODEL
                            </div>
                            <div className="text-sm">{currentRagChatModel?.name || 'Unknown'}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-muted-foreground text-xs font-medium">
                                EMBEDDING MODEL
                            </div>
                            <div className="text-sm">
                                {currentEmbeddingModel?.name || 'Unknown'}
                            </div>
                            <div className="text-muted-foreground text-xs">
                                {currentEmbeddingModel?.provider} •{' '}
                                {currentEmbeddingModel?.dimensions}D
                            </div>
                        </div>
                        <Button
                            className="mt-3 w-full"
                            onClick={() => {
                                setIsSettingsOpen(true);
                                onClose?.();
                            }}
                            size="sm"
                            variant="outline"
                        >
                            <Settings className="mr-2 h-3 w-3" />
                            Open VT+ Settings
                        </Button>
                        <p className="text-muted-foreground text-xs">
                            Configure AI models, API keys, and embedding preferences in VT+
                            settings.
                        </p>
                    </CardContent>
                </Card>


            </div>
        </ScrollArea>
    );
}
