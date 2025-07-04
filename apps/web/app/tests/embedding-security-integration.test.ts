import { eq } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '@/lib/database';
import { embeddings, resources } from '@/lib/database/schema';
import { secureContentForEmbedding } from '@/lib/utils/content-security';

describe('Embedding Security Integration', () => {
    let testResourceId: string;

    afterAll(async () => {
        // Clean up test data
        if (testResourceId) {
            await db.delete(embeddings).where(eq(embeddings.resourceId, testResourceId));
            await db.delete(resources).where(eq(resources.id, testResourceId));
        }
    });

    it('should mask PII when storing embeddings', async () => {
        const testContent = 'Contact me at john.doe@example.com or call (555) 123-4567';
        const securedContent = secureContentForEmbedding(testContent);

        expect(securedContent).toBe('Contact me at [EMAIL_REDACTED] or call [PHONE_REDACTED]');
        expect(securedContent).not.toContain('john.doe@example.com');
        expect(securedContent).not.toContain('(555) 123-4567');
    });

    it('should handle long content by creating hash', async () => {
        const longContent = 'This is a very long document. ' + 'A'.repeat(500);
        const securedContent = secureContentForEmbedding(longContent);

        expect(securedContent).toMatch(/\[HASH:[a-f0-9]{16}\]$/);
        expect(securedContent.length).toBeLessThan(200); // Should be truncated
    });

    it('should preserve short clean content', async () => {
        const cleanContent = 'This is a clean document about programming';
        const securedContent = secureContentForEmbedding(cleanContent);

        expect(securedContent).toBe(cleanContent);
    });

    it('should handle mixed PII content', async () => {
        const mixedContent =
            'My email is john@test.com, phone is 555-123-4567, and my card is 1234 5678 9012 3456';
        const securedContent = secureContentForEmbedding(mixedContent);

        expect(securedContent).toBe(
            'My email is [EMAIL_REDACTED], phone is [PHONE_REDACTED], and my card is [CARD_REDACTED]'
        );
    });
});
