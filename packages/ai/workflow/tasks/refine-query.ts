import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { log } from '@repo/shared/logger';
import {
    generateObject,
    getHumanizedDate,
    handleError,
    selectAvailableModel,
    sendEvents,
} from '../utils';

const ClarificationResponseSchema = z.object({
    needsClarification: z.boolean(),
    reasoning: z.string().optional(),
    clarifyingQuestion: z
        .object({
            question: z.string(),
            choiceType: z.enum(['multiple', 'single']),
            options: z.array(z.string()).min(1).max(3),
        })
        .optional(),
    refinedQuery: z.string().optional(),
});

export const refineQueryTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'refine-query',
    execute: async ({ events, context, data, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const { updateStatus, updateAnswer, updateObject } = sendEvents(events);

        const prompt = `You are a professional research assistant for DEEP RESEARCH - a comprehensive, multi-step analysis workflow.

                CURRENT DATE: ${getHumanizedDate()}

                CONTEXT: You are the first stage of Deep Research, which differs from Pro Search:
                
                **Deep Research Workflow**: refine-query → planner → web-search → analysis → writer
                - For complex topics requiring comprehensive analysis
                - Multi-angle investigation with strategic planning
                - Synthesis of findings into detailed reports
                - Examples: "impact of AI on future employment", "comprehensive analysis of renewable energy adoption"
                
                **Pro Search** (not your workflow): direct web-search
                - For quick factual lookups and current information
                - Examples: "current Bitcoin price", "weather in Tokyo today"

                Your task: Determine if the query needs clarification before proceeding with Deep Research.

                BIAS: Most queries suitable for Deep Research are ready to proceed. Only ask for clarification if truly ambiguous.

                For well-formed queries (DEFAULT - 90% of cases):
                - Return needsClarification: false
                - Provide a refinedQuery optimized for comprehensive research
                - Enhance scope, specificity, and research angles

                For ambiguous queries (RARE - only when truly unclear):
                - Return needsClarification: true
                - Provide reasoning explaining the ambiguity
                - Include clarifying questions with 2-3 specific options
                - The choiceType should be single or multiple based on the question

                Examples of Deep Research queries that DON'T need clarification:
                - "impact of remote work on urban planning and city development"
                - "comprehensive analysis of CRISPR gene editing ethical implications"
                - "economic and social effects of cryptocurrency adoption in developing countries"
                - "climate change mitigation strategies and their effectiveness"
                - "AI safety research progress and remaining challenges"
                - "renewable energy transition challenges in Europe"

                Examples that DO need clarification (extremely vague):
                - "help me with my project"
                - "research something interesting"
                - "what should I write about?"
                - "tell me about technology"

                Query Enhancement Guidelines:
                - Add temporal context when relevant (e.g., "recent developments", "2024 trends")
                - Specify research angles (economic, social, technical, ethical impacts)
                - Include scope indicators (global, regional, industry-specific)
                - Suggest comparative elements when appropriate

                If the user has already responded to previous clarifying questions:
                - Return needsClarification: false
                - Provide a refinedQuery incorporating their response

                `;

        const byokKeys = context?.get('apiKeys');

        // Select an appropriate model based on available API keys
        const selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_PRO, byokKeys);

        const object = await generateObject({
            prompt,
            model: selectedModel,
            schema: ClarificationResponseSchema,
            messages: messages as any,
            signal,
            byokKeys,
            thinkingMode: context?.get('thinkingMode'),
        });

        if (object?.needsClarification) {
            updateAnswer({
                text: object.reasoning,
                finalText: object.reasoning,
                status: 'COMPLETED',
            });
            object?.clarifyingQuestion &&
                updateObject({
                    clarifyingQuestion: object?.clarifyingQuestion,
                });

            updateStatus('COMPLETED');
        } else {
            context?.update('question', current => object?.refinedQuery || question);
        }

        return {
            needsClarification: object?.needsClarification,
            refinedQuery: object?.refinedQuery || question,
        };
    },
    onError: handleError,
    route: ({ result }) => {
        log.info('🔍 refine-query route result:', { data: result });
        if (result?.needsClarification === true) {
            return 'end';
        }

        return 'planner';
    },
});