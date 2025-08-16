'use client';
import { ChatModeOptions } from '@repo/common/components';
import { useAgentStream, useCopyText, useContextualFeedback } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { type ChatMode, getChatModeName } from '@repo/shared/config';
import type { ThreadItem } from '@repo/shared/types';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    DropdownMenu,
    DropdownMenuTrigger,
    CopyButton,
    ContextualNotification,
} from '@repo/ui';
import {
    AlertCircle,
    Check,
    Clipboard,
    FileText,
    MessageCircleX,
    RefreshCcw,
    Trash2,
} from 'lucide-react';
import React, { forwardRef, useState } from 'react';

type MessageActionsProps = {
    threadItem: ThreadItem;
    isLast: boolean;
};

export const MessageActions = forwardRef<HTMLDivElement, MessageActionsProps>(
    ({ threadItem, isLast }, ref) => {
        const { handleSubmit } = useAgentStream();
        const removeThreadItem = useChatStore((state) => state.deleteThreadItem);
        const getThreadItems = useChatStore((state) => state.getThreadItems);
        const useWebSearch = useChatStore((state) => state.useWebSearch);
        const [chatMode, setChatMode] = useState<ChatMode>(threadItem.mode);
        const { copyToClipboard, status, copyMarkdown, markdownCopyStatus } = useCopyText();
        const copyFeedback = useContextualFeedback({ successDuration: 1500 });
        const markdownCopyFeedback = useContextualFeedback({ successDuration: 1500 });
        const [gatedFeatureAlert, setGatedFeatureAlert] = useState<
            {
                feature?: string;
                plan?: string;
                title: string;
                message: string;
            } | null
        >(null);

        const handleGatedFeature = React.useCallback(
            (gateInfo: { feature?: string; plan?: string; title: string; message: string; }) => {
                setGatedFeatureAlert(gateInfo);
            },
            [],
        );
        return (
            <div className='flex flex-col gap-2'>
                <div className='flex flex-row items-center gap-1 py-2'>
                    {threadItem?.answer?.text && (
                        <div className='relative'>
                            <CopyButton
                                className='bg-muted/30 text-muted-foreground hover:bg-muted h-8 rounded-md border px-3'
                                onCopy={async () => {
                                    await copyFeedback.executeAction(async () => {
                                        if (ref && 'current' in ref && ref.current) {
                                            const success = await copyToClipboard(ref.current);
                                            if (!success) throw new Error('Copy failed');
                                        }
                                    });
                                }}
                                size='icon-sm'
                                tooltip='Copy text'
                                variant='secondary'
                                resetDelay={1500}
                            />
                            <ContextualNotification
                                position='overlay'
                                show={copyFeedback.status === 'success'}
                                variant='success'
                                overlayOffset={{ y: -35 }}
                                className='text-xs'
                            >
                                Copied!
                            </ContextualNotification>
                        </div>
                    )}

                    {threadItem?.answer?.text && (
                        <div className='relative'>
                            <CopyButton
                                className='bg-muted/30 text-muted-foreground hover:bg-muted h-8 rounded-md border px-3'
                                idleIcon={<FileText className='h-4 w-4' strokeWidth={2} />}
                                onCopy={async () => {
                                    await markdownCopyFeedback.executeAction(async () => {
                                        // Get text content from the DOM element (same as regular copy)
                                        let textContent = '';
                                        if (ref && 'current' in ref && ref.current) {
                                            textContent = ref.current.innerText || ref.current.textContent || '';
                                        }

                                        // Build references section
                                        const referencesSection = threadItem?.sources?.length
                                            ? `\n\n## References\n${
                                                threadItem.sources
                                                    .map((source) => `[${source.index}] ${source.link}`)
                                                    .join('\n')
                                            }`
                                            : '';

                                        const success = await copyMarkdown(`${textContent}${referencesSection}`);
                                        if (!success) throw new Error('Markdown copy failed');
                                    });
                                }}
                                size='icon-sm'
                                tooltip='Copy as Markdown'
                                variant='secondary'
                                resetDelay={1500}
                            />
                            <ContextualNotification
                                position='overlay'
                                show={markdownCopyFeedback.status === 'success'}
                                variant='success'
                                overlayOffset={{ y: -35 }}
                                className='text-xs'
                            >
                                Markdown copied!
                            </ContextualNotification>
                        </div>
                    )}
                    {threadItem.status !== 'ERROR'
                        && threadItem.answer?.status !== 'HUMAN_REVIEW' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size='icon-sm'
                                    tooltip='Rewrite'
                                    variant='secondary'
                                    className='bg-muted/30 text-muted-foreground hover:bg-muted h-8 rounded-md border px-3'
                                >
                                    <RefreshCcw className='h-4 w-4' strokeWidth={2} />
                                </Button>
                            </DropdownMenuTrigger>
                            <ChatModeOptions
                                chatMode={chatMode}
                                onGatedFeature={handleGatedFeature}
                                setChatMode={async (mode) => {
                                    setChatMode(mode);
                                    const formData = new FormData();
                                    formData.append('query', threadItem.query || '');
                                    const threadItems = await getThreadItems(
                                        threadItem.threadId,
                                    );
                                    handleSubmit({
                                        formData,
                                        existingThreadItemId: threadItem.id,
                                        newChatMode: mode as any,
                                        messages: threadItems,
                                        useWebSearch,
                                    });
                                }}
                            />
                        </DropdownMenu>
                    )}

                    {isLast && (
                        <Button
                            onClick={() => {
                                removeThreadItem(threadItem.id);
                            }}
                            size='icon-sm'
                            tooltip='Remove'
                            variant='secondary'
                            className='bg-muted/30 text-muted-foreground hover:bg-muted h-8 rounded-md border px-3'
                        >
                            <MessageCircleX className='h-4 w-4' strokeWidth={2} />
                        </Button>
                    )}
                    {threadItem.mode && (
                        <p className='text-muted-foreground px-2 text-xs'>
                            Generated with {getChatModeName(threadItem.mode)}
                            {threadItem.model ? ` using ${threadItem.model}` : ''}
                        </p>
                    )}
                </div>

                {/* Gated Feature Alert */}
                {gatedFeatureAlert && (
                    <Alert>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>{gatedFeatureAlert.title}</AlertTitle>
                        <AlertDescription>{gatedFeatureAlert.message}</AlertDescription>
                    </Alert>
                )}
            </div>
        );
    },
);

MessageActions.displayName = 'MessageActions';
