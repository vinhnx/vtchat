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

import Anthropic from "@anthropic-ai/sdk";

async function testAnthropicStreaming() {
    console.log("🧪 Testing Anthropic API Streaming...\n");

    // Check for API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        console.error("❌ Error: ANTHROPIC_API_KEY environment variable is required");
        console.log("Please set your API key in environment variables or .env file");
        process.exit(1);
    }

    console.log("✅ API key found");

    // Initialize client
    const client = new Anthropic({
        apiKey: apiKey,
    });

    console.log("✅ Anthropic client initialized\n");

    try {
        console.log("🚀 Starting streaming test...\n");

        let textChunks = [];
        let eventCount = 0;

        // Create streaming request
        const stream = client.messages
            .stream({
                model: "claude-3-5-sonnet-20241022",
                max_tokens: 150,
                messages: [
                    {
                        role: "user",
                        content: "Count from 1 to 5 and briefly explain what you are doing.",
                    },
                ],
            })
            .on("connect", () => {
                console.log("🔗 Connected to Anthropic API");
            })
            .on("text", (text) => {
                textChunks.push(text);
                process.stdout.write(text); // Stream text to console in real-time
            })
            .on("streamEvent", (event) => {
                eventCount++;
                if (eventCount === 1) {
                    console.log("\n📡 Receiving stream events...");
                }
            })
            .on("error", (error) => {
                console.error("\n❌ Stream error:", error);
                throw error;
            })
            .on("end", () => {
                console.log("\n\n✅ Stream completed");
            });

        // Wait for completion
        const message = await stream.finalMessage();

        console.log("\n📊 Results:");
        console.log(`- Events received: ${eventCount}`);
        console.log(`- Text chunks: ${textChunks.length}`);
        console.log(`- Total characters: ${textChunks.join("").length}`);
        console.log(`- Model used: ${message.model}`);
        console.log(`- Token usage:`, message.usage);

        console.log("\n🎉 Streaming test completed successfully!");
    } catch (error) {
        console.error("\n❌ Test failed:", error.message);
        if (error.status) {
            console.error(`Status: ${error.status}`);
        }
        process.exit(1);
    }
}

async function testLowLevelStreaming() {
    console.log("\n\n🔬 Testing low-level streaming API...\n");

    const apiKey = process.env.ANTHROPIC_API_KEY;
    const client = new Anthropic({ apiKey });

    try {
        const stream = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 100,
            messages: [
                {
                    role: "user",
                    content: "What is 2 + 2? Give a short answer.",
                },
            ],
            stream: true,
        });

        let eventTypes = [];
        let textContent = "";

        console.log("📡 Processing raw stream events...\n");

        for await (const event of stream) {
            eventTypes.push(event.type);

            switch (event.type) {
                case "message_start":
                    console.log("🟢 Message started");
                    break;
                case "content_block_start":
                    console.log("📝 Content block started");
                    break;
                case "content_block_delta":
                    if (event.delta.type === "text_delta") {
                        textContent += event.delta.text;
                        process.stdout.write(event.delta.text);
                    }
                    break;
                case "content_block_stop":
                    console.log("\n📝 Content block stopped");
                    break;
                case "message_stop":
                    console.log("🔴 Message stopped");
                    break;
            }
        }

        console.log("\n📊 Low-level streaming results:");
        console.log(`- Event types: ${[...new Set(eventTypes)].join(", ")}`);
        console.log(`- Total events: ${eventTypes.length}`);
        console.log(`- Text content: "${textContent}"`);

        console.log("\n🎉 Low-level streaming test completed!");
    } catch (error) {
        console.error("\n❌ Low-level test failed:", error.message);
        process.exit(1);
    }
}

// Run the tests
async function main() {
    console.log("🧪 Anthropic Streaming Test Suite\n");
    console.log("This test will verify that streaming works with your API key.\n");

    await testAnthropicStreaming();
    await testLowLevelStreaming();

    console.log("\n🏆 All tests passed! Your Anthropic API streaming is working correctly.");
}

main().catch(console.error);
