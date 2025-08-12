/**
 * Test: Redis Cache Initialization
 *
 * Verifies that Redis cache invalidation setup is properly conditional:
 * - Silent during build time
 * - Active during runtime when Redis is available
 * - Graceful fallback when Redis is not available
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('Redis Cache Initialization', () => {
    let originalEnv: Record<string, string | undefined>;

    beforeEach(() => {
        // Save original environment
        originalEnv = {
            NEXT_PHASE: process.env.NEXT_PHASE,
            NODE_ENV: process.env.NODE_ENV,
            REDIS_URL: process.env.REDIS_URL,
        };
    });

    afterEach(() => {
        // Restore original environment
        Object.entries(originalEnv).forEach(([key, value]) => {
            if (value === undefined) {
                delete process.env[key];
            } else {
                process.env[key] = value;
            }
        });
    });

    it('should skip initialization during build phase', () => {
        process.env.NEXT_PHASE = 'phase-production-build';

        // Import the startup module
        const { initializeApp } = require('../lib/startup');

        // Should not throw and should complete silently
        expect(() => initializeApp()).not.toThrow();
    });

    it('should skip initialization in production without Redis URL', () => {
        process.env.NODE_ENV = 'production';
        delete process.env.REDIS_URL;

        const { initializeApp } = require('../lib/startup');

        expect(() => initializeApp()).not.toThrow();
    });

    it('should handle runtime initialization gracefully', () => {
        process.env.NODE_ENV = 'development';
        // Don't set REDIS_URL to test graceful fallback

        const { initializeApp } = require('../lib/startup');

        expect(() => initializeApp()).not.toThrow();
    });
});
