import { ChatMode } from '@repo/shared/config';
import { describe, expect, it } from 'vitest';
import { filterApiKeysForServerSide } from '../lib/ai-routing';

describe('AI Routing Security Tests', () => {
    describe('filterApiKeysForServerSide - Security Fix', () => {
        it('should keep Gemini key for BYOK Flash Lite server-side calls', () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: 'claude-key',
                OPENAI_API_KEY: 'openai-key',
                GEMINI_API_KEY: 'gemini-key',
                XAI_API_KEY: 'xai-key',

                DEEPSEEK_API_KEY: 'deepseek-key',
                FIREWORKS_API_KEY: 'fireworks-key',
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            };

            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_3_FLASH_LITE,
                false,
            );

            expect(result).toEqual({
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
                GEMINI_API_KEY: 'gemini-key',
            });
        });

        it('should keep only required provider key for BYOK models', () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: 'claude-key',
                OPENAI_API_KEY: 'openai-key',
                GEMINI_API_KEY: 'gemini-key',
                XAI_API_KEY: 'xai-key',
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            };

            // Test BYOK Claude model (should keep only ANTHROPIC_API_KEY)
            const claudeResult = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.CLAUDE_4_SONNET,
                false,
            );
            expect(claudeResult).toEqual({
                ANTHROPIC_API_KEY: 'claude-key',
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            });
            const claude45Result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.CLAUDE_SONNET_4_5,
                false,
            );
            expect(claude45Result).toEqual({
                ANTHROPIC_API_KEY: 'claude-key',
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            });

            // Test BYOK OpenAI model (should keep only OPENAI_API_KEY)
            const openaiResult = filterApiKeysForServerSide(apiKeys, ChatMode.GPT_4o_Mini, false);
            expect(openaiResult).toEqual({
                OPENAI_API_KEY: 'openai-key',
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            });
        });

        it('should handle empty API keys object', () => {
            const result = filterApiKeysForServerSide({}, ChatMode.GEMINI_3_FLASH_LITE, false);
            expect(result).toEqual({});
        });

        it('should handle object with only provider keys', () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: 'claude-key',
                OPENAI_API_KEY: 'openai-key',
            };

            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_3_FLASH_LITE,
                false,
            );
            expect(result).toEqual({});
        });

        it('should handle object with only non-provider keys', () => {
            const apiKeys = {
                SERP_API_KEY: 'serp-key',
                CUSTOM_API_KEY: 'custom-key',
            };

            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_3_FLASH_LITE,
                false,
            );
            expect(result).toEqual(apiKeys);
        });

        it('should prevent API key mixing security vulnerability', () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: 'user-claude-key',
                OPENAI_API_KEY: 'user-openai-key',
                GEMINI_API_KEY: 'user-gemini-key',
                IMPORTANT_NON_PROVIDER_KEY: 'should-keep-this',
            };

            const result = filterApiKeysForServerSide(apiKeys);

            // Critical: No provider keys should leak to server-side
            expect(Object.keys(result)).not.toContain('ANTHROPIC_API_KEY');
            expect(Object.keys(result)).not.toContain('OPENAI_API_KEY');
            expect(Object.keys(result)).not.toContain('GEMINI_API_KEY');

            // Should only keep non-provider keys
            expect(result).toEqual({
                IMPORTANT_NON_PROVIDER_KEY: 'should-keep-this',
            });
        });
    });
});
