/**
 * Canonical Base URL Configuration
 *
 * Single source of truth for determining the application's base URL
 * across all environments (development, CI, production).
 */
import { log } from '../lib/logger';

interface BaseURLOptions {
    /**
     * If true, returns a URL safe for browser/client-side use (from NEXT_PUBLIC_* vars)
     * If false, uses server-only variables first
     */
    public?: boolean;
}

/**
 * Get the canonical base URL for the application
 *
 * @param opts Configuration options
 * @returns The base URL without trailing slash
 * @throws Error in production if no URL is configured
 */
export function getBaseURL(opts: BaseURLOptions = {}): string {
    let url: string | undefined;

    if (opts.public) {
        // For client-side usage, only use NEXT_PUBLIC_* variables
        url = process.env.NEXT_PUBLIC_APP_URL;
    } else {
        // For server-side usage, prefer APP_URL then fall back to NEXT_PUBLIC_APP_URL
        url = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    }

    // Backwards compatibility with deprecated environment variables
    if (!url) {
        const deprecatedVars = {
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            BASE_URL: process.env.BASE_URL,
            NEXTAUTH_URL: process.env.NEXTAUTH_URL,
            VERCEL_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
        };

        // Find first available deprecated variable
        for (const [varName, value] of Object.entries(deprecatedVars)) {
            if (value) {
                url = value;
                // Warn about deprecated usage
                if (typeof console !== 'undefined' && process.env.NODE_ENV !== 'test') {
                    log.warn(
                        {
                            deprecatedVar: varName,
                            replacement: 'NEXT_PUBLIC_APP_URL',
                        },
                        `[config] ${varName} is deprecated; please use NEXT_PUBLIC_APP_URL instead`,
                    );
                }
                break;
            }
        }
    }

    // Development fallback
    if (!url) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('APP_URL or NEXT_PUBLIC_APP_URL must be set in production environment');
        }
        return 'http://localhost:3000';
    }

    // Normalize URL (remove trailing slashes)
    return (
        url?.replace(/\/+$/, '')
        || (process.env.NODE_ENV === 'production'
            ? 'https://vtchat.io.vn'
            : 'http://localhost:3000')
    );
}

/**
 * Get base URL specifically for client-side usage
 * Shorthand for getBaseURL({ public: true })
 */
export function getPublicBaseURL(): string {
    const result = getBaseURL({ public: true });
    if (!result) {
        // This should never happen due to fallback logic, but just in case
        return process.env.NODE_ENV === 'production'
            ? 'https://vtchat.io.vn'
            : 'http://localhost:3000';
    }
    return result;
}

/**
 * Get base URL specifically for server-side usage
 * Shorthand for getBaseURL({ public: false })
 */
export function getServerBaseURL(): string {
    return getBaseURL({ public: false });
}
