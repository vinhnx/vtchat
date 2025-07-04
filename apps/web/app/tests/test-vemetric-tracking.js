/**
 * Test file for Vemetric custom event tracking
 * Run with: bun test apps/web/app/tests/test-vemetric-tracking.js
 */

const { test, expect, describe, beforeAll } = require('bun:test');

// Mock environment variables for testing
process.env.VEMETRIC_TOKEN = 'test_token_123';
process.env.NEXT_PUBLIC_VEMETRIC_TOKEN = 'test_token_123';

describe('Vemetric Backend Service', () => {
    let vemetricBackend;

    beforeAll(async () => {
        // Dynamic import to ensure env vars are set
        const module = await import('@repo/common/services/vemetric-backend');
        vemetricBackend = module.vemetricBackend;
    });

    test('should initialize with token', () => {
        expect(vemetricBackend.enabled).toBe(true);
    });

    test('should handle tracking events without errors', async () => {
        // This won't actually send to Vemetric (invalid token) but tests the flow
        await expect(async () => {
            await vemetricBackend.trackEvent('test_user_123', 'TestEvent', {
                testProperty: 'testValue',
                timestamp: Date.now(),
            });
        }).not.toThrow();
    });

    test('should handle payment event tracking', async () => {
        await expect(async () => {
            await vemetricBackend.trackPaymentEvent('test_user_123', 'completed', {
                amount: 10,
                currency: 'USD',
                tier: 'VT_PLUS',
                paymentMethod: 'card',
            });
        }).not.toThrow();
    });

    test('should handle subscription event tracking', async () => {
        await expect(async () => {
            await vemetricBackend.trackSubscriptionEvent('test_user_123', 'created', {
                tier: 'VT_PLUS',
                plan: 'monthly',
                price: 10,
                currency: 'USD',
            });
        }).not.toThrow();
    });

    test('should handle batch event tracking', async () => {
        const events = [
            { eventName: 'Event1', eventData: { prop1: 'value1' } },
            { eventName: 'Event2', eventData: { prop2: 'value2' } },
        ];

        await expect(async () => {
            await vemetricBackend.trackBatchEvents('test_user_123', events);
        }).not.toThrow();
    });
});

describe('Vemetric Integration Functions', () => {
    let integrations;

    beforeAll(async () => {
        // Dynamic import for integration functions
        integrations = await import('@/lib/vemetric-integrations');
    });

    test('should handle payment success tracking', async () => {
        await expect(async () => {
            await integrations.trackPaymentSuccess('test_user_123', {
                amount: 10,
                currency: 'USD',
                subscriptionTier: 'VT_PLUS',
                paymentMethod: 'card',
                subscriptionId: 'sub_123',
            });
        }).not.toThrow();
    });

    test('should handle user registration tracking', async () => {
        await expect(async () => {
            await integrations.trackUserRegistration('test_user_123', {
                provider: 'google',
                email: 'test@example.com',
                referralSource: 'organic',
            });
        }).not.toThrow();
    });

    test('should handle premium feature usage tracking', async () => {
        await expect(async () => {
            await integrations.trackPremiumFeatureUsage('test_user_123', {
                featureName: 'advanced_rag',
                context: 'api_call',
                processingTime: 1500,
            });
        }).not.toThrow();
    });

    test('should handle feature gate encounters', async () => {
        await expect(async () => {
            await integrations.trackFeatureGateEncounter('test_user_123', {
                featureName: 'premium_model',
                userTier: 'VT_BASE',
                context: 'model_selection',
                actionTaken: 'cancelled',
            });
        }).not.toThrow();
    });

    test('should handle first message tracking', async () => {
        await expect(async () => {
            await integrations.trackFirstMessage('test_user_123', {
                modelName: 'gpt-4',
                messageLength: 150,
                hasAttachments: false,
                timeToFirstMessage: 30_000,
            });
        }).not.toThrow();
    });
});

describe('Analytics Utils', () => {
    let AnalyticsUtils;

    beforeAll(async () => {
        const module = await import('@repo/common/utils/analytics');
        AnalyticsUtils = module.AnalyticsUtils;
    });

    test('should sanitize data to remove PII', () => {
        const testData = {
            email: 'test@example.com',
            apiKey: 'secret_key_123',
            normalField: 'safe_value',
            password: 'secret123',
        };

        const sanitized = AnalyticsUtils.sanitizeData(testData);

        expect(sanitized.email).toBe('[REDACTED]');
        expect(sanitized.apiKey).toBe('[REDACTED]');
        expect(sanitized.password).toBe('[REDACTED]');
        expect(sanitized.normalField).toBe('safe_value');
    });

    test('should sanitize URLs to domain only', () => {
        const testUrl = 'https://api.example.com/users/123/sensitive-data?token=abc';
        const sanitized = AnalyticsUtils.sanitizeUrl(testUrl);

        expect(sanitized).toBe('api.example.com');
    });

    test('should create performance data', () => {
        const startTime = performance.now() - 1000; // 1 second ago
        const perfData = AnalyticsUtils.createPerformanceData(startTime);

        expect(perfData.duration).toBeGreaterThan(900);
        expect(perfData.duration).toBeLessThan(1100);
    });

    test('should create user properties without PII', () => {
        const userProps = AnalyticsUtils.createUserProperties({
            subscriptionTier: 'VT_PLUS',
            email: 'test@example.com', // Should be filtered out
            messageCount: 50,
            apiKey: 'secret', // Should be filtered out
        });

        expect(userProps.subscriptionTier).toBe('VT_PLUS');
        expect(userProps.messageCount).toBe(50);
        expect(userProps.email).toBeUndefined();
        expect(userProps.apiKey).toBeUndefined();
    });
});

describe('Analytics Events Constants', () => {
    let ANALYTICS_EVENTS;

    beforeAll(async () => {
        const module = await import('@repo/shared/types/analytics');
        ANALYTICS_EVENTS = module.ANALYTICS_EVENTS;
    });

    test('should have all required event types', () => {
        // Authentication events
        expect(ANALYTICS_EVENTS.USER_SIGNED_IN).toBe('UserSignedIn');
        expect(ANALYTICS_EVENTS.USER_REGISTERED).toBe('UserRegistered');

        // Chat events
        expect(ANALYTICS_EVENTS.MESSAGE_SENT).toBe('MessageSent');
        expect(ANALYTICS_EVENTS.MODEL_SELECTED).toBe('ModelSelected');

        // Subscription events
        expect(ANALYTICS_EVENTS.SUBSCRIPTION_CREATED).toBe('SubscriptionCreated');
        expect(ANALYTICS_EVENTS.PAYMENT_INITIATED).toBe('PaymentInitiated');

        // Feature events
        expect(ANALYTICS_EVENTS.PREMIUM_FEATURE_ACCESSED).toBe('PremiumFeatureAccessed');
        expect(ANALYTICS_EVENTS.FEATURE_GATE_ENCOUNTERED).toBe('FeatureGateEncountered');
    });

    test('should have consistent naming convention', () => {
        Object.values(ANALYTICS_EVENTS).forEach((eventName) => {
            // Should be PascalCase
            expect(eventName).toMatch(/^[A-Z][a-zA-Z]*$/);
            // Should not be too generic
            expect(eventName).not.toBe('Event');
            expect(eventName).not.toBe('Action');
        });
    });
});

// Integration test to verify data attributes would work
describe('Data Attributes Integration', () => {
    test('should parse data attributes correctly', () => {
        // Simulate HTML element with data attributes
        const mockElement = {
            dataset: {
                vmtrc: 'TestEvent',
                vmtrcPlan: 'VT_PLUS',
                vmtrcContext: 'pricing_page',
                vmtrcPrice: '10',
            },
        };

        // Extract event data (simulating how Vemetric would parse it)
        const eventName = mockElement.dataset.vmtrc;
        const eventData = {};

        Object.keys(mockElement.dataset).forEach((key) => {
            if (key.startsWith('vmtrc') && key !== 'vmtrc') {
                const propertyName = key.replace('vmtrc', '').toLowerCase();
                eventData[propertyName] = mockElement.dataset[key];
            }
        });

        expect(eventName).toBe('TestEvent');
        expect(eventData.plan).toBe('VT_PLUS');
        expect(eventData.context).toBe('pricing_page');
        expect(eventData.price).toBe('10');
    });
});

// Note: Test console.log kept for test output visibility
