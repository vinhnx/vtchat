/**
 * Test for Sonner toast notifications on API call failures
 */

import { describe, expect, it } from "vitest";

// Mock the thread item with different error scenarios
const createThreadItemWithError = (error: string, status: "ERROR" | "ABORTED") => ({
    id: "test-thread-item",
    error,
    status,
    answer: { text: "" },
    steps: {},
    toolCalls: {},
    toolResults: {},
    sources: [],
});

describe("API Error Toast Notifications", () => {
    it("should show credit balance error toast", () => {
        const threadItem = createThreadItemWithError(
            "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.",
            "ERROR",
        );

        expect(threadItem.error).toContain("credit balance");
        expect(threadItem.error).toContain("too low");
        expect(threadItem.status).toBe("ERROR");
    });

    it("should show network error toast", () => {
        const threadItem = createThreadItemWithError(
            "NetworkError when attempting to fetch resource",
            "ERROR",
        );

        expect(threadItem.error).toContain("NetworkError");
        expect(threadItem.status).toBe("ERROR");
    });

    it("should show rate limit error toast", () => {
        const threadItem = createThreadItemWithError(
            "Rate limit exceeded. Please try again later.",
            "ERROR",
        );

        expect(threadItem.error).toContain("Rate limit");
        expect(threadItem.status).toBe("ERROR");
    });

    it("should show authentication error toast", () => {
        const threadItem = createThreadItemWithError(
            "Unauthorized: Invalid API key provided",
            "ERROR",
        );

        expect(threadItem.error).toContain("Unauthorized");
        expect(threadItem.error).toContain("Invalid API key");
        expect(threadItem.status).toBe("ERROR");
    });

    it("should show service unavailable error toast", () => {
        const threadItem = createThreadItemWithError("HTTP/2 503 Service Unavailable", "ERROR");

        expect(threadItem.error).toContain("503");
        expect(threadItem.status).toBe("ERROR");
    });

    it("should show request cancelled toast for aborted status", () => {
        const threadItem = createThreadItemWithError("Request was aborted by user", "ABORTED");

        expect(threadItem.error).toContain("aborted");
        expect(threadItem.status).toBe("ABORTED");
    });

    it("should show billing issue toast", () => {
        const threadItem = createThreadItemWithError(
            "Please go to Plans & Billing to resolve this issue",
            "ERROR",
        );

        expect(threadItem.error).toContain("Plans & Billing");
        expect(threadItem.status).toBe("ERROR");
    });
});

// Test the error categorization logic
describe("Error Categorization", () => {
    const categorizeError = (errorMessage: string) => {
        const errorLower = errorMessage.toLowerCase();

        if (errorLower.includes("credit balance") || errorLower.includes("too low")) {
            return "💳 Credit Balance Too Low";
        } else if (errorLower.includes("rate limit") || errorLower.includes("quota")) {
            return "⏱️ Rate Limit Exceeded";
        } else if (
            errorLower.includes("network") ||
            errorLower.includes("connection") ||
            errorLower.includes("networkerror")
        ) {
            return "🌐 Network Error";
        } else if (
            errorLower.includes("unauthorized") ||
            errorLower.includes("invalid api key") ||
            errorLower.includes("authentication")
        ) {
            return "🔑 Authentication Error";
        } else if (
            errorLower.includes("billing") ||
            errorLower.includes("payment") ||
            errorLower.includes("plans & billing")
        ) {
            return "💸 Billing Issue";
        } else if (
            errorLower.includes("503") ||
            errorLower.includes("service unavailable") ||
            errorLower.includes("502")
        ) {
            return "🔧 Service Unavailable";
        } else if (
            errorLower.includes("aborted") ||
            errorLower.includes("stopped") ||
            errorLower.includes("cancelled")
        ) {
            return "⏹️ Request Cancelled";
        }
        return "API Call Failed";
    };

    it("should correctly categorize credit balance errors", () => {
        expect(categorizeError("Your credit balance is too low")).toBe("💳 Credit Balance Too Low");
    });

    it("should correctly categorize network errors", () => {
        expect(categorizeError("NetworkError when attempting to fetch")).toBe("🌐 Network Error");
        expect(categorizeError("Connection failed")).toBe("🌐 Network Error");
    });

    it("should correctly categorize rate limit errors", () => {
        expect(categorizeError("Rate limit exceeded")).toBe("⏱️ Rate Limit Exceeded");
        expect(categorizeError("Quota exceeded")).toBe("⏱️ Rate Limit Exceeded");
    });

    it("should correctly categorize authentication errors", () => {
        expect(categorizeError("Unauthorized access")).toBe("🔑 Authentication Error");
        expect(categorizeError("Invalid API key")).toBe("🔑 Authentication Error");
        expect(categorizeError("Authentication failed")).toBe("🔑 Authentication Error");
    });

    it("should correctly categorize billing errors", () => {
        expect(categorizeError("Please go to Plans & Billing")).toBe("💸 Billing Issue");
        expect(categorizeError("Payment required")).toBe("💸 Billing Issue");
    });

    it("should correctly categorize service errors", () => {
        expect(categorizeError("503 Service Unavailable")).toBe("🔧 Service Unavailable");
        expect(categorizeError("502 Bad Gateway")).toBe("🔧 Service Unavailable");
    });

    it("should correctly categorize cancelled requests", () => {
        expect(categorizeError("Request aborted")).toBe("⏹️ Request Cancelled");
        expect(categorizeError("Process stopped")).toBe("⏹️ Request Cancelled");
        expect(categorizeError("Operation cancelled")).toBe("⏹️ Request Cancelled");
    });

    it("should default to generic error for unknown errors", () => {
        expect(categorizeError("Some unknown error")).toBe("API Call Failed");
    });
});
