import { type ProviderEnumType } from "../providers";
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
 * Extract structured error information from API provider errors
 */
export declare class ProviderErrorExtractor {
    /**
     * Extract and parse error from any AI provider
     */
    static extractError(error: unknown, provider?: ProviderEnumType): ErrorExtractionResult;
    /**
     * Convert error to string, handling various error types
     */
    private static getErrorString;
    /**
     * Extract HTTP status code from error
     */
    private static extractStatusCode;
    /**
     * Detect provider from error message patterns
     */
    private static detectProvider;
    /**
     * Parse provider-specific error patterns
     */
    private static parseProviderError;
    /**
     * Parse OpenAI-specific errors
     */
    private static parseOpenAIError;
    /**
     * Parse Anthropic-specific errors
     */
    private static parseAnthropicError;
    /**
     * Parse Google-specific errors
     */
    private static parseGoogleError;
    /**
     * Parse other provider errors (OpenRouter, Fireworks, Together, xAI)
     */
    private static parseOpenRouterError;
    private static parseFireworksError;
    private static parseTogetherError;
    private static parseXAIError;
    /**
     * Parse generic provider errors
     */
    private static parseGenericError;
}
//# sourceMappingURL=provider-error-extractor.d.ts.map