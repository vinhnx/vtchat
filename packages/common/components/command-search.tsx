'use client';
import { useRootContext } from '@repo/common/context';

import { useAppStore, useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';

import { log } from '@repo/shared/logger';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { getIsAfter, getIsToday, getIsYesterday, getSubDays } from '@repo/shared/utils';
import {
    Button,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    cn,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Kbd,
    useToast,
} from '@repo/ui';
import { Command, Key, MessageCircle, Palette, Plus, Settings, Trash } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useFeatureAccess } from '../hooks/use-subscription-access';
import { GatedFeatureAlert } from './gated-feature-alert';
import { LoginRequiredDialog, useLoginRequired } from './login-required-dialog';

export const CommandSearch = () => {
    const { threadId: currentThreadId } = useParams();
    const { isCommandSearchOpen, setIsCommandSearchOpen } = useRootContext();
    const threads = useChatStore((state) => state.threads);
    const getThread = useChatStore((state) => state.getThread);
    const removeThread = useChatStore((state) => state.deleteThread);
    const switchThread = useChatStore((state) => state.switchThread);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const setSettingTab = useAppStore((state) => state.setSettingTab);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const clearThreads = useChatStore((state) => state.clearAllThreads);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    const hasThemeAccess = useFeatureAccess(FeatureSlug.DARK_THEME);
    const { toast } = useToast();

    const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

    const groupedThreads: Record<string, typeof threads> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    const groupsNames = {
        today: 'Today',
        yesterday: 'Yesterday',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        previousMonths: 'Previous Months',
    };

    threads.forEach((thread) => {
        const createdAt = new Date(thread.createdAt);
        if (getIsToday(createdAt)) {
            groupedThreads.today.push(thread);
        } else if (getIsYesterday(createdAt)) {
            groupedThreads.yesterday.push(thread);
        } else if (getIsAfter(createdAt, getSubDays(new Date(), 7))) {
            groupedThreads.last7Days.push(thread);
        } else if (getIsAfter(createdAt, getSubDays(new Date(), 30))) {
            groupedThreads.last30Days.push(thread);
        } else {
            groupedThreads.previousMonths.push(thread);
        }
    });

    useEffect(() => {
        router.prefetch('/');
    }, [isCommandSearchOpen, threads, router]);

    useEffect(() => {
        if (isCommandSearchOpen) {
        }
    }, [isCommandSearchOpen]);

    const onClose = () => setIsCommandSearchOpen(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Command+K for command search
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandSearchOpen(true);
                return;
            }

            // Command+Ctrl+Option+N for new chat
            if (e.key === 'n' && e.metaKey && e.ctrlKey && e.altKey) {
                e.preventDefault();
                log.info({}, '🚀 New chat keyboard shortcut triggered (Cmd+Ctrl+Opt+N)');

                // Show toast notification
                toast({
                    title: 'New Chat',
                    description: 'Starting a new conversation...',
                    duration: 2000,
                });

                router.push('/');
                return;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [setIsCommandSearchOpen, router, toast]);

    type ActionItem = {
        name: string;
        icon: React.ComponentType<any>;
        action: () => void;
        requiresAuth?: boolean;
    };

    const actions: ActionItem[] = [
        {
            name: 'New Thread',
            icon: Plus,
            action: () => {
                router.push('/');
                onClose();
            },
        },
        {
            name: 'Delete Thread',
            icon: Trash,
            action: async () => {
                if (!isSignedIn) {
                    requireLogin();
                    return;
                }

                const thread = await getThread(currentThreadId as string);
                if (thread) {
                    removeThread(thread.id);
                    router.push('/');
                    onClose();
                }
            },
            requiresAuth: true,
        },
        {
            name: 'Change Theme',
            icon: Palette,
            action: () => {
                // Check if user is trying to switch to dark mode without VT+ access
                const nextTheme = theme === 'light' ? 'dark' : 'light';

                if (nextTheme === 'dark' && !hasThemeAccess) {
                    setShowSubscriptionDialog(true);
                    return;
                }

                setTheme(nextTheme);
                onClose();
            },
            requiresAuth: false,
        },
        {
            name: 'Settings',
            icon: Settings,
            action: () => {
                if (!isSignedIn) {
                    requireLogin();
                    return;
                }
                setIsSettingsOpen(true);
                onClose();
            },
            requiresAuth: true,
        },
        {
            name: 'Use your own API key',
            icon: Key,
            action: () => {
                if (!isSignedIn) {
                    requireLogin();
                    return;
                }
                setIsSettingsOpen(true);
                setSettingTab('api-keys');
                onClose();
            },
            requiresAuth: true,
        },
        {
            name: 'Remove All Threads',
            icon: Trash,
            action: () => {
                clearThreads();
                router.push('/');
                onClose();
            },
        },
    ];

    return (
        <CommandDialog onOpenChange={setIsCommandSearchOpen} open={isCommandSearchOpen}>
            <div className="flex w-full flex-row items-center justify-between gap-2 p-0.5">
                <div className="flex-1 [&_[cmdk-input-wrapper]]:border-b-0">
                    <CommandInput placeholder="Search..." />
                </div>
                <div className="flex shrink-0 items-center gap-1 px-2">
                    <Kbd className="h-5 w-5">
                        <Command className="shrink-0" size={12} strokeWidth={2} />
                    </Kbd>
                    <Kbd className="h-5 w-5">K</Kbd>
                </div>
            </div>
            <CommandList className="max-h-[420px] touch-pan-y overflow-y-auto overscroll-contain p-0.5 pt-1.5">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {actions.map((action) => {
                        const actionItem = (
                            <CommandItem
                                className="gap-"
                                key={action.name}
                                onSelect={action.action}
                                value={action.name}
                            >
                                <action.icon
                                    className="text-muted-foreground flex-shrink-0"
                                    size={14}
                                    strokeWidth="2"
                                />
                                {action.name}
                            </CommandItem>
                        );

                        // Wrap auth-required actions with GatedFeatureAlert
                        if (action.requiresAuth && !isSignedIn) {
                            return (
                                <GatedFeatureAlert
                                    key={action.name}
                                    message={`Please sign in to ${action.name.toLowerCase()}.`}
                                    showAlert={true}
                                    title="Login Required"
                                >
                                    {actionItem}
                                </GatedFeatureAlert>
                            );
                        }

                        return actionItem;
                    })}
                </CommandGroup>
                {Object.entries(groupedThreads).map(
                    ([key, threads]) =>
                        threads.length > 0 && (
                            <CommandGroup
                                heading={groupsNames[key as keyof typeof groupsNames]}
                                key={key}
                            >
                                {threads.map((thread) => (
                                    <CommandItem
                                        className={cn('w-full gap-3')}
                                        key={thread.id}
                                        onSelect={() => {
                                            switchThread(thread.id);
                                            router.push(`/chat/${thread.id}`);
                                            onClose();
                                        }}
                                        value={`${thread.id}/${thread.title}`}
                                    >
                                        <MessageCircle
                                            className="text-muted-foreground/50"
                                            size={16}
                                            strokeWidth={2}
                                        />
                                        <span className="w-full truncate font-normal">
                                            {thread.title}
                                        </span>
                                        {/* <span className="text-muted-foreground flex-shrink-0 pl-4 text-xs !font-normal">
                                            {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: false })}
                                        </span> */}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )
                )}
            </CommandList>

            <LoginRequiredDialog
                description="Please sign in to access this feature."
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title="Login Required"
            />

            <Dialog onOpenChange={setShowSubscriptionDialog} open={showSubscriptionDialog}>
                <DialogContent ariaTitle="Sign In Required" className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sign In Required</DialogTitle>
                        <DialogDescription>
                            Dark theme is available to all registered users. Sign in to enjoy a
                            better viewing experience.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3">
                        <Button onClick={() => setShowSubscriptionDialog(false)} variant="outline">
                            Cancel
                        </Button>
                        <Button
                            className="gap-2"
                            onClick={() => {
                                router.push('/login');
                                setShowSubscriptionDialog(false);
                                onClose();
                            }}
                        >
                            Login
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </CommandDialog>
    );
};
