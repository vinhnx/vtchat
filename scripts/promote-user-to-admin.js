#!/usr/bin/env bun

/**
 * Script to promote a user to admin and protect them
 * Usage: bun scripts/promote-user-to-admin.js <user_id>
 */

const { eq } = require("drizzle-orm");
const { log } = require("@repo/shared/logger");

async function promoteUserToAdmin(userId) {
    if (!userId) {
        log.error("Error: User ID is required");
        log.info("Usage: bun scripts/promote-user-to-admin.js <user_id>");
        process.exit(1);
    }

    try {
        // Import database connection and schema
        const { db } = require("../apps/web/lib/database");
        const { users } = require("../apps/web/lib/database/schema");

        log.info(`Promoting user ${userId} to admin...`);

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (existingUser.length === 0) {
            log.error(`Error: User with ID ${userId} not found`);
            process.exit(1);
        }

        const user = existingUser[0];
        log.info(`Found user: ${user.name || "Unknown"} (${user.email})`);
        log.info(`Current role: ${user.role}`);
        log.info(`Current protected status: ${user.protected}`);

        // Update user to admin and protect them
        const result = await db
            .update(users)
            .set({
                role: "admin",
                protected: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (result.length > 0) {
            log.info("✅ Successfully promoted user to admin!");
            log.info(`User: ${result[0].name || "Unknown"} (${result[0].email})`);
            log.info(`New role: ${result[0].role}`);
            log.info(`Protected: ${result[0].protected}`);
        } else {
            log.error("❌ Failed to update user");
            process.exit(1);
        }
    } catch (error) {
        log.error("❌ Error promoting user to admin:", error);
        process.exit(1);
    }
}

// Get user ID from command line arguments
const userId = process.argv[2];
promoteUserToAdmin(userId);
