#!/usr/bin/env node

/**
 * LM Studio integration test - DISABLED
 *
 * This test file has been disabled as LM Studio support has been removed
 * from the codebase due to HMR issues with @ai-sdk/groq module.
 *
 * Originally tested:
 * - LM Studio provider initialization
 * - Local model text generation (Llama 3 8B, Qwen 7B, Gemma 3 1B)
 * - Error handling
 *
 * If LM Studio support is re-added in the future, this test can be restored.
 */

console.log("🚫 LM Studio integration test disabled - local model support removed");
console.log("   Reason: HMR issues with provider dependencies");
console.log("   Status: Models removed from codebase");
process.exit(0);
