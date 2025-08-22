import { ChatMode } from '@repo/shared/config';
import { describe, expect, it } from 'vitest';
import { ModelEnum, models } from '../models';

describe('AI SDK v5 Migration - Gemini 2.5 Models', () => {
    it('should have Gemini 2.5 Pro model configured', () => {
        const model = models.find(m => m.id === ModelEnum.GEMINI_2_5_PRO);
        expect(model).toBeDefined();
        expect(model?.name).toBe('Gemini 2.5 Pro');
        expect(model?.provider).toBe('google');
    });

    it('should have Gemini 2.5 Flash model configured', () => {
        const model = models.find(m => m.id === ModelEnum.GEMINI_2_5_FLASH);
        expect(model).toBeDefined();
        expect(model?.name).toBe('Gemini 2.5 Flash');
        expect(model?.provider).toBe('google');
    });

    it('should have Gemini 2.5 Flash Lite model configured', () => {
        const model = models.find(m => m.id === ModelEnum.GEMINI_2_5_FLASH_LITE);
        expect(model).toBeDefined();
        expect(model?.name).toBe('Gemini 2.5 Flash Lite');
        expect(model?.provider).toBe('google');
    });

    it('should have proper context windows for Gemini 2.5 models', () => {
        const proModel = models.find(m => m.id === ModelEnum.GEMINI_2_5_PRO);
        const flashModel = models.find(m => m.id === ModelEnum.GEMINI_2_5_FLASH);
        const liteModel = models.find(m => m.id === ModelEnum.GEMINI_2_5_FLASH_LITE);

        // Verify context windows are properly set
        expect(proModel?.maxTokens).toBeGreaterThan(0);
        expect(flashModel?.maxTokens).toBeGreaterThan(0);
        expect(liteModel?.maxTokens).toBeGreaterThan(0);

        // Verify context windows are substantial for the new models
        expect(proModel?.contextWindow).toBeGreaterThan(1_000_000); // Gemini 2.5 Pro has large context
        expect(flashModel?.contextWindow).toBeGreaterThan(1_000_000); // Gemini 2.5 Flash has large context
    });

    it('should map ChatMode to ModelEnum correctly for Gemini 2.5 models', () => {
        // Test that the mapping between ChatMode and ModelEnum works
        expect(ChatMode.GEMINI_2_5_PRO).toBe('gemini-2.5-pro');
        expect(ChatMode.GEMINI_2_5_FLASH).toBe('gemini-2.5-flash');
        expect(ChatMode.GEMINI_2_5_FLASH_LITE).toBe('gemini-2.5-flash-lite');

        expect(ModelEnum.GEMINI_2_5_PRO).toBe('gemini-2.5-pro');
        expect(ModelEnum.GEMINI_2_5_FLASH).toBe('gemini-2.5-flash');
        expect(ModelEnum.GEMINI_2_5_FLASH_LITE).toBe('gemini-2.5-flash-lite');
    });
});
