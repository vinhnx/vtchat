'use client';
import { useRootContext } from '@repo/common/context';
import { useReducedMotion } from '@repo/common/contexts/accessibility-context';
import { useAdmin, useCreemSubscription, useLogout } from '@repo/common/hooks';
import { useAppStore, useChatStore } from '@repo/common/store';
import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import { BUTTON_TEXT, TOOLTIP_TEXT } from '@repo/shared/constants';
import { PublicRoutes } from '@repo/shared/constants/routes';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import type { Thread } from '@repo/shared/types';
import {
    getCompareDesc,
    getIsAfter,
    getIsToday,
    getIsYesterday,
    getSubDays,
} from '@repo/shared/utils';
import {
    Badge,
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Flex,
    UnifiedAvatar,
    useToast,
} from '@repo/ui';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsUpDown,
    ChevronUp,
    Command,
    ExternalLink,
    FileText,
    HelpCircle,
    Info,
    LogOut,
    MessageCircleMore,
    Option,
    PanelLeftClose,
    PanelRightClose,
    Pin,
    Plus,
    Search,
    Settings,
    Shield,
    Sparkles,
    Terminal,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HistoryItem } from './history/history-item';
import {
    LoginRequiredDialog as SidebarLoginDialog,
    useLoginRequired,
} from './login-required-dialog';
import { Logo } from './logo';
import './sidebar.css';
import { UserTierBadge as SidebarUserTierBadge } from './user-tier-badge';

enum SidebarLinkText {
    ENTRYPOINTS = 'Entrypoints',
}

export const Sidebar = ({ forceMobile = false }: { forceMobile?: boolean; } = {}) => {
    const { setIsCommandSearchOpen, setIsMobileSidebarOpen } = useRootContext();
    const threads = useChatStore((state) => state.threads);
    const currentThreadId = useChatStore((state) => state.currentThreadId);
    const pinThread = useChatStore((state) => state.pinThread);
    const unpinThread = useChatStore((state) => state.unpinThread);
    const [currentPage, setCurrentPage] = useState(1);
    const threadsPerPage = 10; // Number of threads to display per page

    const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
        if (!threads || !Array.isArray(threads)) {
            return [];
        }

        // Filter out invalid threads
        const validThreads = threads.filter(
            (thread) =>
                thread && typeof thread === 'object' && thread.id && thread[sortBy] !== undefined,
        );

        return [...validThreads].sort((a, b) => {
            try {
                const dateA = new Date(a[sortBy]);
                const dateB = new Date(b[sortBy]);

                // Check if dates are valid
                if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
                    return 0;
                }

                return getCompareDesc(dateA, dateB);
            } catch (error) {
                console.error('Error sorting threads:', error);
                return 0;
            }
        });
    };

    const { data: session } = useSession();
    const isSignedIn = !!session;
    const user = session?.user;
    const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);
    const isSidebarOpen = forceMobile || useAppStore((state) => state.isSidebarOpen);

    const { push } = useRouter();
    const { isPlusSubscriber, openCustomerPortal, isPortalLoading } = useCreemSubscription();
    const { logout, isLoggingOut } = useLogout();
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    const { toast } = useToast();
    const { isAdmin } = useAdmin();
    const shouldReduceMotion = useReducedMotion();

    // Reset pagination when threads change
    useEffect(() => {
        setCurrentPage(1);
    }, [threads.length]);

    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    // Group all threads by date
    sortThreads(threads, 'createdAt')?.forEach((thread) => {
        // Skip invalid threads or pinned threads in regular groups to avoid duplicates
        if (!thread || !thread.id || thread.pinned) return;

        try {
            const createdAt = new Date(thread.createdAt);
            if (isNaN(createdAt.getTime())) {
                // Skip threads with invalid dates
                return;
            }

            const now = new Date();

            if (getIsToday(createdAt)) {
                groupedThreads.today.push(thread);
            } else if (getIsYesterday(createdAt)) {
                groupedThreads.yesterday.push(thread);
            } else if (getIsAfter(createdAt, getSubDays(now, 7))) {
                groupedThreads.last7Days.push(thread);
            } else if (getIsAfter(createdAt, getSubDays(now, 30))) {
                groupedThreads.last30Days.push(thread);
            } else {
                groupedThreads.previousMonths.push(thread);
            }
        } catch (error) {
            // Skip threads that cause errors during date processing
            console.error('Error processing thread date:', error);
        }
    });

    // Calculate total pages based on total threads (excluding pinned ones)
    const totalNonPinnedThreads = Object.values(groupedThreads).reduce(
        (acc, group) => acc + group.length,
        0,
    );
    const totalPages = Math.ceil(totalNonPinnedThreads / threadsPerPage);

    // Track how many threads we've processed for pagination
    let processedThreads = 0;

    // Calculate pagination indices
    const startIndex = (currentPage - 1) * threadsPerPage;
    const endIndex = startIndex + threadsPerPage;

    // Function to get paginated threads for a specific group
    const getPaginatedThreadsForGroup = (group: Thread[], startIndex: number, endIndex: number) => {
        if (!Array.isArray(group)) {
            return [];
        }

        // Filter out invalid thread objects
        const validThreads = group.filter(
            (thread) => thread && typeof thread === 'object' && thread.id,
        );

        if (processedThreads >= endIndex) {
            // We've already shown enough threads for this page
            return [];
        }

        if (processedThreads + validThreads.length <= startIndex) {
            // This entire group is before our pagination window
            processedThreads += validThreads.length;
            return [];
        }

        // Calculate how many threads from this group should be shown
        const groupStartIndex = Math.max(0, startIndex - processedThreads);
        const groupEndIndex = Math.min(validThreads.length, endIndex - processedThreads);

        // Update the processed threads count
        processedThreads += validThreads.length;

        // Return the slice of threads for this group
        return validThreads.slice(groupStartIndex, groupEndIndex);
    };

    const renderGroup = ({
        title,
        threads,
        groupIcon,
        renderEmptyState,
        isPinned = false,
    }: {
        title: string;
        threads: Thread[];
        groupIcon?: React.ReactNode;
        renderEmptyState?: () => React.ReactNode;
        isPinned?: boolean;
    }) => {
        // Skip rendering if threads is not an array or if no threads and no empty state to render
        if (!threads || !Array.isArray(threads)) return null;
        if (threads.length === 0 && !renderEmptyState) return null;

        // Filter out invalid threads
        const validThreads = threads.filter(
            (thread) => thread && typeof thread === 'object' && thread.id,
        );

        return (
            <Flex className='w-full gap-0.5' direction='col' items='start'>
                <div className='text-sidebar-foreground/50 flex flex-row items-center gap-1 px-2 py-1 text-xs font-medium opacity-70'>
                    {groupIcon}
                    {title}
                </div>
                {validThreads.length === 0 && renderEmptyState
                    ? (
                        renderEmptyState()
                    )
                    : (
                        <Flex className='w-full gap-0.5' direction='col' gap='none'>
                            {validThreads.map((thread) => {
                                // Ensure thread is valid before rendering
                                if (!thread || !thread.id) {
                                    return null;
                                }

                                return (
                                    <HistoryItem
                                        dismiss={() => {
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            } else {
                                                setIsSidebarOpen(() => false);
                                            }
                                        }}
                                        isActive={thread.id === currentThreadId}
                                        isPinned={thread.pinned}
                                        key={`${isPinned ? 'pinned-' : ''}${thread.id}`}
                                        pinThread={() => pinThread(thread.id)}
                                        thread={thread}
                                        unpinThread={() => unpinThread(thread.id)}
                                    />
                                );
                            })}
                        </Flex>
                    )}
            </Flex>
        );
    };

    return (
        <motion.div
            className={cn(
                'bg-sidebar sidebar-container relative bottom-0 right-0 top-0 flex h-[100dvh] flex-shrink-0 transform-gpu flex-col will-change-transform',
                'dark:bg-black/95',
                forceMobile
                    ? 'z-[302] w-[300px] max-w-[300px]'
                    : cn(
                        'z-[50]',
                        isSidebarOpen
                            ? 'sidebar-expanded top-0 h-full w-[300px] max-w-[300px] flex-none'
                            : 'sidebar-collapsed w-[52px] flex-none',
                    ),
            )}
            style={{
                maxWidth: '300px',
                transform: 'translate3d(0, 0, 0)',
                backfaceVisibility: 'hidden',
                contain: forceMobile ? 'layout style paint' : 'none',
            }}
            initial={forceMobile && !shouldReduceMotion ? { opacity: 0, scale: 0.98 } : false}
            animate={forceMobile && !shouldReduceMotion ? { opacity: 1, scale: 1 } : {}}
            transition={forceMobile && !shouldReduceMotion
                ? {
                    type: 'tween',
                    duration: 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing curve
                }
                : {}}
            {...(forceMobile && { 'data-mobile-sidebar': 'true', 'data-framer-motion': 'true' })}
        >
            <Flex className='w-full flex-1 items-start overflow-hidden' direction='col'>
                {/* Top User Section */}
                <div
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'px-4 py-3' : 'flex justify-center px-2 py-2',
                    )}
                    data-testid='sidebar-user-section'
                >
                    {isSignedIn
                        ? (
                            <DropdownMenu modal={forceMobile}>
                                <DropdownMenuTrigger asChild>
                                    <div
                                        className={cn(
                                            'border-sidebar-border flex cursor-pointer items-center justify-center border shadow-sm transition-all duration-300 ease-out',
                                            isSidebarOpen
                                                ? 'w-full rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent hover:scale-[1.02] active:scale-[0.98] flex-row gap-3 px-3 py-2'
                                                : 'h-7 w-7 rounded-full p-0 hover:scale-110 active:scale-95',
                                        )}
                                        data-testid='sidebar-user-trigger'
                                    >
                                        <UnifiedAvatar
                                            name={user?.name || user?.email || 'User'}
                                            size='sm'
                                            src={getSessionCacheBustedAvatarUrl(user?.image)
                                                || undefined}
                                            onImageError={() => {
                                                log.warn(
                                                    'Avatar failed to load in sidebar, using fallback initials',
                                                );
                                            }}
                                        />

                                        {isSidebarOpen && (
                                            <div className='flex min-w-0 flex-1 flex-col items-start'>
                                                <p className='text-sidebar-foreground line-clamp-1 text-sm font-medium'>
                                                    {user?.name || user?.email}
                                                </p>
                                                <SidebarUserTierBadge />
                                            </div>
                                        )}
                                        {isSidebarOpen && (
                                            <ChevronsUpDown
                                                className='text-sidebar-foreground/60 flex-shrink-0 transition-transform duration-300 data-[state=open]:rotate-180'
                                                size={14}
                                                strokeWidth={2}
                                            />
                                        )}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align='start'
                                    className={cn(
                                        'w-56 pl-2 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-90 data-[state=open]:zoom-in-90 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-300 origin-[var(--radix-dropdown-menu-content-transform-origin)]',
                                        forceMobile && 'z-[303]',
                                    )}
                                    sideOffset={4}
                                >
                                    {/* Account Management */}
                                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/profile');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <User size={16} strokeWidth={2} />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/settings');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <Settings size={16} strokeWidth={2} />
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    {/* Support & Legal */}
                                    <DropdownMenuLabel>Support & Legal</DropdownMenuLabel>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(
                                                'https://vtchat.userjot.com',
                                                '_blank',
                                                'noopener,noreferrer',
                                            );
                                        }}
                                    >
                                        <MessageCircleMore size={16} strokeWidth={2} />
                                        Send Feedback
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/about');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <Info size={16} strokeWidth={2} />
                                        About
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/help');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <HelpCircle size={16} strokeWidth={2} />
                                        Help Center
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/faq');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <MessageCircleMore size={16} strokeWidth={2} />
                                        FAQ
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/ai-glossary');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <FileText size={16} strokeWidth={2} />
                                        AI Glossary
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/ai-resources');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <FileText size={16} strokeWidth={2} />
                                        AI Resources
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push(PublicRoutes.ENTRYPOINTS);
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <Terminal size={16} strokeWidth={2} />
                                        {SidebarLinkText.ENTRYPOINTS}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/privacy');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <Shield size={16} strokeWidth={2} />
                                        Privacy Policy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            push('/terms');
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <FileText size={16} strokeWidth={2} />
                                        Terms of Service
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />

                                    {/* Authentication */}
                                    <DropdownMenuItem
                                        className={isLoggingOut
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''}
                                        disabled={isLoggingOut}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            logout();
                                            if (forceMobile) {
                                                setIsMobileSidebarOpen(false);
                                            }
                                        }}
                                    >
                                        <LogOut size={16} strokeWidth={2} />
                                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                        : (
                            <Button
                                className={cn(
                                    'w-full',
                                    isSidebarOpen ? 'justify-start' : 'items-center justify-center',
                                )}
                                onClick={() => push('/login')}
                                roundedSm='lg'
                                size={isSidebarOpen ? 'sm' : 'icon-sm'}
                                tooltip={isSidebarOpen ? undefined : 'Login'}
                                tooltipSide='right'
                                variant='ghost'
                            >
                                <User
                                    className={cn('flex-shrink-0', isSidebarOpen ? 'mr-2' : '')}
                                    size={16}
                                    strokeWidth={2}
                                />
                                {isSidebarOpen && 'Log in / Sign up'}
                            </Button>
                        )}
                </div>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className='border-sidebar-border w-full border-t' />
                </div>

                {/* Header Section with Logo */}
                <div
                    className={cn(
                        'flex w-full flex-row items-center justify-between transition-all duration-200',
                        isSidebarOpen ? 'mb-4 px-4 py-3' : 'mb-2 px-2 py-2',
                    )}
                >
                    <Link className={isSidebarOpen ? 'flex-1' : 'w-full'} href='/'>
                        <div
                            className={cn(
                                'hover:bg-sidebar-accent/70 flex w-full transform-gpu cursor-pointer items-center justify-start gap-2 rounded-lg p-1 transition-all duration-200 will-change-transform',
                                !isSidebarOpen && 'justify-center px-0',
                            )}
                            style={{ transform: 'translate3d(0, 0, 0)' }}
                        >
                            <Logo className='text-brand size-6 flex-shrink-0' round />
                            {isSidebarOpen && (
                                <p className='font-clash text-sidebar-foreground text-xl font-bold tracking-wide'>
                                    VT
                                </p>
                            )}
                        </div>
                    </Link>

                    {/* Collapse sidebar button in header */}
                    {isSidebarOpen && (
                        <Button
                            className='text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors'
                            onClick={() => setIsSidebarOpen(false)}
                            size='icon-sm'
                            tooltip='Collapse Sidebar'
                            tooltipSide='right'
                            variant='ghost'
                        >
                            <PanelLeftClose size={16} strokeWidth={2} />
                        </Button>
                    )}
                </div>
                {/* Primary Actions Section */}
                <div
                    className='transform-gpu will-change-transform'
                    style={{ transform: 'translate3d(0, 0, 0)' }}
                >
                    <Flex
                        className={cn(
                            'transition-all duration-200',
                            isSidebarOpen ? 'w-full gap-2 px-4' : 'w-full items-center gap-2 px-2',
                        )}
                        direction='col'
                    >
                        {/* New Chat Button */}
                        <Button
                            className={cn(
                                'transition-all duration-200',
                                isSidebarOpen
                                    ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full justify-between'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-10 w-10 justify-center',
                            )}
                            onClick={async () => {
                                // Show toast notification
                                toast({
                                    title: 'New Chat',
                                    description: 'Starting a new conversation...',
                                    duration: 2000,
                                });

                                // Create a new thread before navigating
                                await useChatStore.getState().createThread();
                                // Navigate to / to start a new conversation
                                push('/');
                                // Close mobile drawer if open
                                if (forceMobile) {
                                    setIsMobileSidebarOpen(false);
                                }
                            }}
                            roundedSm='lg'
                            size={isSidebarOpen ? 'sm' : 'icon-sm'}
                            variant='ghost'
                        >
                            {isSidebarOpen
                                ? (
                                    <div className='flex items-center'>
                                        <div className='bg-muted/50 mr-2 flex items-center justify-center rounded-md p-1.5 transition-colors duration-200'>
                                            <Plus
                                                className='flex-shrink-0'
                                                size={12}
                                                strokeWidth={2.5}
                                            />
                                        </div>
                                        New Chat
                                    </div>
                                )
                                : (
                                    <div className='bg-muted/50 flex items-center justify-center rounded-md p-1.5 transition-colors duration-200'>
                                        <Plus
                                            className='flex-shrink-0'
                                            size={12}
                                            strokeWidth={2.5}
                                        />
                                    </div>
                                )}
                            {isSidebarOpen && (
                                // <span className="text-xs opacity-60 font-sans">⌘⌃⌥N</span>
                                <div className='ml-auto flex flex-row items-center gap-1'>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]'
                                        variant='secondary'
                                    >
                                        <Command className='shrink-0' size={10} strokeWidth={2} />
                                    </Badge>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]'
                                        variant='secondary'
                                    >
                                        <Option className='shrink-0' size={10} strokeWidth={2} />
                                    </Badge>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]'
                                        variant='secondary'
                                    >
                                        <ChevronUp className='shrink-0' size={10} strokeWidth={2} />
                                    </Badge>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px] font-medium'
                                        variant='secondary'
                                    >
                                        N
                                    </Badge>
                                </div>
                            )}
                        </Button>

                        {/* Search Button */}
                        <Button
                            className={cn(
                                'transition-all duration-200',
                                isSidebarOpen
                                    ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full justify-between'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-10 w-10 justify-center',
                            )}
                            onClick={() => {
                                if (!isSignedIn) {
                                    requireLogin();
                                    return;
                                }
                                setIsCommandSearchOpen(true);
                            }}
                            roundedSm='lg'
                            size={isSidebarOpen ? 'sm' : 'icon-sm'}
                            variant='ghost'
                        >
                            <div className='flex items-center'>
                                <Search
                                    className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                                    size={16}
                                    strokeWidth={2}
                                />
                                {isSidebarOpen && 'Search'}
                            </div>
                            {isSidebarOpen && (
                                <div className='ml-auto flex flex-row items-center gap-1'>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]'
                                        variant='secondary'
                                    >
                                        <Command className='shrink-0' size={10} strokeWidth={2} />
                                    </Badge>
                                    <Badge
                                        className='bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px] font-medium'
                                        variant='secondary'
                                    >
                                        K
                                    </Badge>
                                </div>
                            )}
                        </Button>

                        {/* Settings Button */}
                        <Button
                            className={cn(
                                'transition-all duration-200',
                                isSidebarOpen
                                    ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full justify-start'
                                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-10 w-10 justify-center',
                            )}
                            onClick={() => {
                                push('/settings');
                                // Close mobile drawer if open
                                if (forceMobile) {
                                    setIsMobileSidebarOpen(false);
                                }
                            }}
                            roundedSm='lg'
                            size={isSidebarOpen ? 'sm' : 'icon-sm'}
                            variant='ghost'
                        >
                            <Settings
                                className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                                size={16}
                                strokeWidth={2}
                            />
                            {isSidebarOpen && 'Settings'}
                        </Button>

                        {
                            /*
                         Button */
                        }
                        {isAdmin && (
                            <Button
                                className={cn(
                                    'relative transition-all duration-200',
                                    isSidebarOpen
                                        ? 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground w-full justify-start'
                                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-10 w-10 justify-center',
                                )}
                                onClick={() => {
                                    push('/admin');
                                    // Close mobile drawer if open
                                    if (forceMobile) {
                                        setIsMobileSidebarOpen(false);
                                    }
                                }}
                                roundedSm='lg'
                                size={isSidebarOpen ? 'sm' : 'icon-sm'}
                                variant='ghost'
                            >
                                <Terminal
                                    className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                                    size={16}
                                    strokeWidth={2}
                                />
                                {isSidebarOpen && 'VT Termimal'}
                            </Button>
                        )}
                    </Flex>
                </div>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className='border-sidebar-border w-full border-t' />
                </div>

                {/* Subscription Section */}
                <div
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'px-4 py-3' : 'px-2 py-2',
                    )}
                >
                    {isSidebarOpen
                        ? (
                            <Button
                                className={cn(
                                    'group relative w-full justify-between overflow-hidden border shadow-sm transition-all duration-300',
                                    'border-[#D99A4E]/30 bg-gradient-to-r from-[#D99A4E]/20 to-[#BFB38F]/20 text-[#262626] hover:from-[#D99A4E]/30 hover:to-[#BFB38F]/30 hover:shadow-lg hover:shadow-[#D99A4E]/20 dark:border-[#BFB38F]/30 dark:from-[#D99A4E]/10 dark:to-[#BFB38F]/10 dark:text-[#BFB38F] dark:hover:from-[#D99A4E]/20 dark:hover:to-[#BFB38F]/20 dark:hover:shadow-[#BFB38F]/10',
                                )}
                                disabled={isPortalLoading}
                                onClick={() => {
                                    if (isPlusSubscriber) {
                                        openCustomerPortal();
                                    } else {
                                        push('/pricing');
                                    }
                                }}
                                roundedSm='lg'
                                size={isSidebarOpen ? 'sm' : 'icon-sm'}
                                variant='ghost'
                            >
                                <Sparkles
                                    className={cn(
                                        'flex-shrink-0 transition-all duration-300 group-hover:scale-110',
                                        'text-amber-600/80 group-hover:text-amber-700 dark:text-amber-400/80 dark:group-hover:text-amber-300',
                                        isSidebarOpen && 'mr-2',
                                    )}
                                    size={16}
                                    strokeWidth={2}
                                />
                                <span
                                    className={cn(
                                        'flex-1 truncate text-left font-medium',
                                        'text-[#262626] dark:text-[#BFB38F]',
                                    )}
                                >
                                    {isPortalLoading
                                        ? BUTTON_TEXT.LOADING
                                        : isPlusSubscriber
                                        ? BUTTON_TEXT.MANAGE_SUBSCRIPTION
                                        : BUTTON_TEXT.UPGRADE_TO_PLUS}
                                </span>
                                {isPlusSubscriber && (
                                    <ExternalLink
                                        className='ml-1 flex-shrink-0 text-amber-600/80 dark:text-amber-400/80'
                                        size={12}
                                    />
                                )}
                            </Button>
                        )
                        : (
                            <Button
                                className={cn(
                                    'group !m-0 flex items-center justify-center !p-0 transition-all duration-300',
                                    // Remove background in collapsed state, keep hover effects
                                    'hover:bg-sidebar-accent hover:text-sidebar-foreground',
                                )}
                                disabled={isPortalLoading}
                                onClick={() => {
                                    if (isPlusSubscriber) {
                                        openCustomerPortal();
                                    } else {
                                        push('/pricing');
                                    }
                                }}
                                roundedSm='lg'
                                size='icon-sm'
                                tooltip={isPlusSubscriber
                                    ? TOOLTIP_TEXT.MANAGE_SUBSCRIPTION_NEW_TAB
                                    : TOOLTIP_TEXT.UPGRADE_TO_PLUS}
                                tooltipSide='right'
                                variant='ghost'
                            >
                                <Sparkles
                                    className={cn(
                                        'm-0 p-0 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110',
                                        // Use consistent sidebar foreground colors for collapsed state
                                        'text-sidebar-foreground/70 group-hover:text-sidebar-foreground',
                                    )}
                                    size={16}
                                    strokeWidth={2}
                                />
                            </Button>
                        )}
                </div>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className='border-sidebar-border w-full border-t' />
                </div>

                {/* Thread History Section */}
                <motion.div
                    className={cn(
                        'thread-history-container w-full flex-1 transition-all duration-200',
                        isSidebarOpen ? 'flex flex-col px-4 pt-4' : 'flex flex-col px-2 pt-2',
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    {/* Only show threads in expanded mode */}
                    {isSidebarOpen && (
                        <div className='scrollbar-thin'>
                            {threads.length === 0
                                ? (
                                    <div className='flex w-full flex-col items-center justify-center gap-3 py-8'>
                                        <div className='text-sidebar-foreground/30 text-center'>
                                            <FileText size={24} strokeWidth={1.5} />
                                        </div>
                                        <div className='text-center'>
                                            <p className='text-sidebar-foreground/70 text-sm font-medium'>
                                                No conversations yet
                                            </p>
                                            <p className='text-sidebar-foreground/50 text-xs'>
                                                Start a new chat to begin
                                            </p>
                                        </div>
                                    </div>
                                )
                                : (
                                    <>
                                        {/* Pinned Conversations */}
                                        {renderGroup({
                                            title: 'Pinned',
                                            threads: threads
                                                .filter(
                                                    (thread) =>
                                                        thread
                                                        && typeof thread === 'object'
                                                        && thread.id
                                                        && thread.pinned,
                                                )
                                                .sort((a, b) => {
                                                    // Ensure pinnedAt exists and is a valid date
                                                    const aTime = a.pinnedAt instanceof Date
                                                        ? a.pinnedAt.getTime()
                                                        : 0;
                                                    const bTime = b.pinnedAt instanceof Date
                                                        ? b.pinnedAt.getTime()
                                                        : 0;
                                                    return bTime - aTime;
                                                }),
                                            groupIcon: <Pin size={14} strokeWidth={2} />,
                                            renderEmptyState: () => (
                                                <div className='border-hard flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3'>
                                                    <Pin
                                                        className='text-sidebar-foreground/30'
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                    <p className='text-sidebar-foreground/60 text-center text-xs'>
                                                        Pin important conversations to keep them at
                                                        the top
                                                    </p>
                                                </div>
                                            ),
                                            isPinned: true,
                                        })}

                                        {/* Spacing between pinned and regular threads */}
                                        <div className='h-4'></div>

                                        {/* Recent Conversations */}
                                        {renderGroup({
                                            title: 'Today',
                                            threads: currentPage === 1
                                                ? getPaginatedThreadsForGroup(
                                                    groupedThreads.today,
                                                    startIndex,
                                                    endIndex,
                                                ).filter((thread) => !thread.pinned)
                                                : [],
                                        })}
                                        {renderGroup({
                                            title: 'Yesterday',
                                            threads: getPaginatedThreadsForGroup(
                                                groupedThreads.yesterday,
                                                startIndex,
                                                endIndex,
                                            ).filter((thread) => !thread.pinned),
                                        })}
                                        {renderGroup({
                                            title: 'Last 7 Days',
                                            threads: getPaginatedThreadsForGroup(
                                                groupedThreads.last7Days,
                                                startIndex,
                                                endIndex,
                                            ).filter((thread) => !thread.pinned),
                                        })}
                                        {renderGroup({
                                            title: 'Last 30 Days',
                                            threads: getPaginatedThreadsForGroup(
                                                groupedThreads.last30Days,
                                                startIndex,
                                                endIndex,
                                            ).filter((thread) => !thread.pinned),
                                        })}
                                        {renderGroup({
                                            title: 'Older',
                                            threads: getPaginatedThreadsForGroup(
                                                groupedThreads.previousMonths,
                                                startIndex,
                                                endIndex,
                                            ).filter((thread) => !thread.pinned),
                                        })}
                                    </>
                                )}
                        </div>
                    )}

                    {/* Show a simplified view in collapsed mode */}
                    {!isSidebarOpen && threads.length > 0 && (
                        <Button
                            className='hover:bg-sidebar-accent/50 flex h-auto min-h-[44px] w-full flex-col items-center gap-1 py-2 transition-colors'
                            onClick={() => setIsSidebarOpen(true)}
                            size='icon-sm'
                            tooltip='Open thread list'
                            tooltipSide='right'
                            variant='ghost'
                        >
                            <div className='text-sidebar-foreground/30 text-center'>
                                <MessageCircleMore size={16} strokeWidth={1.5} />
                            </div>
                        </Button>
                    )}
                </motion.div>

                {/* Pagination Controls */}
                {isSidebarOpen && totalPages > 1 && (
                    <div className='bg-sidebar-accent/20 border-sidebar-border sticky bottom-0 z-20 w-full border-t px-4 py-2 shadow-md'>
                        <div className='flex flex-row items-center justify-between'>
                            <span className='text-sidebar-foreground/70 text-xs font-medium'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className='flex items-center gap-1'>
                                <Button
                                    className='text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-7 w-7 p-0 transition-colors'
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    size='icon-sm'
                                    variant={currentPage === 1 ? 'ghost' : 'outline'}
                                >
                                    <ChevronLeft className='h-4 w-4' />
                                    <span className='sr-only'>Previous page</span>
                                </Button>
                                <Button
                                    className='text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground h-7 w-7 p-0 transition-colors'
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    size='icon-sm'
                                    variant={currentPage === totalPages ? 'ghost' : 'outline'}
                                >
                                    <ChevronRight className='h-4 w-4' />
                                    <span className='sr-only'>Next page</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bottom Section - Expand Button for Collapsed State */}
                {!isSidebarOpen && (
                    <div className='from-sidebar via-sidebar/95 fixed bottom-0 w-[52px] bg-gradient-to-t to-transparent px-2 py-4'>
                        <div className='flex flex-col items-center gap-3'>
                            <Button
                                className='text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors'
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                                size='icon-sm'
                                tooltip='Open Sidebar'
                                tooltipSide='right'
                                variant='ghost'
                            >
                                <PanelRightClose size={16} strokeWidth={2} />
                            </Button>
                        </div>
                    </div>
                )}
            </Flex>

            <SidebarLoginDialog
                description='Please sign in to access the command search feature.'
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title='Login Required'
            />
        </motion.div>
    );
};
