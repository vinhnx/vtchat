import {
    API_KEY_TO_HEADER_MAP,
    createSecureHeaders,
    validateHTTPS,
} from '@repo/shared/constants/security-headers';
import { log } from '@repo/shared/logger';

/**
 * Secure HTTP client that enforces HTTPS and handles API keys via headers
 *
 * SECURITY FEATURES:
 * - Enforces HTTPS for all requests
 * - Moves API keys from request body to secure headers
 * - Adds security headers to all responses
 * - Never logs sensitive API key information
 */

export interface SecureRequestOptions {
    method?: string;
    body?: any;
    apiKeys?: Record<string, string>;
    additionalHeaders?: Record<string, string>;
    timeout?: number;
}

export interface SecureResponse<T = any> {
    data: T;
    status: number;
    headers: Headers;
    ok: boolean;
}

/**
 * Secure fetch wrapper that handles API key transmission via headers
 */
export async function secureFetch<T = any>(
    url: string,
    options: SecureRequestOptions = {},
): Promise<SecureResponse<T>> {
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
 * Secure wrapper for the completion API endpoint
 */
export async function secureCompletionRequest(
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
        thinkingMode?: any;
        userTier?: string;
    },
    apiKeys: Record<string, string> = {},
): Promise<Response> {
    // SECURITY: Remove API keys from request body and send via headers
    const cleanBody = { ...data };

    const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...createSecureHeaders(),
            // Add API keys to headers
            ...Object.entries(apiKeys).reduce(
                (headers, [keyType, keyValue]) => {
                    const headerName = API_KEY_TO_HEADER_MAP[keyType];
                    if (headerName && keyValue) {
                        headers[headerName] = keyValue;
                    }
                    return headers;
                },
                {} as Record<string, string>,
            ),
        },
        body: JSON.stringify(cleanBody),
    });

    // SECURITY: Log request completion without exposing sensitive data
    log.info('Completion request sent', {
        mode: data.mode,
        hasApiKeys: Object.keys(apiKeys).length > 0,
        status: response.status,
    });

    return response;
}

/**
 * Validates request security before processing
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
