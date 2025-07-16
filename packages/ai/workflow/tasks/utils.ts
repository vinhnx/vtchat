/**
 * @deprecated Use the centralized error message service instead
 * Import from "@repo/ai/services/error-messages"
 */
export const generateErrorMessage = async (error: Error | string, context: any = {}) => {
    try {
        // Use the centralized error message service
        const { generateErrorMessage: centralizedGenerator } = await import(
            "../services/error-messages"
        );
        const result = centralizedGenerator(error, context);
        return result.message;
    } catch (serviceError) {
        // Fallback to basic error handling if service fails
        const errorMessage = error instanceof Error ? error.message : error;

        // Basic error type detection for fallback
        if (errorMessage.includes("429")) {
            return "You have reached the limit of requests per minute. Please try again later.";
        }
        if (errorMessage.includes("401") || errorMessage.includes("403")) {
            return "You are not authorized to access this resource. Please try again.";
        }
        if (errorMessage.toLowerCase().includes("timeout")) {
            return "The request timed out. Please try again.";
        }
        if (
            errorMessage.toLowerCase().includes("api") &&
            errorMessage.toLowerCase().includes("key")
        ) {
            return "The API key is invalid. Please try again.";
        }

        // LM Studio specific error handling (preserve existing logic)
        if (/ECONNREFUSED.*localhost/i.test(errorMessage)) {
            return "Local LM Studio server is not reachable. Ensure it is running (e.g. `lms server start --cors`).";
        }
        if (/fetch failed.*localhost/i.test(errorMessage)) {
            return "Cannot connect to LM Studio. Ensure the server is running on the correct port.";
        }

        return "Something went wrong. Please try again later.";
    }
};
