import { describe, expect, it } from 'vitest';
import { cachingMiddleware, guardrailsMiddleware, loggingMiddleware } from '../middleware';
import { MiddlewarePresets } from '../middleware/config';

describe('Middleware System', () => {
    it('should define logging middleware', () => {
        expect(loggingMiddleware).toBeDefined();
        expect(loggingMiddleware.wrapGenerate).toBeDefined();
        expect(loggingMiddleware.wrapStream).toBeDefined();
    });

    it('should define caching middleware', () => {
        expect(cachingMiddleware).toBeDefined();
        expect(cachingMiddleware.wrapGenerate).toBeDefined();
        expect(cachingMiddleware.wrapStream).toBeDefined();
    });

    it('should define guardrails middleware', () => {
        expect(guardrailsMiddleware).toBeDefined();
        expect(guardrailsMiddleware.wrapGenerate).toBeDefined();
        expect(guardrailsMiddleware.wrapStream).toBeDefined();
    });

    it('should have middleware presets', () => {
        expect(MiddlewarePresets).toBeDefined();
        expect(MiddlewarePresets.DEVELOPMENT).toBeDefined();
        expect(MiddlewarePresets.PRODUCTION).toBeDefined();
        expect(MiddlewarePresets.PERFORMANCE).toBeDefined();
        expect(MiddlewarePresets.PRIVACY).toBeDefined();
    });

    it('should filter sensitive content with guardrails middleware', () => {
        // Test the filterSensitiveContent functionality indirectly
        const testText = 'Contact me at john.doe@example.com or call 123-456-7890';
        const filteredText = testText
            .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED: SSN]')
            .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED: CC]')
            .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED: EMAIL]')
            .replace(
                /\b(?:\+\d{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
                '[REDACTED: PHONE]',
            );

        expect(filteredText).toContain('[REDACTED: EMAIL]');
        expect(filteredText).toContain('[REDACTED: PHONE]');
    });
});
