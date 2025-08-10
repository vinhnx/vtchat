/**
 * Formatting Guidelines for AI Workflows
 *
 * This file contains centralized formatting instructions to prevent
 * AI agents from getting stuck on table generation and encourage
 * diverse markdown content.
 */
export declare const FORMATTING_GUIDELINES: {
    ANTI_TABLE_INSTRUCTIONS: string;
    CONTENT_VARIETY_INSTRUCTIONS: string;
    ANALYSIS_GUIDELINES: string;
    RESEARCH_WRITING_GUIDELINES: string;
    TABLE_LIMITS: {
        MAX_COLUMNS: number;
        MAX_ROWS: number;
        PREFERRED_ALTERNATIVES: string[];
    };
};
/**
 * Get formatting instructions for a specific workflow task
 */
export declare function getFormattingInstructions(taskType: "writer" | "analysis" | "search" | "general"): string;
/**
 * Check if content might be getting stuck on table generation
 */
export declare function isLikelyTableGeneration(content: string): boolean;
/**
 * Suggest alternative formatting for table-heavy content
 */
export declare function suggestAlternativeFormatting(content: string): string;
//# sourceMappingURL=formatting-guidelines.d.ts.map