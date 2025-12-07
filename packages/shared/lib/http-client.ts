/**
 * Centralized HTTP client using native fetch
 * Replaces ky to avoid method-related TypeError issues
 */

import {
    API_KEY_TO_HEADER_MAP,
    createSecureHeaders,
} from '@repo/shared/constants/security-headers';

export interface ApiKeys {
    [key: string]: string;
}

export interface SecureRequestOptions {
    apiKeys?: ApiKeys;
    body?: any;
    headers?: HeadersInit;
    signal?: AbortSignal;
    timeout?: number;
    credentials?: RequestCredentials;
    throwOnError?: boolean;
    parseAs?: 'json' | 'text' | 'response';
}

/**
 * Create headers with security defaults and API keys
 */
function createRequestHeaders(apiKeys: ApiKeys = {}, customHeaders: HeadersInit = {}): Headers {
    const headers = new Headers(customHeaders);

    // Add security headers
    const secureHeaders = createSecureHeaders();
    Object.entries(secureHeaders).forEach(([key, value]) => {
        headers.set(key, value);
    });

    // Add API keys to headers (never in body for security)
    Object.entries(apiKeys).forEach(([keyType, keyValue]) => {
        const headerName = API_KEY_TO_HEADER_MAP[keyType];
        if (headerName && keyValue) {
            headers.set(headerName, keyValue);
        }
    });

    return headers;
}

/**
 * Wrapper for fetch with timeout support
 */
async function fetchWithTimeout(
    url: string,
    options: RequestInit & { timeout?: number; },
): Promise<Response> {
    const { timeout = 30000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        // Ensure method is always a string
        const method = String(fetchOptions.method || 'GET').toUpperCase();

        const response = await fetch(url, {
            ...fetchOptions,
            method,
            signal: fetchOptions.signal || controller.signal,
        });

        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

function shouldSendBody(method: string, body: unknown): boolean {
    const hasBody = body !== undefined && body !== null;
    return hasBody && method !== 'GET' && method !== 'DELETE';
}

async function request<T>(
    method: string,
    url: string,
    options: SecureRequestOptions = {},
): Promise<T> {
    const {
        apiKeys = {},
        body,
        headers: customHeaders,
        timeout,
        signal,
        credentials,
        throwOnError = true,
        parseAs = 'json',
    } = options;

    const headers = createRequestHeaders(apiKeys, customHeaders);

    if (shouldSendBody(method, body)) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetchWithTimeout(url, {
        method,
        headers,
        body: shouldSendBody(method, body) ? JSON.stringify(body) : undefined,
        timeout,
        signal,
        credentials,
    });

    if (throwOnError && !response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (parseAs === 'response') {
        return response as unknown as T;
    }

    if (parseAs === 'text') {
        return response.text() as unknown as T;
    }

    return response.json() as Promise<T>;
}

/**
 * Main HTTP client with automatic JSON handling and API key support
 */
export const http = {
    /**
     * GET request with optional API keys
     */
    get: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        return request<T>('GET', url, options);
    },

    /**
     * POST request with automatic JSON handling and API key support
     */
    post: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        return request<T>('POST', url, options);
    },

    /**
     * PUT request with automatic JSON handling and API key support
     */
    put: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        return request<T>('PUT', url, options);
    },

    /**
     * DELETE request with optional API keys
     */
    delete: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        return request<T>('DELETE', url, options);
    },

    /**
     * POST request that returns the raw Response object for streaming
     * Use this for endpoints that return streaming responses instead of JSON
     */
    postStream: async (url: string, options: SecureRequestOptions = {}): Promise<Response> => {
        return request<Response>('POST', url, { ...options, parseAs: 'response' });
    },
};

/**
 * Completion API client - specialized for your completion endpoint
 */
export const completionApi = {
    post: <T = any>(data: any, options: { apiKeys?: ApiKeys; } = {}): Promise<T> => {
        return http.post<T>('/api/completion', {
            body: data,
            apiKeys: options.apiKeys,
            timeout: 60000, // Longer timeout for AI completions
        });
    },
};

/**
 * Admin API client - for admin-only endpoints
 */
export const adminApi = {
    get: <T = any>(endpoint: string, options: SecureRequestOptions = {}): Promise<T> => {
        return http.get<T>(`/api/admin${endpoint}`, options);
    },

    post: <T = any>(endpoint: string, options: SecureRequestOptions = {}): Promise<T> => {
        return http.post<T>(`/api/admin${endpoint}`, options);
    },
};
