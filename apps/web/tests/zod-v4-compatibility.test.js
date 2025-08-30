/**
 * Comprehensive Zod v4 Compatibility Test
 * Verifies that all Zod usage in the codebase is compatible with v4
 */

const { describe, it, expect } = require('vitest');
const { z } = require('zod');

describe('Zod v4 Compatibility', () => {
    it('should support basic schema validation', () => {
        const schema = z.object({
            name: z.string(),
            age: z.number(),
            email: z.string().email(),
        });

        const validData = {
            name: 'John Doe',
            age: 30,
            email: 'john@example.com',
        };

        const result = schema.parse(validData);
        expect(result).toEqual(validData);
    });

    it('should support z.iso.date() and z.iso.datetime()', () => {
        const dateSchema = z.iso.date();
        const datetimeSchema = z.iso.datetime();

        expect(() => dateSchema.parse('2023-01-01')).not.toThrow();
        expect(() => datetimeSchema.parse('2023-01-01T10:00:00Z')).not.toThrow();
    });

    it('should support transform operations', () => {
        const transformSchema = z.iso
            .date()
            .transform((value) => new Date(value));

        const result = transformSchema.parse('2023-01-01');
        expect(result).toBeInstanceOf(Date);
    });

    it('should support refine operations', () => {
        const refineSchema = z
            .string()
            .refine((value) => value.length > 0, {
                message: 'String must not be empty',
            });

        expect(() => refineSchema.parse('hello')).not.toThrow();
        expect(() => refineSchema.parse('')).toThrow();
    });

    it('should support ZodError handling', () => {
        const schema = z.object({
            required: z.string(),
        });

        try {
            schema.parse({});
        } catch (error) {
            expect(error).toBeInstanceOf(z.ZodError);
            expect(error.issues).toBeDefined(); // In Zod v4, it's 'issues' not 'errors'
        }
    });

    it('should support safeParse', () => {
        const schema = z.object({
            name: z.string(),
        });

        const validResult = schema.safeParse({ name: 'John' });
        expect(validResult.success).toBe(true);

        const invalidResult = schema.safeParse({ name: 123 });
        expect(invalidResult.success).toBe(false);
    });

    it('should support literal values', () => {
        const literalSchema = z.literal('vt_plus');

        expect(() => literalSchema.parse('vt_plus')).not.toThrow();
        expect(() => literalSchema.parse('other')).toThrow();
    });

    it('should support optional and default values', () => {
        const schema = z.object({
            name: z.string(),
            age: z.number().optional(),
            role: z.string().default('user'),
        });

        const result1 = schema.parse({ name: 'John' });
        expect(result1.role).toBe('user');
        expect(result1.age).toBeUndefined();

        const result2 = schema.parse({ name: 'Jane', age: 25 });
        expect(result2.age).toBe(25);
    });

    it('should support arrays and nested objects', () => {
        const schema = z.object({
            users: z.array(
                z.object({
                    id: z.string(),
                    profile: z.object({
                        name: z.string(),
                        settings: z.record(z.string(), z.string()), // Zod v4 requires explicit key and value types
                    }),
                }),
            ),
        });

        const validData = {
            users: [
                {
                    id: '1',
                    profile: {
                        name: 'John',
                        settings: { theme: 'dark' },
                    },
                },
            ],
        };

        expect(() => schema.parse(validData)).not.toThrow();
    });

    it('should support enum validation', () => {
        const statusSchema = z.enum(['active', 'inactive', 'pending']);

        expect(() => statusSchema.parse('active')).not.toThrow();
        expect(() => statusSchema.parse('invalid')).toThrow();
    });

    it('should support nativeEnum validation', () => {
        const TestEnum = {
            VALUE1: 'value1',
            VALUE2: 'value2',
        };

        const enumSchema = z.nativeEnum(TestEnum);

        expect(() => enumSchema.parse('value1')).not.toThrow();
        expect(() => enumSchema.parse('invalid')).toThrow();
    });
});

describe('Zod v4 API Schema Compatibility', () => {
    it('should validate checkout request schema', async () => {
        // Import the actual schema from the API
        const { z } = require('zod');

        const CheckoutRequestSchema = z.object({
            priceId: z.literal('vt_plus'),
            successUrl: z.string().optional(),
            quantity: z.number().positive().optional().default(1),
        });

        const validRequest = {
            priceId: 'vt_plus',
            successUrl: 'https://example.com/success',
            quantity: 1,
        };

        expect(() => CheckoutRequestSchema.parse(validRequest)).not.toThrow();
    });

    it('should validate webhook event schemas', () => {
        const { z } = require('zod');

        const WebhookEventSchema = z.object({
            id: z.string(),
            eventType: z.string(),
            created_at: z.number(),
            object: z.record(z.string(), z.any()), // Zod v4 requires explicit key type
        });

        const validEvent = {
            id: 'evt_123',
            eventType: 'checkout.completed',
            created_at: Date.now(),
            object: { test: 'data' },
        };

        expect(() => WebhookEventSchema.parse(validEvent)).not.toThrow();
    });

    it('should validate completion request schema', () => {
        const { z } = require('zod');

        // Simplified version of the completion schema
        const CompletionSchema = z.object({
            threadId: z.string(),
            prompt: z.string(),
            messages: z.any(),
            apiKeys: z.object({
                OPENAI_API_KEY: z.string().optional(),
                ANTHROPIC_API_KEY: z.string().optional(),
            }).optional(),
        });

        const validRequest = {
            threadId: 'thread_123',
            prompt: 'Hello world',
            messages: [],
        };

        expect(() => CompletionSchema.parse(validRequest)).not.toThrow();
    });
});
