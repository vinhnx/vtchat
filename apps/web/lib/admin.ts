import { eq } from 'drizzle-orm';
import { auth } from './auth-server';
import { db } from './database';
import { users } from './database/schema';

export async function isUserAdmin(userId?: string): Promise<boolean> {
    if (!userId) return false;

    try {
        // Check if user is in the configured admin user IDs (supports comma-separated values)
        const adminUserIds = (process.env.ADMIN_USER_IDS || process.env.ADMIN_USER_ID || '')
            .split(',')
            .filter(Boolean);
        if (adminUserIds.includes(userId)) {
            return true;
        }

        // Check if user has admin role in database
        const user = await db
            .select({ role: users.role, banned: users.banned })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        // User must have admin role and not be banned
        return user[0]?.role === 'admin' && !user[0]?.banned;
    } catch (error) {
        console.error('Admin check error:', error);
        // Handle error silently - user is not admin
        return false;
    }
}

// Alias for backward compatibility
export const isAdmin = isUserAdmin;

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
