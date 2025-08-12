/**
 * Security constants for header-based API key transmission
 *
 * SECURITY NOTE: These headers provide better security than request body transmission
 * but should still be used only over HTTPS connections.
 */

export const API_KEY_HEADERS = {
    OPENAI: 'X-VT-OpenAI-Key',
    ANTHROPIC: 'X-VT-Anthropic-Key',
    GEMINI: 'X-VT-Gemini-Key',
    FIREWORKS: 'X-VT-Fireworks-Key',
    XAI: 'X-VT-XAI-Key',
    OPENROUTER: 'X-VT-OpenRouter-Key',
    TOGETHER: 'X-VT-Together-Key',
    JINA: 'X-VT-Jina-Key',
} as const;

export const SECURITY_HEADERS = {
    // Enforce HTTPS and prevent mixed content
    CONTENT_SECURITY_POLICY: 'Content-Security-Policy',
    STRICT_TRANSPORT_SECURITY: 'Strict-Transport-Security',
    X_CONTENT_TYPE_OPTIONS: 'X-Content-Type-Options',
    X_FRAME_OPTIONS: 'X-Frame-Options',
    X_XSS_PROTECTION: 'X-XSS-Protection',
    REFERRER_POLICY: 'Referrer-Policy',
} as const;

export const SECURITY_HEADER_VALUES = {
    STRICT_TRANSPORT_SECURITY: 'max-age=31536000; includeSubDomains; preload',
    X_CONTENT_TYPE_OPTIONS: 'nosniff',
    X_FRAME_OPTIONS: 'DENY',
    X_XSS_PROTECTION: '1; mode=block',
    REFERRER_POLICY: 'strict-origin-when-cross-origin',
    CONTENT_SECURITY_POLICY:
        "default-src 'self'; connect-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
} as const;

/**
 * Map API key types to secure header names
 */
export const API_KEY_TO_HEADER_MAP: Record<string, string> = {
    OPENAI_API_KEY: API_KEY_HEADERS.OPENAI,
    ANTHROPIC_API_KEY: API_KEY_HEADERS.ANTHROPIC,
    GEMINI_API_KEY: API_KEY_HEADERS.GEMINI,
    FIREWORKS_API_KEY: API_KEY_HEADERS.FIREWORKS,
    XAI_API_KEY: API_KEY_HEADERS.XAI,
    OPENROUTER_API_KEY: API_KEY_HEADERS.OPENROUTER,
    TOGETHER_API_KEY: API_KEY_HEADERS.TOGETHER,
    JINA_API_KEY: API_KEY_HEADERS.JINA,
} as const;

/**
 * Validates that a request is using HTTPS
 */
export function validateHTTPS(request: Request): boolean {
    const url = new URL(request.url);
    return url.protocol === 'https:' || process.env.NODE_ENV === 'development';
}

/**
 * Extracts API keys from secure headers
 */
export function extractApiKeysFromHeaders(headers: Headers): Record<string, string> {
    const apiKeys: Record<string, string> = {};

    // Extract API keys from headers
    Object.entries(API_KEY_TO_HEADER_MAP).forEach(([keyType, headerName]) => {
        const headerValue = headers.get(headerName);
        if (headerValue?.trim()) {
            apiKeys[keyType] = headerValue.trim();
        }
    });

    return apiKeys;
}

/**
 * Creates secure headers for API responses
 */
export function createSecureHeaders(): Record<string, string> {
    return {
        [SECURITY_HEADERS.STRICT_TRANSPORT_SECURITY]:
            SECURITY_HEADER_VALUES.STRICT_TRANSPORT_SECURITY,
        [SECURITY_HEADERS.X_CONTENT_TYPE_OPTIONS]: SECURITY_HEADER_VALUES.X_CONTENT_TYPE_OPTIONS,
        [SECURITY_HEADERS.X_FRAME_OPTIONS]: SECURITY_HEADER_VALUES.X_FRAME_OPTIONS,
        [SECURITY_HEADERS.X_XSS_PROTECTION]: SECURITY_HEADER_VALUES.X_XSS_PROTECTION,
        [SECURITY_HEADERS.REFERRER_POLICY]: SECURITY_HEADER_VALUES.REFERRER_POLICY,
    };
}
