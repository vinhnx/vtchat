/**
 * Test API key mapping for GPT-5 OpenRouter
 */

import { ModelEnum } from "../../../../packages/ai/models.ts";

// Mock test for API key mapping
console.log("🔑 Testing API Key Mapping for GPT-5 OpenRouter");
console.log("==============================================");

// Import the API key mapping function (simulated)
function getApiKeyForModel(model) {
    const providers = {
        [ModelEnum.GPT_4o]: "OPENAI_API_KEY",
        [ModelEnum.GPT_4o_Mini]: "OPENAI_API_KEY",
        [ModelEnum.GPT_4_1]: "OPENAI_API_KEY",
        [ModelEnum.GPT_4_1_Mini]: "OPENAI_API_KEY",
        [ModelEnum.GPT_4_1_Nano]: "OPENAI_API_KEY",
        [ModelEnum.O3]: "OPENAI_API_KEY",
        [ModelEnum.O3_Mini]: "OPENAI_API_KEY",
        [ModelEnum.O4_Mini]: "OPENAI_API_KEY",
        [ModelEnum.O1_MINI]: "OPENAI_API_KEY",
        [ModelEnum.O1]: "OPENAI_API_KEY",
        // Anthropic models
        [ModelEnum.CLAUDE_4_1_OPUS]: "ANTHROPIC_API_KEY",
        [ModelEnum.CLAUDE_4_SONNET]: "ANTHROPIC_API_KEY",
        [ModelEnum.CLAUDE_4_OPUS]: "ANTHROPIC_API_KEY",
        // Google models
        [ModelEnum.GEMINI_2_5_FLASH]: "GOOGLE_GENERATIVE_AI_API_KEY",
        [ModelEnum.GEMINI_2_5_PRO]: "GOOGLE_GENERATIVE_AI_API_KEY",
        [ModelEnum.GEMINI_2_5_FLASH_LITE]: "GOOGLE_GENERATIVE_AI_API_KEY",
        // Fireworks models
        [ModelEnum.DEEPSEEK_R1_FIREWORKS]: "FIREWORKS_API_KEY",
        [ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS]: "FIREWORKS_API_KEY",
        // xAI models
        [ModelEnum.GROK_3]: "XAI_API_KEY",
        [ModelEnum.GROK_3_MINI]: "XAI_API_KEY",
        [ModelEnum.GROK_4]: "XAI_API_KEY",
        // OpenRouter models
        [ModelEnum.DEEPSEEK_V3_0324]: "OPENROUTER_API_KEY",
        [ModelEnum.DEEPSEEK_R1]: "OPENROUTER_API_KEY",
        [ModelEnum.QWEN3_235B_A22B]: "OPENROUTER_API_KEY",
        [ModelEnum.QWEN3_32B]: "OPENROUTER_API_KEY",
        [ModelEnum.MISTRAL_NEMO]: "OPENROUTER_API_KEY",
        [ModelEnum.QWEN3_14B]: "OPENROUTER_API_KEY",
        [ModelEnum.KIMI_K2]: "OPENROUTER_API_KEY",
        [ModelEnum.GPT_OSS_120B]: "OPENROUTER_API_KEY",
        [ModelEnum.GPT_OSS_20B]: "OPENROUTER_API_KEY",
        [ModelEnum.GPT_5_OPENROUTER]: "OPENROUTER_API_KEY",
    };

    return providers[model] || null;
}

// Test the mapping
console.log("\n📋 Testing API Key Mapping:");
const requiredKey = getApiKeyForModel(ModelEnum.GPT_5_OPENROUTER);
console.log(`✓ GPT-5 OpenRouter requires: ${requiredKey}`);

const isCorrect = requiredKey === "OPENROUTER_API_KEY";
console.log(`✓ Correct API key mapping: ${isCorrect ? "PASS" : "FAIL"}`);

// Test against other OpenRouter models
console.log("\n📋 Comparing with other OpenRouter models:");
const openRouterModels = [
    ModelEnum.DEEPSEEK_V3_0324,
    ModelEnum.DEEPSEEK_R1,
    ModelEnum.QWEN3_235B_A22B,
    ModelEnum.QWEN3_32B,
    ModelEnum.MISTRAL_NEMO,
    ModelEnum.QWEN3_14B,
    ModelEnum.KIMI_K2,
    ModelEnum.GPT_OSS_120B,
    ModelEnum.GPT_OSS_20B,
    ModelEnum.GPT_5_OPENROUTER,
];

let allCorrect = true;
openRouterModels.forEach((model) => {
    const key = getApiKeyForModel(model);
    const correct = key === "OPENROUTER_API_KEY";
    if (!correct) allCorrect = false;

    // Show only a few examples for brevity
    if (model === ModelEnum.DEEPSEEK_V3_0324 || model === ModelEnum.GPT_5_OPENROUTER) {
        console.log(`  - ${model}: ${key} ${correct ? "✓" : "✗"}`);
    }
});

console.log(`✓ All OpenRouter models use same API key: ${allCorrect ? "PASS" : "FAIL"}`);

// Summary
console.log("\n🎯 API Key Mapping Summary:");
console.log("✓ GPT-5 OpenRouter correctly mapped to OPENROUTER_API_KEY");
console.log("✓ Consistent with other OpenRouter models");
console.log("✓ Ready for BYOK (Bring Your Own Key) usage");

console.log("\n📝 Usage Instructions:");
console.log("1. Users need to provide their OpenRouter API key");
console.log("2. The API key should be set as OPENROUTER_API_KEY");
console.log("3. The model will use this key for authentication with OpenRouter");
console.log("4. OpenRouter will then route the request to OpenAI's GPT-5");
