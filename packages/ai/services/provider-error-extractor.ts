import { log } from "@repo/shared/logger";
import { type ProviderEnumType, Providers } from "../providers";

/**
 * Enhanced error extraction service for AI provider errors
 * Extracts actual error messages from API responses and provides user-friendly translations
 */

export interface ProviderError {
    provider: ProviderEnumType;
    originalError: string;
    errorCode?: string;
    statusCode?: number;
    userMessage: string;
    technicalMessage: string;
    isRetryable: boolean;
    suggestedAction: string;
}

export interface ErrorExtractionResult {
    success: boolean;
    error?: ProviderError;
    fallbackMessage?: string;
}

/**
 * OpenAI Error Patterns and Messages
 */
const OPENAI_ERROR_PATTERNS = {
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
} as const;

const ANTHROPIC_ERROR_PATTERNS = {
    INVALID_API_KEY: /invalid.?api.?key|authentication.?failed|401/i,
    RATE_LIMIT: /rate.?limit|too.?many.?requests|429/i,
    OVERLOADED: /overloaded|service.?unavailable|502|503/i,
    CONTEXT_LENGTH: /context.?length|token.?limit|maximum.?context/i,
    CONTENT_POLICY: /content.?policy|safety|harmful/i,
} as const;

const GOOGLE_ERROR_PATTERNS = {
    INVALID_API_KEY: /invalid.?api.?key|api.?key.?not.?valid|403/i,
    QUOTA_EXCEEDED: /quota.?exceeded|daily.?limit|billing/i,
    RATE_LIMIT: /rate.?limit|too.?many.?requests|429/i,
    SAFETY_SETTINGS: /safety.?settings|blocked.?by.?safety|content.?filter/i,
    MODEL_NOT_FOUND: /model.?not.?found|invalid.?model/i,
} as const;

/**
 * Extract structured error information from API provider errors
 */
export class ProviderErrorExtractor {
    /**
     * Extract and parse error from any AI provider
     */
    static extractError(error: unknown, provider?: ProviderEnumType): ErrorExtractionResult {
        try {
            const errorString = this.getErrorString(error);
            const statusCode = this.extractStatusCode(error);
            
            log.info("Extracting provider error:", {
                provider,
                errorString: errorString.substring(0, 200),
                statusCode,
                errorType: typeof error,
            });

            // Determine provider from error if not provided
            const detectedProvider = provider || this.detectProvider(errorString);
            
            if (!detectedProvider) {
                return {
                    success: false,
                    fallbackMessage: "An unexpected error occurred. Please try again or contact support if the issue persists.",
                };
            }

            const providerError = this.parseProviderError(errorString, detectedProvider, statusCode);
            
            return {
                success: true,
                error: providerError,
            };
        } catch (extractionError) {
            log.error("Error during error extraction:", { extractionError });
            return {
                success: false,
                fallbackMessage: "Unable to process error details. Please try again.",
            };
        }
    }

    /**
     * Convert error to string, handling various error types
     */
    private static getErrorString(error: unknown): string {
        if (typeof error === "string") {
            return error;
        }
        
        if (error instanceof Error) {
            // Try to extract more detailed error from API responses
            const errorObj = error as any;
            
            // Check for nested error messages (common in API SDKs)
            if (errorObj.response?.data?.error?.message) {
                return errorObj.response.data.error.message;
            }
            
            if (errorObj.response?.data?.message) {
                return errorObj.response.data.message;
            }
            
            if (errorObj.body?.error?.message) {
                return errorObj.body.error.message;
            }
            
            if (errorObj.error?.message) {
                return errorObj.error.message;
            }
            
            return error.message;
        }
        
        if (typeof error === "object" && error !== null) {
            const errorObj = error as any;
            
            // Try various common error message paths
            if (errorObj.message) return errorObj.message;
            if (errorObj.error?.message) return errorObj.error.message;
            if (errorObj.details) return errorObj.details;
            
            return JSON.stringify(error);
        }
        
        return String(error);
    }

    /**
     * Extract HTTP status code from error
     */
    private static extractStatusCode(error: unknown): number | undefined {
        if (typeof error === "object" && error !== null) {
            const errorObj = error as any;
            
            // Common status code locations
            if (errorObj.status) return errorObj.status;
            if (errorObj.statusCode) return errorObj.statusCode;
            if (errorObj.response?.status) return errorObj.response.status;
            if (errorObj.response?.statusCode) return errorObj.response.statusCode;
        }
        
        return undefined;
    }

    /**
     * Detect provider from error message patterns
     */
    private static detectProvider(errorString: string): ProviderEnumType | undefined {
        const lowerError = errorString.toLowerCase();
        
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
    }

    /**
     * Parse provider-specific error patterns
     */
    private static parseProviderError(
        errorString: string,
        provider: ProviderEnumType,
        statusCode?: number
    ): ProviderError {
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
    }

    /**
     * Parse OpenAI-specific errors
     */
    private static parseOpenAIError(errorString: string, statusCode?: number): ProviderError {
        if (OPENAI_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.OPENAI,
                originalError: errorString,
                statusCode,
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
                statusCode,
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
                statusCode,
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
                statusCode,
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
                statusCode,
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
                statusCode,
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
            statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with OpenAI's service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check OpenAI's status page.",
        };
    }

    /**
     * Parse Anthropic-specific errors
     */
    private static parseAnthropicError(errorString: string, statusCode?: number): ProviderError {
        if (ANTHROPIC_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.ANTHROPIC,
                originalError: errorString,
                statusCode,
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
                statusCode,
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
            statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with Anthropic's service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and account status.",
        };
    }

    /**
     * Parse Google-specific errors
     */
    private static parseGoogleError(errorString: string, statusCode?: number): ProviderError {
        if (GOOGLE_ERROR_PATTERNS.INVALID_API_KEY.test(errorString)) {
            return {
                provider: Providers.GOOGLE,
                originalError: errorString,
                statusCode,
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
                statusCode,
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
            statusCode,
            errorCode: "UNKNOWN",
            userMessage: "An error occurred with Google's Gemini service.",
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and quota limits.",
        };
    }

    /**
     * Parse other provider errors (OpenRouter, Fireworks, Together, xAI)
     */
    private static parseOpenRouterError(errorString: string, statusCode?: number): ProviderError {
        return this.parseGenericError(errorString, Providers.OPENROUTER, statusCode);
    }

    private static parseFireworksError(errorString: string, statusCode?: number): ProviderError {
        return this.parseGenericError(errorString, Providers.FIREWORKS, statusCode);
    }

    private static parseTogetherError(errorString: string, statusCode?: number): ProviderError {
        return this.parseGenericError(errorString, Providers.TOGETHER, statusCode);
    }

    private static parseXAIError(errorString: string, statusCode?: number): ProviderError {
        return this.parseGenericError(errorString, Providers.XAI, statusCode);
    }

    /**
     * Parse generic provider errors
     */
    private static parseGenericError(
        errorString: string,
        provider: ProviderEnumType,
        statusCode?: number
    ): ProviderError {
        const providerNames = {
            [Providers.OPENAI]: "OpenAI",
            [Providers.ANTHROPIC]: "Anthropic",
            [Providers.GOOGLE]: "Google",
            [Providers.OPENROUTER]: "OpenRouter",
            [Providers.FIREWORKS]: "Fireworks",
            [Providers.TOGETHER]: "Together AI",
            [Providers.XAI]: "xAI",
        };

        const providerName = providerNames[provider] || provider;

        // Generic error patterns
        if (statusCode === 401 || /unauthorized|invalid.?api.?key/i.test(errorString)) {
            return {
                provider,
                originalError: errorString,
                statusCode,
                errorCode: "UNAUTHORIZED",
                userMessage: `Your ${providerName} API key is invalid or has expired.`,
                technicalMessage: errorString,
                isRetryable: false,
                suggestedAction: `Please check your ${providerName} API key in Settings → API Keys.`,
            };
        }

        if (statusCode === 429 || /rate.?limit|too.?many.?requests/i.test(errorString)) {
            return {
                provider,
                originalError: errorString,
                statusCode,
                errorCode: "RATE_LIMIT",
                userMessage: `You've exceeded ${providerName}'s rate limits.`,
                technicalMessage: errorString,
                isRetryable: true,
                suggestedAction: "Please wait a moment before trying again.",
            };
        }

        return {
            provider,
            originalError: errorString,
            statusCode,
            errorCode: "UNKNOWN",
            userMessage: `An error occurred with ${providerName}'s service.`,
            technicalMessage: errorString,
            isRetryable: true,
            suggestedAction: "Please try again. If the issue persists, check your API key and account status.",
        };
    }
}
