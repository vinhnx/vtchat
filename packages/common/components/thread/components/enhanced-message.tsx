import { ChatEditor, markdownStyles } from '@repo/common/components';
import { useAgentStream, useChatEditor, useCopyText } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { ThreadItem } from '@repo/shared/types';
import { Button, cn, useToast } from '@repo/ui';
import { Check, Copy, Pencil, Clock, CheckCheck, MessageCircle } from 'lucide-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AttachmentDisplay } from './attachment-display';
import { DocumentDisplay } from './document-display';
import { ImageMessage } from './image-message';

type MessageProps = {
    message: string;
    imageAttachment?: string;
    threadItem: ThreadItem;
};

export const EnhancedMessage = memo(({ message, imageAttachment, threadItem }: MessageProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const { copyToClipboard, status } = useCopyText();
    const maxHeight = 120;
    const isGenerating = useChatStore(state => state.isGenerating);

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

    const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);

    // Enhanced message status indicator
    const getMessageStatus = () => {
        if (threadItem.status === 'PENDING') return 'sending';
        if (threadItem.status === 'COMPLETED') return 'delivered';
        if (threadItem.status === 'ERROR') return 'error';
        return 'sent';
    };

    const MessageStatusIcon = ({ status }: { status: string }) => {
        const iconProps = { size: 12, className: "opacity-70" };
        
        switch (status) {
            case 'sending':
                return <Clock {...iconProps} className="animate-pulse opacity-50" />;
            case 'sent':
                return <Check {...iconProps} />;
            case 'delivered':
                return <CheckCheck {...iconProps} className="text-blue-500" />;
            case 'error':
                return <MessageCircle {...iconProps} className="text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <motion.div 
            className="flex w-full flex-col items-end gap-3 pt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            {imageAttachment && <ImageMessage imageAttachment={imageAttachment} />}
            {threadItem.documentAttachment && (
                <DocumentDisplay documentAttachment={threadItem.documentAttachment} />
            )}
            {threadItem.attachments && threadItem.attachments.length > 0 && (
                <AttachmentDisplay attachments={threadItem.attachments} />
            )}

            <div className="relative max-w-[85%] sm:max-w-[80%]">
                {/* Enhanced message bubble with premium styling */}
                <motion.div
                    className={cn(
                        'group relative overflow-hidden rounded-2xl transition-all duration-200',
                        'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg',
                        'hover:shadow-xl hover:scale-[1.01] active:scale-[0.99]',
                        'border border-blue-400/30',
                        isEditing && 'ring-2 ring-blue-300 ring-offset-2'
                    )}
                    whileHover={{ y: -1 }}
                >
                    {/* Message content */}
                    {!isEditing ? (
                        <>
                            <div
                                ref={messageRef}
                                className={cn(
                                    'relative px-4 py-3 text-[15px] leading-relaxed font-medium',
                                    'selection:bg-blue-200/30',
                                    {
                                        'pb-14': isExpanded,
                                        markdownStyles,
                                    }
                                )}
                                style={{
                                    maxHeight: isExpanded ? 'none' : maxHeight,
                                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                {message}
                            </div>

                            {/* Enhanced action buttons with premium styling */}
                            <AnimatePresence>
                                {(showExpandButton || true) && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                    >
                                        <div className="bg-gradient-to-t from-blue-600 via-blue-600/95 to-transparent flex w-full items-center justify-between gap-2 px-4 py-3">
                                            {showExpandButton && (
                                                <Button
                                                    variant="ghost"
                                                    size="xs"
                                                    rounded="full"
                                                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-105"
                                                    onClick={toggleExpand}
                                                >
                                                    {isExpanded ? 'Show less' : 'Show more'}
                                                </Button>
                                            )}

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110"
                                                    onClick={handleCopy}
                                                    tooltip={status === 'copied' ? 'Copied!' : 'Copy message'}
                                                >
                                                    <motion.div
                                                        animate={status === 'copied' ? { scale: [1, 1.2, 1] } : {}}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        {status === 'copied' ? (
                                                            <Check size={14} strokeWidth={2.5} />
                                                        ) : (
                                                            <Copy size={14} strokeWidth={2} />
                                                        )}
                                                    </motion.div>
                                                </Button>

                                                <Button
                                                    disabled={
                                                        isGenerating ||
                                                        threadItem.status === 'QUEUED' ||
                                                        threadItem.status === 'PENDING'
                                                    }
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 hover:scale-110 disabled:opacity-50"
                                                    tooltip="Edit message"
                                                    onClick={() => setIsEditing(true)}
                                                >
                                                    <Pencil size={14} strokeWidth={2} />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <EditMessage
                            width={messageRef.current?.offsetWidth}
                            message={message}
                            threadItem={threadItem}
                            onCancel={() => setIsEditing(false)}
                        />
                    )}
                </motion.div>

                {/* Message status and timestamp */}
                <div className="flex items-center justify-end gap-2 mt-1 px-1">
                    <span className="text-xs text-muted-foreground/70">
                        {new Date(threadItem.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </span>
                    <MessageStatusIcon status={getMessageStatus()} />
                </div>
            </div>
        </motion.div>
    );
});

// Enhanced edit message component
export type TEditMessage = {
    message: string;
    onCancel: () => void;
    threadItem: ThreadItem;
    width?: number;
};

export const EditMessage = memo(({ message, onCancel, threadItem, width }: TEditMessage) => {
    const { handleSubmit } = useAgentStream();
    const removeFollowupThreadItems = useChatStore(state => state.removeFollowupThreadItems);
    const getThreadItems = useChatStore(state => state.getThreadItems);
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
        removeFollowupThreadItems(threadItem.id);

        const formData = new FormData();
        formData.append('query', query);
        formData.append('imageAttachment', threadItem.imageAttachment || '');
        const threadItems = await getThreadItems(threadItem.threadId);

        handleSubmit({
            formData,
            existingThreadItemId: threadItem.id,
            messages: threadItems,
            newChatMode: threadItem.mode,
            useWebSearch: false,
        });
    };

    return (
        <motion.div 
            className="relative flex max-w-full flex-col items-end gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div
                className="relative px-4 py-3 text-base font-medium bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                style={{
                    minWidth: width,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <ChatEditor
                    maxHeight="120px"
                    editor={editor}
                    sendMessage={() => handleSave(editor?.getText() || '')}
                    className={cn(
                        'text-white placeholder:text-white/70 max-w-full overflow-y-auto !p-0 border-none focus:ring-0',
                        markdownStyles
                    )}
                />
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                    onClick={() => handleSave(editor?.getText() || '')}
                >
                    Save Changes
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </div>
        </motion.div>
    );
});

EnhancedMessage.displayName = 'EnhancedMessage';
