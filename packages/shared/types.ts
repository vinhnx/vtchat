import { ChatMode } from './config';

export type Project = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
};

export type Thread = {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    pinned: boolean;
    pinnedAt: Date;
    projectId?: string;
};

export type SubStep = {
    data?: any;
    status: ItemStatus;
};

export type ItemStatus = 'QUEUED' | 'PENDING' | 'COMPLETED' | 'ERROR' | 'ABORTED' | 'HUMAN_REVIEW';

export type Step = {
    id: string;
    text?: string;
    steps?: Record<string, SubStep>;
    status: ItemStatus;
};
export type Source = {
    title: string;
    link: string;
    index: number;
    snippet?: string;
};

export type Answer = {
    text: string;
    finalText?: string;
    status?: ItemStatus;
};

export type ToolCall = {
    type: 'tool-call';
    toolCallId: string;
    toolName: string;
    args: any;
};

export type ToolResult = {
    type: 'tool-result';
    toolCallId: string;
    toolName: string;
    args: any;
    result: any;
};

export type DocumentAttachment = {
    base64: string;
    mimeType: string;
    fileName: string;
};

export type ThreadItem = {
    query: string;
    toolCalls?: Record<string, ToolCall>;
    toolResults?: Record<string, ToolResult>;
    steps?: Record<string, Step>;
    answer?: Answer;
    status?: ItemStatus;
    createdAt: Date;
    updatedAt: Date;
    id: string;
    parentId?: string;
    threadId: string;
    metadata?: Record<string, any>;
    mode: ChatMode;
    error?: string;
    suggestions?: string[];
    persistToDB?: boolean;
    sources?: Source[];
    object?: Record<string, any>;
    imageAttachment?: string;
    documentAttachment?: DocumentAttachment;
    // Thinking mode data (VT+ feature) - contains AI reasoning/thoughts
    reasoning?: string;
    // Structured reasoning details from AI SDK (includes text and redacted content)
    reasoningDetails?: Array<{
        type: 'text' | 'redacted';
        text?: string;
        data?: string;
        signature?: string;
    }>;
};

export type MessageGroup = {
    userMessage: ThreadItem;
    assistantMessages: ThreadItem[];
};
