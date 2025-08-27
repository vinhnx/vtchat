import { createTask } from '@repo/orchestrator';
import { log } from '@repo/shared/logger';
import { z } from 'zod';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError } from '../utils';

const _MAX_ALLOWED_TOKENS = 1000;

const _SuggestionSchema = z.object({
    questions: z.array(z.string()).describe('A list of questions to user can ask followup'),
});

export const suggestionsTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'suggestions',
    execute: async ({ events, context }) => {
        log.info('🎯 Suggestions task executing:', {
            threadId: context?.get('threadId'),
            threadItemId: context?.get('threadItemId'),
            showSuggestions: context?.get('showSuggestions'),
            hasAnswer: !!context?.get('answer'),
        });

        // Always return empty suggestions - follow-up suggestions are disabled entirely
        events?.update('suggestions', (_current) => []);

        log.info('📤 Suggestions event emitted, routing to end');

        return {
            suggestions: [],
        };
    },
    onError: handleError,
    route: () => {
        log.info('🔄 Suggestions task routing to: end');
        return 'end';
    },
});
