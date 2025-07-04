import { log } from '@repo/shared/logger';
import { EnvironmentType } from '@repo/shared/types/environment';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { multiSession } from 'better-auth/plugins';
import { botDetection } from './bot-detection-plugin';
import { db } from './database';
import * as schema from './database/schema';

// Validate required OAuth environment variables (skip during build)
const isBuilding =
    process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuilding) {
    if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
        throw new Error(
            'GitHub OAuth environment variables (GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET) are not set'
        );
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        throw new Error(
            'Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are not set'
        );
    }

    if (!process.env.TWITTER_CLIENT_ID || !process.env.TWITTER_CLIENT_SECRET) {
        throw new Error(
            'Twitter OAuth environment variables (TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET) are not set'
        );
    }
}

export const auth = betterAuth({
    baseURL:
        process.env.NODE_ENV === 'production'
            ? 'https://vtchat.io.vn'
            : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
    basePath: '/api/auth',
    database: drizzleAdapter(db, {
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
        botDetection({
            protectedEndpoints: ['/api/auth/*'],
            errorMessage: 'BOT_DETECTED',
        }),
    ],
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'github', 'twitter'],
            allowDifferentEmails: true, // Allow for Twitter which doesn't provide email consistently
        },
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            redirectURI:
                process.env.NODE_ENV === 'production'
                    ? 'https://vtchat.io.vn/api/auth/callback/github'
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/github`,
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
            redirectURI:
                process.env.NODE_ENV === 'production'
                    ? 'https://vtchat.io.vn/api/auth/callback/google'
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
            scope: ['openid', 'email', 'profile'],
            mapProfileToUser: (profile) => {
                return {
                    image: profile.picture,
                };
            },
        },
        twitter: {
            clientId: process.env.TWITTER_CLIENT_ID!,
            clientSecret: process.env.TWITTER_CLIENT_SECRET!,
            redirectURI:
                process.env.NODE_ENV === 'production'
                    ? 'https://vtchat.io.vn/api/auth/callback/twitter'
                    : `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/twitter`,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes cache
        },
    },
    rateLimit: {
        enabled: true,
        window: 10, // time window in seconds
        max: 200, // Increased from 100 to handle more requests
    },
    trustedOrigins: [
        process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
        ...(process.env.NODE_ENV === 'development'
            ? [process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000']
            : []),
    ],
    fetchOptions: {
        timeout: 10_000, // 10 second timeout
        onError: async (context: { response: Response; request: Request }) => {
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
});

export type Session = typeof auth.$Infer.Session;
