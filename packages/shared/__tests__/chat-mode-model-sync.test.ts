import { getModelFromChatMode, ModelEnum, models } from "@repo/ai/models";
import { describe, expect, it } from "vitest";
import { ChatMode, getChatModeName, getModelDisplayName } from "../config/chat-mode";

describe("ChatMode and ModelEnum Synchronization", () => {
    describe("ChatMode to ModelEnum mapping", () => {
        it("should have a corresponding ModelEnum for every ChatMode", () => {
            const chatModes = Object.values(ChatMode);

            for (const chatMode of chatModes) {
                const modelEnum = getModelFromChatMode(chatMode);
                expect(modelEnum).toBeDefined();
                expect(Object.values(ModelEnum)).toContain(modelEnum);
            }
        });

        it("should have consistent naming patterns", () => {
            // Test specific known mappings
            expect(getModelFromChatMode(ChatMode.CLAUDE_4_1_OPUS)).toBe(ModelEnum.CLAUDE_4_1_OPUS);
            expect(getModelFromChatMode(ChatMode.CLAUDE_4_SONNET)).toBe(ModelEnum.CLAUDE_4_SONNET);
            expect(getModelFromChatMode(ChatMode.CLAUDE_4_OPUS)).toBe(ModelEnum.CLAUDE_4_OPUS);
            expect(getModelFromChatMode(ChatMode.O1_MINI)).toBe(ModelEnum.O1_MINI);
            expect(getModelFromChatMode(ChatMode.O1)).toBe(ModelEnum.O1);
            expect(getModelFromChatMode(ChatMode.KIMI_K2)).toBe(ModelEnum.KIMI_K2);
            expect(getModelFromChatMode(ChatMode.GPT_OSS_120B)).toBe(ModelEnum.GPT_OSS_120B);
            expect(getModelFromChatMode(ChatMode.GPT_OSS_20B)).toBe(ModelEnum.GPT_OSS_20B);
            expect(getModelFromChatMode(ChatMode.GPT_5)).toBe(ModelEnum.GPT_5);
        });
    });

    describe("Model definitions completeness", () => {
        it("should have model definitions for all ModelEnum values", () => {
            const modelEnums = Object.values(ModelEnum);
            const modelIds = models.map((m) => m.id);

            for (const modelEnum of modelEnums) {
                expect(modelIds).toContain(modelEnum);
            }
        });
    });

    describe("Display name consistency", () => {
        it("should have display names for all ChatMode values", () => {
            const chatModes = Object.values(ChatMode);

            for (const chatMode of chatModes) {
                const displayName = getChatModeName(chatMode);
                expect(displayName).toBeDefined();
                expect(displayName).not.toBe("");
                expect(displayName).not.toBe("VT Assistant"); // Should have specific names
            }
        });

        it("should use unified getModelDisplayName function", () => {
            // Test that the unified function works correctly
            expect(getModelDisplayName(ChatMode.CLAUDE_4_1_OPUS)).toBe("Anthropic Claude 4.1 Opus");
            expect(getModelDisplayName(ChatMode.CLAUDE_4_SONNET)).toBe("Anthropic Claude 4 Sonnet");
            expect(getModelDisplayName(ChatMode.O1_MINI)).toBe("OpenAI o1-mini");
            expect(getModelDisplayName(ChatMode.KIMI_K2)).toBe("OpenRouter Kimi K2");
            expect(getModelDisplayName(ChatMode.GPT_OSS_120B)).toBe(
                "OpenAI gpt-oss-120b (via OpenRouter)",
            );
            expect(getModelDisplayName(ChatMode.GPT_OSS_20B)).toBe(
                "OpenAI gpt-oss-20b (via OpenRouter)",
            );
            expect(getModelDisplayName(ChatMode.GPT_5)).toBe("OpenAI GPT 5");

            // Test fallback for unknown mode
            expect(getModelDisplayName("unknown-mode")).toBe("VT Assistant");
        });
    });

    describe("ChatMode configuration completeness", () => {
        it("should have configuration for all ChatMode values", () => {
            const chatModes = Object.values(ChatMode);

            // Import ChatModeConfig to test
            const { ChatModeConfig } = require("../config/chat-mode");

            for (const chatMode of chatModes) {
                expect(ChatModeConfig[chatMode]).toBeDefined();
                expect(ChatModeConfig[chatMode]).toHaveProperty("webSearch");
                expect(ChatModeConfig[chatMode]).toHaveProperty("imageUpload");
                expect(ChatModeConfig[chatMode]).toHaveProperty("multiModal");
                expect(ChatModeConfig[chatMode]).toHaveProperty("retry");
            }
        });
    });

    describe("Specific model synchronization", () => {
        it("should have correct Claude model IDs", () => {
            expect(ModelEnum.CLAUDE_4_1_OPUS).toBe("claude-opus-4-1-20250805");
            expect(ModelEnum.CLAUDE_4_SONNET).toBe("claude-sonnet-4-20250514");
            expect(ModelEnum.CLAUDE_4_OPUS).toBe("claude-opus-4-20250514");
        });

        it("should have O1 models properly defined", () => {
            expect(ModelEnum.O1_MINI).toBe("o1-mini");
            expect(ModelEnum.O1).toBe("o1");

            // Check they exist in models array
            const modelIds = models.map((m) => m.id);
            expect(modelIds).toContain(ModelEnum.O1_MINI);
            expect(modelIds).toContain(ModelEnum.O1);
        });

        it("should have GPT 4.1 Nano model", () => {
            expect(ModelEnum.GPT_4_1_Nano).toBe("gpt-4.1-nano");

            const modelIds = models.map((m) => m.id);
            expect(modelIds).toContain(ModelEnum.GPT_4_1_Nano);
        });

        it("should have KIMI_K2 model", () => {
            expect(ModelEnum.KIMI_K2).toBe("moonshot/kimi-k2");

            const modelIds = models.map((m) => m.id);
            expect(modelIds).toContain(ModelEnum.KIMI_K2);
        });

        it("should have GPT-OSS models", () => {
            expect(ModelEnum.GPT_OSS_120B).toBe("openai/gpt-oss-120b");
            expect(ModelEnum.GPT_OSS_20B).toBe("openai/gpt-oss-20b");

            const modelIds = models.map((m) => m.id);
            expect(modelIds).toContain(ModelEnum.GPT_OSS_120B);
            expect(modelIds).toContain(ModelEnum.GPT_OSS_20B);
        });

        it("should have GPT 5 model", () => {
            expect(ModelEnum.GPT_5).toBe("gpt-5-2025-08-07");

            const modelIds = models.map((m) => m.id);
            expect(modelIds).toContain(ModelEnum.GPT_5);
        });
    });
});
