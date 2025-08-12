import { describe, expect, it } from 'vitest';
import {
    FORMATTING_GUIDELINES,
    getFormattingInstructions,
    isLikelyTableGeneration,
    suggestAlternativeFormatting,
} from '../config/formatting-guidelines';
import { checkContentForIssues, ContentMonitor } from '../utils/content-monitor';

describe('Formatting Guidelines', () => {
    it('should provide different instructions for different task types', () => {
        const writerInstructions = getFormattingInstructions('writer');
        const analysisInstructions = getFormattingInstructions('analysis');
        const searchInstructions = getFormattingInstructions('search');

        expect(writerInstructions).toContain('NEVER create large markdown tables');
        expect(analysisInstructions).toContain('NARRATIVE ANALYSIS');
        expect(searchInstructions).toContain('PRIORITIZE diverse markdown content');
    });

    it('should detect table generation patterns', () => {
        const tableContent = `
| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Data 1   | Data 2   | Data 3   | Data 4   |
| Data 5   | Data 6   | Data 7   | Data 8   |
| Data 9   | Data 10  | Data 11  | Data 12  |
| Data 13  | Data 14  | Data 15  | Data 16  |
| Data 17  | Data 18  | Data 19  | Data 20  |
        `;

        expect(isLikelyTableGeneration(tableContent)).toBe(true);
    });

    it('should not flag normal content as table generation', () => {
        const normalContent = `
# Heading

This is a normal paragraph with some **bold text** and *italic text*.

- Bullet point 1
- Bullet point 2
- Bullet point 3

Another paragraph with some data: Revenue increased **42%** to $2.1B.
        `;

        expect(isLikelyTableGeneration(normalContent)).toBe(false);
    });

    it('should suggest alternatives for table-heavy content', () => {
        const tableContent = `
| A | B | C | D |
|---|---|---|---|
| 1 | 2 | 3 | 4 |
| 5 | 6 | 7 | 8 |
        `;

        const result = suggestAlternativeFormatting(tableContent);
        expect(result).toContain('alternative formats');
    });
});

describe('Content Monitor', () => {
    it('should detect when content is stuck on table generation', () => {
        const monitor = new ContentMonitor();
        const tableContent = `
| Col1 | Col2 | Col3 | Col4 | Col5 |
|------|------|------|------|------|
| Data | Data | Data | Data | Data |
| Data | Data | Data | Data | Data |
| Data | Data | Data | Data | Data |
| Data | Data | Data | Data | Data |
| Data | Data | Data | Data | Data |
| Data | Data | Data | Data | Data |
        `;

        const result = monitor.checkContent(tableContent);
        expect(result.isStuck).toBe(true);
        expect(result.issue).toContain('table generation');
    });

    it('should not flag normal content as stuck', () => {
        const monitor = new ContentMonitor();
        const normalContent = 'This is normal content with some **bold** text and bullet points.';

        const result = monitor.checkContent(normalContent);
        expect(result.isStuck).toBe(false);
    });

    it('should provide helpful suggestions for problematic content', () => {
        const result = checkContentForIssues(`
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 |
| 7 | 8 | 9 | 10| 11| 12|
        `);

        expect(result.needsIntervention).toBe(true);
        expect(result.suggestions).toContain(
            'Replace large tables with bullet points or inline formatting',
        );
    });
});

describe('Table Limits', () => {
    it('should define reasonable table limits', () => {
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.MAX_COLUMNS).toBe(3);
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.MAX_ROWS).toBe(5);
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.PREFERRED_ALTERNATIVES).toHaveLength(5);
    });
});
