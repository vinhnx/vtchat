/**
 * Test for the batch subscription fetch bug fix
 */

import { describe, expect, it, vi } from 'vitest';

// Mock the database module
vi.mock('@/lib/database', () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
    },
}));

// Mock redis cache
vi.mock('@/lib/cache/redis-cache', () => ({
    redisCache: {
        mget: vi.fn(),
        setSubscription: vi.fn(),
    },
}));

// Mock other dependencies
vi.mock('@repo/shared/lib/logger', () => ({
    log: {
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

vi.mock('@repo/shared/utils/subscription-grace-period', () => ({
    hasSubscriptionAccess: vi.fn(() => true),
}));

describe('Batch Subscription Fix', () => {
    it('should handle multiple user IDs in batch query correctly', async () => {
        const { getSubscriptionsBatch } = await import(
            '@/lib/subscription/fast-subscription-access'
        );
        const { db } = await import('@/lib/database');
        const { redisCache } = await import('@/lib/cache/redis-cache');

        // Mock Redis cache miss for all users
        vi.mocked(redisCache.mget).mockResolvedValue([null, null, null]);

        // Mock database result with multiple users
        const mockDbResults = [
            {
                userId: 'user1',
                planSlug: 'vt-plus',
                subPlan: 'vt-plus',
                status: 'active',
                currentPeriodEnd: new Date('2025-08-01'),
                creemSubscriptionId: 'sub_1',
            },
            {
                userId: 'user2',
                planSlug: 'free',
                subPlan: null,
                status: null,
                currentPeriodEnd: null,
                creemSubscriptionId: null,
            },
            {
                userId: 'user3',
                planSlug: 'vt-plus',
                subPlan: 'vt-plus',
                status: 'active',
                currentPeriodEnd: new Date('2025-09-01'),
                creemSubscriptionId: 'sub_3',
            },
        ];

        // Chain the mocked methods to return the mock data
        const _selectMock = vi.fn().mockReturnValue(mockDbResults);

        vi.mocked(db.select).mockReturnValue({
            from: vi.fn().mockReturnValue({
                leftJoin: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        orderBy: vi.fn().mockReturnValue(mockDbResults),
                    }),
                }),
            }),
        });

        const userIds = ['user1', 'user2', 'user3'];
        const results = await getSubscriptionsBatch(userIds);

        // Verify all users are processed
        expect(results.size).toBe(3);
        expect(results.has('user1')).toBe(true);
        expect(results.has('user2')).toBe(true);
        expect(results.has('user3')).toBe(true);

        // Verify user1 has VT+ access
        const user1Data = results.get('user1');
        expect(user1Data?.isVtPlus).toBe(true);
        expect(user1Data?.planSlug).toBe('vt-plus');

        // Verify user2 is free tier
        const user2Data = results.get('user2');
        expect(user2Data?.isVtPlus).toBe(false);
        expect(user2Data?.planSlug).toBe('free');

        // Verify user3 has VT+ access
        const user3Data = results.get('user3');
        expect(user3Data?.isVtPlus).toBe(true);
        expect(user3Data?.planSlug).toBe('vt-plus');
    });
});
