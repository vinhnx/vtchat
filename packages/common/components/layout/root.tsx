"use client";
import { createPortal } from "react-dom";
import { CommandSearch, SettingsModal } from "@repo/common/components";
import { useRootContext } from "@repo/common/context";
import {
    AgentProvider,
    useAdmin,
    useLogout,
    useMobilePWANotification,
    useVTPlusAnnouncement,
} from "@repo/common/hooks";
import { useAppStore } from "@repo/common/store";
import { getSessionCacheBustedAvatarUrl } from "@repo/common/utils/avatar-cache";
import { useSession } from "@repo/shared/lib/auth-client";
import { log } from "@repo/shared/lib/logger";
import {
    AvatarLegacy as Avatar,
    Badge,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Flex,
    SonnerToaster,
} from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
    Database,
    FileText,
    HelpCircle,
    Info,
    LogOut,
    Menu,
    Settings,
    Shield,
    User,
    X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, type FC } from "react";
import { useStickToBottom } from "use-stick-to-bottom";
import { BasicSidebar } from "../basic-sidebar";

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen, isClient } =
        useRootContext();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isAdmin } = useAdmin();
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const sidebarPlacement = useAppStore((state) => state.sidebarPlacement);
    const router = useRouter();
    const { logout, isLoggingOut } = useLogout();

    // Show VT+ announcement toast once
    useVTPlusAnnouncement();

    // Show mobile PWA installation notification
    useMobilePWANotification();

    const containerClass =
        "relative flex flex-1 flex-row h-[100dvh] border border-border rounded-sm bg-secondary w-full overflow-hidden shadow-sm";

    // Hide drop shadow on plus page
    const shouldShowDropShadow = pathname !== "/pricing";

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname, setIsMobileSidebarOpen]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileSidebarOpen]);

    // Render consistent structure during SSR and client hydration
    // Only show complex interactive elements after client is ready
    if (!isClient) {
        return (
            <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
                {/* Simplified structure during SSR to match client structure */}
                <div className="item-center bg-tertiary fixed inset-0 z-[99999] flex justify-center md:hidden">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-muted-foreground text-center text-sm">
                            Loading...
                        </span>
                    </div>
                </div>
                {/* Left sidebar placeholder during SSR */}
                {sidebarPlacement === "left" && (
                    <div className="hidden lg:flex">
                        {isSidebarOpen && (
                            <div className="w-[300px] max-w-[300px] flex-none">
                                {/* Empty sidebar placeholder */}
                            </div>
                        )}
                    </div>
                )}
                <div className={containerClass}>
                    <div className="flex w-full flex-col gap-2 overflow-y-auto p-4">{children}</div>
                </div>
                {/* Right sidebar placeholder during SSR */}
                {sidebarPlacement === "right" && (
                    <div className="hidden lg:flex">
                        {isSidebarOpen && (
                            <div className="w-[300px] max-w-[300px] flex-none">
                                {/* Empty sidebar placeholder */}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            {/* Fixed Left Sidebar - Only visible when placement is left on desktop */}
            {sidebarPlacement === "left" && (
                <div className="desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none lg:block">
                    <BasicSidebar />
                </div>
            )}

            {/* Main Content */}
            <Flex className="h-[100dvh] flex-1 overflow-hidden">
                <motion.div
                    className={`flex h-full w-full md:py-1 ${sidebarPlacement === "left" ? "md:pr-1" : "md:pl-1"}`}
                >
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className="relative flex h-full w-0 flex-1 flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto">
                                    {shouldShowDropShadow && (
                                        <div className="from-secondary via-secondary/70 to-secondary/0 absolute left-0 right-0 top-0 z-40 flex hidden flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12 md:block" />
                                    )}

                                    {children}
                                </div>
                            </div>
                            <SideDrawer />
                        </div>
                    </AgentProvider>
                </motion.div>
                <SettingsModal />
                <CommandSearch />
            </Flex>

            {/* Mobile Sidebar Modal Overlay - Rendered via Portal */}
            {typeof window !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isMobileSidebarOpen && (
                            <div
                                className="fixed inset-0 md:hidden"
                                style={{
                                    position: "fixed",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 99999,
                                }}
                            >
                                {/* Backdrop */}
                                <motion.div
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                    onClick={(e) => {
                                        // Check if click target is inside the sidebar content or dropdown
                                        const target = e.target as HTMLElement;
                                        const isInsideSidebar =
                                            target.closest("[data-sidebar-content]");
                                        const isInsideDropdown =
                                            target.closest("[data-radix-popper-content-wrapper]") ||
                                            target.closest('[role="menu"]') ||
                                            target.closest("[data-radix-menu-content]") ||
                                            target.closest("[data-radix-dropdown-menu-content]");

                                        // Only close sidebar if clicking on overlay, not sidebar content or dropdown
                                        if (!(isInsideSidebar || isInsideDropdown)) {
                                            setIsMobileSidebarOpen(false);
                                        }
                                    }}
                                    onTouchEnd={(e) => {
                                        // Handle iOS touch events specifically
                                        const target = e.target as HTMLElement;
                                        const isInsideSidebar =
                                            target.closest("[data-sidebar-content]");
                                        const isInsideDropdown =
                                            target.closest("[data-radix-popper-content-wrapper]") ||
                                            target.closest('[role="menu"]') ||
                                            target.closest("[data-radix-menu-content]") ||
                                            target.closest("[data-radix-dropdown-menu-content]");

                                        // Only close sidebar if touching overlay, not sidebar content or dropdown
                                        if (!(isInsideSidebar || isInsideDropdown)) {
                                            setIsMobileSidebarOpen(false);
                                        }
                                    }}
                                    transition={{ duration: 0.2 }}
                                />

                                {/* Sidebar Content */}
                                <motion.div
                                    animate={{ x: 0 }}
                                    className={`bg-tertiary border-border absolute bottom-0 top-0 w-[300px] max-w-[300px] border-r shadow-2xl ${sidebarPlacement === "left" ? "left-0" : "right-0"}`}
                                    exit={{ x: sidebarPlacement === "left" ? -300 : 300 }}
                                    initial={{ x: sidebarPlacement === "left" ? -300 : 300 }}
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Navigation menu"
                                    transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                    style={{ zIndex: 100000 }}
                                >
                                    <div
                                        className="h-full overflow-hidden"
                                        data-sidebar-content
                                        data-mobile-sidebar
                                    >
                                        <BasicSidebar forceMobile={true} />
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}

            <SonnerToaster />

            {/* Right Sidebar - Only visible when placement is right on desktop */}
            {sidebarPlacement === "right" && (
                <div className="desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none lg:block">
                    <BasicSidebar />
                </div>
            )}

            {/* Mobile Floating Buttons Container */}
            {isClient && (
                <div
                    className={`fixed left-4 top-4 flex flex-col gap-6 md:hidden ${isMobileSidebarOpen ? "z-[299]" : "z-[100]"}`}
                >
                    {/* Profile Button */}
                    {session && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="bg-primary h-12 w-12 rounded-full p-1 shadow-lg transition-shadow hover:shadow-xl"
                                    size="icon"
                                    variant="default"
                                >
                                    <Avatar
                                        className="h-8 w-8"
                                        name={session.user?.name || session.user?.email || "User"}
                                        size="md"
                                        src={
                                            getSessionCacheBustedAvatarUrl(session.user?.image) ||
                                            undefined
                                        }
                                    />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="z-[150] mb-2 w-48">
                                <DropdownMenuItem onClick={() => router.push("/profile")}>
                                    <User className="mr-2" size={16} strokeWidth={2} />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                    <Settings className="mr-2" size={16} strokeWidth={2} />
                                    Settings
                                </DropdownMenuItem>

                                {/* Admin Menu Item */}
                                {isAdmin && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        <Database className="mr-2" size={16} strokeWidth={2} />
                                        Admin Dashboard
                                    </DropdownMenuItem>
                                )}

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => router.push("/about")}>
                                    <Info className="mr-2" size={16} strokeWidth={2} />
                                    About
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/help")}>
                                    <HelpCircle className="mr-2" size={16} strokeWidth={2} />
                                    Help Center
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/privacy")}>
                                    <Shield className="mr-2" size={16} strokeWidth={2} />
                                    Privacy Policy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => router.push("/terms")}>
                                    <FileText className="mr-2" size={16} strokeWidth={2} />
                                    Terms of Service
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className={isLoggingOut ? "cursor-not-allowed opacity-50" : ""}
                                    disabled={isLoggingOut}
                                    onClick={() => logout()}
                                >
                                    <LogOut className="mr-2" size={16} strokeWidth={2} />
                                    {isLoggingOut ? "Signing out..." : "Sign out"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Sidebar Menu Button */}
                    <Button
                        className="bg-primary text-primary-foreground h-12 w-12 rounded-full shadow-lg transition-shadow hover:shadow-xl"
                        onClick={() => setIsMobileSidebarOpen(true)}
                        size="icon"
                        variant="default"
                    >
                        <Menu size={20} strokeWidth={2} />
                    </Button>
                </div>
            )}
        </div>
    );
};

export const SideDrawer = () => {
    const pathname = usePathname();
    const sideDrawer = useAppStore((state) => state.sideDrawer);
    const dismissSideDrawer = useAppStore((state) => state.dismissSideDrawer);
    const { isClient } = useRootContext();
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
    });
    const isThreadPage =
        pathname !== "/" &&
        pathname !== "/recent" &&
        pathname !== "/settings" &&
        pathname !== "/pricing" &&
        pathname !== "/about" &&
        pathname !== "/login" &&
        pathname !== "/privacy" &&
        pathname !== "/terms" &&
        pathname !== "/help";

    // Don't render during SSR to prevent hydration issues
    if (!isClient) {
        return null;
    }

    // Safely render title to prevent object-as-child errors
    const renderTitle = () => {
        try {
            if (typeof sideDrawer.title === "function") {
                const titleElement = sideDrawer.title();
                // Handle React elements properly
                if (React.isValidElement(titleElement)) {
                    return titleElement;
                }
                // Handle other types safely
                if (titleElement === null || titleElement === undefined) {
                    return "";
                }
                return String(titleElement);
            }
            return String(sideDrawer.title || "");
        } catch (error) {
            log.warn({ data: error }, "Error rendering sideDrawer title");
            return "Error loading title";
        }
    };

    // Safely render content to prevent object-as-child errors
    const renderContent = () => {
        try {
            if (!sideDrawer.renderContent) {
                return null;
            }
            const content = sideDrawer.renderContent();
            // Handle React elements properly
            if (React.isValidElement(content)) {
                return content;
            }
            // Handle other types
            if (content === null || content === undefined) {
                return null;
            }
            // For strings or numbers, convert safely
            if (typeof content === "string" || typeof content === "number") {
                return content;
            }
            // For other object types, don't render them directly
            log.warn({ data: typeof content, content }, "Invalid content type for sideDrawer");
            return null;
        } catch (error) {
            log.warn({ data: error }, "Error rendering sideDrawer content");
            return <div>Error loading content</div>;
        }
    };

    return (
        <AnimatePresence>
            {sideDrawer.open && isThreadPage && isClient && (
                <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex min-h-[99dvh] w-full max-w-[500px] shrink-0 flex-col overflow-hidden py-1.5 pl-0.5 pr-1.5 md:w-[500px]"
                    exit={{ opacity: 0, x: 40 }}
                    initial={{ opacity: 0, x: 40 }}
                    key="side-drawer"
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        exit: { duration: 0.2 },
                    }}
                >
                    <div className="border-muted/50 bg-background/95 flex h-full w-full flex-col overflow-hidden rounded-xl shadow-lg backdrop-blur-sm">
                        <div className="border-muted/50 bg-muted/20 flex flex-row items-center justify-between gap-3 border-b px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="text-foreground text-sm font-medium">
                                    {renderTitle()}
                                </div>
                                {sideDrawer.badge && (
                                    <Badge
                                        className="border-muted-foreground/20 bg-muted/30 text-muted-foreground"
                                        variant="secondary"
                                    >
                                        {sideDrawer.badge}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                className="hover:bg-muted/40 h-7 w-7 rounded-md"
                                onClick={() => dismissSideDrawer()}
                                size="icon-sm"
                                tooltip="Close"
                                variant="ghost"
                            >
                                <X className="text-muted-foreground" size={14} strokeWidth={2} />
                            </Button>
                        </div>
                        <div
                            className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4"
                            ref={scrollRef}
                        >
                            <div className="w-full space-y-3" ref={contentRef}>
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
