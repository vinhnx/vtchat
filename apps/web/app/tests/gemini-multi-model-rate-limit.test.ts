import {
    checkRateLimit,
    getRateLimitStatus,
    RATE_LIMITS,
    recordRequest,
} from "@/lib/services/rate-limit";
import { ModelEnum } from "@repo/ai/models";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the database
vi.mock("@/lib/database", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    },
}));

// Mock drizzle-orm functions
vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    and: vi.fn(),
}));

describe("Gemini Multi-Model Rate Limiting", () => {
    const testUserId = "test-user-123";
    const vtPlusUserId = "vt-plus-user-456";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("RATE_LIMITS constants", () => {
        it("should have correct rate limits for Gemini models", () => {
            expect(RATE_LIMITS.GEMINI_2_5_FLASH_LITE).toEqual({
                DAILY_LIMIT: 10,
                MINUTE_LIMIT: 5,
                MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
                VT_PLUS_DAILY_LIMIT: 25,
                VT_PLUS_MINUTE_LIMIT: 10,
            });
        });
    });

    describe("Free user rate limiting", () => {
        it("should enforce rate limits for free users on Gemini 2.5 Flash Lite", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: "20", // At daily limit
                minuteRequestCount: "0",
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId, ModelEnum.GEMINI_2_5_FLASH_LITE, false);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("daily_limit_exceeded");
            expect(result.remainingDaily).toBe(0);
        });

        it("should enforce rate limits for free users on Gemini 2.5 Pro", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: "10", // At daily limit
                minuteRequestCount: "0",
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId, ModelEnum.GEMINI_2_5_PRO, false);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("daily_limit_exceeded");
            expect(result.remainingDaily).toBe(0);
        });

        it("should enforce minute limits for free users on Gemini 2.5 Pro Thinking", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO_THINKING,
                dailyRequestCount: "3", // Under daily limit
                minuteRequestCount: "1", // At minute limit
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(), // Recent reset
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(
                testUserId,
                ModelEnum.GEMINI_2_5_PRO_THINKING,
                false,
            );

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("minute_limit_exceeded");
            expect(result.remainingMinute).toBe(0);
        });
    });

    describe("VT+ user rate limiting", () => {
        it("should allow VT+ users higher limits on all Gemini models", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-456",
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: "50", // Under VT+ limit
                minuteRequestCount: "10", // Under VT+ limit
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(
                vtPlusUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                true,
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(950); // 1000 - 50
            expect(result.remainingMinute).toBe(90); // 100 - 10
        });

        it("should enforce VT+ limits when exceeded", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-456",
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: "1000", // At VT+ daily limit
                minuteRequestCount: "50", // Under VT+ minute limit
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("daily_limit_exceeded");
            expect(result.remainingDaily).toBe(0);
        });
    });

    describe("Non-Gemini models", () => {
        it("should allow unlimited requests for non-Gemini models", async () => {
            const result = await checkRateLimit(testUserId, ModelEnum.GPT_4o, false);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });

        it("should not record requests for non-Gemini models", async () => {
            const mockDb = await import("@/lib/database");

            await recordRequest(testUserId, ModelEnum.GPT_4o, false);

            expect(mockDb.db.select).not.toHaveBeenCalled();
        });
    });

    describe("Reset logic", () => {
        it("should reset daily counts after 24 hours", async () => {
            const mockDb = await import("@/lib/database");
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: "20", // Was at limit
                minuteRequestCount: "0",
                lastDailyReset: yesterday, // Reset needed
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId, ModelEnum.GEMINI_2_5_FLASH_LITE, false);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(20); // Reset to full limit
        });

        it("should reset minute counts after 1 minute", async () => {
            const mockDb = await import("@/lib/database");
            const twoMinutesAgo = new Date();
            twoMinutesAgo.setMinutes(twoMinutesAgo.getMinutes() - 2);

            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO_THINKING,
                dailyRequestCount: "3",
                minuteRequestCount: "1", // Was at limit
                lastDailyReset: new Date(),
                lastMinuteReset: twoMinutesAgo, // Reset needed
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const result = await checkRateLimit(
                testUserId,
                ModelEnum.GEMINI_2_5_PRO_THINKING,
                false,
            );

            expect(result.allowed).toBe(true);
            expect(result.remainingMinute).toBe(1); // Reset to full limit
        });
    });

    describe("getRateLimitStatus with VT+ support", () => {
        it("should return correct status for free users", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-123",
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                dailyRequestCount: "5",
                minuteRequestCount: "2",
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const status = await getRateLimitStatus(
                testUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
                false,
            );

            expect(status).toEqual({
                dailyUsed: 5,
                minuteUsed: 2,
                dailyLimit: 20,
                minuteLimit: 5,
                remainingDaily: 15,
                remainingMinute: 3,
                resetTime: expect.objectContaining({
                    daily: expect.any(Date),
                    minute: expect.any(Date),
                }),
            });
        });

        it("should return correct status for VT+ users", async () => {
            const mockDb = await import("@/lib/database");
            const mockRecord = {
                id: "record-456",
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                dailyRequestCount: "100",
                minuteRequestCount: "20",
                lastDailyReset: new Date(),
                lastMinuteReset: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue([mockRecord]),
                    }),
                }),
            });

            const status = await getRateLimitStatus(vtPlusUserId, ModelEnum.GEMINI_2_5_PRO, true);

            expect(status).toEqual({
                dailyUsed: 100,
                minuteUsed: 20,
                dailyLimit: 1000,
                minuteLimit: 100,
                remainingDaily: 900,
                remainingMinute: 80,
                resetTime: expect.objectContaining({
                    daily: expect.any(Date),
                    minute: expect.any(Date),
                }),
            });
        });
    });
});
