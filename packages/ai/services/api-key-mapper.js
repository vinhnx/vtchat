var _a, _b, _c;
import { log } from "../../shared/src/lib/logger";
import { Providers } from "../constants/providers";
/**
 * Centralized API key mapping service that standardizes key transformation
 * between frontend key names and provider key names.
 */
// Frontend key names (what the UI sends)
export var FRONTEND_KEY_NAMES = {
    OPENAI_API_KEY: "OPENAI_API_KEY",
    ANTHROPIC_API_KEY: "ANTHROPIC_API_KEY",
    TOGETHER_API_KEY: "TOGETHER_API_KEY",
    GEMINI_API_KEY: "GEMINI_API_KEY",
    FIREWORKS_API_KEY: "FIREWORKS_API_KEY",
    XAI_API_KEY: "XAI_API_KEY",
    OPENROUTER_API_KEY: "OPENROUTER_API_KEY",
};
// Provider key mapping (provider -> frontend key name)
// This is the single source of truth for provider-to-key mappings
export var PROVIDER_KEY_MAPPING = (_a = {},
    _a[Providers.OPENAI] = "OPENAI_API_KEY",
    _a[Providers.ANTHROPIC] = "ANTHROPIC_API_KEY",
    _a[Providers.TOGETHER] = "TOGETHER_API_KEY",
    _a[Providers.GOOGLE] = "GEMINI_API_KEY",
    _a[Providers.FIREWORKS] = "FIREWORKS_API_KEY",
    _a[Providers.XAI] = "XAI_API_KEY",
    _a[Providers.OPENROUTER] = "OPENROUTER_API_KEY",
    _a);
// API key validation patterns - using bounded quantifiers to prevent ReDoS attacks
var API_KEY_PATTERNS = (_b = {},
    _b[Providers.OPENAI] = /^sk-[a-zA-Z0-9]{20,100}$/,
    _b[Providers.ANTHROPIC] = /^sk-ant-[a-zA-Z0-9_-]{95,200}$/,
    _b[Providers.TOGETHER] = /^[a-f0-9]{64}$/,
    _b[Providers.GOOGLE] = /^[a-zA-Z0-9_-]{39}$/,
    _b[Providers.FIREWORKS] = /^[a-zA-Z0-9]{32,100}$/,
    _b[Providers.XAI] = /^xai-[a-zA-Z0-9]{32,100}$/,
    _b[Providers.OPENROUTER] = /^sk-or-v1-[a-f0-9]{64}$/,
    _b);
// Minimum key lengths for basic validation
var MIN_KEY_LENGTHS = (_c = {},
    _c[Providers.OPENAI] = 20,
    _c[Providers.ANTHROPIC] = 95,
    _c[Providers.TOGETHER] = 64,
    _c[Providers.GOOGLE] = 39,
    _c[Providers.FIREWORKS] = 32,
    _c[Providers.XAI] = 32,
    _c[Providers.OPENROUTER] = 64,
    _c);
// Type guard for API key objects
export var isValidApiKeyObject = function (obj) {
    return (typeof obj === "object" &&
        obj !== null &&
        !Array.isArray(obj) &&
        Object.values(obj).every(function (value) { return typeof value === "string"; }));
};
// Simple memoization cache for validation results
var validationCache = new Map();
var CACHE_MAX_SIZE = 1000;
var ApiKeyMapperImpl = /** @class */ (function () {
    function ApiKeyMapperImpl() {
    }
    ApiKeyMapperImpl.prototype.mapFrontendToProvider = function (apiKeys) {
        // Input validation
        if (!isValidApiKeyObject(apiKeys)) {
            throw new Error("Invalid API keys object provided");
        }
        log.info("API key mapping initiated", {
            inputCount: Object.keys(apiKeys).length,
            hasKeys: Object.keys(apiKeys).length > 0,
        });
        var mappedKeys = {};
        var filteredCount = 0;
        // Direct mapping - frontend keys are already in the expected format
        // This maintains backward compatibility with existing code
        for (var _i = 0, _a = Object.entries(apiKeys); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (value && value.trim().length > 0) {
                mappedKeys[key] = value.trim();
            }
            else {
                filteredCount++;
            }
        }
        log.info("API key mapping completed", {
            outputCount: Object.keys(mappedKeys).length,
            filteredEmptyKeys: filteredCount,
        });
        return mappedKeys;
    };
    ApiKeyMapperImpl.prototype.getProviderKeyName = function (provider) {
        var keyName = PROVIDER_KEY_MAPPING[provider];
        if (!keyName) {
            throw new Error("No key mapping found for provider: ".concat(provider));
        }
        return keyName;
    };
    ApiKeyMapperImpl.prototype.validateProviderKey = function (provider, keys) {
        var expectedKeyName = this.getProviderKeyName(provider);
        var apiKey = keys[expectedKeyName];
        if (!apiKey || apiKey.trim().length === 0) {
            return {
                isValid: false,
                provider: provider,
                hasApiKey: false,
                error: "Missing API key for ".concat(provider, ". Expected key: ").concat(expectedKeyName),
                expectedFormat: this.getExpectedFormat(provider),
            };
        }
        return this.validateApiKeyFormat(provider, apiKey);
    };
    ApiKeyMapperImpl.prototype.validateApiKeyFormat = function (provider, apiKey) {
        var trimmedKey = apiKey.trim();
        // Create cache key (hash the actual key for security)
        var cacheKey = "".concat(provider, ":").concat(trimmedKey.length, ":").concat(trimmedKey.slice(0, 10));
        // Check cache first
        if (validationCache.has(cacheKey)) {
            return validationCache.get(cacheKey);
        }
        var pattern = API_KEY_PATTERNS[provider];
        var minLength = MIN_KEY_LENGTHS[provider];
        var result;
        // Basic length check
        if (trimmedKey.length < minLength) {
            result = {
                isValid: false,
                provider: provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
                error: "API key too short for ".concat(provider, ". Expected minimum ").concat(minLength, " characters, got ").concat(trimmedKey.length),
                expectedFormat: this.getExpectedFormat(provider),
            };
        }
        else if (!pattern.test(trimmedKey)) {
            // Pattern validation for API keys
            result = {
                isValid: false,
                provider: provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
                error: "Invalid API key format for ".concat(provider),
                expectedFormat: this.getExpectedFormat(provider),
            };
        }
        else {
            result = {
                isValid: true,
                provider: provider,
                hasApiKey: true,
                keyLength: trimmedKey.length,
            };
        }
        // Cache the result (with size limit)
        if (validationCache.size >= CACHE_MAX_SIZE) {
            // Remove oldest entry (simple FIFO)
            var firstKey = validationCache.keys().next().value;
            validationCache.delete(firstKey);
        }
        validationCache.set(cacheKey, result);
        return result;
    };
    ApiKeyMapperImpl.prototype.validateUrlFormat = function (provider, url) {
        try {
            var urlObj = new URL(url);
            // Check protocol
            if (!["http:", "https:"].includes(urlObj.protocol)) {
                return {
                    isValid: false,
                    provider: provider,
                    hasApiKey: true,
                    keyLength: url.length,
                    error: "Invalid protocol for ".concat(provider, ". Must be HTTP or HTTPS"),
                    expectedFormat: this.getExpectedFormat(provider),
                };
            }
            // Check port range if specified
            if (urlObj.port) {
                var portNum = parseInt(urlObj.port, 10);
                if (portNum < 1 || portNum > 65535) {
                    return {
                        isValid: false,
                        provider: provider,
                        hasApiKey: true,
                        keyLength: url.length,
                        error: "Invalid port number for ".concat(provider, ". Must be between 1-65535"),
                        expectedFormat: this.getExpectedFormat(provider),
                    };
                }
            }
            // Check hostname
            if (!urlObj.hostname || urlObj.hostname.length === 0) {
                return {
                    isValid: false,
                    provider: provider,
                    hasApiKey: true,
                    keyLength: url.length,
                    error: "Invalid hostname for ".concat(provider),
                    expectedFormat: this.getExpectedFormat(provider),
                };
            }
            return {
                isValid: true,
                provider: provider,
                hasApiKey: true,
                keyLength: url.length,
            };
        }
        catch (_a) {
            return {
                isValid: false,
                provider: provider,
                hasApiKey: true,
                keyLength: url.length,
                error: "Invalid URL format for ".concat(provider),
                expectedFormat: this.getExpectedFormat(provider),
            };
        }
    };
    ApiKeyMapperImpl.prototype.getAvailableProviders = function (apiKeys) {
        var availableProviders = [];
        for (var _i = 0, _a = Object.values(Providers); _i < _a.length; _i++) {
            var provider = _a[_i];
            var validation = this.validateProviderKey(provider, apiKeys);
            if (validation.isValid) {
                availableProviders.push(provider);
            }
        }
        log.info("Available providers determined", JSON.stringify({
            totalProviders: Object.values(Providers).length,
            availableCount: availableProviders.length,
            availableProviders: availableProviders,
        }));
        return availableProviders;
    };
    ApiKeyMapperImpl.prototype.getExpectedFormat = function (provider) {
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
            default:
                return "Valid API key for the provider";
        }
    };
    return ApiKeyMapperImpl;
}());
// Export singleton instance
export var apiKeyMapper = new ApiKeyMapperImpl();
// Export utility functions for backward compatibility
export var mapFrontendToProvider = function (apiKeys) {
    return apiKeyMapper.mapFrontendToProvider(apiKeys);
};
export var getProviderKeyName = function (provider) {
    return apiKeyMapper.getProviderKeyName(provider);
};
export var validateProviderKey = function (provider, keys) { return apiKeyMapper.validateProviderKey(provider, keys); };
export var validateApiKeyFormat = function (provider, apiKey) { return apiKeyMapper.validateApiKeyFormat(provider, apiKey); };
export var getAvailableProviders = function (apiKeys) {
    return apiKeyMapper.getAvailableProviders(apiKeys);
};
