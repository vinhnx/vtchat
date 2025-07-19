/**
 * Test file to verify that anonymous users cannot access free tier features
 * These features should require authentication (logged-in users)
 */

import { FeatureSlug, PLANS, PlanSlug } from "@repo/shared/types/subscription";
import { describe, expect, it } from "vitest";

describe("Anonymous User Restrictions", () => {
    it("should have restricted ANONYMOUS plan with only basic features", () => {
        const anonymousPlan = PLANS[PlanSlug.ANONYMOUS];

        expect(anonymousPlan).toBeDefined();
        expect(anonymousPlan.slug).toBe(PlanSlug.ANONYMOUS);
        expect(anonymousPlan.name).toBe("Anonymous");

        // Should only have basic features
        const allowedFeatures = [
            FeatureSlug.ACCESS_CHAT,
            FeatureSlug.BASE_MODELS,
            FeatureSlug.MATH_CALCULATOR,
        ];

        expect(anonymousPlan.features).toEqual(allowedFeatures);

        // Should NOT have advanced features
        const restrictedFeatures = [
            FeatureSlug.DARK_THEME,
            FeatureSlug.THINKING_MODE,
            FeatureSlug.THINKING_MODE_TOGGLE,
            FeatureSlug.STRUCTURED_OUTPUT,
            FeatureSlug.DOCUMENT_PARSING,
            FeatureSlug.REASONING_CHAIN,
            FeatureSlug.GEMINI_EXPLICIT_CACHING,
            FeatureSlug.CHART_VISUALIZATION,
            FeatureSlug.MULTI_MODAL_CHAT,
        ];

        restrictedFeatures.forEach((feature) => {
            expect(anonymousPlan.features).not.toContain(feature);
        });
    });

    it("should have VT_BASE plan with advanced features for logged-in users", () => {
        const basePlan = PLANS[PlanSlug.VT_BASE];

        expect(basePlan).toBeDefined();
        expect(basePlan.slug).toBe(PlanSlug.VT_BASE);

        // Should have all the advanced features that are now free for logged-in users
        const freeAdvancedFeatures = [
            FeatureSlug.DARK_THEME,
            FeatureSlug.THINKING_MODE,
            FeatureSlug.THINKING_MODE_TOGGLE,
            FeatureSlug.STRUCTURED_OUTPUT,
            FeatureSlug.DOCUMENT_PARSING,
            FeatureSlug.REASONING_CHAIN,
            FeatureSlug.GEMINI_EXPLICIT_CACHING,
            FeatureSlug.CHART_VISUALIZATION,
            FeatureSlug.MULTI_MODAL_CHAT,
        ];

        freeAdvancedFeatures.forEach((feature) => {
            expect(basePlan.features).toContain(feature);
        });
    });

    it("should ensure VT+ plan still has exclusive features", () => {
        const plusPlan = PLANS[PlanSlug.VT_PLUS];

        expect(plusPlan).toBeDefined();
        expect(plusPlan.slug).toBe(PlanSlug.VT_PLUS);

        // Should have VT+ exclusive features
        const exclusiveFeatures = [
            FeatureSlug.PRO_SEARCH,
            FeatureSlug.DEEP_RESEARCH,
            FeatureSlug.RAG,
        ];

        exclusiveFeatures.forEach((feature) => {
            expect(plusPlan.features).toContain(feature);
        });
    });

    it("should verify plan hierarchy is correct", () => {
        const anonymousPlan = PLANS[PlanSlug.ANONYMOUS];
        const basePlan = PLANS[PlanSlug.VT_BASE];
        const plusPlan = PLANS[PlanSlug.VT_PLUS];

        // Anonymous should have the fewest features
        expect(anonymousPlan.features.length).toBeLessThan(basePlan.features.length);

        // VT+ should have the most features
        expect(basePlan.features.length).toBeLessThan(plusPlan.features.length);

        // No plan should be marked as default except VT_BASE
        expect(anonymousPlan.isDefault).toBeFalsy();
        expect(basePlan.isDefault).toBeTruthy();
        expect(plusPlan.isDefault).toBeFalsy();
    });
});
