'use client';
import { CommandSearch, SettingsModal, Sidebar } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    Avatar,
    Badge,
    Button,
    Flex,
    SonnerToaster,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, User, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { FC } from 'react';
import { useStickToBottom } from 'use-stick-to-bottom';
import { Drawer } from 'vaul';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen, isClient } =
        useRootContext();
    const pathname = usePathname();
    const { data: session } = useSession();
    const setIsSettingsOpen = useAppStore(state => state.setIsSettingsOpen);
    const router = useRouter();

    const containerClass =
        'relative flex flex-1 flex-row h-[calc(99dvh)] border border-border rounded-sm bg-secondary w-full overflow-hidden shadow-sm';

    // Hide drop shadow on plus page
    const shouldShowDropShadow = pathname !== '/plus';

    // Render consistent structure during SSR and client hydration
    // Only show complex interactive elements after client is ready
    if (!isClient) {
        return (
            <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
                {/* Simplified structure during SSR to match client structure */}
                <div className="bg-tertiary item-center fixed inset-0 z-[99999] flex justify-center md:hidden">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <span className="text-muted-foreground text-center text-sm">
                            Loading...
                        </span>
                    </div>
                </div>
                <div className="hidden lg:flex">
                    {/* Placeholder for sidebar during SSR */}
                    {isSidebarOpen && (
                        <div className="w-64 flex-shrink-0">{/* Empty sidebar placeholder */}</div>
                    )}
                </div>
                <div className={containerClass}>
                    <div className="flex w-full flex-col gap-2 overflow-y-auto p-4">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden">
            <Flex className="hidden md:flex">
                <AnimatePresence>{isSidebarOpen && <Sidebar />}</AnimatePresence>
            </Flex>

            <Drawer.Root
                open={isMobileSidebarOpen}
                direction="left"
                shouldScaleBackground
                onOpenChange={setIsMobileSidebarOpen}
            >
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-30 backdrop-blur-sm" />
                    <Drawer.Content className="bg-tertiary fixed bottom-0 left-0 top-0 z-[50] w-[280px]">
                        <Drawer.Title className="sr-only">Navigation Menu</Drawer.Title>
                        <div className="h-full">
                            <Sidebar forceMobile={true} />
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>

            {/* Main Content */}
            <Flex className="flex-1 overflow-hidden">
                <motion.div className="flex w-full md:py-1 md:pr-1">
                    <AgentProvider>
                        <div className={containerClass}>
                            {/* Mobile Header */}
                            <div className="bg-secondary border-border absolute left-0 right-0 top-0 z-50 border-b p-3 md:hidden">
                                <div className="flex items-center justify-between">
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        onClick={() => setIsMobileSidebarOpen(true)}
                                        className="text-foreground"
                                    >
                                        <Menu size={20} strokeWidth={2} />
                                    </Button>
                                    <div className="text-foreground text-lg font-bold">VT</div>
                                    <div className="w-8" /> {/* Spacer for centering */}
                                </div>
                            </div>

                            <div className="relative flex h-full w-0 flex-1 flex-row">
                                <div className="flex w-full flex-col gap-2 overflow-y-auto pt-16 md:pt-0">
                                    {shouldShowDropShadow && (
                                        <div className="from-secondary to-secondary/0 via-secondary/70 absolute left-0 right-0 top-0 z-40 flex hidden flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12 md:block"></div>
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

            <SonnerToaster />

            {/* Mobile Floating User Button */}
            {isClient && session && (
                <div className="fixed bottom-4 right-4 z-50 md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="default"
                                size="icon"
                                className="bg-primary h-12 w-12 rounded-full p-1 shadow-lg transition-shadow hover:shadow-xl"
                            >
                                <Avatar
                                    name={session.user?.name || session.user?.email || 'User'}
                                    src={session.user?.image || undefined}
                                    size="md"
                                    className="h-8 w-8"
                                />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="mb-2 w-48">
                            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                                <Settings size={16} strokeWidth={2} className="mr-2" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/profile')}>
                                <User size={16} strokeWidth={2} className="mr-2" />
                                Profile
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </div>
    );
};

export const SideDrawer = () => {
    const pathname = usePathname();
    const sideDrawer = useAppStore(state => state.sideDrawer);
    const dismissSideDrawer = useAppStore(state => state.dismissSideDrawer);
    const { isClient } = useRootContext();
    const { scrollRef, contentRef } = useStickToBottom({
        stiffness: 1,
        damping: 0,
    });
    const isThreadPage = pathname.startsWith('/chat/');

    // Don't render during SSR to prevent hydration issues
    if (!isClient) {
        return null;
    }

    // Safely render title to prevent object-as-child errors
    const renderTitle = () => {
        try {
            if (typeof sideDrawer.title === 'function') {
                const titleElement = sideDrawer.title();
                // Handle React elements properly
                if (React.isValidElement(titleElement)) {
                    return titleElement;
                }
                // Handle other types safely
                if (titleElement === null || titleElement === undefined) {
                    return '';
                }
                return String(titleElement);
            }
            return String(sideDrawer.title || '');
        } catch (error) {
            console.warn('Error rendering sideDrawer title:', error);
            return 'Error loading title';
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
            if (typeof content === 'string' || typeof content === 'number') {
                return content;
            }
            // For other object types, don't render them directly
            console.warn('Invalid content type for sideDrawer:', typeof content, content);
            return null;
        } catch (error) {
            console.warn('Error rendering sideDrawer content:', error);
            return <div>Error loading content</div>;
        }
    };

    return (
        <AnimatePresence>
            {sideDrawer.open && isThreadPage && isClient && (
                <motion.div
                    key="side-drawer"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 30,
                        exit: { duration: 0.2 },
                    }}
                    className="flex min-h-[99dvh] w-full max-w-[500px] shrink-0 flex-col overflow-hidden py-1.5 pl-0.5 pr-1.5 md:w-[500px]"
                >
                    <div className="bg-background/95 backdrop-blur-sm border-muted/50 shadow-lg flex h-full w-full flex-col overflow-hidden rounded-xl">
                        <div className="border-muted/50 flex flex-row items-center justify-between gap-3 border-b px-4 py-3 bg-muted/20">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-medium text-foreground">{renderTitle()}</div>
                                {sideDrawer.badge && (
                                    <Badge variant="secondary" className="bg-muted/30 text-muted-foreground border-muted-foreground/20">
                                        {sideDrawer.badge}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => dismissSideDrawer()}
                                tooltip="Close"
                                className="hover:bg-muted/40 h-7 w-7 rounded-md"
                            >
                                <X size={14} strokeWidth={2} className="text-muted-foreground" />
                            </Button>
                        </div>
                        <div
                            className="no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4"
                            ref={scrollRef}
                        >
                            <div ref={contentRef} className="w-full space-y-3">
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

        </AnimatePresence>
    );
};
