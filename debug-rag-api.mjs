#!/usr/bin/env node

// Debug script to test RAG API directly
console.log("🔍 Testing RAG API directly...");

const testRAGAPI = async () => {
    try {
        const response = await fetch("http://localhost:3000/api/agent/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "Hello, this is a test message for the RAG chatbot.",
                    },
                ],
                embeddingModel: "text-embedding-004",
                ragChatModel: "gemini-2.5-flash-lite",
                // Test without API keys first to see VT+ vs BYOK error handling
                apiKeys: {},
                profile: {
                    name: "Test User",
                },
            }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log("Response body:", responseText);

        if (!response.ok) {
            console.error("❌ API request failed");
        } else {
            console.log("✅ API request succeeded");
        }
    } catch (error) {
        console.error("🔥 Network/Fetch error:", error.message);
        console.error("Error details:", error);
    }
};

// Wait a bit for server to be ready
console.log("Waiting 3 seconds for server to be ready...");
setTimeout(testRAGAPI, 3000);
