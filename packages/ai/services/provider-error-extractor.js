import { log } from "@repo/shared/logger";
import { Providers } from "../providers";
/**
 * OpenAI Error Patterns and Messages
 */
var OPENAI_ERROR_PATTERNS = {
    // Authentication errors
    INVALID_API_KEY: /invalid.?api.?key|unauthorized|401/i,
    INSUFFICIENT_QUOTA: /insufficient.?quota|exceeded.?quota|billing/i,
    RATE_LIMIT: /rate.?limit|too.?many.?requests|429/i,
    // Model errors
    MODEL_NOT_FOUND: /model.?not.?found|invalid.?model|404/i,
    MODEL_OVERLOADED: /model.?overloaded|service.?unavailable|502|503/i,
    // Request errors
    CONTEXT_LENGTH: /context.?length|token.?limit|maximum.?context/i,
    INVALID_REQUEST: /invalid.?request|bad.?request|400/i,
    // Content policy
    CONTENT_POLICY: /content.?policy|safety|moderation/i,
};
var ANTHROPIC_ERROR_PATTERNS = {
    INVALID_API_KEY: /invalid.?api.?key|authentication.?failed|401/i,
    RATE_LIMIT: /rate.?limit|too.?many.?requests|429/i,
    OVERLOADED: /overloaded|service.?unavailable|502|503/i,
    CONTEXT_LENGTH: /context.?length|token.?limit|maximum.?context/i,
    CONTENT_POLICY: /content.?policy|safety|harmful/i,
};
var GOOGLE_ERROR_PATTERNS = {
    INVALID_API_KEY: /invalid.?api.?key|api.?key.?not.?valid|403/i,
    QUOTA_EXCEEDED: /quota.?exceeded|daily.?limit|billing/i,
    RATE_LIMIT: /rate.?limit|too.?many.?requests|429/i,
    SAFETY_SETTINGS: /safety.?settings|blocked.?by.?safety|content.?filter/i,
    MODEL_NOT_FOUND: /model.?not.?found|invalid.?model/i,
};
/**
 * Extract structured error information from API provider errors
 */
var ProviderErrorExtractor = /** @class */ (function () {
    function ProviderErrorExtractor() {
    }
    /**
     * Extract and parse error from any AI provider
     */
    ProviderErrorExtractor.extractError = function (error, provider) {
        try {
            var errorString = this.getErrorString(error);
            var statusCode = this.extractStatusCode(error);
            log.info("Extracting provider error:", {
                provider: provider,
                errorString: errorString.substring(0, 200),
                statusCode: statusCode,
                errorType: typeof error,
            });
            // Determine provider from error if not provided
            var detectedProvider = provider || this.detectProvider(errorString);
            if (!detectedProvider) {
                return {
                    success: false,
                    fallbackMessage: "An unexpected error occurred. Please try again or contact support if the issue persists.",
                };
            }
            var providerError = this.parseProviderError(errorString, detectedProvider, statusCode);
            return {
                success: true,
                error: providerError,
            };
        }
        catch (extractionError) {
            log.error("Error during error extraction:", { extractionError: extractionError });
            return {
                success: false,
                fallbackMessage: "Unable to process error details. Please try again.",
            };
        }
    };
    /**
     * Convert error to string, handling various error types
     */
    ProviderErrorExtractor.getErrorString = function (error) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (typeof error === "string") {
            return error;
        }
        if (error instanceof Error) {
            // Try to extract more detailed error from API responses
            var errorObj = error;
            // Check for nested error messages (common in API SDKs)
            if ((_c = (_b = (_a = errorObj.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) {
                return errorObj.response.data.error.message;
            }
            if ((_e = (_d = errorObj.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) {
                return errorObj.response.data.message;
            }
            if ((_g = (_f = errorObj.body) === null || _f === void 0 ? void 0 : _f.error) === null || _g === void 0 ? void 0 : _g.message) {
                return errorObj.body.error.message;
            }
            if ((_h = errorObj.error) === null || _h === void 0 ? void 0 : _h.message) {
                return errorObj.error.message;
            }
            return error.message;
        }
        if (typeof error === "object" && error !== null) {
            var errorObj = error;
            // Try various common error message paths
            if (errorObj.message)
                return errorObj.message;
            if ((_j = errorObj.error) === null || _j === void 0 ? void 0 : _j.message)
                return errorObj.error.message;
            if (errorObj.details)
                return errorObj.details;
            return JSON.stringify(error);
        }
        return String(error);
    };
    /**
     * Extract HTTP status code from error
     */
    ProviderErrorExtractor.extractStatusCode = function (error) {
        var _a, _b;
        if (typeof error === "object" && error !== null) {
            var errorObj = error;
            // Common status code locations
            if (errorObj.status)
                return errorObj.status;
            if (errorObj.statusCode)
                return errorObj.statusCode;
            if ((_a = errorObj.response) === null || _a === void 0 ? void 0 : _a.status)
                return errorObj.response.status;
            if ((_b = errorObj.response) === null || _b === void 0 ? void 0 : _b.statusCode)
                return errorObj.response.statusCode;
        }
        return undefined;
    };
    /**
     * Detect provider from error message patterns
     */
    ProviderErrorExtractor.detectProvider = function (errorString) {
        var lowerError = errorString.toLowerCase();
        if (lowerError.includes("openai") || lowerError.includes("gpt")) {
            return Providers.OPENAI;
        }
        if (lowerError.includes("anthropic") || lowerError.includes("claude")) {
            return Providers.ANTHROPIC;
        }
        if (lowerError.includes("google") || lowerError.includes("gemini")) {
            return Providers.GOOGLE;
        }
        if (lowerError.includes("openrouter")) {
            return Providers.OPENROUTER;
        }
        if (lowerError.includes("fireworks")) {
            return Providers.FIREWORKS;
        }
        if (lowerError.includes("together")) {
            return Providers.TOGETHER;
        }
        if (lowerError.includes("xai") || lowerError.includes("grok")) {
            return Providers.XAI;
        }
        return undefined;
    };
    /**
     * Parse provider-specific error patterns
     */
    ProviderErrorExtractor.parseProviderError = function (errorString, provider, statusCode) {
        switch (provider) {
            case Providers.OPENAI:
                return this.parseOpenAIError(errorString, statusCode);
            case Providers.ANTHROPIC:
                return this.parseAnthropicError(errorString, statusCode);
            case Providers.GOOGLE:
                return this.parseGoogleError(errorString, statusCode);
            case Providers.OPENROUTER:
                return this.parseOpenRouterError(errorString, statusCode);
            case Providers.FIREWORKS:
                return this.parseFireworksError(errorString, statusCode);
            case Providers.TOGETHER:
                return this.parseTogetherError(errorString, statusCode);
            case Providers.XAI:
                return this.parseXAIError(errorString, statusCode);
            default:
                return this.parseGenericError(errorString, provider, statusCode);
        }
    };
    /**
     * Parse OpenAI-specific errors
     */
    ProviderErrorExtractor.parseOpenAIError = function (errorString, statusCode) {
        if (OPENAI_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "INVALID_API_KEY",
                userMessage: "Your OpenAI API key is invalid or has expired.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please check your OpenAI API key in Settings → API Keys. Make sure it starts with 'sk-' and is copied correctly.",
            };
        }
        if (OPENAI_ERROR_PATTERNS.INSUFFICIENT_QUOTA.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "INSUFFICIENT_QUOTA",
                userMessage: "Your OpenAI account has insufficient credits or billing issues.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please add credits to your OpenAI account or check your billing settings at platform.openai.com.",
            };
        }
        if (OPENAI_ERROR_PATTERNS.RATE_LIMIT.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "RATE_LIMIT",
                userMessage: "You've exceeded OpenAI's rate limits. Please wait a moment before trying again.",
                technicalMessage: errorString,
                isRetryable: true,
                suggestedAction: "Wait a few seconds and try again. Consider upgrading your OpenAI plan for higher rate limits.",
            };
        }
        if (OPENAI_ERROR_PATTERNS.MODEL_NOT_FOUND.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "MODEL_NOT_FOUND",
                userMessage: "The requested OpenAI model is not available or doesn't exist.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Try selecting a different model like GPT-4o or GPT-4o Mini.",
            };
        }
        if (OPENAI_ERROR_PATTERNS.CONTEXT_LENGTH.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "CONTEXT_LENGTH",
                userMessage: "Your message is too long for the selected model's context window.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Try shortening your message or start a new conversation.",
            };
        }
        if (OPENAI_ERROR_PATTERNS.CONTENT_POLICY.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "CONTENT_POLICY",
                userMessage: "Your request was blocked by OpenAI's content policy.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please rephrase your request to comply with OpenAI's usage policies.",
            };
        }
        // Default OpenAI error
        return {
            provider: Providers.OPENAI,
            originalError: errorString,
            statusCode: statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with OpenAI's service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check OpenAI's status page.",
        };
    };
    /**
     * Parse Anthropic-specific errors
     */
    ProviderErrorExtractor.parseAnthropicError = function (errorString, statusCode) {
        if (ANTHROPIC_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.ANTHROPIC,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "INVALID_API_KEY",
                userMessage: "Your Anthropic API key is invalid or has expired.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please check your Anthropic API key in Settings → API Keys. Make sure it starts with 'sk-ant-' and is copied correctly.",
            };
        }
        if (ANTHROPIC_ERROR_PATTERNS.RATE_LIMIT.test(errorString)) {
            return {
                provider: Providers.ANTHROPIC,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "RATE_LIMIT",
                userMessage: "You've exceeded Anthropic's rate limits. Please wait before trying again.",
                technicalMessage: errorString,
                isRetryable: true,
                suggestedAction: "Wait a moment and try again. Consider upgrading your Anthropic plan for higher limits.",
            };
        }
        // Default Anthropic error
        return {
            provider: Providers.ANTHROPIC,
            originalError: errorString,
            statusCode: statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with Anthropic's service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and account status.",
        };
    };
    /**
     * Parse Google-specific errors
     */
    ProviderErrorExtractor.parseGoogleError = function (errorString, statusCode) {
        if (GOOGLE_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.GOOGLE,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "INVALID_API_KEY",
                userMessage: "Your Google API key is invalid or doesn't have the required permissions.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please check your Google API key in Settings → API Keys. Make sure it starts with 'AIza' and has Generative AI permissions enabled.",
            };
        }
        if (GOOGLE_ERROR_PATTERNS.SAFETY_SETTINGS.test(errorString)) {
            return {
                provider: Providers.GOOGLE,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "SAFETY_FILTER",
                userMessage: "Your request was blocked by Google's safety filters.",
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please rephrase your request to avoid content that might trigger safety filters.",
            };
        }
        // Default Google error
        return {
            provider: Providers.GOOGLE,
            originalError: errorString,
            statusCode: statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with Google's Gemini service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and quota limits.",
        };
    };
    /**
     * Parse other provider errors (OpenRouter, Fireworks, Together, xAI)
     */
    ProviderErrorExtractor.parseOpenRouterError = function (errorString, statusCode) {
        return this.parseGenericError(errorString, Providers.OPENROUTER, statusCode);
    };
    ProviderErrorExtractor.parseFireworksError = function (errorString, statusCode) {
        return this.parseGenericError(errorString, Providers.FIREWORKS, statusCode);
    };
    ProviderErrorExtractor.parseTogetherError = function (errorString, statusCode) {
        return this.parseGenericError(errorString, Providers.TOGETHER, statusCode);
    };
    ProviderErrorExtractor.parseXAIError = function (errorString, statusCode) {
        return this.parseGenericError(errorString, Providers.XAI, statusCode);
    };
    /**
     * Parse generic provider errors
     */
    ProviderErrorExtractor.parseGenericError = function (errorString, provider, statusCode) {
        var _a;
        var providerNames = (_a = {},
            _a[Providers.OPENAI] = "OpenAI",
            _a[Providers.ANTHROPIC] = "Anthropic",
            _a[Providers.GOOGLE] = "Google",
            _a[Providers.OPENROUTER] = "OpenRouter",
            _a[Providers.FIREWORKS] = "Fireworks",
            _a[Providers.TOGETHER] = "Together AI",
            _a[Providers.XAI] = "xAI",
            _a);
        var providerName = providerNames[provider] || provider;
        // Generic error patterns
        if (statusCode === 401 || /unauthorized|invalid.?api.?key/i.test(errorString)) {
            return {
                provider: provider,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "UNAUTHORIZED",
                userMessage: "Your ".concat(providerName, " API key is invalid or has expired."),
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: "Please check your ".concat(providerName, " API key in Settings \u2192 API Keys."),
            };
        }
        if (statusCode === 429 || /rate.?limit|too.?many.?requests/i.test(errorString)) {
            return {
                provider: provider,
                originalError: errorString,
                statusCode: statusCode,
                errorCode: "RATE_LIMIT",
                userMessage: "You've exceeded ".concat(providerName, "'s rate limits."),
                technicalMessage: errorString,
                isRetryable: true,
                suggestedAction: "Please wait a moment before trying again.",
            };
        }
        return {
            provider: provider,
            originalError: errorString,
            statusCode: statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with ".concat(providerName, "'s service."),
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and account status.",
        };
    };
    return ProviderErrorExtractor;
}());
export { ProviderErrorExtractor };
