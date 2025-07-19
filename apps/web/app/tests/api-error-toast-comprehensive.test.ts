import { describe, expect, it } from "vitest";

// Test error message categorization for the toast notifications
describe("API Error Toast Comprehensive Tests", () => {
    const getToastInfoForError = (errorMessage: string) => {
        let variant: "destructive" | "default" = "destructive";
        let title = "API Call Failed";

        const errorLower = errorMessage.toLowerCase();

        if (errorLower.includes("credit balance") || errorLower.includes("too low")) {
            title = "💳 Credit Balance Too Low";
        } else if (errorLower.includes("rate limit") || errorLower.includes("quota")) {
            title = "⏱️ Rate Limit Exceeded";
        } else if (
            errorLower.includes("network") ||
            errorLower.includes("connection") ||
            errorLower.includes("networkerror")
        ) {
            title = "🌐 Network Error";
        } else if (
            errorLower.includes("unauthorized") ||
            errorLower.includes("invalid api key") ||
            errorLower.includes("authentication")
        ) {
            title = "🔑 Authentication Error";
        } else if (
            errorLower.includes("billing") ||
            errorLower.includes("payment") ||
            errorLower.includes("plans & billing")
        ) {
            title = "💸 Billing Issue";
        } else if (
            errorLower.includes("503") ||
            errorLower.includes("service unavailable") ||
            errorLower.includes("502")
        ) {
            title = "🔧 Service Unavailable";
        } else if (
            errorLower.includes("aborted") ||
            errorLower.includes("stopped") ||
            errorLower.includes("cancelled")
        ) {
            title = "⏹️ Request Cancelled";
            variant = "default";
        }

        return { title, variant };
    };

    it("should correctly categorize Anthropic credit balance error from console", () => {
        const errorMessage =
            "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("💳 Credit Balance Too Low");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize OpenAI credit errors", () => {
        const errorMessage =
            "You exceeded your current quota, please check your plan and billing details.";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("⏱️ Rate Limit Exceeded");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize authentication errors", () => {
        const errorMessage = "Invalid API key provided";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("🔑 Authentication Error");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize network errors", () => {
        const errorMessage = "NetworkError when attempting to fetch resource";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("🌐 Network Error");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize 503 service errors", () => {
        const errorMessage = "Service Error (503): Service temporarily unavailable";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("🔧 Service Unavailable");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize cancelled requests with default variant", () => {
        const errorMessage = "Request was cancelled by user";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("⏹️ Request Cancelled");
        expect(result.variant).toBe("default");
    });

    it("should categorize billing issues", () => {
        const errorMessage = "Payment method declined. Please update billing information.";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("💸 Billing Issue");
        expect(result.variant).toBe("destructive");
    });

    it("should handle generic errors", () => {
        const errorMessage = "Something unexpected happened";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("API Call Failed");
        expect(result.variant).toBe("destructive");
    });

    it("should handle empty error messages", () => {
        const errorMessage = "";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("API Call Failed");
        expect(result.variant).toBe("destructive");
    });

    it("should categorize case-insensitive errors", () => {
        const errorMessage = "CREDIT BALANCE TOO LOW";
        const result = getToastInfoForError(errorMessage);

        expect(result.title).toBe("💳 Credit Balance Too Low");
    });
});

describe("Error Message Processing", () => {
    it("should extract meaningful error from nested API responses", () => {
        // Test the logic that would be used in agent-provider.tsx
        const mockResponse = {
            error: {
                message:
                    "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.",
            },
        };

        let finalErrorMessage = "";
        const errorText = JSON.stringify(mockResponse);

        try {
            const errorData = JSON.parse(errorText);
            if (errorData.message) {
                finalErrorMessage = errorData.message;
            } else if (errorData.error?.message) {
                finalErrorMessage = errorData.error.message;
            } else if (errorData.detail) {
                finalErrorMessage = errorData.detail;
            }
        } catch {
            finalErrorMessage = errorText;
        }

        expect(finalErrorMessage).toBe(
            "Your credit balance is too low to access the Anthropic API. Please go to Plans & Billing to upgrade or purchase credits.",
        );
    });

    it("should handle malformed JSON gracefully", () => {
        const malformedJson = "{ invalid json }";
        let finalErrorMessage = "";

        try {
            const errorData = JSON.parse(malformedJson);
            finalErrorMessage = errorData.message || "Parsed error";
        } catch {
            finalErrorMessage = malformedJson;
        }

        expect(finalErrorMessage).toBe("{ invalid json }");
    });
});
