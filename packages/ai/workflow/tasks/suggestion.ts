import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError } from '../utils';

const _MAX_ALLOWED_TOKENS = 1000;

const _SuggestionSchema = z.object({
    questions: z.array(z.string()).describe('A list of questions to user can ask followup'),
});

export const suggestionsTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'suggestions',
    execute: async ({ events }) => {
        // Always return empty suggestions - follow-up suggestions are disabled entirely
        events?.update('suggestions', (_current) => []);
        return {
            suggestions: [],
        };
    },
    onError: handleError,
    route: () => {
        return 'end';
    },
});
