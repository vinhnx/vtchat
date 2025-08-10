var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { PlanSlug } from "@repo/shared/types/subscription";
import { SubscriptionStatusEnum } from "@repo/shared/types/subscription-status";
import { desc, eq, sql } from "drizzle-orm";
import { bigserial, boolean, date, index, integer, json, pgTable, text, timestamp, unique, uniqueIndex, uuid, } from "drizzle-orm/pg-core";
// Users table for Better Auth
export var users = pgTable("users", {
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
}, function (table) { return ({
    // Indexes for better admin performance
    roleIdx: index("users_role_idx").on(table.role),
    bannedIdx: index("users_banned_idx").on(table.banned),
    protectedIdx: index("users_protected_idx").on(table.protected),
    planSlugIdx: index("users_plan_slug_idx").on(table.planSlug),
    emailIdx: index("users_email_idx").on(table.email),
}); });
// Sessions table for Better Auth
export var sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    token: text("token"),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"), // Better-Auth admin plugin: impersonation tracking
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, function (table) { return ({
    // Indexes for session management and admin features
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    tokenIdx: index("sessions_token_idx").on(table.token),
    userIdTokenIdx: index("sessions_user_id_token_idx").on(table.userId, table.token),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
    userExpiresIdx: index("sessions_user_expires_idx").on(table.userId, table.expiresAt),
    impersonatedByIdx: index("sessions_impersonated_by_idx").on(table.impersonatedBy),
}); });
// Accounts table for OAuth providers
export var accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
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
}, function (table) { return ({
    providerAccountIdx: index("provider_account_idx").on(table.providerId, table.accountId, table.userId),
}); });
// Verification tokens for email verification, password reset, etc.
export var verifications = pgTable("verifications", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// User subscriptions (managed in database)
export var userSubscriptions = pgTable("user_subscriptions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
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
export var feedback = pgTable("feedback", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    feedback: text("feedback").notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
// Quota configurations table for VT+ feature limits
export var quotaConfigs = pgTable("quota_configs", {
    id: text("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()::text"], ["gen_random_uuid()::text"])))),
    feature: text("feature").notNull(),
    plan: text("plan").notNull(),
    quotaLimit: integer("quota_limit").notNull().default(0),
    quotaWindow: text("quota_window").notNull().default("daily"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, function (table) { return ({
    featurePlanUnique: unique("quota_configs_feature_plan_unique").on(table.feature, table.plan),
    featurePlanIdx: index("idx_quota_configs_feature_plan")
        .on(table.feature, table.plan)
        .where(eq(table.isActive, true)),
    updatedIdx: index("idx_quota_configs_updated").on(desc(table.updatedAt)),
}); });
// User rate limits table for free model usage tracking
export var userRateLimits = pgTable("user_rate_limits", {
    id: text("id")
        .primaryKey()
        .$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    modelId: text("model_id").notNull(), // e.g., 'gemini-2.5-flash-lite-preview-06-17'
    dailyRequestCount: text("daily_request_count").notNull().default("0"),
    minuteRequestCount: text("minute_request_count").notNull().default("0"),
    lastDailyReset: timestamp("last_daily_reset").notNull().defaultNow(),
    lastMinuteReset: timestamp("last_minute_reset").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, function (table) { return ({
    userModelIndex: index("user_model_index").on(table.userId, table.modelId),
    uniqueUserModel: uniqueIndex("unique_user_model").on(table.userId, table.modelId),
}); });
// Provider usage table for cost tracking and budget monitoring
export var providerUsage = pgTable("provider_usage", {
    id: uuid("id")
        .primaryKey()
        .$defaultFn(function () { return crypto.randomUUID(); }),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    modelId: text("model_id").notNull(), // e.g., 'gemini-2.5-flash-lite-preview-06-17' or 'deep-research'
    requestTimestamp: timestamp("request_timestamp").notNull().defaultNow(),
    provider: text("provider").notNull().default("gemini"), // 'gemini', 'openai', etc.
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, function (table) { return ({
    userTimeIndex: index("user_time_index").on(table.userId, table.requestTimestamp),
    monthlyUsageIndex: index("monthly_usage_index").on(table.requestTimestamp, table.provider),
}); });
// VT+ usage tracking table for rate limiting
export var vtplusUsage = pgTable("vtplus_usage", {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    feature: text("feature").notNull(), // VtPlusFeature enum value
    periodStart: date("period_start").notNull(), // First day of the month (UTC)
    used: integer("used").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, function (table) { return ({
    lookupIndex: index("vtplus_usage_lookup_index").on(table.userId, table.feature, table.periodStart),
    uniqueUserFeaturePeriod: uniqueIndex("vtplus_usage_user_feature_period_unique").on(table.userId, table.feature, table.periodStart),
}); });
// Resources table for storing user-generated content/resources
export var resources = pgTable("resources", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// E2B Sandbox usage tracking table for rate limiting and cost management
export var sandboxUsage = pgTable("sandbox_usage", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(function () { return users.id; }, { onDelete: "cascade" }),
    sandboxId: text("sandbox_id"), // E2B sandbox ID (if successful)
    success: boolean("success").notNull().default(false), // Whether sandbox was created successfully
    language: text("language").notNull().default("python"), // Programming language used
    timeoutMinutes: integer("timeout_minutes").notNull().default(10), // Sandbox timeout
    internetAccess: boolean("internet_access").notNull().default(false), // Whether internet access was enabled
    errorMessage: text("error_message"), // Error message if failed
    metadata: json("metadata"), // Additional metadata (user tier, source, etc.)
    createdAt: timestamp("created_at").notNull().defaultNow(),
}, function (table) { return ({
    userDateIndex: index("sandbox_usage_user_date_index").on(table.userId, table.createdAt),
    successIndex: index("sandbox_usage_success_index").on(table.success, table.createdAt),
    dailyUsageIndex: index("sandbox_usage_daily_index").on(table.userId, sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["date_trunc('day', ", ")"], ["date_trunc('day', ", ")"])), table.createdAt)),
}); });
var templateObject_1, templateObject_2;
