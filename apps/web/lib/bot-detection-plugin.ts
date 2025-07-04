import type { BetterAuthPlugin } from 'better-auth';
import { APIError } from 'better-auth/api';
import { createAuthMiddleware } from 'better-auth/plugins';
import { isbot } from 'isbot';

interface BotDetectionOptions {
    protectedEndpoints?: string[];
    errorMessage?: string;
}

const escapeRegex = (str: string) => {
    return str.replace(/[-[\]/{}()+?.\\^$|]/g, '\\$&');
};

const pathToRegexp = (path: string) => {
    const pattern = escapeRegex(path).replace(/\*/g, '.*');
    return new RegExp(`^${pattern}$`);
};

export const botDetection = (options: BotDetectionOptions = {}) => {
    return {
        id: 'bot-detection',
        hooks: {
            before: [
                {
                    matcher: (context) => {
                        const { method, path } = context;

                        // Only check POST and GET requests
                        if (method !== 'POST' && method !== 'GET') {
                            return false;
                        }

                        // Use path from context
                        if (!path) {
                            return false;
                        }

                        const { protectedEndpoints } = options;

                        // If specific endpoints are configured, check if current path matches
                        if (protectedEndpoints && protectedEndpoints.length > 0) {
                            const isProtected = protectedEndpoints.some((endpoint) =>
                                pathToRegexp(endpoint).test(path)
                            );
                            return isProtected;
                        }

                        // Default: protect all auth-related endpoints
                        return path.startsWith('/api/auth');
                    },
                    handler: createAuthMiddleware(async (ctx) => {
                        const userAgent = ctx.headers.get('user-agent') || '';

                        if (isbot(userAgent)) {
                            throw new APIError('BAD_REQUEST', {
                                message: options.errorMessage || 'BOT_DETECTED',
                            });
                        }

                        return { context: ctx };
                    }),
                },
            ],
        },
    } satisfies BetterAuthPlugin;
};
