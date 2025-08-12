import { log } from '@repo/shared/lib/logger';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Check web search configuration
        const webSearchConfig = {
            hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
            geminiKeyLength: process.env.GEMINI_API_KEY?.length || 0,
            geminiKeyPrefix: process.env.GEMINI_API_KEY?.substring(0, 10) || 'none',
            hasJinaApiKey: !!process.env.JINA_API_KEY,
            jinaKeyLength: process.env.JINA_API_KEY?.length || 0,
            environment: process.env.NODE_ENV,
            isProduction: process.env.NODE_ENV === 'production',
            isFlyApp: !!process.env.FLY_APP_NAME,
            isVercel: !!process.env.VERCEL,
        };

        // Check budget status
        let budgetStatus = null;
        try {
            const { shouldDisableGemini } = await import('@/lib/services/budget-monitor');
            budgetStatus = await shouldDisableGemini();
        } catch (error) {
            log.error({ error }, 'Failed to check budget status');
            budgetStatus = { error: 'Failed to check budget' };
        }

        // Test basic web search functionality
        let webSearchTest = null;
        try {
            // Simple test without actually making API calls
            const { geminiWebSearchTask } = await import(
                '@repo/ai/workflow/tasks/gemini-web-search'
            );
            webSearchTest = {
                taskAvailable: !!geminiWebSearchTask,
                status: 'available',
            };
        } catch (error) {
            log.error({ error }, 'Web search task not available');
            webSearchTest = {
                taskAvailable: false,
                error: error.message,
                status: 'unavailable',
            };
        }

        return NextResponse.json(
            {
                status: 'ok',
                timestamp: new Date().toISOString(),
                service: 'web-search-debug',
                webSearchConfig,
                budgetStatus,
                webSearchTest,
                recommendations: generateRecommendations(webSearchConfig, budgetStatus),
            },
            { status: 200 },
        );
    } catch (error) {
        log.error({ error }, 'Error in web search debug endpoint');
        return NextResponse.json(
            {
                status: 'error',
                timestamp: new Date().toISOString(),
                error: error.message,
            },
            { status: 500 },
        );
    }
}

function generateRecommendations(config: any, budgetStatus: any) {
    const recommendations = [];

    if (!config.hasGeminiApiKey) {
        recommendations.push({
            type: 'critical',
            message: 'GEMINI_API_KEY environment variable is not set',
            action: 'Set GEMINI_API_KEY in production environment',
        });
    }

    if (config.geminiKeyLength > 0 && config.geminiKeyLength !== 39) {
        recommendations.push({
            type: 'warning',
            message: 'GEMINI_API_KEY appears to have incorrect length',
            action: "Verify GEMINI_API_KEY format (should be 39 characters starting with 'AIza')",
        });
    }

    if (!config.hasJinaApiKey) {
        recommendations.push({
            type: 'warning',
            message: 'JINA_API_KEY is not set (may affect web search quality)',
            action: 'Consider setting JINA_API_KEY for better web search results',
        });
    }

    if (budgetStatus?.shouldDisable) {
        recommendations.push({
            type: 'critical',
            message: 'Budget limits exceeded - Gemini models disabled',
            action: 'Check budget settings or wait for next billing cycle',
        });
    }

    if (config.isProduction && !config.hasGeminiApiKey) {
        recommendations.push({
            type: 'critical',
            message: 'Production environment missing required API keys',
            action: 'Configure all required API keys in production environment',
        });
    }

    return recommendations;
}
