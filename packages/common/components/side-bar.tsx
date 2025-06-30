'use client';
import { HistoryItem, Logo } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { useCreemSubscription, useLogout } from '@repo/common/hooks';
import { useGlobalSubscriptionStatus } from '@repo/common/providers/subscription-provider';
import { useAppStore, useChatStore } from '@repo/common/store';
import { BUTTON_TEXT, TOOLTIP_TEXT } from '@repo/shared/constants';
import { useSession } from '@repo/shared/lib/auth-client';
import { Thread } from '@repo/shared/types';
import {
    Avatar,
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
    useToast,
} from '@repo/ui';
import { compareDesc, isAfter, isToday, isYesterday, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ChevronsUpDown,
    ChevronUp,
    Command,
    Database,
    ExternalLink,
    FileText,
    HelpCircle,
    LogOut,
    Option,
    PanelLeftClose,
    PanelRightClose,
    Pin,
    Plus,
    Search,
    Settings,
    Shield,
    Sparkles,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LoginRequiredDialog, useLoginRequired } from './login-required-dialog';
import { UserTierBadge } from './user-tier-badge';

export const Sidebar = ({ forceMobile = false }: { forceMobile?: boolean } = {}) => {
    const { threadId: currentThreadId } = useParams();
    const { setIsCommandSearchOpen, setIsMobileSidebarOpen } = useRootContext();
    const threads = useChatStore(state => state.threads);
    const pinThread = useChatStore(state => state.pinThread);
    const unpinThread = useChatStore(state => state.unpinThread);
    const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
        return [...threads].sort((a, b) => compareDesc(new Date(a[sortBy]), new Date(b[sortBy])));
    };

    const { data: session } = useSession();
    const isSignedIn = !!session;
    const user = session?.user;
    const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
    const isSidebarOpen = forceMobile || useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const { push } = useRouter();
    const { isPlusSubscriber, openCustomerPortal, isPortalLoading } = useCreemSubscription();
    const { isPlusSubscriber: isPlusFromGlobal } = useGlobalSubscriptionStatus();
    const { logout, isLoggingOut } = useLogout();
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    const { toast } = useToast();
    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    sortThreads(threads, 'createdAt')?.forEach(thread => {
        const createdAt = new Date(thread.createdAt);
        const now = new Date();

        if (isToday(createdAt)) {
            groupedThreads.today.push(thread);
        } else if (isYesterday(createdAt)) {
            groupedThreads.yesterday.push(thread);
        } else if (isAfter(createdAt, subDays(now, 7))) {
            groupedThreads.last7Days.push(thread);
        } else if (isAfter(createdAt, subDays(now, 30))) {
            groupedThreads.last30Days.push(thread);
        } else {
            groupedThreads.previousMonths.push(thread);
        }

        //TODO: Paginate these threads
    });

    const renderGroup = ({
        title,
        threads,

        groupIcon,
        renderEmptyState,
    }: {
        title: string;
        threads: Thread[];
        groupIcon?: React.ReactNode;
        renderEmptyState?: () => React.ReactNode;
    }) => {
        if (threads.length === 0 && !renderEmptyState) return null;
        return (
            <Flex direction="col" items="start" className="w-full gap-0.5">
                <div className="text-sidebar-foreground/50 flex flex-row items-center gap-1 px-2 py-1 text-xs font-medium opacity-70">
                    {groupIcon}
                    {title}
                </div>
                {threads.length === 0 && renderEmptyState ? (
                    renderEmptyState()
                ) : (
                    <Flex className="w-full gap-0.5" gap="none" direction="col">
                        {threads.map(thread => (
                            <HistoryItem
                                thread={thread}
                                pinThread={() => pinThread(thread.id)}
                                unpinThread={() => unpinThread(thread.id)}
                                isPinned={thread.pinned}
                                key={thread.id}
                                dismiss={() => {
                                    if (forceMobile) {
                                        setIsMobileSidebarOpen(false);
                                    } else {
                                        setIsSidebarOpen(() => false);
                                    }
                                }}
                                isActive={thread.id === currentThreadId}
                            />
                        ))}
                    </Flex>
                )}
            </Flex>
        );
    };

    return (
        <div
            className={cn(
                'bg-sidebar border-sidebar-border relative bottom-0 right-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col border-l transition-all duration-300 ease-in-out',
                'dark:border-gray-800 dark:bg-black/95',
                isSidebarOpen ? 'top-0 h-full w-[260px]' : 'w-[52px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 items-start overflow-hidden">
                {/* Top User Section */}
                <div
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'px-4 py-3' : 'px-2 py-2'
                    )}
                >
                    {isSignedIn ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    className={cn(
                                        'bg-sidebar-accent/30 hover:bg-sidebar-accent border-sidebar-border flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg border shadow-sm transition-all duration-200',
                                        isSidebarOpen ? 'px-3 py-2' : 'justify-center px-2 py-2'
                                    )}
                                >
                                    <Avatar
                                        name={user?.name || user?.email || 'User'}
                                        src={user?.image || undefined}
                                        size="sm"
                                    />

                                    {isSidebarOpen && (
                                        <div className="flex min-w-0 flex-1 flex-col items-start">
                                            <p className="text-sidebar-foreground line-clamp-1 text-sm font-medium">
                                                {user?.name || user?.email}
                                            </p>
                                            <UserTierBadge />
                                        </div>
                                    )}
                                    {isSidebarOpen && (
                                        <ChevronsUpDown
                                            size={14}
                                            strokeWidth={2}
                                            className="text-sidebar-foreground/60 flex-shrink-0"
                                        />
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 pl-2">
                                {/* Account Management */}
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => push('/profile')}>
                                    <User size={16} strokeWidth={2} />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                    <Settings size={16} strokeWidth={2} />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                {/* Support & Legal */}
                                <DropdownMenuLabel>Support & Legal</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => push('/faq')}>
                                    <HelpCircle size={16} strokeWidth={2} />
                                    FAQ
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => push('/privacy')}>
                                    <Shield size={16} strokeWidth={2} />
                                    Privacy Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => push('/terms')}>
                                    <FileText size={16} strokeWidth={2} />
                                    Terms of Service
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                {/* Authentication */}
                                <DropdownMenuItem
                                    onClick={() => logout()}
                                    disabled={isLoggingOut}
                                    className={isLoggingOut ? 'cursor-not-allowed opacity-50' : ''}
                                >
                                    <LogOut size={16} strokeWidth={2} />
                                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button
                            variant="ghost"
                            size={isSidebarOpen ? 'sm' : 'icon-sm'}
                            tooltip={isSidebarOpen ? undefined : 'Login'}
                            tooltipSide="right"
                            rounded="lg"
                            className="w-full justify-start"
                            onClick={() => push('/login')}
                        >
                            <User
                                size={16}
                                strokeWidth={2}
                                className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                            />
                            {isSidebarOpen && 'Log in / Sign up'}
                        </Button>
                    )}
                </div>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className="border-sidebar-border w-full border-t" />
                </div>

                {/* Header Section with Logo */}
                <div
                    className={cn(
                        'flex w-full flex-row items-center justify-between transition-all duration-200',
                        isSidebarOpen ? 'mb-4 px-4 py-3' : 'mb-2 px-2 py-2'
                    )}
                >
                    <Link href="/chat" className="w-full">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={cn(
                                'hover:bg-sidebar-accent/70 flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-1 transition-all duration-200',
                                !isSidebarOpen && 'justify-center px-0'
                            )}
                        >
                            <Logo round className="text-brand size-6 flex-shrink-0" />
                            {isSidebarOpen && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="font-clash text-sidebar-foreground text-xl font-bold tracking-wide"
                                >
                                    VT
                                </motion.p>
                            )}
                        </motion.div>
                    </Link>
                    {isSidebarOpen && (
                        <Button
                            variant="ghost"
                            tooltip="Close Sidebar"
                            tooltipSide="right"
                            size="icon-sm"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors"
                        >
                            <PanelLeftClose size={16} strokeWidth={2} />
                        </Button>
                    )}
                </div>
                {/* Primary Actions Section */}
                <Flex
                    direction="col"
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'gap-2 px-4' : 'items-center gap-3 px-2'
                    )}
                >
                    {/* New Chat Button */}
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon-sm'}
                        variant="default"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'New Chat (⌘⌃⌥N)'}
                        tooltipSide="right"
                        className={cn(
                            'relative shadow-sm transition-all duration-200',
                            isSidebarOpen
                                ? 'bg-primary hover:bg-primary/90 w-full justify-between'
                                : 'bg-primary hover:bg-primary/90'
                        )}
                        onClick={() => {
                            // Show toast notification
                            toast({
                                title: 'New Chat',
                                description: 'Starting a new conversation...',
                                duration: 2000,
                            });

                            // Navigate to /chat to start a new conversation
                            push('/chat');
                            // Close mobile drawer if open
                            if (forceMobile) {
                                setIsMobileSidebarOpen(false);
                            }
                        }}
                    >
                        <div className="flex items-center">
                            <Plus
                                size={16}
                                strokeWidth={2}
                                className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                            />
                            {isSidebarOpen && 'New Chat'}
                        </div>
                        {isSidebarOpen && (
                            // <span className="text-xs opacity-60 font-mono">⌘⌃⌥N</span>
                            <div className="ml-auto flex flex-row items-center gap-1">
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]"
                                >
                                    <Command size={10} strokeWidth={2} className="shrink-0" />
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]"
                                >
                                    <Option size={10} strokeWidth={2} className="shrink-0" />
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]"
                                >
                                    <ChevronUp size={10} strokeWidth={2} className="shrink-0" />
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px] font-medium"
                                >
                                    N
                                </Badge>
                            </div>
                        )}
                    </Button>

                    {/* Search Button */}
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon-sm'}
                        variant="ghost"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'Search Conversations'}
                        tooltipSide="right"
                        className={cn(
                            'transition-all duration-200',
                            isSidebarOpen
                                ? 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent relative w-full justify-between'
                                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                        onClick={() => {
                            if (!isSignedIn) {
                                requireLogin();
                                return;
                            }
                            setIsCommandSearchOpen(true);
                        }}
                    >
                        <div className="flex items-center">
                            <Search
                                size={16}
                                strokeWidth={2}
                                className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                            />
                            {isSidebarOpen && 'Search'}
                        </div>
                        {isSidebarOpen && (
                            <div className="ml-auto flex flex-row items-center gap-1">
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px]"
                                >
                                    <Command size={10} strokeWidth={2} className="shrink-0" />
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="bg-muted-foreground/10 text-muted-foreground/70 flex size-5 items-center justify-center rounded p-0 text-[10px] font-medium"
                                >
                                    K
                                </Badge>
                            </div>
                        )}
                    </Button>

                    {/* RAG Knowledge Chat Button */}
                    <Button
                        size={isSidebarOpen ? 'sm' : 'icon-sm'}
                        variant="ghost"
                        rounded="lg"
                        tooltip={isSidebarOpen ? undefined : 'Knowledge Base'}
                        tooltipSide="right"
                        className={cn(
                            'relative transition-all duration-200',
                            isSidebarOpen
                                ? 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent w-full justify-start'
                                : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        )}
                        onClick={() => {
                            push('/rag');
                            // Close mobile drawer if open
                            if (forceMobile) {
                                setIsMobileSidebarOpen(false);
                            }
                        }}
                    >
                        <Database
                            size={16}
                            strokeWidth={2}
                            className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                        />
                        {isSidebarOpen && (
                            <span className="flex items-center gap-2">
                                AI Assistant
                                {!isPlusFromGlobal && (
                                    <Badge
                                        variant="secondary"
                                        className="bg-[#BFB38F]/20 px-1.5 py-0.5 text-[10px] text-[#BFB38F]"
                                    >
                                        VT+
                                    </Badge>
                                )}
                            </span>
                        )}
                    </Button>
                </Flex>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className="border-sidebar-border w-full border-t" />
                </div>

                {/* Subscription Section */}
                <div
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'px-4 py-3' : 'px-2 py-2'
                    )}
                >
                    {isSidebarOpen ? (
                        <Button
                            size={forceMobile ? 'default' : 'lg'}
                            variant="ghost"
                            rounded="lg"
                            disabled={isPortalLoading}
                            className={cn(
                                'group relative w-full justify-start overflow-hidden border shadow-sm transition-all duration-300',
                                'border-[#D99A4E]/30 bg-gradient-to-r from-[#D99A4E]/20 to-[#BFB38F]/20 text-[#262626] hover:from-[#D99A4E]/30 hover:to-[#BFB38F]/30 hover:shadow-lg hover:shadow-[#D99A4E]/20 dark:border-[#BFB38F]/30 dark:from-[#D99A4E]/10 dark:to-[#BFB38F]/10 dark:text-[#BFB38F] dark:hover:from-[#D99A4E]/20 dark:hover:to-[#BFB38F]/20 dark:hover:shadow-[#BFB38F]/10',
                                forceMobile ? 'h-auto min-h-[44px] py-2' : ''
                            )}
                            onClick={() => {
                                if (isPlusSubscriber) {
                                    openCustomerPortal();
                                } else {
                                    push('/plus');
                                }
                            }}
                        >
                            <Sparkles
                                size={forceMobile ? 16 : 20}
                                strokeWidth={2}
                                className={cn(
                                    'flex-shrink-0 transition-all duration-300 group-hover:scale-110',
                                    'text-amber-600/80 group-hover:text-amber-700 dark:text-amber-400/80 dark:group-hover:text-amber-300',
                                    forceMobile ? 'mr-2' : 'mr-3'
                                )}
                            />
                            <span
                                className={cn(
                                    'flex-1 truncate text-left font-medium',
                                    'text-[#262626] dark:text-[#BFB38F]',
                                    forceMobile ? 'text-sm leading-tight' : ''
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
                                    size={forceMobile ? 10 : 12}
                                    className={cn(
                                        'ml-1 flex-shrink-0 text-amber-600/80 dark:text-amber-400/80',
                                        forceMobile ? 'mt-0.5' : ''
                                    )}
                                />
                            )}
                        </Button>
                    ) : (
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            rounded="lg"
                            disabled={isPortalLoading}
                            tooltip={
                                isPlusSubscriber
                                    ? TOOLTIP_TEXT.MANAGE_SUBSCRIPTION_NEW_TAB
                                    : TOOLTIP_TEXT.UPGRADE_TO_PLUS
                            }
                            tooltipSide="right"
                            className={cn(
                                'group !m-0 flex items-center justify-center !p-0 transition-all duration-300',
                                isPlusSubscriber
                                    ? // VT+ Subscriber - Muted amber style
                                      'border-amber-200/50 bg-amber-50/50 hover:bg-amber-100/70 hover:shadow-lg hover:shadow-amber-200/30 dark:border-amber-800/30 dark:bg-amber-950/30 dark:hover:bg-amber-900/50'
                                    : // Upgrade Button - Black style
                                      'border-black/20 bg-black/5 hover:bg-black/10 hover:shadow-lg hover:shadow-black/20 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10'
                            )}
                            onClick={() => {
                                if (isPlusSubscriber) {
                                    openCustomerPortal();
                                } else {
                                    push('/plus');
                                }
                            }}
                        >
                            <Sparkles
                                size={16}
                                strokeWidth={2}
                                className={cn(
                                    'm-0 p-0 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110',
                                    isPlusSubscriber
                                        ? 'text-amber-600/80 group-hover:text-amber-700 dark:text-amber-400/80 dark:group-hover:text-amber-300'
                                        : 'text-black/70 group-hover:text-black dark:text-white/70 dark:group-hover:text-white'
                                )}
                            />
                        </Button>
                    )}
                </div>

                {/* Divider */}
                <div className={cn('w-full', isSidebarOpen ? 'px-4' : 'px-2')}>
                    <div className="border-sidebar-border w-full border-t" />
                </div>

                {/* Thread History Section */}
                <div
                    className={cn(
                        'no-scrollbar w-full flex-1 overflow-y-auto transition-all duration-200',
                        isSidebarOpen ? 'flex flex-col gap-4 px-4 pb-6 pt-4' : 'hidden'
                    )}
                >
                    {threads.length === 0 ? (
                        <div className="flex w-full flex-col items-center justify-center gap-3 py-8">
                            <div className="text-sidebar-foreground/30 text-center">
                                <FileText size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="text-sidebar-foreground/70 text-sm font-medium">
                                    No conversations yet
                                </p>
                                <p className="text-sidebar-foreground/50 text-xs">
                                    Start a new chat to begin
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Pinned Conversations */}
                            {renderGroup({
                                title: 'Pinned',
                                threads: threads
                                    .filter(thread => thread.pinned)
                                    .sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime()),
                                groupIcon: <Pin size={14} strokeWidth={2} />,
                                renderEmptyState: () => (
                                    <div className="border-hard flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-3">
                                        <Pin
                                            size={16}
                                            strokeWidth={1.5}
                                            className="text-sidebar-foreground/30"
                                        />
                                        <p className="text-sidebar-foreground/60 text-center text-xs">
                                            Pin important conversations to keep them at the top
                                        </p>
                                    </div>
                                ),
                            })}

                            {/* Recent Conversations */}
                            {renderGroup({ title: 'Today', threads: groupedThreads.today })}
                            {renderGroup({ title: 'Yesterday', threads: groupedThreads.yesterday })}
                            {renderGroup({
                                title: 'Last 7 Days',
                                threads: groupedThreads.last7Days,
                            })}
                            {renderGroup({
                                title: 'Last 30 Days',
                                threads: groupedThreads.last30Days,
                            })}
                            {renderGroup({
                                title: 'Older',
                                threads: groupedThreads.previousMonths,
                            })}
                        </>
                    )}
                </div>

                {/* Bottom Section - Expand Button for Collapsed State */}
                {!isSidebarOpen && (
                    <div className="from-sidebar via-sidebar/95 absolute bottom-0 w-full bg-gradient-to-t to-transparent px-2 py-2 pt-8">
                        <div className="flex flex-col items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Open Sidebar"
                                tooltipSide="right"
                                onClick={() => setIsSidebarOpen(prev => !prev)}
                                className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                            >
                                <PanelRightClose size={16} strokeWidth={2} />
                            </Button>
                        </div>
                    </div>
                )}
            </Flex>

            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title="Login Required"
                description="Please sign in to access the command search feature."
            />
        </div>
    );
};
