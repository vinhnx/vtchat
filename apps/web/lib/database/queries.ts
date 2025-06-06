import { eq } from 'drizzle-orm';
import { db } from './index';
import { users, userSubscriptions } from './schema';
import type { User, UserSubscription } from './schema';

export async function getUserWithSubscription(userId: string) {
  const user = await db
    .select()
    .from(users)
    .leftJoin(userSubscriptions, eq(users.id, userSubscriptions.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return user[0] || null;
}

export async function createUserSubscription(userId: string, subscription: Partial<UserSubscription>) {
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

export async function getUserCredits(userId: string) {
  const subscription = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))
    .limit(1);

  if (!subscription[0]) {
    // Create default subscription if none exists
    return await createUserSubscription(userId, {
      plan: 'free',
      status: 'active',
      creditsRemaining: 50,
      creditsUsed: 0,
      monthlyCredits: 50,
    });
  }

  return subscription[0];
}

export async function useCredits(userId: string, amount: number) {
  const subscription = await getUserCredits(userId);
  
  if (subscription.creditsRemaining < amount) {
    throw new Error('Insufficient credits');
  }

  return await updateUserSubscription(userId, {
    creditsRemaining: subscription.creditsRemaining - amount,
    creditsUsed: subscription.creditsUsed + amount,
  });
}
