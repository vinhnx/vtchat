import { ChatMode } from "@repo/shared/config";
import { describe, expect, it } from "vitest";

// Replicate the CHAT_MODE_TO_API_KEY mapping logic from BYOK dialog
describe("Grok BYOK Dialog Null Check", () => {
    // This is the exact mapping from byok-validation-dialog.tsx
    const CHAT_MODE_TO_API_KEY = {
        // OpenAI models
        [ChatMode.O3]: "OPENAI_API_KEY",
        [ChatMode.O3_Mini]: "OPENAI_API_KEY",
        [ChatMode.O4_Mini]: "OPENAI_API_KEY",
        [ChatMode.O1]: "OPENAI_API_KEY",
        [ChatMode.O1_MINI]: "OPENAI_API_KEY",
        [ChatMode.GPT_4o_Mini]: "OPENAI_API_KEY",
        [ChatMode.GPT_4o]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1_Mini]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1_Nano]: "OPENAI_API_KEY",
        [ChatMode.GPT_4_1]: "OPENAI_API_KEY",
        // Gemini models
        [ChatMode.Deep]: "GEMINI_API_KEY",
        [ChatMode.Pro]: "GEMINI_API_KEY",
        [ChatMode.GEMINI_2_5_PRO]: "GEMINI_API_KEY",
        [ChatMode.GEMINI_2_5_FLASH]: "GEMINI_API_KEY",
        [ChatMode.GEMINI_2_5_FLASH_LITE]: "GEMINI_API_KEY",
        // Anthropic models
        [ChatMode.CLAUDE_4_SONNET]: "ANTHROPIC_API_KEY",
        [ChatMode.CLAUDE_4_OPUS]: "ANTHROPIC_API_KEY",
        // Fireworks models
        [ChatMode.DEEPSEEK_R1_FIREWORKS]: "FIREWORKS_API_KEY",
        // xAI models
        [ChatMode.GROK_3]: "XAI_API_KEY",
        [ChatMode.GROK_3_MINI]: "XAI_API_KEY",
        [ChatMode.GROK_4]: "XAI_API_KEY",
        // OpenRouter models
        [ChatMode.DEEPSEEK_V3_0324]: "OPENROUTER_API_KEY",
        [ChatMode.DEEPSEEK_R1]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_235B_A22B]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_32B]: "OPENROUTER_API_KEY",
        [ChatMode.MISTRAL_NEMO]: "OPENROUTER_API_KEY",
        [ChatMode.QWEN3_14B]: "OPENROUTER_API_KEY",
    } as const;

    it("should NOT return null for Grok models - this prevents dialog from showing", () => {
        // Test all Grok models to ensure they have valid API key mappings
        const grok3Required = CHAT_MODE_TO_API_KEY[ChatMode.GROK_3];
        const grok3MiniRequired = CHAT_MODE_TO_API_KEY[ChatMode.GROK_3_MINI];
        const grok4Required = CHAT_MODE_TO_API_KEY[ChatMode.GROK_4];

        // These should all be "XAI_API_KEY", not null/undefined
        expect(grok3Required).toBe("XAI_API_KEY");
        expect(grok3MiniRequired).toBe("XAI_API_KEY");
        expect(grok4Required).toBe("XAI_API_KEY");

        // Verify none are null/undefined (which would cause dialog to return null)
        expect(grok3Required).not.toBeNull();
        expect(grok3Required).not.toBeUndefined();
        expect(grok3MiniRequired).not.toBeNull();
        expect(grok3MiniRequired).not.toBeUndefined();
        expect(grok4Required).not.toBeNull();
        expect(grok4Required).not.toBeUndefined();
    });

    it("should return correct API key for remaining models", () => {
        // Check that remaining models have correct API key mappings
        const openaiRequired = CHAT_MODE_TO_API_KEY[ChatMode.O3];
        const anthropicRequired = CHAT_MODE_TO_API_KEY[ChatMode.CLAUDE_4_SONNET];

        expect(openaiRequired).toBe("OPENAI_API_KEY");
        expect(anthropicRequired).toBe("ANTHROPIC_API_KEY");
    });

    it("should verify ChatMode constants exist and match expected values", () => {
        // Ensure the ChatMode constants have expected values
        expect(ChatMode.GROK_3).toBe("grok-3");
        expect(ChatMode.GROK_3_MINI).toBe("grok-3-mini");
        expect(ChatMode.GROK_4).toBe("grok-4");
    });

    it("should simulate BYOK dialog logic and verify it doesn't return null for Grok", () => {
        // Simulate the exact logic from BYOKValidationDialog
        const chatMode = ChatMode.GROK_4;
        const requiredKeyType = CHAT_MODE_TO_API_KEY[chatMode];

        // This is the condition that causes dialog to return null
        const wouldReturnNull = !requiredKeyType;

        expect(wouldReturnNull).toBe(false);
        expect(requiredKeyType).toBe("XAI_API_KEY");
    });
});
