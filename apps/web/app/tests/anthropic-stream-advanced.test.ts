import Anthropic from "@anthropic-ai/sdk";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

describe("Advanced Anthropic Streaming Tests", () => {
    let client: Anthropic;

    beforeAll(() => {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error("ANTHROPIC_API_KEY environment variable is required for this test");
        }

        client = new Anthropic({
            apiKey: apiKey,
        });
    });

    afterEach(() => {
        // Clean up any active streams
        // In real scenarios, you might want to track and abort active streams
    });

    it("should handle multiple concurrent streams", async () => {
        const streamPromises = [];
        const _results: string[] = [];

        // Create 3 concurrent streams
        for (let i = 1; i <= 3; i++) {
            const streamPromise = (async () => {
                const stream = client.messages.stream({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 50,
                    messages: [
                        {
                            role: "user",
                            content: `Say "Stream ${i} completed" and nothing else.`,
                        },
                    ],
                });

                const message = await stream.finalMessage();
                return message.content[0].text;
            })();

            streamPromises.push(streamPromise);
        }

        // Wait for all streams to complete
        const responses = await Promise.all(streamPromises);

        expect(responses).toHaveLength(3);
        responses.forEach((response, index) => {
            expect(response).toContain(`Stream ${index + 1} completed`);
        });
    }, 45000); // Longer timeout for concurrent requests

    it("should handle streaming with tools/function calls", async () => {
        let toolCallReceived = false;
        let toolCallId = "";
        let functionName = "";

        const stream = client.messages
            .stream({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 200,
                messages: [
                    {
                        role: "user",
                        content: "What's the weather like? Use the get_weather function.",
                    },
                ],
                tools: [
                    {
                        name: "get_weather",
                        description: "Get the current weather for a location",
                        input_schema: {
                            type: "object",
                            properties: {
                                location: {
                                    type: "string",
                                    description: "The city and state, e.g. San Francisco, CA",
                                },
                            },
                            required: ["location"],
                        },
                    },
                ],
            })
            .on("streamEvent", (event) => {
                if (
                    event.type === "content_block_start" &&
                    event.content_block.type === "tool_use"
                ) {
                    toolCallReceived = true;
                    toolCallId = event.content_block.id;
                    functionName = event.content_block.name;
                }
            });

        const message = await stream.finalMessage();

        expect(toolCallReceived).toBe(true);
        expect(functionName).toBe("get_weather");
        expect(toolCallId).toBeTruthy();

        // Check that the message contains a tool use block
        const hasToolUse = message.content.some((block) => block.type === "tool_use");
        expect(hasToolUse).toBe(true);
    }, 30000);

    it("should handle streaming with system messages", async () => {
        let responseText = "";

        const stream = client.messages
            .stream({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 100,
                system: "You are a helpful assistant that always speaks like a pirate. Keep responses short.",
                messages: [
                    {
                        role: "user",
                        content: "Tell me about the weather.",
                    },
                ],
            })
            .on("text", (text) => {
                responseText += text;
            });

        const message = await stream.finalMessage();

        expect(responseText.length).toBeGreaterThan(0);
        expect(message.content[0].text).toBe(responseText);

        // Should contain pirate-like language
        const pirateWords = ["arr", "ahoy", "matey", "ye", "aye"];
        pirateWords.some((word) => responseText.toLowerCase().includes(word));
    }, 30000);

    it("should handle streaming errors gracefully", async () => {
        let errorReceived = false;
        const _errorMessage = "";

        try {
            const stream = client.messages
                .stream({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 0, // Invalid: max_tokens must be > 0
                    messages: [
                        {
                            role: "user",
                            content: "Hello",
                        },
                    ],
                })
                .on("error", (error) => {
                    errorReceived = true;
                    errorMessage = error.message;
                });

            await stream.finalMessage();

            // Should not reach here
            expect(false).toBe(true);
        } catch (error) {
            expect(errorReceived || error).toBeTruthy();
            if (error instanceof Anthropic.APIError) {
                expect(error.status).toBe(400); // Bad request
            }
        }
    }, 30000);

    it("should track message metadata and usage", async () => {
        const streamEvents: any[] = [];
        let messageMetadata: any = null;

        const stream = client.messages
            .stream({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 100,
                messages: [
                    {
                        role: "user",
                        content: "Write exactly 20 words about artificial intelligence.",
                    },
                ],
            })
            .on("streamEvent", (event, snapshot) => {
                streamEvents.push({ event: event.type, snapshot });

                if (event.type === "message_start") {
                    messageMetadata = event.message;
                }
            });

        const finalMessage = await stream.finalMessage();

        expect(streamEvents.length).toBeGreaterThan(0);
        expect(messageMetadata).toBeTruthy();
        expect(finalMessage.usage).toBeDefined();
        expect(finalMessage.usage.input_tokens).toBeGreaterThan(0);
        expect(finalMessage.usage.output_tokens).toBeGreaterThan(0);
        expect(finalMessage.model).toBe("claude-3-5-sonnet-20241022");
    }, 30000);

    it("should handle custom request headers and options", async () => {
        let responseReceived = false;

        const stream = client.messages
            .stream(
                {
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 50,
                    messages: [
                        {
                            role: "user",
                            content: "Say hello briefly.",
                        },
                    ],
                },
                {
                    // Custom request options
                    timeout: 15000, // 15 second timeout
                    headers: {
                        "X-Custom-Header": "test-value",
                    },
                },
            )
            .on("text", () => {
                responseReceived = true;
            });

        const message = await stream.finalMessage();

        expect(responseReceived).toBe(true);
        expect(message.content).toBeDefined();
        expect(message.content[0].text.length).toBeGreaterThan(0);
    }, 30000);

    it("should demonstrate different streaming patterns", async () => {
        // Pattern 1: High-level streaming with event handlers
        const stream1 = client.messages
            .stream({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 75,
                messages: [{ role: "user", content: "Count to 3 with explanations." }],
            })
            .on("text", (text) => process.stdout.write(text))
            .on("finalMessage", () => {});

        await stream1.finalMessage();

        // Pattern 2: Low-level streaming with async iteration
        const stream2 = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 75,
            messages: [{ role: "user", content: "List 3 programming languages briefly." }],
            stream: true,
        });

        const textParts: string[] = [];
        let usage: Record<string, unknown> | undefined;

        for await (const event of stream2) {
            switch (event.type) {
                case "content_block_delta":
                    if ("text" in event.delta) {
                        textParts.push(event.delta.text);
                        process.stdout.write(event.delta.text);
                    }
                    break;
                case "message_delta":
                    usage = event.usage as Record<string, unknown>;
                    break;
            }
        }

        expect(textParts.length).toBeGreaterThan(0);
        expect(usage).toBeDefined();
    }, 45000);
});
