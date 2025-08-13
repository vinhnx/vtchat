/**
 * @deprecated This file has been replaced by @repo/shared/lib/http-client
 *
 * MIGRATION GUIDE:
 *
 * Old:
 * ```typescript
 * import { secureFetch } from '@repo/shared/utils/secure-http';
 *
 * const result = await secureFetch('/api/endpoint', {
 *   method: 'POST',
 *   body: data,
 *   apiKeys: { openai: 'sk-...' }
 * });
 * ```
 *
 * New:
 * ```typescript
 * import { http } from '@repo/shared/lib/http-client';
 *
 * const result = await http.post('/api/endpoint', {
 *   body: data,
 *   apiKeys: { openai: 'sk-...' }
 * });
 * ```
 *
 * Benefits of the new client:
 * - Built on ky for better reliability and TypeScript support
 * - Automatic JSON handling
 * - Built-in retry logic
 * - Better error handling
 * - Cleaner API with less boilerplate
 *
 * This file is kept for backward compatibility but will be removed in a future version.
 */

// Re-export the new client for compatibility
export { http as secureFetch } from '@repo/shared/lib/http-client';
export type { SecureRequestOptions } from '@repo/shared/lib/http-client';

// Legacy exports (deprecated)
import {
    API_KEY_TO_HEADER_MAP,
    createSecureHeaders,
    validateHTTPS,
} from '@repo/shared/constants/security-headers';
import { log } from '@repo/shared/logger';

/**
 * @deprecated Use http.post() from @repo/shared/lib/http-client instead
 */
export interface LegacySecureRequestOptions {
    method?: string;
    body?: any;
    apiKeys?: Record<string, string>;
    additionalHeaders?: Record<string, string>;
    timeout?: number;
}

/**
 * @deprecated Use http client from @repo/shared/lib/http-client instead
 */
export interface LegacySecureResponse<T = any> {
    data: T;
    status: number;
    headers: Headers;
    ok: boolean;
}

/**
 * @deprecated Use http.post(), http.get(), etc. from @repo/shared/lib/http-client instead
 *
 * This legacy function is maintained for backward compatibility only.
 * Please migrate to the new ky-based HTTP client.
 */
export async function legacySecureFetch<T = any>(
    url: string,
    options: LegacySecureRequestOptions = {},
): Promise<LegacySecureResponse<T>> {
    const { method = 'GET', body, apiKeys = {}, additionalHeaders = {}, timeout = 30000 } = options;

    // SECURITY: Validate HTTPS
    const requestUrl = new URL(url);
    if (requestUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
        throw new Error('SECURITY: HTTPS required for API requests in production');
    }

    // Prepare headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...createSecureHeaders(),
        ...additionalHeaders,
    };

    // SECURITY: Add API keys to headers instead of body
    Object.entries(apiKeys).forEach(([keyType, keyValue]) => {
        const headerName = API_KEY_TO_HEADER_MAP[keyType];
        if (headerName && keyValue) {
            headers[headerName] = keyValue;
        }
    });

    // Create request body without API keys
    const requestBody = body ? JSON.stringify(body) : undefined;

    // SECURITY: Log request without exposing sensitive information
    log.info('Secure API request initiated', {
        url: requestUrl.origin + requestUrl.pathname, // Don't log query params
        method,
        hasApiKeys: Object.keys(apiKeys).length > 0,
        apiKeyCount: Object.keys(apiKeys).length,
    });

    try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method,
            headers,
            body: requestBody,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse response
        let data: T;
        try {
            data = await response.json();
        } catch {
            data = (await response.text()) as any;
        }

        // SECURITY: Log response without exposing sensitive data
        log.info('Secure API request completed', {
            status: response.status,
            ok: response.ok,
            hasData: !!data,
        });

        return {
            data,
            status: response.status,
            headers: response.headers,
            ok: response.ok,
        };
    } catch (error) {
        // SECURITY: Log errors without exposing sensitive information
        log.error('Secure API request failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: requestUrl.origin + requestUrl.pathname,
        });
        throw error;
    }
}

/**
 * @deprecated Use completionApi.post() from @repo/shared/lib/http-client instead
 */
export async function legacySecureCompletionRequest(
    data: {
        mode: string;
        prompt: string;
        messages?: any[];
        threadId: string;
        threadItemId: string;
        parentThreadItemId?: string;
        customInstructions?: string;
        webSearch?: boolean;
        mathCalculator?: boolean;
        charts?: boolean;
        showSuggestions?: boolean;
        apiKeys?: Record<string, string>;
        userTier?: string;
    },
    options: LegacySecureRequestOptions = {},
): Promise<LegacySecureResponse> {
    return legacySecureFetch('/api/completion', {
        method: 'POST',
        body: data,
        ...options,
    });
}

/**
 * @deprecated Use validateHTTPS from @repo/shared/constants/security-headers instead
 */
export function validateRequestSecurity(request: Request): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check HTTPS
    if (!validateHTTPS(request)) {
        errors.push('HTTPS required for secure requests');
    }

    // Check for API keys in body (should be in headers instead)
    if (request.headers.get('content-type')?.includes('application/json')) {
        // We can't read the body here without consuming it, so this is a basic check
        const hasApiKeyHeaders = Object.values(API_KEY_TO_HEADER_MAP).some((header) =>
            request.headers.has(header)
        );

        if (!hasApiKeyHeaders) {
            // This might be okay - not all requests need API keys
            log.debug('Request has no API key headers', {
                url: new URL(request.url).pathname,
            });
        }
    }

    // Check security headers
    const requiredHeaders = ['user-agent'];
    for (const header of requiredHeaders) {
        if (!request.headers.has(header)) {
            errors.push(`Missing required header: ${header}`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
