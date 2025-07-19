import { PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import {
    bigserial,
    boolean,
    customType,
    date,
    index,
    integer,
    json,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";

// Custom vector type for pgvector
const vector = customType<{ data: number[]; notNull: false; default: false }>({
    dataType(config) {
        return `vector(${config?.dimensions ?? 768})`;
    },
    toDriver(value: number[]) {
        return `[${value.join(",")}]`;
    },
    fromDriver(value: string) {
        return value.slice(1, -1).split(",").map(Number);
    },
});

// Users table for Better Auth
export const users = pgTable(
    "users",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(), // Using name as the username field (non-unique to allow display names)
        email: text("email").notNull().unique(),
        normalizedEmail: text("normalized_email").unique(), // emailHarmony plugin field
        emailVerified: boolean("email_verified").notNull().default(false), // Better Auth requires this field
        image: text("image"),
        role: text("role").default("user"), // User role: 'user' | 'admin'
        banned: boolean("banned").default(false), // Better-Auth admin plugin: user ban status
        banReason: text("ban_reason"), // Better-Auth admin plugin: reason for ban
        banExpires: timestamp("ban_expires"), // Better-Auth admin plugin: ban expiration
        protected: boolean("protected").default(false), // Protected admin users cannot be deleted/demoted
        planSlug: text("plan_slug").default(PlanSlug.VT_BASE), // Subscription plan (vt_base, vt_plus, etc.)
        creemCustomerId: text("creem_customer_id"), // Creem.io customer ID for portal access
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        // Indexes for better admin performance
        roleIdx: index("users_role_idx").on(table.role),
        bannedIdx: index("users_banned_idx").on(table.banned),
        protectedIdx: index("users_protected_idx").on(table.protected),
        planSlugIdx: index("users_plan_slug_idx").on(table.planSlug),
        emailIdx: index("users_email_idx").on(table.email),
    }),
);

// Sessions table for Better Auth
export const sessions = pgTable(
    "sessions",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        token: text("token"),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        impersonatedBy: text("impersonated_by"), // Better-Auth admin plugin: impersonation tracking
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        // Indexes for session management and admin features
        userIdIdx: index("sessions_user_id_idx").on(table.userId),
        tokenIdx: index("sessions_token_idx").on(table.token),
        userIdTokenIdx: index("sessions_user_id_token_idx").on(table.userId, table.token),
        expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
        userExpiresIdx: index("sessions_user_expires_idx").on(table.userId, table.expiresAt),
        impersonatedByIdx: index("sessions_impersonated_by_idx").on(table.impersonatedBy),
    }),
);

// Accounts table for OAuth providers
export const accounts = pgTable(
    "accounts",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        expiresAt: timestamp("expires_at"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        providerAccountIdx: index("provider_account_idx").on(
            table.providerId,
            table.accountId,
            table.userId,
        ),
    }),
);

// Verification tokens for email verification, password reset, etc.
export const verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User subscriptions (managed in database)
export const userSubscriptions = pgTable("user_subscriptions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    plan: text("plan").notNull().default(PlanSlug.VT_BASE), // vt_base, vt_plus
    status: text("status").notNull().default(SubscriptionStatusEnum.ACTIVE), // active, cancelled, expired
    creemCustomerId: text("creem_customer_id"), // Creem.io customer ID for subscription management
    creemSubscriptionId: text("creem_subscription_id"), // Creem.io subscription ID for tracking active subscriptions
    currentPeriodStart: timestamp("current_period_start"),
    currentPeriodEnd: timestamp("current_period_end"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Feedback table (fully migrated to Drizzle ORM/Neon)
export const feedback = pgTable("feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    feedback: text("feedback").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Resources table for RAG knowledge base
export const resources = pgTable("resources", {
    id: varchar("id", { length: 191 })
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Embeddings table for RAG vector search
export const embeddings = pgTable(
    "embeddings",
    {
        id: varchar("id", { length: 191 })
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        resourceId: varchar("resource_id", { length: 191 })
            .notNull()
            .references(() => resources.id, { onDelete: "cascade" }),
        content: text("content").notNull(),
        embedding: vector("embedding", { dimensions: 768 }).notNull(), // Default to 768 for text-embedding-004
    },
    (table) => ({
        embeddingIndex: index("embedding_index").using(
            "hnsw",
            table.embedding.op("vector_cosine_ops"),
        ),
    }),
);

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
// User rate limits table for free model usage tracking
export const userRateLimits = pgTable(
    "user_rate_limits",
    {
        id: text("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        modelId: text("model_id").notNull(), // e.g., 'gemini-2.5-flash-lite-preview-06-17'
        dailyRequestCount: text("daily_request_count").notNull().default("0"),
        minuteRequestCount: text("minute_request_count").notNull().default("0"),
        lastDailyReset: timestamp("last_daily_reset").notNull().defaultNow(),
        lastMinuteReset: timestamp("last_minute_reset").notNull().defaultNow(),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        userModelIndex: index("user_model_index").on(table.userId, table.modelId),
        uniqueUserModel: uniqueIndex("unique_user_model").on(table.userId, table.modelId),
    }),
);

// Provider usage table for cost tracking and budget monitoring
export const providerUsage = pgTable(
    "provider_usage",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => crypto.randomUUID()),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        modelId: text("model_id").notNull(), // e.g., 'gemini-2.5-flash-lite-preview-06-17'
        requestTimestamp: timestamp("request_timestamp").notNull().defaultNow(),
        estimatedCostCents: integer("estimated_cost_cents").notNull(), // Cost in cents (USD * 100)
        provider: text("provider").notNull().default("gemini"), // 'gemini', 'openai', etc.
        createdAt: timestamp("created_at").notNull().defaultNow(),
    },
    (table) => ({
        userTimeIndex: index("user_time_index").on(table.userId, table.requestTimestamp),
        monthlyUsageIndex: index("monthly_usage_index").on(table.requestTimestamp, table.provider),
        costTrackingIndex: index("cost_tracking_index").on(table.provider, table.requestTimestamp),
    }),
);

export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;
export type NewEmbedding = typeof embeddings.$inferInsert;
export type UserRateLimit = typeof userRateLimits.$inferSelect;
export type NewUserRateLimit = typeof userRateLimits.$inferInsert;
// VT+ usage tracking table for rate limiting
export const vtplusUsage = pgTable(
    "vtplus_usage",
    {
        id: bigserial("id", { mode: "number" }).primaryKey(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        feature: text("feature").notNull(), // VtPlusFeature enum value
        periodStart: date("period_start").notNull(), // First day of the month (UTC)
        used: integer("used").notNull().default(0),
        createdAt: timestamp("created_at").notNull().defaultNow(),
        updatedAt: timestamp("updated_at").notNull().defaultNow(),
    },
    (table) => ({
        lookupIndex: index("vtplus_usage_lookup_index").on(
            table.userId,
            table.feature,
            table.periodStart,
        ),
        uniqueUserFeaturePeriod: uniqueIndex("vtplus_usage_user_feature_period_unique").on(
            table.userId,
            table.feature,
            table.periodStart,
        ),
    }),
);

export type ProviderUsage = typeof providerUsage.$inferSelect;
export type NewProviderUsage = typeof providerUsage.$inferInsert;
export type VtplusUsage = typeof vtplusUsage.$inferSelect;
export type NewVtplusUsage = typeof vtplusUsage.$inferInsert;
