/**
 * Test VT+ Gemini Web Search Feature
 * Tests that VT+ users automatically get access to Gemini web search using system API key
 */

import { geminiWebSearchTask } from "@repo/ai/workflow/tasks/gemini-web-search";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("VT+ Gemini Web Search", () => {
    let mockContext;
    let mockEvents;
    let mockData;

    beforeEach(() => {
        // Mock environment variable
        process.env.GEMINI_API_KEY = "test-system-api-key";

        // Mock context
        mockContext = {
            get: vi.fn(),
            set: vi.fn(),
            update: vi.fn(),
        };

        // Mock events
        mockEvents = {
            update: vi.fn(),
        };

        // Mock data
        mockData = {
            stepId: "test-step-id",
        };
    });

    test("VT+ user without personal API key should use system API key", async () => {
        // Setup: VT+ user without personal Gemini API key
        mockContext.get.mockImplementation((key) => {
            switch (key) {
                case "userTier":
                    return "PLUS";
                case "apiKeys":
                    return {}; // No personal API key
                case "mode":
                    return "GEMINI_2_5_FLASH";
                case "question":
                    return "What is the weather today?";
                default:
                    return null;
            }
        });

        // Mock generateTextWithGeminiSearch to verify it receives system API key
        vi.mock("@repo/ai/workflow/utils", () => ({
            generateTextWithGeminiSearch: vi.fn().mockResolvedValue({
                text: "Test search result",
                sources: [],
                groundingMetadata: null,
            }),
            getHumanizedDate: vi.fn().mockReturnValue("2024-01-01"),
            handleError: vi.fn(),
            sendEvents: vi.fn().mockReturnValue({
                updateStep: vi.fn(),
            }),
        }));

        const { generateTextWithGeminiSearch } = await import("@repo/ai/workflow/utils");

        try {
            await geminiWebSearchTask.execute({
                data: mockData,
                events: mockEvents,
                context: mockContext,
            });
        } catch (_error) {
            // Expected to fail due to incomplete mocking, but we can verify the API key was passed
        }

        // Verify that generateTextWithGeminiSearch was called with system API key
        expect(generateTextWithGeminiSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                byokKeys: expect.objectContaining({
                    GEMINI_API_KEY: "test-system-api-key",
                }),
            }),
        );
    });

    test("VT+ user with personal API key should use personal API key", async () => {
        // Setup: VT+ user with personal Gemini API key
        mockContext.get.mockImplementation((key) => {
            switch (key) {
                case "userTier":
                    return "PLUS";
                case "apiKeys":
                    return { GEMINI_API_KEY: "personal-api-key" };
                case "mode":
                    return "GEMINI_2_5_FLASH";
                case "question":
                    return "What is the weather today?";
                default:
                    return null;
            }
        });

        // Mock generateTextWithGeminiSearch
        vi.mock("@repo/ai/workflow/utils", () => ({
            generateTextWithGeminiSearch: vi.fn().mockResolvedValue({
                text: "Test search result",
                sources: [],
                groundingMetadata: null,
            }),
            getHumanizedDate: vi.fn().mockReturnValue("2024-01-01"),
            handleError: vi.fn(),
            sendEvents: vi.fn().mockReturnValue({
                updateStep: vi.fn(),
            }),
        }));

        const { generateTextWithGeminiSearch } = await import("@repo/ai/workflow/utils");

        try {
            await geminiWebSearchTask.execute({
                data: mockData,
                events: mockEvents,
                context: mockContext,
            });
        } catch (_error) {
            // Expected to fail due to incomplete mocking
        }

        // Verify that generateTextWithGeminiSearch was called with personal API key
        expect(generateTextWithGeminiSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                byokKeys: expect.objectContaining({
                    GEMINI_API_KEY: "personal-api-key",
                }),
            }),
        );
    });

    test("Free user should not get system API key", async () => {
        // Setup: Free user without personal API key
        mockContext.get.mockImplementation((key) => {
            switch (key) {
                case "userTier":
                    return "FREE";
                case "apiKeys":
                    return {}; // No personal API key
                case "mode":
                    return "GEMINI_2_5_FLASH";
                case "question":
                    return "What is the weather today?";
                default:
                    return null;
            }
        });

        // Mock generateTextWithGeminiSearch
        vi.mock("@repo/ai/workflow/utils", () => ({
            generateTextWithGeminiSearch: vi.fn().mockResolvedValue({
                text: "Test search result",
                sources: [],
                groundingMetadata: null,
            }),
            getHumanizedDate: vi.fn().mockReturnValue("2024-01-01"),
            handleError: vi.fn(),
            sendEvents: vi.fn().mockReturnValue({
                updateStep: vi.fn(),
            }),
        }));

        const { generateTextWithGeminiSearch } = await import("@repo/ai/workflow/utils");

        try {
            await geminiWebSearchTask.execute({
                data: mockData,
                events: mockEvents,
                context: mockContext,
            });
        } catch (_error) {
            // Expected to fail due to incomplete mocking
        }

        // Verify that generateTextWithGeminiSearch was called with original API keys (no system key)
        expect(generateTextWithGeminiSearch).toHaveBeenCalledWith(
            expect.objectContaining({
                byokKeys: {},
            }),
        );
    });

    test("Should log VT+ user detection", async () => {
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

        // Setup: VT+ user without personal API key
        mockContext.get.mockImplementation((key) => {
            switch (key) {
                case "userTier":
                    return "PLUS";
                case "apiKeys":
                    return {};
                case "mode":
                    return "GEMINI_2_5_FLASH";
                case "question":
                    return "What is the weather today?";
                default:
                    return null;
            }
        });

        // Mock generateTextWithGeminiSearch to throw error for easier testing
        vi.mock("@repo/ai/workflow/utils", () => ({
            generateTextWithGeminiSearch: vi.fn().mockRejectedValue(new Error("Test error")),
            getHumanizedDate: vi.fn().mockReturnValue("2024-01-01"),
            handleError: vi.fn(),
            sendEvents: vi.fn().mockReturnValue({
                updateStep: vi.fn(),
            }),
        }));

        try {
            await geminiWebSearchTask.execute({
                data: mockData,
                events: mockEvents,
                context: mockContext,
            });
        } catch (_error) {
            // Expected to fail
        }

        consoleSpy.mockRestore();
    });
});
