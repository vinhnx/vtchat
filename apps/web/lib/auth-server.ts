import { EnvironmentType } from '@repo/shared/types/environment';
import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { multiSession } from 'better-auth/plugins';
import { db } from './database';
import * as schema from './database/schema';

export const auth = betterAuth({
    baseURL:
        process.env.NODE_ENV === 'production'
            ? 'https://vtchat.io.vn'
            : process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
              process.env.NEXT_PUBLIC_BASE_URL ||
              'http://localhost:3000',
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
    ],
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ['google', 'github'],
            allowDifferentEmails: false, // More secure - require same email
        },
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            redirectURI:
                process.env.NODE_ENV === 'production'
                    ? 'https://vtchat.io.vn/api/auth/callback/github'
                    : 'http://localhost:3000/api/auth/callback/github',
            scope: ['read:user', 'user:email'],
            mapProfileToUser: profile => {
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
                    : 'http://localhost:3000/api/auth/callback/google',
            scope: ['openid', 'email', 'profile'],
            mapProfileToUser: profile => {
                return {
                    image: profile.picture,
                };
            },
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
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],
    fetchOptions: {
        timeout: 10000, // 10 second timeout
        onError: async (context: { response: Response; request: Request }) => {
            const { response } = context;
            if (response.status === 429) {
                const retryAfter = response.headers.get('X-Retry-After');
                console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
            }
        },
    },
    // Add performance optimizations
    advanced: {
        useSecureCookies: process.env.NODE_ENV === EnvironmentType.PRODUCTION,
        crossSubDomainCookies: {
            enabled: false, // Disable if not needed
        },
        generateId: () => {
            // Use faster ID generation for sessions
            return crypto.randomUUID();
        },
    },
});

export type Session = typeof auth.$Infer.Session;
