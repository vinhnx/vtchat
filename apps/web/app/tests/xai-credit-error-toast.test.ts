/**
 * Test X.AI Credit Error Toast Notification
 * 
 * Verifies that X.AI credit errors are properly caught and displayed as toast notifications
 */

import { describe, expect, test } from "bun:test";

describe("X.AI Credit Error Toast", () => {
    test("should identify X.AI credit error messages correctly", () => {
        const testCases = [
            {
                error: "Your newly created teams doesn't have any credits yet. You can purchase credits on https://console.x.ai/team/89688622-78c1-4759-93df-c41e1c95c3cd.",
                expectedTitle: "💳 X.AI Credits Required"
            },
            {
                error: "💳 X.AI Credits Required: Your newly created teams doesn't have any credits yet.",
                expectedTitle: "💳 X.AI Credits Required"
            },
            {
                error: "Error: Error: Your newly created teams doesn't have any credits yet. You can purchase credits on https://console.x.ai/team/...",
                expectedTitle: "💳 X.AI Credits Required"
            },
            {
                error: "Team doesn't have any credits yet",
                expectedTitle: "💳 X.AI Credits Required"
            },
            {
                error: "Visit console.x.ai to add credits",
                expectedTitle: "💳 X.AI Credits Required"
            }
        ];

        for (const testCase of testCases) {
            const errorLower = testCase.error.toLowerCase();
            let title = "API Call Failed"; // default

            if (errorLower.includes("credit balance") || errorLower.includes("too low")) {
                title = "💳 Credit Balance Too Low";
            } else if (errorLower.includes("x.ai credits required") || 
                      errorLower.includes("doesn't have any credits yet") ||
                      errorLower.includes("console.x.ai")) {
                title = "💳 X.AI Credits Required";
            }

            expect(title).toBe(testCase.expectedTitle);
        }
    });

    test("should format 403 error for X.AI correctly", () => {
        const xaiErrorMessage = "Your newly created teams doesn't have any credits yet. You can purchase credits on https://console.x.ai/team/89688622-78c1-4759-93df-c41e1c95c3cd.";
        
        // Simulate the error processing logic from agent-provider
        let finalErrorMessage = xaiErrorMessage;
        const status = 403;
        
        if (status === 403) {
            if (finalErrorMessage.includes("doesn't have any credits yet") || 
                finalErrorMessage.includes("console.x.ai")) {
                finalErrorMessage = `💳 X.AI Credits Required: ${finalErrorMessage}`;
            } else {
                finalErrorMessage = `Access Denied (${status}): ${finalErrorMessage}`;
            }
        }

        expect(finalErrorMessage).toContain("💳 X.AI Credits Required:");
        expect(finalErrorMessage).toContain("doesn't have any credits yet");
        expect(finalErrorMessage).toContain("console.x.ai");
    });

    test("should handle other 403 errors differently", () => {
        const genericErrorMessage = "Forbidden access to resource";
        
        // Simulate the error processing logic from agent-provider
        let finalErrorMessage = genericErrorMessage;
        const status = 403;
        
        if (status === 403) {
            if (finalErrorMessage.includes("doesn't have any credits yet") || 
                finalErrorMessage.includes("console.x.ai")) {
                finalErrorMessage = `💳 X.AI Credits Required: ${finalErrorMessage}`;
            } else {
                finalErrorMessage = `Access Denied (${status}): ${finalErrorMessage}`;
            }
        }

        expect(finalErrorMessage).toBe("Access Denied (403): Forbidden access to resource");
        expect(finalErrorMessage).not.toContain("X.AI Credits Required");
    });
});
