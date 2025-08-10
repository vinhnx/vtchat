#!/usr/bin/env node

/**
 * Test script to check database connection and verify VT+ users
 */

import { log } from "@repo/shared/logger";
import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables from apps/web/.env.local
config({ path: resolve(process.cwd(), "apps/web/.env.local") });

log.info("DATABASE_URL exists:", !!process.env.DATABASE_URL);
log.info("DATABASE_URL preview:", `${process.env.DATABASE_URL?.substring(0, 20)}...`);

try {
    const { db } = await import("../apps/web/lib/database/index.js");
    const { users } = await import("../apps/web/lib/database/schema.js");

    log.info("Successfully loaded database modules");

    // Test query - just count users
    const _userCount = await db.select().from(users).limit(1);
    log.info("Database connection test successful");
} catch (error) {
    log.error("Database connection failed:", error.message);
}
