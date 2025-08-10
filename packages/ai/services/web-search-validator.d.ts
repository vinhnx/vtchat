export interface WebSearchValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
    config: {
        hasGeminiKey: boolean;
        hasJinaKey: boolean;
        environment: string;
        isProduction: boolean;
    };
}
/**
 * Validates web search configuration for production environment
 */
export declare function validateWebSearchConfig(): Promise<WebSearchValidationResult>;
/**
 * Quick check if web search is available
 */
export declare function isWebSearchAvailable(): boolean;
/**
 * Get user-friendly error message for web search failures
 */
export declare function getWebSearchErrorMessage(error: Error, userTier: string, hasUserApiKey: boolean): string;
//# sourceMappingURL=web-search-validator.d.ts.map