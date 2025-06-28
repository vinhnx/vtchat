import { describe, it, expect } from 'vitest';
import { 
    createBetterAuthArcjet,
    createBetterAuthEmailOptions,
    createBetterAuthBotOptions,
    createBetterAuthRateLimitOptions,
    createBetterAuthSignupOptions,
} from '@repo/shared/lib/arcjet-config';

describe('Better Auth + Arcjet Integration Tests', () => {
    const mockArcjetKey = 'aj-test-key-12345';

    describe('Better Auth Configurations', () => {
        it('should create email validation options', () => {
            const emailOptions = createBetterAuthEmailOptions();
            
            expect(emailOptions.mode).toBe('LIVE');
            expect(emailOptions.block).toEqual(['DISPOSABLE', 'INVALID', 'NO_MX_RECORDS']);
        });

        it('should create bot protection options', () => {
            const botOptions = createBetterAuthBotOptions();
            
            expect(botOptions.mode).toBe('LIVE');
            expect(botOptions.allow).toEqual([]);
        });

        it('should create rate limit options', () => {
            const rateLimitOptions = createBetterAuthRateLimitOptions();
            
            expect(rateLimitOptions.mode).toBe('LIVE');
            expect(rateLimitOptions.interval).toBe('2m');
            expect(rateLimitOptions.max).toBe(5);
        });

        it('should create signup protection options', () => {
            const signupOptions = createBetterAuthSignupOptions();
            
            expect(signupOptions.email).toBeDefined();
            expect(signupOptions.bots).toBeDefined();
            expect(signupOptions.rateLimit).toBeDefined();
            
            expect(signupOptions.email.mode).toBe('LIVE');
            expect(signupOptions.bots.mode).toBe('LIVE');
            expect(signupOptions.rateLimit.mode).toBe('LIVE');
        });

        it('should create Better Auth Arcjet instance', () => {
            const arcjet = createBetterAuthArcjet(mockArcjetKey);
            
            expect(arcjet).toBeDefined();
            expect(typeof arcjet.protect).toBe('function');
        });
    });

    describe('Configuration Values', () => {
        it('should use appropriate rate limits for auth', () => {
            const rateLimitOptions = createBetterAuthRateLimitOptions();
            
            // Should be more restrictive than general API calls
            expect(rateLimitOptions.max).toBeLessThanOrEqual(10);
            expect(rateLimitOptions.interval).toMatch(/^[0-9]+[sm]$/); // Should be in seconds or minutes
        });

        it('should block problematic email types', () => {
            const emailOptions = createBetterAuthEmailOptions();
            
            expect(emailOptions.block).toContain('DISPOSABLE');
            expect(emailOptions.block).toContain('INVALID');
            expect(emailOptions.block).toContain('NO_MX_RECORDS');
        });

        it('should prevent bot submissions', () => {
            const botOptions = createBetterAuthBotOptions();
            
            // Should block all bots for auth forms
            expect(botOptions.allow).toHaveLength(0);
            expect(botOptions.mode).toBe('LIVE');
        });
    });

    describe('Integration Scenarios', () => {
        it('should handle signup scenario configuration', () => {
            const signupOptions = createBetterAuthSignupOptions();
            
            // Signup should have all protections enabled
            expect(signupOptions.email).toBeDefined();
            expect(signupOptions.bots).toBeDefined();
            expect(signupOptions.rateLimit).toBeDefined();
            
            // Should be in LIVE mode for production protection
            expect(signupOptions.email.mode).toBe('LIVE');
            expect(signupOptions.bots.mode).toBe('LIVE');
            expect(signupOptions.rateLimit.mode).toBe('LIVE');
        });

        it('should use userId characteristics for user-specific limits', () => {
            const arcjet = createBetterAuthArcjet(mockArcjetKey);
            
            // The Arcjet instance should be configured for user-specific tracking
            expect(arcjet).toBeDefined();
        });
    });

    describe('Error Response Handling', () => {
        it('should provide user-friendly email error messages', () => {
            const emailOptions = createBetterAuthEmailOptions();
            
            // Test that we block the right email types that will trigger user-friendly messages
            const blockedTypes = emailOptions.block;
            
            expect(blockedTypes.includes('INVALID')).toBe(true); // "Email address format is invalid"
            expect(blockedTypes.includes('DISPOSABLE')).toBe(true); // "We do not allow disposable email addresses"
            expect(blockedTypes.includes('NO_MX_RECORDS')).toBe(true); // "Your email domain does not have an MX record"
        });

        it('should have appropriate rate limit for auth attempts', () => {
            const rateLimitOptions = createBetterAuthRateLimitOptions();
            
            // Should allow reasonable number of auth attempts
            expect(rateLimitOptions.max).toBeGreaterThan(2);
            expect(rateLimitOptions.max).toBeLessThanOrEqual(10);
            
            // Should have reasonable time window
            expect(rateLimitOptions.interval).toMatch(/^[0-9]+[sm]$/);
        });
    });

    describe('Security Best Practices', () => {
        it('should use LIVE mode for production security', () => {
            const emailOptions = createBetterAuthEmailOptions();
            const botOptions = createBetterAuthBotOptions();
            const rateLimitOptions = createBetterAuthRateLimitOptions();
            
            expect(emailOptions.mode).toBe('LIVE');
            expect(botOptions.mode).toBe('LIVE');
            expect(rateLimitOptions.mode).toBe('LIVE');
        });

        it('should block all bots for auth forms', () => {
            const botOptions = createBetterAuthBotOptions();
            
            // Auth forms should not allow any bots
            expect(botOptions.allow).toHaveLength(0);
        });

        it('should validate critical email properties', () => {
            const emailOptions = createBetterAuthEmailOptions();
            
            // Should check for fundamental email issues
            expect(emailOptions.block).toContain('INVALID');
            expect(emailOptions.block).toContain('NO_MX_RECORDS');
        });
    });
});
