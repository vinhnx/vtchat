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
                GROQ_API_KEY: "groq-key",
                DEEPSEEK_API_KEY: "deepseek-key",
                FIREWORKS_API_KEY: "fireworks-key",
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            };

            const result = filterApiKeysForServerSide(apiKeys);

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
            expect(result).not.toHaveProperty("GROQ_API_KEY");
            expect(result).not.toHaveProperty("DEEPSEEK_API_KEY");
            expect(result).not.toHaveProperty("FIREWORKS_API_KEY");
        });

        it("should handle empty API keys object", () => {
            const result = filterApiKeysForServerSide({});
            expect(result).toEqual({});
        });

        it("should handle object with only provider keys", () => {
            const apiKeys = {
                ANTHROPIC_API_KEY: "claude-key",
                OPENAI_API_KEY: "openai-key",
            };

            const result = filterApiKeysForServerSide(apiKeys);
            expect(result).toEqual({});
        });

        it("should handle object with only non-provider keys", () => {
            const apiKeys = {
                SERP_API_KEY: "serp-key",
                CUSTOM_API_KEY: "custom-key",
            };

            const result = filterApiKeysForServerSide(apiKeys);
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
