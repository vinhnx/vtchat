import { HistoryItem } from "@repo/common/components";
import { UserButton } from "@repo/common/components/user-button";
import { useRootContext } from "@repo/common/context";
import { useAppStore, useChatStore } from "@repo/common/store";
import { useSession } from "@repo/shared/lib/auth-client";
import type { Thread } from "@repo/shared/types";
import { Button, cn, Flex, Skeleton } from "@repo/ui";
import { PanelLeftClose, PanelRightClose, Plus, Search } from "lucide-react";
import moment from "moment";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";

export const Sidebar = () => {
    const { threadId: currentThreadId } = useParams();
    const pathname = usePathname();
    const { setIsCommandSearchOpen } = useRootContext();
    const { push } = useRouter();
    const isChatPage = pathname === "/" || pathname.startsWith("/chat/");
    const threads = useChatStore((state) => state.threads);
    const { data: session, isPending: isAuthLoading } = useSession();
    const isSignedIn = !!session;
    const sortThreads = (threads: Thread[], sortBy: "createdAt") => {
        return [...threads].sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
    };
    const _clearAllThreads = useChatStore((state) => state.clearAllThreads);
    const pinThread = useChatStore((state) => state.pinThread);
    const unpinThread = useChatStore((state) => state.unpinThread);
    const setIsSidebarOpen = useAppStore((state) => state.setIsSidebarOpen);
    const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);

    const groupedThreads: Record<string, Thread[]> = {
        today: [],
        yesterday: [],
        last7Days: [],
        last30Days: [],
        previousMonths: [],
    };

    sortThreads(threads, "createdAt")?.forEach((thread) => {
        const createdAt = moment(thread.createdAt);
        const now = moment();
        if (createdAt.isSame(now, "day")) {
            groupedThreads.today.push(thread);
        } else if (createdAt.isSame(now.clone().subtract(1, "day"), "day")) {
            groupedThreads.yesterday.push(thread);
        } else if (createdAt.isAfter(now.clone().subtract(7, "days"))) {
            groupedThreads.last7Days.push(thread);
        } else if (createdAt.isAfter(now.clone().subtract(30, "days"))) {
            groupedThreads.last30Days.push(thread);
        } else {
            groupedThreads.previousMonths.push(thread);
        }
    });

    const renderGroup = (title: string, threads: Thread[]) => {
        if (threads.length === 0) return null;
        return (
            <Flex className="w-full" direction="col" gap="xs" items="start">
                <p className="text-muted-foreground py-1 text-xs">{title}</p>
                <Flex
                    className="border-border/50 w-full gap-0.5 border-l pl-2"
                    direction="col"
                    gap="none"
                >
                    {threads.map((thread) => (
                        <HistoryItem
                            dismiss={() => {
                                setIsSidebarOpen((_prev) => false);
                            }}
                            isActive={thread.id === currentThreadId}
                            isPinned={thread.pinned}
                            key={thread.id}
                            pinThread={pinThread}
                            thread={thread}
                            unpinThread={unpinThread}
                        />
                    ))}
                </Flex>
            </Flex>
        );
    };

    return (
        <div
            className={cn(
                "border-border/0 relative bottom-0 right-0 top-0 z-[50] flex h-[100dvh] flex-shrink-0 flex-col border-l border-dashed py-2 transition-all duration-200",
                isSidebarOpen
                    ? "border-border/70 bg-background shadow-xs top-0 h-full w-[240px] border-l"
                    : "w-[50px]",
            )}
        >
            <Flex className="w-full flex-1 overflow-hidden" direction="col">
                <Flex className="w-full px-2" direction="col" gap="sm">
                    <Button
                        className={cn("relative w-full shadow-sm", "justify-center")}
                        onClick={() => !isChatPage && push("/")}
                        rounded="full"
                        size={isSidebarOpen ? "sm" : "icon"}
                        tooltip={isSidebarOpen ? undefined : "New Thread"}
                        tooltipSide="right"
                        variant="bordered"
                    >
                        <Plus
                            className={cn(isSidebarOpen && "absolute left-2")}
                            size={16}
                            strokeWidth={2}
                        />
                        {isSidebarOpen && "New"}
                    </Button>
                    <Button
                        className={cn("relative w-full", "justify-center")}
                        onClick={() => setIsCommandSearchOpen(true)}
                        rounded="full"
                        size={isSidebarOpen ? "sm" : "icon"}
                        tooltip={isSidebarOpen ? undefined : "Search"}
                        tooltipSide="right"
                        variant="secondary"
                    >
                        <Search
                            className={cn(isSidebarOpen && "absolute left-2")}
                            size={16}
                            strokeWidth={2}
                        />
                        {isSidebarOpen && "Search"}
                    </Button>
                </Flex>

                {isAuthLoading ? (
                    <Flex
                        className={cn(
                            "border-border/70 mt-3 w-full flex-1 overflow-y-auto border-t border-dashed p-3",
                            isSidebarOpen ? "flex" : "hidden",
                        )}
                        direction="col"
                        gap="md"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-12" />
                                <div className="space-y-1 pl-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-16" />
                                <div className="space-y-1 pl-2">
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-5/6" />
                                    <Skeleton className="h-6 w-2/3" />
                                </div>
                            </div>
                        </div>
                    </Flex>
                ) : (
                    <Flex
                        className={cn(
                            "border-border/70 mt-3 w-full flex-1 overflow-y-auto border-t border-dashed p-3",
                            isSidebarOpen ? "flex" : "hidden",
                        )}
                        direction="col"
                        gap="md"
                    >
                        {renderGroup("Today", groupedThreads.today)}
                        {renderGroup("Yesterday", groupedThreads.yesterday)}
                        {renderGroup("Last 7 Days", groupedThreads.last7Days)}
                        {renderGroup("Last 30 Days", groupedThreads.last30Days)}
                        {renderGroup("Previous Months", groupedThreads.previousMonths)}
                    </Flex>
                )}

                <Flex
                    className="mt-auto w-full p-2"
                    direction={"col"}
                    gap="xs"
                    justify={isSidebarOpen ? "between" : "center"}
                >
                    {isSidebarOpen && (
                        <Flex className="w-full items-center justify-between px-2">
                            <Button
                                className={cn(!isSidebarOpen && "mx-auto")}
                                onClick={() => setIsSidebarOpen((prev) => !prev)}
                                size={isSidebarOpen ? "sm" : "icon"}
                                tooltip="Close Sidebar"
                                variant="ghost"
                            >
                                <PanelLeftClose size={16} strokeWidth={2} /> Close
                            </Button>
                        </Flex>
                    )}
                    {!isSidebarOpen && (
                        <Button
                            className={cn(!isSidebarOpen && "mx-auto")}
                            onClick={() => setIsSidebarOpen((prev) => !prev)}
                            size="icon"
                            variant="ghost"
                        >
                            <PanelRightClose size={16} strokeWidth={2} />
                        </Button>
                    )}
                    <div className="sticky right-0 top-0 z-50 flex items-center gap-1 px-4 py-2">
                        {isAuthLoading ? (
                            <div className="flex items-center gap-2 p-1">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-20 rounded" />
                            </div>
                        ) : isSignedIn ? (
                            <UserButton showName />
                        ) : (
                            <Link href="/login">
                                <Button rounded="full" size="sm" variant="default">
                                    Log in
                                </Button>
                            </Link>
                        )}
                    </div>
                </Flex>
            </Flex>
        </div>
    );
};
