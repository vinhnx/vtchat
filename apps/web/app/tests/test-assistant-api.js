/**
 * Manual test for Assistant API functionality
 * Tests both VT+ users (no BYOK) and free users (BYOK required)
 */

// Test configuration
const BASE_URL = "http://localhost:3001";
const ASSISTANT_API_URL = `${BASE_URL}/api/agent/chat`;

// Mock test data
const mockMessages = [
    {
        role: "user",
        content: "Hello, please remember that I work as a software engineer at Google.",
    },
];

const mockProfile = {
    name: "Test User",
    workDescription: "Software Engineer at Google",
};

// Test VT+ user (should work without API keys)
async function testVTPlusUser() {
    console.log("🧪 Testing VT+ user Assistant functionality...");

    try {
        const response = await fetch(ASSISTANT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Add mock authentication headers if needed
                Authorization: "Bearer mock-vt-plus-token",
            },
            body: JSON.stringify({
                messages: mockMessages,
                ragChatModel: "gemini-2.5-flash",
                embeddingModel: "text-embedding-3-small",
                profile: mockProfile,
                // No apiKeys provided - should work for VT+ users
            }),
        });

        if (response.ok) {
            console.log("✅ VT+ user test passed - can use Assistant without API keys");
            return true;
        } else {
            const errorData = await response.json();
            console.log("❌ VT+ user test failed:", errorData);
            return false;
        }
    } catch (error) {
        console.error("❌ VT+ user test error:", error);
        return false;
    }
}

// Test free user (should require API keys)
async function testFreeUser() {
    console.log("🧪 Testing free user Assistant functionality...");

    try {
        // First test without API keys (should fail)
        const responseWithoutKeys = await fetch(ASSISTANT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer mock-free-token",
            },
            body: JSON.stringify({
                messages: mockMessages,
                ragChatModel: "gemini-2.5-flash",
                embeddingModel: "text-embedding-3-small",
                profile: mockProfile,
                // No apiKeys provided - should fail for free users
            }),
        });

        if (responseWithoutKeys.status === 403) {
            console.log("✅ Free user without API keys correctly rejected");
        } else {
            console.log("❌ Free user without API keys should be rejected");
            return false;
        }

        // Test with API keys (should succeed)
        const responseWithKeys = await fetch(ASSISTANT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer mock-free-token",
            },
            body: JSON.stringify({
                messages: mockMessages,
                ragChatModel: "gemini-2.5-flash",
                embeddingModel: "text-embedding-3-small",
                profile: mockProfile,
                apiKeys: {
                    google: "mock-gemini-api-key",
                },
            }),
        });

        if (responseWithKeys.ok) {
            console.log("✅ Free user with API keys can use RAG");
            return true;
        } else {
            const errorData = await responseWithKeys.json();
            console.log("❌ Free user with API keys test failed:", errorData);
            return false;
        }
    } catch (error) {
        console.error("❌ Free user test error:", error);
        return false;
    }
}

// Test non-Gemini model rejection
async function testNonGeminiModelRejection() {
    console.log("🧪 Testing non-Gemini model rejection...");

    try {
        const response = await fetch(ASSISTANT_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer mock-token",
            },
            body: JSON.stringify({
                messages: mockMessages,
                ragChatModel: "gpt-4o", // Non-Gemini model should be rejected
                embeddingModel: "text-embedding-3-small",
                profile: mockProfile,
                apiKeys: {
                    google: "mock-gemini-api-key",
                },
            }),
        });

        if (response.status === 400) {
            const errorData = await response.json();
            if (errorData.error === "Only Gemini models are supported") {
                console.log("✅ Non-Gemini model correctly rejected");
                return true;
            }
        }

        console.log("❌ Non-Gemini model should be rejected");
        return false;
    } catch (error) {
        console.error("❌ Non-Gemini model test error:", error);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log("🚀 Starting RAG API tests...\n");

    const results = {
        vtPlusUser: await testVTPlusUser(),
        freeUser: await testFreeUser(),
        nonGeminiRejection: await testNonGeminiModelRejection(),
    };

    console.log("\n📊 Test Results:");
    console.log("VT+ User Test:", results.vtPlusUser ? "✅ PASSED" : "❌ FAILED");
    console.log("Free User Test:", results.freeUser ? "✅ PASSED" : "❌ FAILED");
    console.log(
        "Non-Gemini Rejection Test:",
        results.nonGeminiRejection ? "✅ PASSED" : "❌ FAILED",
    );

    const allPassed = Object.values(results).every((result) => result === true);
    console.log(`\n${allPassed ? "🎉 All tests passed!" : "⚠️  Some tests failed"}`);

    return allPassed;
}

// Export for use in other test files
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        runAllTests,
        testVTPlusUser,
        testFreeUser,
        testNonGeminiModelRejection,
    };
}

// Run tests if this file is executed directly
if (typeof window === "undefined" && require.main === module) {
    runAllTests();
}
