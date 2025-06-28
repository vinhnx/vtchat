import { describe, it, expect } from 'vitest';

describe('Dark Mode Feature Configuration', () => {
    it('should verify DARK_THEME feature exists in FeatureSlug', async () => {
        const { FeatureSlug } = await import('@repo/shared/types/subscription');
        
        // Verify DARK_THEME feature exists and has correct value
        expect(FeatureSlug.DARK_THEME).toBe('dark_theme');
        expect(Object.values(FeatureSlug)).toContain('dark_theme');
    });

    it('should verify DARK_THEME is configured in VT+ features', async () => {
        const { VT_PLUS_FEATURES } = await import('@repo/shared/config/vt-plus-features');
        const { FeatureSlug } = await import('@repo/shared/types/subscription');
        
        // Verify dark theme is in VT+ features
        expect(VT_PLUS_FEATURES[FeatureSlug.DARK_THEME]).toBeDefined();
        expect(VT_PLUS_FEATURES[FeatureSlug.DARK_THEME]?.id).toBe(FeatureSlug.DARK_THEME);
        expect(VT_PLUS_FEATURES[FeatureSlug.DARK_THEME]?.name).toBe('Dark Theme');
    });

    it('should verify DARK_THEME is included in VT+ plan features', async () => {
        const { PLANS, PlanSlug, FeatureSlug } = await import('@repo/shared/types/subscription');
        
        // Verify VT+ plan includes dark theme feature
        const vtPlusPlan = PLANS[PlanSlug.VT_PLUS];
        expect(vtPlusPlan.features).toContain(FeatureSlug.DARK_THEME);
    });

    it('should verify dark mode is listed as VT+ feature in pricing config', async () => {
        const { PRICING_CONFIG } = await import('@/lib/config/pricing');
        
        // Check that dark mode is mentioned in VT+ features
        const plusFeatures = PRICING_CONFIG.pricing.plus.features;
        const darkModeFeature = plusFeatures.find(feature => 
            feature.name === 'Dark Mode'
        );
        
        expect(darkModeFeature).toBeDefined();
        expect(darkModeFeature?.description).toBe('Access to beautiful dark mode interface');
    });

    it('should verify useFeatureAccess hook properly handles DARK_THEME', async () => {
        // Import the subscription utilities to verify they handle DARK_THEME
        const { getRequiredPlanForFeature } = await import('@repo/shared/utils/subscription');
        const { FeatureSlug, PlanSlug } = await import('@repo/shared/types/subscription');
        
        // Verify that DARK_THEME requires VT_PLUS plan
        const requiredPlan = getRequiredPlanForFeature(FeatureSlug.DARK_THEME);
        expect(requiredPlan).toBe(PlanSlug.VT_PLUS);
    });
});
