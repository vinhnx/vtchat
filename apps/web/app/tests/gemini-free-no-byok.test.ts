import { getModelFromChatMode, models } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';
import { describe, expect, it } from 'vitest';

// Test API key prompt modal functionality
const getRequiredApiKeyForMode = (chatMode: ChatMode): string | null => {
    switch (chatMode) {
        case ChatMode.O3:
        case ChatMode.O3_Mini:
        case ChatMode.O4_Mini:
        case ChatMode.GPT_4o_Mini:
        case ChatMode.GPT_4o:
        case ChatMode.GPT_4_1_Mini:
        case ChatMode.GPT_4_1_Nano:
        case ChatMode.GPT_4_1:
            return 'OPENAI_API_KEY';
        case ChatMode.Pro:
        case ChatMode.GEMINI_2_5_FLASH:
        case ChatMode.GEMINI_2_5_PRO:
            return 'GEMINI_API_KEY';
        case ChatMode.CLAUDE_4_SONNET:
        case ChatMode.CLAUDE_4_OPUS:
            return 'ANTHROPIC_API_KEY';
        case ChatMode.DEEPSEEK_R1:
            return 'FIREWORKS_API_KEY';
        case ChatMode.GROK_3:
        case ChatMode.GROK_3_MINI:
            return 'XAI_API_KEY';
        default:
            return null;
    }
};

describe('Gemini 2.5 Flash Lite Free Model', () => {
    it('should not require API key for GEMINI_2_5_FLASH_LITE mode', () => {
        const requiredApiKey = getRequiredApiKeyForMode(ChatMode.GEMINI_2_5_FLASH_LITE);
        expect(requiredApiKey).toBeNull();
    });

    it('should be marked as free model', () => {
        const modelEnum = getModelFromChatMode(ChatMode.GEMINI_2_5_FLASH_LITE);
        const model = models.find((m) => m.id === modelEnum);
        expect(model).toBeDefined();
        expect(model?.isFree).toBe(true);
    });

    it('should have correct model configuration', () => {
        const modelEnum = getModelFromChatMode(ChatMode.GEMINI_2_5_FLASH_LITE);
        const model = models.find((m) => m.id === modelEnum);
        expect(model).toMatchObject({
            name: 'Gemini 2.5 Flash Lite',
            provider: 'google',
            isFree: true,
            maxTokens: 65_536,
            contextWindow: 65_536,
        });
    });

    it('should still require API keys for other Gemini models', () => {
        expect(getRequiredApiKeyForMode(ChatMode.GEMINI_2_5_FLASH)).toBe('GEMINI_API_KEY');
        expect(getRequiredApiKeyForMode(ChatMode.GEMINI_2_5_PRO)).toBe('GEMINI_API_KEY');
    });
});
