import { Providers } from "@repo/ai/providers";
import { apiKeyMapper } from "@repo/ai/services/api-key-mapper";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the logger to prevent actual logging during tests
vi.mock("@repo/shared/logger", () => ({
    log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

describe("Provider Authentication Integration Tests", () => {
    const mockApiKeys = {
        valid: {
            OPENAI_API_KEY: "sk-1234567890abcdef1234567890abcdef",
            ANTHROPIC_API_KEY: "sk-ant-" + "a".repeat(95),
            OPENROUTER_API_KEY: "sk-or-v1-" + "a".repeat(64),
            GEMINI_API_KEY: "AIzaSyDXVvK9tQ7nlppjWQaMhEAa01y_MiKgOOI",
            TOGETHER_API_KEY: "a".repeat(64),
            FIREWORKS_API_KEY: "a".repeat(32), // Fireworks keys are alphanumeric only
            XAI_API_KEY: "xai-" + "a".repeat(32),
        },
        invalid: {
            OPENAI_API_KEY: "invalid-key",
            ANTHROPIC_API_KEY: "sk-ant-short",
            OPENROUTER_API_KEY: "sk-or-invalid",
            GEMINI_API_KEY: "short",
            TOGETHER_API_KEY: "short",
            FIREWORKS_API_KEY: "short",
            XAI_API_KEY: "short",
        },
        empty: {
            OPENAI_API_KEY: "",
            ANTHROPIC_API_KEY: "",
            OPENROUTER_API_KEY: "",
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("API Key Transformation", () => {
        it("should properly transform API keys using centralized mapper", () => {
            const frontendKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.valid.ANTHROPIC_API_KEY,
            };

            const transformedKeys = apiKeyMapper.mapFrontendToProvider(frontendKeys);

            expect(transformedKeys).toEqual(frontendKeys);
            expect(Object.keys(transformedKeys)).toHaveLength(2);
        });

        it("should handle empty API keys during transformation", () => {
            const frontendKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: "",
                OPENROUTER_API_KEY: "   ", // whitespace only
            };

            const transformedKeys = apiKeyMapper.mapFrontendToProvider(frontendKeys);

            expect(transformedKeys).toEqual({
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
            });
            expect(Object.keys(transformedKeys)).toHaveLength(1);
        });

        it("should handle transformation with no keys", () => {
            const transformedKeys = apiKeyMapper.mapFrontendToProvider({});
            expect(transformedKeys).toEqual({});
            expect(Object.keys(transformedKeys)).toHaveLength(0);
        });
    });

    describe("Provider-Specific Authentication", () => {
        it("should validate OpenAI API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.OPENAI,
                mockApiKeys.valid.OPENAI_API_KEY,
            );
            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(true);
        });

        it("should validate Anthropic API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.ANTHROPIC,
                mockApiKeys.valid.ANTHROPIC_API_KEY,
            );
            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.ANTHROPIC);
            expect(result.hasApiKey).toBe(true);
        });

        it("should validate OpenRouter API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.OPENROUTER,
                mockApiKeys.valid.OPENROUTER_API_KEY,
            );
            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.OPENROUTER);
            expect(result.hasApiKey).toBe(true);
        });

        it("should validate Gemini API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.GOOGLE,
                mockApiKeys.valid.GEMINI_API_KEY,
            );
            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.GOOGLE);
            expect(result.hasApiKey).toBe(true);
        });

        it("should reject invalid OpenAI API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.OPENAI,
                mockApiKeys.invalid.OPENAI_API_KEY,
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("API key too short");
            expect(result.expectedFormat).toContain("sk-");
        });

        it("should reject invalid Anthropic API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.ANTHROPIC,
                mockApiKeys.invalid.ANTHROPIC_API_KEY,
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("API key too short");
            expect(result.expectedFormat).toContain("sk-ant-");
        });

        it("should reject invalid OpenRouter API key format", () => {
            const result = apiKeyMapper.validateApiKeyFormat(
                Providers.OPENROUTER,
                mockApiKeys.invalid.OPENROUTER_API_KEY,
            );
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("API key too short");
            expect(result.expectedFormat).toContain("sk-or-v1-");
        });
    });

    describe("Provider Key Mapping", () => {
        it("should correctly map frontend keys to provider format", () => {
            const frontendKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.valid.ANTHROPIC_API_KEY,
                OPENROUTER_API_KEY: mockApiKeys.valid.OPENROUTER_API_KEY,
            };

            const mappedKeys = apiKeyMapper.mapFrontendToProvider(frontendKeys);

            expect(mappedKeys).toEqual(frontendKeys);
            expect(Object.keys(mappedKeys)).toHaveLength(3);
        });

        it("should filter out empty keys during mapping", () => {
            const frontendKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: "",
                OPENROUTER_API_KEY: "   ", // whitespace only
            };

            const mappedKeys = apiKeyMapper.mapFrontendToProvider(frontendKeys);

            expect(mappedKeys).toEqual({
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
            });
            expect(Object.keys(mappedKeys)).toHaveLength(1);
        });

        it("should get correct provider key names", () => {
            expect(apiKeyMapper.getProviderKeyName(Providers.OPENAI)).toBe("OPENAI_API_KEY");
            expect(apiKeyMapper.getProviderKeyName(Providers.ANTHROPIC)).toBe("ANTHROPIC_API_KEY");
            expect(apiKeyMapper.getProviderKeyName(Providers.OPENROUTER)).toBe(
                "OPENROUTER_API_KEY",
            );
            expect(apiKeyMapper.getProviderKeyName(Providers.GOOGLE)).toBe("GEMINI_API_KEY");
            expect(apiKeyMapper.getProviderKeyName(Providers.TOGETHER)).toBe("TOGETHER_API_KEY");
            expect(apiKeyMapper.getProviderKeyName(Providers.FIREWORKS)).toBe("FIREWORKS_API_KEY");
            expect(apiKeyMapper.getProviderKeyName(Providers.XAI)).toBe("XAI_API_KEY");
        });

        it("should throw error for unknown provider", () => {
            expect(() => {
                apiKeyMapper.getProviderKeyName("unknown" as any);
            }).toThrow("No key mapping found for provider");
        });
    });

    describe("Provider Key Validation", () => {
        it("should validate provider key presence and format", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.valid.ANTHROPIC_API_KEY,
            };

            const openaiResult = apiKeyMapper.validateProviderKey(Providers.OPENAI, apiKeys);
            expect(openaiResult.isValid).toBe(true);
            expect(openaiResult.hasApiKey).toBe(true);

            const anthropicResult = apiKeyMapper.validateProviderKey(Providers.ANTHROPIC, apiKeys);
            expect(anthropicResult.isValid).toBe(true);
            expect(anthropicResult.hasApiKey).toBe(true);
        });

        it("should detect missing API keys", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                // Missing ANTHROPIC_API_KEY
            };

            const result = apiKeyMapper.validateProviderKey(Providers.ANTHROPIC, apiKeys);
            expect(result.isValid).toBe(false);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for anthropic");
            expect(result.expectedFormat).toContain("sk-ant-");
        });

        it("should detect invalid API key formats", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.invalid.OPENAI_API_KEY,
            };

            const result = apiKeyMapper.validateProviderKey(Providers.OPENAI, apiKeys);
            expect(result.isValid).toBe(false);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toContain("API key too short");
        });
    });

    describe("Available Providers Detection", () => {
        it("should detect available providers with valid keys", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.valid.ANTHROPIC_API_KEY,
                GEMINI_API_KEY: mockApiKeys.valid.GEMINI_API_KEY,
            };

            const availableProviders = apiKeyMapper.getAvailableProviders(apiKeys);

            expect(availableProviders).toContain(Providers.OPENAI);
            expect(availableProviders).toContain(Providers.ANTHROPIC);
            expect(availableProviders).toContain(Providers.GOOGLE);
            expect(availableProviders.length).toBeGreaterThan(0);
        });

        it("should not detect providers with invalid keys", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.invalid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.invalid.ANTHROPIC_API_KEY,
            };

            const availableProviders = apiKeyMapper.getAvailableProviders(apiKeys);

            expect(availableProviders).not.toContain(Providers.OPENAI);
            expect(availableProviders).not.toContain(Providers.ANTHROPIC);
        });

        it("should handle empty API keys object", () => {
            const availableProviders = apiKeyMapper.getAvailableProviders({});
            expect(availableProviders).toEqual([]);
        });

        it("should handle mixed valid and invalid keys", () => {
            const apiKeys = {
                OPENAI_API_KEY: mockApiKeys.valid.OPENAI_API_KEY,
                ANTHROPIC_API_KEY: mockApiKeys.invalid.ANTHROPIC_API_KEY,
                GEMINI_API_KEY: mockApiKeys.valid.GEMINI_API_KEY,
            };

            const availableProviders = apiKeyMapper.getAvailableProviders(apiKeys);

            expect(availableProviders).toContain(Providers.OPENAI);
            expect(availableProviders).toContain(Providers.GOOGLE);
            expect(availableProviders).not.toContain(Providers.ANTHROPIC);
        });
    });

    describe("API Key Format Validation", () => {
        it("should validate all supported provider key formats", () => {
            const testCases = [
                { provider: Providers.OPENAI, key: mockApiKeys.valid.OPENAI_API_KEY },
                { provider: Providers.ANTHROPIC, key: mockApiKeys.valid.ANTHROPIC_API_KEY },
                { provider: Providers.OPENROUTER, key: mockApiKeys.valid.OPENROUTER_API_KEY },
                { provider: Providers.GOOGLE, key: mockApiKeys.valid.GEMINI_API_KEY },
                { provider: Providers.TOGETHER, key: mockApiKeys.valid.TOGETHER_API_KEY },
                { provider: Providers.FIREWORKS, key: mockApiKeys.valid.FIREWORKS_API_KEY },
                { provider: Providers.XAI, key: mockApiKeys.valid.XAI_API_KEY },
            ];

            testCases.forEach(({ provider, key }) => {
                const result = apiKeyMapper.validateApiKeyFormat(provider, key);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(provider);
                expect(result.hasApiKey).toBe(true);
                expect(result.keyLength).toBeGreaterThan(0);
            });
        });

        it("should reject all invalid provider key formats", () => {
            const testCases = [
                { provider: Providers.OPENAI, key: mockApiKeys.invalid.OPENAI_API_KEY },
                { provider: Providers.ANTHROPIC, key: mockApiKeys.invalid.ANTHROPIC_API_KEY },
                { provider: Providers.OPENROUTER, key: mockApiKeys.invalid.OPENROUTER_API_KEY },
                { provider: Providers.GOOGLE, key: mockApiKeys.invalid.GEMINI_API_KEY },
                { provider: Providers.TOGETHER, key: mockApiKeys.invalid.TOGETHER_API_KEY },
                { provider: Providers.FIREWORKS, key: mockApiKeys.invalid.FIREWORKS_API_KEY },
                { provider: Providers.XAI, key: mockApiKeys.invalid.XAI_API_KEY },
            ];

            testCases.forEach(({ provider, key }) => {
                const result = apiKeyMapper.validateApiKeyFormat(provider, key);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(provider);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeDefined();
                expect(result.expectedFormat).toBeDefined();
            });
        });

        it("should handle whitespace in API keys", () => {
            const keyWithWhitespace = "  " + mockApiKeys.valid.OPENAI_API_KEY + "  ";
            const result = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, keyWithWhitespace);

            expect(result.isValid).toBe(true);
            expect(result.keyLength).toBe(mockApiKeys.valid.OPENAI_API_KEY.length);
        });
    });

    describe("Error Handling", () => {
        it("should provide meaningful error messages for missing keys", () => {
            const result = apiKeyMapper.validateProviderKey(Providers.OPENAI, {});

            expect(result.isValid).toBe(false);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
            expect(result.error).toContain("OPENAI_API_KEY");
            expect(result.expectedFormat).toContain("sk-");
        });

        it("should provide meaningful error messages for invalid formats", () => {
            const result = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, "invalid");

            expect(result.isValid).toBe(false);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toContain("API key too short");
            expect(result.expectedFormat).toContain("sk-");
        });

        it("should handle empty string keys", () => {
            const result = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, "");

            expect(result.isValid).toBe(false);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toContain("API key too short");
        });
    });

    describe("Integration with Provider System", () => {
        it("should support all defined providers", () => {
            const allProviders = Object.values(Providers);

            allProviders.forEach((provider) => {
                expect(() => {
                    apiKeyMapper.getProviderKeyName(provider);
                }).not.toThrow();
            });
        });

        it("should maintain consistency between provider enum and key mapping", () => {
            const allProviders = Object.values(Providers);

            allProviders.forEach((provider) => {
                const keyName = apiKeyMapper.getProviderKeyName(provider);
                expect(keyName).toBeDefined();
                expect(typeof keyName).toBe("string");
                expect(keyName.length).toBeGreaterThan(0);
            });
        });

        it("should validate provider keys consistently", () => {
            const testKey = mockApiKeys.valid.OPENAI_API_KEY;
            const apiKeys = { OPENAI_API_KEY: testKey };

            // Both methods should give consistent results
            const directValidation = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, testKey);
            const providerValidation = apiKeyMapper.validateProviderKey(Providers.OPENAI, apiKeys);

            expect(directValidation.isValid).toBe(providerValidation.isValid);
            expect(directValidation.provider).toBe(providerValidation.provider);
        });
    });

    describe("Performance and Edge Cases", () => {
        it("should handle large numbers of API keys efficiently", () => {
            const largeApiKeysObject: Record<string, string> = {};

            // Create 100 valid OpenAI keys
            for (let i = 0; i < 100; i++) {
                largeApiKeysObject[`OPENAI_API_KEY_${i}`] = mockApiKeys.valid.OPENAI_API_KEY;
            }

            const start = performance.now();
            const result = apiKeyMapper.mapFrontendToProvider(largeApiKeysObject);
            const end = performance.now();

            expect(Object.keys(result)).toHaveLength(100);
            expect(end - start).toBeLessThan(100); // Should complete in less than 100ms
        });

        it("should handle special characters in API keys", () => {
            const specialKey = "sk-" + "a".repeat(20) + "_-+=";
            const result = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, specialKey);

            // Should validate based on pattern, not reject special chars
            expect(result.hasApiKey).toBe(true);
        });

        it("should handle unicode characters gracefully", () => {
            const unicodeKey = "sk-" + "🔑".repeat(10);
            const result = apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, unicodeKey);

            expect(result.hasApiKey).toBe(true);
            expect(result.keyLength).toBeGreaterThan(0);
        });
    });
});
