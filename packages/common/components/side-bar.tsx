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

export const Sidebar = () => {
    const { threadId: currentThreadId } = useParams();
    const { setIsCommandSearchOpen } = useRootContext();
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
    const isSidebarOpen = useAppStore(state => state.isSidebarOpen);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const { push } = useRouter();
    const { isPlusSubscriber, openCustomerPortal, isPortalLoading } = useCreemSubscription();
    const { logout } = useLogout();
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
                    <Flex className="border-border/50 w-full gap-0.5" gap="none" direction="col">
                        {threads.map(thread => (
                            <HistoryItem
                                thread={thread}
                                pinThread={() => pinThread(thread.id)}
                                unpinThread={() => unpinThread(thread.id)}
                                isPinned={thread.pinned}
                                key={thread.id}
                                dismiss={() => {
                                    setIsSidebarOpen(() => false);
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
                'relative bottom-0 left-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col  py-2 transition-all duration-200',
                isSidebarOpen ? 'top-0 h-full w-[230px]' : 'w-[50px]'
            )}
        >
            <Flex direction="col" className="w-full flex-1 items-start overflow-hidden">
                <div className="mb-3 flex w-full flex-row items-center justify-between">
                    <Link href="/chat" className="w-full">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={cn(
                                'flex h-8 w-full cursor-pointer items-center justify-start gap-1.5 px-4',
                                !isSidebarOpen && 'justify-center px-0'
                            )}
                        >
                            <Logo className="text-brand size-5" />
                            {isSidebarOpen && (
                                <p className="font-clash text-foreground text-lg font-bold tracking-wide">
                                    VT
                                </p>
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
                            className={cn(!isSidebarOpen && 'mx-auto', 'mr-2')}
                        >
                            <PanelLeftClose size={16} strokeWidth={2} />
                        </Button>
                    )}
                </div>
                <Flex
                    direction="col"
                    className={cn(
                        'w-full items-end px-3 ',
                        !isSidebarOpen && 'items-center justify-center px-0'
                    )}
                    gap="xs"
                >
                    {/* Primary Actions Section */}
                    <div
                        className={cn('flex w-full gap-2', isSidebarOpen ? 'flex-col' : 'flex-col')}
                    >
                        {/* New Chat Button */}
                        <Button
                            size={isSidebarOpen ? 'sm' : 'icon-sm'}
                            variant="bordered"
                            rounded="lg"
                            tooltip={isSidebarOpen ? undefined : 'New Chat'}
                            tooltipSide="right"
                            className={cn(isSidebarOpen && 'relative w-full', 'justify-center')}
                            onClick={() => {
                                // Navigate to /chat to start a new conversation
                                push('/chat');
                            }}
                        >
                            <Plus
                                size={16}
                                strokeWidth={2}
                                className={cn(isSidebarOpen && 'mr-2')}
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
                                isSidebarOpen && 'relative w-full',
                                'text-muted-foreground justify-center px-2'
                            )}
                            onClick={() => setIsCommandSearchOpen(true)}
                        >
                            <Search
                                size={14}
                                strokeWidth={2}
                                className={cn(isSidebarOpen && 'mr-2')}
                            />
                            {isSidebarOpen && 'Search'}
                            {isSidebarOpen && <div className="flex-1" />}
                            {isSidebarOpen && (
                                <div className="flex flex-row items-center gap-1">
                                    <Badge
                                        variant="secondary"
                                        className="bg-muted-foreground/10 text-muted-foreground flex size-5 items-center justify-center rounded-md p-0"
                                    >
                                        <Command size={12} strokeWidth={2} className="shrink-0" />
                                    </Badge>
                                    <Badge
                                        variant="secondary"
                                        className="bg-muted-foreground/10 text-muted-foreground flex size-5 items-center justify-center rounded-md p-0"
                                    >
                                        K
                                    </Badge>
                                </div>
                            )}
                        </Button>
                    </div>

                    {/* Subscription Section */}
                    {isSidebarOpen && (
                        <div className="border-border mt-2 w-full border-t border-dashed pt-2">
                            <Button
                                size="sm"
                                variant={isPlusSubscriber ? 'secondary' : 'bordered'}
                                rounded="lg"
                                disabled={isPortalLoading}
                                className="relative w-full justify-center px-2"
                                onClick={() => {
                                    if (isPlusSubscriber) {
                                        openCustomerPortal();
                                    } else {
                                        push('/plus');
                                    }
                                }}
                            >
                                <Sparkles size={14} strokeWidth={2} />
                                {isPortalLoading
                                    ? BUTTON_TEXT.LOADING
                                    : isPlusSubscriber
                                      ? BUTTON_TEXT.MANAGE_SUBSCRIPTION
                                      : BUTTON_TEXT.UPGRADE_TO_PLUS}
                                {isPlusSubscriber && <ExternalLink size={12} />}
                            </Button>
                        </div>
                    )}

                    {!isSidebarOpen && (
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
                            className="text-muted-foreground justify-center px-2"
                            onClick={() => {
                                if (isPlusSubscriber) {
                                    openCustomerPortal();
                                } else {
                                    push('/plus');
                                }
                            }}
                        >
                            <Sparkles size={14} strokeWidth={2} />
                        </Button>
                    )}
                </Flex>

                {/* Thread History Section */}
                <Flex
                    direction="col"
                    gap="xs"
                    className={cn(
                        'border-hard mt-4 w-full justify-center border-t border-dashed px-3 pt-3',
                        !isSidebarOpen && 'items-center justify-center px-0'
                    )}
                >
                    {/* Thread history will be displayed below when sidebar is open */}
                </Flex>

                <Flex
                    direction="col"
                    gap="lg"
                    className={cn(
                        'no-scrollbar w-full flex-1 overflow-y-auto px-3 pb-[100px]',
                        isSidebarOpen ? 'flex' : 'hidden'
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
                </Flex>

                <Flex
                    className={cn(
                        'from-tertiary via-tertiary/95 absolute bottom-0 mt-auto w-full items-center bg-gradient-to-t via-60% to-transparent p-2 pt-12',
                        isSidebarOpen && 'items-start justify-between'
                    )}
                    gap="xs"
                    direction={'col'}
                >
                    {!isSidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            tooltip="Open Sidebar"
                            tooltipSide="right"
                            onClick={() => setIsSidebarOpen(prev => !prev)}
                            className={cn(!isSidebarOpen && 'mx-auto')}
                        >
                            <PanelRightClose size={16} strokeWidth={2} />
                        </Button>
                    )}
                    {isSignedIn && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div
                                    className={cn(
                                        'hover:bg-quaternary bg-background shadow-subtle-xs flex w-full cursor-pointer flex-row items-center gap-3 rounded-lg px-2 py-1.5',
                                        !isSidebarOpen && 'px-1.5'
                                    )}
                                >
                                    <div className="bg-brand flex size-5 shrink-0 items-center justify-center rounded-full">
                                        {user && user.image ? (
                                            <img
                                                src={user.image}
                                                width={0}
                                                height={0}
                                                className="size-full shrink-0 rounded-full"
                                                alt={user.name || user.email}
                                            />
                                        ) : (
                                            <User
                                                size={14}
                                                strokeWidth={2}
                                                className="text-background"
                                            />
                                        )}
                                    </div>

                                    {isSidebarOpen && (
                                        <div className="flex flex-1 flex-col items-start">
                                            <p className="line-clamp-1 !text-sm font-medium">
                                                {user?.name || user?.email}
                                            </p>
                                            <UserTierBadge />
                                        </div>
                                    )}
                                    {isSidebarOpen && (
                                        <ChevronsUpDown
                                            size={14}
                                            strokeWidth={2}
                                            className="text-muted-foreground"
                                        />
                                    )}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56 pl-2">
                                {/* Account Management */}
                                <DropdownMenuLabel>Account</DropdownMenuLabel>
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
                                        <DropdownMenuItem onClick={() => logout()}>
                                            <LogOut size={16} strokeWidth={2} />
                                            Sign out
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    {isSidebarOpen && !isSignedIn && (
                        <div className="flex w-full flex-col gap-1.5 p-1">
                            <Button
                                variant="bordered"
                                size="sm"
                                rounded="lg"
                                onClick={() => {
                                    setIsSettingsOpen(true);
                                }}
                            >
                                <Settings2 size={14} strokeWidth={2} />
                                Settings
                            </Button>
                            <Button size="sm" rounded="lg" onClick={() => push('/login')}>
                                Log in / Sign up
                            </Button>
                        </div>
                    )}
                </Flex>
            </Flex>
        </div>
    );
};
