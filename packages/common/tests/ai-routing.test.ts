import { ChatMode } from '@repo/shared/config';
import { describe, expect, it } from 'vitest';
import {
    filterApiKeysForServerSide,
    getProviderKeyToRemove,
    needsServerSideForPlus,
    shouldUseServerSideAPI,
} from '../lib/ai-routing';

describe('shouldUseServerSideAPI', () => {
    describe('Free tier models', () => {
        it('should route free models to server-side for all users', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GEMINI_2_5_FLASH_LITE,
                    hasVtPlus: false,
                }),
            ).toBe(true);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GEMINI_2_5_FLASH_LITE,
                    hasVtPlus: true,
                }),
            ).toBe(true);
        });
    });

    describe('VT+ models', () => {
        it('should route VT+ models to server-side for VT+ users', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.CLAUDE_4_SONNET,
                    hasVtPlus: true,
                }),
            ).toBe(true);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GPT_4o,
                    hasVtPlus: true,
                }),
            ).toBe(true);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GEMINI_2_5_FLASH_LITE,
                    hasVtPlus: true,
                }),
            ).toBe(true);
        });

        it('should not route VT+ models to server-side for free users', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.CLAUDE_4_SONNET,
                    hasVtPlus: false,
                }),
            ).toBe(false);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GPT_4o,
                    hasVtPlus: false,
                }),
            ).toBe(false);
        });
    });

    describe('VT+ exclusive features', () => {
        it('should route Deep Research to server-side regardless of user tier', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.CLAUDE_4_SONNET,
                    hasVtPlus: false,
                    deepResearch: true,
                }),
            ).toBe(true);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GPT_4o,
                    hasVtPlus: true,
                    deepResearch: true,
                }),
            ).toBe(true);
        });

        it('should route Pro Search to server-side regardless of user tier', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.CLAUDE_4_SONNET,
                    hasVtPlus: false,
                    proSearch: true,
                }),
            ).toBe(true);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GPT_4o,
                    hasVtPlus: true,
                    proSearch: true,
                }),
            ).toBe(true);
        });
    });

    describe('BYOK scenarios', () => {
        it('should use client-side for BYOK users with non-server models', () => {
            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.CLAUDE_4_SONNET,
                    hasVtPlus: false,
                }),
            ).toBe(false);

            expect(
                shouldUseServerSideAPI({
                    mode: ChatMode.GPT_4o,
                    hasVtPlus: false,
                }),
            ).toBe(false);
        });
    });
});

describe('needsServerSideForPlus', () => {
    it('should identify VT+ server models correctly', () => {
        expect(needsServerSideForPlus(ChatMode.CLAUDE_4_SONNET)).toBe(true);
        expect(needsServerSideForPlus(ChatMode.GPT_4o)).toBe(true);
        expect(needsServerSideForPlus(ChatMode.GEMINI_2_5_FLASH_LITE)).toBe(false);
        expect(needsServerSideForPlus(ChatMode.DEEPSEEK_R1)).toBe(true);
    });
});

describe('getProviderKeyToRemove', () => {
    it('should identify correct API key to remove', () => {
        expect(getProviderKeyToRemove(ChatMode.CLAUDE_4_SONNET)).toBe('ANTHROPIC_API_KEY');
        expect(getProviderKeyToRemove(ChatMode.GPT_4o)).toBe('OPENAI_API_KEY');
        expect(getProviderKeyToRemove(ChatMode.GEMINI_2_5_FLASH_LITE)).toBe('GEMINI_API_KEY');
    });
});

describe('filterApiKeysForServerSide', () => {
    it('should remove the correct API key for server-side calls', () => {
        const apiKeys = {
            ANTHROPIC_API_KEY: 'sk-ant-123',
            OPENAI_API_KEY: 'sk-123',
            GEMINI_API_KEY: 'AIza123',
            OTHER_KEY: 'other',
        };

        const claudeFiltered = filterApiKeysForServerSide(apiKeys, ChatMode.CLAUDE_4_SONNET);
        expect(claudeFiltered).toEqual({
            OPENAI_API_KEY: 'sk-123',
            GEMINI_API_KEY: 'AIza123',
            OTHER_KEY: 'other',
        });

        const gptFiltered = filterApiKeysForServerSide(apiKeys, ChatMode.GPT_4o);
        expect(gptFiltered).toEqual({
            ANTHROPIC_API_KEY: 'sk-ant-123',
            GEMINI_API_KEY: 'AIza123',
            OTHER_KEY: 'other',
        });
    });
});
