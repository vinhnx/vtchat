/**
 * Creem.io Webhook Integration Tests
 * Tests webhook endpoint compliance with Creem.io requirements
 */

import crypto from 'node:crypto';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

// Mock the database and other dependencies
vi.mock('@/lib/database', () => ({
    db: {
        transaction: vi.fn(),
        select: vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{
                        id: 'user_123',
                        email: 'test@example.com'
                    }])
                })
            })
        }),
        update: vi.fn().mockReturnValue({
            set: vi.fn().mockReturnValue({
                where: vi.fn().mockResolvedValue([])
            })
        }),
        insert: vi.fn().mockReturnValue({
            values: vi.fn().mockResolvedValue([])
        })
    }
}));

vi.mock('@/lib/subscription-cache', () => ({
    invalidateSubscriptionCache: vi.fn()
}));

vi.mock('@/lib/subscription-session-cache', () => ({
    invalidateSessionSubscriptionCache: vi.fn()
}));

vi.mock('@repo/shared/logger', () => ({
    log: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn()
    }
}));

// Import after mocking
const { POST } = await import('../api/webhook/creem/route');

// Helper to create a test webhook request
function createWebhookRequest(
    eventType: string,
    payload: any,
    secret?: string
): Request {
    const body = JSON.stringify(payload);
    const headers = new Headers({
        'content-type': 'application/json',
        'user-agent': 'Creem-Webhooks/1.0',
    });

    // Add signature if secret provided
    if (secret) {
        const signature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');
        headers.set('creem-signature', signature);
    }

    return new Request('https://example.com/api/webhook/creem', {
        method: 'POST',
        headers,
        body,
    });
}

// Sample webhook payloads for testing
const sampleEvents = {
    checkoutCompleted: {
        id: 'evt_checkout_123',
        eventType: 'checkout.completed',
        created_at: 1234567890,
        object: {
            id: 'checkout_123',
            status: 'completed',
            customer: {
                id: 'cus_123',
                email: 'test@example.com',
            },
            product: {
                id: 'prod_123',
                name: 'VT+ Monthly',
                description: 'VT+ subscription',
            },
            order: {
                id: 'order_123',
                amount: 1500,
                currency: 'USD',
                status: 'completed',
            },
            subscription: {
                id: 'sub_123',
                status: 'active',
            },
            metadata: {
                packageId: 'vt_plus',
            },
        },
    },
    subscriptionExpired: {
        id: 'evt_expired_123',
        eventType: 'subscription.expired',
        created_at: 1234567890,
        object: {
            id: 'sub_123',
            status: 'expired',
            customer: {
                id: 'cus_123',
                email: 'test@example.com',
            },
            product: {
                id: 'prod_123',
                name: 'VT+ Monthly',
            },
            current_period_start_date: '2024-01-01T00:00:00Z',
            current_period_end_date: '2024-01-31T23:59:59Z',
            metadata: {},
        },
    },
    subscriptionActive: {
        id: 'evt_active_123',
        eventType: 'subscription.active',
        created_at: 1234567890,
        object: {
            id: 'sub_123',
            status: 'active',
            customer: {
                id: 'cus_123',
                email: 'test@example.com',
            },
            product: {
                id: 'prod_123',
                name: 'VT+ Monthly',
            },
            current_period_start_date: '2024-01-01T00:00:00Z',
            current_period_end_date: '2024-02-01T00:00:00Z',
            metadata: {},
        },
    },
};

describe('Creem.io Webhook Integration', () => {
    // Set environment to development for testing
    const originalEnv = process.env.NODE_ENV;
    
    beforeEach(() => {
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalEnv;
    });

    it('should handle checkout.completed event successfully', async () => {
        const request = createWebhookRequest(
            'checkout.completed',
            sampleEvents.checkoutCompleted
        );

        const response = await POST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.received).toBe(true);
        expect(result.processed).toBe(true);
    });

    it('should handle subscription.expired event successfully', async () => {
        const request = createWebhookRequest(
            'subscription.expired',
            sampleEvents.subscriptionExpired
        );

        const response = await POST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.received).toBe(true);
        expect(result.processed).toBe(true);
    });

    it('should handle subscription.active event successfully', async () => {
        const request = createWebhookRequest(
            'subscription.active',
            sampleEvents.subscriptionActive
        );

        const response = await POST(request);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.received).toBe(true);
        expect(result.processed).toBe(true);
    });

    it('should return 400 for invalid JSON payload', async () => {
        const request = new Request('https://example.com/api/webhook/creem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: 'invalid json{',
        });

        const response = await POST(request);
        
        expect(response.status).toBe(400);
    });

    it('should return 400 for invalid webhook schema', async () => {
        const invalidPayload = {
            invalidField: 'test',
            missing: 'required fields',
        };

        const request = createWebhookRequest('invalid', invalidPayload);
        const response = await POST(request);

        expect(response.status).toBe(400);
    });

    it('should handle unknown event types gracefully', async () => {
        const unknownEvent = {
            id: 'evt_unknown_123',
            eventType: 'unknown.event',
            created_at: 1234567890,
            object: {
                id: 'obj_123',
                status: 'unknown',
            },
        };

        const request = createWebhookRequest('unknown.event', unknownEvent);
        const response = await POST(request);

        // Should still return 200 to prevent retries
        expect(response.status).toBe(200);
    });

    it('should verify webhook signature in production mode', async () => {
        // Temporarily set to production mode
        process.env.NODE_ENV = 'production';
        process.env.CREEM_WEBHOOK_SECRET = 'test_secret_123';

        const request = createWebhookRequest(
            'subscription.active',
            sampleEvents.subscriptionActive,
            'test_secret_123'
        );

        const response = await POST(request);
        
        expect(response.status).toBe(200);

        // Clean up
        delete process.env.CREEM_WEBHOOK_SECRET;
    });

    it('should reject invalid signature in production mode', async () => {
        // Temporarily set to production mode
        process.env.NODE_ENV = 'production';
        process.env.CREEM_WEBHOOK_SECRET = 'test_secret_123';

        const request = createWebhookRequest(
            'subscription.active',
            sampleEvents.subscriptionActive,
            'wrong_secret'
        );

        const response = await POST(request);
        
        expect(response.status).toBe(401);

        // Clean up
        delete process.env.CREEM_WEBHOOK_SECRET;
    });

    it('should require signature header in production mode', async () => {
        // Temporarily set to production mode
        process.env.NODE_ENV = 'production';
        process.env.CREEM_WEBHOOK_SECRET = 'test_secret_123';

        const request = createWebhookRequest(
            'subscription.active',
            sampleEvents.subscriptionActive
            // No signature provided
        );

        const response = await POST(request);
        
        expect(response.status).toBe(401);

        // Clean up
        delete process.env.CREEM_WEBHOOK_SECRET;
    });
});

describe('Creem.io Webhook Retry Mechanism Compliance', () => {
    it('should return proper HTTP codes for retry logic', async () => {
        // Test various error scenarios and their HTTP codes
        
        // 400 errors should NOT be retried by Creem
        const invalidRequest = new Request('https://example.com/api/webhook/creem', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: 'invalid json',
        });

        const response400 = await POST(invalidRequest);
        expect(response400.status).toBe(400);

        // 200 success should stop retries
        const validRequest = createWebhookRequest(
            'subscription.active',
            sampleEvents.subscriptionActive
        );

        const response200 = await POST(validRequest);
        expect(response200.status).toBe(200);
    });

    it('should handle all supported webhook events', async () => {
        const eventTypes = [
            'checkout.completed',
            'subscription.active',
            'subscription.paid',
            'subscription.canceled',
            'subscription.expired',
            'subscription.update',
            'subscription.trialing',
        ];

        for (const eventType of eventTypes) {
            const payload = {
                id: `evt_${eventType}_123`,
                eventType,
                created_at: 1234567890,
                object: {
                    id: 'obj_123',
                    status: 'active',
                    customer: {
                        id: 'cus_123',
                        email: 'test@example.com',
                    },
                    product: {
                        id: 'prod_123',
                        name: 'Test Product',
                    },
                    current_period_start_date: '2024-01-01T00:00:00Z',
                    current_period_end_date: '2024-02-01T00:00:00Z',
                },
            };

            const request = createWebhookRequest(eventType, payload);
            const response = await POST(request);

            expect(response.status).toBe(200);
        }
    });
});
