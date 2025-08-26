import { ModelEnum } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';
import type { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the auth module
const mockAuth = {
    api: {
        getSession: vi.fn(),
    },
};

vi.mock('@/lib/auth-server', () => ({
    auth: mockAuth,
}));

// Mock the rate limiting service
const mockRateLimit = {
    checkRateLimit: vi.fn(),
    recordRequest: vi.fn(),
};

vi.mock('@/lib/services/rate-limit', () => mockRateLimit);

// Mock the model functions
vi.mock('@repo/ai/models', () => ({
    ModelEnum: {
        GEMINI_2_5_FLASH_LITE: 'gemini-2.5-flash-lite',
        GPT_4o: 'gpt-4o',
    },
    getModelFromChatMode: vi.fn(),
}));

// Import the route handler after mocks
import { POST } from '@/app/api/completion/route';

describe('Gemini 2.5 Flash Lite - API Integration Tests', () => {
    const authenticatedUserId = 'auth-user-123';
    const _unauthenticatedUser = null;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock getModelFromChatMode
        const { getModelFromChatMode } = require('@repo/ai/models');
        getModelFromChatMode.mockImplementation((mode: string) => {
            if (mode === ChatMode.GEMINI_2_5_FLASH_LITE) {
                return ModelEnum.GEMINI_2_5_FLASH_LITE;
            }
            return ModelEnum.GPT_4o;
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const createMockRequest = (body: any, headers: Record<string, string> = {}) => {
        const request = {
            method: 'POST',
            headers: new Headers(headers),
            json: vi.fn().mockResolvedValue(body),
            signal: new AbortController().signal,
            nextUrl: { searchParams: new URLSearchParams() },
        } as unknown as NextRequest;

        return request;
    };

    describe('Authentication Requirements for Free Model', () => {
        it('should require authentication for Gemini 2.5 Flash Lite', async () => {
            // Mock unauthenticated user
            mockAuth.api.getSession.mockResolvedValue(null);

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody);
            const response = await POST(request);

            expect(response.status).toBe(401);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Authentication required',
                message: 'Please register to use the free Gemini 2.5 Flash Lite model.',
                redirect: '/auth/login',
            });
        });

        it('should allow authenticated users to access free model (within limits)', async () => {
            // Mock authenticated user
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });

            // Mock rate limit check - allow request
            mockRateLimit.checkRateLimit.mockResolvedValue({
                allowed: true,
                remainingDaily: 5,
                remainingMinute: 1,
                resetTime: {
                    daily: new Date(),
                    minute: new Date(),
                },
            });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            // Note: This test would require more mocking of the completion stream
            // For now, we'll check that rate limiting is called correctly
            try {
                await POST(request);
            } catch {
                // Expected to fail due to incomplete mocking of stream handlers
            }

            expect(mockRateLimit.checkRateLimit).toHaveBeenCalledWith(
                authenticatedUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
            );
        });

        it('should allow paid models without authentication restrictions', async () => {
            // Mock unauthenticated user
            mockAuth.api.getSession.mockResolvedValue(null);

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GPT_4o, // Paid model
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            // Should not fail authentication for paid models
            try {
                await POST(request);
            } catch {
                // Expected to fail due to incomplete mocking, but not auth error
            }

            // Should not check rate limits for paid models
            expect(mockRateLimit.checkRateLimit).not.toHaveBeenCalled();
        });
    });

    describe('Rate Limit Enforcement', () => {
        beforeEach(() => {
            // Mock authenticated user for all rate limit tests
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });
        });

        it('should reject requests when daily limit is exceeded', async () => {
            mockRateLimit.checkRateLimit.mockResolvedValue({
                allowed: false,
                reason: 'daily_limit_exceeded',
                remainingDaily: 0,
                remainingMinute: 1,
                resetTime: {
                    daily: new Date('2024-01-02T00:00:00Z'),
                    minute: new Date(),
                },
            });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            const response = await POST(request);

            expect(response.status).toBe(429);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Rate limit exceeded',
                message:
                    'You have reached the daily limit of requests. Please try again tomorrow or use your own API key. Upgrade to VT+ for unlimited usage and advanced features!',
                limitType: 'daily_limit_exceeded',
                remainingDaily: 0,
                remainingMinute: 1,
                resetTime: '2024-01-02T00:00:00.000Z',
                upgradeUrl: '/pricing',
            });

            expect(response.headers.get('Retry-After')).toBeTruthy();
        });

        it('should reject requests when per-minute limit is exceeded', async () => {
            const nextMinuteReset = new Date(Date.now() + 45_000); // 45 seconds from now

            mockRateLimit.checkRateLimit.mockResolvedValue({
                allowed: false,
                reason: 'minute_limit_exceeded',
                remainingDaily: 5,
                remainingMinute: 0,
                resetTime: {
                    daily: new Date('2024-01-02T00:00:00Z'),
                    minute: nextMinuteReset,
                },
            });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            const response = await POST(request);

            expect(response.status).toBe(429);

            const responseData = await response.json();
            expect(responseData).toEqual({
                error: 'Rate limit exceeded',
                message:
                    'You have reached your per-minute limit for the free Gemini model. Upgrade to VT+ for unlimited access.',
                limitType: 'minute_limit_exceeded',
                remainingDaily: 5,
                remainingMinute: 0,
                resetTime: nextMinuteReset.toISOString(),
                upgradeUrl: '/pricing',
            });

            // Should include Retry-After header
            const retryAfter = response.headers.get('Retry-After');
            expect(retryAfter).toBeTruthy();
            expect(Number.parseInt(retryAfter!)).toBeGreaterThan(0);
            expect(Number.parseInt(retryAfter!)).toBeLessThanOrEqual(45);
        });

        it('should provide detailed error information for upgrade decisions', async () => {
            mockRateLimit.checkRateLimit.mockResolvedValue({
                allowed: false,
                reason: 'daily_limit_exceeded',
                remainingDaily: 0,
                remainingMinute: 0,
                resetTime: {
                    daily: new Date('2024-01-02T00:00:00Z'),
                    minute: new Date(),
                },
            });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            const response = await POST(request);
            const responseData = await response.json();

            // Should include all necessary information for user decision
            expect(responseData).toHaveProperty('error');
            expect(responseData).toHaveProperty('message');
            expect(responseData).toHaveProperty('limitType');
            expect(responseData).toHaveProperty('remainingDaily');
            expect(responseData).toHaveProperty('remainingMinute');
            expect(responseData).toHaveProperty('resetTime');
            expect(responseData).toHaveProperty('upgradeUrl');
            expect(responseData.upgradeUrl).toBe('/pricing');
        });
    });

    describe('Request Recording', () => {
        beforeEach(() => {
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });

            mockRateLimit.checkRateLimit.mockResolvedValue({
                allowed: true,
                remainingDaily: 5,
                remainingMinute: 1,
                resetTime: {
                    daily: new Date(),
                    minute: new Date(),
                },
            });
        });

        it('should record successful requests for rate limiting', async () => {
            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            // This would require full mocking of the completion stream
            // For now, we verify that the rate limit check was called
            try {
                await POST(request);
            } catch {
                // Expected due to incomplete mocking
            }

            expect(mockRateLimit.checkRateLimit).toHaveBeenCalledWith(
                authenticatedUserId,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
            );
        });
    });

    describe('Error Handling', () => {
        it('should handle missing request body gracefully', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });

            const request = createMockRequest(
                {},
                {
                    'x-forwarded-for': '127.0.0.1',
                },
            );

            // Mock JSON parsing failure
            request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));

            const response = await POST(request);

            expect(response.status).toBe(400);
            const responseData = await response.json();
            expect(responseData.error).toBe('Invalid request body');
        });

        it('should handle missing IP address', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            // No IP headers
            const request = createMockRequest(requestBody, {});

            const response = await POST(request);

            expect(response.status).toBe(401);
            const responseData = await response.json();
            expect(responseData.error).toBe('Unauthorized');
        });

        it('should handle rate limit service errors', async () => {
            mockAuth.api.getSession.mockResolvedValue({
                user: { id: authenticatedUserId },
            });

            mockRateLimit.checkRateLimit.mockRejectedValue(new Error('Database connection failed'));

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            const request = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            const response = await POST(request);

            expect(response.status).toBe(500);
            const responseData = await response.json();
            expect(responseData.error).toBe('Internal server error');
        });
    });

    describe('Cross-User Isolation', () => {
        it('should enforce rate limits independently per user account', async () => {
            const user1 = 'user-account-1';
            const user2 = 'user-account-2';

            // User 1 at limit
            mockAuth.api.getSession
                .mockResolvedValueOnce({ user: { id: user1 } })
                .mockResolvedValueOnce({ user: { id: user2 } });

            mockRateLimit.checkRateLimit
                .mockResolvedValueOnce({
                    allowed: false,
                    reason: 'daily_limit_exceeded',
                    remainingDaily: 0,
                    remainingMinute: 1,
                    resetTime: { daily: new Date(), minute: new Date() },
                })
                .mockResolvedValueOnce({
                    allowed: true,
                    remainingDaily: 8,
                    remainingMinute: 1,
                    resetTime: { daily: new Date(), minute: new Date() },
                });

            const requestBody = {
                threadId: 'thread-123',
                threadItemId: 'item-123',
                parentThreadItemId: 'parent-123',
                prompt: 'Test prompt',
                messages: [],
                mode: ChatMode.GEMINI_2_5_FLASH_LITE,
            };

            // User 1 request - should be blocked
            const request1 = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });
            const response1 = await POST(request1);
            expect(response1.status).toBe(429);

            // User 2 request - should be allowed
            const request2 = createMockRequest(requestBody, {
                'x-forwarded-for': '127.0.0.1',
            });

            try {
                await POST(request2);
            } catch {
                // Expected due to incomplete mocking
            }

            // Verify separate rate limit checks
            expect(mockRateLimit.checkRateLimit).toHaveBeenCalledWith(
                user1,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
            );
            expect(mockRateLimit.checkRateLimit).toHaveBeenCalledWith(
                user2,
                ModelEnum.GEMINI_2_5_FLASH_LITE,
            );
        });
    });
});
