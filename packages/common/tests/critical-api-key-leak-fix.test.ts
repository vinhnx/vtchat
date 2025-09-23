import { ChatMode } from '@repo/shared/config';
import { describe, expect, it } from 'vitest';
import { filterApiKeysForServerSide } from '../lib/ai-routing';

describe('CRITICAL API Key Leak Fix', () => {
    const mockApiKeys = {
        OPENAI_API_KEY: 'sk-openai-test',
        ANTHROPIC_API_KEY: 'sk-ant-test',
        GEMINI_API_KEY: 'sk-gemini-test',
        XAI_API_KEY: 'sk-xai-test',
        OPENROUTER_API_KEY: 'sk-or-v1-test',
        TOGETHER_API_KEY: 'sk-together-test',
        FIREWORKS_API_KEY: 'sk-fw-test',
        SERP_API_KEY: 'serp-test', // Non-provider key should remain
    };

    it('should keep Gemini API key for BYOK Flash Lite requests', () => {
        const mode = ChatMode.GEMINI_2_5_FLASH_LITE;
        const isServerManaged = false;

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerManaged);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
            GEMINI_API_KEY: 'sk-gemini-test',
        });
    });

    it('should remove ALL provider API keys for VT+ Gemini Pro models', () => {
        const mode = ChatMode.GEMINI_2_5_PRO;
        const isServerFunded = true;

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerFunded);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
        });
        expect(result).not.toHaveProperty('OPENROUTER_API_KEY');
    });

    it('should remove ALL provider API keys for VT+ Gemini Flash models', () => {
        const mode = ChatMode.GEMINI_2_5_FLASH;
        const isServerFunded = true;

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerFunded);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
        });
        expect(result).not.toHaveProperty('OPENROUTER_API_KEY');
    });

    it('should keep only required provider key for BYOK OpenRouter models', () => {
        const mode = ChatMode.KIMI_K2; // OpenRouter model
        const isServerFunded = false; // BYOK

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerFunded);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
            OPENROUTER_API_KEY: 'sk-or-v1-test',
        });

        // Should not contain other provider keys
        expect(result).not.toHaveProperty('OPENAI_API_KEY');
        expect(result).not.toHaveProperty('ANTHROPIC_API_KEY');
        expect(result).not.toHaveProperty('GEMINI_API_KEY');
    });

    it('should keep only required provider key for BYOK GPT models', () => {
        const mode = ChatMode.GPT_4o;
        const isServerFunded = false;

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerFunded);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
            OPENAI_API_KEY: 'sk-openai-test',
        });

        expect(result).not.toHaveProperty('OPENROUTER_API_KEY');
    });

    it('should keep only required provider key for BYOK Grok models', () => {
        const mode = ChatMode.GROK_4;
        const isServerFunded = false;

        const result = filterApiKeysForServerSide(mockApiKeys, mode, isServerFunded);

        expect(result).toEqual({
            SERP_API_KEY: 'serp-test',
            XAI_API_KEY: 'sk-xai-test',
        });

        expect(result).not.toHaveProperty('OPENROUTER_API_KEY');
    });

    it('REGRESSION TEST: empty API keys should work without errors', () => {
        const result = filterApiKeysForServerSide({}, ChatMode.GEMINI_2_5_FLASH_LITE, false);
        expect(result).toEqual({});
    });
});
