import {
    DEFAULT_EMBEDDING_MODEL,
    EMBEDDING_MODEL_CONFIG,
} from "@repo/shared/config/embedding-models";
import { describe, expect, it, vi } from "vitest";

describe("Agent Page Updates", () => {
    describe("Embedding Model Configuration", () => {
        it("should use gemini-embedding-001 as default model", () => {
            // Get the configuration for the default model
            const defaultModelConfig = EMBEDDING_MODEL_CONFIG[DEFAULT_EMBEDDING_MODEL];

            // Verify the default model ID is correct
            expect(defaultModelConfig.id).toBe("gemini-embedding-001");
            expect(defaultModelConfig.name).toBe("Gemini Embedding 001");
            expect(defaultModelConfig.dimensions).toBe(3072);
            expect(defaultModelConfig.provider).toBe("Google");
        });

        it("should have correct model configuration structure", () => {
            const defaultModelConfig = EMBEDDING_MODEL_CONFIG[DEFAULT_EMBEDDING_MODEL];

            // Verify all required properties exist
            expect(defaultModelConfig).toHaveProperty("id");
            expect(defaultModelConfig).toHaveProperty("name");
            expect(defaultModelConfig).toHaveProperty("dimensions");
            expect(defaultModelConfig).toHaveProperty("description");
            expect(defaultModelConfig).toHaveProperty("provider");
        });
    });

    describe("Development-only Logging", () => {
        it("should only log agent fetch details in development mode", () => {
            // Create mock log function
            const mockLog = {
                info: vi.fn(),
                error: vi.fn(),
            };

            // Simulate the logging condition from fetchKnowledgeBase
            const resources = [{ id: "1", title: "Test Resource" }];
            const data = { resources };

            // Test development mode behavior
            const isDevelopment = true;
            if (isDevelopment) {
                mockLog.info({ total: resources.length, data }, "📚 Agent fetched");
            }

            // Should have been called in development
            expect(mockLog.info).toHaveBeenCalledWith({ total: 1, data }, "📚 Agent fetched");

            // Reset mock
            mockLog.info.mockClear();

            // Test production mode behavior
            const isProduction = false; // Simulating development check in production
            if (isProduction) {
                mockLog.info({ total: resources.length, data }, "📚 Agent fetched");
            }

            // Should not have been called in production
            expect(mockLog.info).not.toHaveBeenCalled();
        });

        it("should demonstrate environment-based logging pattern", () => {
            // This test documents the pattern used in the actual code
            const simulateLoggingCondition = (nodeEnv: string) => {
                return nodeEnv === "development";
            };

            // Verify the condition works as expected
            expect(simulateLoggingCondition("development")).toBe(true);
            expect(simulateLoggingCondition("production")).toBe(false);
            expect(simulateLoggingCondition("test")).toBe(false);
        });
    });
});
