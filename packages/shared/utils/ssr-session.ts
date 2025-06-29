/**
 * SSR session utilities for server-side rendering optimization
 */

import type { Session } from '@repo/shared/lib/auth-client';
import { headers } from 'next/headers';
import { logger } from '@repo/shared/logger';

// For server-side components only
export async function getServerSession(): Promise<Session | null> {
    if (typeof window !== 'undefined') {
        throw new Error('getServerSession should only be called on the server');
    }

    try {
        // Dynamic import to avoid bundling server code on client
        const { auth } = await import('../../../apps/web/lib/auth');

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        return session;
    } catch (error) {
        logger.warn('[SSR Session] Failed to get server session:', { data: error });
        return null;
    }
}

// Helper to get session without cookie cache (for fresh data)
export async function getServerSessionFresh(): Promise<Session | null> {
    if (typeof window !== 'undefined') {
        throw new Error('getServerSessionFresh should only be called on the server');
    }

    try {
        const { auth } = await import('../../../apps/web/lib/auth');

        const session = await auth.api.getSession({
            headers: await headers(),
            query: {
                disableCookieCache: true,
            },
        });

        return session;
    } catch (error) {
        logger.warn('[SSR Session] Failed to get fresh server session:', { data: error });
        return null;
    }
}

// Type-safe session prefetch for server components
export async function prefetchSessionForSSR() {
    const session = await getServerSession();

    // Return serializable session data for client hydration
    return session
        ? {
              user: session.user,
              session: session.session,
          }
        : null;
}
