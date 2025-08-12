'use client';

import { ChatEditor, markdownStyles } from '@repo/common/components';
import { useAgentStream, useChatEditor, useCopyText } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/lib/logger';
import type { ThreadItem } from '@repo/shared/types';
import { Button, cn, UnifiedAvatar, useToast } from '@repo/ui';
import { motion } from 'framer-motion';
import { Check, Copy, Pencil, User } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AttachmentDisplay } from './attachment-display';
import { DocumentDisplay } from './document-display';
import { ImageMessage } from './image-message';
import './message-animations.css';

type UserMessageProps = {
    message: string;
    imageAttachment?: string;
    threadItem: ThreadItem;
};

/**
 * Enhanced user message component with avatar and visual differentiation
 * Provides clear distinction from AI responses with right-aligned layout
 */
export const UserMessage = memo(({ message, imageAttachment, threadItem }: UserMessageProps) => {
    const { data: session } = useSession();
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const { copyToClipboard, status } = useCopyText();
    const maxHeight = 120;
    const isGenerating = useChatStore((state) => state.isGenerating);

    useEffect(() => {
        if (messageRef.current) {
            setShowExpandButton(messageRef.current.scrollHeight > maxHeight);
        }
    }, [message]);

    const handleCopy = useCallback(() => {
        if (messageRef.current) {
            copyToClipboard(messageRef.current);
        }
    }, [copyToClipboard]);

    const handleEdit = useCallback(() => {
        if (!isGenerating) {
            setIsEditing(true);
        }
    }, [isGenerating]);

    const handleToggleExpand = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    if (isEditing) {
        return (
            <EditUserMessage
                message={message}
                onCancel={() => setIsEditing(false)}
                threadItem={threadItem}
                width={messageRef.current?.offsetWidth}
            />
        );
    }

    return (
        <motion.div
            animate={{ opacity: 1, y: 0 }}
            className={cn('group flex w-full justify-end gap-3', 'message-container user-message')}
            initial={{ opacity: 0, y: 5 }}
            transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
                type: 'tween',
            }}
        >
            {/* Message content container */}
            <div className='flex max-w-[85%] flex-col items-end gap-2 sm:max-w-[75%]'>
                {/* Message bubble with enhanced styling */}
                <div
                    className={cn(
                        'relative rounded-2xl transition-all duration-200 ease-out',
                        'border-border/50 from-primary/5 to-primary/10 border bg-gradient-to-br',
                        'shadow-sm hover:shadow-md',
                        'backdrop-blur-sm',
                        'message-bubble',
                        isEditing && 'ring-primary/30 ring-2 ring-offset-2',
                    )}
                >
                    {/* Message content */}
                    <div
                        className={cn(
                            'relative px-4 py-3 text-[15px] leading-relaxed',
                            'text-foreground selection:bg-primary/20',
                            'overflow-hidden whitespace-pre-wrap break-words', // Add word wrapping and overflow control
                            {
                                'pb-14': isExpanded,
                                markdownStyles,
                            },
                        )}
                        ref={messageRef}
                        style={{
                            maxHeight: isExpanded ? 'none' : maxHeight,
                            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        role='article'
                        aria-label='User message'
                    >
                        {message}
                    </div>

                    {/* Action buttons overlay - show on hover */}
                    <div
                        className={cn(
                            'absolute bottom-2 left-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                            'message-actions',
                        )}
                    >
                        <div className='bg-background/80 border-border/20 flex items-center gap-1 rounded-lg border p-1 shadow-lg backdrop-blur-md'>
                            <Button
                                onClick={handleCopy}
                                size='xs'
                                variant='ghost'
                                className={cn('h-6 w-6 p-0', 'message-action-button')}
                                aria-label='Copy message'
                            >
                                {status === 'copied'
                                    ? <Check className='h-3 w-3' />
                                    : <Copy className='h-3 w-3' />}
                            </Button>
                            <Button
                                onClick={handleEdit}
                                size='xs'
                                variant='ghost'
                                className={cn('h-6 w-6 p-0', 'message-action-button')}
                                disabled={isGenerating}
                                aria-label='Edit message'
                            >
                                <Pencil className='h-3 w-3' />
                            </Button>
                        </div>
                    </div>

                    {/* Expand button for long messages */}
                    {showExpandButton && (
                        <div className='absolute bottom-2 right-2'>
                            <div className='bg-background/80 border-border/20 rounded-lg border p-1 shadow-lg backdrop-blur-md'>
                                <Button
                                    onClick={handleToggleExpand}
                                    size='xs'
                                    variant='ghost'
                                    className={cn(
                                        'h-6 px-2 text-xs transition-opacity duration-200',
                                        'message-action-button',
                                    )}
                                >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Attachments */}
                {imageAttachment && (
                    <div className='w-full'>
                        <ImageMessage imageAttachment={imageAttachment} />
                    </div>
                )}
                {threadItem.documentAttachment && (
                    <div className='w-full'>
                        <DocumentDisplay documentAttachment={threadItem.documentAttachment} />
                    </div>
                )}
                {threadItem.attachments && threadItem.attachments.length > 0 && (
                    <div className='w-full'>
                        <AttachmentDisplay attachments={threadItem.attachments} />
                    </div>
                )}
            </div>

            {/* User avatar - aligned with message top */}
            <motion.div
                animate={{ scale: 1, opacity: 1 }}
                className='flex-shrink-0 self-start'
                initial={{ scale: 0.8, opacity: 0 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            >
                <div className='relative mt-1'>
                    <UnifiedAvatar
                        name={session?.user?.name || session?.user?.email || 'User'}
                        src={session?.user?.image
                            ? getSessionCacheBustedAvatarUrl(session.user.image)
                            : undefined}
                        size='md'
                        className={cn(
                            'border-2 shadow-sm',
                            'border-[#D99A4E] dark:border-[#BFB38F]',
                            'ring-background ring-2',
                            'transition-all duration-200',
                            'hover:border-[#D99A4E]/80 hover:shadow-md dark:hover:border-[#BFB38F]/80',
                            'message-avatar',
                        )}
                        fallback={
                            <div className='bg-primary/10 text-primary flex h-full w-full items-center justify-center'>
                                <User className='h-4 w-4' />
                            </div>
                        }
                    />
                </div>
            </motion.div>
        </motion.div>
    );
});

UserMessage.displayName = 'UserMessage';

// Edit message component
type EditUserMessageProps = {
    message: string;
    onCancel: () => void;
    threadItem: ThreadItem;
    width?: number;
};

const EditUserMessage = memo(({ message, onCancel, threadItem, width }: EditUserMessageProps) => {
    const { handleSubmit } = useAgentStream();
    const removeFollowupThreadItems = useChatStore((state) => state.removeFollowupThreadItems);
    const getThreadItems = useChatStore((state) => state.getThreadItems);
    const updateThreadItem = useChatStore((state) => state.updateThreadItem);
    const { editor } = useChatEditor({ defaultContent: message });
    const { toast } = useToast();

    const handleSave = async (query: string) => {
        if (!query.trim()) {
            toast({
                title: 'Please enter a message',
                variant: 'destructive',
            });
            return;
        }

        try {
            // Update the current thread item with the new query
            await updateThreadItem(threadItem.threadId, {
                id: threadItem.id,
                query: query.trim(),
            });

            // Remove all subsequent thread items (AI responses and follow-ups)
            removeFollowupThreadItems(threadItem.id);

            // Prepare form data for the new request
            const formData = new FormData();
            formData.append('query', query.trim());
            formData.append('imageAttachment', threadItem.imageAttachment || '');

            // Get updated thread items (up to the edited message)
            const threadItems = await getThreadItems(threadItem.threadId);
            const contextMessages = threadItems.filter(
                (item) => new Date(item.createdAt) <= new Date(threadItem.createdAt),
            );

            // Submit the edited message as a new chat request
            handleSubmit({
                formData,
                existingThreadItemId: threadItem.id,
                messages: contextMessages,
                newChatMode: threadItem.mode,
                useWebSearch: false,
            });

            onCancel();

            toast({
                title: 'Message updated',
                description: 'Your message has been edited and a new response is being generated.',
            });
        } catch (err) {
            log.error({ error: err }, 'Error updating message');
            toast({
                title: 'Error updating message',
                description: 'Failed to update the message. Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <motion.div
            animate={{ opacity: 1 }}
            className={cn('flex w-full justify-end', 'edit-container')}
            initial={{ opacity: 0 }}
            transition={{
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1],
                type: 'tween',
            }}
        >
            <div
                className={cn(
                    'border-primary/30 bg-primary/5 relative max-w-[85%] rounded-2xl border px-4 py-3 backdrop-blur-sm sm:max-w-[75%]',
                    'transform-gpu will-change-transform',
                )}
                style={{
                    minWidth: width,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <ChatEditor
                    className={cn(
                        'text-foreground placeholder:text-muted-foreground max-w-full overflow-y-auto border-none !p-0 focus:ring-0',
                        markdownStyles,
                    )}
                    editor={editor}
                    maxHeight='120px'
                    sendMessage={() => handleSave(editor?.getText() || '')}
                />
                <div className='mt-3 flex items-center justify-end gap-2'>
                    <Button
                        onClick={() => handleSave(editor?.getText() || '')}
                        size='xs'
                        className='h-7'
                    >
                        Save
                    </Button>
                    <Button onClick={onCancel} size='xs' variant='outline' className='h-7'>
                        Cancel
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});

EditUserMessage.displayName = 'EditUserMessage';
