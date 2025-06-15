import { ChatMode } from '@repo/shared/config';
import { z } from 'zod';

export const completionRequestSchema = z.object({
    threadId: z.string(),
    threadItemId: z.string(),
    parentThreadItemId: z.string(),
    prompt: z.string(),
    messages: z.any(),
    mode: z.nativeEnum(ChatMode),
    maxIterations: z.number().optional(),
    mcpConfig: z.record(z.string(), z.string()).optional(),
    webSearch: z.boolean().optional(),
    showSuggestions: z.boolean().optional(),
    customInstructions: z.string().optional(),
    apiKeys: z.object({
        OPENAI_API_KEY: z.string().optional(),
        ANTHROPIC_API_KEY: z.string().optional(),
        GEMINI_API_KEY: z.string().optional(),
        JINA_API_KEY: z.string().optional(),
        FIREWORKS_API_KEY: z.string().optional(),

        OPENROUTER_API_KEY: z.string().optional(),
        TOGETHER_API_KEY: z.string().optional(),
    }).optional(),
});

export type CompletionRequestType = z.infer<typeof completionRequestSchema>;

export type AgentEventResponse = {
    threadId: string;
    threadItemId: string;
    parentThreadItemId: string;
};

export type StreamController = ReadableStreamDefaultController<Uint8Array>;

export const SSE_HEADERS = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'X-Accel-Buffering': 'no',
} as const;
