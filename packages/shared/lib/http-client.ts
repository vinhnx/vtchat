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

/**
 * Main HTTP client with automatic JSON handling and API key support
 */
export const http = {
    /**
     * GET request with optional API keys
     */
    get: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, headers: customHeaders, timeout, signal } = options;
        const headers = createRequestHeaders(apiKeys, customHeaders);

        const response = await fetchWithTimeout(url, {
            method: 'GET',
            headers,
            timeout,
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * POST request with automatic JSON handling and API key support
     */
    post: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, body, headers: customHeaders, timeout, signal } = options;
        const headers = createRequestHeaders(apiKeys, customHeaders);

        if (body) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined,
            timeout,
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * PUT request with automatic JSON handling and API key support
     */
    put: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, body, headers: customHeaders, timeout, signal } = options;
        const headers = createRequestHeaders(apiKeys, customHeaders);

        if (body) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetchWithTimeout(url, {
            method: 'PUT',
            headers,
            body: body ? JSON.stringify(body) : undefined,
            timeout,
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * DELETE request with optional API keys
     */
    delete: async <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, headers: customHeaders, timeout, signal } = options;
        const headers = createRequestHeaders(apiKeys, customHeaders);

        const response = await fetchWithTimeout(url, {
            method: 'DELETE',
            headers,
            timeout,
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * POST request that returns the raw Response object for streaming
     * Use this for endpoints that return streaming responses instead of JSON
     */
    postStream: async (url: string, options: SecureRequestOptions = {}): Promise<Response> => {
        const { apiKeys = {}, body, headers: customHeaders, timeout, signal } = options;
        const headers = createRequestHeaders(apiKeys, customHeaders);

        if (body) {
            headers.set('Content-Type', 'application/json');
        }

        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined,
            timeout,
            signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
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
