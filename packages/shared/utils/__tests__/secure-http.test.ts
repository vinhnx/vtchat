import { describe, expect, it, vi } from "vitest";
import { secureFetch } from "../secure-http";

describe("secureFetch", () => {
    it("removes API keys from request body", async () => {
        const body = {
            OPENAI_API_KEY: "openai-key",
            data: "test",
        };

        const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
        // @ts-expect-error - mock fetch
        global.fetch = fetchMock;

        await secureFetch("https://example.com", {
            method: "POST",
            body,
            apiKeys: {
                OPENAI_API_KEY: "header-key",
            },
        });

        const [, options] = fetchMock.mock.calls[0];
        const sentBody = JSON.parse(options.body as string);
        expect(sentBody.OPENAI_API_KEY).toBeUndefined();
        expect(sentBody.data).toBe("test");
        // ensure original body is untouched
        expect(body.OPENAI_API_KEY).toBe("openai-key");
    });
});
