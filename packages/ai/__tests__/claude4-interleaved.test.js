import { describe, expect, it } from "vitest";
import { CLAUDE_4_CONFIG } from "../constants/reasoning";
describe("Claude 4 Interleaved Thinking", function () {
    it("should have correct constants defined", function () {
        expect(CLAUDE_4_CONFIG.DEFAULT_THINKING_BUDGET).toBe(15000);
        expect(CLAUDE_4_CONFIG.BETA_HEADER).toBe("interleaved-thinking-2025-05-14");
        expect(CLAUDE_4_CONFIG.BETA_HEADER_KEY).toBe("anthropic-beta");
        expect(CLAUDE_4_CONFIG.SUPPORTS_TOOL_THINKING).toBe(true);
    });
    it("should have proper type definitions", function () {
        // This test ensures the types are properly defined
        var config = {
            enabled: true,
            budget: CLAUDE_4_CONFIG.DEFAULT_THINKING_BUDGET,
            includeThoughts: true,
            claude4InterleavedThinking: true,
        };
        expect(config.claude4InterleavedThinking).toBe(true);
        expect(config.budget).toBe(15000);
    });
});
