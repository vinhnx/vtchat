import { db, schema } from '@repo/shared/lib/database';
import { log } from '@repo/shared/lib/logger';
import { eq } from 'drizzle-orm';

/**
 * Check if user is admin (centralized admin logic)
 * Used for both quota bypass and admin access control
 */
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
            .select({ role: schema.users.role, banned: schema.users.banned })
            .from(schema.users)
            .where(eq(schema.users.id, userId))
            .limit(1);

        // User must have admin role and not be banned
        return user[0]?.role === 'admin' && !user[0]?.banned;
    } catch (error) {
        log.error({ error, userId }, 'Admin check error');
        // Handle error silently - user is not admin
        return false;
    }
}
