import { beforeEach, describe, expect, it, vi } from 'vitest';

// Set up environment variables before any imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock the database and drizzle-orm
vi.mock('@/lib/database', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    and: vi.fn(),
}));

// Import after mocking
import { ModelEnum } from '@repo/ai/models';

// Import the functions we want to test
import {
    checkRateLimit,
    checkDualQuotaLimits,
    recordRequest,
    recordDualQuotaUsage,
    getRateLimitStatus,
} from '@/lib/services/rate-limit';

describe('Dual Quota Logic for VT+ Users', () => {
    const vtPlusUserId = 'vt-plus-user-123';
    const freeUserId = 'free-user-456';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Flash Lite Unlimited Access for VT+ Users', () => {
        it('should allow unlimited Flash Lite requests for VT+ users', async () => {
            // Mock database to return high usage for Flash Lite
            const mockDb = await import('@/lib/database');
            const mockRecord = {
                id: 'record-123',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '9999', // Very high count
                minuteRequestCount: '999',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                vtPlusUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                true
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });

        it('should NOT allow unlimited Flash Lite requests for free users', async () => {
            const mockDb = await import('@/lib/database');
            const mockRecord = {
                id: 'record-456',
                userId: freeUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '20', // At free user limit
                minuteRequestCount: '0',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                freeUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                false
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });
    });

    describe('Dual Quota Logic for VT+ Users on Pro/Flash Models', () => {
        it('should check both model-specific and Flash Lite quotas for VT+ users on Pro models', async () => {
            const mockDb = await import('@/lib/database');
            
            // Mock records for both Pro and Flash Lite quotas
            const mockProRecord = {
                id: 'record-pro',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '50', // Under Pro limit (1000)
                minuteRequestCount: '10', // Under Pro limit (100)
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockFlashLiteRecord = {
                id: 'record-flash-lite',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '900', // Near Flash Lite VT+ limit (1000)
                minuteRequestCount: '90', // Near Flash Lite VT+ limit (100)
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Mock database to return different records based on model
            (mockDb.db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockImplementation((condition) => ({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockImplementation(async (callback) => {
                                // Simulate returning different records based on the query
                                // This is a simplified mock - in real implementation, we'd check the condition
                                const records = [mockProRecord, mockFlashLiteRecord];
                                return callback(records);
                            }),
                        }),
                    })),
                }),
            }));

            const result = await checkRateLimit(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            // Should be allowed because both quotas are under their limits
            expect(result.allowed).toBe(true);
            // The remaining count should be the minimum of both quotas
            expect(result.remainingDaily).toBeLessThanOrEqual(950); // Pro limit - Pro usage
            expect(result.remainingMinute).toBeLessThanOrEqual(90); // Flash Lite limit - Flash Lite usage
        });

        it('should reject when Flash Lite quota is exceeded even if Pro quota is available', async () => {
            const mockDb = await import('@/lib/database');
            
            const mockProRecord = {
                id: 'record-pro',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '50', // Under Pro limit
                minuteRequestCount: '10',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockFlashLiteRecord = {
                id: 'record-flash-lite',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '1000', // At Flash Lite VT+ limit
                minuteRequestCount: '50',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockProRecord, mockFlashLiteRecord]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });
    });

    describe('Dual Quota Recording for VT+ Users', () => {
        it('should record usage in both model-specific and Flash Lite quotas for VT+ users', async () => {
            const mockDb = await import('@/lib/database');
            
            // Mock the database operations
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            const mockInsert = vi.fn().mockReturnValue({
                values: vi.fn().mockReturnValue({
                    then: vi.fn().mockResolvedValue(undefined),
                }),
            });

            const mockUpdate = vi.fn().mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue(undefined),
                    }),
                }),
            });

            (mockDb.db.select as any).mockImplementation(mockSelect);
            (mockDb.db.insert as any).mockImplementation(mockInsert);
            (mockDb.db.update as any).mockImplementation(mockUpdate);

            await recordRequest(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            // Should be called for both Pro and Flash Lite models
            expect(mockSelect).toHaveBeenCalledTimes(2);
        });

        it('should NOT record dual quota for free users', async () => {
            const mockDb = await import('@/lib/database');
            
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            (mockDb.db.select as any).mockImplementation(mockSelect);

            await recordRequest(freeUserId, ModelEnum.GEMINI_2_5_PRO, false);

            // Should only be called once for the Pro model, not for Flash Lite
            expect(mockSelect).toHaveBeenCalledTimes(1);
        });

        it('should NOT record dual quota for Flash Lite requests by VT+ users', async () => {
            const mockDb = await import('@/lib/database');
            
            const mockSelect = vi.fn().mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            (mockDb.db.select as any).mockImplementation(mockSelect);

            await recordRequest(vtPlusUserId, ModelEnum.GEMINI_2_5_FLASH_LITE, true);

            // Should only be called once for Flash Lite, not dual quota
            expect(mockSelect).toHaveBeenCalledTimes(1);
        });
    });

    describe('getRateLimitStatus with Dual Quota Display', () => {
        it('should show dual quota status for VT+ users on Pro models', async () => {
            const mockDb = await import('@/lib/database');
            
            const mockProRecord = {
                id: 'record-pro',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '100',
                minuteRequestCount: '20',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const mockFlashLiteRecord = {
                id: 'record-flash-lite',
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '800',
                minuteRequestCount: '60',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockProRecord, mockFlashLiteRecord]),
                        }),
                    }),
                }),
            }));

            const status = await getRateLimitStatus(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            // Should show the effective limits (minimum of both quotas)
            expect(status.remainingDaily).toBe(Math.min(900, 200)); // min(1000-100, 1000-800)
            expect(status.remainingMinute).toBe(Math.min(80, 40)); // min(100-20, 100-60)
        });
    });
});
