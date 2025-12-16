import { log } from '@repo/shared/logger';
import { EnvironmentType } from '@repo/shared/types/environment';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, multiSession } from 'better-auth/plugins';
import { botDetection } from './bot-detection-plugin';
import * as schema from './database/schema';

// Defer database import so local dev without DATABASE_URL does not throw at module load
let dbInstance: any = null;
if (process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    dbInstance = require('./database').db;
}

export const authConfigured = Boolean(process.env.DATABASE_URL && dbInstance);

const isLocalhostUrl = (url?: string) => {
    return Boolean(url?.includes('localhost') || url?.includes('127.0.0.1'));
};

const defaultBaseUrl = process.env.NODE_ENV === 'production'
    ? 'https://vtchat.io.vn'
    : 'http://localhost:3000';

const envBaseUrl = process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    || process.env.NEXT_PUBLIC_BASE_URL;

const baseURL = envBaseUrl && !(process.env.NODE_ENV === 'production' && isLocalhostUrl(envBaseUrl))
    ? envBaseUrl
    : defaultBaseUrl;

// If the database is not configured (e.g., local dev without env), stub auth to avoid hard crashes.
export const auth = authConfigured
    ? betterAuth({
        baseURL,
        basePath: '/api/auth',
        database: drizzleAdapter(dbInstance, {
            provider: 'pg',
            schema: {
                user: schema.users,
                session: schema.sessions,
                account: schema.accounts,
                verification: schema.verifications,
                subscription: schema.userSubscriptions,
            },
        }),
        plugins: [
            emailHarmony(),
            multiSession({
                maximumSessions: 5,
            }),
            admin({
                adminUserIds: (process.env.ADMIN_USER_IDS || process.env.ADMIN_USER_ID || '')
                    .split(',')
                    .filter(Boolean),
                defaultRole: 'user',
                adminRoles: ['admin'],
            }),
            botDetection({
                protectedEndpoints: ['/api/auth/*'],
                errorMessage: 'BOT_DETECTED',
            }),
        ],
        account: {
            accountLinking: {
                enabled: true,
                trustedProviders: [
                    'google',
                    'github',
                    ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
                        ? ['twitter']
                        : []),
                ],
                allowDifferentEmails: true, // Allow for Twitter which doesn't provide email consistently
            },
        },
        socialProviders: {
            github: {
                clientId: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                redirectURI: `${baseURL}/api/auth/callback/github`,
                scope: ['read:user', 'user:email'],
                mapProfileToUser: (profile) => {
                    return {
                        image: profile.avatar_url,
                    };
                },
            },
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                redirectURI: `${baseURL}/api/auth/callback/google`,
                scope: ['openid', 'email', 'profile'],
                mapProfileToUser: (profile) => {
                    return {
                        image: profile.picture,
                    };
                },
            },
            ...(process.env.TWITTER_CLIENT_ID && process.env.TWITTER_CLIENT_SECRET
                ? {
                    twitter: {
                        clientId: process.env.TWITTER_CLIENT_ID,
                        clientSecret: process.env.TWITTER_CLIENT_SECRET,
                        redirectURI: `${baseURL}/api/auth/callback/twitter`,
                    },
                }
                : {}),
        },
        session: {
            expiresIn: 60 * 60 * 24 * 7, // 7 days
            updateAge: 60 * 60 * 12, // 12 hours (update session expiration more frequently)
            cookieCache: {
                enabled: true,
                maxAge: 60 * 30, // Increase to 30 minutes cache to prevent expiration during active chat sessions
            },
        },
        rateLimit: {
            enabled: true,
            window: 10, // time window in seconds
            max: 200, // Increased from 100 to handle more requests
        },
        trustedOrigins: [
            baseURL,
            ...(process.env.NODE_ENV === 'development'
                ? [process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000']
                : []),
        ],
        fetchOptions: {
            timeout: 10_000, // 10 second timeout
            onError: async (context: { response: Response; request: Request; }) => {
                const { response } = context;
                if (response.status === 429) {
                    const retryAfter = response.headers.get('X-Retry-After');
                    log.warn({ retryAfterSeconds: retryAfter }, 'Rate limit exceeded');
                }
            },
        },
        // Add performance optimizations
        advanced: {
            useSecureCookies: process.env.NODE_ENV === EnvironmentType.PRODUCTION,
            crossSubDomainCookies: {
                enabled: false, // Disable if not needed
            },
            database: {
                generateId: () => {
                    // Use faster ID generation for sessions
                    return crypto.randomUUID();
                },
            },
        },
    })
    : {
        api: {
            // Provide predictable failures for downstream callers
            getSession: async () => null,
        },
        $Infer: {
            Session: {} as never,
        },
        baseURL,
    };

// NOTE: If you see type errors related to better-auth types not assignable,
// ensure only one version of better-auth is installed in the monorepo root.
// Remove node_modules and bun.lockb in both root and app, then run `bun install` from root.

export type Session = typeof auth.$Infer.Session;
