'use client';
import { HistoryItem, Logo } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { useCreemSubscription, useLogout } from '@repo/common/hooks';
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
} from '@repo/ui';
import { compareDesc, isAfter, isToday, isYesterday, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import {
    ChevronsUpDown,
    Command,
    ExternalLink,
    FileText,
    HelpCircle,
    LogOut,
    PanelLeftClose,
    PanelRightClose,
    Pin,
    Plus,
    Search,
    Settings,
    Settings2,
    Shield,
    Sparkles,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
    const { logout, isLoggingOut } = useLogout();
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
                <div className="text-muted-foreground/70 flex flex-row items-center gap-1 px-2 py-1 text-xs font-medium opacity-70">
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
                'relative bottom-0 left-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col transition-all duration-300 ease-in-out',
                isSidebarOpen ? 'top-0 h-full w-[260px]' : 'w-[52px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 items-start overflow-hidden">
                {/* Header Section */}
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
                                'hover:bg-accent/50 flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg p-1 transition-all duration-200',
                                !isSidebarOpen && 'justify-center px-0'
                            )}
                        >
                            <Logo className="text-brand size-6 flex-shrink-0" />
                            {isSidebarOpen && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: 0.1 }}
                                    className="font-clash text-foreground text-xl font-bold tracking-wide"
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
                            className="text-muted-foreground hover:text-foreground transition-colors"
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
                        tooltip={isSidebarOpen ? undefined : 'New Chat'}
                        tooltipSide="right"
                        className={cn(
                            'relative shadow-sm transition-all duration-200',
                            isSidebarOpen
                                ? 'bg-primary hover:bg-primary/90 w-full justify-start'
                                : 'bg-primary hover:bg-primary/90'
                        )}
                        onClick={() => {
                            // Navigate to /chat to start a new conversation
                            push('/chat');
                            // Close mobile drawer if open
                            if (forceMobile) {
                                setIsMobileSidebarOpen(false);
                            }
                        }}
                    >
                        <Plus
                            size={16}
                            strokeWidth={2}
                            className={cn('flex-shrink-0', isSidebarOpen && 'mr-2')}
                        />
                        {isSidebarOpen && 'New Chat'}
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
                                ? 'text-muted-foreground hover:text-foreground hover:bg-accent relative w-full justify-between'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        )}
                        onClick={() => setIsCommandSearchOpen(true)}
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
                </Flex>

                {/* Subscription Section */}
                <div
                    className={cn(
                        'w-full transition-all duration-200',
                        isSidebarOpen ? 'border-border/50 mt-3 border-t px-4 pt-3' : 'mt-1 px-2'
                    )}
                >
                    {isSidebarOpen ? (
                        <Button
                            size="sm"
                            variant="ghost"
                            rounded="lg"
                            disabled={isPortalLoading}
                            className={cn(
                                'group relative w-full justify-start overflow-hidden border shadow-sm transition-all duration-300',
                                isPlusSubscriber
                                    ? // VT+ Subscriber - Premium Gold Style
                                      'border-[#D99A4E]/30 bg-gradient-to-r from-[#D99A4E]/20 to-[#BFB38F]/20 text-[#262626] hover:from-[#D99A4E]/30 hover:to-[#BFB38F]/30 hover:shadow-lg hover:shadow-[#D99A4E]/20 dark:border-[#BFB38F]/30 dark:from-[#D99A4E]/10 dark:to-[#BFB38F]/10 dark:text-[#BFB38F] dark:hover:from-[#D99A4E]/20 dark:hover:to-[#BFB38F]/20 dark:hover:shadow-[#BFB38F]/10'
                                    : // Upgrade Button - Attention-grabbing Red to Orange
                                      'border-[#BF4545]/50 bg-gradient-to-r from-[#BF4545]/90 to-[#D99A4E]/90 text-white hover:from-[#BF4545] hover:to-[#D99A4E] hover:shadow-lg hover:shadow-[#BF4545]/30 dark:border-[#BF4545]/40 dark:from-[#BF4545]/80 dark:to-[#D99A4E]/80 dark:hover:from-[#BF4545]/90 dark:hover:to-[#D99A4E]/90 dark:hover:shadow-[#BF4545]/20'
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
                                    'mr-2 flex-shrink-0 transition-all duration-300 group-hover:scale-110',
                                    isPlusSubscriber
                                        ? 'text-[#D99A4E] group-hover:text-[#D99A4E] dark:text-[#BFB38F] dark:group-hover:text-[#BFB38F]'
                                        : 'text-white drop-shadow-sm group-hover:text-white'
                                )}
                            />
                            <span
                                className={cn(
                                    'flex-1 text-left font-medium',
                                    isPlusSubscriber
                                        ? 'text-[#262626] dark:text-[#BFB38F]'
                                        : 'text-white drop-shadow-sm'
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
                                    size={12}
                                    className="ml-1 flex-shrink-0 text-[#D99A4E] dark:text-[#BFB38F]"
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
                                'group !m-0 flex items-center justify-center border !p-0 shadow-sm transition-all duration-300',
                                isPlusSubscriber
                                    ? // VT+ Subscriber - Premium Gold Style
                                      'border-[#D99A4E]/30 bg-gradient-to-br from-[#D99A4E]/20 to-[#BFB38F]/20 hover:from-[#D99A4E]/30 hover:to-[#BFB38F]/30 hover:shadow-lg hover:shadow-[#D99A4E]/20 dark:border-[#BFB38F]/30 dark:from-[#D99A4E]/10 dark:to-[#BFB38F]/10 dark:hover:from-[#D99A4E]/20 dark:hover:to-[#BFB38F]/20 dark:hover:shadow-[#BFB38F]/10'
                                    : // Upgrade Button - Attention-grabbing Red to Orange
                                      'border-[#BF4545]/50 bg-gradient-to-br from-[#BF4545]/90 to-[#D99A4E]/90 hover:from-[#BF4545] hover:to-[#D99A4E] hover:shadow-lg hover:shadow-[#BF4545]/30 dark:border-[#BF4545]/40 dark:from-[#BF4545]/80 dark:to-[#D99A4E]/80 dark:hover:from-[#BF4545]/90 dark:hover:to-[#D99A4E]/90 dark:hover:shadow-[#BF4545]/20'
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
                                        ? 'text-[#D99A4E] group-hover:text-[#D99A4E] dark:text-[#BFB38F] dark:group-hover:text-[#BFB38F]'
                                        : 'text-white drop-shadow-sm group-hover:text-white'
                                )}
                            />
                        </Button>
                    )}
                </div>

                {/* Thread History Section */}
                <div
                    className={cn(
                        'no-scrollbar w-full flex-1 overflow-y-auto transition-all duration-200',
                        isSidebarOpen
                            ? 'border-border/50 mt-4 flex flex-col gap-4 border-t px-4 pb-[120px] pt-4'
                            : 'hidden'
                    )}
                >
                    {threads.length === 0 ? (
                        <div className="flex w-full flex-col items-center justify-center gap-3 py-8">
                            <div className="text-muted-foreground/50 text-center">
                                <FileText size={24} strokeWidth={1.5} />
                            </div>
                            <div className="text-center">
                                <p className="text-muted-foreground text-sm font-medium">
                                    No conversations yet
                                </p>
                                <p className="text-muted-foreground/70 text-xs">
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
                                            className="text-muted-foreground/50"
                                        />
                                        <p className="text-muted-foreground text-center text-xs">
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

                {/* Bottom Section */}
                <div
                    className={cn(
                        'from-tertiary via-tertiary/95 absolute bottom-0 w-full bg-gradient-to-t to-transparent transition-all duration-200',
                        isSidebarOpen ? 'px-4 py-3 pt-12' : 'px-2 py-2 pt-8'
                    )}
                >
                    {!isSidebarOpen && (
                        <div className="mb-2 flex flex-col items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                tooltip="Open Sidebar"
                                tooltipSide="right"
                                onClick={() => setIsSidebarOpen(prev => !prev)}
                                className="text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                                <PanelRightClose size={16} strokeWidth={2} />
                            </Button>
                        </div>
                    )}
                    {isSignedIn && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    className={cn(
                                        'bg-background hover:bg-accent border-border/50 flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg border shadow-sm transition-all duration-200',
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
                                            <p className="text-foreground line-clamp-1 text-sm font-medium">
                                                {user?.name || user?.email}
                                            </p>
                                            <UserTierBadge />
                                        </div>
                                    )}
                                    {isSidebarOpen && (
                                        <ChevronsUpDown
                                            size={14}
                                            strokeWidth={2}
                                            className="text-muted-foreground flex-shrink-0"
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
                                {!isSignedIn && (
                                    <DropdownMenuItem onClick={() => push('/login')}>
                                        <User size={16} strokeWidth={2} />
                                        Log in
                                    </DropdownMenuItem>
                                )}
                                {isSignedIn && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => logout()}
                                            disabled={isLoggingOut}
                                            className={
                                                isLoggingOut ? 'cursor-not-allowed opacity-50' : ''
                                            }
                                        >
                                            <LogOut size={16} strokeWidth={2} />
                                            {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {isSidebarOpen && !isSignedIn && (
                        <div className="border-border/50 mt-3 flex w-full flex-col gap-2 border-t pt-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                rounded="lg"
                                className="text-muted-foreground hover:text-foreground w-full justify-start"
                                onClick={() => {
                                    setIsSettingsOpen(true);
                                }}
                            >
                                <Settings2 size={16} strokeWidth={2} className="mr-2" />
                                Settings
                            </Button>
                            <Button
                                size="sm"
                                rounded="lg"
                                className="w-full"
                                onClick={() => push('/login')}
                            >
                                Log in / Sign up
                            </Button>
                        </div>
                    )}
                </div>
            </Flex>
        </div>
    );
};
