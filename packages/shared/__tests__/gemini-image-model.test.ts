import { ModelEnum, models } from '@repo/ai/models';
import { describe, expect, test } from 'vitest';

describe('Gemini image model registration', () => {
    test('includes gemini-3-flash-image with google provider', () => {
        const model = models.find((m) => m.id === ModelEnum.GEMINI_3_FLASH_IMAGE);
        expect(model).toBeTruthy();
        expect(model?.provider).toBe('google');
    });
});
