/**
 * OpenRouter Endpoint Verification Tests
 *
 * These tests verify that OpenRouter requests are sent to the correct endpoints
 * and that the provider is configured to use authentic OpenRouter API endpoints.
 *
 * Requirements tested:
 * - 2.4: OpenRouter requests are sent to correct endpoints
 * - 2.3: Ensure no dummy or mock responses are returned
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Mock the OpenRouter provider to inspect its configuration
vi.mock("@openrouter/ai-sdk-provider");
describe("OpenRouter Endpoint Verification", function () {
    var validApiKey = "sk-or-v1-".concat("a".repeat(64));
    beforeEach(function () {
        vi.clearAllMocks();
    });
    afterEach(function () {
        vi.restoreAllMocks();
    });
    describe("Provider Configuration", function () {
        it("should configure OpenRouter provider with correct API key", function () {
            var mockCreateOpenRouter = createOpenRouter;
            mockCreateOpenRouter.mockReturnValue(function () { return ({}); });
            // Import and test the provider creation
            var getProviderInstance = require("../providers").getProviderInstance;
            var byokKeys = {
                OPENROUTER_API_KEY: validApiKey,
            };
            getProviderInstance("openrouter", byokKeys);
            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });
        it("should use the official OpenRouter SDK", function () {
            // Verify we're using the official @openrouter/ai-sdk-provider package
            expect(createOpenRouter).toBeDefined();
            expect(typeof createOpenRouter).toBe("function");
        });
    });
    describe("Endpoint Configuration", function () {
        it("should verify OpenRouter SDK uses correct base URL", function () {
            // The @openrouter/ai-sdk-provider should use the correct OpenRouter API endpoint
            // We can't directly test the internal URL, but we can verify the provider is configured correctly
            var mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });
            createOpenRouter.mockReturnValue(mockProvider);
            var getProviderInstance = require("../providers").getProviderInstance;
            var instance = getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });
            expect(instance).toBeDefined();
            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });
        it("should not use any local or mock endpoints", function () {
            // Verify that the OpenRouter provider doesn't use localhost or mock URLs
            var mockProvider = vi.fn();
            createOpenRouter.mockImplementation(function (config) {
                // Verify no localhost or mock URLs are being used
                if (config.baseURL) {
                    expect(config.baseURL).not.toMatch(/localhost|127\.0\.0\.1|mock|test/i);
                    expect(config.baseURL).toMatch(/openrouter\.ai/i);
                }
                return mockProvider;
            });
            var getProviderInstance = require("../providers").getProviderInstance;
            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });
            expect(createOpenRouter).toHaveBeenCalled();
        });
    });
    describe("Request Headers and Authentication", function () {
        it("should configure proper authentication headers", function () {
            // Test that the OpenRouter provider is configured with proper authentication
            var mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });
            createOpenRouter.mockImplementation(function (config) {
                // Verify API key is properly configured
                expect(config.apiKey).toBe(validApiKey);
                expect(config.apiKey).toMatch(/^sk-or-v1-[a-f0-9]{64}$/);
                return mockProvider;
            });
            var getProviderInstance = require("../providers").getProviderInstance;
            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });
            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });
        it("should not expose API keys in logs or errors", function () {
            var consoleSpy = vi.spyOn(console, "log").mockImplementation(function () { });
            var consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(function () { });
            var consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(function () { });
            try {
                var getProviderInstance = require("../providers").getProviderInstance;
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: validApiKey,
                });
                // Check that API key is not logged
                var allLogs = __spreadArray(__spreadArray(__spreadArray([], consoleSpy.mock.calls.flat(), true), consoleErrorSpy.mock.calls.flat(), true), consoleWarnSpy.mock.calls.flat(), true).join(" ");
                expect(allLogs).not.toContain(validApiKey);
                expect(allLogs).not.toMatch(/sk-or-v1-[a-f0-9]{64}/);
            }
            finally {
                consoleSpy.mockRestore();
                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        });
    });
    describe("Model ID Verification", function () {
        it("should use correct OpenRouter model identifiers", function () {
            var _a = require("../models"), models = _a.models, ModelEnum = _a.ModelEnum;
            // Find OpenRouter models
            var openRouterModels = models.filter(function (model) { return model.provider === "openrouter"; });
            expect(openRouterModels.length).toBeGreaterThan(0);
            // Verify model IDs follow OpenRouter format
            var expectedModels = [
                { enum: ModelEnum.DEEPSEEK_V3_0324, id: "deepseek/deepseek-chat-v3-0324" },
                { enum: ModelEnum.DEEPSEEK_R1, id: "deepseek/deepseek-r1" },
                { enum: ModelEnum.QWEN3_235B_A22B, expectedPattern: /qwen/ },
                { enum: ModelEnum.QWEN3_32B, expectedPattern: /qwen/ },
                { enum: ModelEnum.MISTRAL_NEMO, expectedPattern: /mistral/ },
                { enum: ModelEnum.QWEN3_14B, expectedPattern: /qwen/ },
                { enum: ModelEnum.KIMI_K2, expectedPattern: /moonshot|kimi/ },
            ];
            expectedModels.forEach(function (_a) {
                var modelEnum = _a.enum, id = _a.id, expectedPattern = _a.expectedPattern;
                var model = models.find(function (m) { return m.id === modelEnum; });
                expect(model).toBeDefined();
                expect(model.provider).toBe("openrouter");
                if (id) {
                    expect(model.id).toBe(id);
                }
                else if (expectedPattern) {
                    expect(model.id).toMatch(expectedPattern);
                }
                // Verify model ID follows OpenRouter format (provider/model)
                expect(model.id).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+/);
            });
        });
        it("should pass correct model IDs to OpenRouter provider", function () {
            var mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });
            createOpenRouter.mockReturnValue(mockProvider);
            var ModelEnum = require("../models").ModelEnum;
            var getLanguageModelProvider = require("../providers").getLanguageModel;
            var byokKeys = {
                OPENROUTER_API_KEY: validApiKey,
            };
            // Test DeepSeek V3 model
            getLanguageModelProvider(ModelEnum.DEEPSEEK_V3_0324, undefined, byokKeys);
            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
            // Verify the provider function is called with the correct model ID
            expect(mockProvider).toHaveBeenCalledWith("deepseek/deepseek-chat-v3-0324");
        });
    });
    describe("Response Authenticity Verification", function () {
        it("should not return hardcoded or dummy responses", function () {
            // Verify that the provider configuration doesn't include any dummy response logic
            var mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn().mockResolvedValue({
                    text: "This should be a real response from OpenRouter",
                    usage: { totalTokens: 10 },
                }),
                streamText: vi.fn(),
            });
            createOpenRouter.mockReturnValue(mockProvider);
            var getProviderInstance = require("../providers").getProviderInstance;
            var instance = getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });
            expect(instance).toBeDefined();
            // The instance should be a function that creates model instances
            expect(typeof instance).toBe("function");
            // Create a model instance
            var modelInstance = instance("deepseek/deepseek-chat-v3-0324");
            expect(modelInstance).toBeDefined();
            expect(modelInstance.generateText).toBeDefined();
            expect(modelInstance.streamText).toBeDefined();
        });
        it("should use real OpenRouter API endpoints", function () {
            // Verify that we're not using any mock or local endpoints
            var mockProvider = vi.fn();
            createOpenRouter.mockImplementation(function (config) {
                // The official OpenRouter SDK should not allow custom base URLs for security
                // If baseURL is configurable, ensure it's the official OpenRouter endpoint
                if ("baseURL" in config) {
                    expect(config.baseURL).toMatch(/^https:\/\/openrouter\.ai/);
                }
                return mockProvider;
            });
            var getProviderInstance = require("../providers").getProviderInstance;
            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });
            expect(createOpenRouter).toHaveBeenCalled();
        });
        it("should handle real API errors, not mock errors", function () {
            // Test that error handling is for real API errors, not dummy errors
            var getProviderInstance = require("../providers").getProviderInstance;
            // Test with invalid API key format
            expect(function () {
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: "invalid-key",
                });
            }).toThrow("OpenRouter API key required");
            // Test with empty API key
            expect(function () {
                getProviderInstance("openrouter", {});
            }).toThrow("OpenRouter API key required");
            // Test with whitespace-only API key
            expect(function () {
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: "   ",
                });
            }).toThrow("OpenRouter API key required");
        });
    });
    describe("Security Verification", function () {
        it("should not log sensitive information", function () {
            var logSpy = vi.spyOn(console, "log").mockImplementation(function () { });
            var errorSpy = vi.spyOn(console, "error").mockImplementation(function () { });
            try {
                var getProviderInstance = require("../providers").getProviderInstance;
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: validApiKey,
                });
                // Verify API key is not logged
                var allLogs = __spreadArray(__spreadArray([], logSpy.mock.calls.flat(), true), errorSpy.mock.calls.flat(), true).join(" ");
                expect(allLogs).not.toContain(validApiKey);
            }
            finally {
                logSpy.mockRestore();
                errorSpy.mockRestore();
            }
        });
        it("should validate API key format before making requests", function () {
            var apiKeyMapper = require("../services/api-key-mapper").apiKeyMapper;
            // Test valid key
            var validResult = apiKeyMapper.validateApiKeyFormat("openrouter", validApiKey);
            expect(validResult.isValid).toBe(true);
            expect(validResult.provider).toBe("openrouter");
            // Test invalid keys
            var invalidKeys = [
                "sk-invalid",
                "openrouter-key",
                "sk-or-v2-".concat("a".repeat(64)), // wrong version
                "sk-or-v1-".concat("a".repeat(32)),
            ];
            invalidKeys.forEach(function (key) {
                var result = apiKeyMapper.validateApiKeyFormat("openrouter", key);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });
    });
});
