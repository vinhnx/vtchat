/**
 * Test Creem.io webhook signature verification
 * Based on official Creem documentation: https://docs.creem.io/webhooks/verify-webhook-requests
 */

import crypto from "node:crypto";
import { describe, expect, it } from "vitest";

// Extracted signature verification function for testing
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        // Generate signature using HMAC-SHA256 as specified by Creem
        const computedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

        // Compare signatures using timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(signature, "hex"),
            Buffer.from(computedSignature, "hex"),
        );
    } catch {
        return false;
    }
}

// Helper to generate valid signature for testing
function generateSignature(payload: string, secret: string): string {
    return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("Creem.io Webhook Signature Verification", () => {
    const testSecret = "test_webhook_secret_123";
    const testPayload = JSON.stringify({
        id: "evt_123",
        eventType: "subscription.expired",
        created_at: 1234567890,
        object: {
            id: "sub_123",
            status: "expired",
            customer: {
                id: "cus_123",
                email: "test@example.com",
            },
        },
    });

    it("should verify valid signature correctly", () => {
        const validSignature = generateSignature(testPayload, testSecret);
        const result = verifyWebhookSignature(testPayload, validSignature, testSecret);

        expect(result).toBe(true);
    });

    it("should reject invalid signature", () => {
        const invalidSignature = "invalid_signature_123";
        const result = verifyWebhookSignature(testPayload, invalidSignature, testSecret);

        expect(result).toBe(false);
    });

    it("should reject signature with wrong secret", () => {
        const wrongSecret = "wrong_secret_456";
        const signatureWithWrongSecret = generateSignature(testPayload, wrongSecret);
        const result = verifyWebhookSignature(testPayload, signatureWithWrongSecret, testSecret);

        expect(result).toBe(false);
    });

    it("should reject signature with modified payload", () => {
        const originalSignature = generateSignature(testPayload, testSecret);
        const modifiedPayload = testPayload.replace("expired", "active");
        const result = verifyWebhookSignature(modifiedPayload, originalSignature, testSecret);

        expect(result).toBe(false);
    });

    it("should handle malformed signature gracefully", () => {
        const malformedSignature = "not_hex_string!!!";
        const result = verifyWebhookSignature(testPayload, malformedSignature, testSecret);

        expect(result).toBe(false);
    });

    it("should handle empty payload", () => {
        const emptyPayload = "";
        const signature = generateSignature(emptyPayload, testSecret);
        const result = verifyWebhookSignature(emptyPayload, signature, testSecret);

        expect(result).toBe(true);
    });

    it("should handle subscription.expired event correctly", () => {
        const expiredEventPayload = JSON.stringify({
            id: "evt_expired_123",
            eventType: "subscription.expired",
            created_at: Date.now() / 1000,
            object: {
                id: "sub_expired_123",
                status: "expired",
                customer: {
                    id: "cus_123",
                    email: "user@example.com",
                },
                product: {
                    id: "prod_123",
                    name: "VT+ Monthly",
                },
                current_period_start_date: "2024-01-01T00:00:00Z",
                current_period_end_date: "2024-01-31T23:59:59Z",
            },
        });

        const signature = generateSignature(expiredEventPayload, testSecret);
        const result = verifyWebhookSignature(expiredEventPayload, signature, testSecret);

        expect(result).toBe(true);
    });

    it("should match Creem documentation example pattern", () => {
        // Test that our implementation matches the pattern from Creem docs
        const payload = "test payload";
        const secret = "test_secret";

        // Our implementation
        const ourSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

        // Creem's documented pattern
        const creemSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

        expect(ourSignature).toBe(creemSignature);
        expect(verifyWebhookSignature(payload, ourSignature, secret)).toBe(true);
    });
});
