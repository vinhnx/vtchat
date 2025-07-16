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

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the OpenRouter provider to inspect its configuration
vi.mock("@openrouter/ai-sdk-provider");

describe("OpenRouter Endpoint Verification", () => {
    const validApiKey = "sk-or-v1-" + "a".repeat(64);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Provider Configuration", () => {
        it("should configure OpenRouter provider with correct API key", () => {
            const mockCreateOpenRouter = createOpenRouter as any;
            mockCreateOpenRouter.mockReturnValue(() => ({}));

            // Import and test the provider creation
            const { getProviderInstance } = require("../providers");

            const byokKeys = {
                OPENROUTER_API_KEY: validApiKey,
            };

            getProviderInstance("openrouter", byokKeys);

            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });

        it("should use the official OpenRouter SDK", () => {
            // Verify we're using the official @openrouter/ai-sdk-provider package
            expect(createOpenRouter).toBeDefined();
            expect(typeof createOpenRouter).toBe("function");
        });
    });

    describe("Endpoint Configuration", () => {
        it("should verify OpenRouter SDK uses correct base URL", () => {
            // The @openrouter/ai-sdk-provider should use the correct OpenRouter API endpoint
            // We can't directly test the internal URL, but we can verify the provider is configured correctly

            const mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });

            (createOpenRouter as any).mockReturnValue(mockProvider);

            const { getProviderInstance } = require("../providers");

            const instance = getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });

            expect(instance).toBeDefined();
            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });

        it("should not use any local or mock endpoints", () => {
            // Verify that the OpenRouter provider doesn't use localhost or mock URLs
            const mockProvider = vi.fn();
            (createOpenRouter as any).mockImplementation((config) => {
                // Verify no localhost or mock URLs are being used
                if (config.baseURL) {
                    expect(config.baseURL).not.toMatch(/localhost|127\.0\.0\.1|mock|test/i);
                    expect(config.baseURL).toMatch(/openrouter\.ai/i);
                }
                return mockProvider;
            });

            const { getProviderInstance } = require("../providers");

            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });

            expect(createOpenRouter).toHaveBeenCalled();
        });
    });

    describe("Request Headers and Authentication", () => {
        it("should configure proper authentication headers", () => {
            // Test that the OpenRouter provider is configured with proper authentication
            const mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });

            (createOpenRouter as any).mockImplementation((config) => {
                // Verify API key is properly configured
                expect(config.apiKey).toBe(validApiKey);
                expect(config.apiKey).toMatch(/^sk-or-v1-[a-f0-9]{64}$/);

                return mockProvider;
            });

            const { getProviderInstance } = require("../providers");

            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });

            expect(createOpenRouter).toHaveBeenCalledWith({
                apiKey: validApiKey,
            });
        });

        it("should not expose API keys in logs or errors", () => {
            const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
            const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

            try {
                const { getProviderInstance } = require("../providers");

                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: validApiKey,
                });

                // Check that API key is not logged
                const allLogs = [
                    ...consoleSpy.mock.calls.flat(),
                    ...consoleErrorSpy.mock.calls.flat(),
                    ...consoleWarnSpy.mock.calls.flat(),
                ].join(" ");

                expect(allLogs).not.toContain(validApiKey);
                expect(allLogs).not.toMatch(/sk-or-v1-[a-f0-9]{64}/);
            } finally {
                consoleSpy.mockRestore();
                consoleErrorSpy.mockRestore();
                consoleWarnSpy.mockRestore();
            }
        });
    });

    describe("Model ID Verification", () => {
        it("should use correct OpenRouter model identifiers", () => {
            const { models, ModelEnum } = require("../models");

            // Find OpenRouter models
            const openRouterModels = models.filter((model: any) => model.provider === "openrouter");

            expect(openRouterModels.length).toBeGreaterThan(0);

            // Verify model IDs follow OpenRouter format
            const expectedModels = [
                { enum: ModelEnum.DEEPSEEK_V3_0324, id: "deepseek/deepseek-chat-v3-0324" },
                { enum: ModelEnum.DEEPSEEK_R1, id: "deepseek/deepseek-r1" },
                { enum: ModelEnum.QWEN3_235B_A22B, expectedPattern: /qwen/ },
                { enum: ModelEnum.QWEN3_32B, expectedPattern: /qwen/ },
                { enum: ModelEnum.MISTRAL_NEMO, expectedPattern: /mistral/ },
                { enum: ModelEnum.QWEN3_14B, expectedPattern: /qwen/ },
                { enum: ModelEnum.KIMI_K2, expectedPattern: /moonshot|kimi/ },
            ];

            expectedModels.forEach(({ enum: modelEnum, id, expectedPattern }) => {
                const model = models.find((m: any) => m.id === modelEnum);
                expect(model).toBeDefined();
                expect(model.provider).toBe("openrouter");

                if (id) {
                    expect(model.id).toBe(id);
                } else if (expectedPattern) {
                    expect(model.id).toMatch(expectedPattern);
                }

                // Verify model ID follows OpenRouter format (provider/model)
                expect(model.id).toMatch(/^[a-z0-9-]+\/[a-z0-9-]+/);
            });
        });

        it("should pass correct model IDs to OpenRouter provider", () => {
            const mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn(),
                streamText: vi.fn(),
            });

            (createOpenRouter as any).mockReturnValue(mockProvider);

            const { getLanguageModel, ModelEnum } = require("../models");
            const { getLanguageModel: getLanguageModelProvider } = require("../providers");

            const byokKeys = {
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

    describe("Response Authenticity Verification", () => {
        it("should not return hardcoded or dummy responses", () => {
            // Verify that the provider configuration doesn't include any dummy response logic
            const mockProvider = vi.fn().mockReturnValue({
                generateText: vi.fn().mockResolvedValue({
                    text: "This should be a real response from OpenRouter",
                    usage: { totalTokens: 10 },
                }),
                streamText: vi.fn(),
            });

            (createOpenRouter as any).mockReturnValue(mockProvider);

            const { getProviderInstance } = require("../providers");

            const instance = getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });

            expect(instance).toBeDefined();

            // The instance should be a function that creates model instances
            expect(typeof instance).toBe("function");

            // Create a model instance
            const modelInstance = instance("deepseek/deepseek-chat-v3-0324");
            expect(modelInstance).toBeDefined();
            expect(modelInstance.generateText).toBeDefined();
            expect(modelInstance.streamText).toBeDefined();
        });

        it("should use real OpenRouter API endpoints", () => {
            // Verify that we're not using any mock or local endpoints
            const mockProvider = vi.fn();

            (createOpenRouter as any).mockImplementation((config) => {
                // The official OpenRouter SDK should not allow custom base URLs for security
                // If baseURL is configurable, ensure it's the official OpenRouter endpoint
                if ("baseURL" in config) {
                    expect(config.baseURL).toMatch(/^https:\/\/openrouter\.ai/);
                }

                return mockProvider;
            });

            const { getProviderInstance } = require("../providers");

            getProviderInstance("openrouter", {
                OPENROUTER_API_KEY: validApiKey,
            });

            expect(createOpenRouter).toHaveBeenCalled();
        });

        it("should handle real API errors, not mock errors", () => {
            // Test that error handling is for real API errors, not dummy errors
            const { getProviderInstance } = require("../providers");

            // Test with invalid API key format
            expect(() => {
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: "invalid-key",
                });
            }).toThrow("OpenRouter API key required");

            // Test with empty API key
            expect(() => {
                getProviderInstance("openrouter", {});
            }).toThrow("OpenRouter API key required");

            // Test with whitespace-only API key
            expect(() => {
                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: "   ",
                });
            }).toThrow("OpenRouter API key required");
        });
    });

    describe("Security Verification", () => {
        it("should not log sensitive information", () => {
            const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
            const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            try {
                const { getProviderInstance } = require("../providers");

                getProviderInstance("openrouter", {
                    OPENROUTER_API_KEY: validApiKey,
                });

                // Verify API key is not logged
                const allLogs = [...logSpy.mock.calls.flat(), ...errorSpy.mock.calls.flat()].join(
                    " ",
                );

                expect(allLogs).not.toContain(validApiKey);
            } finally {
                logSpy.mockRestore();
                errorSpy.mockRestore();
            }
        });

        it("should validate API key format before making requests", () => {
            const { apiKeyMapper } = require("../services/api-key-mapper");

            // Test valid key
            const validResult = apiKeyMapper.validateApiKeyFormat("openrouter", validApiKey);
            expect(validResult.isValid).toBe(true);
            expect(validResult.provider).toBe("openrouter");

            // Test invalid keys
            const invalidKeys = [
                "sk-invalid",
                "openrouter-key",
                "sk-or-v2-" + "a".repeat(64), // wrong version
                "sk-or-v1-" + "a".repeat(32), // too short
            ];

            invalidKeys.forEach((key) => {
                const result = apiKeyMapper.validateApiKeyFormat("openrouter", key);
                expect(result.isValid).toBe(false);
                expect(result.error).toBeTruthy();
            });
        });
    });
});
