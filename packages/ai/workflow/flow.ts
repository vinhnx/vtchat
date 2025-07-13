import {
    createContext,
    createTypedEventEmitter,
    WorkflowBuilder,
    type WorkflowConfig,
} from "@repo/orchestrator";
import type { ChatMode } from "@repo/shared/config";
import { UserTier, type UserTierType } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import type { Geo } from "@vercel/functions";
import type { CoreMessage } from "ai";
import {
    analysisTask,
    completionTask,
    geminiWebSearchTask,
    modeRoutingTask,
    plannerTask,
    refineQueryTask,
    reflectorTask,
    suggestionsTask,
    writerTask,
} from "./tasks";

type Status = "PENDING" | "COMPLETED" | "ERROR" | "HUMAN_REVIEW";

// Define the workflow schema type
export type WorkflowEventSchema = {
    steps?: Record<
        string,
        {
            id: number;
            text?: string;
            steps: Record<
                string,
                {
                    data?: any;
                    status: Status;
                }
            >;
            status: Status;
        }
    >;
    toolCalls?: any[];
    toolResults?: any[];

    answer: {
        text?: string;
        object?: any;
        objectType?: string;
        finalText?: string;
        status: Status;
    };
    sources?: {
        index: number;
        title: string;
        link: string;
    }[];
    object?: Record<string, any>;
    error?: {
        error: string;
        status: Status;
    };
    status: Status;

    suggestions?: string[];
};

// Define the context schema type
export type WorkflowContextSchema = {
    question: string;
    search_queries: string[];
    messages: CoreMessage[];
    mode: ChatMode;
    goals: {
        id: number;
        text: string;
        final: boolean;
        status: "PENDING" | "COMPLETED" | "ERROR";
    }[];
    steps: {
        type: string;
        final: boolean;
        goalId: number;
        queries?: string[];
        results?: {
            title: string;
            link: string;
        }[];
    }[];
    webSearch: boolean;
    mathCalculator: boolean;
    charts: boolean;
    queries: string[];
    summaries: string[];
    gl?: Geo;
    sources: {
        index: number;
        title: string;
        link: string;
    }[];
    answer: string | undefined;
    threadId: string;
    threadItemId: string;
    showSuggestions: boolean;
    customInstructions?: string;
    onFinish: (data: any) => void;
    apiKeys?: Record<string, string>;
    thinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    };
    userTier?: UserTierType;
    userId?: string;
};

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
    log.info("🔥 runWorkflow called with params:", {
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
            text: "",

            status: "PENDING",
        },
        sources: [],
        suggestions: [],
        object: {},
        error: {
            error: "",
            status: "PENDING",
        },
        status: "PENDING",
    });

    log.info("🌟 Workflow context created with:", {
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

    builder.addTasks([
        plannerTask,
        geminiWebSearchTask,
        reflectorTask,
        analysisTask,
        writerTask,
        refineQueryTask,
        modeRoutingTask,
        completionTask,
        suggestionsTask,
    ]);

    return builder.build();
};
