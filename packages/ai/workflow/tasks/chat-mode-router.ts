import {
    getModelFromChatMode,
    supportsNativeWebSearch,
    supportsOpenAIWebSearch,
    trimMessageHistoryEstimated,
} from '@repo/ai/models';
import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { handleError, sendEvents } from '../utils';

/**
 * Check if a query should skip web search regardless of user toggle
 * These are queries that can be answered without external information
 */
function shouldSkipWebSearch(question: string): boolean {
    const query = question.toLowerCase().trim();

    // Identity and capability questions
    const identityPatterns = [
        /^(who are you|what are you|tell me about yourself|describe yourself)[?.]?$/,
        /^(what can you do|what are your capabilities|what's your purpose)[?.]?$/,
        /^(how can you help|what can you help with|how do you work)[?.]?$/,
        /^(introduce yourself|can you introduce yourself)[?.]?$/,
        /^(are you|can you|do you)\s+(ai|artificial|intelligence|chatbot|bot|assistant)[?.]?$/,
        /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)[!?.]?$/,
    ];

    // Mathematical/computational queries that don't need web search
    const mathPatterns = [
        /^(calculate|compute|solve|what is|what's)\s*[\d+\-*/.()%\s]+[?.]?$/,
        /^\d+\s*[+\-*/.%]\s*\d+.*[?.]?$/,
        /^(square root|sqrt|factorial|sum|add|subtract|multiply|divide)/,
        /^\d+\s*(plus|minus|times|divided by)\s*\d+/,
        /^what.*(is|equals?)\s*\d+.*[\d+\-*/.%()]/,
        /^(percentage|percent)\s+of\s+\d+/, // "percentage of 100" but not "percentage of US population"
    ];

    // Programming and general knowledge that doesn't need current info
    const generalPatterns = [
        /^(explain|define|what is|what's|describe)\s+(programming|coding|javascript|python|react|css|html|algorithm|function|variable|array|object)/,
        /^(how to|how do i|how can i)\s+(code|program|write|create|implement|build)\s+(a|an|the)?\s*(function|component|class|algorithm)/,
        /^(what is the difference between|compare|difference between)\s+\w+\s+(and|vs|versus)\s+\w+/,
        /^(help|assist|support)\s*(me)?\s*(with)?\s*(coding|programming|development)/,
    ];

    // Simple conversational queries (narrow patterns to avoid false positives)
    const conversationalPatterns = [
        /^(yes|no|okay|ok|sure|alright|fine)[!?.]?$/,
        /^(sorry|excuse me|pardon)/,
        /^(thank you|thanks|bye|goodbye|see you|farewell)[!?.]?$/,
    ];

    return [
        ...identityPatterns,
        ...mathPatterns,
        ...generalPatterns,
        ...conversationalPatterns,
    ].some((pattern) => pattern.test(query));
}

export const modeRoutingTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'router',
    execute: async ({ events, context, redirectTo }) => {
        const mode = context?.get('mode') || ChatMode.GEMINI_2_5_FLASH_LITE;
        const { updateStatus } = sendEvents(events);

        const messageHistory = context?.get('messages') || [];
        const trimmedMessageHistory = trimMessageHistoryEstimated(messageHistory, mode);
        context?.set('messages', trimmedMessageHistory.trimmedMessages ?? []);

        if (!trimmedMessageHistory?.trimmedMessages) {
            throw new Error('Maximum message history reached');
        }

        updateStatus('PENDING');

        const webSearch = context?.get('webSearch');
        const question = context?.get('question') || '';
        const model = getModelFromChatMode(mode);

        // Intelligent query classification - skip web search for certain queries
        const shouldSkip = shouldSkipWebSearch(question);

        if (mode === ChatMode.Deep) {
            redirectTo('refine-query');
        } else if (mode === ChatMode.Pro && webSearch && !shouldSkip) {
            // Pro Search mode with web search enabled - but skip for simple queries
            redirectTo('gemini-web-search');
        } else if (webSearch === true && !shouldSkip) {
            // Only trigger web search when explicitly enabled AND query needs external info
            // Support web search for both Gemini and OpenAI models
            if (supportsNativeWebSearch(model)) {
                redirectTo('planner');
            } else if (supportsOpenAIWebSearch(model)) {
                // For OpenAI models with web search, use completion with OpenAI web search tools
                redirectTo('completion');
            } else {
                // For non-supported models with web search, redirect to completion with a note
                redirectTo('completion');
            }
        } else {
            redirectTo('completion');
        }
    },
    onError: handleError,
});
