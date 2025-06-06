-- Better Auth Migration for VT Chat
-- This migration creates the required tables for Better Auth authentication system
-- and migrates from Clerk to Better Auth

-- Users table for Better Auth
CREATE TABLE IF NOT EXISTS "users" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL UNIQUE,
    "email_verified" boolean DEFAULT false NOT NULL,
    "image" text,
    "credits" integer DEFAULT 0,
    "plan_slug" text DEFAULT 'free',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Sessions table for Better Auth
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" text PRIMARY KEY NOT NULL,
    "expires_at" timestamp NOT NULL,
    "ip_address" text,
    "user_agent" text,
    "user_id" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Accounts table for OAuth providers
CREATE TABLE IF NOT EXISTS "accounts" (
    "id" text PRIMARY KEY NOT NULL,
    "account_id" text NOT NULL,
    "provider_id" text NOT NULL,
    "user_id" text NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "id_token" text,
    "expires_at" timestamp,
    "password" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Verification tokens for email verification, password reset, etc.
CREATE TABLE IF NOT EXISTS "verifications" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- User subscriptions and credits (managed in database)
CREATE TABLE IF NOT EXISTS "user_subscriptions" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "plan" text DEFAULT 'free' NOT NULL,
    "status" text DEFAULT 'active' NOT NULL,
    "credits_remaining" integer DEFAULT 0 NOT NULL,
    "credits_used" integer DEFAULT 0 NOT NULL,
    "monthly_credits" integer DEFAULT 50 NOT NULL,
    "stripe_customer_id" text,
    "stripe_subscription_id" text,
    "current_period_start" timestamp,
    "current_period_end" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Feedback table (existing table from Prisma)
CREATE TABLE IF NOT EXISTS "feedback" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" text NOT NULL,
    "feedback" text NOT NULL,
    "metadata" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "sessions_user_id_idx" ON "sessions"("user_id");
CREATE INDEX IF NOT EXISTS "accounts_user_id_idx" ON "accounts"("user_id");
CREATE INDEX IF NOT EXISTS "user_subscriptions_user_id_idx" ON "user_subscriptions"("user_id");
CREATE INDEX IF NOT EXISTS "feedback_user_id_idx" ON "feedback"("user_id");
