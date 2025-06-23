'use client';

import { useChat } from 'ai/react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Badge } from '@repo/ui';
import { Send, Bot, User, Database } from 'lucide-react';
import { useApiKeysStore, useAppStore } from '@repo/common/store';

export function RAGChatbot() {
    const getAllKeys = useApiKeysStore(state => state.getAllKeys);
    const embeddingModel = useAppStore(state => state.embeddingModel);
    const ragChatModel = useAppStore(state => state.ragChatModel);
    
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/chat/rag',
        maxSteps: 3,
        body: {
            apiKeys: getAllKeys(),
            embeddingModel,
            ragChatModel,
        },
    });

    return (
        <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    RAG Knowledge Chat
                    <Badge variant="secondary">Plus Feature</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Chat with your personal knowledge base. Add information and ask questions about it later.
                </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col space-y-4">
                <div className="flex-1 w-full overflow-y-auto">
                    <div className="space-y-4 p-4">
                        {messages.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">Start building your knowledge base</p>
                                <p className="text-sm">
                                    Share information or ask questions about what you've stored.
                                </p>
                            </div>
                        )}
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                            >
                                {message.role === 'assistant' && (
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-muted-foreground'
                                    }`}
                                >
                                    {message.content.length > 0 ? (
                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                    ) : (
                                        <span className="italic text-sm opacity-70">
                                            {message.toolInvocations?.[0]?.toolName === 'addResource'
                                                ? 'Adding to knowledge base...'
                                                : message.toolInvocations?.[0]?.toolName === 'getInformation'
                                                ? 'Searching knowledge base...'
                                                : 'Processing...'}
                                        </span>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-muted text-muted-foreground rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        placeholder="Share knowledge or ask a question..."
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
