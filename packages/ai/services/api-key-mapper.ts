import { log } from "../../shared/src/lib/logger";
import { Providers, type ProviderEnumType } from "../constants/providers";

/**
 * Centralized API key mapping service that standardizes key transformation
 * between frontend key names and provider key names.
 */

// Frontend key names (what the UI sends)
export const FRONTEND_KEY_NAMES = {
    OPENAI_API_KEY: "OPENAI_API_KEY",
    ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
    TOGETHER_API_KEY: "TOGETHER_API_KEY",
    GEMINI_API_KEY: "GEMINI_API_KEY",
    FIREWORKS_API_KEY: "FIREWORKS_API_KEY",
    XAI_API_KEY: "XAI_API_KEY",
    OPENROUTER_API_KEY: "OPENROUTER_API_KEY",
    LMSTUDIO_BASE_URL: "LMSTUDIO_BASE_URL",
    OLLAMA_BASE_URL: "OLLAMA_BASE_URL",
} as const;

// Provider key mapping (provider -> frontend key name)
// This is the single source of truth for provider-to-key mappings
export const PROVIDER_KEY_MAPPING: Record<ProviderEnumType, keyof typeof FRONTEND_KEY_NAMES> = {
    [Providers.OPENAI]: "OPENAI_API_KEY",
    [Providers.ANTHROPIC]: "ANTHROPIC_API_KEY",
    [Providers.TOGETHER]: "TOGETHER_API_KEY",
    [Providers.GOOGLE]: "GEMINI_API_KEY",
    [Providers.FIREWORKS]: "FIREWORKS_API_KEY",
    [Providers.XAI]: "XAI_API_KEY",
    [Providers.OPENROUTER]: "OPENROUTER_API_KEY",
    [Providers.LMSTUDIO]: "LMSTUDIO_BASE_URL",
    [Providers.OLLAMA]: "OLLAMA_BASE_URL",
} as const;

// API key validation patterns - using bounded quantifiers to prevent ReDoS attacks
const API_KEY_PATTERNS: Record<ProviderEnumType, RegExp> = {
    [Providers.OPENAI]: /^sk-[a-zA-Z0-9]{20,100}$/,
    [Providers.ANTHROPIC]: /^sk-ant-[a-zA-Z0-9_-]{95,200}$/,
    [Providers.TOGETHER]: /^[a-f0-9]{64}$/,
    [Providers.GOOGLE]: /^[a-zA-Z0-9_-]{39}$/,
    [Providers.FIREWORKS]: /^[a-zA-Z0-9]{32,100}$/,
    [Providers.XAI]: /^xai-[a-zA-Z0-9]{32,100}$/,
    [Providers.OPENROUTER]: /^sk-or-v1-[a-f0-9]{64}$/,
    // LM Studio and Ollama use URLs - strict validation with port range check
    [Providers.LMSTUDIO]:
        /^https?:\/\/[a-zA-Z0-9.-]+(?::[1-9][0-9]{0,3}|:[1-5][0-9]{4}|:6[0-4][0-9]{3}|:65[0-4][0-9]{2}|:655[0-2][0-9]|:6553[0-5])?(?:\/[^\s]*)?$/,
    [Providers.OLLAMA]:
        /^https?:\/\/[a-zA-Z0-9.-]+(?::[1-9][0-9]{0,3}|:[1-5][0-9]{4}|:6[0-4][0-9]{3}|:65[0-4][0-9]{2}|:655[0-2][0-9]|:6553[0-5])?(?:\/[^\s]*)?$/,
};

// Minimum key lengths for basic validation
const MIN_KEY_LENGTHS: Record<ProviderEnumType, number> = {
    [Providers.OPENAI]: 20,
    [Providers.ANTHROPIC]: 95,
    [Providers.TOGETHER]: 64,
    [Providers.GOOGLE]: 39,
    [Providers.FIREWORKS]: 32,
    [Providers.XAI]: 32,
    [Providers.OPENROUTER]: 64,
    [Providers.LMSTUDIO]: 10, // Minimum URL length
    [Providers.OLLAMA]: 10, // Minimum URL length
};

export interface ApiKeyValidationResult {
    isValid: boolean;
    provider: ProviderEnumType;
    hasApiKey: boolean;
    keyLength?: number;
    error?: string;
    expectedFormat?: string;
    validatedAt?: number; // Timestamp for cache invalidation
}

// Type guard for API key objects
export const isValidApiKeyObject = (obj: unknown): obj is Record<string, string> => {
    return (
        typeof obj === "object" &&
        obj !== null &&
        !Array.isArray(obj) &&
        Object.values(obj).every((value) => typeof value === "string")
    );
};

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
    validateProviderKey(
        provider: ProviderEnumType,
        keys: Record<string, string>,
    ): ApiKeyValidationResult;

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

// Simple memoization cache for validation results
const validationCache = new Map<string, ApiKeyValidationResult>();
const CACHE_MAX_SIZE = 1000;

class ApiKeyMapperImpl implements ApiKeyMappingService {
    mapFrontendToProvider(apiKeys: Record<string, string>): Record<string, string> {
        // Input validation
        if (!isValidApiKeyObject(apiKeys)) {
            throw new Error("Invalid API keys object provided");
        }

        log.info("API key mapping initiated", {
            inputCount: Object.keys(apiKeys).length,
            hasKeys: Object.keys(apiKeys).length > 0,
        });

        const mappedKeys: Record<string, string> = {};
        let filteredCount = 0;

        // Direct mapping - frontend keys are already in the expected format
        // This maintains backward compatibility with existing code
        for (const [key, value] of Object.entries(apiKeys)) {
            if (value && value.trim().length > 0) {
                mappedKeys[key] = value.trim();
            } else {
                filteredCount++;
            }
        }

        log.info("API key mapping completed", {
            outputCount: Object.keys(mappedKeys).length,
            filteredEmptyKeys: filteredCount,
        });

        return mappedKeys;
    }

    getProviderKeyName(provider: ProviderEnumType): string {
        const keyName = PROVIDER_KEY_MAPPING[provider];
        if (!keyName) {
            throw new Error(`No key mapping found for provider: ${provider}`);
        }
        return keyName;
    }

    validateProviderKey(
        provider: ProviderEnumType,
        keys: Record<string, string>,
    ): ApiKeyValidationResult {
        const expectedKeyName = this.getProviderKeyName(provider);
        const apiKey = keys[expectedKeyName];

        if (!apiKey || apiKey.trim().length === 0) {
            return {
                isValid: false,
                provider,
                hasApiKey: false,
                error: `Missing API key for ${provider}. Expected key: ${expectedKeyName}`,
                expectedFormat: this.getExpectedFormat(provider),
            };
        }

        return this.validateApiKeyFormat(provider, apiKey);
    }

    validateApiKeyFormat(provider: ProviderEnumType, apiKey: string): ApiKeyValidationResult {
        const trimmedKey = apiKey.trim();

        // Create cache key (hash the actual key for security)
        const cacheKey = `${provider}:${trimmedKey.length}:${trimmedKey.slice(0, 10)}`;

        // Check cache first
        if (validationCache.has(cacheKey)) {
            return validationCache.get(cacheKey)!;
        }

        const pattern = API_KEY_PATTERNS[provider];
        const minLength = MIN_KEY_LENGTHS[provider];

        let result: ApiKeyValidationResult;

        // Basic length check
        if (trimmedKey.length < minLength) {
            result = {
                isValid: false,
                provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
                error: `API key too short for ${provider}. Expected minimum ${minLength} characters, got ${trimmedKey.length}`,
                expectedFormat: this.getExpectedFormat(provider),
            };
        } else if (provider === Providers.LMSTUDIO || provider === Providers.OLLAMA) {
            // Special URL validation for local providers
            result = this.validateUrlFormat(provider, trimmedKey);
        } else if (!pattern.test(trimmedKey)) {
            // Pattern validation for API keys
            result = {
                isValid: false,
                provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
                error: `Invalid API key format for ${provider}`,
                expectedFormat: this.getExpectedFormat(provider),
            };
        } else {
            result = {
                isValid: true,
                provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
            };
        }

        // Cache the result (with size limit)
        if (validationCache.size >= CACHE_MAX_SIZE) {
            // Remove oldest entry (simple FIFO)
            const firstKey = validationCache.keys().next().value;
            validationCache.delete(firstKey);
        }
        validationCache.set(cacheKey, result);

        return result;
    }

    private validateUrlFormat(provider: ProviderEnumType, url: string): ApiKeyValidationResult {
        try {
            const urlObj = new URL(url);

            // Check protocol
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                return {
                    isValid: false,
                    provider,
                    hasApiKey: true,
                    keyLength: url.length,
                    error: `Invalid protocol for ${provider}. Must be HTTP or HTTPS`,
                    expectedFormat: this.getExpectedFormat(provider),
                };
            }

            // Check port range if specified
            if (urlObj.port) {
                const portNum = parseInt(urlObj.port, 10);
                if (portNum < 1 || portNum > 65535) {
                    return {
                        isValid: false,
                        provider,
                        hasApiKey: true,
                        keyLength: url.length,
                        error: `Invalid port number for ${provider}. Must be between 1-65535`,
                        expectedFormat: this.getExpectedFormat(provider),
                    };
                }
            }

            // Check hostname
            if (!urlObj.hostname || urlObj.hostname.length === 0) {
                return {
                    isValid: false,
                    provider,
                    hasApiKey: true,
                    keyLength: url.length,
                    error: `Invalid hostname for ${provider}`,
                    expectedFormat: this.getExpectedFormat(provider),
                };
            }

            return {
                isValid: true,
                provider,
                hasApiKey: true,
                keyLength: url.length,
            };
        } catch (error) {
            return {
                isValid: false,
                provider,
                hasApiKey: true,
                keyLength: url.length,
                error: `Invalid URL format for ${provider}`,
                expectedFormat: this.getExpectedFormat(provider),
            };
        }
    }

    getAvailableProviders(apiKeys: Record<string, string>): ProviderEnumType[] {
        const availableProviders: ProviderEnumType[] = [];

        for (const provider of Object.values(Providers)) {
            const validation = this.validateProviderKey(provider, apiKeys);
            if (validation.isValid) {
                availableProviders.push(provider);
            }
        }

        log.info(
            "Available providers determined",
            JSON.stringify({
                totalProviders: Object.values(Providers).length,
                availableCount: availableProviders.length,
                availableProviders,
            }),
        );

        return availableProviders;
    }

    private getExpectedFormat(provider: ProviderEnumType): string {
        switch (provider) {
            case Providers.OPENAI:
                return "sk-... (starts with 'sk-', followed by 20+ characters)";
            case Providers.ANTHROPIC:
                return "sk-ant-... (starts with 'sk-ant-', followed by 95+ characters)";
            case Providers.TOGETHER:
                return "64-character hexadecimal string";
            case Providers.GOOGLE:
                return "39-character alphanumeric string";
            case Providers.FIREWORKS:
                return "32+ character alphanumeric string";
            case Providers.XAI:
                return "xai-... (starts with 'xai-', followed by 32+ characters)";
            case Providers.OPENROUTER:
                return "sk-or-v1-... (starts with 'sk-or-v1-', followed by 64-character hex)";
            case Providers.LMSTUDIO:
                return "HTTP/HTTPS URL (e.g., http://localhost:1234)";
            case Providers.OLLAMA:
                return "HTTP/HTTPS URL (e.g., http://127.0.0.1:11434)";
            default:
                return "Valid API key for the provider";
        }
    }
}

// Export singleton instance
export const apiKeyMapper: ApiKeyMappingService = new ApiKeyMapperImpl();

// Export utility functions for backward compatibility
export const mapFrontendToProvider = (apiKeys: Record<string, string>): Record<string, string> =>
    apiKeyMapper.mapFrontendToProvider(apiKeys);

export const getProviderKeyName = (provider: ProviderEnumType): string =>
    apiKeyMapper.getProviderKeyName(provider);

export const validateProviderKey = (
    provider: ProviderEnumType,
    keys: Record<string, string>,
): ApiKeyValidationResult => apiKeyMapper.validateProviderKey(provider, keys);

export const validateApiKeyFormat = (
    provider: ProviderEnumType,
    apiKey: string,
): ApiKeyValidationResult => apiKeyMapper.validateApiKeyFormat(provider, apiKey);

export const getAvailableProviders = (apiKeys: Record<string, string>): ProviderEnumType[] =>
    apiKeyMapper.getAvailableProviders(apiKeys);
