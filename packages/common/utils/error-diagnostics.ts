/**
 * Error diagnostics utility for providing helpful error messages and troubleshooting steps
 */

interface ErrorDiagnostic {
    message: string;
    suggestions: string[];
    category: "connection" | "auth" | "rate_limit" | "model" | "config" | "unknown";
}

export const generateErrorDiagnostic = (_error: unknown): ErrorDiagnostic => {
    // Generic fallback with helpful diagnostics
    return {
        message: "An unexpected error occurred while processing your request.",
        suggestions: [
            "Check your credit balance with your LLM provider (OpenAI, Anthropic, etc.)",
            "Verify your BYOK setup in Settings → API Keys",
            "Add credits or update billing information with your provider",
            "Try submitting your request again",
            "Refresh the page and try once more",
            "Try using a different AI model from the dropdown",
            "Check your internet connection",
            "Clear your browser cache if issues persist",
            "Contact our Support if the problem continues",
        ],
        category: "unknown",
    };
};

export const formatErrorMessage = (diagnostic: ErrorDiagnostic): string => {
    const suggestions = diagnostic.suggestions
        .map((suggestion, index) => `${index + 1}. ${suggestion}`)
        .join("\n");

    return `${diagnostic.message}\n\n🔧 Try these steps:\n${suggestions}`;
};

export const getErrorDiagnosticMessage = (error: unknown): string => {
    const diagnostic = generateErrorDiagnostic(error);
    return formatErrorMessage(diagnostic);
};
