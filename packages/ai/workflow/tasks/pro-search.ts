import { createTask } from '@repo/orchestrator';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError } from '../utils';

export const proSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'pro-search',
    execute: async () => {
        throw new Error('Pro search is no longer supported. Please use Web Search with Gemini models instead.');
    },
    onError: handleError,
    route: () => 'completion',
});
