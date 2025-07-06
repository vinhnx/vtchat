import { createTask } from '@repo/orchestrator';
import { log } from '@repo/shared/logger';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { TOOL_REGISTRY, type ToolTier, hasToolAccess } from '../tool-registry';
import { getEmbedding, cosine, getToolEmbedding } from '../utils/embeddings';
import { handleError } from '../utils';

// Configurable similarity threshold for tool selection
const SIMILARITY_THRESHOLD = 0.38;

// Quick heuristic patterns for fast routing
const QUICK_PATTERNS = {
    calculator: /\d+[\s]*[+\-*/÷×%^]\s*\d+|calculate|solve|equation|math|arithmetic|\d+\s*%/i,
    webSearch: /search|find|look up|latest|current|news|today|recent|what's happening/i,
    charts: /chart|graph|visualize|plot|diagram|bar chart|line graph|pie chart/i,
    documentProcessing:
        /upload|pdf|document|file|contract|resume|analyze.*document|parse.*file|summarize.*document/i,
    structuredOutput:
        /extract.*structured|extract.*json|structured.*data|key.*value|table.*data|invoice.*fields/i,
    visionAnalysis:
        /image|photo|picture|diagram|screenshot|analyze.*image|describe.*photo|what.*in.*picture/i,
};

interface ToolScore {
    id: string;
    name: string;
    score: number;
    tier: ToolTier;
}

interface RouterResult {
    selectedTools: string[];
    scores: ToolScore[];
    reasoning: string;
    usedQuickMatch: boolean;
    timestamp: number;
}

export const semanticToolRouterTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'semantic-tool-router',
    execute: async ({ context, events }) => {
        log.info('🧠 Semantic router task started'); // Debug logging

        // Check if semantic routing is disabled via environment variable
        const isSemanticRoutingEnabled = process.env.SEMANTIC_ROUTING_ENABLED !== 'false';
        if (!isSemanticRoutingEnabled) {
            log.info('Semantic routing is disabled via SEMANTIC_ROUTING_ENABLED=false');
            context.set('semanticRouter', {
                selectedTools: [],
                scores: [],
                reasoning: 'Semantic routing disabled via environment variable',
                usedQuickMatch: false,
                timestamp: Date.now(),
            });
            return;
        }

        const question = context.get('question') ?? '';
        if (!question.trim()) {
            log.debug('No question provided, skipping semantic tool routing');
            return;
        }

        const userTier = (context.get('userTier') ?? 'FREE') as ToolTier;
        const apiKeys = context.get('apiKeys');

        log.info(
            {
                questionLength: question.length,
                userTier,
                question: question.substring(0, 100), // Log first 100 chars for debugging
                hasChartAccess: hasToolAccess('charts', userTier),
            },
            'Starting semantic tool routing'
        );

        try {
            // Step 1: Try quick heuristic patterns first
            const quickMatch = tryQuickMatch(question, userTier, context);
            if (quickMatch.matched) {
                log.info(
                    {
                        tools: quickMatch.tools,
                        pattern: quickMatch.pattern,
                    },
                    'Quick pattern match found'
                );

                const result: RouterResult = {
                    selectedTools: quickMatch.tools,
                    scores: quickMatch.tools.map((toolId) => ({
                        id: toolId,
                        name: TOOL_REGISTRY.find((t) => t.id === toolId)?.name ?? toolId,
                        score: 1.0, // Quick matches get max score
                        tier: TOOL_REGISTRY.find((t) => t.id === toolId)?.tier ?? 'FREE',
                    })),
                    reasoning: `Quick pattern match: ${quickMatch.pattern}`,
                    usedQuickMatch: true,
                    timestamp: Date.now(),
                };

                context.set('semanticRouter', result);
                events?.update?.('toolRouter', {
                    selected: quickMatch.tools,
                    reasoning: result.reasoning,
                });
                return;
            }

            // Step 2: Semantic similarity analysis
            const routerResult = await performSemanticRouting(question, userTier, apiKeys, context);

            // Step 3: Save results to context
            context.set('semanticRouter', routerResult);

            // Step 4: Update events for UI
            events?.update?.('toolRouter', {
                selected: routerResult.selectedTools,
                reasoning: routerResult.reasoning,
                scores: routerResult.scores,
            });

            // Router summary for debugging
            log.info(
                {
                    selectedTools: routerResult.selectedTools,
                    userTier,
                    reasoning: routerResult.reasoning,
                    usedQuickMatch: routerResult.usedQuickMatch,
                },
                '🎯 Router decision summary'
            );

            // Step 5: Emit debug event for development
            if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
                window.dispatchEvent(
                    new CustomEvent('semantic-router-result', {
                        detail: routerResult,
                    })
                );
            }

            log.info(
                {
                    selectedTools: routerResult.selectedTools,
                    topScore: routerResult.scores[0]?.score,
                    reasoning: routerResult.reasoning,
                },
                'Semantic tool routing completed'
            );
        } catch (error) {
            log.error(
                { error, question: question.substring(0, 100) },
                'Semantic tool routing failed'
            );

            // Don't fail the workflow, just continue without tool routing
            context.set('semanticRouter', {
                selectedTools: [],
                scores: [],
                reasoning: 'Semantic routing failed, using default behavior',
                usedQuickMatch: false,
                timestamp: Date.now(),
            });
        }
    },
    route: () => 'router',
    onError: handleError,
});

/**
 * Try quick heuristic pattern matching before semantic analysis
 */
function tryQuickMatch(
    question: string,
    userTier: ToolTier,
    context: any
): { matched: boolean; tools: string[]; pattern?: string } {
    const tools: string[] = [];
    const matchedPatterns: string[] = [];

    // Check for calculator patterns
    if (QUICK_PATTERNS.calculator.test(question)) {
        if (hasToolAccess('calculator', userTier) && !context.get('mathCalculator')) {
            tools.push('calculator');
            matchedPatterns.push('math/calculation pattern');
        }
    }

    // Check for web search patterns
    if (QUICK_PATTERNS.webSearch.test(question)) {
        if (hasToolAccess('web-search', userTier) && !context.get('webSearch')) {
            tools.push('web-search');
            matchedPatterns.push('web search pattern');
        }
    }

    // Check for chart patterns
    if (QUICK_PATTERNS.charts.test(question)) {
        log.info(
            {
                question: question.substring(0, 100),
                userTier,
                hasAccess: hasToolAccess('charts', userTier),
                alreadyEnabled: context.get('charts'),
            },
            '📊 Chart pattern matched'
        );

        if (hasToolAccess('charts', userTier) && !context.get('charts')) {
            tools.push('charts');
            matchedPatterns.push('visualization pattern');
        }
    }

    // Check for document processing patterns
    if (QUICK_PATTERNS.documentProcessing.test(question)) {
        if (hasToolAccess('document-processing', userTier) && !context.get('documentProcessing')) {
            tools.push('document-processing');
            matchedPatterns.push('document processing pattern');
        }
    }

    // Check for structured output patterns
    if (QUICK_PATTERNS.structuredOutput.test(question)) {
        if (hasToolAccess('structured-output', userTier) && !context.get('structuredOutput')) {
            tools.push('structured-output');
            matchedPatterns.push('structured extraction pattern');
        }
    }

    // Check for vision analysis patterns
    if (QUICK_PATTERNS.visionAnalysis.test(question)) {
        if (hasToolAccess('vision-analysis', userTier) && !context.get('visionAnalysis')) {
            tools.push('vision-analysis');
            matchedPatterns.push('image analysis pattern');
        }
    }

    // Activate selected tools
    if (tools.length > 0) {
        for (const toolId of tools) {
            const tool = TOOL_REGISTRY.find((t) => t.id === toolId);
            if (tool) {
                tool.activate(context);
            }
        }
    }

    return {
        matched: tools.length > 0,
        tools,
        pattern: matchedPatterns.join(', '),
    };
}

/**
 * Perform semantic similarity-based tool routing
 */
async function performSemanticRouting(
    question: string,
    userTier: ToolTier,
    apiKeys: Record<string, string> | undefined,
    context: any
): Promise<RouterResult> {
    // Generate question embedding
    const questionEmbedding = await getEmbedding(question, apiKeys);

    // Calculate similarities for each available tool
    const scores: ToolScore[] = [];

    for (const tool of TOOL_REGISTRY) {
        // Skip tools not available to user tier
        if (!hasToolAccess(tool.id, userTier)) {
            continue;
        }

        // Skip tools already enabled by manual toggle
        const isAlreadyEnabled =
            (tool.id === 'web-search' && context.get('webSearch')) ||
            (tool.id === 'calculator' && context.get('mathCalculator')) ||
            (tool.id === 'charts' && context.get('charts')) ||
            (tool.id === 'document-processing' && context.get('documentProcessing')) ||
            (tool.id === 'structured-output' && context.get('structuredOutput')) ||
            (tool.id === 'vision-analysis' && context.get('visionAnalysis'));

        if (isAlreadyEnabled) {
            continue;
        }

        // Get pre-computed tool embedding and calculate similarity
        const toolText = [tool.description, ...tool.keywords, ...tool.examples].join(' ');
        const toolEmbedding = await getToolEmbedding(tool.id, toolText, apiKeys);
        const similarity = cosine(questionEmbedding, toolEmbedding);

        scores.push({
            id: tool.id,
            name: tool.name,
            score: similarity,
            tier: tool.tier,
        });
    }

    // Sort by score (highest first)
    scores.sort((a, b) => b.score - a.score);

    // Select tools above threshold
    const selectedTools: string[] = [];
    let reasoning = '';

    for (const { id, name, score } of scores) {
        if (score >= SIMILARITY_THRESHOLD) {
            const tool = TOOL_REGISTRY.find((t) => t.id === id);
            if (tool) {
                tool.activate(context);
                selectedTools.push(id);
                reasoning += `${name} (${(score * 100).toFixed(1)}%); `;
            }
        }
    }

    if (selectedTools.length === 0) {
        reasoning = `No tools exceeded ${(SIMILARITY_THRESHOLD * 100).toFixed(1)}% similarity threshold`;
    } else {
        reasoning = `Selected based on semantic similarity: ${reasoning.slice(0, -2)}`;
    }

    return {
        selectedTools,
        scores,
        reasoning,
        usedQuickMatch: false,
        timestamp: Date.now(),
    };
}
