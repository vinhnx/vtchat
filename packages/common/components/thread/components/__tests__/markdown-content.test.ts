import { describe, expect, it } from "vitest";
import { handleIncompleteTable, normalizeContent, removeIncompleteTags } from "../markdown-content";

describe("MarkdownContent utilities", () => {
    describe("handleIncompleteTable", () => {
        it("should handle complete table markdown", () => {
            const completeTable = `
| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
`;
            const result = handleIncompleteTable(completeTable);
            expect(result).toBe(completeTable);
        });

        it("should remove incomplete table with only header", () => {
            const incompleteTable = `
Some text before
| Name | Age | City |
Some text after
`;
            const result = handleIncompleteTable(incompleteTable);
            expect(result).toBe(`
Some text before
Some text after
`);
        });

        it("should remove incomplete table with header but no separator", () => {
            const incompleteTable = `
| Name | Age | City |
| John | 25  | NYC  |
`;
            const result = handleIncompleteTable(incompleteTable);
            expect(result).toBe("");
        });

        it("should handle content without tables", () => {
            const noTable = "This is just regular text with no tables.";
            const result = handleIncompleteTable(noTable);
            expect(result).toBe(noTable);
        });

        it("should handle mixed content with incomplete table", () => {
            const mixedContent = `
# Title

Some paragraph text.

| Name | Age |
| John | 25  |

More text after.
`;
            const result = handleIncompleteTable(mixedContent);
            expect(result).toBe(`
# Title

Some paragraph text.


More text after.
`);
        });

        it("should preserve complete table with proper separator", () => {
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

        it("should handle table with different separator styles", () => {
            const tableWithDashes = `
| Name | Age |
|:-----|----:|
| John | 25  |
`;
            const result = handleIncompleteTable(tableWithDashes);
            expect(result).toBe(tableWithDashes);
        });

        it("should remove single line table", () => {
            const singleLine = "| Name | Age | City |";
            const result = handleIncompleteTable(singleLine);
            expect(result).toBe("");
        });
    });

    describe("normalizeContent", () => {
        it("should replace literal \\n with actual newlines", () => {
            const content = "Line 1\\nLine 2\\nLine 3";
            const result = normalizeContent(content);
            expect(result).toBe("Line 1\nLine 2\nLine 3");
        });

        it("should handle content without escaped newlines", () => {
            const content = "Line 1\nLine 2\nLine 3";
            const result = normalizeContent(content);
            expect(result).toBe(content);
        });
    });

    describe("removeIncompleteTags", () => {
        it("should remove incomplete HTML tags", () => {
            const content = "Some text <div>complete</div> and incomplete <span";
            const result = removeIncompleteTags(content);
            expect(result).toBe("Some text <div>complete</div> and incomplete ");
        });

        it("should handle content without incomplete tags", () => {
            const content = "Some text <div>complete</div>";
            const result = removeIncompleteTags(content);
            expect(result).toBe(content);
        });

        it("should handle content without any tags", () => {
            const content = "Just plain text";
            const result = removeIncompleteTags(content);
            expect(result).toBe(content);
        });
    });
});
