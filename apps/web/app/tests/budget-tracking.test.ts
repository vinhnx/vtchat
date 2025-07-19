import { ModelEnum } from "@repo/ai/models";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    BUDGET_LIMITS,
    checkBudgetStatus,
    getBudgetStatus,
    recordUsage,
} from "@/lib/services/budget-tracking";

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
    sum: vi.fn(),
    gte: vi.fn(),
}));

// Mock logger
vi.mock("@repo/shared/logger", () => ({
    log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

describe("Budget Tracking Service", () => {
    const testUserId = "test-user-123";
    const vtPlusUserId = "vt-plus-user-456";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("BUDGET_LIMITS constants", () => {
        it("should have correct budget limits", () => {
            expect(BUDGET_LIMITS.MONTHLY_LIMIT_USD).toBe(80);
            expect(BUDGET_LIMITS.DAILY_LIMIT_USD).toBe(80 / 30);
            expect(BUDGET_LIMITS.WARNING_THRESHOLD).toBe(0.8);
            expect(BUDGET_LIMITS.CRITICAL_THRESHOLD).toBe(0.95);
        });
    });

    describe("checkBudgetStatus", () => {
        it("should allow requests when budget is available", async () => {
            const mockDb = await import("@/lib/database");

            // Mock low usage
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "10.50" }]),
                    }),
                }),
            });

            const result = await checkBudgetStatus();

            expect(result.allowed).toBe(true);
            expect(result.remainingBudget).toBeGreaterThan(0);
            expect(result.usagePercent).toBeLessThan(80); // Under warning threshold
        });

        it("should block requests when budget is exceeded", async () => {
            const mockDb = await import("@/lib/database");

            // Mock high usage that exceeds budget
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "85.00" }]),
                    }),
                }),
            });

            const result = await checkBudgetStatus();

            expect(result.allowed).toBe(false);
            expect(result.reason).toBe("budget_exceeded");
            expect(result.remainingBudget).toBeLessThanOrEqual(0);
        });

        it("should warn when approaching budget limit", async () => {
            const mockDb = await import("@/lib/database");

            // Mock usage at warning threshold (80% of $80 = $64)
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "65.00" }]),
                    }),
                }),
            });

            const result = await checkBudgetStatus();

            expect(result.allowed).toBe(true);
            expect(result.warningLevel).toBe("warning");
            expect(result.usagePercent).toBeGreaterThan(80);
        });

        it("should show critical warning when very close to budget limit", async () => {
            const mockDb = await import("@/lib/database");

            // Mock usage at critical threshold (95% of $80 = $76)
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "77.00" }]),
                    }),
                }),
            });

            const result = await checkBudgetStatus();

            expect(result.allowed).toBe(true);
            expect(result.warningLevel).toBe("critical");
            expect(result.usagePercent).toBeGreaterThan(95);
        });
    });

    describe("recordUsage", () => {
        it("should record usage for Gemini models", async () => {
            const mockDb = await import("@/lib/database");

            const mockInsert = vi.fn().mockResolvedValue(undefined);
            (mockDb.db.insert as any).mockReturnValue({
                values: mockInsert,
            });

            const usageData = {
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                inputTokens: 1000,
                outputTokens: 500,
                totalCost: 0.005,
            };

            await recordUsage(usageData);

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: testUserId,
                    modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                    inputTokens: "1000",
                    outputTokens: "500",
                    totalCost: "0.005",
                    provider: "google",
                    timestamp: expect.any(Date),
                }),
            );
        });

        it("should not record usage for non-Gemini models", async () => {
            const mockDb = await import("@/lib/database");

            const usageData = {
                userId: testUserId,
                modelId: ModelEnum.GPT_4o,
                inputTokens: 1000,
                outputTokens: 500,
                totalCost: 0.01,
            };

            await recordUsage(usageData);

            expect(mockDb.db.insert).not.toHaveBeenCalled();
        });

        it("should handle VT+ user usage tracking", async () => {
            const mockDb = await import("@/lib/database");

            const mockInsert = vi.fn().mockResolvedValue(undefined);
            (mockDb.db.insert as any).mockReturnValue({
                values: mockInsert,
            });

            const usageData = {
                userId: vtPlusUserId,
                modelId: ModelEnum.GEMINI_2_5_PRO,
                inputTokens: 2000,
                outputTokens: 1000,
                totalCost: 0.02,
            };

            await recordUsage(usageData);

            expect(mockInsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: vtPlusUserId,
                    modelId: ModelEnum.GEMINI_2_5_PRO,
                    inputTokens: "2000",
                    outputTokens: "1000",
                    totalCost: "0.02",
                    provider: "google",
                }),
            );
        });
    });

    describe("getBudgetStatus", () => {
        it("should return global budget status", async () => {
            const mockDb = await import("@/lib/database");

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "45.50" }]),
                    }),
                }),
            });

            const status = await getBudgetStatus();

            expect(status).toEqual({
                monthlyUsed: 45.5,
                monthlyLimit: 80,
                remainingBudget: 34.5,
                usagePercent: 56.875,
                warningLevel: "normal",
                isEnabled: true,
            });
        });

        it("should return user-specific budget status", async () => {
            const mockDb = await import("@/lib/database");

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "12.25" }]),
                    }),
                }),
            });

            const status = await getBudgetStatus({ userId: testUserId });

            expect(status).toEqual({
                monthlyUsed: 12.25,
                monthlyLimit: 80,
                remainingBudget: 67.75,
                usagePercent: 15.3125,
                warningLevel: "normal",
                isEnabled: true,
            });
        });

        it("should handle no usage data", async () => {
            const mockDb = await import("@/lib/database");

            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([]),
                    }),
                }),
            });

            const status = await getBudgetStatus();

            expect(status).toEqual({
                monthlyUsed: 0,
                monthlyLimit: 80,
                remainingBudget: 80,
                usagePercent: 0,
                warningLevel: "normal",
                isEnabled: true,
            });
        });
    });

    describe("Budget integration scenarios", () => {
        it("should handle budget exceeded scenario", async () => {
            const mockDb = await import("@/lib/database");

            // Mock budget status check
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([{ totalCost: "82.00" }]),
                    }),
                }),
            });

            const budgetStatus = await checkBudgetStatus();

            expect(budgetStatus.allowed).toBe(false);
            expect(budgetStatus.reason).toBe("budget_exceeded");

            // Should not allow recording new usage when budget is exceeded
            const _usageData = {
                userId: testUserId,
                modelId: ModelEnum.GEMINI_2_5_FLASH_LITE,
                inputTokens: 1000,
                outputTokens: 500,
                totalCost: 0.005,
            };

            // This should be blocked by API endpoint logic
            expect(budgetStatus.allowed).toBe(false);
        });

        it("should handle monthly budget reset", async () => {
            const mockDb = await import("@/lib/database");

            // Mock empty result for new month
            (mockDb.db.select as any).mockReturnValue({
                from: vi.fn().mockReturnValue({
                    where: vi.fn().mockReturnValue({
                        then: vi.fn().mockResolvedValue([]),
                    }),
                }),
            });

            const status = await getBudgetStatus();

            expect(status.monthlyUsed).toBe(0);
            expect(status.remainingBudget).toBe(80);
            expect(status.usagePercent).toBe(0);
            expect(status.warningLevel).toBe("normal");
        });
    });
});
