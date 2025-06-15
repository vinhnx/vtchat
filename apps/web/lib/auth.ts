import { betterAuth } from 'better-auth';
import { emailHarmony } from 'better-auth-harmony';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './database';
import * as schema from './database/schema';

export const auth = betterAuth({
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
    plugins: [emailHarmony()],
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
    },
    rateLimit: {
        enabled: true,
        window: 10, // time window in seconds
        max: 100, // max requests in the window
    },
    fetchOptions: {
        onError: async (context: { response: Response; request: Request }) => {
            const { response } = context;
            if (response.status === 429) {
                const retryAfter = response.headers.get('X-Retry-After');
                console.log(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
            }
        },
    },
});

export type Session = typeof auth.$Infer.Session;
