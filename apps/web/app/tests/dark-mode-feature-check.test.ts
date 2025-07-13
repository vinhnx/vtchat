import { describe, expect, it } from "vitest";

describe("Dark Mode Feature Configuration", () => {
    it("should verify DARK_THEME feature exists in FeatureSlug", async () => {
        const { FeatureSlug } = await import("@repo/shared/types/subscription");

        // Verify DARK_THEME feature exists and has correct value
        expect(FeatureSlug.DARK_THEME).toBe("dark_theme");
        expect(Object.values(FeatureSlug)).toContain("dark_theme");
    });

    it("should verify DARK_THEME is available to free tier users", async () => {
        const { PLANS, PlanSlug } = await import("@repo/shared/types/subscription");
        const { FeatureSlug } = await import("@repo/shared/types/subscription");

        // Verify dark theme is in base plan features (available to free tier)
        const basePlan = PLANS[PlanSlug.VT_BASE];
        expect(basePlan.features).toContain(FeatureSlug.DARK_THEME);
    });

    it("should verify DARK_THEME is included in VT+ plan features", async () => {
        const { PLANS, PlanSlug, FeatureSlug } = await import("@repo/shared/types/subscription");

        // Verify VT+ plan includes dark theme feature
        const vtPlusPlan = PLANS[PlanSlug.VT_PLUS];
        expect(vtPlusPlan.features).toContain(FeatureSlug.DARK_THEME);
    });

    it("should verify dark mode is listed as free tier feature in pricing config", async () => {
        const { PRICING_CONFIG } = await import("@/lib/config/pricing");

        // Check that dark mode is mentioned in free tier features
        const freeFeatures = PRICING_CONFIG.pricing.free.features;
        const advancedFeaturesItem = freeFeatures.find(
            (feature) => feature.name === "All Advanced AI Features",
        );

        expect(advancedFeaturesItem).toBeDefined();
        expect(advancedFeaturesItem?.description).toContain("dark mode");
    });

    it("should verify useFeatureAccess hook properly handles DARK_THEME", async () => {
        // Import the subscription utilities to verify they handle DARK_THEME
        const { getRequiredPlanForFeature } = await import("@repo/shared/utils/subscription");
        const { FeatureSlug, PlanSlug } = await import("@repo/shared/types/subscription");

        // Verify that DARK_THEME requires VT_BASE plan (available to free tier)
        const requiredPlan = getRequiredPlanForFeature(FeatureSlug.DARK_THEME);
        expect(requiredPlan).toBe(PlanSlug.VT_BASE);
    });
});
