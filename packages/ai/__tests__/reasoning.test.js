import { describe, expect, it } from "vitest";
import { ReasoningType } from "../constants/reasoning";
import { getReasoningType, ModelEnum, supportsReasoning, supportsTools } from "../models";
describe("Reasoning Support", function () {
    describe("supportsReasoning", function () {
        it("should return true for Gemini 2.5 models", function () {
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_FLASH)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_PRO)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_FLASH_LITE)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_PRO)).toBe(true);
        });
        it("should return true for DeepSeek reasoning models", function () {
            expect(supportsReasoning(ModelEnum.DEEPSEEK_R1_FIREWORKS)).toBe(true);
            expect(supportsReasoning(ModelEnum.DEEPSEEK_R1)).toBe(true);
        });
        it("should return true for Anthropic reasoning models", function () {
            expect(supportsReasoning(ModelEnum.CLAUDE_4_SONNET)).toBe(true);
            expect(supportsReasoning(ModelEnum.CLAUDE_4_OPUS)).toBe(true);
        });
    });
    describe("getReasoningType", function () {
        it("should return gemini-thinking for Gemini models", function () {
            expect(getReasoningType(ModelEnum.GEMINI_2_5_FLASH)).toBe(ReasoningType.GEMINI_THINKING);
            expect(getReasoningType(ModelEnum.GEMINI_2_5_PRO)).toBe(ReasoningType.GEMINI_THINKING);
        });
        it("should return deepseek-reasoning for DeepSeek models", function () {
            expect(getReasoningType(ModelEnum.DEEPSEEK_R1_FIREWORKS)).toBe(ReasoningType.DEEPSEEK_REASONING);
            expect(getReasoningType(ModelEnum.DEEPSEEK_R1)).toBe(ReasoningType.DEEPSEEK_REASONING);
        });
        it("should return anthropic-reasoning for Anthropic models", function () {
            expect(getReasoningType(ModelEnum.CLAUDE_4_SONNET)).toBe(ReasoningType.ANTHROPIC_REASONING);
            expect(getReasoningType(ModelEnum.CLAUDE_4_OPUS)).toBe(ReasoningType.ANTHROPIC_REASONING);
            // Ensure Claude 4 models support both reasoning and tools
            expect(supportsTools(ModelEnum.CLAUDE_4_SONNET)).toBe(true);
            expect(supportsTools(ModelEnum.CLAUDE_4_OPUS)).toBe(true);
        });
    });
});
describe("Reasoning Details Types", function () {
    it("should handle text reasoning details", function () {
        var textDetail = {
            type: "text",
            text: "Let me think about this step by step...",
            signature: "reasoning-step-1",
        };
        expect(textDetail.type).toBe("text");
        expect(textDetail.text).toBeDefined();
        expect(textDetail.signature).toBeDefined();
    });
    it("should handle redacted reasoning details", function () {
        var redactedDetail = {
            type: "redacted",
            data: "sensitive reasoning content",
        };
        expect(redactedDetail.type).toBe("redacted");
        expect(redactedDetail.data).toBeDefined();
    });
});
describe("Reasoning Parts", function () {
    it("should handle reasoning parts in messages", function () {
        var _a, _b;
        var messageParts = [
            {
                type: "text",
                text: "Here is my response:",
            },
            {
                type: "reasoning",
                details: [
                    {
                        type: "text",
                        text: "First, I need to analyze the question...",
                    },
                    {
                        type: "redacted",
                    },
                ],
            },
        ];
        var textPart = messageParts[0];
        var reasoningPart = messageParts[1];
        expect(textPart.type).toBe("text");
        expect(textPart.text).toBeDefined();
        expect(reasoningPart.type).toBe("reasoning");
        expect(reasoningPart.details).toHaveLength(2);
        expect((_a = reasoningPart.details) === null || _a === void 0 ? void 0 : _a[0].type).toBe("text");
        expect((_b = reasoningPart.details) === null || _b === void 0 ? void 0 : _b[1].type).toBe("redacted");
    });
});
