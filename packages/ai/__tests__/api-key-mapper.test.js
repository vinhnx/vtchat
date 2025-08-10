var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { describe, expect, it } from "vitest";
import { Providers } from "../providers";
import { apiKeyMapper, FRONTEND_KEY_NAMES, getAvailableProviders, getProviderKeyName, mapFrontendToProvider, PROVIDER_KEY_MAPPING, validateApiKeyFormat, validateProviderKey, } from "../services/api-key-mapper";
describe("API Key Mapping Service", function () {
    describe("FRONTEND_KEY_NAMES constants", function () {
        it("should have all expected frontend key names", function () {
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
    describe("PROVIDER_KEY_MAPPING constants", function () {
        it("should map all providers to correct frontend key names", function () {
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
        it("should have mapping for all providers", function () {
            var allProviders = Object.values(Providers);
            var mappedProviders = Object.keys(PROVIDER_KEY_MAPPING);
            expect(mappedProviders).toHaveLength(allProviders.length);
            for (var _i = 0, allProviders_1 = allProviders; _i < allProviders_1.length; _i++) {
                var provider = allProviders_1[_i];
                expect(PROVIDER_KEY_MAPPING[provider]).toBeDefined();
            }
        });
    });
    describe("mapFrontendToProvider", function () {
        it("should return empty object for empty input", function () {
            var result = mapFrontendToProvider({});
            expect(result).toEqual({});
        });
        it("should preserve valid API keys", function () {
            var input = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "sk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
            };
            var result = mapFrontendToProvider(input);
            expect(result).toEqual(input);
        });
        it("should filter out empty and whitespace-only keys", function () {
            var input = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "",
                GEMINI_API_KEY: "   ",
                TOGETHER_API_KEY: "valid-key-1234567890123456789012345678901234567890123456789012345678901234",
            };
            var result = mapFrontendToProvider(input);
            expect(result).toEqual({
                OPENAI_API_KEY: "sk-test123456789012345678",
                TOGETHER_API_KEY: "valid-key-1234567890123456789012345678901234567890123456789012345678901234",
            });
        });
        it("should trim whitespace from keys", function () {
            var input = {
                OPENAI_API_KEY: "  sk-test123456789012345678  ",
                ANTHROPIC_API_KEY: "\tsk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789\n",
            };
            var result = mapFrontendToProvider(input);
            expect(result).toEqual({
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "sk-ant-api03-test123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
            });
        });
    });
    describe("getProviderKeyName", function () {
        it("should return correct key name for each provider", function () {
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
        it("should throw error for invalid provider", function () {
            expect(function () { return getProviderKeyName("invalid-provider"); }).toThrow("No key mapping found for provider: invalid-provider");
        });
    });
    describe("validateApiKeyFormat", function () {
        describe("OpenAI API key validation", function () {
            it("should validate correct OpenAI API key format", function () {
                var result = validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678");
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.keyLength).toBe(25);
                expect(result.error).toBeUndefined();
            });
            it("should reject OpenAI API key that's too short", function () {
                var result = validateApiKeyFormat(Providers.OPENAI, "sk-short");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.keyLength).toBe(8);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("sk-");
            });
            it("should reject OpenAI API key with wrong format", function () {
                var result = validateApiKeyFormat(Providers.OPENAI, "wrong-format123456789012345678");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-");
            });
        });
        describe("Anthropic API key validation", function () {
            it("should validate correct Anthropic API key format", function () {
                var validKey = "sk-ant-api03-".concat("a".repeat(95));
                var result = validateApiKeyFormat(Providers.ANTHROPIC, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject Anthropic API key that's too short", function () {
                var result = validateApiKeyFormat(Providers.ANTHROPIC, "sk-ant-short");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("sk-ant-");
            });
            it("should reject Anthropic API key with wrong format", function () {
                var wrongKey = "sk-wrong-".concat("a".repeat(95));
                var result = validateApiKeyFormat(Providers.ANTHROPIC, wrongKey);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.ANTHROPIC);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-ant-");
            });
        });
        describe("Together API key validation", function () {
            it("should validate correct Together API key format", function () {
                var validKey = "a".repeat(64);
                var result = validateApiKeyFormat(Providers.TOGETHER, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject Together API key that's too short", function () {
                var result = validateApiKeyFormat(Providers.TOGETHER, "short");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("64-character hexadecimal");
            });
            it("should reject Together API key with wrong format", function () {
                var wrongKey = "G".repeat(64); // Not hexadecimal
                var result = validateApiKeyFormat(Providers.TOGETHER, wrongKey);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.TOGETHER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("64-character hexadecimal");
            });
        });
        describe("Google/Gemini API key validation", function () {
            it("should validate correct Google API key format", function () {
                var validKey = "A".repeat(39);
                var result = validateApiKeyFormat(Providers.GOOGLE, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.GOOGLE);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject Google API key that's too short", function () {
                var result = validateApiKeyFormat(Providers.GOOGLE, "short");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.GOOGLE);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("39-character alphanumeric");
            });
        });
        describe("Fireworks API key validation", function () {
            it("should validate correct Fireworks API key format", function () {
                var validKey = "A".repeat(32);
                var result = validateApiKeyFormat(Providers.FIREWORKS, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.FIREWORKS);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject Fireworks API key that's too short", function () {
                var result = validateApiKeyFormat(Providers.FIREWORKS, "short");
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.FIREWORKS);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("32+ character alphanumeric");
            });
        });
        describe("xAI API key validation", function () {
            it("should validate correct xAI API key format", function () {
                var validKey = "xai-".concat("A".repeat(32));
                var result = validateApiKeyFormat(Providers.XAI, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.XAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject xAI API key with wrong format", function () {
                var wrongKey = "wrong-".concat("A".repeat(32));
                var result = validateApiKeyFormat(Providers.XAI, wrongKey);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.XAI);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("xai-");
            });
        });
        describe("OpenRouter API key validation", function () {
            it("should validate correct OpenRouter API key format", function () {
                var validKey = "sk-or-v1-".concat("a".repeat(64));
                var result = validateApiKeyFormat(Providers.OPENROUTER, validKey);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OPENROUTER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject OpenRouter API key with wrong format", function () {
                var wrongKey = "sk-wrong-v1-".concat("a".repeat(64));
                var result = validateApiKeyFormat(Providers.OPENROUTER, wrongKey);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OPENROUTER);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid API key format");
                expect(result.expectedFormat).toContain("sk-or-v1-");
            });
        });
        describe("LM Studio URL validation", function () {
            it("should validate correct LM Studio URL format", function () {
                var validUrl = "http://localhost:1234";
                var result = validateApiKeyFormat(Providers.LMSTUDIO, validUrl);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should validate HTTPS LM Studio URL", function () {
                var validUrl = "https://my-lmstudio.example.com:8080";
                var result = validateApiKeyFormat(Providers.LMSTUDIO, validUrl);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject invalid LM Studio URL", function () {
                var invalidUrl = "not-a-url";
                var result = validateApiKeyFormat(Providers.LMSTUDIO, invalidUrl);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.LMSTUDIO);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("API key too short");
                expect(result.expectedFormat).toContain("HTTP/HTTPS URL");
            });
        });
        describe("Ollama URL validation", function () {
            it("should validate correct Ollama URL format", function () {
                var validUrl = "http://127.0.0.1:11434";
                var result = validateApiKeyFormat(Providers.OLLAMA, validUrl);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should validate HTTPS Ollama URL", function () {
                var validUrl = "https://my-ollama.example.com";
                var result = validateApiKeyFormat(Providers.OLLAMA, validUrl);
                expect(result.isValid).toBe(true);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toBeUndefined();
            });
            it("should reject invalid Ollama URL", function () {
                var invalidUrl = "ftp://invalid";
                var result = validateApiKeyFormat(Providers.OLLAMA, invalidUrl);
                expect(result.isValid).toBe(false);
                expect(result.provider).toBe(Providers.OLLAMA);
                expect(result.hasApiKey).toBe(true);
                expect(result.error).toContain("Invalid protocol");
                expect(result.expectedFormat).toContain("HTTP/HTTPS URL");
            });
        });
        it("should handle whitespace trimming", function () {
            var keyWithWhitespace = "  sk-test123456789012345678  ";
            var result = validateApiKeyFormat(Providers.OPENAI, keyWithWhitespace);
            expect(result.isValid).toBe(true);
            expect(result.keyLength).toBe(25); // Trimmed length
        });
    });
    describe("validateProviderKey", function () {
        it("should return invalid result when API key is missing", function () {
            var keys = { OTHER_KEY: "value" };
            var result = validateProviderKey(Providers.OPENAI, keys);
            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
            expect(result.error).toContain("OPENAI_API_KEY");
            expect(result.expectedFormat).toBeDefined();
        });
        it("should return invalid result when API key is empty", function () {
            var keys = { OPENAI_API_KEY: "" };
            var result = validateProviderKey(Providers.OPENAI, keys);
            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
        });
        it("should return invalid result when API key is whitespace only", function () {
            var keys = { OPENAI_API_KEY: "   " };
            var result = validateProviderKey(Providers.OPENAI, keys);
            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(false);
            expect(result.error).toContain("Missing API key for openai");
        });
        it("should validate API key format when key is present", function () {
            var keys = { OPENAI_API_KEY: "sk-test123456789012345678" };
            var result = validateProviderKey(Providers.OPENAI, keys);
            expect(result.isValid).toBe(true);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toBeUndefined();
        });
        it("should return format validation error when key format is invalid", function () {
            var keys = { OPENAI_API_KEY: "invalid-format" };
            var result = validateProviderKey(Providers.OPENAI, keys);
            expect(result.isValid).toBe(false);
            expect(result.provider).toBe(Providers.OPENAI);
            expect(result.hasApiKey).toBe(true);
            expect(result.error).toContain("API key too short");
        });
    });
    describe("getAvailableProviders", function () {
        it("should return empty array for empty keys", function () {
            var result = getAvailableProviders({});
            expect(result).toEqual([]);
        });
        it("should return providers with valid keys", function () {
            var keys = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "sk-ant-api03-".concat("a".repeat(95)),
                INVALID_KEY: "invalid",
            };
            var result = getAvailableProviders(keys);
            expect(result).toContain(Providers.OPENAI);
            expect(result).toContain(Providers.ANTHROPIC);
            expect(result).not.toContain(Providers.TOGETHER);
            expect(result).toHaveLength(2);
        });
        it("should handle all providers with valid keys", function () {
            var keys = {
                OPENAI_API_KEY: "sk-test123456789012345678",
                ANTHROPIC_API_KEY: "sk-ant-api03-".concat("a".repeat(95)),
                TOGETHER_API_KEY: "a".repeat(64),
                GEMINI_API_KEY: "A".repeat(39),
                FIREWORKS_API_KEY: "A".repeat(32),
                XAI_API_KEY: "xai-".concat("A".repeat(32)),
                OPENROUTER_API_KEY: "sk-or-v1-".concat("a".repeat(64)),
                LMSTUDIO_BASE_URL: "http://localhost:1234",
                OLLAMA_BASE_URL: "http://127.0.0.1:11434",
            };
            var result = getAvailableProviders(keys);
            expect(result).toHaveLength(Object.values(Providers).length);
            for (var _i = 0, _a = Object.values(Providers); _i < _a.length; _i++) {
                var provider = _a[_i];
                expect(result).toContain(provider);
            }
        });
        it("should filter out providers with invalid keys", function () {
            var keys = {
                OPENAI_API_KEY: "sk-test123456789012345678", // Valid
                ANTHROPIC_API_KEY: "invalid-format", // Invalid
                TOGETHER_API_KEY: "short", // Too short
                GEMINI_API_KEY: "A".repeat(39), // Valid
            };
            var result = getAvailableProviders(keys);
            expect(result).toContain(Providers.OPENAI);
            expect(result).toContain(Providers.GOOGLE);
            expect(result).not.toContain(Providers.ANTHROPIC);
            expect(result).not.toContain(Providers.TOGETHER);
            expect(result).toHaveLength(2);
        });
    });
    describe("Utility function exports", function () {
        it("should export utility functions that work correctly", function () {
            // Test mapFrontendToProvider utility function
            var keys = { OPENAI_API_KEY: "sk-test123456789012345678" };
            var mapped = mapFrontendToProvider(keys);
            expect(mapped).toEqual(keys);
            // Test getProviderKeyName utility function
            var keyName = getProviderKeyName(Providers.OPENAI);
            expect(keyName).toBe("OPENAI_API_KEY");
            // Test validateProviderKey utility function
            var validation = validateProviderKey(Providers.OPENAI, keys);
            expect(validation.isValid).toBe(true);
            // Test validateApiKeyFormat utility function
            var formatValidation = validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678");
            expect(formatValidation.isValid).toBe(true);
            // Test getAvailableProviders utility function
            var available = getAvailableProviders(keys);
            expect(available).toContain(Providers.OPENAI);
        });
    });
    describe("ApiKeyMappingService interface compliance", function () {
        it("should implement all required methods", function () {
            expect(typeof apiKeyMapper.mapFrontendToProvider).toBe("function");
            expect(typeof apiKeyMapper.getProviderKeyName).toBe("function");
            expect(typeof apiKeyMapper.validateProviderKey).toBe("function");
            expect(typeof apiKeyMapper.validateApiKeyFormat).toBe("function");
            expect(typeof apiKeyMapper.getAvailableProviders).toBe("function");
        });
        it("should return consistent results through interface and utility functions", function () {
            var keys = { OPENAI_API_KEY: "sk-test123456789012345678" };
            // Compare interface method with utility function
            expect(apiKeyMapper.mapFrontendToProvider(keys)).toEqual(mapFrontendToProvider(keys));
            expect(apiKeyMapper.getProviderKeyName(Providers.OPENAI)).toBe(getProviderKeyName(Providers.OPENAI));
            expect(apiKeyMapper.validateProviderKey(Providers.OPENAI, keys)).toEqual(validateProviderKey(Providers.OPENAI, keys));
            expect(apiKeyMapper.validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678")).toEqual(validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678"));
            expect(apiKeyMapper.getAvailableProviders(keys)).toEqual(getAvailableProviders(keys));
        });
    });
    describe("Caching behavior", function () {
        it("should cache validation results for performance", function () {
            var apiKey = "sk-test123456789012345678";
            // First call - should compute and cache
            var result1 = validateApiKeyFormat(Providers.OPENAI, apiKey);
            // Second call - should return cached result
            var result2 = validateApiKeyFormat(Providers.OPENAI, apiKey);
            expect(result1).toEqual(result2);
            expect(result1.isValid).toBe(true);
        });
        it("should handle cache size limits", function () {
            // Generate many different keys to test cache eviction
            for (var i = 0; i < 1100; i++) {
                var key = "sk-test".concat(i.toString().padStart(16, "0"));
                validateApiKeyFormat(Providers.OPENAI, key);
            }
            // Should not throw or cause memory issues
            var result = validateApiKeyFormat(Providers.OPENAI, "sk-test123456789012345678");
            expect(result.isValid).toBe(true);
        });
        it("should differentiate cache keys by provider and key content", function () {
            var sameKey = "sk-test123456789012345678";
            var openaiResult = validateApiKeyFormat(Providers.OPENAI, sameKey);
            // This should be invalid for Anthropic due to different format requirements
            var anthropicResult = validateApiKeyFormat(Providers.ANTHROPIC, sameKey);
            expect(openaiResult.isValid).toBe(true);
            expect(anthropicResult.isValid).toBe(false);
        });
    });
    describe("Input validation", function () {
        it("should validate input objects properly", function () {
            expect(function () { return mapFrontendToProvider({}); }).not.toThrow();
            expect(function () { return mapFrontendToProvider({ key: "value" }); }).not.toThrow();
            // @ts-expect-error Testing runtime validation
            expect(function () { return mapFrontendToProvider(null); }).toThrow("Invalid API keys object provided");
            // @ts-expect-error Testing runtime validation
            expect(function () { return mapFrontendToProvider(undefined); }).toThrow("Invalid API keys object provided");
            // @ts-expect-error Testing runtime validation
            expect(function () { return mapFrontendToProvider("not an object"); }).toThrow("Invalid API keys object provided");
            // @ts-expect-error Testing runtime validation
            expect(function () { return mapFrontendToProvider([]); }).toThrow("Invalid API keys object provided");
        });
        it("should handle objects with non-string values", function () {
            var invalidKeys = {
                OPENAI_API_KEY: "valid-string",
                INVALID_KEY: 123, // number instead of string
            };
            // @ts-expect-error Testing runtime validation
            expect(function () { return mapFrontendToProvider(invalidKeys); }).toThrow("Invalid API keys object provided");
        });
    });
    describe("Edge cases and error handling", function () {
        it("should handle null and undefined inputs gracefully", function () {
            // @ts-expect-error Testing runtime behavior with invalid input
            expect(function () { return mapFrontendToProvider(null); }).toThrow();
            // @ts-expect-error Testing runtime behavior with invalid input
            expect(function () { return mapFrontendToProvider(undefined); }).toThrow();
        });
        it("should handle very long API keys within bounds", function () {
            var veryLongKey = "sk-".concat("a".repeat(97)); // Within 100 char limit
            var result = validateApiKeyFormat(Providers.OPENAI, veryLongKey);
            expect(result.isValid).toBe(true);
            expect(result.keyLength).toBe(100);
        });
        it("should reject API keys exceeding maximum length", function () {
            var tooLongKey = "sk-".concat("a".repeat(200)); // Exceeds 100 char limit
            var result = validateApiKeyFormat(Providers.OPENAI, tooLongKey);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain("Invalid API key format");
        });
        it("should handle special characters in API keys", function () {
            var keyWithSpecialChars = "sk-test_123-456.789+abc=def";
            var result = validateApiKeyFormat(Providers.OPENAI, keyWithSpecialChars);
            // This should be invalid as OpenAI keys only allow alphanumeric characters
            expect(result.isValid).toBe(false);
        });
        it("should handle Unicode characters", function () {
            var keyWithUnicode = "sk-test123456789012345678🔑";
            var result = validateApiKeyFormat(Providers.OPENAI, keyWithUnicode);
            // This should be invalid as it contains non-ASCII characters
            expect(result.isValid).toBe(false);
        });
        it("should handle malformed URLs for local providers", function () {
            var malformedUrls = [
                "http://",
                "https://",
                "ftp://localhost:1234",
                "http://localhost:-1",
                "http://localhost:99999",
            ];
            for (var _i = 0, malformedUrls_1 = malformedUrls; _i < malformedUrls_1.length; _i++) {
                var url = malformedUrls_1[_i];
                var result = validateApiKeyFormat(Providers.LMSTUDIO, url);
                expect(result.isValid).toBe(false);
            }
        });
        it("should handle concurrent validation requests", function () { return __awaiter(void 0, void 0, void 0, function () {
            var keys, promises, results, _i, results_1, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = {
                            OPENAI_API_KEY: "sk-test123456789012345678",
                            ANTHROPIC_API_KEY: "sk-ant-api03-".concat("a".repeat(95)),
                        };
                        promises = Array.from({ length: 10 }, function () {
                            return Promise.resolve(getAvailableProviders(keys));
                        });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        results = _a.sent();
                        // All results should be identical
                        for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                            result = results_1[_i];
                            expect(result).toEqual([Providers.OPENAI, Providers.ANTHROPIC]);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        it("should handle memory stress with large key sets", function () {
            var largeKeySet = {};
            // Create a large set of keys
            for (var i = 0; i < 1000; i++) {
                largeKeySet["FAKE_KEY_".concat(i)] = "fake-value-".concat(i);
            }
            // Add one valid key
            largeKeySet.OPENAI_API_KEY = "sk-test123456789012345678";
            var result = getAvailableProviders(largeKeySet);
            expect(result).toEqual([Providers.OPENAI]);
        });
    });
});
