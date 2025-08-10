'use server';

import { createSandbox, executeCodeInSandbox, releaseSandbox } from '@repo/ai/tools/e2b-sandbox';
import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { sandboxUsage } from '@/lib/database/schema';
import { PlanSlug } from '@repo/shared/types/subscription';
import { and, eq, gte } from 'drizzle-orm';

const DAILY_LIMIT = 2;

export async function getRemainingExecutions() {
    const session = await auth.getSession();

    if (!session || session.user.planSlug !== PlanSlug.VT_PLUS) {
        return 0;
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
    const session = await auth.getSession();

    if (!session) {
        return { error: 'Unauthorized' };
    }

    if (session.user.planSlug !== PlanSlug.VT_PLUS) {
        return { error: 'This feature is only available to VT+ users.' };
    }

    const remainingExecutions = await getRemainingExecutions();

    if (remainingExecutions <= 0) {
        return { error: 'You have reached your daily limit of 2 sandbox executions.' };
    }

    const sandbox = await createSandbox();

    try {
        const { stdout, stderr } = await executeCodeInSandbox(sandbox, code);
        await db.insert(sandboxUsage).values({
            userId: session.user.id,
            sandboxId: sandbox.id,
            success: true,
            language: lang,
        });
        return { stdout, stderr };
    } catch (error) {
        await db.insert(sandboxUsage).values({
            userId: session.user.id,
            sandboxId: sandbox.id,
            success: false,
            language: lang,
            errorMessage: error.message,
        });
        return { error: error.message };
    } finally {
        await releaseSandbox(sandbox);
    }
}
