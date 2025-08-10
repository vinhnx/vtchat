import { type ProviderEnumType } from "../constants/providers";
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
export declare const PROVIDER_SETUP_URLS: {
    readonly openai: "https://platform.openai.com/api-keys";
    readonly anthropic: "https://console.anthropic.com/";
    readonly together: "https://api.together.xyz/";
    readonly google: "https://ai.google.dev/api";
    readonly fireworks: "https://app.fireworks.ai/";
    readonly xai: "https://x.ai/api";
    readonly openrouter: "https://openrouter.ai/keys";
};
export declare const PROVIDER_DISPLAY_NAMES: {
    readonly openai: "OpenAI";
    readonly anthropic: "Anthropic Claude";
    readonly together: "Together AI";
    readonly google: "Google Gemini";
    readonly fireworks: "Fireworks AI";
    readonly xai: "xAI Grok";
    readonly openrouter: "OpenRouter";
};
export declare class ErrorMessageService {
    /**
     * Generate user-friendly error message for missing API key
     */
    static getMissingApiKeyError(context: ErrorContext): ErrorMessage;
    /**
     * Generate user-friendly error message for invalid API key
     */
    static getInvalidApiKeyError(context: ErrorContext): ErrorMessage;
    /**
     * Generate user-friendly error message for rate limiting
     */
    static getRateLimitError(context: ErrorContext): ErrorMessage;
    /**
     * Generate user-friendly error message for network issues
     */
    static getNetworkError(context: ErrorContext): ErrorMessage;
    /**
     * Generate user-friendly error message for service unavailable
     */
    static getServiceUnavailableError(context: ErrorContext): ErrorMessage;
    /**
     * Generate user-friendly error message for quota exceeded
     */
    static getQuotaExceededError(context: ErrorContext): ErrorMessage;
    /**
     * Main method to generate appropriate error message based on error type
     */
    static generateErrorMessage(error: Error | string, context?: ErrorContext): ErrorMessage;
}
export declare const generateErrorMessage: (error: Error | string, context?: ErrorContext) => ErrorMessage;
export declare const getMissingApiKeyError: (context: ErrorContext) => ErrorMessage;
export declare const getInvalidApiKeyError: (context: ErrorContext) => ErrorMessage;
export declare const getRateLimitError: (context: ErrorContext) => ErrorMessage;
export declare const getNetworkError: (context: ErrorContext) => ErrorMessage;
export declare const getServiceUnavailableError: (context: ErrorContext) => ErrorMessage;
export declare const getQuotaExceededError: (context: ErrorContext) => ErrorMessage;
//# sourceMappingURL=error-messages.d.ts.map