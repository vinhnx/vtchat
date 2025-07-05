#!/usr/bin/env node

/**
 * Cache Invalidation Script for Specific User
 *
 * This script invalidates the subscription cache for a specific user
 * to force fresh data on their next request.
 *
 * Usage: node scripts/invalidate-user-cache.js <user-id>
 */

import { log } from '@repo/shared/logger';

const USER_ID = process.argv[2] || '84362f24-8643-4a1e-8615-bb605c3e7717';

async function invalidateUserCache(userId) {
    console.log(`🔄 Invalidating cache for user: ${userId}`);
    log.info({ userId }, 'Starting cache invalidation for user');

    try {
        // Make request to production API to invalidate cache
        const response = await fetch('https://vtchat.io.vn/api/subscription/invalidate-cache', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: This endpoint requires authentication, so this script won't work directly
                // Instead, the user needs to trigger this from the frontend
            },
            body: JSON.stringify({
                targetUserId: userId
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Cache invalidation successful:', result);
            log.info({ result }, 'Cache invalidation successful');
        } else {
            console.log('❌ Cache invalidation failed:', response.status, response.statusText);
            log.error({ status: response.status, statusText: response.statusText }, 'Cache invalidation failed');
        }
    } catch (error) {
        console.error('❌ Error during cache invalidation:', error);
        log.error({ error }, 'Error during cache invalidation');
    }
}

console.log('📋 Cache Invalidation Script');
console.log(`Target User ID: ${USER_ID}`);
console.log('');

// Note: This script demonstrates the approach but requires frontend execution
console.log('⚠️  Note: The cache invalidation API requires user authentication.');
console.log('   The user needs to execute this from their browser console or');
console.log('   perform the following manual steps:');
console.log('');
console.log('🔧 Manual Steps for User:');
console.log('1. Log out completely from vtchat.io.vn');
console.log('2. Clear browser cache/cookies for vtchat.io.vn');
console.log('3. Log back in to vtchat.io.vn');
console.log('4. Check if VT+ status is now correctly displayed');
console.log('');
console.log('📞 Alternative: Contact support at hello@vtchat.io.vn');

// Uncomment below line to attempt the invalidation (will likely fail due to auth)
// invalidateUserCache(USER_ID);
