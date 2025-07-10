import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModelEnum } from '@repo/ai/models';

// Set environment for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock the database and ORM
const mockRateLimitRecord = {
    id: 'test-record',
    userId: 'test-user',
    modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
    dailyRequestCount: '0',
    minuteRequestCount: '0',
    lastDailyReset: new Date(),
    lastMinuteReset: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockDbOperations = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
};

vi.mock('@/lib/database', () => ({
    db: mockDbOperations,
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(() => 'eq_condition'),
    and: vi.fn(() => 'and_condition'),
}));

// Import after mocking
import {
    checkRateLimit,
    recordRequest,
    getRateLimitStatus,
} from '@/lib/services/rate-limit';

describe('Gemini Requirements Verification Tests', () => {
    const FREE_USER_ID = 'free-user-123';
    const VT_PLUS_USER_ID = 'vt-plus-user-456';

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default mock setup
        mockDbOperations.select.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([]),
                    }),
                }),
            }),
        });

        mockDbOperations.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({
                then: vi.fn().mockResolvedValue(undefined),
            }),
        });

        mockDbOperations.update.mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    then: vi.fn().mockResolvedValue(undefined),
                }),
            }),
        });
    });

    describe('Requirement 1: VT+ Users Have Unlimited Flash Lite Access', () => {
        it('should allow unlimited requests to Flash Lite for VT+ users', async () => {
            // Simulate very high usage that would exceed normal limits
            const highUsageRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '99999',
                minuteRequestCount: '9999',
            };

            mockDbOperations.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([highUsageRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                true
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });

        it('should enforce limits for Flash Lite for free users', async () => {
            const atLimitRecord = {
                ...mockRateLimitRecord,
                userId: FREE_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '20', // At free user daily limit
                minuteRequestCount: '0',
            };

            mockDbOperations.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([atLimitRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                FREE_USER_ID,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                false
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });
    });

    describe('Requirement 2: Dual Quota System for VT+ Users on Pro/Flash Models', () => {
        it('should check both model-specific and Flash Lite quotas for VT+ Pro requests', async () => {
            // Mock records for both Pro and Flash Lite
            const proRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '100', // Under Pro limit (1000)
                minuteRequestCount: '10',
            };

            const flashLiteRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '500', // Under Flash Lite VT+ limit (1000)
                minuteRequestCount: '50',
            };

            // Mock to return different records based on query order
            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proRecord : flashLiteRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            expect(result.allowed).toBe(true);
            // Remaining should be minimum of both quotas
            expect(result.remainingDaily).toBeLessThanOrEqual(900); // min(1000-100, 1000-500)
            expect(result.remainingMinute).toBeLessThanOrEqual(90); // min(100-10, 100-50)
        });

        it('should reject when Flash Lite quota is exhausted even if Pro quota is available', async () => {
            const proRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '50', // Well under Pro limit
                minuteRequestCount: '5',
            };

            const flashLiteAtLimitRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '1000', // At Flash Lite VT+ limit
                minuteRequestCount: '50',
            };

            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proRecord : flashLiteAtLimitRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });

        it('should reject when Pro quota is exhausted even if Flash Lite quota is available', async () => {
            const proAtLimitRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '1000', // At Pro VT+ limit
                minuteRequestCount: '50',
            };

            const flashLiteRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '100', // Well under Flash Lite limit
                minuteRequestCount: '10',
            };

            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proAtLimitRecord : flashLiteRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });
    });

    describe('Requirement 3: Free Users Follow Standard Limits', () => {
        it('should enforce standard limits for free users on Pro models', async () => {
            const freeUserRecord = {
                ...mockRateLimitRecord,
                userId: FREE_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '5', // Under free limit (10)
                minuteRequestCount: '0',
            };

            mockDbOperations.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([freeUserRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                FREE_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                false
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(5); // 10 - 5
        });

        it('should reject free users when they exceed Pro model limits', async () => {
            const freeUserAtLimitRecord = {
                ...mockRateLimitRecord,
                userId: FREE_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '10', // At free limit
                minuteRequestCount: '0',
            };

            mockDbOperations.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([freeUserAtLimitRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(
                FREE_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                false
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('daily_limit_exceeded');
        });
    });

    describe('Requirement 4: Non-Gemini Models Are Unlimited', () => {
        it('should allow unlimited access to non-Gemini models for all users', async () => {
            const freeResult = await checkRateLimit(
                FREE_USER_ID,
                ModelEnum.GPT_4o,
                false
            );

            const vtPlusResult = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GPT_4o,
                true
            );

            expect(freeResult.allowed).toBe(true);
            expect(freeResult.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(vtPlusResult.allowed).toBe(true);
            expect(vtPlusResult.remainingDaily).toBe(Number.POSITIVE_INFINITY);
        });
    });

    describe('Requirement 5: Dual Usage Recording for VT+ Users', () => {
        it('should record usage in both quotas when VT+ user uses Pro model', async () => {
            await recordRequest(VT_PLUS_USER_ID, ModelEnum.GEMINI_2_5_PRO, true);

            // Should be called multiple times - once for Pro, once for Flash Lite
            expect(mockDbOperations.select).toHaveBeenCalledTimes(2);
        });

        it('should NOT record dual usage for free users', async () => {
            await recordRequest(FREE_USER_ID, ModelEnum.GEMINI_2_5_PRO, false);

            // Should only be called once for the Pro model
            expect(mockDbOperations.select).toHaveBeenCalledTimes(1);
        });

        it('should NOT record dual usage for VT+ Flash Lite requests', async () => {
            await recordRequest(VT_PLUS_USER_ID, ModelEnum.GEMINI_2_5_FLASH_LITE, true);

            // Should only be called once for Flash Lite (since it's unlimited, may not record at all)
            expect(mockDbOperations.select).toHaveBeenCalledTimes(1);
        });

        it('should NOT record usage for non-Gemini models', async () => {
            await recordRequest(VT_PLUS_USER_ID, ModelEnum.GPT_4o, true);
            await recordRequest(FREE_USER_ID, ModelEnum.GPT_4o, false);

            // Should not be called at all for non-Gemini models
            expect(mockDbOperations.select).not.toHaveBeenCalled();
        });
    });

    describe('Requirement 6: Rate Limit Status Reporting', () => {
        it('should report dual quota status for VT+ users on Pro models', async () => {
            const proRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '200',
                minuteRequestCount: '20',
            };

            const flashLiteRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '300',
                minuteRequestCount: '30',
            };

            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proRecord : flashLiteRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const status = await getRateLimitStatus(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            // Should show effective limits (minimum of both quotas)
            expect(status.remainingDaily).toBe(Math.min(800, 700)); // min(1000-200, 1000-300)
            expect(status.remainingMinute).toBe(Math.min(80, 70)); // min(100-20, 100-30)
        });

        it('should report unlimited status for VT+ Flash Lite', async () => {
            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                true
            );

            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });
    });

    describe('Requirement 7: Minute-Level Rate Limiting', () => {
        it('should enforce minute limits for VT+ users with dual quota', async () => {
            const proRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '100',
                minuteRequestCount: '95', // Near Pro minute limit (100)
            };

            const flashLiteRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '200',
                minuteRequestCount: '98', // Near Flash Lite minute limit (100)
            };

            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proRecord : flashLiteRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingMinute).toBe(2); // min(100-95, 100-98)
        });

        it('should reject when minute limit is exceeded in either quota', async () => {
            const proRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: '100',
                minuteRequestCount: '50', // Under Pro minute limit
            };

            const flashLiteAtMinuteLimitRecord = {
                ...mockRateLimitRecord,
                userId: VT_PLUS_USER_ID,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: '200',
                minuteRequestCount: '100', // At Flash Lite minute limit
            };

            let callCount = 0;
            mockDbOperations.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                callCount++ === 0 ? proRecord : flashLiteAtMinuteLimitRecord
                            ]),
                        }),
                    }),
                }),
            }));

            const result = await checkRateLimit(
                VT_PLUS_USER_ID,
                ModelEnum.GEMINI_2_5_PRO,
                true
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe('minute_limit_exceeded');
        });
    });
});
