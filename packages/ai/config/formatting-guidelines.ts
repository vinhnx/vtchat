/**
 * Formatting Guidelines for AI Workflows
 *
 * This file contains centralized formatting instructions to prevent
 * AI agents from getting stuck on table generation and encourage
 * diverse markdown content.
 */

export const FORMATTING_GUIDELINES = {
    // Anti-table instructions to prevent rendering issues
    ANTI_TABLE_INSTRUCTIONS: `
## CRITICAL FORMATTING GUIDELINES:
- **NEVER create large markdown tables** (more than 3 columns or 5 rows)
- **AVOID getting stuck on table formatting** - if you start a table, complete it quickly with minimal rows
- **PREFER narrative flow** over tabular data presentation
- **Use varied markdown elements**: headings, lists, quotes, emphasis, code blocks
- **Keep tables simple**: Maximum 3 columns, 5 rows, essential data only
- **If data seems table-worthy**, present it as formatted lists or embedded statistics instead

**REMEMBER: Prioritize readable, flowing content over complex formatting. Avoid large tables that can cause rendering issues.**`,

    // Diverse content formatting options
    CONTENT_VARIETY_INSTRUCTIONS: `
**PRIORITIZE diverse markdown content**: Use bullet points, numbered lists, blockquotes, and inline formatting over tables
- Use bold text for key points and **emphasis on important concepts**
- **AVOID large markdown tables** - instead use:
  * Bullet points with key statistics: "• Revenue increased **42%** to $2.1B"
  * Inline comparisons: "Company A achieved **15% growth** while Company B saw **8% decline**"
  * Structured lists for comparative data
  * Short summary paragraphs with embedded statistics
- **Only use simple 2-3 column tables** for essential comparisons when absolutely necessary
- **Break up content** with subheadings, quotes, and varied formatting to maintain engagement`,

    // Analysis-specific guidelines
    ANALYSIS_GUIDELINES: `
**FOCUS ON NARRATIVE ANALYSIS**: Emphasize insights, patterns, and connections rather than tabular data organization
- **AVOID TABLE-HEAVY ANALYSIS**: Present findings as flowing text with embedded key points and statistics
- **PRIORITIZE READABILITY**: Use bullet points, emphasis, and clear paragraph structure over complex formatting`,

    // Research writing guidelines
    RESEARCH_WRITING_GUIDELINES: `
Focus on providing substantive analysis rather than cataloging facts. Emphasize implications and significance rather than merely summarizing information.

**Content Structure Preferences:**
1. **Narrative Flow**: Use continuous paragraphs with logical progression
2. **Embedded Statistics**: Integrate data points within sentences rather than tables
3. **Bullet Points**: For listing key findings or recommendations
4. **Blockquotes**: For highlighting important quotes or insights
5. **Subheadings**: To break up content and improve readability
6. **Emphasis**: Bold text for critical points and key terms`,

    // Emergency table limits
    TABLE_LIMITS: {
        MAX_COLUMNS: 3,
        MAX_ROWS: 5,
        PREFERRED_ALTERNATIVES: [
            'Bullet points with embedded data',
            'Inline comparisons within paragraphs',
            'Structured lists with key-value pairs',
            'Summary paragraphs with highlighted statistics',
            'Blockquotes for important data points',
        ],
    },
};

/**
 * Get formatting instructions for a specific workflow task
 */
export function getFormattingInstructions(
    taskType: 'writer' | 'analysis' | 'search' | 'general',
): string {
    const base = FORMATTING_GUIDELINES.ANTI_TABLE_INSTRUCTIONS;

    switch (taskType) {
        case 'writer':
            return base + '\n\n' + FORMATTING_GUIDELINES.RESEARCH_WRITING_GUIDELINES;
        case 'analysis':
            return base + '\n\n' + FORMATTING_GUIDELINES.ANALYSIS_GUIDELINES;
        case 'search':
            return FORMATTING_GUIDELINES.CONTENT_VARIETY_INSTRUCTIONS;
        default:
            return base;
    }
}

/**
 * Check if content might be getting stuck on table generation
 */
export function isLikelyTableGeneration(content: string): boolean {
    const tableIndicators = [
        /\|.*\|.*\|/g, // Table pipe characters
        /^\s*\|/gm, // Lines starting with pipes
        /-{2,}\|/g, // Table separators
    ];

    let tableMatches = 0;
    for (const indicator of tableIndicators) {
        const matches = content.match(indicator);
        if (matches) {
            tableMatches += matches.length;
        }
    }

    // If we detect more than 10 table-like patterns, it might be stuck
    return tableMatches > 10;
}

/**
 * Suggest alternative formatting for table-heavy content
 */
export function suggestAlternativeFormatting(content: string): string {
    if (!isLikelyTableGeneration(content)) {
        return content;
    }

    return (
        content
        + '\n\n'
        + `
**Note**: Consider presenting this data using alternative formats:
- Bullet points with key statistics
- Inline comparisons within paragraphs
- Structured lists with key findings
- Summary paragraphs with embedded data points
`
    );
}
