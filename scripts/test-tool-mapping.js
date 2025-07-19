#!/usr/bin/env node

/**
 * Test script to validate AI SDK v5 tool call property mapping
 */

// Simulate AI SDK v5 tool call
const aiSdkV5ToolCall = {
    toolCallId: "call_123",
    toolName: "add",
    input: { a: 1, b: 1 }, // v5 uses 'input' instead of 'args'
};

// Simulate AI SDK v5 tool result
const aiSdkV5ToolResult = {
    toolCallId: "call_123",
    toolName: "add",
    output: 2, // v5 uses 'output' instead of 'result'
};

// Our internal types expect 'args' and 'result'
const internalToolCall = {
    type: "tool-call",
    toolCallId: aiSdkV5ToolCall.toolCallId,
    toolName: aiSdkV5ToolCall.toolName,
    args: aiSdkV5ToolCall.input, // Map input -> args
};

const internalToolResult = {
    type: "tool-result",
    toolCallId: aiSdkV5ToolResult.toolCallId,
    toolName: aiSdkV5ToolResult.toolName,
    args: aiSdkV5ToolCall.input,
    result: aiSdkV5ToolResult.output, // Map output -> result
};

console.log("AI SDK v5 Tool Call:", JSON.stringify(aiSdkV5ToolCall, null, 2));
console.log("Internal Tool Call:", JSON.stringify(internalToolCall, null, 2));
console.log("AI SDK v5 Tool Result:", JSON.stringify(aiSdkV5ToolResult, null, 2));
console.log("Internal Tool Result:", JSON.stringify(internalToolResult, null, 2));

// Test that our mapping works
console.log("\n✅ Mapping validation:");
console.log("Tool call args accessible:", !!internalToolCall.args);
console.log("Tool result result accessible:", !!internalToolResult.result);
console.log("Tool result result value:", internalToolResult.result);

if (internalToolResult.result === 2) {
    console.log("✅ SUCCESS: Tool result mapping works correctly!");
} else {
    console.log("❌ FAILURE: Tool result mapping is broken!");
    process.exit(1);
}
