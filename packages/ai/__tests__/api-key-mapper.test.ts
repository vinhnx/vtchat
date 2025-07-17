import { describe, expect, it } from "vitest";
import { type ProviderEnumType, Providers } from "../providers";
import {
    apiKeyMapper,
    FRONTEND_KEY_NAMES,
    getAvailableProviders,
    getProviderKeyName,
    mapFrontendToProvider,
    PROVIDER_KEY_MAPPING,
    validateApiKeyFormat,
    validateProviderKey,
} from "../services/api-key-mapper";

describe("API Key Mapping Service", () => {
    describe("FRONTEND_KEY_NAMES constants", () => {
        it("should have all expected frontend key names", () => {
            expect(FRONTEND_KEY_NAMES.OPENAI_API_KEY).toBe("OPENAI_API_KEY");
            expect(FRONTEND_KEY_NAMES.ANTHROPIC_API_KEY).toBe("ANTHROPIC_API_KEY");
            expect(FRONTEND_KEY_NAMES.TOGETHER_API_KEY).toBe("TOGETHER_API_KEY");
            expect(FRONTEND_KEY_NAMES.GEMINI_API_KEY).toBe("GEMINI_API_KEY");
            expect(FRONTEND_KEY_NAMES.FIREWORKS_API_KEY).toBe("FIREWORKS_API_KEY");
            expect(FRONTEND_KEY_NAMES.XAI_API_KEY).toBe("XAI_API_KEY");
            expect(FRONTEND_KEY_NAMES.OPENROUTER_API_KEY).toBe("OPENROUTER_API_KEY");
            expect(FRONTEND_KEY_NAMES.LMSTUDIO_BASE_URL).toBe("LMSTUDIO_BASE_URL");
            expect(FRONTEND_KEY_NAMES.OLLAMA_BASE_URL).toBe("OLLAMA_BASE_URL");
        });
    });

    describe("PROVIDER_KEY_MAPPING constants", () => {
        it("should map all providers to correct frontend key names", () => {
            expect(PROVIDER_KEY_MAPPING[Providers.OPENAI]).toBe("OPENAI_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.ANTHROPIC]).toBe("ANTHROPIC_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.TOGETHER]).toBe("TOGETHER_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.GOOGLE]).toBe("GEMINI_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.FIREWORKS]).toBe("FIREWORKS_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.XAI]).toBe("XAI_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.OPENROUTER]).toBe("OPENROUTER_API_KEY");
            expect(PROVIDER_KEY_MAPPING[Providers.LMSTUDIO]).toBe("LMSTUDIO_BASE_URL");
            expect(PROVIDER_KEY_MAPPING[Providers.OLLAMA]).toBe("OLLAMA_BASE_URL");
        });

        it("should have mapping for all providers", () => {
            const allProviders = Object.values(Providers);
            const mappedProviders = Object.keys(PROVIDER_KEY_MAPPING);

            expect(mappedProviders).toHaveLength(allProviders.length);

            for (const provider of allProviders) {
                expect(PROVIDER_KEY_MAPPING[provider as ProviderEnumType]).toBeDefined();
            }
        });
    });

    describe("mapFrontendToProvider", () => {
        it("should return empty object for empty input", () => {
            const result = mapFrontendToProvider({});
            expect(result).toEqual({});
        });

        it("should preserve valid API keys", () => {
            const input = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY:
                    "sk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
            };

            const result = mapFrontendToProvider(input);

            expect(result).toEqual(input);
        });

        it("should filter out empty and whitespace-only keys", () => {
            const input = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "",
                GEMINI_API_KEY: "   ",
                TOGETHER_API_KEY:
                    "valid-key-1234567890123456789012345678901234567890123456789012345678901234",
            };

            const result = mapFrontendToProvider(input);

            expect(result).toEqual({
                OPENAI_API_KEY: "sk-test123456789012345678",
                TOGETHER_API_KEY:
                    "valid-key-1234567890123456789012345678901234567890123456789012345678901234",
            });
        });

        it("should trim whitespace from keys", () => {
            const input = {
                OPENAI_API_KEY: "  sk-test123456789012345678  ",
                ANTHROPIC_API_KEY:
                    "\tsk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\n",
            };

            const result = mapFrontendToProvider(input);

            expect(result).toEqual({
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY:
                    "sk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
            });
        });
    });

    describe("getProviderKeyName", () => {
        it("should return correct key name for each provider", () => {
            expect(getProviderKeyName(Providers.OPENAI)).toBe("OPENAI_API_KEY");
            expect(getProviderKeyName(Providers.ANTHROPIC)).toBe("ANTHROPIC_API_KEY");
            expect(getProviderKeyName(Providers.TOGETHER)).toBe("TOGETHER_API_KEY");
            expect(getProviderKeyName(Providers.GOOGLE)).toBe("GEMINI_API_KEY");
            expect(getProviderKeyName(Providers.FIREWORKS)).toBe("FIREWORKS_API_KEY");
            expect(getProviderKeyName(Providers.XAI)).toBe("XAI_API_KEY");
            expect(getProviderKeyName(Providers.OPENROUTER)).toBe("OPENROUTER_API_KEY");
            expect(getProviderKeyName(Providers.LMSTUDIO)).toBe("LMSTUDIO_BASE_URL");
            expect(getProviderKeyName(Providers.OLLAMA)).toBe("OLLAMA_BASE_URL");
        });

        it("should throw error for invalid provider", () => {
            expect(() => getProviderKeyName("invalid-provider" as ProviderEnumType)).toThrow(
                "No key mapping found for provider: invalid-provider",
            );
        });
    });

    describe("validateApiKeyFormat", () => {
        describe("OpenAI API key validation", () => {
            it("should validate correct OpenAI API key format", () => {
                const result = validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678");

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.keyLength).toBe(25);
                expect(result.error).toBeUndefined();
            });

            it("should reject OpenAI API key that's too short", () => {
                const result = validateApiKeyFormat(Providers.OPENAI, "sk-short");

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.keyLength).toBe(8);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("sk-");
            });

            it("should reject OpenAI API key with wrong format", () => {
                const result = validateApiKeyFormat(
                    Providers.OPENAI,
                    "wrong-format123456789012345678",
                );

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-");
            });
        });

        describe("Anthropic API key validation", () => {
            it("should validate correct Anthropic API key format", () => {
                const validKey = `sk-ant-api03-${"a".repeat(95)}`;
                const result = validateApiKeyFormat(Providers.ANTHROPIC, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject Anthropic API key that's too short", () => {
                const result = validateApiKeyFormat(Providers.ANTHROPIC, "sk-ant-short");

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("sk-ant-");
            });

            it("should reject Anthropic API key with wrong format", () => {
                const wrongKey = `sk-wrong-${"a".repeat(95)}`;
                const result = validateApiKeyFormat(Providers.ANTHROPIC, wrongKey);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-ant-");
            });
        });

        describe("Together API key validation", () => {
            it("should validate correct Together API key format", () => {
                const validKey = "a".repeat(64);
                const result = validateApiKeyFormat(Providers.TOGETHER, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject Together API key that's too short", () => {
                const result = validateApiKeyFormat(Providers.TOGETHER, "short");

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("64-character hexadecimal");
            });

            it("should reject Together API key with wrong format", () => {
                const wrongKey = "G".repeat(64); // Not hexadecimal
                const result = validateApiKeyFormat(Providers.TOGETHER, wrongKey);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("64-character hexadecimal");
            });
        });

        describe("Google/Gemini API key validation", () => {
            it("should validate correct Google API key format", () => {
                const validKey = "A".repeat(39);
                const result = validateApiKeyFormat(Providers.GOOGLE, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.GOOGLE);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject Google API key that's too short", () => {
                const result = validateApiKeyFormat(Providers.GOOGLE, "short");

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.GOOGLE);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("39-character alphanumeric");
            });
        });

        describe("Fireworks API key validation", () => {
            it("should validate correct Fireworks API key format", () => {
                const validKey = "A".repeat(32);
                const result = validateApiKeyFormat(Providers.FIREWORKS, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.FIREWORKS);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject Fireworks API key that's too short", () => {
                const result = validateApiKeyFormat(Providers.FIREWORKS, "short");

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.FIREWORKS);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("32+ character alphanumeric");
            });
        });

        describe("xAI API key validation", () => {
            it("should validate correct xAI API key format", () => {
                const validKey = `xai-${"A".repeat(32)}`;
                const result = validateApiKeyFormat(Providers.XAI, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.XAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject xAI API key with wrong format", () => {
                const wrongKey = `wrong-${"A".repeat(32)}`;
                const result = validateApiKeyFormat(Providers.XAI, wrongKey);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.XAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("xai-");
            });
        });

        describe("OpenRouter API key validation", () => {
            it("should validate correct OpenRouter API key format", () => {
                const validKey = `sk-or-v1-${"a".repeat(64)}`;
                const result = validateApiKeyFormat(Providers.OPENROUTER, validKey);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OPENROUTER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject OpenRouter API key with wrong format", () => {
                const wrongKey = `sk-wrong-v1-${"a".repeat(64)}`;
                const result = validateApiKeyFormat(Providers.OPENROUTER, wrongKey);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENROUTER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-or-v1-");
            });
        });

        describe("LM Studio URL validation", () => {
            it("should validate correct LM Studio URL format", () => {
                const validUrl = "http://localhost:1234";
                const result = validateApiKeyFormat(Providers.LMSTUDIO, validUrl);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should validate HTTPS LM Studio URL", () => {
                const validUrl = "https://my-lmstudio.example.com:8080";
                const result = validateApiKeyFormat(Providers.LMSTUDIO, validUrl);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject invalid LM Studio URL", () => {
                const invalidUrl = "not-a-url";
                const result = validateApiKeyFormat(Providers.LMSTUDIO, invalidUrl);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("HTTP/HTTPS URL");
            });
        });

        describe("Ollama URL validation", () => {
            it("should validate correct Ollama URL format", () => {
                const validUrl = "http://127.0.0.1:11434";
                const result = validateApiKeyFormat(Providers.OLLAMA, validUrl);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should validate HTTPS Ollama URL", () => {
                const validUrl = "https://my-ollama.example.com";
                const result = validateApiKeyFormat(Providers.OLLAMA, validUrl);

                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });

            it("should reject invalid Ollama URL", () => {
                const invalidUrl = "ftp://invalid";
                const result = validateApiKeyFormat(Providers.OLLAMA, invalidUrl);

                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid protocol");
                expect(result.expectedFormat).toContain("HTTP/HTTPS URL");
            });
        });

        it("should handle whitespace trimming", () => {
            const keyWithWhitespace = "  sk-test123456789012345678  ";
            const result = validateApiKeyFormat(Providers.OPENAI, keyWithWhitespace);

            expect(result.isValid).toBe(true);
            expect(result.keyLength).toBe(25); // Trimmed length
        });
    });

    describe("validateProviderKey", () => {
        it("should return invalid result when API key is missing", () => {
            const keys = { OTHER_KEY: "value" };
            const result = validateProviderKey(Providers.OPENAI, keys);

            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
            expect(result.error).toContain("OPENAI_API_KEY");
            expect(result.expectedFormat).toBeDefined();
        });

        it("should return invalid result when API key is empty", () => {
            const keys = { OPENAI_API_KEY: "" };
            const result = validateProviderKey(Providers.OPENAI, keys);

            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
        });

        it("should return invalid result when API key is whitespace only", () => {
            const keys = { OPENAI_API_KEY: "   " };
            const result = validateProviderKey(Providers.OPENAI, keys);

            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
        });

        it("should validate API key format when key is present", () => {
            const keys = { OPENAI_API_KEY: "sk-test123456789012345678" };
            const result = validateProviderKey(Providers.OPENAI, keys);

            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toBeUndefined();
        });

        it("should return format validation error when key format is invalid", () => {
            const keys = { OPENAI_API_KEY: "invalid-format" };
            const result = validateProviderKey(Providers.OPENAI, keys);

            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toContain("API key too short");
        });
    });

    describe("getAvailableProviders", () => {
        it("should return empty array for empty keys", () => {
            const result = getAvailableProviders({});
            expect(result).toEqual([]);
        });

        it("should return providers with valid keys", () => {
            const keys = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: `sk-ant-api03-${"a".repeat(95)}`,
                INVALID_KEY: "invalid",
            };

            const result = getAvailableProviders(keys);

            expect(result).toContain(Providers.OPENAI);
            expect(result).toContain(Providers.ANTHROPIC);
            expect(result).not.toContain(Providers.TOGETHER);
            expect(result).toHaveLength(2);
        });

        it("should handle all providers with valid keys", () => {
            const keys = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: `sk-ant-api03-${"a".repeat(95)}`,
                TOGETHER_API_KEY: "a".repeat(64),
                GEMINI_API_KEY: "A".repeat(39),
                FIREWORKS_API_KEY: "A".repeat(32),
                XAI_API_KEY: `xai-${"A".repeat(32)}`,
                OPENROUTER_API_KEY: `sk-or-v1-${"a".repeat(64)}`,
                LMSTUDIO_BASE_URL: "http://localhost:1234",
                OLLAMA_BASE_URL: "http://127.0.0.1:11434",
            };

            const result = getAvailableProviders(keys);

            expect(result).toHaveLength(Object.values(Providers).length);

            for (const provider of Object.values(Providers)) {
                expect(result).toContain(provider);
            }
        });

        it("should filter out providers with invalid keys", () => {
            const keys = {
                OPENAI_API_KEY: "sk-test123456789012345678", // Valid
                ANTHROPIC_API_KEY: "invalid-format", // Invalid
                TOGETHER_API_KEY: "short", // Too short
                GEMINI_API_KEY: "A".repeat(39), // Valid
            };

            const result = getAvailableProviders(keys);

            expect(result).toContain(Providers.OPENAI);
            expect(result).toContain(Providers.GOOGLE);
            expect(result).not.toContain(Providers.ANTHROPIC);
            expect(result).not.toContain(Providers.TOGETHER);
            expect(result).toHaveLength(2);
        });
    });

    describe("Utility function exports", () => {
        it("should export utility functions that work correctly", () => {
            // Test mapFrontendToProvider utility function
            const keys = { OPENAI_API_KEY: "sk-test123456789012345678" };
            const mapped = mapFrontendToProvider(keys);
            expect(mapped).toEqual(keys);

            // Test getProviderKeyName utility function
            const keyName = getProviderKeyName(Providers.OPENAI);
            expect(keyName).toBe("OPENAI_API_KEY");

            // Test validateProviderKey utility function
            const validation = validateProviderKey(Providers.OPENAI, keys);
            expect(validation.isValid).toBe(true);

            // Test validateApiKeyFormat utility function
            const formatValidation = validateApiKeyFormat(
                Providers.OPENAI,
                "sk-test123456789012345678",
            );
            expect(formatValidation.isValid).toBe(true);

            // Test getAvailableProviders utility function
            const available = getAvailableProviders(keys);
            expect(available).toContain(Providers.OPENAI);
        });
    });

    describe("ApiKeyMappingService interface compliance", () => {
        it("should implement all required methods", () => {
            expect(typeof apiKeyMapper.mapFrontendToProvider).toBe("function");
            expect(typeof apiKeyMapper.getProviderKeyName).toBe("function");
            expect(typeof apiKeyMapper.validateProviderKey).toBe("function");
            expect(typeof apiKeyMapper.validateApiKeyFormat).toBe("function");
            expect(typeof apiKeyMapper.getAvailableProviders).toBe("function");
        });

        it("should return consistent results through interface and utility functions", () => {
            const keys = { OPENAI_API_KEY: "sk-test123456789012345678" };

            // Compare interface method with utility function
            expect(apiKeyMapper.mapFrontendToProvider(keys)).toEqual(mapFrontendToProvider(keys));
            expect(apiKeyMapper.getProviderKeyName(Providers.OPENAI)).toBe(
                getProviderKeyName(Providers.OPENAI),
            );
            expect(apiKeyMapper.validateProviderKey(Providers.OPENAI, keys)).toEqual(
                validateProviderKey(Providers.OPENAI, keys),
            );
            expect(
                apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678"),
            ).toEqual(validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678"));
            expect(apiKeyMapper.getAvailableProviders(keys)).toEqual(getAvailableProviders(keys));
        });
    });

    describe("Caching behavior", () => {
        it("should cache validation results for performance", () => {
            const apiKey = "sk-test123456789012345678";

            // First call - should compute and cache
            const result1 = validateApiKeyFormat(Providers.OPENAI, apiKey);

            // Second call - should return cached result
            const result2 = validateApiKeyFormat(Providers.OPENAI, apiKey);

            expect(result1).toEqual(result2);
            expect(result1.isValid).toBe(true);
        });

        it("should handle cache size limits", () => {
            // Generate many different keys to test cache eviction
            for (let i = 0; i < 1100; i++) {
                const key = `sk-test${i.toString().padStart(16, "0")}`;
                validateApiKeyFormat(Providers.OPENAI, key);
            }

            // Should not throw or cause memory issues
            const result = validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678");
            expect(result.isValid).toBe(true);
        });

        it("should differentiate cache keys by provider and key content", () => {
            const sameKey = "sk-test123456789012345678";

            const openaiResult = validateApiKeyFormat(Providers.OPENAI, sameKey);
            // This should be invalid for Anthropic due to different format requirements
            const anthropicResult = validateApiKeyFormat(Providers.ANTHROPIC, sameKey);

            expect(openaiResult.isValid).toBe(true);
            expect(anthropicResult.isValid).toBe(false);
        });
    });

    describe("Input validation", () => {
        it("should validate input objects properly", () => {
            expect(() => mapFrontendToProvider({})).not.toThrow();
            expect(() => mapFrontendToProvider({ key: "value" })).not.toThrow();

            // @ts-expect-error Testing runtime validation
            expect(() => mapFrontendToProvider(null)).toThrow("Invalid API keys object provided");
            // @ts-expect-error Testing runtime validation
            expect(() => mapFrontendToProvider(undefined)).toThrow(
                "Invalid API keys object provided",
            );
            // @ts-expect-error Testing runtime validation
            expect(() => mapFrontendToProvider("not an object")).toThrow(
                "Invalid API keys object provided",
            );
            // @ts-expect-error Testing runtime validation
            expect(() => mapFrontendToProvider([])).toThrow("Invalid API keys object provided");
        });

        it("should handle objects with non-string values", () => {
            const invalidKeys = {
                OPENAI_API_KEY: "valid-string",
                INVALID_KEY: 123, // number instead of string
            };

            // @ts-expect-error Testing runtime validation
            expect(() => mapFrontendToProvider(invalidKeys)).toThrow(
                "Invalid API keys object provided",
            );
        });
    });

    describe("Edge cases and error handling", () => {
        it("should handle null and undefined inputs gracefully", () => {
            // @ts-expect-error Testing runtime behavior with invalid input
            expect(() => mapFrontendToProvider(null)).toThrow();
            // @ts-expect-error Testing runtime behavior with invalid input
            expect(() => mapFrontendToProvider(undefined)).toThrow();
        });

        it("should handle very long API keys within bounds", () => {
            const veryLongKey = `sk-${"a".repeat(97)}`; // Within 100 char limit
            const result = validateApiKeyFormat(Providers.OPENAI, veryLongKey);

            expect(result.isValid).toBe(true);
            expect(result.keyLength).toBe(100);
        });

        it("should reject API keys exceeding maximum length", () => {
            const tooLongKey = `sk-${"a".repeat(200)}`; // Exceeds 100 char limit
            const result = validateApiKeyFormat(Providers.OPENAI, tooLongKey);

            expect(result.isValid).toBe(false);
            expect(result.error).toContain("Invalid API key format");
        });

        it("should handle special characters in API keys", () => {
            const keyWithSpecialChars = "sk-test_123-456.789+abc=def";
            const result = validateApiKeyFormat(Providers.OPENAI, keyWithSpecialChars);

            // This should be invalid as OpenAI keys only allow alphanumeric characters
            expect(result.isValid).toBe(false);
        });

        it("should handle Unicode characters", () => {
            const keyWithUnicode = "sk-test123456789012345678🔑";
            const result = validateApiKeyFormat(Providers.OPENAI, keyWithUnicode);

            // This should be invalid as it contains non-ASCII characters
            expect(result.isValid).toBe(false);
        });

        it("should handle malformed URLs for local providers", () => {
            const malformedUrls = [
                "http://",
                "https://",
                "ftp://localhost:1234",
                "http://localhost:-1",
                "http://localhost:99999",
            ];

            for (const url of malformedUrls) {
                const result = validateApiKeyFormat(Providers.LMSTUDIO, url);
                expect(result.isValid).toBe(false);
            }
        });

        it("should handle concurrent validation requests", async () => {
            const keys = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: `sk-ant-api03-${"a".repeat(95)}`,
            };

            // Run multiple validations concurrently
            const promises = Array.from({ length: 10 }, () =>
                Promise.resolve(getAvailableProviders(keys)),
            );

            const results = await Promise.all(promises);

            // All results should be identical
            for (const result of results) {
                expect(result).toEqual([Providers.OPENAI, Providers.ANTHROPIC]);
            }
        });

        it("should handle memory stress with large key sets", () => {
            const largeKeySet: Record<string, string> = {};

            // Create a large set of keys
            for (let i = 0; i < 1000; i++) {
                largeKeySet[`FAKE_KEY_${i}`] = `fake-value-${i}`;
            }

            // Add one valid key
            largeKeySet.OPENAI_API_KEY = "sk-test123456789012345678";

            const result = getAvailableProviders(largeKeySet);
            expect(result).toEqual([Providers.OPENAI]);
        });
    });
});
