import { describe, expect, it } from 'vitest';
import { Providers } from '../constants/providers';
import {
    generateErrorMessage,
    getInvalidApiKeyError,
    getMissingApiKeyError,
    getNetworkError,
    getQuotaExceededError,
    getRateLimitError,
    getServiceUnavailableError,
    PROVIDER_DISPLAY_NAMES,
    PROVIDER_SETUP_URLS,
} from '../services/error-messages';

describe('Error Message Service', () => {
    describe('PROVIDER_SETUP_URLS constants', () => {
        it('should have URLs for all providers', () => {
            expect(PROVIDER_SETUP_URLS[Providers.OPENAI]).toBe(
                'https://platform.openai.com/api-keys',
            );
            expect(PROVIDER_SETUP_URLS[Providers.ANTHROPIC]).toBe('https://console.anthropic.com/');
            expect(PROVIDER_SETUP_URLS[Providers.TOGETHER]).toBe('https://api.together.xyz/');
            expect(PROVIDER_SETUP_URLS[Providers.GOOGLE]).toBe('https://ai.google.dev/api');
            expect(PROVIDER_SETUP_URLS[Providers.FIREWORKS]).toBe('https://app.fireworks.ai/');
            expect(PROVIDER_SETUP_URLS[Providers.XAI]).toBe('https://x.ai/api');
            expect(PROVIDER_SETUP_URLS[Providers.OPENROUTER]).toBe('https://openrouter.ai/keys');
            expect(PROVIDER_SETUP_URLS[Providers.LMSTUDIO]).toBe(
                'https://lmstudio.ai/docs/local-server',
            );
            expect(PROVIDER_SETUP_URLS[Providers.OLLAMA]).toBe('https://ollama.ai/download');
        });
    });

    describe('PROVIDER_DISPLAY_NAMES constants', () => {
        it('should have display names for all providers', () => {
            expect(PROVIDER_DISPLAY_NAMES[Providers.OPENAI]).toBe('OpenAI');
            expect(PROVIDER_DISPLAY_NAMES[Providers.ANTHROPIC]).toBe('Anthropic Claude');
            expect(PROVIDER_DISPLAY_NAMES[Providers.TOGETHER]).toBe('Together AI');
            expect(PROVIDER_DISPLAY_NAMES[Providers.GOOGLE]).toBe('Google Gemini');
            expect(PROVIDER_DISPLAY_NAMES[Providers.FIREWORKS]).toBe('Fireworks AI');
            expect(PROVIDER_DISPLAY_NAMES[Providers.XAI]).toBe('xAI Grok');
            expect(PROVIDER_DISPLAY_NAMES[Providers.OPENROUTER]).toBe('OpenRouter');
            expect(PROVIDER_DISPLAY_NAMES[Providers.LMSTUDIO]).toBe('LM Studio');
            expect(PROVIDER_DISPLAY_NAMES[Providers.OLLAMA]).toBe('Ollama');
        });
    });

    describe('getMissingApiKeyError', () => {
        it('should return generic error for unknown provider', () => {
            const result = getMissingApiKeyError({});
            expect(result.title).toBe('API Key Required');
            expect(result.message).toContain('API key is required');
            expect(result.settingsAction).toBe('open_api_keys');
        });

        it('should return provider-specific error for OpenAI', () => {
            const result = getMissingApiKeyError({ provider: Providers.OPENAI });
            expect(result.title).toBe('OpenAI API Key Required');
            expect(result.message).toContain('OpenAI models');
            expect(result.helpUrl).toBe(PROVIDER_SETUP_URLS[Providers.OPENAI]);
            expect(result.settingsAction).toBe('open_api_keys');
        });

        it('should return special error for LM Studio', () => {
            const result = getMissingApiKeyError({ provider: Providers.LMSTUDIO });
            expect(result.title).toBe('LM Studio Not Configured');
            expect(result.message).toContain('LM Studio server URL');
            expect(result.helpUrl).toBe(PROVIDER_SETUP_URLS[Providers.LMSTUDIO]);
        });

        it('should return special error for Ollama', () => {
            const result = getMissingApiKeyError({ provider: Providers.OLLAMA });
            expect(result.title).toBe('Ollama Not Configured');
            expect(result.message).toContain('Ollama server URL');
            expect(result.helpUrl).toBe(PROVIDER_SETUP_URLS[Providers.OLLAMA]);
        });
    });

    describe('getInvalidApiKeyError', () => {
        it('should return generic error for unknown provider', () => {
            const result = getInvalidApiKeyError({});
            expect(result.title).toBe('Invalid API Key');
            expect(result.message).toContain('invalid');
            expect(result.settingsAction).toBe('open_api_keys');
        });

        it('should detect unauthorized errors', () => {
            const result = getInvalidApiKeyError({
                provider: Providers.OPENAI,
                originalError: '401 unauthorized',
            });
            expect(result.title).toBe('OpenAI Authentication Failed');
            expect(result.message).toContain('invalid or has expired');
        });

        it('should detect forbidden errors', () => {
            const result = getInvalidApiKeyError({
                provider: Providers.ANTHROPIC,
                originalError: '403 forbidden',
            });
            expect(result.title).toBe('Anthropic Claude Access Denied');
            expect(result.message).toContain('permission');
        });
    });

    describe('getRateLimitError', () => {
        it('should return generic rate limit error', () => {
            const result = getRateLimitError({});
            expect(result.title).toBe('Rate Limit Exceeded');
            expect(result.message).toContain('rate limit');
        });

        it('should handle VT+ user with Gemini', () => {
            const result = getRateLimitError({
                provider: Providers.GOOGLE,
                hasApiKey: false,
                isVtPlus: true,
            });
            expect(result.title).toBe('VT+ Rate Limit Reached');
            expect(result.message).toContain('VT+ usage limit');
            expect(result.upgradeUrl).toBeUndefined();
        });

        it('should handle free user with Gemini', () => {
            const result = getRateLimitError({
                provider: Providers.GOOGLE,
                hasApiKey: false,
                isVtPlus: false,
            });
            expect(result.title).toBe('Free Usage Limit Reached');
            expect(result.message).toContain('daily limit');
            expect(result.upgradeUrl).toBe('/pricing');
        });
    });

    describe('getNetworkError', () => {
        it('should detect connection refused errors', () => {
            const result = getNetworkError({
                provider: Providers.LMSTUDIO,
                originalError: 'ECONNREFUSED',
            });
            expect(result.title).toBe('LM Studio Connection Failed');
            expect(result.message).toContain('Cannot connect');
        });

        it('should detect timeout errors', () => {
            const result = getNetworkError({
                provider: Providers.OPENAI,
                originalError: 'timeout',
            });
            expect(result.title).toBe('Request Timeout');
            expect(result.message).toContain('timed out');
        });

        it('should return generic network error', () => {
            const result = getNetworkError({
                provider: Providers.ANTHROPIC,
                originalError: 'network error',
            });
            expect(result.title).toBe('Network Connection Error');
            expect(result.message).toContain('internet connection');
        });
    });

    describe('getServiceUnavailableError', () => {
        it('should detect model not found errors', () => {
            const result = getServiceUnavailableError({
                provider: Providers.OPENAI,
                originalError: 'model not found',
            });
            expect(result.title).toBe('Model Not Available');
            expect(result.message).toContain('not available');
        });

        it('should detect server errors', () => {
            const result = getServiceUnavailableError({
                provider: Providers.GOOGLE,
                originalError: '503',
            });
            expect(result.title).toBe('Google Gemini Temporarily Unavailable');
            expect(result.message).toContain('technical difficulties');
        });
    });

    describe('getQuotaExceededError', () => {
        it('should handle VT+ quota exceeded', () => {
            const result = getQuotaExceededError({
                provider: Providers.GOOGLE,
                hasApiKey: false,
                isVtPlus: true,
            });
            expect(result.title).toBe('VT+ Monthly Quota Exceeded');
            expect(result.message).toContain('VT+ quota');
        });

        it('should handle free quota exceeded', () => {
            const result = getQuotaExceededError({
                provider: Providers.GOOGLE,
                hasApiKey: false,
                isVtPlus: false,
            });
            expect(result.title).toBe('Free Quota Exceeded');
            expect(result.message).toContain('free usage limit');
            expect(result.upgradeUrl).toBe('/pricing');
        });
    });

    describe('generateErrorMessage', () => {
        it('should detect missing API key errors', () => {
            const result = generateErrorMessage('API key required', {
                provider: Providers.OPENAI,
                hasApiKey: false,
            });
            expect(result.title).toBe('OpenAI API Key Required');
            expect(result.message).toContain('OpenAI models');
        });

        it('should detect unauthorized errors', () => {
            const result = generateErrorMessage('401 unauthorized', {
                provider: Providers.ANTHROPIC,
                hasApiKey: true,
            });
            expect(result.title).toBe('Anthropic Claude Authentication Failed');
            expect(result.message).toContain('invalid or has expired');
        });

        it('should detect rate limit errors', () => {
            const result = generateErrorMessage('rate limit exceeded', {
                provider: Providers.GOOGLE,
                hasApiKey: false,
                isVtPlus: false,
            });
            expect(result.title).toBe('Free Usage Limit Reached');
            expect(result.message).toContain('daily limit');
        });

        it('should detect network errors', () => {
            const result = generateErrorMessage('ECONNREFUSED', {
                provider: Providers.LMSTUDIO,
                hasApiKey: true,
            });
            expect(result.title).toBe('LM Studio Connection Failed');
            expect(result.message).toContain('Cannot connect');
        });

        it('should return generic error for unknown errors', () => {
            const result = generateErrorMessage('unknown error', {});
            expect(result.title).toBe('AI Service Error');
            expect(result.message).toContain('unexpected error');
            expect(result.settingsAction).toBe('open_api_keys');
        });

        it('should handle Error objects', () => {
            const error = new Error('API key required');
            const result = generateErrorMessage(error, {
                provider: Providers.OPENAI,
                hasApiKey: false,
            });
            expect(result.title).toBe('OpenAI API Key Required');
            expect(result.message).toContain('OpenAI models');
        });
    });
});
