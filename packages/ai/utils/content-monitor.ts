/**
 * Content Monitoring Utilities
 *
 * Utilities to detect and prevent AI agents from getting stuck
 * on table generation or other problematic content patterns.
 */

import { log } from "@repo/shared/logger";
import { isLikelyTableGeneration } from "../config/formatting-guidelines";

export interface ContentMonitorOptions {
    maxTableIndicators?: number;
    maxRepetitivePatterns?: number;
    checkInterval?: number;
    onStuckDetected?: (content: string, issue: string) => void;
}

export class ContentMonitor {
    private options: Required<ContentMonitorOptions>;
    private contentHistory: string[] = [];
    private lastCheckTime = 0;

    constructor(options: ContentMonitorOptions = {}) {
        this.options = {
            maxTableIndicators: 15,
            maxRepetitivePatterns: 5,
            checkInterval: 1000, // 1 second
            onStuckDetected: (content, issue) => {
                log.warn("Content generation issue detected", {
                    issue,
                    contentLength: content.length,
                });
            },
            ...options,
        };
    }

    /**
     * Check if content shows signs of being stuck on table generation
     */
    checkContent(content: string): {
        isStuck: boolean;
        issue?: string;
        suggestion?: string;
    } {
        const now = Date.now();

        // Rate limit checks
        if (now - this.lastCheckTime < this.options.checkInterval) {
            return { isStuck: false };
        }
        this.lastCheckTime = now;

        // Check for table generation issues
        if (isLikelyTableGeneration(content)) {
            const issue = "Excessive table generation detected";
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue,
                suggestion:
                    "Consider using bullet points, lists, or inline formatting instead of tables",
            };
        }

        // Check for repetitive patterns
        const repetitivePattern = this.detectRepetitivePatterns(content);
        if (repetitivePattern) {
            const issue = `Repetitive pattern detected: ${repetitivePattern}`;
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue,
                suggestion: "Vary content structure and avoid repetitive formatting",
            };
        }

        // Check for stalled generation (same content repeated)
        if (this.isContentStalled(content)) {
            const issue = "Content generation appears stalled";
            this.options.onStuckDetected(content, issue);
            return {
                isStuck: true,
                issue,
                suggestion: "Try a different approach or simplify the content structure",
            };
        }

        // Store content for history tracking
        this.contentHistory.push(content);
        if (this.contentHistory.length > 10) {
            this.contentHistory.shift();
        }

        return { isStuck: false };
    }

    /**
     * Detect repetitive patterns in content
     */
    private detectRepetitivePatterns(content: string): string | null {
        const patterns = [
            /(\|[^|\n]*){4,}/g, // Repeated table cells
            /(^-\s+.*\n){6,}/gm, // Too many bullet points in a row
            /(#{1,6}\s+.*\n){5,}/gm, // Too many headings in a row
            /(\*\*[^*]*\*\*\s*){8,}/g, // Too many bold items
        ];

        for (const pattern of patterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                return matches[0].substring(0, 50) + "...";
            }
        }

        return null;
    }

    /**
     * Check if content generation has stalled
     */
    private isContentStalled(content: string): boolean {
        if (this.contentHistory.length < 3) {
            return false;
        }

        // Check if the last few content updates are very similar
        const recent = this.contentHistory.slice(-3);
        const similarities = recent.map((prev) => this.calculateSimilarity(prev, content));

        // If content is more than 90% similar to recent versions, it might be stalled
        return similarities.some((similarity) => similarity > 0.9);
    }

    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;

        if (longer.length === 0) {
            return 1.0;
        }

        const editDistance = this.levenshteinDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const matrix = Array(str2.length + 1)
            .fill(null)
            .map(() => Array(str1.length + 1).fill(null));

        for (let i = 0; i <= str1.length; i++) {
            matrix[0][i] = i;
        }

        for (let j = 0; j <= str2.length; j++) {
            matrix[j][0] = j;
        }

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1, // deletion
                    matrix[j - 1][i] + 1, // insertion
                    matrix[j - 1][i - 1] + indicator, // substitution
                );
            }
        }

        return matrix[str2.length][str1.length];
    }

    /**
     * Reset the monitor state
     */
    reset(): void {
        this.contentHistory = [];
        this.lastCheckTime = 0;
    }
}

/**
 * Quick utility to check if content needs formatting intervention
 */
export function checkContentForIssues(content: string): {
    needsIntervention: boolean;
    suggestions: string[];
} {
    const suggestions: string[] = [];
    let needsIntervention = false;

    // Check for table issues
    if (isLikelyTableGeneration(content)) {
        needsIntervention = true;
        suggestions.push("Replace large tables with bullet points or inline formatting");
        suggestions.push("Use structured lists instead of complex tables");
    }

    // Check for excessive formatting
    const boldCount = (content.match(/\*\*[^*]+\*\*/g) || []).length;
    if (boldCount > 20) {
        needsIntervention = true;
        suggestions.push("Reduce excessive bold formatting");
    }

    // Check for too many headings
    const headingCount = (content.match(/^#{1,6}\s+/gm) || []).length;
    if (headingCount > 10) {
        needsIntervention = true;
        suggestions.push("Consolidate content under fewer headings");
    }

    return { needsIntervention, suggestions };
}
