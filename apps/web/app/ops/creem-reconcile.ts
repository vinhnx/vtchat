#!/usr/bin/env bun

/**
 * Creem subscription reconciliation (read-only, no refunds)
 *
 * - Flags duplicate creem_subscription_id / creem_customer_id
 * - Flags VT+ plan/status mismatches between users and user_subscriptions
 * - Flags missing period_end on canceled/past_due
 *
 * Usage:
 *   bun apps/web/app/ops/creem-reconcile.ts --days 3
 *
 * Notes:
 * - This script is read-only. It does not refund or mutate data.
 * - Requires DB env vars to be set (same as the app).
 */

import { subDays } from 'date-fns';

import { log } from '@repo/shared/lib/logger';

import { PlanSlug } from '../../../packages/shared/types/subscription';
import { SubscriptionStatusEnum } from '../../../packages/shared/types/subscription-status';
import { db } from '../../lib/database';
import { users, userSubscriptions } from '../../lib/database/schema';

type SubRow = {
    id: string;
    userId: string;
    plan: string | null;
    status: string | null;
    creemSubscriptionId: string | null;
    creemCustomerId: string | null;
    currentPeriodEnd: Date | null;
    updatedAt: Date | null;
    createdAt: Date | null;
};

type UserRow = {
    id: string;
    email: string | null;
    planSlug: string | null;
    creemCustomerId: string | null;
};

interface Report {
    windowDays: number;
    totals: {
        subscriptions: number;
        users: number;
    };
    duplicatesBySubscriptionId: Array<{
        creemSubscriptionId: string;
        count: number;
        userIds: string[];
    }>;
    duplicatesByCustomerId: Array<{
        creemCustomerId: string;
        count: number;
        userIds: string[];
        activeLikeCount: number;
    }>;
    vtPlusMismatches: Array<{
        userId: string;
        userPlanSlug: string | null;
        subscriptionPlan: string | null;
        status: string | null;
    }>;
    missingPeriodEnd: Array<{
        userId: string;
        status: string | null;
        creemSubscriptionId: string | null;
    }>;
}

function parseArgs(): { days: number; } {
    const idx = process.argv.indexOf('--days');
    if (idx !== -1 && process.argv[idx + 1]) {
        const n = Number.parseInt(process.argv[idx + 1], 10);
        if (!Number.isNaN(n) && n > 0) return { days: n };
    }
    return { days: 3 };
}

function isActiveLike(status: string | null): boolean {
    return (
        status === SubscriptionStatusEnum.ACTIVE
        || status === SubscriptionStatusEnum.TRIALING
        || status === SubscriptionStatusEnum.PAST_DUE
    );
}

async function main() {
    const { days } = parseArgs();
    const fromDate = subDays(new Date(), days);

    const subs = (await db
        .select({
            id: userSubscriptions.id,
            userId: userSubscriptions.userId,
            plan: userSubscriptions.plan,
            status: userSubscriptions.status,
            creemSubscriptionId: userSubscriptions.creemSubscriptionId,
            creemCustomerId: userSubscriptions.creemCustomerId,
            currentPeriodEnd: userSubscriptions.currentPeriodEnd,
            updatedAt: userSubscriptions.updatedAt,
            createdAt: userSubscriptions.createdAt,
        })
        .from(userSubscriptions)
        .where(userSubscriptions.updatedAt.gte(fromDate))) as SubRow[];

    const userIds = Array.from(new Set(subs.map((s) => s.userId)));
    const userRows = (await db
        .select({
            id: users.id,
            email: users.email,
            planSlug: users.planSlug,
            creemCustomerId: users.creemCustomerId,
        })
        .from(users)
        .where(users.id.in(userIds))) as UserRow[];

    const userById = new Map(userRows.map((u) => [u.id, u]));

    // Duplicates by subscription_id
    const dupBySubIdMap = new Map<string, SubRow[]>();
    for (const s of subs) {
        if (!s.creemSubscriptionId) continue;
        const arr = dupBySubIdMap.get(s.creemSubscriptionId) || [];
        arr.push(s);
        dupBySubIdMap.set(s.creemSubscriptionId, arr);
    }
    const duplicatesBySubscriptionId = Array.from(dupBySubIdMap.entries())
        .filter(([, arr]) => arr.length > 1)
        .map(([creemSubscriptionId, arr]) => ({
            creemSubscriptionId,
            count: arr.length,
            userIds: Array.from(new Set(arr.map((r) => r.userId))),
        }));

    // Duplicates by customer_id
    const dupByCustIdMap = new Map<string, SubRow[]>();
    for (const s of subs) {
        if (!s.creemCustomerId) continue;
        const arr = dupByCustIdMap.get(s.creemCustomerId) || [];
        arr.push(s);
        dupByCustIdMap.set(s.creemCustomerId, arr);
    }
    const duplicatesByCustomerId = Array.from(dupByCustIdMap.entries())
        .filter(([, arr]) => arr.length > 1)
        .map(([creemCustomerId, arr]) => ({
            creemCustomerId,
            count: arr.length,
            userIds: Array.from(new Set(arr.map((r) => r.userId))),
            activeLikeCount: arr.filter((r) => isActiveLike(r.status)).length,
        }));

    // VT+ mismatches between user plan and subscription
    const vtPlusMismatches: Report['vtPlusMismatches'] = [];
    for (const s of subs) {
        const u = userById.get(s.userId);
        if (!u) continue;
        const userIsVtPlus = u.planSlug === PlanSlug.VT_PLUS;
        const subIsVtPlus = s.plan === PlanSlug.VT_PLUS;
        if (userIsVtPlus !== subIsVtPlus) {
            vtPlusMismatches.push({
                userId: s.userId,
                userPlanSlug: u.planSlug,
                subscriptionPlan: s.plan,
                status: s.status,
            });
        }
    }

    // Missing period_end for canceled/past_due
    const missingPeriodEnd: Report['missingPeriodEnd'] = [];
    for (const s of subs) {
        if (
            (s.status === SubscriptionStatusEnum.CANCELED
                || s.status === SubscriptionStatusEnum.CANCELLED
                || s.status === SubscriptionStatusEnum.PAST_DUE)
            && !s.currentPeriodEnd
        ) {
            missingPeriodEnd.push({
                userId: s.userId,
                status: s.status,
                creemSubscriptionId: s.creemSubscriptionId,
            });
        }
    }

    const report: Report = {
        windowDays: days,
        totals: {
            subscriptions: subs.length,
            users: userById.size,
        },
        duplicatesBySubscriptionId,
        duplicatesByCustomerId,
        vtPlusMismatches,
        missingPeriodEnd,
    };

    log.info({ report }, 'Creem reconciliation report');
}

main().catch((error) => {
    log.error({ error }, 'Reconciliation failed');
    process.exit(1);
});
