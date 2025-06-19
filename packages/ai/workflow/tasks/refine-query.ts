import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
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

        const prompt = `You are a professional research assistant tasked with refining user queries for deep research.

                CURRENT DATE: ${getHumanizedDate()}

                Analyze the user's question to determine if it needs clarification before research.

                For well-formed queries:
                - Return needsClarification: false
                - Provide a refinedQuery that enhances the original

                For queries needing improvement:
                - Return needsClarification: true
                - Provide reasoning explaining why
                - Include clarifying questions with 2-3 options
                - The choiceType should be single or multiple based on the question

                If the user has already responded to previous clarifying questions:
                - Return needsClarification: false
                - Provide a refinedQuery incorporating their response

                If the user has not responded to clarifying questions:
                - Return needsClarification: false
                - Use the original query

                `;

        const byokKeys = context?.get('apiKeys');

        // Select an appropriate model based on available API keys
        const selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_FLASH_PREVIEW, byokKeys);

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
        if (result?.needsClarification) {
            return 'end';
        }

        return 'planner';
    },
});
