#!/usr/bin/env bun

/**
 * Script to promote a user to admin and protect them
 * Usage: bun scripts/promote-user-to-admin.js <user_id>
 */

const { eq } = require('drizzle-orm');

// Simple logger for script output
const log = {
    info: (data, msg) => {
        if (typeof data === 'string') {
            console.log(data);
        } else {
            console.log(msg || 'Info:', JSON.stringify(data, null, 2));
        }
    },
    error: (data, msg) => {
        if (typeof data === 'string') {
            console.error(data);
        } else {
            console.error(msg || 'Error:', JSON.stringify(data, null, 2));
        }
    },
};

async function promoteUserToAdmin(userId) {
    if (!userId) {
        log.error('Error: User ID is required');
        log.info('Usage: bun scripts/promote-user-to-admin.js <user_id>');
        process.exit(1);
    }

    try {
        // Import database connection and schema
        const { db } = require('../apps/web/lib/database');
        const { users } = require('../apps/web/lib/database/schema');

        log.info(`🔍 Looking for user with ID: ${userId}`);

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (existingUser.length === 0) {
            log.error(`Error: User with ID ${userId} not found`);
            process.exit(1);
        }

        const user = existingUser[0];
        log.info({ 
            userEmail: user.email, 
            userId: user.id,
            currentRole: user.role,
            protected: user.protected
        }, '✅ Found user');

        // Update user to admin and protect them
        const result = await db
            .update(users)
            .set({
                role: 'admin',
                protected: true,
                updatedAt: new Date(),
            })
            .where(eq(users.id, userId))
            .returning();

        if (result.length > 0) {
            log.info({
                userId,
                newRole: result[0].role,
                protected: result[0].protected
            }, '✅ Successfully promoted user to admin');
        } else {
            log.error('❌ Failed to update user');
            process.exit(1);
        }
    } catch (error) {
        log.error({ error: error.message, userId }, '❌ Error promoting user to admin');
        process.exit(1);
    }
}

// Get user ID from command line arguments
const userId = process.argv[2];
promoteUserToAdmin(userId);
