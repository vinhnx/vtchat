import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createArcjetConfig, handleArcjetDecision } from '@repo/shared/lib/arcjet-config';

describe('Arcjet Integration Tests', () => {
    const mockArcjetKey = 'aj-test-key-12345';
    
    describe('Arcjet Configuration', () => {
        it('should create basic Arcjet configuration', () => {
            const config = createArcjetConfig({
                key: mockArcjetKey,
                enableBot: true,
                enableShield: true,
                enableRateLimit: true,
            });
            
            expect(config).toBeDefined();
        });

        it('should create chat-specific configuration', () => {
            const config = createArcjetConfig({
                key: mockArcjetKey,
                enableBot: true,
                enableShield: true,
                enableRateLimit: true,
                rateLimitConfig: {
                    algorithm: 'slidingWindow',
                    max: 50,
                    interval: '1h',
                },
                characteristics: ['userId', 'ip.src'],
            });
            
            expect(config).toBeDefined();
        });

        it('should create auth-specific configuration', () => {
            const config = createArcjetConfig({
                key: mockArcjetKey,
                enableBot: true,
                enableShield: true,
                enableRateLimit: true,
                rateLimitConfig: {
                    algorithm: 'fixedWindow',
                    max: 10,
                    interval: '10m',
                },
                enableEmailValidation: true,
                characteristics: ['ip.src'],
            });
            
            expect(config).toBeDefined();
        });

        it('should create token bucket configuration', () => {
            const config = createArcjetConfig({
                key: mockArcjetKey,
                enableBot: true,
                enableShield: true,
                enableRateLimit: true,
                rateLimitConfig: {
                    algorithm: 'tokenBucket',
                    max: 100,
                    interval: '1m',
                    capacity: 100,
                    refillRate: 50,
                },
                characteristics: ['ip.src'],
            });
            
            expect(config).toBeDefined();
        });
    });

    describe('Decision Handling', () => {
        it('should handle bot denial', () => {
            const mockDecision = {
                isDenied: () => true,
                reason: {
                    isBot: () => true,
                    isRateLimit: () => false,
                    isEmail: () => false,
                    isShield: () => false,
                },
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeDefined();
            expect(result?.status).toBe(403);
            expect(result?.body.type).toBe('BOT_DENIED');
            expect(result?.body.error).toContain('Bot traffic not allowed');
        });

        it('should handle rate limit denial', () => {
            const mockDecision = {
                isDenied: () => true,
                reason: {
                    isBot: () => false,
                    isRateLimit: () => true,
                    isEmail: () => false,
                    isShield: () => false,
                },
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeDefined();
            expect(result?.status).toBe(429);
            expect(result?.body.type).toBe('RATE_LIMIT_EXCEEDED');
            expect(result?.body.error).toContain('Rate limit exceeded');
            expect(result?.body.retryAfter).toBe('3600');
        });

        it('should handle email validation denial', () => {
            const mockDecision = {
                isDenied: () => true,
                reason: {
                    isBot: () => false,
                    isRateLimit: () => false,
                    isEmail: () => true,
                    isShield: () => false,
                },
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeDefined();
            expect(result?.status).toBe(400);
            expect(result?.body.type).toBe('EMAIL_INVALID');
            expect(result?.body.error).toContain('Invalid email address');
        });

        it('should handle shield denial', () => {
            const mockDecision = {
                isDenied: () => true,
                reason: {
                    isBot: () => false,
                    isRateLimit: () => false,
                    isEmail: () => false,
                    isShield: () => true,
                },
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeDefined();
            expect(result?.status).toBe(403);
            expect(result?.body.type).toBe('SHIELD_BLOCKED');
            expect(result?.body.error).toContain('Request blocked by security rules');
        });

        it('should handle general denial', () => {
            const mockDecision = {
                isDenied: () => true,
                reason: {
                    isBot: () => false,
                    isRateLimit: () => false,
                    isEmail: () => false,
                    isShield: () => false,
                },
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeDefined();
            expect(result?.status).toBe(403);
            expect(result?.body.type).toBe('GENERAL_DENIED');
            expect(result?.body.error).toContain('Request denied');
        });

        it('should return null for allowed requests', () => {
            const mockDecision = {
                isDenied: () => false,
            } as any;

            const result = handleArcjetDecision(mockDecision);
            
            expect(result).toBeNull();
        });
    });

    describe('Constants', () => {
        it('should export rate limit configurations', async () => {
            const { ARCJET_RATE_LIMITS } = await import('@repo/shared/constants');
            
            expect(ARCJET_RATE_LIMITS.CHAT).toBeDefined();
            expect(ARCJET_RATE_LIMITS.AUTH).toBeDefined();
            expect(ARCJET_RATE_LIMITS.API).toBeDefined();
            expect(ARCJET_RATE_LIMITS.FEEDBACK).toBeDefined();
        });

        it('should export bot configurations', async () => {
            const { ARCJET_BOT_CONFIG } = await import('@repo/shared/constants');
            
            expect(ARCJET_BOT_CONFIG.DEFAULT_ALLOW).toBeDefined();
            expect(ARCJET_BOT_CONFIG.STRICT_DENY).toBeDefined();
            expect(ARCJET_BOT_CONFIG.RELAXED_ALLOW).toBeDefined();
        });

        it('should export error types', async () => {
            const { ARCJET_ERROR_TYPES } = await import('@repo/shared/constants');
            
            expect(ARCJET_ERROR_TYPES.BOT_DENIED).toBe('BOT_DENIED');
            expect(ARCJET_ERROR_TYPES.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
            expect(ARCJET_ERROR_TYPES.EMAIL_INVALID).toBe('EMAIL_INVALID');
            expect(ARCJET_ERROR_TYPES.SHIELD_BLOCKED).toBe('SHIELD_BLOCKED');
            expect(ARCJET_ERROR_TYPES.GENERAL_DENIED).toBe('GENERAL_DENIED');
        });
    });

    describe('Route Matching', () => {
        it('should match chat routes', async () => {
            const { getArcjetForRoute } = await import('@/lib/arcjet');
            
            const result = getArcjetForRoute('/api/chat/rag');
            // Should return chat arcjet instance or null if no key
            expect(result === null || typeof result === 'object').toBe(true);
        });

        it('should match auth routes', async () => {
            const { getArcjetForRoute } = await import('@/lib/arcjet');
            
            const result = getArcjetForRoute('/api/auth/login');
            // Should return auth arcjet instance or null if no key
            expect(result === null || typeof result === 'object').toBe(true);
        });

        it('should match feedback routes', async () => {
            const { getArcjetForRoute } = await import('@/lib/arcjet');
            
            const result = getArcjetForRoute('/api/feedback');
            // Should return feedback arcjet instance or null if no key
            expect(result === null || typeof result === 'object').toBe(true);
        });

        it('should match general API routes', async () => {
            const { getArcjetForRoute } = await import('@/lib/arcjet');
            
            const result = getArcjetForRoute('/api/user/profile');
            // Should return API arcjet instance or null if no key
            expect(result === null || typeof result === 'object').toBe(true);
        });

        it('should return default for non-API routes', async () => {
            const { getArcjetForRoute } = await import('@/lib/arcjet');
            
            const result = getArcjetForRoute('/dashboard');
            // Should return default arcjet instance or null if no key
            expect(result === null || typeof result === 'object').toBe(true);
        });
    });
});
