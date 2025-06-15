import { getModelFromChatMode, supportsNativeWebSearch, trimMessageHistoryEstimated } from '@repo/ai/models';
import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError, sendEvents } from '../utils';
export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'router',
    execute: async ({ events, context, redirectTo }) => {
        const mode = context?.get('mode') || ChatMode.GEMINI_2_0_FLASH;
        const { updateStatus } = sendEvents(events);

        const messageHistory = context?.get('messages') || [];
        const trimmedMessageHistory = trimMessageHistoryEstimated(messageHistory, mode);
        context?.set('messages', trimmedMessageHistory.trimmedMessages ?? []);

        if (!trimmedMessageHistory?.trimmedMessages) {
            throw new Error('Maximum message history reached');
        }

        updateStatus('PENDING');

        const webSearch = context?.get('webSearch') || false;
        const model = getModelFromChatMode(mode);

        if (mode === ChatMode.Deep) {
            redirectTo('refine-query');
        } else if (mode === ChatMode.Pro) {
            redirectTo('gemini-web-search');
        } else if (webSearch) {
            // Only support web search for Gemini models to save costs
            if (supportsNativeWebSearch(model)) {
                redirectTo('planner');
            } else {
                // For non-Gemini models with web search, redirect to completion with a note
                redirectTo('completion');
            }
        } else {
            redirectTo('completion');
        }
    },
    onError: handleError,
});
