import { beforeEach, describe, expect, it } from 'vitest';
import {
    handleIncompleteTable,
    normalizeContent,
    removeIncompleteTags,
    renderCircuitBreaker,
} from '../markdown-content';

describe('MarkdownContent utilities', () => {
    describe('handleIncompleteTable', () => {
        it('should handle complete table markdown', () => {
            const completeTable = `
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
`;
            const result = handleIncompleteTable(completeTable);
            expect(result).toBe(completeTable);
        });

        it('should pass through table content for markdown parser to handle', () => {
            const incompleteTable = `
Some text before
| Name | Age | City |
Some text after
`;
            const result = handleIncompleteTable(incompleteTable);
            // New behavior: let markdown parser handle it
            expect(result).toBe(incompleteTable);
        });

        it('should pass through table content without strict validation', () => {
            const incompleteTable = `
| Name | Age | City |
| John | 25  | NYC  |
`;
            const result = handleIncompleteTable(incompleteTable);
            // New behavior: let markdown parser handle it
            expect(result).toBe(incompleteTable);
        });

        it('should handle content without tables', () => {
            const noTable = 'This is just regular text with no tables.';
            const result = handleIncompleteTable(noTable);
            expect(result).toBe(noTable);
        });

        it('should handle mixed content with tables', () => {
            const mixedContent = `
# Title

Some paragraph text.

| Name | Age |
| John | 25  |

More text after.
`;
            const result = handleIncompleteTable(mixedContent);
            // New behavior: pass through for markdown parser
            expect(result).toBe(mixedContent);
        });

        it('should preserve complete table with proper separator', () => {
            const completeTable = `
# Data Table

| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |

End of content.
`;
            const result = handleIncompleteTable(completeTable);
            expect(result).toBe(completeTable);
        });

        it('should handle table with different separator styles', () => {
            const tableWithDashes = `
| Name | Age |
|:-----|----:|
| John | 25  |
`;
            const result = handleIncompleteTable(tableWithDashes);
            expect(result).toBe(tableWithDashes);
        });

        it('should pass through single line table content', () => {
            const singleLine = '| Name | Age | City |';
            const result = handleIncompleteTable(singleLine);
            // New behavior: let markdown parser handle it
            expect(result).toBe(singleLine);
        });
    });

    describe('normalizeContent', () => {
        it('should replace literal \\n with actual newlines', () => {
            const content = 'Line 1\\nLine 2\\nLine 3';
            const result = normalizeContent(content);
            expect(result).toBe('Line 1\nLine 2\nLine 3');
        });

        it('should handle content without escaped newlines', () => {
            const content = 'Line 1\nLine 2\nLine 3';
            const result = normalizeContent(content);
            expect(result).toBe(content);
        });
    });

    describe('removeIncompleteTags', () => {
        it('should remove incomplete HTML tags', () => {
            const content = 'Some text <div>complete</div> and incomplete <span';
            const result = removeIncompleteTags(content);
            expect(result).toBe('Some text <div>complete</div> and incomplete ');
        });

        it('should handle content without incomplete tags', () => {
            const content = 'Some text <div>complete</div>';
            const result = removeIncompleteTags(content);
            expect(result).toBe(content);
        });

        it('should handle content without any tags', () => {
            const content = 'Just plain text';
            const result = removeIncompleteTags(content);
            expect(result).toBe(content);
        });
    });

    // Note: Table validation has been simplified to rely on markdown parser
    // The circuit breaker provides sufficient protection against problematic content

    describe('renderCircuitBreaker', () => {
        beforeEach(() => {
            // Reset circuit breaker state before each test
            renderCircuitBreaker.reset('test-content');
        });

        it('should allow initial renders', () => {
            const shouldBlock = renderCircuitBreaker.shouldBlock('test-content');
            expect(shouldBlock).toBe(false);
        });

        it('should block after max renders', () => {
            const contentHash = 'test-content-max';

            // First call should not block
            const firstCall = renderCircuitBreaker.shouldBlock(contentHash);
            expect(firstCall).toBe(false);

            // Add delay to ensure different timestamp
            const now = Date.now();
            while (Date.now() - now < 101) {
                // Wait for 101ms to exceed the 100ms debounce
            }

            // Second call should block (MAX_RENDERS = 1)
            const secondCall = renderCircuitBreaker.shouldBlock(contentHash);
            expect(secondCall).toBe(true);
        });

        it('should reset after timeout', async () => {
            const contentHash = 'test-content-timeout';

            // Trigger some renders
            for (let i = 0; i < 5; i++) {
                renderCircuitBreaker.shouldBlock(contentHash);
            }

            // Reset manually (simulating timeout)
            renderCircuitBreaker.reset(contentHash);

            // Should allow renders again
            const shouldBlock = renderCircuitBreaker.shouldBlock(contentHash);
            expect(shouldBlock).toBe(false);
        });
    });

    describe('handleIncompleteTable with circuit breaker', () => {
        beforeEach(() => {
            renderCircuitBreaker.reset('test');
        });

        it('should convert to code block when circuit breaker triggers', () => {
            const problematicTable =
                '| Project Name | Primary Technology | Description | Key Significance';
            const contentHash = problematicTable.substring(0, 100);

            // First call to trigger circuit breaker
            renderCircuitBreaker.shouldBlock(contentHash);

            // Add delay to ensure different timestamp
            const now = Date.now();
            while (Date.now() - now < 101) {
                // Wait for 101ms to exceed the 100ms debounce
            }

            // Second call should trigger circuit breaker (MAX_RENDERS = 1)
            renderCircuitBreaker.shouldBlock(contentHash);

            const result = handleIncompleteTable(problematicTable);
            expect(result).toContain('```');
            expect(result).toContain(problematicTable);
        });

        it('should pass through malformed table patterns for markdown parser', () => {
            // Reset circuit breaker to ensure clean state
            renderCircuitBreaker.reset(
                '| Project Name | Primary Technology | Description | Key Significance',
            );

            const malformedPatterns = [
                '| Project Name | Primary Technology | Description | Key Significance',
                '| Name | Age |\n| John',
                '| Header |\n| Data | Extra |',
            ];

            for (const pattern of malformedPatterns) {
                // Reset circuit breaker for each pattern
                renderCircuitBreaker.reset(pattern.substring(0, 100));
                const result = handleIncompleteTable(pattern);
                // New behavior: let markdown parser handle it
                expect(result).toBe(pattern);
            }
        });

        it('should ignore content with insufficient pipes', () => {
            const nonTablePatterns = [
                '| Single pipe',
                'Just text with | one pipe',
                'No pipes at all',
            ];

            for (const pattern of nonTablePatterns) {
                const result = handleIncompleteTable(pattern);
                // Content without enough pipes should be left unchanged
                expect(result).toBe(pattern);
            }
        });

        it('should preserve valid table structures', () => {
            const validPatterns = [
                '| A | B |\n|---|---|',
                '| Name | Age |\n|-----|-----|\n| John | 25 |',
            ];

            for (const pattern of validPatterns) {
                const result = handleIncompleteTable(pattern);
                // Valid tables should be preserved
                expect(result).toBe(pattern);
            }
        });
    });
});
