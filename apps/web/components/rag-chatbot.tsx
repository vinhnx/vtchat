'use client';

import { models } from '@repo/ai/models';
import { useApiKeysStore, useAppStore } from '@repo/common/store';
import { EMBEDDING_MODEL_CONFIG } from '@repo/shared/config/embedding-models';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
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
} from '@repo/ui';
import { useChat } from 'ai/react';
import { Database, Eye, Send, Settings, Shield, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { RagOnboarding } from './rag-onboarding';

interface KnowledgeItem {
    id: string;
    content: string;
    createdAt: string;
}

export function RAGChatbot() {
    const { data: session } = useSession();
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
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

    // Simple BYOK check - show onboarding if no required API keys
    const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
    const [hasCheckedApiKeys, setHasCheckedApiKeys] = useState(false);

    const allApiKeys = getAllKeys();
    const hasGeminiKey = !!allApiKeys['GEMINI_API_KEY'];
    const hasOpenAIKey = !!allApiKeys['OPENAI_API_KEY'];
    const hasRequiredKeys = hasGeminiKey || hasOpenAIKey;

    // Check for required API keys on component mount and when keys change
    useEffect(() => {
        if (!hasCheckedApiKeys) {
            setHasCheckedApiKeys(true);
            if (!hasRequiredKeys) {
                setShowApiKeyDialog(true);
            }
        } else if (!hasRequiredKeys && !showApiKeyDialog) {
            // Only show dialog if keys were removed and dialog isn't already open
            setShowApiKeyDialog(true);
        }
    }, [hasRequiredKeys, hasCheckedApiKeys, showApiKeyDialog]);

    // Ref for auto-scroll functionality
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
        api: '/api/chat/rag',
        maxSteps: 3,
        body: {
            apiKeys: allApiKeys,
            embeddingModel,
            ragChatModel,
            profile,
        },
        onError: (error) => {
            log.error({ error }, 'RAG Chat Error');
            log.info({ message: error.message }, 'Error message'); // Debug log

            // Show user-friendly error message with sonner (deferred to avoid render issues)
            setTimeout(() => {
                if (error.message.includes('API key is required')) {
                    log.info({}, 'Showing API key error toast'); // Debug
                    toast.error('API Key Required', {
                        description:
                            'Please configure your API keys in Settings to use the Knowledge Assistant.',
                    });
                } else if (error.message.includes('Rate limit')) {
                    log.info({}, 'Showing rate limit error toast'); // Debug
                    toast.error('Rate Limit Exceeded', {
                        description: 'Too many requests. Please try again later.',
                    });
                } else {
                    log.info({}, 'Showing general error toast'); // Debug
                    toast.error('Chat Error', {
                        description: 'Something went wrong. Please try again.',
                    });
                }
            }, 0);
        },
    });

    // Track if we're currently processing to avoid duplicate indicators
    const isProcessing =
        isLoading || messages.some((msg) => msg.role === 'assistant' && !msg.content.trim());

    const fetchKnowledgeBase = async () => {
        try {
            const response = await fetch('/api/rag/knowledge');
            if (response.ok) {
                const data = await response.json();
                const resources = data.resources || data.knowledge || [];
                log.info({ total: resources.length, data }, '📚 Knowledge Base fetched');
                setKnowledgeBase(resources);
            } else {
                log.error(
                    { status: response.status, statusText: response.statusText },
                    'Failed to fetch knowledge base'
                );
            }
        } catch (error) {
            log.error({ error }, 'Error fetching knowledge base');
        }
    };

    const clearKnowledgeBase = async () => {
        if (!session?.user?.id) return;

        setIsClearing(true);
        try {
            const response = await fetch('/api/rag/clear', {
                method: 'DELETE',
            });
            if (response.ok) {
                setKnowledgeBase([]);
                setIsClearDialogOpen(false);
                reload();
            }
        } catch (error) {
            log.error({ error }, 'Error clearing knowledge base');
        } finally {
            setIsClearing(false);
        }
    };

    const deleteKnowledgeItem = async (id: string) => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/rag/delete?id=${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setKnowledgeBase((prev) => prev.filter((item) => item.id !== id));
                setDeleteItemId(null);
                reload();
            }
        } catch (error) {
            log.error({ error }, 'Error deleting knowledge item');
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

    // Get model info for display
    const currentEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel];
    const currentRagChatModel = models.find((m) => m.id === ragChatModel);

    return (
        <div className="flex h-full gap-6">
            <div className="flex flex-1 flex-col">
                {/* Chat Messages */}
                <ScrollArea className="w-full flex-1">
                    <div className="space-y-4 p-4">
                        {messages.length === 0 && (
                            <div className="text-muted-foreground py-12 text-center">
                                <h3 className="text-foreground mb-2 text-xl font-semibold">
                                    Personal AI Assistant with Memory
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-sm">
                                    Build your personal AI assistant with your own knowledge. Store
                                    information and get intelligent answers.
                                </p>

                                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 text-xs md:grid-cols-3">
                                    <div className="bg-card rounded-xl border p-4">
                                        <div className="mb-2 flex justify-center">
                                            <Database className="text-muted-foreground h-6 w-6" />
                                        </div>
                                        <div className="font-medium">Smart Retrieval</div>
                                        <div className="text-muted-foreground">
                                            AI finds relevant info from your knowledge base
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-xl border p-4">
                                        <div className="mb-2 flex justify-center">
                                            <Shield className="text-muted-foreground h-6 w-6" />
                                        </div>
                                        <div className="font-medium">Private & Secure</div>
                                        <div className="text-muted-foreground">
                                            Your data stays secure and private
                                        </div>
                                    </div>
                                    <div className="bg-card rounded-xl border p-4">
                                        <div className="mb-2 flex justify-center">
                                            <Database className="text-muted-foreground h-6 w-6" />
                                        </div>
                                        <div className="font-medium">Contextual Answers</div>
                                        <div className="text-muted-foreground">
                                            Get answers based on your personal knowledge
                                        </div>
                                    </div>
                                </div>
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
                                        <div className="border-primary/20 bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                                            <svg
                                                height="16"
                                                viewBox="-7.5 0 32 32"
                                                width="16"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    className="text-primary"
                                                    d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z"
                                                    fill="currentColor"
                                                />
                                            </svg>
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
                                                            Chat:{' '}
                                                            {currentRagChatModel?.name || 'Unknown'}
                                                        </span>
                                                        <span>•</span>
                                                        <span>
                                                            Embed:{' '}
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
                                <div className="border-primary/20 bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
                                    <svg
                                        height="16"
                                        viewBox="-7.5 0 32 32"
                                        width="16"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            className="text-primary"
                                            d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="bg-muted max-w-[80%] rounded-lg p-3">
                                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                                <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
                                            </div>
                                            <span className="ml-2">AI is thinking...</span>
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
                    {!hasRequiredKeys && (
                        <div className="mb-3 rounded-lg bg-amber-50 p-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-amber-700">
                                    Please add your API keys to use the Knowledge Assistant
                                </span>
                                <Button
                                    className="text-xs"
                                    onClick={() => setShowApiKeyDialog(true)}
                                    size="sm"
                                    variant="outline"
                                >
                                    Add API Keys
                                </Button>
                            </div>
                        </div>
                    )}

                    <form className="flex gap-2" onSubmit={handleSubmit}>
                        <Input
                            className="flex-1"
                            disabled={isLoading || !hasRequiredKeys}
                            onChange={handleInputChange}
                            placeholder={
                                hasRequiredKeys
                                    ? 'Ask anything or share knowledge...'
                                    : 'Add API keys to continue chatting...'
                            }
                            value={input}
                        />
                        <Button
                            disabled={isLoading || !input.trim() || !hasRequiredKeys}
                            size="icon"
                            type="submit"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l">
                <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                        {/* Knowledge Base Management */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Database className="h-4 w-4" />
                                    Knowledge Base
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
                                                    Knowledge Base ({knowledgeBase.length} items)
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Your personal knowledge stored for AI assistance
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="max-h-96">
                                                <div className="space-y-3">
                                                    {knowledgeBase.length === 0 ? (
                                                        <div className="text-muted-foreground py-8 text-center">
                                                            No knowledge items yet. Start chatting
                                                            to build your knowledge base!
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
                                                                    onClick={() =>
                                                                        setDeleteItemId(item.id)
                                                                    }
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

                                    <Dialog
                                        onOpenChange={setIsClearDialogOpen}
                                        open={isClearDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="flex-1" size="sm" variant="outline">
                                                <Trash2 className="mr-2 h-3 w-3" />
                                                Clear
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Clear Knowledge Base</DialogTitle>
                                                <DialogDescription>
                                                    This will permanently delete all{' '}
                                                    {knowledgeBase.length} items from your knowledge
                                                    base. This action cannot be undone.
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
                                <Dialog
                                    onOpenChange={() => setDeleteItemId(null)}
                                    open={!!deleteItemId}
                                >
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Knowledge Item</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this item from your
                                                knowledge base?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => setDeleteItemId(null)}
                                                variant="outline"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                disabled={isDeleting}
                                                onClick={() =>
                                                    deleteItemId &&
                                                    deleteKnowledgeItem(deleteItemId)
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
                                    <div className="text-sm">
                                        {currentRagChatModel?.name || 'Unknown'}
                                    </div>
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
                                    onClick={() => setIsSettingsOpen(true)}
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

                        {/* Feature Benefits */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">How it works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div className="flex gap-2">
                                    <Database className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">Smart Context</div>
                                        <div className="text-muted-foreground">
                                            AI finds relevant info from your knowledge base
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Database className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">Persistent Memory</div>
                                        <div className="text-muted-foreground">
                                            Build a growing knowledge base over time
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </ScrollArea>
            </div>

            {/* API Key Dialog */}
            <RagOnboarding
                isOpen={showApiKeyDialog}
                onComplete={() => {
                    setShowApiKeyDialog(false);
                    setHasCheckedApiKeys(true);
                }}
                onSkip={() => {
                    setShowApiKeyDialog(false);
                    setHasCheckedApiKeys(true);
                }}
            />
        </div>
    );
}
