'use client';
import { useRootContext } from '@repo/common/context';
import { useSubscriptionAccess } from '@repo/common/hooks/use-subscription-access';
import { useAppStore, useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug } from '@repo/shared/types/subscription';
import {
    Button,
    cn,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    Dialog,
    DialogContent,
    Kbd,
} from '@repo/ui';
import { isAfter, isToday, isYesterday, subDays } from 'date-fns';
import { Command, Key, MessageCircle, Moon, Plus, Settings, Sun, Trash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GatedFeatureAlert } from './gated-feature-alert';
import { LoginRequiredDialog, useLoginRequired } from './login-required-dialog';

// Create wrapper components for icons to match expected icon prop type
const KeyIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <Key size={size} className={className} />;

const MoonIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <Moon size={size} className={className} />;

export const CommandSearch = () => {
    const { threadId: currentThreadId } = useParams();
    const { isCommandSearchOpen, setIsCommandSearchOpen } = useRootContext();
    const threads = useChatStore(state => state.threads);
    const getThread = useChatStore(state => state.getThread);
    const removeThread = useChatStore(state => state.deleteThread);
    const switchThread = useChatStore(state => state.switchThread);
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const setSettingTab = useAppStore(state => state.setSettingTab);
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const clearThreads = useChatStore(state => state.clearAllThreads);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const { showLoginPrompt, requireLogin, hideLoginPrompt } = useLoginRequired();
    const { canAccess } = useSubscriptionAccess();
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

    threads.forEach(thread => {
        const createdAt = new Date(thread.createdAt);
        if (isToday(createdAt)) {
            groupedThreads.today.push(thread);
        } else if (isYesterday(createdAt)) {
            groupedThreads.yesterday.push(thread);
        } else if (isAfter(createdAt, subDays(new Date(), 7))) {
            groupedThreads.last7Days.push(thread);
        } else if (isAfter(createdAt, subDays(new Date(), 30))) {
            groupedThreads.last30Days.push(thread);
        } else {
            groupedThreads.previousMonths.push(thread);
        }
    });

    useEffect(() => {
        router.prefetch('/chat');
    }, [isCommandSearchOpen, threads, router]);

    useEffect(() => {
        if (isCommandSearchOpen) {
        }
    }, [isCommandSearchOpen]);

    const onClose = () => setIsCommandSearchOpen(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsCommandSearchOpen(true);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

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
                router.push('/chat');
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
                    router.push('/chat');
                    onClose();
                }
            },
            requiresAuth: true,
        },
        {
            name: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`,
            icon: theme === 'dark' ? Sun : Moon,
            action: () => {
                if (!isSignedIn) {
                    requireLogin();
                    return;
                }

                // Check if user has VT+ subscription for dark theme
                if (!canAccess(FeatureSlug.DARK_THEME)) {
                    setShowSubscriptionDialog(true);
                    return;
                }

                setTheme(theme === 'dark' ? 'light' : 'dark');
                onClose();
            },
            requiresAuth: true,
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
                router.push('/chat');
                onClose();
            },
        },
    ];

    return (
        <CommandDialog open={isCommandSearchOpen} onOpenChange={setIsCommandSearchOpen}>
            <div className="flex w-full flex-row items-center gap-2 p-0.5">
                <CommandInput placeholder="Search..." className="w-full" />
                <div className="flex shrink-0 items-center gap-1 px-2">
                    <Kbd className="h-5 w-5">
                        <Command size={12} strokeWidth={2} className="shrink-0" />
                    </Kbd>
                    <Kbd className="h-5 w-5">K</Kbd>
                </div>
            </div>
            <div className="w-full">
                <div className="border-border h-[1px] w-full border-b" />
            </div>
            <CommandList className="max-h-[420px] overflow-y-auto p-0.5 pt-1.5">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                    {actions.map(action => {
                        const actionItem = (
                            <CommandItem
                                key={action.name}
                                className="gap-"
                                value={action.name}
                                onSelect={action.action}
                            >
                                <action.icon
                                    size={14}
                                    strokeWidth="2"
                                    className="text-muted-foreground flex-shrink-0"
                                />
                                {action.name}
                            </CommandItem>
                        );

                        // Wrap auth-required actions with GatedFeatureAlert
                        if (action.requiresAuth && !isSignedIn) {
                            return (
                                <GatedFeatureAlert
                                    key={action.name}
                                    title="Login Required"
                                    message={`Please sign in to ${action.name.toLowerCase()}.`}
                                    showAlert={true}
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
                                key={key}
                                heading={groupsNames[key as keyof typeof groupsNames]}
                            >
                                {threads.map(thread => (
                                    <CommandItem
                                        key={thread.id}
                                        value={`${thread.id}/${thread.title}`}
                                        className={cn('w-full gap-3')}
                                        onSelect={() => {
                                            switchThread(thread.id);
                                            router.push(`/chat/${thread.id}`);
                                            onClose();
                                        }}
                                    >
                                        <MessageCircle
                                            size={16}
                                            strokeWidth={2}
                                            className="text-muted-foreground/50"
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
                isOpen={showLoginPrompt}
                onClose={hideLoginPrompt}
                title="Login Required"
                description="Please sign in to access this feature."
                icon={KeyIcon}
            />

            <Dialog open={showSubscriptionDialog} onOpenChange={setShowSubscriptionDialog}>
                <DialogContent ariaTitle="VT+ Required" className="max-w-md rounded-xl">
                    <div className="flex flex-col items-center gap-4 p-6 text-center">
                        <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                            <Moon size={24} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">VT+ Required</h3>
                            <p className="text-muted-foreground text-sm">
                                Dark theme is a VT+ exclusive feature. Upgrade to enjoy a better
                                viewing experience.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outlined"
                                onClick={() => setShowSubscriptionDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    router.push('/plus');
                                    setShowSubscriptionDialog(false);
                                    onClose();
                                }}
                            >
                                Upgrade to VT+
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </CommandDialog>
    );
};
