import { createTask } from '@repo/orchestrator';
import { getVTPlusFeatureFromChatMode } from '@repo/shared/utils/access-control';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    generateObject,
    getHumanizedDate,
    handleError,
    selectAvailableModel,
    sendEvents,
} from '../utils';

export const reflectorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'reflector',
    execute: async ({ data, events, context, signal, redirectTo }) => {
        const question = context?.get('question') || '';
        const messages = context?.get('messages') || [];
        const prevQueries = context?.get('queries') || [];
        const stepId = data?.stepId;
        const prevSummaries = context?.get('summaries') || [];
        const currentYear = new Date().getFullYear();
        const { updateStep } = sendEvents(events);

        const prompt = `
You are a research progress evaluator analyzing how effectively a research question has been addressed. Your primary responsibility is to identify remaining knowledge gaps and determine if additional targeted queries are necessary.

## Current Research State

Research Question: "${question}"

Previous Search Queries:
${prevQueries?.join('\n')}

Research Findings So Far:
${prevSummaries?.join('\n---\n')}

Current date: ${getHumanizedDate()}

## Evaluation Framework

1. Comprehensively assess how well the current findings answer the original research question
2. Identify specific information gaps that prevent fully answering the research question
3. Determine if these gaps warrant additional queries or if the question has been sufficiently addressed

## Query Generation Rules

- DO NOT suggest queries similar to previous ones - review each previous query carefully
- DO NOT broaden the scope beyond the original research question
- DO NOT suggest queries that would likely yield redundant information
- ONLY suggest queries that address identified information gaps
- Each query must explore a distinct aspect not covered by previous searches
- Limit to 1-2 highly targeted queries maximum
- Format queries as direct search terms, NOT as questions
- DO NOT start queries with "how", "what", "when", "where", "why", or "who"
- Use concise keyword phrases instead of full sentences
- Maximum 8 words per query

## Examples of Bad Queries:
- "How long does a Tesla Model 3 battery last?"
- "What are the economic impacts of climate change?"
- "When should I use async await in JavaScript?"
- "Why is remote work increasing productivity?"

## Examples of When to Return Null for Queries:
- When all aspects of the research question have been comprehensively addressed
- When additional queries would only yield redundant information
- When the search has reached diminishing returns with sufficient information gathered
- When all reasonable angles of the question have been explored
- When the findings provide a complete answer despite minor details missing

**Important**:
- Use current date and time for the queries unless speciffically asked for a different time period

## Output Format
{
  "reasoning": "Your analysis of current research progress, specifically identifying what aspects of the question remain unanswered and why additional queries would provide valuable new information (or why the research is complete).",
  "queries": ["direct search term 1", "direct search term 2"] // Return null if research is sufficient or if no non-redundant queries can be formulated
}

## Example Outputs

### When Additional Queries Are Needed:

{
  "reasoning": "The current findings provide substantial information about Tesla Model 3 performance metrics and owner satisfaction, but lack specific data on battery degradation rates over time. This gap is critical as battery longevity directly impacts the vehicle's long-term value proposition and maintenance costs.",
  "queries": ["tesla model 3 battery degradation rates ${currentYear}"]
}


### When Research Is Complete:
{
  "reasoning": "The research question 'What are the benefits of intermittent fasting?' has been comprehensively addressed. The findings cover metabolic effects, weight management outcomes, cellular repair mechanisms, and potential risks for different populations. Additional research angles would likely yield redundant information or explore tangential topics beyond the scope of the original question.",
  "queries": null
}

**CRITICAL: Your primary goal is to avoid redundancy. If you cannot identify genuinely new angles to explore that would yield different information, return null for queries.**
`;

        const byokKeys = context?.get('apiKeys');

        // Select an appropriate model based on available API keys
        const selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_FLASH, byokKeys);

        // Determine VT+ feature based on mode
        const chatMode = context?.get('mode');
        const vtplusFeature = getVTPlusFeatureFromChatMode(chatMode);

        const object = await generateObject({
            prompt,
            model: selectedModel,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()).nullish(),
            }),
            byokKeys,
            messages: messages as any,
            signal,
            thinkingMode: context?.get('thinkingMode'),
            userTier: context?.get('userTier'),
            userId: context?.get('userId'),
            feature: vtplusFeature || undefined,
        });

        const newStepId = stepId + 1;

        context?.update('queries', (current) => [...(current ?? []), ...(object?.queries ?? [])]);

        if (object?.reasoning) {
            updateStep({
                stepId: newStepId,
                stepStatus: 'PENDING',
                text: object?.reasoning,
                subSteps: {
                    search: { status: 'COMPLETED', data: object?.queries },
                },
            });
        }

        if (!(object?.queries?.length && object?.reasoning)) {
            redirectTo('analysis');
        }

        return {
            queries: object?.queries,
            stepId: newStepId,
        };
    },
    onError: handleError,
    route: ({ result }) => {
        if (result?.queries?.filter(Boolean)?.length > 0) {
            return 'gemini-web-search';
        }

        return 'analysis';
    },
});
