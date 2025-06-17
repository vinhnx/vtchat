'use client';

import { useLogout } from '@repo/common/hooks';
import { useSession } from '@repo/shared/lib/auth-client';
import {
    Avatar,
    Button,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@repo/ui';
import { FileText, LogOut, Shield, User } from 'lucide-react';
import Link from 'next/link';

interface UserButtonProps {
    showName?: boolean;
    appearance?: any; // Keep for compatibility
}

export function UserButton({ showName = false }: UserButtonProps) {
    const { data: session } = useSession();
    const { logout } = useLogout();

    if (!session?.user) return null;

    const user = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex h-auto items-center gap-2 p-1">
                    {user.image ? (
                        <img
                            src={user.image}
                            width={24}
                            height={24}
                            className="rounded-full"
                            alt=""
                        />
                    ) : (
                        <Avatar name={user.name || user.email} size="sm" />
                    )}
                    {showName && (
                        <span className="text-sm font-medium">{user.name || user.email}</span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.name || 'User'}</p>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href="/terms" className="w-full">
                    <DropdownMenuItem>
                        <FileText className="mr-2 h-4 w-4" />
                        Terms of Service
                    </DropdownMenuItem>
                </Link>
                <Link href="/privacy" className="w-full">
                    <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Privacy Policy
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
