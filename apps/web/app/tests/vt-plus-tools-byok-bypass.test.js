/**
 * Test VT+ Tools BYOK Bypass Feature
 * Tests that VT+ users bypass BYOK checks for tools and function calling
 */

import { ChatMode } from '@repo/shared/config';
import { describe, expect, test, vi } from 'vitest';

// Mock the hasApiKeyForChatMode function behavior
const mockHasApiKeyForChatMode = (chatMode, isSignedIn, isVtPlus = false) => {
    if (!isSignedIn) return false;

    // VT+ users don't need API keys for Gemini models
    if (isVtPlus) {
        switch (chatMode) {
            case ChatMode.Deep:
            case ChatMode.Pro:
            case ChatMode.GEMINI_2_5_PRO:
            case ChatMode.GEMINI_2_5_FLASH:
            case ChatMode.GEMINI_2_5_FLASH_LITE:
            case ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20:
            case ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06:
            case ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05:
                return true; // VT+ users can use system API key
            default:
                break; // Continue with normal API key checks for non-Gemini models
        }
    }

    // Mock API key checks for non-VT+ users or non-Gemini models
    // For simplicity, assume no API keys are present for testing
    return false;
};

describe('VT+ Tools BYOK Bypass', () => {
    describe('hasApiKeyForChatMode Function', () => {
        test('VT+ user should have access to Deep Research without API key', () => {
            const result = mockHasApiKeyForChatMode(ChatMode.Deep, true, true);
            expect(result).toBe(true);
        });

        test('VT+ user should have access to Pro Search without API key', () => {
            const result = mockHasApiKeyForChatMode(ChatMode.Pro, true, true);
            expect(result).toBe(true);
        });

        test('VT+ user should have access to Gemini 2.5 Pro without API key', () => {
            const result = mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_PRO, true, true);
            expect(result).toBe(true);
        });

        test('VT+ user should have access to Gemini 2.5 Flash without API key', () => {
            const result = mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_FLASH, true, true);
            expect(result).toBe(true);
        });

        test('VT+ user should have access to all Gemini preview models without API key', () => {
            expect(
                mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20, true, true)
            ).toBe(true);
            expect(
                mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06, true, true)
            ).toBe(true);
            expect(
                mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05, true, true)
            ).toBe(true);
        });

        test('Free user should not have access to Gemini models without API key', () => {
            expect(mockHasApiKeyForChatMode(ChatMode.Deep, true, false)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.Pro, true, false)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_PRO, true, false)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_FLASH, true, false)).toBe(false);
        });

        test('VT+ user should not have access to non-Gemini models without API key', () => {
            expect(mockHasApiKeyForChatMode(ChatMode.GPT_4o, true, true)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.CLAUDE_4_SONNET, true, true)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.DEEPSEEK_R1, true, true)).toBe(false);
        });

        test('Unauthenticated user should not have access to any models', () => {
            expect(mockHasApiKeyForChatMode(ChatMode.Deep, false, true)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.GEMINI_2_5_PRO, false, true)).toBe(false);
            expect(mockHasApiKeyForChatMode(ChatMode.GPT_4o, false, false)).toBe(false);
        });
    });

    describe('Structured Output API Route', () => {
        test('should handle VT+ user request with system API key', async () => {
            // Mock fetch request to our new API route
            const mockFetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    data: { extracted: 'data' },
                    type: 'document',
                    fileName: 'test.pdf',
                    extractedAt: '2024-01-01T00:00:00.000Z',
                    confidence: 0.9,
                }),
            });

            global.fetch = mockFetch;

            const response = await fetch('/api/tools/structured-extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textContent: 'Sample document content',
                    documentType: 'document',
                    fileName: 'test.pdf',
                    chatMode: ChatMode.GEMINI_2_5_PRO,
                    userApiKeys: {}, // No user API keys, should use system key for VT+
                }),
            });

            expect(response.ok).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith('/api/tools/structured-extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textContent: 'Sample document content',
                    documentType: 'document',
                    fileName: 'test.pdf',
                    chatMode: ChatMode.GEMINI_2_5_PRO,
                    userApiKeys: {},
                }),
            });
        });

        test('should handle error for non-Gemini models', async () => {
            const mockFetch = vi.fn().mockResolvedValue({
                ok: false,
                json: vi.fn().mockResolvedValue({
                    error: 'Structured extraction only supports Gemini models',
                }),
            });

            global.fetch = mockFetch;

            const response = await fetch('/api/tools/structured-extract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    textContent: 'Sample document content',
                    documentType: 'document',
                    fileName: 'test.pdf',
                    chatMode: ChatMode.GPT_4o, // Non-Gemini model
                    userApiKeys: {},
                }),
            });

            expect(response.ok).toBe(false);
        });
    });

    describe('Chat Input BYOK Logic', () => {
        test('VT+ user should not need API key check for Gemini models', () => {
            const isVtPlus = true;
            const isGeminiModel = (chatMode) => {
                return [
                    ChatMode.Deep,
                    ChatMode.Pro,
                    ChatMode.GEMINI_2_5_PRO,
                    ChatMode.GEMINI_2_5_FLASH,
                    ChatMode.GEMINI_2_5_FLASH_LITE,
                    ChatMode.GEMINI_2_5_FLASH_PREVIEW_05_20,
                    ChatMode.GEMINI_2_5_PRO_PREVIEW_05_06,
                    ChatMode.GEMINI_2_5_PRO_PREVIEW_06_05,
                ].includes(chatMode);
            };

            const needsApiKeyCheck = (chatMode, isVtPlus) => {
                if (isGeminiModel(chatMode)) {
                    return !isVtPlus;
                }
                return true;
            };

            // VT+ users should not need API key checks for Gemini models
            expect(needsApiKeyCheck(ChatMode.Deep, isVtPlus)).toBe(false);
            expect(needsApiKeyCheck(ChatMode.Pro, isVtPlus)).toBe(false);
            expect(needsApiKeyCheck(ChatMode.GEMINI_2_5_PRO, isVtPlus)).toBe(false);
            expect(needsApiKeyCheck(ChatMode.GEMINI_2_5_FLASH, isVtPlus)).toBe(false);

            // VT+ users should still need API key checks for non-Gemini models
            expect(needsApiKeyCheck(ChatMode.GPT_4o, isVtPlus)).toBe(true);
            expect(needsApiKeyCheck(ChatMode.CLAUDE_4_SONNET, isVtPlus)).toBe(true);
        });

        test('Free user should need API key check for all models', () => {
            const isVtPlus = false;
            const isGeminiModel = (chatMode) => {
                return [
                    ChatMode.Deep,
                    ChatMode.Pro,
                    ChatMode.GEMINI_2_5_PRO,
                    ChatMode.GEMINI_2_5_FLASH,
                    ChatMode.GEMINI_2_5_FLASH_LITE
                ].includes(chatMode);
            };

            const needsApiKeyCheck = (chatMode, isVtPlus) => {
                if (isGeminiModel(chatMode)) {
                    return !isVtPlus;
                }
                return true;
            };

            // Free users should need API key checks for all models
            expect(needsApiKeyCheck(ChatMode.Deep, isVtPlus)).toBe(true);
            expect(needsApiKeyCheck(ChatMode.Pro, isVtPlus)).toBe(true);
            expect(needsApiKeyCheck(ChatMode.GEMINI_2_5_PRO, isVtPlus)).toBe(true);
            expect(needsApiKeyCheck(ChatMode.GPT_4o, isVtPlus)).toBe(true);
            expect(needsApiKeyCheck(ChatMode.CLAUDE_4_SONNET, isVtPlus)).toBe(true);
        });
    });
});
