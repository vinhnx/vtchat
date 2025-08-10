import { describe, expect, it } from "vitest";
import { FORMATTING_GUIDELINES, getFormattingInstructions, isLikelyTableGeneration, suggestAlternativeFormatting, } from "../config/formatting-guidelines";
import { ContentMonitor, checkContentForIssues } from "../utils/content-monitor";
describe("Formatting Guidelines", function () {
    it("should provide different instructions for different task types", function () {
        var writerInstructions = getFormattingInstructions("writer");
        var analysisInstructions = getFormattingInstructions("analysis");
        var searchInstructions = getFormattingInstructions("search");
        expect(writerInstructions).toContain("NEVER create large markdown tables");
        expect(analysisInstructions).toContain("NARRATIVE ANALYSIS");
        expect(searchInstructions).toContain("PRIORITIZE diverse markdown content");
    });
    it("should detect table generation patterns", function () {
        var tableContent = "\n| Column 1 | Column 2 | Column 3 | Column 4 |\n|----------|----------|----------|----------|\n| Data 1   | Data 2   | Data 3   | Data 4   |\n| Data 5   | Data 6   | Data 7   | Data 8   |\n| Data 9   | Data 10  | Data 11  | Data 12  |\n| Data 13  | Data 14  | Data 15  | Data 16  |\n| Data 17  | Data 18  | Data 19  | Data 20  |\n        ";
        expect(isLikelyTableGeneration(tableContent)).toBe(true);
    });
    it("should not flag normal content as table generation", function () {
        var normalContent = "\n# Heading\n\nThis is a normal paragraph with some **bold text** and *italic text*.\n\n- Bullet point 1\n- Bullet point 2\n- Bullet point 3\n\nAnother paragraph with some data: Revenue increased **42%** to $2.1B.\n        ";
        expect(isLikelyTableGeneration(normalContent)).toBe(false);
    });
    it("should suggest alternatives for table-heavy content", function () {
        var tableContent = "\n| A | B | C | D |\n|---|---|---|---|\n| 1 | 2 | 3 | 4 |\n| 5 | 6 | 7 | 8 |\n        ";
        var result = suggestAlternativeFormatting(tableContent);
        expect(result).toContain("alternative formats");
    });
});
describe("Content Monitor", function () {
    it("should detect when content is stuck on table generation", function () {
        var monitor = new ContentMonitor();
        var tableContent = "\n| Col1 | Col2 | Col3 | Col4 | Col5 |\n|------|------|------|------|------|\n| Data | Data | Data | Data | Data |\n| Data | Data | Data | Data | Data |\n| Data | Data | Data | Data | Data |\n| Data | Data | Data | Data | Data |\n| Data | Data | Data | Data | Data |\n| Data | Data | Data | Data | Data |\n        ";
        var result = monitor.checkContent(tableContent);
        expect(result.isStuck).toBe(true);
        expect(result.issue).toContain("table generation");
    });
    it("should not flag normal content as stuck", function () {
        var monitor = new ContentMonitor();
        var normalContent = "This is normal content with some **bold** text and bullet points.";
        var result = monitor.checkContent(normalContent);
        expect(result.isStuck).toBe(false);
    });
    it("should provide helpful suggestions for problematic content", function () {
        var result = checkContentForIssues("\n| A | B | C | D | E | F |\n|---|---|---|---|---|---|\n| 1 | 2 | 3 | 4 | 5 | 6 |\n| 7 | 8 | 9 | 10| 11| 12|\n        ");
        expect(result.needsIntervention).toBe(true);
        expect(result.suggestions).toContain("Replace large tables with bullet points or inline formatting");
    });
});
describe("Table Limits", function () {
    it("should define reasonable table limits", function () {
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.MAX_COLUMNS).toBe(3);
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.MAX_ROWS).toBe(5);
        expect(FORMATTING_GUIDELINES.TABLE_LIMITS.PREFERRED_ALTERNATIVES).toHaveLength(5);
    });
});
