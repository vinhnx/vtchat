/**
 * Test VT+ Gemini BYOK Bypass Feature
 * Tests that VT+ users bypass BYOK checks for all Gemini models
 */

import { ChatMode } from '@repo/shared/config';
import { GEMINI_CHAT_MODES } from '@repo/shared/utils';
import { describe, expect, test } from 'vitest';

// Mock the chat input component's logic
const mockIsGeminiModel = (chatMode) => {
    return GEMINI_CHAT_MODES.includes(chatMode);
};

const mockNeedsApiKeyCheck = (chatMode, isPlusTier) => {
    const isGeminiModel = mockIsGeminiModel(chatMode);
    if (isGeminiModel) {
        // VT+ users don't need API keys for any Gemini models
        return !isPlusTier;
    }
    return true;
};

describe('VT+ Gemini BYOK Bypass', () => {
    test('VT+ users should not need API key check for Deep Research', () => {
        const isPlusTier = true;
        const needsApiKeyCheck = mockNeedsApiKeyCheck(ChatMode.Deep, isPlusTier);
        expect(needsApiKeyCheck).toBe(false);
    });

    test('VT+ users should not need API key check for Pro Search', () => {
        const isPlusTier = true;
        const needsApiKeyCheck = mockNeedsApiKeyCheck(ChatMode.Pro, isPlusTier);
        expect(needsApiKeyCheck).toBe(false);
    });

    test('VT+ users should not need API key check for Gemini 2.5 Pro', () => {
        const isPlusTier = true;
        const needsApiKeyCheck = mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_PRO, isPlusTier);
        expect(needsApiKeyCheck).toBe(false);
    });

    test('VT+ users should not need API key check for Gemini 2.5 Flash', () => {
        const isPlusTier = true;
        const needsApiKeyCheck = mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_FLASH, isPlusTier);
        expect(needsApiKeyCheck).toBe(false);
    });

    test('VT+ users should not need API key check for Gemini 2.5 Flash Lite', () => {
        const isPlusTier = true;
        const needsApiKeyCheck = mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_FLASH_LITE, isPlusTier);
        expect(needsApiKeyCheck).toBe(false);
    });

    test('Free users should need API key check for Gemini models (except free model)', () => {
        const isPlusTier = false;

        expect(mockNeedsApiKeyCheck(ChatMode.Deep, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.Pro, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_PRO, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_FLASH, isPlusTier)).toBe(true);
    });

    test('VT+ users should still need API key check for non-Gemini models', () => {
        const isPlusTier = true;

        expect(mockNeedsApiKeyCheck(ChatMode.GPT_4o, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.CLAUDE_4_SONNET, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.DEEPSEEK_R1, isPlusTier)).toBe(true);
    });

    test('Free users should need API key check for all models that require keys', () => {
        const isPlusTier = false;

        expect(mockNeedsApiKeyCheck(ChatMode.GPT_4o, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.CLAUDE_4_SONNET, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.DEEPSEEK_R1, isPlusTier)).toBe(true);
        expect(mockNeedsApiKeyCheck(ChatMode.GEMINI_2_5_PRO, isPlusTier)).toBe(true);
    });

    test('Gemini model detection should work correctly', () => {
        // Should detect Gemini models
        expect(mockIsGeminiModel(ChatMode.Deep)).toBe(true);
        expect(mockIsGeminiModel(ChatMode.Pro)).toBe(true);
        expect(mockIsGeminiModel(ChatMode.GEMINI_2_5_PRO)).toBe(true);
        expect(mockIsGeminiModel(ChatMode.GEMINI_2_5_FLASH)).toBe(true);
        expect(mockIsGeminiModel(ChatMode.GEMINI_2_5_FLASH_LITE)).toBe(true);

        // Should not detect non-Gemini models
        expect(mockIsGeminiModel(ChatMode.GPT_4o)).toBe(false);
        expect(mockIsGeminiModel(ChatMode.CLAUDE_4_SONNET)).toBe(false);
        expect(mockIsGeminiModel(ChatMode.DEEPSEEK_R1)).toBe(false);
    });
});
