// VT+ Configuration Tests
import { describe, expect, it } from "vitest";
import {
    QUOTA_WINDOW,
    type QuotaConfig,
    QuotaExceededError,
    VT_PLUS_LIMITS,
    VtPlusFeature,
} from "../src/config/vtPlusLimits";

describe("VT+ Configuration", () => {
    describe("VT+ Limits", () => {
        it("should have correct default limits with windows", () => {
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH]).toEqual({
                limit: 5,
                window: QUOTA_WINDOW.DAILY,
            });
            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH]).toEqual({
                limit: 10,
                window: QUOTA_WINDOW.DAILY,
            });
        });

        it("should have all required VT+ features", () => {
            expect(Object.values(VtPlusFeature)).toEqual(["DR", "PS"]);
        });

        it("should only have positive limits", () => {
            Object.values(VT_PLUS_LIMITS).forEach((config: QuotaConfig) => {
                expect(config.limit).toBeGreaterThan(0);
                expect(Number.isInteger(config.limit)).toBe(true);
                expect([QUOTA_WINDOW.DAILY, QUOTA_WINDOW.MONTHLY]).toContain(config.window);
            });
        });
    });

    describe("VtPlusFeature enum", () => {
        it("should have correct feature names", () => {
            expect(VtPlusFeature.DEEP_RESEARCH).toBe("DR");
            expect(VtPlusFeature.PRO_SEARCH).toBe("PS");
        });

        it("should be type-safe", () => {
            const features = Object.values(VtPlusFeature);
            expect(features).toHaveLength(2);

            features.forEach((feature) => {
                expect(VT_PLUS_LIMITS[feature]).toBeDefined();
                expect(typeof VT_PLUS_LIMITS[feature]).toBe("object");
                expect(typeof VT_PLUS_LIMITS[feature].limit).toBe("number");
                expect(typeof VT_PLUS_LIMITS[feature].window).toBe("string");
            });
        });
    });

    describe("QuotaExceededError", () => {
        const testFeature = VtPlusFeature.DEEP_RESEARCH;

        it("should create error with correct properties", () => {
            const error = new QuotaExceededError(testFeature, 500, 450);

            expect(error.name).toBe("QuotaExceededError");
            expect(error.feature).toBe(testFeature);
            expect(error.limit).toBe(500);
            expect(error.used).toBe(450);
            expect(error.message).toContain("VT+ quota exceeded");
            expect(error.message).toContain("DR");
            expect(error.message).toContain("450/500");
        });

        it("should be instance of Error", () => {
            const error = new QuotaExceededError(testFeature, 500, 450);
            expect(error).toBeInstanceOf(Error);
        });

        it("should have correct error message format", () => {
            const error = new QuotaExceededError(VtPlusFeature.PRO_SEARCH, 1000, 950);
            expect(error.message).toContain("PS");
            expect(error.message).toContain("950/1000");
        });

        it("should handle different feature types", () => {
            const drError = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 400);
            const psError = new QuotaExceededError(VtPlusFeature.PRO_SEARCH, 5000, 4500);

            expect(drError.message).toContain("DR");
            expect(psError.message).toContain("PS");
        });
    });

    describe("Quota Validation Logic", () => {
        it("should allow usage within limits", () => {
            const currentUsed = 1;
            const requestedAmount = 2;
            const { limit } = VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH];

            const wouldExceed = currentUsed + requestedAmount > limit;
            expect(wouldExceed).toBe(false);
        });

        it("should detect quota exceeded", () => {
            const currentUsed = 4;
            const requestedAmount = 2;
            const { limit } = VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH];

            const wouldExceed = currentUsed + requestedAmount > limit;
            expect(wouldExceed).toBe(true);
        });

        it("should handle edge case at exact limit", () => {
            const { limit } = VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH];

            // Should allow reaching exactly the limit
            const atLimit = limit - 1 + 1 > limit;
            expect(atLimit).toBe(false);

            // Should prevent exceeding the limit
            const exceedLimit = limit + 1 > limit;
            expect(exceedLimit).toBe(true);
        });
    });

    describe("Period Calculation", () => {
        it("should generate correct period start for current month", () => {
            const now = new Date();
            const expectedPeriod = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
                .toISOString()
                .split("T")[0];

            // Test the period calculation logic
            const periodStart = new Date(
                Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
            )
                .toISOString()
                .split("T")[0];

            expect(periodStart).toBe(expectedPeriod);
        });

        it("should handle different months correctly", () => {
            // Test January
            const jan = new Date(Date.UTC(2024, 0, 15)); // January 15, 2024
            const janPeriod = new Date(Date.UTC(jan.getUTCFullYear(), jan.getUTCMonth(), 1))
                .toISOString()
                .split("T")[0];
            expect(janPeriod).toBe("2024-01-01");

            // Test December
            const dec = new Date(Date.UTC(2024, 11, 25)); // December 25, 2024
            const decPeriod = new Date(Date.UTC(dec.getUTCFullYear(), dec.getUTCMonth(), 1))
                .toISOString()
                .split("T")[0];
            expect(decPeriod).toBe("2024-12-01");
        });

        it("should always start at day 1 of month", () => {
            const dates = [
                new Date(Date.UTC(2024, 5, 15)), // June 15
                new Date(Date.UTC(2024, 5, 30)), // June 30
                new Date(Date.UTC(2024, 5, 1)), // June 1
            ];

            dates.forEach((date) => {
                const period = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
                    .toISOString()
                    .split("T")[0];
                expect(period).toBe("2024-06-01");
            });
        });
    });
});
