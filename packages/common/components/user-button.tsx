'use client';

import { useLogout } from '@repo/common/hooks';
import { getSessionCacheBustedAvatarUrl } from '@repo/common/utils/avatar-cache';
import { useSession } from '@repo/shared/lib/auth-client';
// import { log } from '@repo/shared/lib/logger';
import { DocsPath } from '@repo/common/constants/docs';
import { useAppStore } from '@repo/common/store';
import { FeatureSlug } from '@repo/shared/types/subscription';
import {
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    UnifiedAvatar,
} from '@repo/ui';
import {
    BookOpen,
    FileText,
    HelpCircle,
    LogOut,
    Palette,
    Settings,
    Shield,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { GatedFeatureAlert } from './gated-feature-alert';
import { ThemeSwitcher } from './theme-switcher';

interface UserButtonProps {
    showName?: boolean;
    appearance?: any; // Keep for compatibility
}

export function UserButton({ showName = false }: UserButtonProps) {
    const { data: session } = useSession();
    const { logout, isLoggingOut } = useLogout();
    const setIsSettingsOpen = useAppStore((state) => state.setIsSettingsOpen);

    if (!session?.user) {
        return null;
    }

    const user = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    className='bg-background flex h-auto items-center gap-2 border p-1 shadow-sm'
                    variant='secondary'
                >
                    <UnifiedAvatar
                        name={user.name || user.email || 'User'}
                        src={getSessionCacheBustedAvatarUrl(user.image)}
                        size='xs'
                        className='h-6 w-6'
                    />
                    {showName && (
                        <span className='text-sm font-medium'>{user.name || user.email}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56 pl-2'>
                {/* User Info Section */}
                <div className='px-2 py-1.5'>
                    <p className='text-sm font-medium'>{user.name || 'User'}</p>
                </div>
                <DropdownMenuSeparator />

                {/* Account Management */}
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <User className='mr-2 h-4 w-4' />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Theme */}
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <div className='flex items-center justify-between px-2 py-1.5'>
                    <div className='flex items-center'>
                        <Palette className='mr-2 h-4 w-4' />
                        <span className='text-sm'>Theme</span>
                    </div>
                    <GatedFeatureAlert
                        message='Dark theme is available to all registered users. Please sign in to access this feature.'
                        requiredFeature={FeatureSlug.DARK_THEME}
                        title='Sign In Required'
                    >
                        <ThemeSwitcher className='scale-75' />
                    </GatedFeatureAlert>
                </div>
                <DropdownMenuSeparator />

                {/* Support & Legal */}
                <DropdownMenuLabel>Support & Legal</DropdownMenuLabel>
                <Link className='w-full' href='/help'>
                    <DropdownMenuItem>
                        <HelpCircle className='mr-2 h-4 w-4' />
                        Help Center
                    </DropdownMenuItem>
                </Link>
                <Link className='w-full' href={DocsPath.Route}>
                    <DropdownMenuItem>
                        <BookOpen className='mr-2 h-4 w-4' />
                        Documentation
                    </DropdownMenuItem>
                </Link>
                <Link className='w-full' href='/terms'>
                    <DropdownMenuItem>
                        <FileText className='mr-2 h-4 w-4' />
                        Terms of Service
                    </DropdownMenuItem>
                </Link>
                <Link className='w-full' href='/privacy'>
                    <DropdownMenuItem>
                        <Shield className='mr-2 h-4 w-4' />
                        Privacy Policy
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />

                {/* Sign Out */}
                <DropdownMenuItem
                    className={isLoggingOut ? 'cursor-not-allowed opacity-50' : ''}
                    disabled={isLoggingOut}
                    onClick={() => logout()}
                >
                    <LogOut className='mr-2 h-4 w-4' />
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
