import { getModelFromChatMode, ModelEnum } from "@repo/ai/models";
import { selectAvailableModel } from "@repo/ai/workflow/utils";
import { ChatMode } from "@repo/shared/config";
import { describe, expect, it } from "vitest";

describe("GPT-5 Model Selection Fix", () => {
    describe("ChatMode to ModelEnum mapping", () => {
        it("should map GPT_5 ChatMode to correct ModelEnum", () => {
            const modelEnum = getModelFromChatMode(ChatMode.GPT_5);
            expect(modelEnum).toBe(ModelEnum.GPT_5);
            expect(modelEnum).toBe("gpt-5-2025-08-07");
        });
    });

    describe("selectAvailableModel with GPT-5", () => {
        it("should select GPT-5 when OpenAI API key is available", () => {
            const mockApiKeys = {
                OPENAI_API_KEY: "test-openai-key",
            };

            const selectedModel = selectAvailableModel(ModelEnum.GPT_5, mockApiKeys);
            expect(selectedModel).toBe(ModelEnum.GPT_5);
        });

        it("should fallback to available model when OpenAI API key is missing", () => {
            const mockApiKeys = {
                GEMINI_API_KEY: "test-gemini-key",
            };

            const selectedModel = selectAvailableModel(ModelEnum.GPT_5, mockApiKeys);
            // Should fallback to Gemini since no OpenAI key is available
            expect(selectedModel).toBe(ModelEnum.GEMINI_2_5_FLASH_LITE);
        });

        it("should fallback to available server model when no BYOK keys are provided", () => {
            const selectedModel = selectAvailableModel(ModelEnum.GPT_5, {});
            // Should fallback to server-available model (Gemini in test environment)
            // since server has GEMINI_API_KEY configured
            expect(selectedModel).toBe(ModelEnum.GEMINI_2_5_FLASH_LITE);
        });
    });

    describe("Other OpenAI models", () => {
        it("should select O1 models when OpenAI API key is available", () => {
            const mockApiKeys = {
                OPENAI_API_KEY: "test-openai-key",
            };

            expect(selectAvailableModel(ModelEnum.O1, mockApiKeys)).toBe(ModelEnum.O1);
            expect(selectAvailableModel(ModelEnum.O1_MINI, mockApiKeys)).toBe(ModelEnum.O1_MINI);
        });
    });

    describe("Claude models", () => {
        it("should select Claude 4.1 Opus when Anthropic API key is available", () => {
            const mockApiKeys = {
                ANTHROPIC_API_KEY: "test-anthropic-key",
            };

            const selectedModel = selectAvailableModel(ModelEnum.CLAUDE_4_1_OPUS, mockApiKeys);
            expect(selectedModel).toBe(ModelEnum.CLAUDE_4_1_OPUS);
        });
    });
});
