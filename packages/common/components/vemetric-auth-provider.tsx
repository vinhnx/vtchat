'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { type ReactNode, useEffect } from 'react';
import { useVemetric } from '../hooks/use-vemetric';

interface VemetricAuthProviderProps {
    children: ReactNode;
}

/**
 * Provider that automatically handles Vemetric user identification
 * when user authentication state changes
 */
export function VemetricAuthProvider({ children }: VemetricAuthProviderProps) {
    const { data: session } = useSession();
    const { identifyUser, signOutUser, updateUser, isEnabled, currentUser } = useVemetric({
        debug: process.env.NODE_ENV === 'development',
    });

    // Handle user identification on sign in
    useEffect(() => {
        if (!isEnabled) return;

        if (session?.user && !currentUser) {
            const vemetricUser = {
                identifier: session.user.id,
                displayName: session.user.name || session.user.email?.split('@')[0] || 'User',
                subscriptionTier: (session.user as any)?.subscriptionTier || 'VT_BASE',
                allowCookies: true, // Assuming consent for authenticated users
                data: {
                    accountAge: session.user.createdAt
                        ? Math.floor(
                              (Date.now() - new Date(session.user.createdAt).getTime()) /
                                  (1000 * 60 * 60 * 24)
                          )
                        : undefined,
                    authProvider: (session.user as any)?.accounts?.[0]?.providerId || 'unknown',
                },
            };

            identifyUser(vemetricUser).catch((error) => {
                log.error(
                    { error, userId: session.user.id },
                    'Failed to identify user in Vemetric'
                );
            });
        }
    }, [session?.user, identifyUser, isEnabled, currentUser]);

    // Handle user sign out
    useEffect(() => {
        if (!isEnabled) return;

        if (!session?.user && currentUser) {
            signOutUser().catch((error) => {
                log.error({ error }, 'Failed to sign out user in Vemetric');
            });
        }
    }, [session?.user, signOutUser, isEnabled, currentUser]);

    // Update user properties when session changes
    useEffect(() => {
        if (!(isEnabled && session?.user && currentUser)) return;

        const updatedProperties = {
            subscriptionTier: (session.user as any)?.subscriptionTier || 'VT_BASE',
            lastActiveDate: new Date().toISOString().split('T')[0],
        };

        updateUser(updatedProperties).catch((error) => {
            log.error({ error, userId: session.user.id }, 'Failed to update user properties');
        });
    }, [session?.user?.updatedAt, updateUser, isEnabled, session?.user, currentUser]);

    return <>{children}</>;
}
