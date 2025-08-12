import Anthropic from '@anthropic-ai/sdk';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Anthropic API Streaming Test', () => {
    let client: Anthropic;

    beforeAll(() => {
        // Check if ANTHROPIC_API_KEY is available in environment
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            throw new Error('ANTHROPIC_API_KEY environment variable is required for this test');
        }

        // Initialize Anthropic client with API key from environment
        client = new Anthropic({
            apiKey: apiKey,
        });
    });

    it('should stream text response from Claude', async () => {
        const responses: string[] = [];
        let finalMessage: string = '';

        // Create a streaming message request
        const stream = client.messages
            .stream({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 100,
                messages: [
                    {
                        role: 'user',
                        content: "Count from 1 to 5 and explain what you're doing.",
                    },
                ],
            })
            .on('text', (text) => {
                // Collect text chunks as they arrive
                responses.push(text);
                finalMessage += text;
            })
            .on('streamEvent', () => {})
            .on('error', () => {
                // Expected when stream is aborted
            });

        // Wait for the stream to complete
        const message = await stream.finalMessage();

        // Assertions
        expect(responses.length).toBeGreaterThan(0);
        expect(finalMessage.length).toBeGreaterThan(0);
        expect(message.content).toBeDefined();
        expect(message.content.length).toBeGreaterThan(0);
        expect(message.model).toBe('claude-3-5-sonnet-20241022');
        expect(message.role).toBe('assistant');

        // Check that we received some numbers (1-5) in the response
        const hasNumbers = /[1-5]/.test(finalMessage);
        expect(hasNumbers).toBe(true);
    }, 30000); // 30 second timeout for API call

    it('should handle streaming with event listeners', async () => {
        let contentStartEvents = 0;
        let contentStopEvents = 0;
        const textChunks: string[] = [];
        let messageCompleted = false;

        const stream = client.messages
            .stream({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 50,
                messages: [
                    {
                        role: 'user',
                        content: 'Say hello in exactly 3 words.',
                    },
                ],
            })
            .on('connect', () => {})
            .on('streamEvent', (event) => {
                switch (event.type) {
                    case 'content_block_start':
                        contentStartEvents++;
                        break;
                    case 'content_block_stop':
                        contentStopEvents++;
                        break;
                }
            })
            .on('text', (textDelta) => {
                textChunks.push(textDelta);
            })
            .on('message', () => {
                messageCompleted = true;
            })
            .on('end', () => {});

        const finalMessage = await stream.finalMessage();

        // Assertions
        expect(contentStartEvents).toBeGreaterThan(0);
        expect(contentStopEvents).toBeGreaterThan(0);
        expect(textChunks.length).toBeGreaterThan(0);
        expect(messageCompleted).toBe(true);
        expect(finalMessage.content).toBeDefined();

        const fullText = textChunks.join('');
        expect(fullText.length).toBeGreaterThan(0);
    }, 30000);

    it('should handle streaming abort', async () => {
        let textReceived = false;
        let streamAborted = false;

        const stream = client.messages
            .stream({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 1000,
                messages: [
                    {
                        role: 'user',
                        content:
                            'Write a long story about a magical forest. Make it very detailed and long.',
                    },
                ],
            })
            .on('text', () => {
                textReceived = true;
                // Abort the stream after receiving first text chunk
                setTimeout(() => {
                    stream.abort();
                }, 100);
            })
            .on('abort', () => {
                streamAborted = true;
            })
            .on('error', () => {
                // Expected when stream is aborted
            });

        try {
            await stream.finalMessage();
            // Should not reach here if abort works correctly
            expect(false).toBe(true); // Force failure if no abort
        } catch {
            // Expected to throw when aborted
            expect(textReceived).toBe(true);
            expect(streamAborted).toBe(true);
        }
    }, 30000);

    it('should provide access to raw stream events', async () => {
        const rawEvents: unknown[] = [];
        let messageStart = false;
        let messageStop = false;

        // Use the low-level streaming API for more control
        const stream = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 50,
            messages: [
                {
                    role: 'user',
                    content: 'What is 2 + 2?',
                },
            ],
            stream: true,
        });

        for await (const messageStreamEvent of stream) {
            rawEvents.push(messageStreamEvent);

            switch (messageStreamEvent.type) {
                case 'message_start':
                    messageStart = true;
                    break;
                case 'message_stop':
                    messageStop = true;
                    break;
                case 'content_block_delta':
                    if ('text' in messageStreamEvent.delta) {
                    }
                    break;
            }
        }

        // Assertions
        expect(rawEvents.length).toBeGreaterThan(0);
        expect(messageStart).toBe(true);
        expect(messageStop).toBe(true);

        // Check that we have the expected event types
        const eventTypes = rawEvents.map((event) => (event as { type: string; }).type);
        expect(eventTypes).toContain('message_start');
        expect(eventTypes).toContain('message_stop');
        expect(eventTypes).toContain('content_block_start');
        expect(eventTypes).toContain('content_block_stop');
    }, 30000);

    it('should work with async iteration pattern', async () => {
        const textChunks: string[] = [];
        let eventCount = 0;

        const stream = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 75,
            messages: [
                {
                    role: 'user',
                    content: 'List 3 colors in a simple format.',
                },
            ],
            stream: true,
        });

        // Use async iteration to process stream events
        for await (const event of stream) {
            eventCount++;

            if (event.type === 'content_block_delta' && 'text' in event.delta) {
                textChunks.push(event.delta.text);
            }
        }

        // Assertions
        expect(eventCount).toBeGreaterThan(0);
        expect(textChunks.length).toBeGreaterThan(0);

        const fullText = textChunks.join('');
        expect(fullText.length).toBeGreaterThan(0);
    }, 30000);
});
