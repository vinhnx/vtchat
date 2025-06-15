import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { boolean, json, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// Users table for Better Auth
export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(), // Using name as the username field (non-unique to allow display names)
    email: text('email').notNull().unique(),
    normalizedEmail: text('normalized_email').unique(), // emailHarmony plugin field
    emailVerified: boolean('email_verified').notNull().default(false), // Better Auth requires this field
    image: text('image'),
    planSlug: text('plan_slug').default(PlanSlug.VT_BASE), // Subscription plan (vt_base, vt_plus, etc.)
    creemCustomerId: text('creem_customer_id'), // Creem.io customer ID for portal access
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Sessions table for Better Auth
export const sessions = pgTable('sessions', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    token: text('token'),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Accounts table for OAuth providers
export const accounts = pgTable('accounts', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    expiresAt: timestamp('expires_at'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Verification tokens for email verification, password reset, etc.
export const verifications = pgTable('verifications', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User subscriptions (managed in database)
export const userSubscriptions = pgTable('user_subscriptions', {
    id: text('id').primaryKey(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    plan: text('plan').notNull().default(PlanSlug.VT_BASE), // vt_base, vt_plus
    status: text('status').notNull().default(SubscriptionStatusEnum.ACTIVE), // active, cancelled, expired
    creemCustomerId: text('creem_customer_id'), // Creem.io customer ID for subscription management
    creemSubscriptionId: text('creem_subscription_id'), // Creem.io subscription ID for tracking active subscriptions
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Feedback table (fully migrated to Drizzle ORM/Neon)
export const feedback = pgTable('feedback', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    feedback: text('feedback').notNull(),
    metadata: json('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Verification = typeof verifications.$inferSelect;
export type NewVerification = typeof verifications.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
