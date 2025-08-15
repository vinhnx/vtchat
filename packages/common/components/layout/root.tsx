'use client';
import { CommandSearch } from '@repo/common/components';
import { useRootContext } from '@repo/common/context';
import { AgentProvider, useAdmin, useLogout, useMobilePWANotification } from '@repo/common/hooks';
import { useAppStore } from '@repo/common/store';
import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/lib/logger';
import {
    AvatarLegacy as Avatar,
    Badge,
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Flex,
    SonnerToaster,
} from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    FileText,
    HelpCircle,
    Info,
    LogOut,
    Menu,
    Settings,
    Shield,
    Terminal,
    User,
    X,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { type FC, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useStickToBottom } from 'use-stick-to-bottom';
import { BasicSidebar } from '../basic-sidebar';

export type TRootLayout = {
    children: React.ReactNode;
};

export const RootLayout: FC<TRootLayout> = ({ children }) => {
    const { isSidebarOpen, isMobileSidebarOpen, setIsMobileSidebarOpen, isClient } =
        useRootContext();
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isAdmin } = useAdmin();

    const sidebarPlacement = useAppStore((state) => state.sidebarPlacement);
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);
    const setSettingTab = useAppStore((state) => state.setSettingTab);
    const router = useRouter();
    const { logout, isLoggingOut } = useLogout();

    // Show mobile PWA installation notification
    useMobilePWANotification();

    const containerClass =
        'relative flex flex-1 flex-row h-[100dvh] border border-border bg-secondary w-full shadow-sm md:rounded-sm md:overflow-hidden';

    // Hide drop shadow on plus page
    const shouldShowDropShadow = pathname !== '/pricing';

    // Close mobile sidebar when route changes
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname, setIsMobileSidebarOpen]);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMobileSidebarOpen]);

    // Render consistent structure during SSR and client hydration
    // Only show complex interactive elements after client is ready
    if (!isClient) {
        return (
            <div className='bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden'>
                {/* Simplified structure during SSR to match client structure */}
                <div className='item-center bg-tertiary fixed inset-0 z-[99999] flex justify-center md:hidden'>
                    <div className='flex flex-col items-center justify-center gap-2'>
                        <span className='text-muted-foreground text-center text-sm'>
                            Loading...
                        </span>
                    </div>
                </div>
                {/* Left sidebar placeholder during SSR - always render container but conditionally show content */}
                {sidebarPlacement === 'left' && (
                    <div className='desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none md:block'>
                        {/* Empty placeholder during SSR */}
                    </div>
                )}

                {/* Main Content */}
                <div className='h-[100dvh] flex-1 overflow-hidden'>
                    <div
                        className={`flex h-full w-full md:py-1 ${
                            sidebarPlacement === 'left' ? 'md:pr-1' : 'md:pl-1'
                        }`}
                    >
                        <div className={containerClass}>
                            <div className='relative flex h-full w-full flex-row'>
                                <div className='flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto'>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right sidebar placeholder during SSR - always render container but conditionally show content */}
                {sidebarPlacement === 'right' && (
                    <div className='desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none md:block'>
                        {/* Empty placeholder during SSR */}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className='bg-tertiary flex h-[100dvh] w-full flex-row overflow-hidden'>
            {/* Fixed Left Sidebar - Only visible when placement is left on desktop */}
            {sidebarPlacement === 'left' && (
                <div className='desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none md:block'>
                    <BasicSidebar />
                </div>
            )}

            {/* Main Content */}
            <Flex className='h-[100dvh] flex-1 overflow-hidden'>
                <motion.div
                    className={`flex h-full w-full md:py-1 ${
                        sidebarPlacement === 'left' ? 'md:pr-1' : 'md:pl-1'
                    }`}
                >
                    <AgentProvider>
                        <div className={containerClass}>
                            <div className='relative flex h-full w-full flex-row'>
                                {/* Main content area - takes remaining space */}
                                <div className='flex min-w-0 flex-1 flex-col gap-2 overflow-y-auto'>
                                    {shouldShowDropShadow && (
                                        <div className='from-secondary via-secondary/70 to-secondary/0 absolute left-0 right-0 top-0 z-40 flex hidden flex-row items-center justify-center gap-1 bg-gradient-to-b p-2 pb-12 md:block' />
                                    )}

                                    {children}
                                </div>

                                {/* Side drawer - positioned as a separate column to prevent overlap */}
                                <SideDrawer />
                            </div>
                        </div>
                    </AgentProvider>
                </motion.div>
                <CommandSearch />
            </Flex>

            {/* Mobile Sidebar Modal Overlay - Rendered via Portal */}
            {typeof window !== 'undefined'
                && createPortal(
                    <AnimatePresence mode='wait' initial={false}>
                        {isMobileSidebarOpen && (
                            <motion.div
                                key='mobile-sidebar-overlay'
                                className='will-change-opacity fixed inset-0 transform-gpu md:hidden'
                                data-framer-motion
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 99999,
                                    transform: 'translate3d(0, 0, 0)',
                                    backfaceVisibility: 'hidden',
                                }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ type: 'tween', duration: 0.12, ease: 'easeOut' }}
                            >
                                {/* Backdrop */}
                                <motion.div
                                    className='will-change-opacity absolute inset-0 transform-gpu bg-black/60'
                                    style={{
                                        transform: 'translate3d(0, 0, 0)',
                                        backfaceVisibility: 'hidden',
                                    }}
                                    onClick={(e) => {
                                        // Check if click target is inside the sidebar content or dropdown
                                        const target = e.target as HTMLElement;
                                        const isInsideSidebar = target.closest(
                                            '[data-sidebar-content]',
                                        );
                                        const isInsideDropdown =
                                            target.closest('[data-radix-popper-content-wrapper]')
                                            || target.closest('[role="menu"]')
                                            || target.closest('[data-radix-menu-content]')
                                            || target.closest('[data-radix-dropdown-menu-content]');

                                        // Only close sidebar if clicking on overlay, not sidebar content or dropdown
                                        if (!(isInsideSidebar || isInsideDropdown)) {
                                            setIsMobileSidebarOpen(false);
                                        }
                                    }}
                                    onTouchEnd={(e) => {
                                        // Handle iOS touch events specifically
                                        const target = e.target as HTMLElement;
                                        const isInsideSidebar = target.closest(
                                            '[data-sidebar-content]',
                                        );
                                        const isInsideDropdown =
                                            target.closest('[data-radix-popper-content-wrapper]')
                                            || target.closest('[role="menu"]')
                                            || target.closest('[data-radix-menu-content]')
                                            || target.closest('[data-radix-dropdown-menu-content]');

                                        // Only close sidebar if touching overlay, not sidebar content or dropdown
                                        if (!(isInsideSidebar || isInsideDropdown)) {
                                            setIsMobileSidebarOpen(false);
                                        }
                                    }}
                                />

                                {/* Sidebar Content */}
                                <motion.div
                                    key='mobile-sidebar-content'
                                    className={`bg-tertiary border-border absolute bottom-0 top-0 w-[300px] max-w-[300px] transform-gpu border-r shadow-2xl will-change-transform ${
                                        sidebarPlacement === 'left' ? 'left-0' : 'right-0'
                                    }`}
                                    data-framer-motion
                                    style={{
                                        transform: 'translate3d(0, 0, 0)',
                                        backfaceVisibility: 'hidden',
                                        zIndex: 100000,
                                        contain: 'layout style paint',
                                    }}
                                    initial={{
                                        x: sidebarPlacement === 'left' ? -300 : 300,
                                        opacity: 0.8,
                                    }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{
                                        x: sidebarPlacement === 'left' ? -300 : 300,
                                        opacity: 0.8,
                                    }}
                                    transition={{
                                        type: 'tween',
                                        duration: 0.18,
                                        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smoother motion
                                    }}
                                    role='dialog'
                                    aria-modal='true'
                                    aria-label='Navigation menu'
                                >
                                    <div
                                        className='h-full transform-gpu overflow-hidden'
                                        style={{ transform: 'translate3d(0, 0, 0)' }}
                                        data-sidebar-content
                                        data-mobile-sidebar
                                    >
                                        <BasicSidebar forceMobile={true} />
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}

            <SonnerToaster />

            {/* Right Sidebar - Only visible when placement is right on desktop */}
            {sidebarPlacement === 'right' && (
                <div className='desktop-sidebar hidden h-[100dvh] w-auto max-w-[300px] flex-none md:block'>
                    <BasicSidebar />
                </div>
            )}

            {/* Mobile Floating Buttons Container */}
            {isClient && (
                <motion.div
                    className={cn(
                        'fixed left-4 flex flex-col gap-4 md:hidden',
                        // Adjust positioning based on page type and navigation presence
                        pathname.startsWith('/chat/')
                            ? 'top-36 gap-3'
                            : pathname.startsWith('/settings')
                                    || pathname.startsWith('/about')
                                    || pathname.startsWith('/help')
                                    || pathname.startsWith('/privacy')
                                    || pathname.startsWith('/terms')
                                    || pathname.startsWith('/profile')
                                    || pathname.startsWith('/admin')
                            ? 'top-20 gap-4' // Pages with navigation headers (80px to clear header + padding)
                            : 'pt-safe top-0 gap-6', // Home and other pages
                        isMobileSidebarOpen ? 'z-[9999]' : 'z-[9998]',
                    )}
                    style={{
                        paddingTop: pathname.startsWith('/chat/')
                            ? '0'
                            : pathname.startsWith('/settings')
                                    || pathname.startsWith('/about')
                                    || pathname.startsWith('/help')
                                    || pathname.startsWith('/privacy')
                                    || pathname.startsWith('/terms')
                                    || pathname.startsWith('/profile')
                                    || pathname.startsWith('/admin')
                            ? 'max(env(safe-area-inset-top), 0.5rem)' // Reduced padding for pages with headers
                            : 'max(env(safe-area-inset-top), 1rem)',
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                >
                    {/* Profile Button */}
                    {session && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 }}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className={cn(
                                            'bg-primary rounded-full border-0 p-0 shadow-lg transition-shadow hover:shadow-xl',
                                            // Smaller size on thread pages
                                            pathname.startsWith('/chat/')
                                                ? 'h-10 w-10'
                                                : 'h-12 w-12',
                                        )}
                                        size='icon'
                                        variant='default'
                                    >
                                        <Avatar
                                            className={cn(
                                                'rounded-full',
                                                // Smaller avatar on thread pages with proper sizing
                                                pathname.startsWith('/chat/')
                                                    ? 'h-8 w-8'
                                                    : 'h-10 w-10',
                                            )}
                                            name={session.user?.name || session.user?.email
                                                || 'User'}
                                            size={pathname.startsWith('/chat/') ? 'sm' : 'md'}
                                            src={getSessionCacheBustedAvatarUrl(
                                                session.user?.image,
                                            ) || undefined}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='start' className='z-[200] mb-2 w-48'>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            router.push('/settings?tab=profile');
                                            setIsMobileSidebarOpen(false);
                                        }}
                                    >
                                        <User className='mr-2' size={16} strokeWidth={2} />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => {
                                            router.push('/settings');
                                            setIsMobileSidebarOpen(false);
                                        }}
                                    >
                                        <Settings className='mr-2' size={16} strokeWidth={2} />
                                        Settings
                                    </DropdownMenuItem>

                                    {/* Admin Menu Item */}
                                    {isAdmin && (
                                        <DropdownMenuItem onClick={() => router.push('/admin')}>
                                            <Terminal className='mr-2' size={16} strokeWidth={2} />
                                            VT Terminal
                                        </DropdownMenuItem>
                                    )}

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/about')}>
                                        <Info className='mr-2' size={16} strokeWidth={2} />
                                        About
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/help')}>
                                        <HelpCircle className='mr-2' size={16} strokeWidth={2} />
                                        Help Center
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/faq')}>
                                        <HelpCircle className='mr-2' size={16} strokeWidth={2} />
                                        FAQ
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/ai-glossary')}>
                                        <FileText className='mr-2' size={16} strokeWidth={2} />
                                        AI Glossary
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/ai-resources')}>
                                        <FileText className='mr-2' size={16} strokeWidth={2} />
                                        AI Resources
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/privacy')}>
                                        <Shield className='mr-2' size={16} strokeWidth={2} />
                                        Privacy Policy
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => router.push('/terms')}>
                                        <FileText className='mr-2' size={16} strokeWidth={2} />
                                        Terms of Service
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className={isLoggingOut
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''}
                                        disabled={isLoggingOut}
                                        onClick={() => logout()}
                                    >
                                        <LogOut className='mr-2' size={16} strokeWidth={2} />
                                        {isLoggingOut ? 'Signing out...' : 'Sign out'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </motion.div>
                    )}

                    {/* Sidebar Menu Button */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: session ? 0.7 : 0.6 }}
                    >
                        <Button
                            className={cn(
                                'bg-primary text-primary-foreground rounded-full shadow-lg transition-shadow hover:shadow-xl',
                                // Smaller size on thread pages
                                pathname.startsWith('/chat/') ? 'h-10 w-10' : 'h-12 w-12',
                            )}
                            onClick={() => setIsMobileSidebarOpen(true)}
                            size='icon'
                            variant='default'
                        >
                            <Menu size={pathname.startsWith('/chat/') ? 18 : 20} strokeWidth={2} />
                        </Button>
                    </motion.div>
                </motion.div>
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
    const isThreadPage = pathname !== '/'
        && pathname !== '/recent'
        && pathname !== '/settings'
        && pathname !== '/pricing'
        && pathname !== '/about'
        && pathname !== '/login'
        && pathname !== '/privacy'
        && pathname !== '/terms'
        && pathname !== '/help';

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
            log.warn({ data: error }, 'Error rendering sideDrawer title');
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
            log.warn({ data: typeof content, content }, 'Invalid content type for sideDrawer');
            return null;
        } catch (error) {
            log.warn({ data: error }, 'Error rendering sideDrawer content');
            return <div>Error loading content</div>;
        }
    };

    return (
        <AnimatePresence mode='wait' initial={false}>
            {sideDrawer.open && isThreadPage && isClient && (
                <motion.div
                    key='side-drawer'
                    className='flex min-h-[99dvh] w-full max-w-[500px] shrink-0 transform-gpu flex-col overflow-hidden py-1.5 pl-0.5 pr-1.5 will-change-transform md:w-[500px]'
                    style={{
                        transform: 'translate3d(0, 0, 0)',
                        backfaceVisibility: 'hidden',
                        contain: 'layout style paint',
                        zIndex: 10, // Ensure proper stacking
                    }}
                    initial={{ opacity: 0, x: 30, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 30, scale: 0.98 }}
                    transition={{
                        type: 'tween',
                        duration: 0.18,
                        ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing curve
                    }}
                >
                    <div className='border-muted/50 bg-background/95 flex h-full w-full flex-col overflow-hidden rounded-xl shadow-lg backdrop-blur-sm'>
                        <div className='border-muted/50 bg-muted/20 flex flex-row items-center justify-between gap-3 border-b px-4 py-3'>
                            <div className='flex items-center gap-2'>
                                <div className='text-foreground text-sm font-medium'>
                                    {renderTitle()}
                                </div>
                                {sideDrawer.badge && (
                                    <Badge
                                        className='border-muted-foreground/20 bg-muted/30 text-muted-foreground'
                                        variant='secondary'
                                    >
                                        {sideDrawer.badge}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                className='hover:bg-muted/40 h-7 w-7 rounded-md'
                                onClick={() => dismissSideDrawer()}
                                size='icon-sm'
                                tooltip='Close'
                                variant='ghost'
                            >
                                <X className='text-muted-foreground' size={14} strokeWidth={2} />
                            </Button>
                        </div>
                        <div
                            className='no-scrollbar flex flex-1 flex-col gap-3 overflow-y-auto p-4'
                            ref={scrollRef}
                        >
                            <div className='w-full space-y-3' ref={contentRef}>
                                {renderContent()}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
