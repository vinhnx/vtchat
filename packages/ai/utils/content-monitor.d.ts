/**
 * Content Monitoring Utilities
 *
 * Utilities to detect and prevent AI agents from getting stuck
 * on table generation or other problematic content patterns.
 */
export interface ContentMonitorOptions {
    maxTableIndicators?: number;
    maxRepetitivePatterns?: number;
    checkInterval?: number;
    onStuckDetected?: (content: string, issue: string) => void;
}
export declare class ContentMonitor {
    private options;
    private contentHistory;
    private lastCheckTime;
    constructor(options?: ContentMonitorOptions);
    /**
     * Check if content shows signs of being stuck on table generation
     */
    checkContent(content: string): {
        isStuck: boolean;
        issue?: string;
        suggestion?: string;
    };
    /**
     * Detect repetitive patterns in content
     */
    private detectRepetitivePatterns;
    /**
     * Check if content generation has stalled
     */
    private isContentStalled;
    /**
     * Calculate similarity between two strings
     */
    private calculateSimilarity;
    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance;
    /**
     * Reset the monitor state
     */
    reset(): void;
}
/**
 * Quick utility to check if content needs formatting intervention
 */
export declare function checkContentForIssues(content: string): {
    needsIntervention: boolean;
    suggestions: string[];
};
//# sourceMappingURL=content-monitor.d.ts.map