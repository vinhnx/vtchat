/**
 * Centralized HTTP client using ky
 * Replaces secure-http.ts with a more powerful and concise solution
 */

import {
    API_KEY_TO_HEADER_MAP,
    createSecureHeaders,
    // validateHTTPS,
} from '@repo/shared/constants/security-headers';
// import { log } from '@repo/shared/lib/logger';
import ky, { type KyInstance, type Options as KyOptions } from 'ky';

export interface ApiKeys {
    [key: string]: string;
}

export interface SecureRequestOptions extends Omit<KyOptions, 'json'> {
    apiKeys?: ApiKeys;
    body?: any;
}

/**
 * Base HTTP client with security defaults
 */
const baseClient = ky.create({
    timeout: 30000,
    retry: {
        limit: 2,
        methods: ['get', 'put', 'head', 'delete', 'options', 'trace'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    // Disable hooks temporarily to isolate issue
    // hooks: {
    //     beforeRequest: [
    //         (request) => {
    //             // SECURITY: Validate HTTPS in production
    //             if (process.env.NODE_ENV === 'production' && !validateHTTPS(request)) {
    //                 log.warn('SECURITY: Non-HTTPS request rejected', {
    //                     url: new URL(request.url).pathname,
    //                 });
    //                 throw new Error('HTTPS required in production');
    //             }

    //             // Log request (without sensitive data)
    //             log.info('HTTP request initiated', {
    //                 url: new URL(request.url).origin + new URL(request.url).pathname,
    //                 method: String(request.method || 'GET'),
    //             });
    //         },
    //     ],
    //     afterResponse: [
    //         (_request, _options, response) => {
    //             // Log response
    //             log.info('HTTP request completed', {
    //                 status: response.status,
    //                 ok: response.ok,
    //             });
    //             return response;
    //         },
    //     ],
    //     beforeError: [
    //         (error) => {
    //             // Log errors without exposing sensitive information
    //             log.error('HTTP request failed', {
    //                 message: error.message,
    //                 status: error.response?.status,
    //             });
    //             return error;
    //         },
    //     ],
    // },
});

/**
 * Create a secure HTTP client instance with API key handling
 */
export function createSecureClient(defaultApiKeys: ApiKeys = {}): KyInstance {
    return baseClient.extend({
        hooks: {
            beforeRequest: [
                (request) => {
                    // Add security headers
                    const secureHeaders = createSecureHeaders();
                    Object.entries(secureHeaders).forEach(([key, value]) => {
                        request.headers.set(key, value);
                    });

                    // Add API keys to headers (never in body for security)
                    Object.entries(defaultApiKeys).forEach(([keyType, keyValue]) => {
                        const headerName = API_KEY_TO_HEADER_MAP[keyType];
                        if (headerName && keyValue) {
                            request.headers.set(headerName, keyValue);
                        }
                    });
                },
            ],
        },
    });
}

/**
 * Main HTTP client with automatic JSON handling and API key support
 */
export const http = {
    /**
     * GET request with optional API keys
     */
    get: <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, ...kyOptions } = options;
        const client = Object.keys(apiKeys).length > 0 ? createSecureClient(apiKeys) : baseClient;
        return client.get(url, kyOptions).json<T>();
    },

    /**
     * POST request with automatic JSON handling and API key support
     */
    post: <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, body, ...kyOptions } = options;
        const client = Object.keys(apiKeys).length > 0 ? createSecureClient(apiKeys) : baseClient;

        const requestOptions: KyOptions = {
            ...kyOptions,
            ...(body && { json: body }),
        };

        return client.post(url, requestOptions).json<T>();
    },

    /**
     * PUT request with automatic JSON handling and API key support
     */
    put: <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, body, ...kyOptions } = options;
        const client = Object.keys(apiKeys).length > 0 ? createSecureClient(apiKeys) : baseClient;

        const requestOptions: KyOptions = {
            ...kyOptions,
            ...(body && { json: body }),
        };

        return client.put(url, requestOptions).json<T>();
    },

    /**
     * DELETE request with optional API keys
     */
    delete: <T = any>(url: string, options: SecureRequestOptions = {}): Promise<T> => {
        const { apiKeys = {}, ...kyOptions } = options;
        const client = Object.keys(apiKeys).length > 0 ? createSecureClient(apiKeys) : baseClient;
        return client.delete(url, kyOptions).json<T>();
    },

    /**
     * Raw client access for custom requests
     */
    client: baseClient,

    /**
     * POST request that returns the raw Response object for streaming
     * Use this for endpoints that return streaming responses instead of JSON
     */
    postStream: (url: string, options: SecureRequestOptions = {}): Promise<Response> => {
        const { apiKeys = {}, body, ...kyOptions } = options;
        const client = Object.keys(apiKeys).length > 0 ? createSecureClient(apiKeys) : baseClient;

        const requestOptions: KyOptions = {
            ...kyOptions,
            ...(body && { json: body }),
        };

        // Return the raw Response for streaming
        return client.post(url, requestOptions);
    },

    /**
     * Create a custom client with specific API keys
     */
    withApiKeys: (apiKeys: ApiKeys): KyInstance => createSecureClient(apiKeys),
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

// Export types for easier usage
export { ky };
export type { KyOptions };
