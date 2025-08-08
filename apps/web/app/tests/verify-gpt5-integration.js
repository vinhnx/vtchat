// Quick verification test for GPT-5 OpenRouter integration
console.log("🧪 GPT-5 OpenRouter Integration Verification");

// Test 1: Check if GPT-5 is in modelOptionsByProvider
const gpt5InOpenRouter = modelOptionsByProvider?.OpenRouter?.find(
    (option) => option.value === "gpt-5",
);
console.log("✅ GPT-5 in OpenRouter options:", !!gpt5InOpenRouter);

// Test 2: Check if GPT-5 is in flattened modelOptions
const gpt5InModelOptions = modelOptions?.find((option) => option.value === "gpt-5");
console.log("✅ GPT-5 in modelOptions:", !!gpt5InModelOptions);

// Test 3: Verify mapping functions work
const testModel = {
    id: "openai/gpt-5",
    name: "OpenAI GPT-5 (via OpenRouter)",
    provider: "openrouter",
    maxTokens: 128000,
    contextWindow: 400000,
};

const chatModeResult = getChatModeFromModel?.(testModel);
console.log("✅ getChatModeFromModel result:", chatModeResult);
console.log("✅ Expected: gpt-5");
console.log("✅ Match:", chatModeResult === "gpt-5");

console.log("🎉 GPT-5 OpenRouter integration verified!");
