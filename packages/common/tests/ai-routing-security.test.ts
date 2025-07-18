import { ChatMode } from "@repo/shared/config";
import { describe, expect, it } from "vitest";
import { filterApiKeysForServerSide } from "../lib/ai-routing";

describe("AI Routing Security Tests", () => {
    describe("filterApiKeysForServerSide - Security Fix", () => {
        it("should remove ALL provider API keys for server-side calls", () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: "claude-key",
                OPENAI_API_KEY: "openai-key",
                GEMINI_API_KEY: "gemini-key",
                XAI_API_KEY: "xai-key",

                DEEPSEEK_API_KEY: "deepseek-key",
                FIREWORKS_API_KEY: "fireworks-key",
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            };

            // Test server-funded model (should remove ALL provider keys)
            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_2_5_FLASH_LITE,
                true,
            );

            // Should only keep non-provider API keys
            expect(result).toEqual({
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            });

            // Verify all provider keys are removed
            expect(result).not.toHaveProperty("ANTHROPIC_API_KEY");
            expect(result).not.toHaveProperty("OPENAI_API_KEY");
            expect(result).not.toHaveProperty("GEMINI_API_KEY");
            expect(result).not.toHaveProperty("XAI_API_KEY");

            expect(result).not.toHaveProperty("DEEPSEEK_API_KEY");
            expect(result).not.toHaveProperty("FIREWORKS_API_KEY");
        });

        it("should keep only required provider key for BYOK models", () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: "claude-key",
                OPENAI_API_KEY: "openai-key",
                GEMINI_API_KEY: "gemini-key",
                XAI_API_KEY: "xai-key",
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            };

            // Test BYOK Claude model (should keep only ANTHROPIC_API_KEY)
            const claudeResult = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.CLAUDE_4_SONNET,
                false,
            );
            expect(claudeResult).toEqual({
                ANTHROPIC_API_KEY: "claude-key",
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            });

            // Test BYOK OpenAI model (should keep only OPENAI_API_KEY)
            const openaiResult = filterApiKeysForServerSide(apiKeys, ChatMode.GPT_4o_Mini, false);
            expect(openaiResult).toEqual({
                OPENAI_API_KEY: "openai-key",
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            });
        });

        it("should handle empty API keys object", () => {
            const result = filterApiKeysForServerSide({}, ChatMode.GEMINI_2_5_FLASH_LITE, true);
            expect(result).toEqual({});
        });

        it("should handle object with only provider keys", () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: "claude-key",
                OPENAI_API_KEY: "openai-key",
            };

            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_2_5_FLASH_LITE,
                true,
            );
            expect(result).toEqual({});
        });

        it("should handle object with only non-provider keys", () => {
            const apiKeys = {
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            };

            const result = filterApiKeysForServerSide(
                apiKeys,
                ChatMode.GEMINI_2_5_FLASH_LITE,
                true,
            );
            expect(result).toEqual(apiKeys);
        });

        it("should prevent API key mixing security vulnerability", () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: "user-claude-key",
                OPENAI_API_KEY: "user-openai-key",
                GEMINI_API_KEY: "user-gemini-key",
                IMPORTANT_NON_PROVIDER_KEY: "should-keep-this",
            };

            const result = filterApiKeysForServerSide(apiKeys);

            // Critical: No provider keys should leak to server-side
            expect(Object.keys(result)).not.toContain("ANTHROPIC_API_KEY");
            expect(Object.keys(result)).not.toContain("OPENAI_API_KEY");
            expect(Object.keys(result)).not.toContain("GEMINI_API_KEY");

            // Should only keep non-provider keys
            expect(result).toEqual({
                IMPORTANT_NON_PROVIDER_KEY: "should-keep-this",
            });
        });
    });
});
