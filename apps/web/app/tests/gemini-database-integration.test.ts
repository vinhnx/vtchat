import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock environment for testing
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

// Mock database connection BEFORE importing services
const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

vi.mock("@/lib/database", () => ({
    db: mockDb,
}));

// Mock drizzle-orm
const mockEq = vi.fn(() => "eq-condition");
const mockAnd = vi.fn(() => "and-condition");

vi.mock("drizzle-orm", () => ({
    eq: mockEq,
    and: mockAnd,
}));

// Mock schema
vi.mock("@/lib/database/schema", () => ({
    userRateLimits: {
        id: "id",
        userId: "userId",
        modelId: "modelId",
        dailyRequestCount: "dailyRequestCount",
        minuteRequestCount: "minuteRequestCount",
        lastDailyReset: "lastDailyReset",
        lastMinuteReset: "lastMinuteReset",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    },
}));

import { ModelEnum } from "@repo/ai/models";
import { checkRateLimit, getRateLimitStatus, recordRequest } from "@/lib/services/rate-limit";

describe("Gemini 2.5 Flash Lite - Database Integration", () => {
    const testUserId = "db-test-user-123";
    const freeModelId = ModelEnum.GEMINI_2_5_FLASH_LITE;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("Database Schema Validation", () => {
        it("should create rate limit record with correct schema", async () => {
            const now = new Date("2024-01-01T12:00:00Z");
            vi.setSystemTime(now);

            // Mock empty database result (new user)
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            const mockInsertFn = vi.fn().mockResolvedValue(undefined);
            mockDb.insert.mockReturnValue({
                values: mockInsertFn,
            });

            await checkRateLimit(testUserId, freeModelId);

            // Verify correct database insert structure
            expect(mockInsertFn).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: expect.any(String),
                    userId: testUserId,
                    modelId: freeModelId,
                    dailyRequestCount: "0",
                    minuteRequestCount: "0",
                    lastDailyReset: now,
                    lastMinuteReset: now,
                    createdAt: now,
                    updatedAt: now,
                }),
            );
        });

        it("should use correct WHERE conditions for user isolation", async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            await checkRateLimit(testUserId, freeModelId);

            // Verify user and model isolation
            expect(mockEq).toHaveBeenCalledWith("userId", testUserId);
            expect(mockEq).toHaveBeenCalledWith("modelId", freeModelId);
            expect(mockAnd).toHaveBeenCalled();
        });

        it("should update existing records correctly", async () => {
            const now = new Date("2024-01-01T12:00:00Z");
            vi.setSystemTime(now);

            // Mock existing record on first call, empty on second call for recordRequest
            mockDb.select
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                // then: vi.fn().mockResolvedValue([existingRecord]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                // then: vi.fn().mockResolvedValue([existingRecord]),
                            }),
                        }),
                    }),
                });

            const mockUpdateFn = vi.fn().mockResolvedValue(undefined);
            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: mockUpdateFn,
                }),
            });

            // First check rate limit (should be allowed)
            const result = await checkRateLimit(testUserId, freeModelId);
            expect(result.allowed).toBe(true);

            // Then record the request
            await recordRequest(testUserId, freeModelId, false);

            // Verify update was called
            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe("Concurrent User Handling", () => {
        it("should handle multiple users accessing database simultaneously", async () => {
            const user1 = "concurrent-user-1";
            const user2 = "concurrent-user-2";
            const user3 = "concurrent-user-3";

            // User3 is new (no record)
            mockDb.select
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                // then: vi.fn().mockResolvedValue([record1]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                // then: vi.fn().mockResolvedValue([record2]),
                            }),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: vi.fn().mockReturnValue({
                        where: vi.fn().mockReturnValue({
                            limit: vi.fn().mockReturnValue({
                                // then: vi.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                });

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined),
            });

            // Simulate concurrent requests
            const [result1, result2, result3] = await Promise.all([
                checkRateLimit(user1, freeModelId),
                checkRateLimit(user2, freeModelId),
                checkRateLimit(user3, freeModelId),
            ]);

            // Verify each user gets their own isolated result
            expect(result1.allowed).toBe(true);
            expect(result1.remainingDaily).toBe(2);

            expect(result2.allowed).toBe(false);
            expect(result2.reason).toBe("daily_limit_exceeded");

            expect(result3.allowed).toBe(true);
            expect(result3.remainingDaily).toBe(10);

            // Verify correct number of database calls
            expect(mockDb.select).toHaveBeenCalledTimes(3);
        });

        it("should handle database transaction isolation", async () => {
            const user1 = "transaction-user-1";
            const user2 = "transaction-user-2";

            // Both users at 9 requests (1 remaining)
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // then: vi.fn((callback) => {
                            //     // Simulate different users getting their own records
                            //     if (callback) {
                            //         const currentCall = mockDb.select.mock.calls.length - 1;
                            //         return Promise.resolve([
                            //             createRecord(`transaction-user-${currentCall + 1}`),
                            //         ]);
                            //     }
                            //     return Promise.resolve([]);
                            // }),
                        }),
                    }),
                }),
            });

            // Both should be allowed as they each have their own limits
            const [result1, result2] = await Promise.all([
                checkRateLimit(user1, freeModelId),
                checkRateLimit(user2, freeModelId),
            ]);

            expect(result1.allowed).toBe(true);
            expect(result1.remainingDaily).toBe(1);
            expect(result2.allowed).toBe(true);
            expect(result2.remainingDaily).toBe(1);
        });
    });

    describe("Database Error Handling", () => {
        it("should handle database connection errors", async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // then: vi.fn().mockRejectedValue(new Error("Connection timeout")),
                        }),
                    }),
                }),
            });

            await expect(checkRateLimit(testUserId, freeModelId)).rejects.toThrow(
                "Connection timeout",
            );
        });

        it("should handle insert failures gracefully", async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // then: vi.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            });

            mockDb.insert.mockReturnValue({
                values: vi.fn().mockRejectedValue(new Error("Unique constraint violation")),
            });

            await expect(checkRateLimit(testUserId, freeModelId)).rejects.toThrow(
                "Unique constraint violation",
            );
        });

        it("should handle update failures", async () => {
            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([{}]),
                        }),
                    }),
                }),
            });

            mockDb.update.mockReturnValue({
                set: vi.fn().mockReturnValue({
                    where: vi.fn().mockRejectedValue(new Error("Update failed")),
                }),
            });

            await expect(recordRequest(testUserId, freeModelId, false)).rejects.toThrow(
                "Update failed",
            );
        });
    });

    describe("Data Integrity", () => {
        it("should maintain data consistency across operations", async () => {
            const now = new Date("2024-01-01T12:00:00Z");
            vi.setSystemTime(now);

            // Simulate a sequence of operations
            const recordState = {
                id: "consistency-test",
                userId: testUserId,
                modelId: freeModelId,
                dailyRequestCount: "0",
                minuteRequestCount: "0",
                lastDailyReset: now,
                lastMinuteReset: now,
                createdAt: now,
                updatedAt: now,
            };

            // Track state changes through operations
            const stateTracker = {
                dailyCount: 0,
                minuteCount: 0,
            };

            mockDb.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([
                                {
                                    ...recordState,
                                    dailyRequestCount: stateTracker.dailyCount.toString(),
                                    minuteRequestCount: stateTracker.minuteCount.toString(),
                                },
                            ]),
                        }),
                    }),
                }),
            }));

            mockDb.update.mockImplementation(() => ({
                set: vi.fn().mockImplementation((updates) => ({
                    where: vi.fn().mockImplementation(() => {
                        // Update our state tracker
                        if (updates.dailyRequestCount) {
                            stateTracker.dailyCount = Number.parseInt(updates.dailyRequestCount);
                        }
                        if (updates.minuteRequestCount) {
                            stateTracker.minuteCount = Number.parseInt(updates.minuteRequestCount);
                        }
                        return Promise.resolve();
                    }),
                })),
            }));

            // Sequence of operations
            for (let i = 1; i <= 5; i++) {
                const rateLimitResult = await checkRateLimit(testUserId, freeModelId);
                expect(rateLimitResult.allowed).toBe(true);
                expect(rateLimitResult.remainingDaily).toBe(10 - (i - 1));

                await recordRequest(testUserId, freeModelId, false);

                // Verify state consistency
                expect(stateTracker.dailyCount).toBe(i);
                expect(stateTracker.minuteCount).toBe(1); // Reset each minute
            }
        });

        it("should handle clock skew and timezone issues", async () => {
            const utcMidnight = new Date("2024-01-02T00:00:00Z");
            const skewedTime = new Date("2024-01-01T23:59:30Z"); // 30 seconds before

            // Start with skewed time
            vi.setSystemTime(skewedTime);

            const record = {
                id: "timezone-test",
                userId: testUserId,
                modelId: freeModelId,
                dailyRequestCount: "10",
                minuteRequestCount: "0",
                lastDailyReset: new Date("2024-01-01T00:00:00Z"),
                lastMinuteReset: skewedTime,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockDb.select.mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockResolvedValue([record]),
                        }),
                    }),
                }),
            });

            // Should be blocked due to daily limit
            const resultBefore = await checkRateLimit(testUserId, freeModelId);
            expect(resultBefore.allowed).toBe(false);

            // Move to exactly midnight UTC
            vi.setSystemTime(utcMidnight);

            // Should now be allowed (daily reset)
            const resultAfter = await checkRateLimit(testUserId, freeModelId);
            expect(resultAfter.allowed).toBe(true);
            expect(resultAfter.remainingDaily).toBe(10);
        });

        it("should validate record ownership", async () => {
            const user1 = "owner-user-1";
            const user2 = "owner-user-2";

            // User1's record
            const user1Record = {
                id: "user1-record",
                userId: user1,
                modelId: freeModelId,
                dailyRequestCount: "5",
                minuteRequestCount: "0",
                lastDailyReset: new Date("2024-01-01T00:00:00Z"),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Mock to return user1's record when querying for user1
            // and empty result when querying for user2
            mockDb.select.mockImplementation(() => ({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockImplementation((_condition) => ({
                        limit: vi.fn().mockReturnValue({
                            then: vi.fn().mockImplementation(() => {
                                // Check which user is being queried
                                const isUser1Query = mockEq.mock.calls.some(
                                    (call) => call[1] === user1,
                                );
                                return Promise.resolve(isUser1Query ? [user1Record] : []);
                            }),
                        }),
                    })),
                }),
            }));

            // User1 should get their record
            const result1 = await getRateLimitStatus(user1, freeModelId);
            expect(result1?.dailyUsed).toBe(5);

            // User2 should get default (new user) status
            const result2 = await getRateLimitStatus(user2, freeModelId);
            expect(result2?.dailyUsed).toBe(0);

            // Verify proper isolation
            expect(result1?.dailyUsed).not.toBe(result2?.dailyUsed);
        });
    });
});
