import {
    createContext,
    createTypedEventEmitter,
    WorkflowBuilder,
    type WorkflowConfig,
} from '@repo/orchestrator';
import type { ChatMode } from '@repo/shared/config';
import { UserTier, type UserTierType } from '@repo/shared/constants/user-tiers';
import { log } from '@repo/shared/logger';
import type { Geo } from '@vercel/functions';
import type { CoreMessage } from 'ai';
import { WorkflowContextSchema, WorkflowEventSchema } from './types'; // Import types from the new dedicated file
// Import tasks individually to avoid potential circular dependency issues during build
import { analysisTask } from './tasks/analysis';
import { completionTask } from './tasks/completion';
import { geminiWebSearchTask } from './tasks/gemini-web-search';
import { modeRoutingTask } from './tasks/chat-mode-router';
import { plannerTask } from './tasks/planner';
import { refineQueryTask } from './tasks/refine-query';
import { reflectorTask } from './tasks/reflector';
import { suggestionsTask } from './tasks/suggestion';
import { writerTask } from './tasks/writer';

export const runWorkflow = ({
    mode,
    question,
    threadId,
    threadItemId,
    messages,
    config = {},
    signal,
    webSearch = false,
    mathCalculator = false,
    charts = false,
    showSuggestions = false,
    onFinish,
    customInstructions,
    gl,
    apiKeys,
    thinkingMode,
    userTier = UserTier.FREE,
    userId,
}: {
    mode: ChatMode;
    question: string;
    threadId: string;
    threadItemId: string;
    messages: CoreMessage[];
    config?: WorkflowConfig;
    signal?: AbortSignal;
    webSearch?: boolean;
    mathCalculator?: boolean;
    charts?: boolean;
    showSuggestions?: boolean;
    onFinish?: (data: any) => void;
    gl?: Geo;
    customInstructions?: string;
    apiKeys?: Record<string, string>;
    thinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    };
    userTier?: UserTierType;
    userId?: string;
}) => {
    log.info('🔥 runWorkflow called with params:', {
        webSearch,
        mathCalculator,
        charts,
    });
    // Set default values for config
    const workflowConfig: WorkflowConfig = {
        maxIterations: 2,
        timeoutMs: 480_000, // Add default timeout of
        ...config,
    };

    // Create typed event emitter with the proper type
    const events = createTypedEventEmitter<WorkflowEventSchema>({
        steps: {},
        toolCalls: [],
        toolResults: [],
        answer: {
            text: '',

            status: 'PENDING',
        },
        sources: [],
        suggestions: [],
        object: {},
        error: {
            error: '',
            status: 'PENDING',
        },
        status: 'PENDING',
    });

    log.info('🌟 Workflow context created with:', {
        webSearch,
        mathCalculator,
        charts,
    });
    const context = createContext<WorkflowContextSchema>({
        question,
        mode,
        webSearch,
        mathCalculator,
        charts, // Charts now available to all users
        search_queries: [],
        messages: messages as any,
        goals: [],
        queries: [],
        steps: [],
        gl,
        customInstructions,
        sources: [],
        summaries: [],
        answer: undefined,
        threadId,
        threadItemId,
        showSuggestions,
        onFinish: onFinish as any,
        apiKeys,
        thinkingMode,
        userTier,
        userId,
    });

    // Use the typed builder
    const builder = new WorkflowBuilder(threadId, {
        initialEventState: events.getAllState(),
        events,
        context,
        config: workflowConfig,
        signal,
    });

    // Add tasks one by one to avoid potential initialization issues during build
    builder
        .addTask(plannerTask)
        .addTask(geminiWebSearchTask)
        .addTask(reflectorTask)
        .addTask(analysisTask)
        .addTask(writerTask)
        .addTask(refineQueryTask)
        .addTask(modeRoutingTask)
        .addTask(completionTask)
        .addTask(suggestionsTask);

    return builder.build();
};
