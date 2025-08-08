// Test script to check if GPT-5 is in the models array and mapped correctly
const { models } = require("../../../../packages/ai/models.ts");
const { ChatMode } = require("../../../../packages/shared/config/chat-mode.ts");
const {
    getChatModeFromModel,
    generateModelOptionsForProvider,
} = require("../../../../packages/common/components/chat-input/chat-config.tsx");

console.log("=== GPT-5 OpenRouter Integration Test ===\n");

// 1. Check if GPT-5 is in the models array
const gpt5Model = models.find((model) => model.id === "openai/gpt-5");
console.log("1. GPT-5 Model found in models array:", !!gpt5Model);
if (gpt5Model) {
    console.log("   Model details:", {
        id: gpt5Model.id,
        name: gpt5Model.name,
        provider: gpt5Model.provider,
        maxTokens: gpt5Model.maxTokens,
        contextWindow: gpt5Model.contextWindow,
    });
}

// 2. Check if getChatModeFromModel works for GPT-5
if (gpt5Model) {
    const chatMode = getChatModeFromModel(gpt5Model);
    console.log("\n2. getChatModeFromModel result:", chatMode);
    console.log("   Expected:", ChatMode.GPT_5_OPENROUTER);
    console.log("   Match:", chatMode === ChatMode.GPT_5_OPENROUTER);
}

// 3. Check OpenRouter models in dropdown options
const openrouterOptions = generateModelOptionsForProvider("openrouter");
console.log("\n3. OpenRouter model options:");
openrouterOptions.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option.label} (${option.value})`);
});

// 4. Check if GPT-5 is in the options
const gpt5Option = openrouterOptions.find((option) => option.value === ChatMode.GPT_5_OPENROUTER);
console.log("\n4. GPT-5 in dropdown options:", !!gpt5Option);
if (gpt5Option) {
    console.log("   Option details:", gpt5Option);
}

// 5. All OpenRouter models
console.log("\n5. All OpenRouter models in models array:");
const openrouterModels = models.filter((model) => model.provider === "openrouter");
openrouterModels.forEach((model, index) => {
    console.log(`   ${index + 1}. ${model.name} (${model.id})`);
});

console.log("\n=== Test Complete ===");
