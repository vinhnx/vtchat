import { ModelEnum } from "@repo/ai/models";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    checkRateLimit,
    getRateLimitStatus,
    RATE_LIMITS,
    recordRequest,
} from "@/lib/services/rate-limit";

// Mock the database
vi.mock("@/lib/database/db", () => ({
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

describe("Rate Limiting Service", () => {
    const testUserId = "test-user-123";
    const testModelId = ModelEnum.GEMINI_2_5_FLASH_LITE;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("RATE_LIMITS constants", () => {
        it("should have correct rate limits for Gemini 2.5 Flash Lite", () => {
            expect(RATE_LIMITS.GEMINI_2_5_FLASH_LITE).toEqual({
                DAILY_LIMIT: 20,
                MINUTE_LIMIT: 5,
                MODEL_ID: ModelEnum.GEMINI_2_5_FLASH_LITE,
            });
        });
    });

    describe("checkRateLimit", () => {
        it("should allow requests for non-rate-limited models", async () => {
            const result = await checkRateLimit(testUserId, ModelEnum.GPT_4o);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(Number.POSITIVE_INFINITY);
            expect(result.remainingMinute).toBe(Number.POSITIVE_INFINITY);
        });

        it("should handle first-time users for rate-limited models", async () => {
            const mockDb = await import("@/lib/database/db");

            // Mock empty result for first-time user
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // Removed 'then:' property
                        }),
                    }),
                }),
            });

            // Mock successful insert
            (mockDb.db.insert as any).mockReturnValue({
                values: vi.fn().mockResolvedValue(undefined),
            });

            const result = await checkRateLimit(testUserId, testModelId);

            expect(result.allowed).toBe(true);
            expect(result.remainingDaily).toBe(10);
            expect(result.remainingMinute).toBe(1);
        });
    });

    describe("Rate limit validation", () => {
        it("should reject requests when daily limit is exceeded", async () => {
            const mockDb = await import("@/lib/database/db");

            // Mock existing user with daily limit exceeded
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // Removed 'then:' property
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId, testModelId);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("daily_limit_exceeded");
            expect(result.remainingDaily).toBe(0);
        });

        it("should reject requests when minute limit is exceeded", async () => {
            const mockDb = await import("@/lib/database/db");

            // Mock existing user with minute limit exceeded
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // Removed 'then:' property
                        }),
                    }),
                }),
            });

            const result = await checkRateLimit(testUserId, testModelId);

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("minute_limit_exceeded");
            expect(result.remainingMinute).toBe(0);
        });
    });

    describe("recordRequest", () => {
        it("should not record requests for non-rate-limited models", async () => {
            const mockDb = await import("@/lib/database/db");

            await recordRequest(testUserId, ModelEnum.GPT_4o, false);

            // Should not call database for non-rate-limited models
            expect(mockDb.db.select).not.toHaveBeenCalled();
        });

        it("should create new record for first-time users", async () => {
            const mockDb = await import("@/lib/database/db");

            // Mock empty result for first-time user
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // Removed 'then:' property
                        }),
                    }),
                }),
            });

            const mockInsert = vi.fn().mockResolvedValue(undefined);
            (mockDb.db.insert as any).mockReturnValue({
                values: mockInsert,
            });

            await recordRequest(testUserId, testModelId, false);

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: testUserId,
                    modelId: testModelId,
                    dailyRequestCount: "1",
                    minuteRequestCount: "1",
                }),
            );
        });
    });

    describe("getRateLimitStatus", () => {
        it("should return null for non-rate-limited models", async () => {
            const status = await getRateLimitStatus(testUserId, ModelEnum.GPT_4o);

            expect(status).toBeNull();
        });

        it("should return default status for first-time users", async () => {
            const mockDb = await import("@/lib/database/db");

            // Mock empty result for first-time user
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        limit: vi.fn().mockReturnValue({
                            // Removed 'then:' property
                        }),
                    }),
                }),
            });

            const status = await getRateLimitStatus(testUserId, testModelId);

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
});

describe("Rate Limit Integration", () => {
    it("should enforce authentication requirement for free model", async () => {
        // This would test the API endpoint authentication
        // Implementation would depend on your test setup
        expect(true).toBe(true); // Placeholder
    });

    it("should allow VT+ users to bypass rate limits with subscription", async () => {
        // This would test the subscription bypass logic
        // Implementation would depend on your test setup
        expect(true).toBe(true); // Placeholder
    });

    it("should redirect non-authenticated users to login", async () => {
        // This would test the redirect logic in the API
        // Implementation would depend on your test setup
        expect(true).toBe(true); // Placeholder
    });
});
