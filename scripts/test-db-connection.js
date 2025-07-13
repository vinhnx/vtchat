#!/usr/bin/env node

/**
 * Test script to check database connection and verify VT+ users
 */

import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables from apps/web/.env.local
config({ path: resolve(process.cwd(), "apps/web/.env.local") });

console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("DATABASE_URL preview:", `${process.env.DATABASE_URL?.substring(0, 20)}...`);

try {
    const { db } = await import("../apps/web/lib/database/index.js");
    const { users, userSubscriptions } = await import("../apps/web/lib/database/schema.js");
    const { PlanSlug } = await import("../packages/shared/types/subscription.js");
    const { eq, and, isNull, or } = await import("drizzle-orm");

    console.log("Successfully loaded database modules");

    // Test query - just count users
    const _userCount = await db.select().from(users).limit(1);
    console.log("Database connection test successful");
} catch (error) {
    console.error("Database connection failed:", error.message);
}
