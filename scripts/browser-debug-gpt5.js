/**
 * Browser Console Debug Script for GPT-5 Issue
 * 
 * Instructions:
 * 1. Open your browser to http://localhost:3000
 * 2. Select GPT-5 from the chat mode dropdown
 * 3. Type "hello" in the chat input
 * 4. Open Developer Tools (F12) and go to Console tab
 * 5. Copy and paste this entire script into the console and press Enter
 * 6. Check the output to see what's wrong
 */

console.log("🔍 GPT-5 Debug Script Starting...\n");

// Check if we're on the right page
console.log("1. Page Check:");
console.log("   Current URL:", window.location.href);
console.log("   Is localhost:3000:", window.location.href.includes("localhost:3000"));

// Check localStorage for API keys
console.log("\n2. API Keys Check:");
try {
    const apiKeysData = localStorage.getItem("api-keys-storage");
    if (apiKeysData) {
        const parsed = JSON.parse(apiKeysData);
        const openaiKey = parsed.state?.keys?.OPENAI_API_KEY;
        console.log("   Has OPENAI_API_KEY:", !!openaiKey);
        console.log("   Key length:", openaiKey?.length || 0);
        console.log("   Key starts with:", openaiKey?.substring(0, 20) || "N/A");
    } else {
        console.log("   ❌ No API keys found in localStorage");
    }
} catch (error) {
    console.log("   ❌ Error reading API keys:", error);
}

// Check current chat mode
console.log("\n3. Chat Mode Check:");
try {
    // Try to find the chat mode from the UI
    const chatModeButton = document.querySelector('[data-testid="chat-mode-button"]') || 
                          document.querySelector('button[aria-label*="mode"]') ||
                          document.querySelector('button:has-text("GPT")');
    
    if (chatModeButton) {
        console.log("   Chat mode button found:", chatModeButton.textContent);
    } else {
        console.log("   ❌ Chat mode button not found");
    }
    
    // Check if there's a Zustand store we can access
    if (window.__ZUSTAND_STORES__) {
        console.log("   Zustand stores available");
    }
} catch (error) {
    console.log("   Error checking chat mode:", error);
}

// Check send button state
console.log("\n4. Send Button Check:");
try {
    const sendButton = document.querySelector('button[aria-label="Send Message"]') ||
                      document.querySelector('button:has(svg)') ||
                      document.querySelector('[data-testid="send-button"]');
    
    if (sendButton) {
        console.log("   Send button found:", !!sendButton);
        console.log("   Send button disabled:", sendButton.disabled);
        console.log("   Send button classes:", sendButton.className);
        
        // Try to click it programmatically to see if there are errors
        console.log("   Attempting programmatic click...");
        sendButton.click();
    } else {
        console.log("   ❌ Send button not found");
    }
} catch (error) {
    console.log("   ❌ Error with send button:", error);
}

// Check for JavaScript errors
console.log("\n5. Error Check:");
const originalError = console.error;
const errors = [];
console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
};

// Check network requests
console.log("\n6. Network Check:");
console.log("   Open Network tab and look for:");
console.log("   - POST requests to /api/completion");
console.log("   - Any 4xx/5xx errors");
console.log("   - Check request payload for correct mode");

// Check text input
console.log("\n7. Text Input Check:");
try {
    const textInput = document.querySelector('textarea') || 
                     document.querySelector('[contenteditable="true"]') ||
                     document.querySelector('input[type="text"]');
    
    if (textInput) {
        console.log("   Text input found:", !!textInput);
        console.log("   Text input value:", textInput.value || textInput.textContent || textInput.innerText);
        console.log("   Text input disabled:", textInput.disabled);
    } else {
        console.log("   ❌ Text input not found");
    }
} catch (error) {
    console.log("   Error checking text input:", error);
}

console.log("\n🎯 Next Steps:");
console.log("1. If API key is missing: Go to settings and add your OpenAI API key");
console.log("2. If send button is disabled: Check if you typed text in the input");
console.log("3. If there are JavaScript errors: Check the Console tab for red errors");
console.log("4. If network requests are missing: There might be a frontend routing issue");
console.log("5. Try refreshing the page and clearing browser cache");

console.log("\n✅ Debug script completed. Check the output above for issues.");
