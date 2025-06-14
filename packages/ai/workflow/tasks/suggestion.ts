import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError } from '../utils';

const MAX_ALLOWED_TOKENS = 1000;

const SuggestionSchema = z.object({
    questions: z.array(z.string()).describe('A list of questions to user can ask followup'),
});

export const suggestionsTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'suggestions',
    execute: async ({ events, context, data, signal }) => {
        // Always return empty suggestions - follow-up suggestions are disabled entirely
        events?.update('suggestions', current => []);
        return {
            suggestions: [],
        };
    },
    onError: handleError,
    route: ({ result }) => {
        return 'end';
    },
});
