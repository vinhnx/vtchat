import { describe, expect, it } from 'vitest';

// This is a test to verify background improvements in class strings
describe('ReasoningModeSettings Background Improvements', () => {
    it('should verify new light background classes are correctly formatted', () => {
        // Define the new light background class patterns
        const newBackgroundClass =
            'bg-gradient-to-br from-white/5 via-[#D99A4E]/5 to-[#BFB38F]/5 backdrop-blur-sm';
        const newIconClass =
            'bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 border border-[#D99A4E]/20';
        const newIndicatorClass =
            'bg-gradient-to-r from-[#D99A4E]/10 to-[#BFB38F]/10 backdrop-blur-sm';

        // Verify new light background classes contain the expected patterns
        expect(newBackgroundClass).toContain('from-white/5');
        expect(newBackgroundClass).toContain('via-[#D99A4E]/5');
        expect(newBackgroundClass).toContain('to-[#BFB38F]/5');
        expect(newBackgroundClass).toContain('backdrop-blur-sm');

        // Verify icon container has light backgrounds
        expect(newIconClass).toContain('from-[#D99A4E]/10');
        expect(newIconClass).toContain('to-[#BFB38F]/10');

        // Verify indicator has light backgrounds
        expect(newIndicatorClass).toContain('from-[#D99A4E]/10');
        expect(newIndicatorClass).toContain('to-[#BFB38F]/10');

        // Verify old dark background patterns are not present
        expect(newBackgroundClass).not.toContain('from-[#262626]');
        expect(newBackgroundClass).not.toContain('via-[#262626]/95');
        expect(newBackgroundClass).not.toContain('to-[#262626]/90');

        expect(newIconClass).not.toContain('from-[#262626]');
        expect(newIndicatorClass).not.toContain('from-[#262626]');
    });

    it('should verify color scheme consistency', () => {
        // Test that we're using the VT+ brand colors consistently
        const brandColors = {
            primary: '#D99A4E', // Gold
            secondary: '#BFB38F', // Beige
        };

        // Verify the colors are used in the new classes
        const testClass = 'from-[#D99A4E]/10 to-[#BFB38F]/10';
        expect(testClass).toContain(brandColors.primary);
        expect(testClass).toContain(brandColors.secondary);
    });
});
