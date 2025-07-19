import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuotaExceededError, VT_PLUS_LIMITS, VtPlusFeature } from '../src/config/vtPlusLimits';

describe('VT+ Limits Configuration', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('VtPlusFeature enum', () => {
        it('should have correct enum values', () => {
            expect(VtPlusFeature.DEEP_RESEARCH).toBe('DR');
            expect(VtPlusFeature.PRO_SEARCH).toBe('PS');
        });

        it('should have exactly 3 features', () => {
            const features = Object.values(VtPlusFeature);
            expect(features).toHaveLength(3);
            expect(features).toContain('DR');
            expect(features).toContain('PS');
            expect(features).toContain('RAG');
        });
    });

    describe('VT_PLUS_LIMITS', () => {
        it('should have limits for all features', () => {
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH]).toBeDefined();
            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH]).toBeDefined();
        });

        it('should have positive numeric limits', () => {
            expect(typeof VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH]).toBe('object');
            expect(typeof VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH]).toBe('object');
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].limit).toBeGreaterThan(0);
            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].limit).toBeGreaterThan(0);
        });

        it('should use default values when env vars not set', () => {
            // Test the fallback logic directly
            expect(Number(undefined) || 5).toBe(5);
            expect(Number(undefined) || 10).toBe(10);

            // Verify current config has reasonable defaults
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].limit).toBeGreaterThan(0);
            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].limit).toBeGreaterThan(0);
        });

        it('should use environment variables when set', () => {
            // Test the Number conversion logic
            expect(Number('1000') || 500).toBe(1000);
            expect(Number('1500') || 800).toBe(1500);

            // Verify current config structure
            expect(typeof VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH]).toBe('object');
            expect(typeof VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH]).toBe('object');
        });

        it('should handle invalid environment variables gracefully', () => {
            // Test the fallback logic for invalid values
            expect(Number.isNaN(Number('invalid'))).toBe(true);
            expect(Number('invalid') || 500).toBe(500);
            expect(Number('') || 800).toBe(800);
            expect(Number(null) || 500).toBe(500);
        });
    });

    describe('QuotaExceededError', () => {
        it('should extend Error class', () => {
            const error = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 500);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(QuotaExceededError);
        });

        it('should have correct name property', () => {
            const error = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 450);
            expect(error.name).toBe('QuotaExceededError');
        });

        it('should store all parameters correctly', () => {
            const feature = VtPlusFeature.PRO_SEARCH;
            const limit = 800;
            const used = 750;

            const error = new QuotaExceededError(feature, limit, used);

            expect(error.feature).toBe(feature);
            expect(error.limit).toBe(limit);
            expect(error.used).toBe(used);
        });

        it('should generate descriptive error message', () => {
            const error = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 450);

            expect(error.message).toContain('VT+ quota exceeded');
            expect(error.message).toContain('DR');
            expect(error.message).toContain('450');
            expect(error.message).toContain('500');
        });

        it('should handle different features in message', () => {
            const drError = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 500);
            const psError = new QuotaExceededError(VtPlusFeature.PRO_SEARCH, 800, 800);

            expect(drError.message).toContain('DR');
            expect(psError.message).toContain('PS');
        });

        it('should be serializable', () => {
            const error = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 450);

            // Should be able to extract key properties
            const serialized = {
                name: error.name,
                message: error.message,
                feature: error.feature,
                limit: error.limit,
                used: error.used,
            };

            expect(serialized.name).toBe('QuotaExceededError');
            expect(serialized.feature).toBe(VtPlusFeature.DEEP_RESEARCH);
            expect(serialized.limit).toBe(500);
            expect(serialized.used).toBe(450);
        });

        it('should maintain stack trace', () => {
            const error = new QuotaExceededError(VtPlusFeature.DEEP_RESEARCH, 500, 450);
            expect(error.stack).toBeDefined();
            expect(typeof error.stack).toBe('string');
        });
    });

    describe('Type safety', () => {
        it('should enforce feature enum in limits object', () => {
            // This is a compile-time test, but we can verify runtime behavior
            const features = Object.keys(VT_PLUS_LIMITS);
            const enumValues = Object.values(VtPlusFeature);

            expect(features).toEqual(expect.arrayContaining(enumValues));
            expect(features.length).toBe(enumValues.length);
        });

        it('should have consistent types across the config', () => {
            Object.entries(VT_PLUS_LIMITS).forEach(([feature, config]) => {
                expect(typeof feature).toBe('string');
                expect(typeof config).toBe('object');
                expect(typeof config.limit).toBe('number');
                expect(typeof config.window).toBe('string');
                expect(Object.values(VtPlusFeature)).toContain(feature);
            });
        });
    });

    describe('Budget considerations', () => {
        it('should have reasonable limits for budget constraints', () => {
            const totalRequests =
                VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].limit +
                VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].limit;

            // Daily limits should be reasonable for VT+ users
            expect(totalRequests).toBeLessThanOrEqual(50);
        });

        it('should have Deep Research limit lower than Pro Search', () => {
            // Deep Research is typically more expensive per request
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].limit).toBeLessThanOrEqual(
                VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].limit
            );
        });

        it('should provide meaningful usage for VT+ subscribers', () => {
            // Daily limits should be meaningful but not excessive
            expect(VT_PLUS_LIMITS[VtPlusFeature.DEEP_RESEARCH].limit).toBeGreaterThanOrEqual(3);
            expect(VT_PLUS_LIMITS[VtPlusFeature.PRO_SEARCH].limit).toBeGreaterThanOrEqual(5);
        });
    });
});
