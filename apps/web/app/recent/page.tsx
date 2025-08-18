'use client';
import { LoginRequiredDialog, useLoginRequired } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { PublicRoutes } from '@repo/shared/constants/routes';
import { useSession } from '@repo/shared/lib/auth-client';
import { getFormatDistanceToNow } from '@repo/shared/utils';
import {
    Button,
    Command,
    CommandInput,
    CommandList,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    TypographyH3,
    TypographyMuted,
    TypographyP,
} from '@repo/ui';
import { CommandItem } from 'cmdk';
import { ChevronLeft, ChevronRight, Clock, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

// Create a wrapper component for Trash2 to match expected icon prop type
const TrashIcon: React.ComponentType<{ size?: number; className?: string; }> = ({
    size,
    className,
}) => <Trash2 className={className} size={size} />;

export default function ThreadsPage() {
    const threads = useChatStore((state) => state.threads);
    const updateThread = useChatStore((state) => state.updateThread);
    const deleteThread = useChatStore((state) => state.deleteThread);
    const switchThread = useChatStore((state) => state.switchThread);
    const { push } = useRouter();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    enum EnvVar {
        PAGE_SIZE = 'NEXT_PUBLIC_RECENT_PAGE_SIZE',
    }
    const threadsPerPage = Number(process.env[EnvVar.PAGE_SIZE]) || 10;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(threads.length / threadsPerPage) || 1;
    const paginatedThreads = threads.slice(
        (currentPage - 1) * threadsPerPage,
        currentPage * threadsPerPage,
    );
    enum PaginationText {
        PAGE = 'Page',
        OF = 'of',
    }
    enum RecentPageText {
        TITLE = 'Chat History',
        SEARCH = 'Search',
        NO_THREADS = 'No threads found',
        START_THREAD = 'Start a new conversation to create a thread',
        NEW_THREAD = 'New Thread',
    }
    enum AriaLabel {
        PREV_PAGE = 'Previous page',
        NEXT_PAGE = 'Next page',
    }
    enum ThreadDefaults {
        UNTITLED = 'Untitled',
    }
    enum LinkText {
        ENTRYPOINTS = 'Entrypoints',
    }
    enum Routes {
        CHAT_BASE = '/chat',
    }

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId]);

    useEffect(() => {
        setCurrentPage(1);
    }, [threads.length]);

    const handleEditClick = (threadId: string, threadTitle: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingId(threadId);
        setTitle(threadTitle);
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    }, []);

    const handleInputBlur = () => {
        if (editingId) {
            updateThread({
                id: editingId,
                title: title?.trim() || ThreadDefaults.UNTITLED,
            });
            setEditingId(null);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && editingId) {
            updateThread({
                id: editingId,
                title: title?.trim() || ThreadDefaults.UNTITLED,
            });
            setEditingId(null);
        }
    };

    const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!isSignedIn) {
            requireLogin();
            return;
        }

        deleteThread(threadId);
    };

    const handleThreadClick = (threadId: string) => {
        push(`${Routes.CHAT_BASE}/${threadId}`);
        switchThread(threadId);
    };

    return (
        <div className='flex w-full flex-col gap-2'>
            <div className='mx-auto flex w-full max-w-2xl flex-col items-start gap-2 px-4 pt-16 md:px-0'>
                <TypographyH3 className='font-clash text-brand tracking-wide'>
                    {RecentPageText.TITLE}
                </TypographyH3>
                <Link className='text-primary underline text-sm' href={PublicRoutes.ENTRYPOINTS}>
                    {LinkText.ENTRYPOINTS}
                </Link>
                <Command className='!max-h-auto bg-secondary w-full'>
                    <CommandInput
                        className='bg-tertiary rounded-xs h-8 w-full'
                        placeholder={RecentPageText.SEARCH}
                    />

                    <CommandList className='bg-secondary mt-2 !max-h-none gap-2'>
                        {threads?.length > 0
                            ? (
                                paginatedThreads.map((thread) => (
                                    <CommandItem className='mb-2' key={thread.id}>
                                        <div
                                            className='bg-tertiary hover:bg-quaternary group relative flex w-full cursor-pointer flex-col items-start rounded-md p-4 transition-all duration-200'
                                            onClick={() =>
                                                handleThreadClick(thread.id)}
                                        >
                                            <div className='flex w-full justify-between'>
                                                <div className='flex flex-col items-start gap-1'>
                                                    {editingId === thread.id
                                                        ? (
                                                            <input
                                                                className='bg-quaternary rounded-xs px-2 py-1 text-sm'
                                                                onBlur={handleInputBlur}
                                                                onChange={handleInputChange}
                                                                onClick={(e) => e.stopPropagation()}
                                                                onKeyDown={handleInputKeyDown}
                                                                ref={inputRef}
                                                                value={title}
                                                            />
                                                        )
                                                        : (
                                                            <TypographyP className='!mt-0 line-clamp-2 w-full text-sm font-medium'>
                                                                {thread.title}
                                                            </TypographyP>
                                                        )}
                                                    <TypographyMuted className='!mt-0 flex flex-row items-center gap-1 opacity-50'>
                                                        <Clock size={12} strokeWidth={2} />
                                                        {getFormatDistanceToNow(
                                                            new Date(thread.createdAt),
                                                            {
                                                                addSuffix: true,
                                                            },
                                                        )}
                                                    </TypographyMuted>
                                                </div>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            className='shrink-0'
                                                            onClick={(e) =>
                                                                e.stopPropagation()}
                                                            size='icon-xs'
                                                            variant='ghost'
                                                        >
                                                            <MoreHorizontal
                                                                className='text-muted-foreground/50'
                                                                size={14}
                                                                strokeWidth='2'
                                                            />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align='end' side='right'>
                                                        <DropdownMenuItem
                                                            onClick={(e: any) =>
                                                                handleEditClick(
                                                                    thread.id,
                                                                    thread.title,
                                                                    e,
                                                                )}
                                                        >
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e: any) =>
                                                                handleDeleteThread(thread.id, e)}
                                                        >
                                                            Delete Thread
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))
                            )
                            : (
                                <div className='border-hard mt-2 flex w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed p-4'>
                                    <div className='flex flex-col items-center gap-0'>
                                        <TypographyMuted className='!mt-0'>
                                            {RecentPageText.NO_THREADS}
                                        </TypographyMuted>
                                        <TypographyMuted className='!mt-1 text-xs opacity-70'>
                                            {RecentPageText.START_THREAD}
                                        </TypographyMuted>
                                    </div>
                                    <Button
                                        onClick={() => push(PublicRoutes.HOME)}
                                        size='sm'
                                        variant='default'
                                    >
                                        <Plus size={14} strokeWidth={2} />
                                        {RecentPageText.NEW_THREAD}
                                    </Button>
                                </div>
                            )}
                    </CommandList>
                </Command>
                {totalPages > 1 && (
                    <div className='mt-4 flex w-full items-center justify-between'>
                        <TypographyMuted className='!mt-0 text-xs'>
                            {PaginationText.PAGE} {currentPage} {PaginationText.OF} {totalPages}
                        </TypographyMuted>
                        <div className='flex gap-2'>
                            <Button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                size='icon-sm'
                                variant='outline'
                            >
                                <ChevronLeft size={14} strokeWidth={2} />
                                <span className='sr-only'>{AriaLabel.PREV_PAGE}</span>
                            </Button>
                            <Button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                size='icon-sm'
                                variant='outline'
                            >
                                <ChevronRight size={14} strokeWidth={2} />
                                <span className='sr-only'>{AriaLabel.NEXT_PAGE}</span>
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <LoginRequiredDialog
                description='Please sign in to delete chat threads.'
                icon={TrashIcon}
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title='Login Required'
            />
        </div>
    );
}
