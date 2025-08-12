#!/usr/bin/env bun

/**
 * Simple Anthropic Streaming Test
 *
 * This script tests the Anthropic API streaming functionality using your ANTHROPIC_API_KEY.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=your_key_here bun run apps/web/app/tests/simple-anthropic-stream.js
 *
 * Or set the environment variable in your .env file and run:
 *   bun run apps/web/app/tests/simple-anthropic-stream.js
 */

import Anthropic from '@anthropic-ai/sdk';

async function testAnthropicStreaming() {
    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('❌ Error: ANTHROPIC_API_KEY environment variable is required');
    }

    // Initialize client
    const client = new Anthropic({
        apiKey: apiKey,
    });

    try {
        const textChunks = [];

        // Create streaming request
        const stream = client.messages
            .stream({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 150,
                messages: [
                    {
                        role: 'user',
                        content: 'Count from 1 to 5 and briefly explain what you are doing.',
                    },
                ],
            })
            .on('connect', () => {})
            .on('text', (text) => {
                textChunks.push(text);
                process.stdout.write(text); // Stream text to console in real-time
            })
            .on('streamEvent', (_event) => {})
            .on('error', (error) => {
                throw error;
            })
            .on('end', () => {});

        // Wait for completion
        await stream.finalMessage();
    } catch (error) {
        throw new Error(`❌ Test failed: ${error.message}`);
    }
}

async function testLowLevelStreaming() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const client = new Anthropic({ apiKey });

    try {
        const stream = await client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 100,
            messages: [
                {
                    role: 'user',
                    content: 'What is 2 + 2? Give a short answer.',
                },
            ],
            stream: true,
        });

        const eventTypes = [];

        for await (const event of stream) {
            eventTypes.push(event.type);
            switch (event.type) {
                case 'message_start':
                    break;
                case 'content_block_start':
                    break;
                case 'content_block_delta':
                    if (event.delta.type === 'text_delta') {
                        process.stdout.write(event.delta.text);
                    }
                    break;
                case 'content_block_stop':
                    break;
                case 'message_stop':
                    break;
            }
        }
    } catch (error) {
        throw new Error(`❌ Low-level test failed: ${error.message}`);
    }
}

// Run the tests
async function main() {
    try {
        await testAnthropicStreaming();
        await testLowLevelStreaming();
    } catch (error) {
        throw new Error(`❌ Test suite failed: ${error.message}`);
    }
}

main();
