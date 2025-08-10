import { type ProviderEnumType } from "../constants/providers";
/**
 * Centralized API key mapping service that standardizes key transformation
 * between frontend key names and provider key names.
 */
export declare const FRONTEND_KEY_NAMES: {
    readonly OPENAI_API_KEY: "OPENAI_API_KEY";
    readonly ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY";
    readonly TOGETHER_API_KEY: "TOGETHER_API_KEY";
    readonly GEMINI_API_KEY: "GEMINI_API_KEY";
    readonly FIREWORKS_API_KEY: "FIREWORKS_API_KEY";
    readonly XAI_API_KEY: "XAI_API_KEY";
    readonly OPENROUTER_API_KEY: "OPENROUTER_API_KEY";
};
export declare const PROVIDER_KEY_MAPPING: Record<ProviderEnumType, keyof typeof FRONTEND_KEY_NAMES>;
export interface ApiKeyValidationResult {
    isValid: boolean;
    provider: ProviderEnumType;
    hasApiKey: boolean;
    keyLength?: number;
    error?: string;
    expectedFormat?: string;
    validatedAt?: number;
}
export declare const isValidApiKeyObject: (obj: unknown) => obj is Record<string, string>;
export interface ApiKeyMappingService {
    /**
     * Map frontend API key names to provider key names
     * @param apiKeys - API keys from frontend with frontend key names
     * @returns Mapped keys with provider-expected names
     */
    mapFrontendToProvider(apiKeys: Record<string, string>): Record<string, string>;
    /**
     * Get the expected key name for a provider
     * @param provider - Provider enum
     * @returns Expected frontend key name
     */
    getProviderKeyName(provider: ProviderEnumType): string;
    /**
     * Validate API key presence and basic format for a provider
     * @param provider - Provider enum
     * @param keys - API keys object
     * @returns Validation result
     */
    validateProviderKey(provider: ProviderEnumType, keys: Record<string, string>): ApiKeyValidationResult;
    /**
     * Validate API key format for a specific provider
     * @param provider - Provider enum
     * @param apiKey - API key string
     * @returns Validation result
     */
    validateApiKeyFormat(provider: ProviderEnumType, apiKey: string): ApiKeyValidationResult;
    /**
     * Get all available providers that have valid API keys
     * @param apiKeys - API keys object
     * @returns Array of providers with valid keys
     */
    getAvailableProviders(apiKeys: Record<string, string>): ProviderEnumType[];
}
export declare const apiKeyMapper: ApiKeyMappingService;
export declare const mapFrontendToProvider: (apiKeys: Record<string, string>) => Record<string, string>;
export declare const getProviderKeyName: (provider: ProviderEnumType) => string;
export declare const validateProviderKey: (provider: ProviderEnumType, keys: Record<string, string>) => ApiKeyValidationResult;
export declare const validateApiKeyFormat: (provider: ProviderEnumType, apiKey: string) => ApiKeyValidationResult;
export declare const getAvailableProviders: (apiKeys: Record<string, string>) => ProviderEnumType[];
//# sourceMappingURL=api-key-mapper.d.ts.map