var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b;
import { log } from "@repo/shared/logger";
import { Providers } from "../constants/providers";
// Provider-specific API key setup URLs
export var PROVIDER_SETUP_URLS = (_a = {},
    _a[Providers.OPENAI] = "https://platform.openai.com/api-keys",
    _a[Providers.ANTHROPIC] = "https://console.anthropic.com/",
    _a[Providers.TOGETHER] = "https://api.together.xyz/",
    _a[Providers.GOOGLE] = "https://ai.google.dev/api",
    _a[Providers.FIREWORKS] = "https://app.fireworks.ai/",
    _a[Providers.XAI] = "https://x.ai/api",
    _a[Providers.OPENROUTER] = "https://openrouter.ai/keys",
    _a);
// Provider display names for user-friendly messages
export var PROVIDER_DISPLAY_NAMES = (_b = {},
    _b[Providers.OPENAI] = "OpenAI",
    _b[Providers.ANTHROPIC] = "Anthropic Claude",
    _b[Providers.TOGETHER] = "Together AI",
    _b[Providers.GOOGLE] = "Google Gemini",
    _b[Providers.FIREWORKS] = "Fireworks AI",
    _b[Providers.XAI] = "xAI Grok",
    _b[Providers.OPENROUTER] = "OpenRouter",
    _b);
var ErrorMessageService = /** @class */ (function () {
    function ErrorMessageService() {
    }
    /**
     * Generate user-friendly error message for missing API key
     */
    ErrorMessageService.getMissingApiKeyError = function (context) {
        var provider = context.provider, isVtPlus = context.isVtPlus;
        if (!provider) {
            return {
                title: "API Key Required",
                message: "An API key is required to use this AI model. Please configure your API keys in Settings.",
                action: "Add API key in Settings → API Keys",
                settingsAction: "open_api_keys",
            };
        }
        var providerName = PROVIDER_DISPLAY_NAMES[provider];
        var setupUrl = PROVIDER_SETUP_URLS[provider];
        // Enhanced messages for cloud providers
        var baseMessage = isVtPlus
            ? "Your VT+ subscription includes server-funded usage, but you can add your own ".concat(providerName, " API key for unlimited access and faster responses.")
            : "To use ".concat(providerName, " models, you need to provide your own API key. This is free to obtain and gives you direct access to ").concat(providerName, "'s latest models.");
        return {
            title: "".concat(providerName, " API Key Required"),
            message: baseMessage,
            action: "1. Visit ".concat(providerName, "'s website to get your free API key\n2. Copy the API key\n3. Add it in Settings \u2192 API Keys \u2192 ").concat(providerName, "\n4. Start chatting with ").concat(providerName, " models"),
            helpUrl: setupUrl,
            settingsAction: "open_api_keys",
        };
    };
    /**
     * Generate user-friendly error message for invalid API key
     */
    ErrorMessageService.getInvalidApiKeyError = function (context) {
        var provider = context.provider, originalError = context.originalError;
        if (!provider) {
            return {
                title: "Invalid API Key",
                message: "The provided API key appears to be invalid. Please check your API key format and try again.",
                action: "Verify your API key in Settings → API Keys",
                settingsAction: "open_api_keys",
            };
        }
        var providerName = PROVIDER_DISPLAY_NAMES[provider];
        var setupUrl = PROVIDER_SETUP_URLS[provider];
        // Check for specific error patterns
        if ((originalError === null || originalError === void 0 ? void 0 : originalError.includes("unauthorized")) || (originalError === null || originalError === void 0 ? void 0 : originalError.includes("401"))) {
            return {
                title: "".concat(providerName, " Authentication Failed"),
                message: "Your ".concat(providerName, " API key is invalid, expired, or doesn't have the required permissions."),
                action: "1. Check your ".concat(providerName, " account is active and has billing set up\n2. Verify your API key hasn't expired\n3. Generate a new API key if needed\n4. Update it in Settings \u2192 API Keys \u2192 ").concat(providerName),
                helpUrl: setupUrl,
                settingsAction: "open_api_keys",
            };
        }
        if ((originalError === null || originalError === void 0 ? void 0 : originalError.includes("forbidden")) || (originalError === null || originalError === void 0 ? void 0 : originalError.includes("403"))) {
            return {
                title: "".concat(providerName, " Access Denied"),
                message: "Your ".concat(providerName, " API key doesn't have permission to access this model or your account has billing issues."),
                action: "1. Check your ".concat(providerName, " account billing status\n2. Verify your API key has the required permissions\n3. Try a different model that's available in your plan\n4. Contact ").concat(providerName, " support if the issue persists"),
                helpUrl: setupUrl,
                settingsAction: "open_api_keys",
            };
        }
        // Provider-specific format guidance
        var getFormatGuidance = function (provider) {
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
            title: "".concat(providerName, " API Key Invalid"),
            message: "The ".concat(providerName, " API key format is incorrect. ").concat(getFormatGuidance(provider), "."),
            action: "1. Double-check you copied the complete API key\n2. Make sure there are no extra spaces or characters\n3. Generate a new API key if needed\n4. Update it in Settings \u2192 API Keys \u2192 ".concat(providerName),
            helpUrl: setupUrl,
            settingsAction: "open_api_keys",
        };
    };
    /**
     * Generate user-friendly error message for rate limiting
     */
    ErrorMessageService.getRateLimitError = function (context) {
        var provider = context.provider, isVtPlus = context.isVtPlus;
        if (!provider) {
            return {
                title: "Rate Limit Exceeded",
                message: "You've exceeded the rate limit for this service. Please wait a moment before trying again.",
                action: "Wait a few minutes and try again",
            };
        }
        var providerName = PROVIDER_DISPLAY_NAMES[provider];
        if (provider === Providers.GOOGLE && !context.hasApiKey) {
            if (isVtPlus) {
                return {
                    title: "VT+ Rate Limit Reached",
                    message: "You've reached your VT+ usage limit for Gemini models. Add your own API key for unlimited usage.",
                    action: "Add your own Gemini API key in Settings → API Keys → Google Gemini",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            }
            else {
                return {
                    title: "Free Usage Limit Reached",
                    message: "You've reached the daily limit for free Gemini usage. Add your own API key or upgrade to VT+ for higher limits.",
                    action: "Add your own Gemini API key for unlimited usage",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    upgradeUrl: "/pricing",
                    settingsAction: "open_api_keys",
                };
            }
        }
        return {
            title: "".concat(providerName, " Rate Limit"),
            message: "You've exceeded the rate limit for ".concat(providerName, ". This is typically temporary and will reset shortly."),
            action: "Wait a few minutes and try again, or try a different model",
        };
    };
    /**
     * Generate user-friendly error message for network issues
     */
    ErrorMessageService.getNetworkError = function (context) {
        var provider = context.provider, originalError = context.originalError;
        var providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";
        if ((originalError === null || originalError === void 0 ? void 0 : originalError.includes("timeout")) || (originalError === null || originalError === void 0 ? void 0 : originalError.includes("ETIMEDOUT"))) {
            return {
                title: "Request Timeout",
                message: "The request to ".concat(providerName, " timed out. This might be due to network issues or high server load."),
                action: "Check your internet connection and try again",
            };
        }
        return {
            title: "Network Connection Error",
            message: "Unable to connect to ".concat(providerName, ". Please check your internet connection."),
            action: "Check your internet connection and try again",
        };
    };
    /**
     * Generate user-friendly error message for service unavailable
     */
    ErrorMessageService.getServiceUnavailableError = function (context) {
        var provider = context.provider, originalError = context.originalError;
        var providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";
        if (originalError === null || originalError === void 0 ? void 0 : originalError.includes("model not found")) {
            return {
                title: "Model Not Available",
                message: "The requested model is not available on ".concat(providerName, ". It may have been deprecated or renamed."),
                action: "Try a different model or check the provider's documentation",
                helpUrl: provider ? PROVIDER_SETUP_URLS[provider] : undefined,
            };
        }
        if ((originalError === null || originalError === void 0 ? void 0 : originalError.includes("502")) ||
            (originalError === null || originalError === void 0 ? void 0 : originalError.includes("503")) ||
            (originalError === null || originalError === void 0 ? void 0 : originalError.includes("504"))) {
            return {
                title: "".concat(providerName, " Temporarily Unavailable"),
                message: "".concat(providerName, " is experiencing technical difficulties. This is usually temporary."),
                action: "Try again in a few minutes or use a different model",
            };
        }
        return {
            title: "Service Unavailable",
            message: "".concat(providerName, " is currently unavailable. This might be due to maintenance or high demand."),
            action: "Try again later or use a different AI provider",
        };
    };
    /**
     * Generate user-friendly error message for quota exceeded
     */
    ErrorMessageService.getQuotaExceededError = function (context) {
        var provider = context.provider, isVtPlus = context.isVtPlus;
        var providerName = provider ? PROVIDER_DISPLAY_NAMES[provider] : "AI service";
        if (provider === Providers.GOOGLE && !context.hasApiKey) {
            if (isVtPlus) {
                return {
                    title: "VT+ Daily Quota Exceeded",
                    message: "You've used all your VT+ quota for today. Add your own API key for unlimited usage.",
                    action: "Add your own Gemini API key in Settings → API Keys → Google Gemini",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            }
            else {
                return {
                    title: "Free Quota Exceeded",
                    message: "You've reached your free usage limit. Upgrade to VT+ or add your own API key for continued access.",
                    action: "Upgrade to VT+ or add your own API key",
                    upgradeUrl: "/pricing",
                    helpUrl: PROVIDER_SETUP_URLS[provider],
                    settingsAction: "open_api_keys",
                };
            }
        }
        return {
            title: "Usage Quota Exceeded",
            message: "You've exceeded your usage quota for ".concat(providerName, ". This may reset daily or monthly depending on your plan."),
            action: "Wait for quota reset or upgrade your plan",
            upgradeUrl: "/pricing",
        };
    };
    /**
     * Main method to generate appropriate error message based on error type
     */
    ErrorMessageService.generateErrorMessage = function (error, context) {
        if (context === void 0) { context = {}; }
        var errorString = typeof error === "string" ? error : error.message;
        var errorLower = errorString.toLowerCase();
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
        if (errorLower.includes("api key required") ||
            errorLower.includes("missing api key") ||
            errorLower.includes("no api key")) {
            return ErrorMessageService.getMissingApiKeyError(context);
        }
        if (errorLower.includes("invalid api key") ||
            errorLower.includes("unauthorized") ||
            errorLower.includes("forbidden") ||
            errorLower.includes("401") ||
            errorLower.includes("403")) {
            return ErrorMessageService.getInvalidApiKeyError(__assign(__assign({}, context), { originalError: errorString }));
        }
        if (errorLower.includes("rate limit") ||
            errorLower.includes("too many requests") ||
            errorLower.includes("429")) {
            return ErrorMessageService.getRateLimitError(context);
        }
        if (errorLower.includes("quota exceeded") ||
            errorLower.includes("usage limit") ||
            errorLower.includes("billing")) {
            return ErrorMessageService.getQuotaExceededError(context);
        }
        if (errorLower.includes("network") ||
            errorLower.includes("connection") ||
            errorLower.includes("econnrefused") ||
            errorLower.includes("econnreset") ||
            errorLower.includes("etimedout") ||
            errorLower.includes("timeout")) {
            return ErrorMessageService.getNetworkError(__assign(__assign({}, context), { originalError: errorString }));
        }
        if (errorLower.includes("service unavailable") ||
            errorLower.includes("model not found") ||
            errorLower.includes("502") ||
            errorLower.includes("503") ||
            errorLower.includes("504")) {
            return ErrorMessageService.getServiceUnavailableError(__assign(__assign({}, context), { originalError: errorString }));
        }
        // Generic fallback error
        return {
            title: "AI Service Error",
            message: "An unexpected error occurred while processing your request. Please try again or contact support if the issue persists.",
            action: "Try again with a different model or check your settings",
            settingsAction: "open_api_keys",
        };
    };
    return ErrorMessageService;
}());
export { ErrorMessageService };
// Export convenience functions
export var generateErrorMessage = function (error, context) {
    if (context === void 0) { context = {}; }
    return ErrorMessageService.generateErrorMessage(error, context);
};
export var getMissingApiKeyError = function (context) {
    return ErrorMessageService.getMissingApiKeyError(context);
};
export var getInvalidApiKeyError = function (context) {
    return ErrorMessageService.getInvalidApiKeyError(context);
};
export var getRateLimitError = function (context) {
    return ErrorMessageService.getRateLimitError(context);
};
export var getNetworkError = function (context) {
    return ErrorMessageService.getNetworkError(context);
};
export var getServiceUnavailableError = function (context) {
    return ErrorMessageService.getServiceUnavailableError(context);
};
export var getQuotaExceededError = function (context) {
    return ErrorMessageService.getQuotaExceededError(context);
};
