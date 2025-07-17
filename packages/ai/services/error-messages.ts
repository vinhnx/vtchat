import { log } from "@repo/shared/logger";
import { type ProviderEnumType, Providers } from "../constants/providers";

/**
 * Centralized error message service for AI provider errors
 * Provides consistent, user-friendly error messages with specific guidance
 */

export interface ErrorContext {
    provider?: ProviderEnumType;
    model?: string;
    userId?: string;
    hasApiKey?: boolean;
    isVtPlus?: boolean;
    errorCode?: string;
    originalError?: string;
}

export interface ErrorMessage {
    title: string;
    message: string;
    action?: string;
    helpUrl?: string;
    upgradeUrl?: string;
    settingsAction?: string;
}

// Provider-specific API key setup URLs
export const PROVIDER_SETUP_URLS = {
    [Providers.OPENAI]: "https://platform.openai.com/api-keys",
    [Providers.ANTHROPIC]: "https://console.anthropic.com/",
    [Providers.TOGETHER]: "https://api.together.xyz/",
    [Providers.GOOGLE]: "https://ai.google.dev/api",
    [Providers.FIREWORKS]: "https://app.fireworks.ai/",
    [Providers.XAI]: "https://x.ai/api",
    [Providers.OPENROUTER]: "https://openrouter.ai/keys",
} as const;

// Provider display names for user-friendly messages
export const PROVIDER_DISPLAY_NAMES = {
    [Providers.OPENAI]: "OpenAI",
    [Providers.ANTHROPIC]: "Anthropic Claude",
    [Providers.TOGETHER]: "Together AI",
    [Providers.GOOGLE]: "Google Gemini",
    [Providers.FIREWORKS]: "Fireworks AI",
    [Providers.XAI]: "xAI Grok",
    [Providers.OPENROUTER]: "OpenRouter",
} as const;

export class ErrorMessageService {
    /**
     * Generate user-friendly error message for missing API key
     */
    static getMissingApiKeyError(context: ErrorContext): ErrorMessage {
        const { provider, isVtPlus } = context;

        if (!provider) {
            return {
                title: "API Key Required",
                message:
                    "An API key is required to use this AI model. Please configure your API keys in Settings.",
                action: "Add API key in Settings → API Keys",
                settingsAction: "open_api_keys",
            };
        }

        const providerName = PROVIDER_DISPLAY_NAMES[provider];
        const setupUrl = PROVIDER_SETUP_URLS[provider];

        // Enhanced messages for cloud providers
        const baseMessage = isVtPlus
            ? `Your VT+ subscription includes server-funded usage, but you can add your own ${providerName} API key for unlimited access and faster responses.`
            : `To use ${providerName} models, you need to provide your own API key. This is free to obtain and gives you direct access to ${providerName}'s latest models.`;

        return {
            title: `${providerName} API Key Required`,
            message: baseMessage,
            action: `1. Visit ${providerName}'s website to get your free API key\n2. Copy the API key\n3. Add it in Settings → API Keys → ${providerName}\n4. Start chatting with ${providerName} models`,
            helpUrl: setupUrl,
            settingsAction: "open_api_keys",
        };
    }

    /**
     * Generate user-friendly error message for invalid API key
     */
    static getInvalidApiKeyError(context: ErrorContext): ErrorMessage {
        const { provider, originalError } = context;

        if (!provider) {
            return {
                title: "Invalid API Key",
                message:
                    "The provided API key appears to be invalid. Please check your API key format and try again.",
                action: "Verify your API key in Settings → API Keys",
                settingsAction: "open_api_keys",
            };
        }

        const providerName = PROVIDER_DISPLAY_NAMES[provider];
        const setupUrl = PROVIDER_SETUP_URLS[provider];

        // Check for specific error patterns
        if (originalError?.includes("unauthorized") || originalError?.includes("401")) {
            return {
                title: `${providerName} Authentication Failed`,
                message: `Your ${providerName} API key is invalid, expired, or doesn't have the required permissions.`,
                action: `1. Check your ${providerName} account is active and has billing set up\n2. Verify your API key hasn't expired\n3. Generate a new API key if needed\n4. Update it in Settings → API Keys → ${providerName}`,
                helpUrl: setupUrl,
                settingsAction: "open_api_keys",
            };
        }

        if (originalError?.includes("forbidden") || originalError?.includes("403")) {
            return {
                title: `${providerName} Access Denied`,
                message: `Your ${providerName} API key doesn't have permission to access this model or your account has billing issues.`,
                action: `1. Check your ${providerName} account billing status\n2. Verify your API key has the required permissions\n3. Try a different model that's available in your plan\n4. Contact ${providerName} support if the issue persists`,
                helpUrl: setupUrl,
                settingsAction: "open_api_keys",
            };
        }

        // Provider-specific format guidance
        const getFormatGuidance = (provider: ProviderEnumType): string => {
            switch (provider) {
                case Providers.OPENAI:
                    return "OpenAI API keys start with 'sk-' followed by 48+ characters";
                case Providers.ANTHROPIC:
                    return "Anthropic API keys start with 'sk-ant-' followed by 95+ characters";
                case Providers.GOOGLE:
                    return "Google API keys start with 'AIza' and are 39 characters long";
                case Providers.OPENROUTER:
                    return "OpenRouter API keys start with 'sk-or-v1-' followed by 64 hex characters";
                case Providers.XAI:
                    return "xAI API keys start with 'xai-' followed by 32+ characters";
                case Providers.FIREWORKS:
                    return "Fireworks API keys are 32+ character alphanumeric strings";
                case Providers.TOGETHER:
                    return "Together AI API keys are 64-character hexadecimal strings";
                default:
                    return "Please check the API key format requirements";
            }
        };

        return {
            title: `${providerName} API Key Invalid`,
            message: `The ${providerName} API key format is incorrect. ${getFormatGuidance(provider)}.`,
            action: `1. Double-check you copied the complete API key\n2. Make sure there are no extra spaces or characters\n3. Generate a new API key if needed\n4. Update it in Settings → API Keys → ${providerName}`,
            helpUrl: setupUrl,
            settingsAction: "open_api_keys",
        };
    }

    /**
     * Generate user-friendly error message for rate limiting
     */
    static getRateLimitError(context: ErrorContext): ErrorMessage {
        const { provider, isVtPlus } = context;

        if (!provider) {
            return {
                title: "Rate Limit Exceeded",
                message:
                    "You've exceeded the rate limit for this service. Please wait a moment before trying again.",
                action: "Wait a few minutes and try again",
            };
        }

        const providerName = PROVIDER_DISPLAY_NAMES[provider];

        if (provider === Providers.GOOGLE && !context.hasApiKey) {
            if (isVtPlus) {
                return {
                    title: "VT+ Rate Limit Reached",
                    message:
                        "You've reached your VT+ usage limit for Gemini models. Add your own API key for unlimited usage.",
                    action: "Add your own Gemini API key in Settings → API Keys → Google Gemini",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            } else {
                return {
                    title: "Free Usage Limit Reached",
                    message:
                        "You've reached the daily limit for free Gemini usage. Add your own API key or upgrade to VT+ for higher limits.",
                    action: "Add your own Gemini API key for unlimited usage",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    upgradeUrl: "/pricing",
                    settingsAction: "open_api_keys",
                };
            }
        }

        return {
            title: `${providerName} Rate Limit`,
            message: `You've exceeded the rate limit for ${providerName}. This is typically temporary and will reset shortly.`,
            action: "Wait a few minutes and try again, or try a different model",
        };
    }

    /**
     * Generate user-friendly error message for network issues
     */
    static getNetworkError(context: ErrorContext): ErrorMessage {
        const { provider, originalError } = context;
        const providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";

        if (originalError?.includes("timeout") || originalError?.includes("ETIMEDOUT")) {
            return {
                title: "Request Timeout",
                message: `The request to ${providerName} timed out. This might be due to network issues or high server load.`,
                action: "Check your internet connection and try again",
            };
        }

        return {
            title: "Network Connection Error",
            message: `Unable to connect to ${providerName}. Please check your internet connection.`,
            action: "Check your internet connection and try again",
        };
    }

    /**
     * Generate user-friendly error message for service unavailable
     */
    static getServiceUnavailableError(context: ErrorContext): ErrorMessage {
        const { provider, originalError } = context;
        const providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";

        if (originalError?.includes("model not found")) {
            return {
                title: "Model Not Available",
                message: `The requested model is not available on ${providerName}. It may have been deprecated or renamed.`,
                action: "Try a different model or check the provider's documentation",
                helpUrl: provider ? PROVIDER_SETUP_URLS[provider] : undefined,
            };
        }

        if (
            originalError?.includes("502") ||
            originalError?.includes("503") ||
            originalError?.includes("504")
        ) {
            return {
                title: `${providerName} Temporarily Unavailable`,
                message: `${providerName} is experiencing technical difficulties. This is usually temporary.`,
                action: "Try again in a few minutes or use a different model",
            };
        }

        return {
            title: "Service Unavailable",
            message: `${providerName} is currently unavailable. This might be due to maintenance or high demand.`,
            action: "Try again later or use a different AI provider",
        };
    }

    /**
     * Generate user-friendly error message for quota exceeded
     */
    static getQuotaExceededError(context: ErrorContext): ErrorMessage {
        const { provider, isVtPlus } = context;
        const providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";

        if (provider === Providers.GOOGLE && !context.hasApiKey) {
            if (isVtPlus) {
                return {
                    title: "VT+ Monthly Quota Exceeded",
                    message:
                        "You've used all your VT+ quota for this month. Add your own API key for unlimited usage.",
                    action: "Add your own Gemini API key in Settings → API Keys → Google Gemini",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            } else {
                return {
                    title: "Free Quota Exceeded",
                    message:
                        "You've reached your free usage limit. Upgrade to VT+ or add your own API key for continued access.",
                    action: "Upgrade to VT+ or add your own API key",
                    upgradeUrl: "/pricing",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            }
        }

        return {
            title: "Usage Quota Exceeded",
            message: `You've exceeded your usage quota for ${providerName}. This may reset daily or monthly depending on your plan.`,
            action: "Wait for quota reset or upgrade your plan",
            upgradeUrl: "/pricing",
        };
    }

    /**
     * Main method to generate appropriate error message based on error type
     */
    static generateErrorMessage(error: Error | string, context: ErrorContext = {}): ErrorMessage {
        const errorString = typeof error === "string" ? error : error.message;
        const errorLower = errorString.toLowerCase();

        // Log the error for debugging (without exposing sensitive data)
        log.error("Generating user-friendly error message", {
            provider: context.provider,
            model: context.model,
            hasApiKey: context.hasApiKey,
            isVtPlus: context.isVtPlus,
            errorType: typeof error,
            errorLength: errorString.length,
        });

        // Determine error type and generate appropriate message
        if (
            errorLower.includes("api key required") ||
            errorLower.includes("missing api key") ||
            errorLower.includes("no api key")
        ) {
            return ErrorMessageService.getMissingApiKeyError(context);
        }

        if (
            errorLower.includes("invalid api key") ||
            errorLower.includes("unauthorized") ||
            errorLower.includes("forbidden") ||
            errorLower.includes("401") ||
            errorLower.includes("403")
        ) {
            return ErrorMessageService.getInvalidApiKeyError({
                ...context,
                originalError: errorString,
            });
        }

        if (
            errorLower.includes("rate limit") ||
            errorLower.includes("too many requests") ||
            errorLower.includes("429")
        ) {
            return ErrorMessageService.getRateLimitError(context);
        }

        if (
            errorLower.includes("quota exceeded") ||
            errorLower.includes("usage limit") ||
            errorLower.includes("billing")
        ) {
            return ErrorMessageService.getQuotaExceededError(context);
        }

        if (
            errorLower.includes("network") ||
            errorLower.includes("connection") ||
            errorLower.includes("econnrefused") ||
            errorLower.includes("econnreset") ||
            errorLower.includes("etimedout") ||
            errorLower.includes("timeout")
        ) {
            return ErrorMessageService.getNetworkError({ ...context, originalError: errorString });
        }

        if (
            errorLower.includes("service unavailable") ||
            errorLower.includes("model not found") ||
            errorLower.includes("502") ||
            errorLower.includes("503") ||
            errorLower.includes("504")
        ) {
            return ErrorMessageService.getServiceUnavailableError({
                ...context,
                originalError: errorString,
            });
        }

        // Generic fallback error
        return {
            title: "AI Service Error",
            message:
                "An unexpected error occurred while processing your request. Please try again or contact support if the issue persists.",
            action: "Try again with a different model or check your settings",
            settingsAction: "open_api_keys",
        };
    }
}

// Export convenience functions
export const generateErrorMessage = (
    error: Error | string,
    context: ErrorContext = {},
): ErrorMessage => ErrorMessageService.generateErrorMessage(error, context);

export const getMissingApiKeyError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getMissingApiKeyError(context);

export const getInvalidApiKeyError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getInvalidApiKeyError(context);

export const getRateLimitError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getRateLimitError(context);

export const getNetworkError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getNetworkError(context);

export const getServiceUnavailableError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getServiceUnavailableError(context);

export const getQuotaExceededError = (context: ErrorContext): ErrorMessage =>
    ErrorMessageService.getQuotaExceededError(context);
