'use server';

import { createSandbox, executeCodeInSandbox, releaseSandbox } from '@repo/ai/tools/e2b-sandbox';
import { auth } from '@/lib/auth-server';
import { headers } from 'next/headers';
import { db } from '@/lib/database';
import { sandboxUsage, users } from '@/lib/database/schema';
import { PlanSlug } from '@repo/shared/types/subscription';
import { and, eq, gte } from 'drizzle-orm';

const isDev = process.env.NODE_ENV !== 'production';
const DAILY_LIMIT = isDev ? Number.MAX_SAFE_INTEGER : 2;

export async function getRemainingExecutions() {
    const hdrs = await headers();
    const session = (await auth.api.getSession({ headers: hdrs })) as any;

    if (!session) return 0;

    // Dev: unlimited
    if (isDev) return DAILY_LIMIT;

    // Check plan from DB to avoid stale/missing planSlug on session
    const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
    const isPlus = user?.planSlug === PlanSlug.VT_PLUS;
    if (!isPlus) return 0;

    // Unlimited in dev for testing
    if (isDev) {
        return DAILY_LIMIT;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const executions = await db.select().from(sandboxUsage).where(
        and(
            eq(sandboxUsage.userId, session.user.id),
            gte(sandboxUsage.createdAt, today)
        )
    );

    return DAILY_LIMIT - executions.length;
}

export async function executeCode(code: string, lang: string) {
    const hdrs = await headers();
    const session = (await auth.api.getSession({ headers: hdrs })) as any;

    if (!session) {
        return { error: 'Unauthorized' };
    }

    // Dev: bypass gating
    if (!isDev) {
        const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
        const isPlus = user?.planSlug === PlanSlug.VT_PLUS;
        if (!isPlus) {
            return { error: 'This feature is only available to VT+ users.' };
        }
    }

    // In development, do not enforce daily execution limit
    if (!isDev) {
        const remainingExecutions = await getRemainingExecutions();
        if (remainingExecutions <= 0) {
            return { error: 'You have reached your daily limit of 2 sandbox executions.' };
        }
    }

    const sandbox = await createSandbox();

    try {
        const { stdout, stderr } = await executeCodeInSandbox(sandbox, code);
        await db.insert(sandboxUsage).values({
            userId: session.user.id,
            sandboxId: (sandbox as any).id ?? null,
            success: true,
            language: lang,
        });
        return { stdout, stderr };
    } catch (error) {
        const err = error as any;
        await db.insert(sandboxUsage).values({
            userId: session.user.id,
            sandboxId: (sandbox as any).id ?? null,
            success: false,
            language: lang,
            errorMessage: err?.message || "Unknown error",
        });
        return { error: err?.message || "Unknown error" };
    } finally {
        await releaseSandbox(sandbox);
    }
}
