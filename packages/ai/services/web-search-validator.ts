import { log } from "@repo/shared/lib/logger";

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
export async function validateWebSearchConfig(): Promise<WebSearchValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check environment
    const environment = process.env.NODE_ENV || "development";
    const isProduction = environment === "production";

    // Check API keys
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const hasJinaKey = !!process.env.JINA_API_KEY;

    // Validate Gemini API key
    if (!hasGeminiKey) {
        if (isProduction) {
            errors.push("GEMINI_API_KEY is required for production web search");
            recommendations.push("Set GEMINI_API_KEY environment variable in production");
        } else {
            warnings.push("GEMINI_API_KEY not set - web search will require user API keys");
        }
    } else {
        // Validate key format
        const geminiKey = process.env.GEMINI_API_KEY!;
        if (!geminiKey.startsWith("AIza") || geminiKey.length !== 39) {
            errors.push("GEMINI_API_KEY appears to have invalid format");
            recommendations.push(
                "Verify GEMINI_API_KEY format (should be 39 characters starting with 'AIza')",
            );
        }
    }

    // Check Jina API key (optional but recommended)
    if (!hasJinaKey) {
        warnings.push("JINA_API_KEY not set - may affect web search quality");
        recommendations.push("Consider setting JINA_API_KEY for better web search results");
    }

    // Check budget service availability
    try {
        // Note: Budget service is only available in the web app context
        // This validation runs in the AI package context, so we skip budget checks
        warnings.push("Budget status check skipped - not available in AI package context");
    } catch (error) {
        warnings.push("Could not check budget status");
        log.warn({ error }, "Budget service unavailable during validation");
    }

    // Production-specific checks
    if (isProduction) {
        if (!hasGeminiKey) {
            errors.push("Production environment missing required GEMINI_API_KEY");
        }

        // Check for common production issues
        if (process.env.FLY_APP_NAME && !hasGeminiKey) {
            errors.push("Fly.io deployment missing GEMINI_API_KEY secret");
            recommendations.push("Set GEMINI_API_KEY secret in Fly.io dashboard");
        }

        if (process.env.VERCEL && !hasGeminiKey) {
            errors.push("Vercel deployment missing GEMINI_API_KEY environment variable");
            recommendations.push("Set GEMINI_API_KEY in Vercel project settings");
        }
    }

    const isValid = errors.length === 0;

    const result: WebSearchValidationResult = {
        isValid,
        errors,
        warnings,
        recommendations,
        config: {
            hasGeminiKey,
            hasJinaKey,
            environment,
            isProduction,
        },
    };

    // Log validation results
    if (isValid) {
        log.info(result, "Web search configuration validation passed");
    } else {
        log.error(result, "Web search configuration validation failed");
    }

    return result;
}

/**
 * Quick check if web search is available
 */
export function isWebSearchAvailable(): boolean {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const isProduction = process.env.NODE_ENV === "production";

    // In production, require system API key
    if (isProduction) {
        return hasGeminiKey;
    }

    // In development, web search can work with user API keys
    return true;
}

/**
 * Get user-friendly error message for web search failures
 */
export function getWebSearchErrorMessage(
    error: Error,
    userTier: string,
    hasUserApiKey: boolean,
): string {
    const isVtPlus = userTier === "PLUS";
    const hasSystemKey = !!process.env.GEMINI_API_KEY;

    // API key related errors
    if (error.message.includes("API key") || error.message.includes("unauthorized")) {
        if (isVtPlus && !hasUserApiKey && !hasSystemKey) {
            return "Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.";
        }
        if (!hasUserApiKey && !hasSystemKey) {
            return "Web search requires an API key. Please add your own Gemini API key in settings for unlimited usage.";
        }
        return "Invalid API key. Please check your Gemini API key in settings.";
    }

    // Rate limiting errors
    if (error.message.includes("rate limit") || error.message.includes("429")) {
        if (isVtPlus && !hasUserApiKey) {
            return "Web search rate limit reached. Add your own Gemini API key in settings for unlimited usage.";
        }
        return "Rate limit exceeded. Please try again in a few moments.";
    }

    // Budget errors
    if (error.message.includes("budget") || error.message.includes("quota")) {
        return "Web search is temporarily unavailable due to budget constraints. Please try again later or add your own API key.";
    }

    // Generic error
    return `Web search failed: ${error.message}. Please try again or contact support if the issue persists.`;
}
