import { log } from '@repo/shared/lib/logger';
import { eq } from 'drizzle-orm';
import { auth } from './auth-server';
import { db } from './database';
import { users } from './database/schema';

// Inline admin check for web app usage
export async function isUserAdmin(userId?: string): Promise<boolean> {
    if (!userId) return false;

    // First check environment admin IDs (fastest)
    const adminUserIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
    if (adminUserIds.includes(userId)) {
        return true;
    }

    // Then check database admin role (fallback)
    try {
        const user = await db
            .select({ role: users.role })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        return user.length > 0 && user[0].role === 'admin';
    } catch (error) {
        log.error({ error, userId }, 'Failed to check admin status');
        return false;
    }
}

export async function getCurrentUserAdminStatus(): Promise<boolean> {
    try {
        const session = await auth.api.getSession({
            headers: new Headers(),
        });

        if (!session?.user?.id) return false;

        return await isUserAdmin(session.user.id);
    } catch {
        return false;
    }
}

// Custom error for admin access requirements
export class AdminAccessRequiredError extends Error {
    constructor(message = 'Admin access required') {
        super(message);
        this.name = 'AdminAccessRequiredError';
    }
}

export async function requireAdmin(): Promise<void> {
    const isAdmin = await getCurrentUserAdminStatus();
    if (!isAdmin) {
        throw new AdminAccessRequiredError('Admin access required');
    }
}

// Utility to promote a user to admin (for initial setup)
export async function promoteUserToAdmin(email: string): Promise<boolean> {
    try {
        const result = await db
            .update(users)
            .set({ role: 'admin' })
            .where(eq(users.email, email))
            .returning({ id: users.id, email: users.email, role: users.role });

        return result.length > 0;
    } catch {
        return false;
    }
}
