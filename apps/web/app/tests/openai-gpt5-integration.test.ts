import { models, ModelEnum } from "@repo/ai/models";
import { generateText } from "@repo/ai/workflow/utils";
import {
    getChatModeFromModel,
    modelOptionsByProvider,
} from "@repo/common/components/chat-input/chat-config";
import { ChatMode } from "@repo/shared/config";
import { describe, expect, it, vi } from "vitest";

vi.mock("ai", () => ({
    streamText: vi.fn().mockReturnValue({
        fullStream: (async function* () {})(),
        reasoningDetails: Promise.resolve([]),
    }),
    extractReasoningMiddleware: vi.fn(),
    generateObject: vi.fn(),
}));

describe("OpenAI GPT-5 integration", () => {
    it("should map GPT-5 model and appear in OpenAI options", () => {
        const model = models.find((m) => m.id === ModelEnum.GPT_5);
        expect(model?.name).toBe("GPT-5");

        const option = modelOptionsByProvider.OpenAI.find((o) => o.value === ChatMode.GPT_5);
        expect(option).toBeTruthy();

        const mode = getChatModeFromModel(model!);
        expect(mode).toBe(ChatMode.GPT_5);
    });

    it("should call OpenAI without temperature", async () => {
        const { streamText } = await import("ai");
        await generateText({
            prompt: "hello",
            model: ModelEnum.GPT_5,
            messages: [{ role: "user", content: "hi" }],
        });
        const config = (streamText as any).mock.calls[0][0];
        expect(config).not.toHaveProperty("temperature");
    });
});
