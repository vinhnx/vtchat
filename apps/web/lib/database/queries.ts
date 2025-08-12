import { eq } from 'drizzle-orm';
import { db } from './index';
import type { UserSubscription } from './schema';
import { users, userSubscriptions } from './schema';

export async function getUserWithSubscription(userId: string) {
    const user = await db
        .select()
        .from(users)
        .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
        .where(eq(users.id, userId))
        .limit(1);

    return user[0] || null;
}

export async function createUserSubscription(
    userId: string,
    subscription: Partial<UserSubscription>,
) {
    const newSubscription = await db
        .insert(userSubscriptions)
        .values({
            id: crypto.randomUUID(),
            userId,
            ...subscription,
        })
        .returning();

    return newSubscription[0];
}

export async function updateUserSubscription(userId: string, updates: Partial<UserSubscription>) {
    const updated = await db
        .update(userSubscriptions)
        .set(updates)
        .where(eq(userSubscriptions.userId, userId))
        .returning();

    return updated[0];
}
