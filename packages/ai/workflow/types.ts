import type { ChatMode } from '@repo/shared/config';
import type { Geo } from '@vercel/functions';
import type { CoreMessage } from 'ai';

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

type Status = 'PENDING' | 'COMPLETED' | 'ERROR' | 'HUMAN_REVIEW';

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
        status: 'PENDING' | 'COMPLETED' | 'ERROR';
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
    sandbox: boolean;
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
    userTier?: 'FREE' | 'PLUS';
    userId?: string;
};
