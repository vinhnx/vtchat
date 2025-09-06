import { ModelEnum, models } from '@repo/ai/models';
import { describe, expect, test } from 'vitest';

describe('Gemini image-preview model registration', () => {
    test('includes gemini-2.5-flash-image-preview with google provider', () => {
        const model = models.find((m) => m.id === ModelEnum.GEMINI_2_5_FLASH_IMAGE_PREVIEW);
        expect(model).toBeTruthy();
        expect(model?.provider).toBe('google');
    });
});
