'use client';

import { useRootContext } from '@repo/common/context';
import { useAdmin, useLogout } from '@repo/common/hooks';
import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    AvatarLegacy as Avatar,
    Button,
    cn,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { type FC, useEffect } from 'react';

interface MobileTopNavigationProps {
    className?: string;
}

export const MobileTopNavigation: FC<MobileTopNavigationProps> = ({ className }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const { isAdmin } = useAdmin();
    const { logout, isLoggingOut } = useLogout();
    const { isMobileSidebarOpen, setIsMobileSidebarOpen, isClient } = useRootContext();

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

    // Don't render during SSR to prevent hydration issues
    if (!isClient) {
        return null;
    }

    // Determine if we're on a page that needs special handling
    const isChatPage = pathname.startsWith('/chat/');

    return (
        <motion.div
            className={cn(
                'fixed top-0 left-0 right-0 z-[9999] md:hidden',
                'bg-background/95 backdrop-blur-sm border-b border-border',
                // Adjust height based on page type and screen size
                isChatPage
                    ? 'h-14 sm:h-14' // Consistent height for chat pages
                    : 'h-16 sm:h-15', // Slightly smaller on small screens
                className,
            )}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
                paddingTop: 'max(env(safe-area-inset-top), 0.5rem)',
            }}
        >
            <div className='flex items-center justify-between h-full px-4'>
                {/* Left side - Logo/Brand */}
                <div className='flex items-center gap-2 sm:gap-3'>
                    <motion.div
                        className='flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary text-primary-foreground'
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className='text-base sm:text-lg font-bold'>V</span>
                    </motion.div>
                    <div className='flex flex-col min-w-0'>
                        <h1 className='text-xs sm:text-sm font-semibold truncate'>VT Chat</h1>
                        {!isChatPage && (
                            <p className='text-xs text-muted-foreground truncate hidden sm:block'>
                                AI-powered chat
                            </p>
                        )}
                    </div>
                </div>

                {/* Right side - Navigation buttons */}
                <div className='flex items-center gap-1 sm:gap-2'>
                    {/* Profile Button */}
                    {session && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.93 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.125, ease: 'easeOut', delay: 0.1 }}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className='bg-primary text-primary-foreground rounded-full border-0 p-0 shadow-sm transition-shadow hover:shadow-md h-7 w-7 sm:h-8 sm:w-8'
                                        size='icon'
                                        variant='default'
                                    >
                                        <Avatar
                                            className='h-5 w-5 sm:h-6 sm:w-6 rounded-full'
                                            name={session.user?.name || session.user?.email
                                                || 'User'}
                                            size='sm'
                                            src={getSessionCacheBustedAvatarUrl(session.user?.image)
                                                || undefined}
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end' className='z-[200] w-48 sm:w-56'>
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
                        initial={{ opacity: 0, scale: 0.93 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.125, ease: 'easeOut', delay: session ? 0.2 : 0.1 }}
                    >
                        <Button
                            className='bg-primary text-primary-foreground rounded-full shadow-sm transition-shadow hover:shadow-md h-7 w-7 sm:h-8 sm:w-8'
                            onClick={() => setIsMobileSidebarOpen(true)}
                            size='icon'
                            variant='default'
                        >
                            <Menu size={16} strokeWidth={2} />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};
