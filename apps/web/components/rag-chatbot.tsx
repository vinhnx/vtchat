'use client';

import { models } from '@repo/ai/models';
import { useApiKeysStore, useAppStore } from '@repo/common/store';
import { EMBEDDING_MODEL_CONFIG } from '@repo/shared/config/embedding-models';
import { useSession } from '@repo/shared/lib/auth-client';
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
import {
    Database,
    Eye,
    Send,
    Settings,
    Shield,
    Trash2,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface KnowledgeItem {
    id: string;
    content: string;
    createdAt: string;
}

export function RAGChatbot() {
    const { data: session } = useSession();
    const getAllKeys = useApiKeysStore(state => state.getAllKeys);
    const embeddingModel = useAppStore(state => state.embeddingModel);
    const ragChatModel = useAppStore(state => state.ragChatModel);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Ref for auto-scroll functionality
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Track if we're currently processing to avoid duplicate indicators
    const isProcessing = isLoading || messages.some(msg => msg.role === 'assistant' && !msg.content.trim());

    const { messages, input, handleInputChange, handleSubmit, isLoading, reload } = useChat({
        api: '/api/chat/rag',
        maxSteps: 3,
        body: {
            apiKeys: getAllKeys(),
            embeddingModel,
            ragChatModel,
        },
    });

    const fetchKnowledgeBase = async () => {
        try {
            const response = await fetch('/api/rag/knowledge');
            if (response.ok) {
                const data = await response.json();
                const resources = data.resources || data.knowledge || [];
                console.log('📚 Knowledge Base fetched:', { total: resources.length, data });
                setKnowledgeBase(resources);
            } else {
                console.error('Failed to fetch knowledge base:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Error fetching knowledge base:', error);
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
            console.error('Error clearing knowledge base:', error);
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
                setKnowledgeBase(prev => prev.filter(item => item.id !== id));
                setDeleteItemId(null);
                reload();
            }
        } catch (error) {
            console.error('Error deleting knowledge item:', error);
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
    }, [messages]);

    // Scroll to bottom when messages change or when processing state changes
    useEffect(() => {
        scrollToBottom();
    }, [messages, isProcessing]);

    // Get model info for display
    const currentEmbeddingModel = EMBEDDING_MODEL_CONFIG[embeddingModel];
    const currentRagChatModel = models.find(m => m.id === ragChatModel);

    return (
        <div className="flex h-full gap-6">
            <div className="flex flex-1 flex-col">
                {/* Chat Messages */}
                <ScrollArea className="w-full flex-1">
                    <div className="space-y-4 p-4">
                        {messages.length === 0 && (
                            <div className="text-muted-foreground py-12 text-center">
                                <h3 className="text-foreground mb-2 text-xl font-semibold">
                                    RAG Knowledge Chat
                                </h3>
                                <p className="mx-auto mb-6 max-w-md text-sm">
                                    Build your personal AI assistant with your own knowledge. Store
                                    information and get intelligent answers.
                                </p>

                                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 text-xs md:grid-cols-3">
                                    <div className="rounded-xl border bg-card p-4">
                                        <div className="flex justify-center mb-2">
                                            <Database className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="font-medium">Smart Retrieval</div>
                                        <div className="text-muted-foreground">
                                            AI finds relevant info from your knowledge base
                                        </div>
                                    </div>
                                    <div className="rounded-xl border bg-card p-4">
                                        <div className="flex justify-center mb-2">
                                            <Shield className="h-6 w-6 text-muted-foreground" />
                                        </div>
                                        <div className="font-medium">Private & Secure</div>
                                        <div className="text-muted-foreground">
                                            Your data stays secure and private
                                        </div>
                                    </div>
                                    <div className="rounded-xl border bg-card p-4">
                                        <div className="flex justify-center mb-2">
                                            <Database className="h-6 w-6 text-muted-foreground" />
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
                            .filter(message => message.content && message.content.trim())
                            .map((message, index) => (
                            <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                {message.role === 'user' ? (
                                    <Avatar 
                                        name={session?.user?.name || 'User'}
                                        src={session?.user?.image ?? undefined}
                                        size="md"
                                        className="h-8 w-8 shrink-0"
                                    />
                                ) : (
                                    <div className="h-8 w-8 shrink-0 flex items-center justify-center bg-muted rounded-full overflow-hidden">
                                        <svg width="20" height="20" viewBox="-7.5 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                            <rect x="-7.5" y="0" width="32" height="32" fill="currentColor" className="text-muted-foreground"/>
                                            <path d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z" 
                                                  fill="none" 
                                                  stroke="currentColor" 
                                                  strokeWidth="1"
                                                  className="text-background"/>
                                        </svg>
                                    </div>
                                )}
                                <div className={`flex-1 space-y-2 ${message.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                    <div className={`rounded-lg p-3 max-w-[80%] ${
                                        message.role === 'user' 
                                            ? 'bg-primary text-primary-foreground ml-auto' 
                                            : 'bg-muted'
                                    }`}>
                                        <div className="text-sm">
                                            {message.content}
                                        </div>
                                        {message.role === 'assistant' && (
                                            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <span>Chat: {currentRagChatModel?.name || 'Unknown'}</span>
                                                    <span>•</span>
                                                    <span>Embed: {currentEmbeddingModel?.name || 'Unknown'}</span>
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
                                <div className="h-8 w-8 shrink-0 flex items-center justify-center bg-muted rounded-full overflow-hidden">
                                    <svg width="20" height="20" viewBox="-7.5 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="-7.5" y="0" width="32" height="32" fill="currentColor" className="text-muted-foreground"/>
                                        <path d="M8.406 20.625l5.281-11.469h2.469l-7.75 16.844-7.781-16.844h2.469z" 
                                              fill="none" 
                                              stroke="currentColor" 
                                              strokeWidth="1"
                                              className="text-background"/>
                                    </svg>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="rounded-lg bg-muted p-3 max-w-[80%]">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="h-2 w-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="h-2 w-2 bg-current rounded-full animate-bounce"></div>
                                            </div>
                                            <span className="ml-2">AI is thinking...</span>
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground/70">
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
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder="Ask anything or share knowledge..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button 
                            type="submit" 
                            disabled={isLoading || !input.trim()}
                            size="icon"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l">
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-4">
                        {/* Knowledge Base Management */}
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Database className="h-4 w-4" />
                                    Knowledge Base
                                    <Badge variant="secondary" className="ml-auto">
                                        {knowledgeBase.length}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex gap-2">
                                    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Eye className="mr-2 h-3 w-3" />
                                                View
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl max-h-[80vh]">
                                            <DialogHeader>
                                                <DialogTitle>Knowledge Base ({knowledgeBase.length} items)</DialogTitle>
                                                <DialogDescription>
                                                    Your personal knowledge stored for RAG retrieval
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="max-h-96">
                                                <div className="space-y-3">
                                                    {knowledgeBase.length === 0 ? (
                                                        <div className="text-center py-8 text-muted-foreground">
                                                            No knowledge items yet. Start chatting to build your knowledge base!
                                                        </div>
                                                    ) : (
                                                        knowledgeBase.map((item) => (
                                                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm break-words">{item.content}</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setDeleteItemId(item.id)}
                                                                    className="text-destructive hover:text-destructive"
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

                                    <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                <Trash2 className="mr-2 h-3 w-3" />
                                                Clear
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Clear Knowledge Base</DialogTitle>
                                                <DialogDescription>
                                                    This will permanently delete all {knowledgeBase.length} items from your knowledge base. This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    variant="destructive" 
                                                    onClick={clearKnowledgeBase}
                                                    disabled={isClearing}
                                                >
                                                    {isClearing ? 'Clearing...' : 'Clear All'}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Individual Delete Confirmation Dialog */}
                                <Dialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Delete Knowledge Item</DialogTitle>
                                            <DialogDescription>
                                                Are you sure you want to delete this item from your knowledge base?
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setDeleteItemId(null)}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={() => deleteItemId && deleteKnowledgeItem(deleteItemId)}
                                                disabled={isDeleting}
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
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Settings className="h-4 w-4" />
                                    Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">CHAT MODEL</div>
                                    <div className="text-sm">
                                        {currentRagChatModel?.name || 'Unknown'}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">EMBEDDING MODEL</div>
                                    <div className="text-sm">
                                        {currentEmbeddingModel?.name || 'Unknown'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {currentEmbeddingModel?.provider} • {currentEmbeddingModel?.dimensions}D
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full mt-3"
                                    onClick={() => setIsSettingsOpen(true)}
                                >
                                    <Settings className="mr-2 h-3 w-3" />
                                    Open VT+ Settings
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Configure AI models, API keys, and embedding preferences in VT+ settings.
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
                                    <Database className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                    <div>
                                        <div className="font-medium">Smart Context</div>
                                        <div className="text-muted-foreground">
                                            AI finds relevant info from your knowledge base
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Database className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
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
        </div>
    );
}
