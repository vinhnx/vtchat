import { ModelEnum } from '@repo/ai/models';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the database BEFORE importing the service
const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
};

vi.mock('@/lib/database', () => ({
    db: mockDb,
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn(() => 'eq-mock'),
    and: vi.fn(() => 'and-mock'),
}));

// Import service after mocks are set up
const { checkRateLimit, recordRequest, getRateLimitStatus, RATE_LIMITS } = await import(
    '@/lib/services/rate-limit'
);

describe('Gemini 2.5 Flash Lite - Rate Limiting Per Account', () => {
    const testUserId1 = 'user-account-1';
    const testUserId2 = 'user-account-2';
    const freeModelId = ModelEnum.GEMINI_2_5_FLASH_LITE;
    const paidModelId = ModelEnum.GPT_4o;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rate Limit Constants', () => {
        it('should enforce correct per-account limits for Gemini 2.5 Flash Lite', () => {
            expect(RATE_LIMITS.GEMINI_2_5_FLASH_LITE).toEqual({
                DAILY_LIMIT: 20, // 20 requests per day PER USER
                MINUTE_LIMIT: 5, // 5 requests per minute PER USER
                MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
            });
        });
    });

    describe('Per-Account Rate Limiting Logic', () => {
        it('should allow unlimited requests for paid models', async () => {
            const result = await checkRateLimit(testUserId1, paidModelId);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
            expect(mockDb.select).not.toHaveBeenCalled();
        });

        it('should create separate rate limit records for different user accounts', async () => {
            // Mock empty results for both users (first time)
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined),
            });

            // Check rate limits for two different users
            const result1 = await checkRateLimit(testUserId1, freeModelId);
            const result2 = await checkRateLimit(testUserId2, freeModelId);

            // Both users should be allowed (separate accounts)
            expect(result1.allowed).toBe(true);
            expect(result1.remainingDaily).toBe(10);
            expect(result2.allowed).toBe(true);
            expect(result2.remainingDaily).toBe(10);

            // Should create separate records
            expect(mockDb.insert).toHaveBeenCalledTimes(2);
        });

        it('should enforce daily limit per individual account', async () => {
            const now = new Date('2024-01-01T12:00:00Z');
            vi.setSystemTime(now);

            // Mock user1 at daily limit, user2 with remaining requests
            const mockRecordUser1 = {
                id: 'record-user1',
                userId: testUserId1,
                modelId: freeModelId,
                dailyRequestCount: '10', // At limit
                minuteRequestCount: '0',
                lastDailyReset: now,
                lastMinuteReset: now,
                createdAt: now,
                updatedAt: now,
            };

            const mockRecordUser2 = {
                id: 'record-user2',
                userId: testUserId2,
                modelId: freeModelId,
                dailyRequestCount: '5', // Under limit
                minuteRequestCount: '0',
                lastDailyReset: now,
                lastMinuteReset: now,
                createdAt: now,
                updatedAt: now,
            };

            mockDb.select
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser1]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser2]),
                            }),
                        }),
                    }),
                });

            const result1 = await checkRateLimit(testUserId1, freeModelId);
            const result2 = await checkRateLimit(testUserId2, freeModelId);

            // User1 should be blocked, User2 should be allowed
            expect(result1.allowed).toBe(false);
            expect(result1.reason).toBe('daily_limit_exceeded');
            expect(result1.remainingDaily).toBe(0);

            expect(result2.allowed).toBe(true);
            expect(result2.remainingDaily).toBe(5);
        });

        it('should enforce per-minute limit per individual account', async () => {
            const now = new Date('2024-01-01T12:00:00Z');
            vi.setSystemTime(now);

            // Mock both users at minute limit
            const mockRecordUser1 = {
                id: 'record-user1',
                userId: testUserId1,
                modelId: freeModelId,
                dailyRequestCount: '5',
                minuteRequestCount: '1', // At minute limit
                lastDailyReset: new Date('2024-01-01T00:00:00Z'),
                lastMinuteReset: now, // Recent minute reset
                createdAt: now,
                updatedAt: now,
            };

            const mockRecordUser2 = {
                id: 'record-user2',
                userId: testUserId2,
                modelId: freeModelId,
                dailyRequestCount: '3',
                minuteRequestCount: '0', // Under minute limit
                lastDailyReset: new Date('2024-01-01T00:00:00Z'),
                lastMinuteReset: new Date('2024-01-01T11:59:00Z'), // Old minute reset
                createdAt: now,
                updatedAt: now,
            };

            mockDb.select
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser1]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser2]),
                            }),
                        }),
                    }),
                });

            const result1 = await checkRateLimit(testUserId1, freeModelId);
            const result2 = await checkRateLimit(testUserId2, freeModelId);

            // User1 should be minute-limited, User2 should be allowed
            expect(result1.allowed).toBe(false);
            expect(result1.reason).toBe('minute_limit_exceeded');
            expect(result1.remainingMinute).toBe(0);

            expect(result2.allowed).toBe(true);
            expect(result2.remainingMinute).toBe(1);
        });
    });

    describe('Daily Reset Logic (00:00 UTC)', () => {
        it('should reset daily counts at 00:00 UTC per user account', async () => {
            // Start at 23:59 UTC
            const beforeMidnight = new Date('2024-01-01T23:59:00Z');
            const afterMidnight = new Date('2024-01-02T00:01:00Z');

            vi.setSystemTime(beforeMidnight);

            const mockRecord = {
                id: 'record-123',
                userId: testUserId1,
                modelId: freeModelId,
                dailyRequestCount: '10', // At limit
                minuteRequestCount: '0',
                lastDailyReset: new Date('2024-01-01T00:00:00Z'), // Previous day
                lastMinuteReset: beforeMidnight,
                createdAt: beforeMidnight,
                updatedAt: beforeMidnight,
            };

            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockRecord]),
                        }),
                    }),
                }),
            });

            // Before midnight - should be blocked
            const resultBefore = await checkRateLimit(testUserId1, freeModelId);
            expect(resultBefore.allowed).toBe(false);
            expect(resultBefore.reason).toBe('daily_limit_exceeded');

            // Move to after midnight
            vi.setSystemTime(afterMidnight);

            // After midnight - should be allowed (daily reset)
            const resultAfter = await checkRateLimit(testUserId1, freeModelId);
            expect(resultAfter.allowed).toBe(true);
            expect(resultAfter.remainingDaily).toBe(10); // Reset to full limit
        });
    });

    describe('Request Recording Per Account', () => {
        it('should record requests separately for different user accounts', async () => {
            const now = new Date('2024-01-01T12:00:00Z');
            vi.setSystemTime(now);

            // Mock both users as first-time users
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            const mockInsert = vi.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockInsert,
            });

            // Record requests for both users
            await recordRequest(testUserId1, freeModelId, false);
            await recordRequest(testUserId2, freeModelId, false);

            // Should create separate records for each user
            expect(mockInsert).toHaveBeenCalledTimes(2);

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: testUserId1,
                    modelId: freeModelId,
                    dailyRequestCount: '1',
                    minuteRequestCount: '1',
                })
            );

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: testUserId2,
                    modelId: freeModelId,
                    dailyRequestCount: '1',
                    minuteRequestCount: '1',
                })
            );
        });

        it('should not record requests for paid models', async () => {
            await recordRequest(testUserId1, paidModelId, false);
            await recordRequest(testUserId2, paidModelId, false);

            // Should not call database for paid models
            expect(mockDb.select).not.toHaveBeenCalled();
            expect(mockDb.insert).not.toHaveBeenCalled();
        });
    });

    describe('Rate Limit Status Per Account', () => {
        it('should return null for paid models', async () => {
            const status1 = await getRateLimitStatus(testUserId1, paidModelId);
            const status2 = await getRateLimitStatus(testUserId2, paidModelId);

            expect(status1).toBeNull();
            expect(status2).toBeNull();
        });

        it('should return individual user status for free models', async () => {
            const now = new Date('2024-01-01T12:00:00Z');
            vi.setSystemTime(now);

            // Mock different usage for different users
            const mockRecordUser1 = {
                id: 'record-user1',
                userId: testUserId1,
                modelId: freeModelId,
                dailyRequestCount: '8', // User1 used 8
                minuteRequestCount: '0',
                lastDailyReset: new Date('2024-01-01T00:00:00Z'),
                lastMinuteReset: new Date('2024-01-01T11:59:00Z'),
                createdAt: now,
                updatedAt: now,
            };

            const mockRecordUser2 = {
                id: 'record-user2',
                userId: testUserId2,
                modelId: freeModelId,
                dailyRequestCount: '3', // User2 used 3
                minuteRequestCount: '1',
                lastDailyReset: new Date('2024-01-01T00:00:00Z'),
                lastMinuteReset: now,
                createdAt: now,
                updatedAt: now,
            };

            mockDb.select
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser1]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                then: vi.fn().mockResolvedValue([mockRecordUser2]),
                            }),
                        }),
                    }),
                });

            const status1 = await getRateLimitStatus(testUserId1, freeModelId);
            const status2 = await getRateLimitStatus(testUserId2, freeModelId);

            // User1 status
            expect(status1).toEqual({
                dailyUsed: 8,
                minuteUsed: 0,
                dailyLimit: 10,
                minuteLimit: 1,
                remainingDaily: 2,
                remainingMinute: 1,
                resetTime: expect.objectContaining({
                    daily: expect.any(Date),
                    minute: expect.any(Date),
                }),
            });

            // User2 status (different usage)
            expect(status2).toEqual({
                dailyUsed: 3,
                minuteUsed: 1,
                dailyLimit: 10,
                minuteLimit: 1,
                remainingDaily: 7,
                remainingMinute: 0, // At minute limit
                resetTime: expect.objectContaining({
                    daily: expect.any(Date),
                    minute: expect.any(Date),
                }),
            });
        });

        it('should return default status for first-time users', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            const status = await getRateLimitStatus(testUserId1, freeModelId);

            expect(status).toEqual({
                dailyUsed: 0,
                minuteUsed: 0,
                dailyLimit: 10,
                minuteLimit: 1,
                remainingDaily: 10,
                remainingMinute: 1,
                resetTime: expect.objectContaining({
                    daily: expect.any(Date),
                    minute: expect.any(Date),
                }),
            });
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should handle database errors gracefully', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockRejectedValue(new Error('Database error')),
                        }),
                    }),
                }),
            });

            await expect(checkRateLimit(testUserId1, freeModelId)).rejects.toThrow(
                'Database error'
            );
        });

        it('should handle missing user records correctly', async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined),
            });

            const result = await checkRateLimit(testUserId1, freeModelId);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(10);
            expect(result.remainingMinute).toBe(1);
        });

        it('should handle corrupted rate limit data', async () => {
            const mockRecord = {
                id: 'record-123',
                userId: testUserId1,
                modelId: freeModelId,
                dailyRequestCount: 'invalid', // Invalid data
                minuteRequestCount: 'also-invalid',
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([mockRecord]),
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId1, freeModelId);

            // Should handle NaN gracefully and treat as 0
            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(10);
            expect(result.remainingMinute).toBe(1);
        });
    });
});
