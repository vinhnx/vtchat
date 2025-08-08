import { getModelFromChatMode, ModelEnum } from "@repo/ai/models";
import { ChatMode } from "@repo/shared/config";
import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

describe("GPT-5 API Integration", () => {
    describe("Model configuration", () => {
        it("should have GPT-5 properly configured in models data", () => {
            const model = getModelFromChatMode(ChatMode.GPT_5);
            expect(model).toBe(ModelEnum.GPT_5);
            expect(model).toBe("gpt-5-2025-08-07");
        });

        it("should have GPT-5 in the models array", () => {
            const { models } = require("@repo/ai/models");
            const gpt5Model = models.find((m: any) => m.id === ModelEnum.GPT_5);
            
            expect(gpt5Model).toBeDefined();
            expect(gpt5Model.name).toBe("GPT-5");
            expect(gpt5Model.provider).toBe("openai");
            expect(gpt5Model.maxTokens).toBe(32_768);
            expect(gpt5Model.contextWindow).toBe(200_000);
        });

        it("should have GPT-5 in models-data.json with correct capabilities", () => {
            const modelsDataPath = join(process.cwd(), "../../packages/ai/models-data.json");
            const modelsDataContent = readFileSync(modelsDataPath, "utf-8");
            const modelsData = JSON.parse(modelsDataContent);
            const gpt5Data = modelsData.openai.models["gpt-5-2025-08-07"];
            
            expect(gpt5Data).toBeDefined();
            expect(gpt5Data.name).toBe("GPT-5");
            expect(gpt5Data.attachment).toBe(true);
            expect(gpt5Data.reasoning).toBe(true);
            expect(gpt5Data.temperature).toBe(true);
            expect(gpt5Data.tool_call).toBe(true);
            expect(gpt5Data.knowledge).toBe("2024-10");
            expect(gpt5Data.input_modalities).toEqual(["text", "image"]);
            expect(gpt5Data.output_modalities).toEqual(["text"]);
            
            // Check cost structure
            expect(gpt5Data.cost.input).toBe(5);
            expect(gpt5Data.cost.output).toBe(20);
            expect(gpt5Data.cost.cache_read).toBe(1.25);
            
            // Check limits
            expect(gpt5Data.limit.context).toBe(400000);
            expect(gpt5Data.limit.output).toBe(128000);
            
            // Check app capabilities
            expect(gpt5Data.app_capabilities.web_search).toBe(true);
            expect(gpt5Data.app_capabilities.math_calculator).toBe(true);
            expect(gpt5Data.app_capabilities.charts).toBe(true);
            expect(gpt5Data.app_capabilities.multi_modal).toBe(true);
        });
    });

    describe("Feature support", () => {
        it("should support OpenAI web search", () => {
            const { supportsOpenAIWebSearch } = require("@repo/ai/models");
            expect(supportsOpenAIWebSearch(ModelEnum.GPT_5)).toBe(true);
        });

        it("should support tools", () => {
            const { supportsTools } = require("@repo/ai/models");
            expect(supportsTools(ModelEnum.GPT_5)).toBe(true);
        });

        it("should support reasoning", () => {
            const { supportsReasoning } = require("@repo/ai/models");
            expect(supportsReasoning(ModelEnum.GPT_5)).toBe(true);
        });

        it("should have correct max tokens for chat mode", () => {
            const { getChatModeMaxTokens } = require("@repo/ai/models");
            expect(getChatModeMaxTokens(ChatMode.GPT_5)).toBe(200_000);
        });
    });

    describe("Chat mode configuration", () => {
        it("should have proper chat mode config", () => {
            const { ChatModeConfig } = require("@repo/shared/config");
            const gpt5Config = ChatModeConfig[ChatMode.GPT_5];
            
            expect(gpt5Config).toBeDefined();
            expect(gpt5Config.webSearch).toBe(true);
            expect(gpt5Config.imageUpload).toBe(true);
            expect(gpt5Config.multiModal).toBe(true);
            expect(gpt5Config.retry).toBe(true);
            expect(gpt5Config.isNew).toBe(true);
            expect(gpt5Config.isAuthRequired).toBe(true);
        });

        it("should have correct display name", () => {
            const { getChatModeName } = require("@repo/shared/config");
            expect(getChatModeName(ChatMode.GPT_5)).toBe("OpenAI GPT-5");
        });
    });
});
