// Test script to verify embedding dimension fix
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testEmbeddingDimensions() {
    console.log("Testing Gemini embedding dimensions...");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        const testText = "This is a test text for embedding dimension verification.";
        console.log(`📝 Testing with text: "${testText}"`);

        const result = await model.embedContent(testText);
        const embedding = result.embedding.values;

        console.log("✅ Successfully generated embedding");
        console.log(`📊 Embedding dimensions: ${embedding.length}`);
        console.log("🎯 Expected dimensions: 3072");

        if (embedding.length === 3072) {
            console.log("✅ Dimension test PASSED - Gemini produces 3072 dimensions");
        } else if (embedding.length === 768) {
            console.log("⚠️  Dimension test shows 768 dimensions (legacy model)");
        } else {
            console.log(`❓ Unexpected dimension count: ${embedding.length}`);
        }

        console.log(
            `🔢 First 5 values: [${embedding
                .slice(0, 5)
                .map((v) => v.toFixed(4))
                .join(", ")}...]`,
        );
    } catch (error) {
        console.error("❌ Error testing embedding dimensions:", error.message);
        process.exit(1);
    }
}

testEmbeddingDimensions();
