import { TaskParams, TypedEventEmitter } from '@repo/orchestrator';
import {
    CoreMessage,
    extractReasoningMiddleware,
    generateObject as generateObjectAi,
    streamText,
    ToolSet,
} from 'ai';
import { format } from 'date-fns';
import { ZodSchema } from 'zod';
import { ReasoningType } from '../constants/reasoning';
import { ModelEnum } from '../models';
import { getLanguageModel } from '../providers';
import {
    GenerateTextWithReasoningResult,
    ReasoningDetail,
    ThinkingModeConfig,
} from '../types/reasoning';
import { WorkflowEventSchema } from './flow';
import { generateErrorMessage } from './tasks/utils';

export type ChunkBufferOptions = {
    threshold?: number;
    breakOn?: string[];
    onFlush: (chunk: string, fullText: string) => void;
};

export class ChunkBuffer {
    private buffer = '';
    private fullText = '';
    private threshold?: number;
    private breakPatterns: string[];
    private onFlush: (chunk: string, fullText: string) => void;

    constructor(options: ChunkBufferOptions) {
        this.threshold = options.threshold;
        this.breakPatterns = options.breakOn || ['\n\n', '.', '!', '?'];
        this.onFlush = options.onFlush;
    }

    add(chunk: string): void {
        this.fullText += chunk;
        this.buffer += chunk;

        const shouldFlush =
            (this.threshold && this.buffer.length >= this.threshold) ||
            this.breakPatterns.some(pattern => chunk.includes(pattern) || chunk.endsWith(pattern));

        if (shouldFlush) {
            this.flush();
        }
    }

    flush(): void {
        if (this.buffer.length > 0) {
            this.onFlush(this.buffer, this.fullText);
            this.buffer = '';
        }
    }

    end(): void {
        this.flush();
        this.fullText = '';
    }
}

export const generateTextWithGeminiSearch = async ({
    prompt,
    model,
    onChunk,
    messages,
    signal,
    byokKeys,
    thinkingMode,
}: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: CoreMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
}): Promise<GenerateTextWithReasoningResult> => {
    // Add comprehensive runtime logging
    console.log('=== generateTextWithGeminiSearch START ===');
    console.log('Input parameters:', {
        prompt: prompt?.slice(0, 100) + '...',
        model,
        hasOnChunk: !!onChunk,
        messagesLength: messages?.length,
        hasSignal: !!signal,
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
    });

    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        // Check if we have a valid API key for Google models
        let windowApiKey = false;
        try {
            windowApiKey = typeof window !== 'undefined' && !!(window as any).AI_API_KEYS?.google;
        } catch (error) {
            // window is not available in this environment
            windowApiKey = false;
        }

        const hasGeminiKey =
            byokKeys?.GEMINI_API_KEY ||
            (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
            windowApiKey;

        console.log('API key check:', {
            hasGeminiKey,
            byokApiKey: !!byokKeys?.GEMINI_API_KEY,
            processEnvKey: !!(typeof process !== 'undefined' && process.env?.GEMINI_API_KEY),
            windowKey: windowApiKey,
        });

        if (!hasGeminiKey) {
            throw new Error('Gemini API key is required for web search functionality');
        }

        console.log('Getting language model for:', model);
        const selectedModel = getLanguageModel(model, undefined, byokKeys, true);
        console.log('Selected model result:', {
            selectedModel: selectedModel ? 'object' : selectedModel,
            modelType: typeof selectedModel,
            modelKeys: selectedModel ? Object.keys(selectedModel) : undefined,
        });

        if (!selectedModel) {
            throw new Error('Failed to initialize Gemini model');
        }

        // Additional validation for the model object
        if (typeof selectedModel !== 'object' || selectedModel === null) {
            console.error('Invalid model object:', selectedModel);
            throw new Error('Invalid model configuration. Model must be a valid object.');
        }

        console.log('Preparing streamText call with:', {
            hasMessages: !!messages?.length,
            messagesCount: messages?.length,
            promptLength: prompt?.length,
        });

        // Filter out messages with empty content to prevent Gemini API errors
        let filteredMessages = messages;
        if (messages?.length) {
            filteredMessages = messages.filter(message => {
                const hasContent =
                    message.content &&
                    (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                          ? message.content.length > 0
                          : true);

                if (!hasContent) {
                    console.warn('Filtering out message with empty content in GeminiSearch:', {
                        role: message.role,
                        contentType: typeof message.content,
                    });
                }

                return hasContent;
            });

            console.log('GeminiSearch message filtering:', {
                originalCount: messages.length,
                filteredCount: filteredMessages.length,
                removedCount: messages.length - filteredMessages.length,
            });
        }

        let streamResult;

        try {
            // Import reasoning utilities
            const { supportsReasoning, getReasoningType } = await import('../models');

            // Set up provider options based on model's reasoning type
            const providerOptions: any = {};
            const reasoningType = getReasoningType(model);

            if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
                switch (reasoningType) {
                    case ReasoningType.GEMINI_THINKING:
                        // Gemini models use thinkingConfig
                        providerOptions.google = {
                            thinkingConfig: {
                                includeThoughts: thinkingMode.includeThoughts ?? true,
                                maxOutputTokens: thinkingMode.budget,
                            },
                        };
                        break;

                    case ReasoningType.ANTHROPIC_REASONING:
                        // Anthropic Claude 4 models support reasoning through beta features
                        providerOptions.anthropic = {
                            reasoning: true,
                        };
                        break;

                    case ReasoningType.DEEPSEEK_REASONING:
                        // DeepSeek reasoning models work through middleware extraction
                        // No special provider options needed as middleware handles <think> tags
                        break;
                }
            }

            const streamTextConfig = filteredMessages?.length
                ? {
                      system: prompt,
                      model: selectedModel,
                      messages: filteredMessages,
                      abortSignal: signal,
                      ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                  }
                : {
                      prompt,
                      model: selectedModel,
                      abortSignal: signal,
                      ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
                  };

            console.log('StreamText config:', {
                configType: filteredMessages?.length ? 'with-messages' : 'prompt-only',
                hasSystem: !!(streamTextConfig as any).system,
                hasPrompt: !!(streamTextConfig as any).prompt,
                hasModel: !!streamTextConfig.model,
                hasAbortSignal: !!streamTextConfig.abortSignal,
                hasProviderOptions: Object.keys(providerOptions).length > 0,
            });

            streamResult = streamText(streamTextConfig as any);
            console.log('StreamText call successful, result type:', typeof streamResult);
        } catch (error: any) {
            console.error('Error creating streamText:', error);
            console.error('Error stack:', error.stack);
            if (error.message?.includes('undefined to object')) {
                throw new Error(
                    'Google Generative AI configuration error. This may be due to missing API key or invalid model configuration.'
                );
            }
            throw error;
        }

        if (!streamResult) {
            console.error('StreamResult is null/undefined');
            throw new Error('Failed to initialize text stream');
        }

        console.log('StreamResult properties:', Object.keys(streamResult));

        // Don't destructure sources and providerMetadata immediately
        console.log('Accessing fullStream...');
        const { fullStream } = streamResult;
        console.log('FullStream extracted:', {
            hasFullStream: !!fullStream,
            fullStreamType: typeof fullStream,
        });

        if (!fullStream) {
            console.error('FullStream is null/undefined');
            throw new Error('Failed to get fullStream from streamText result');
        }

        let fullText = '';
        console.log('Starting to iterate over fullStream...');

        try {
            for await (const chunk of fullStream) {
                if (signal?.aborted) {
                    throw new Error('Operation aborted');
                }

                console.log('Received chunk:', {
                    type: chunk?.type,
                    hasTextDelta: !!(chunk as any)?.textDelta,
                    chunkKeys: chunk ? Object.keys(chunk) : undefined,
                });

                if (chunk.type === 'text-delta') {
                    fullText += chunk.textDelta;
                    onChunk?.(chunk.textDelta, fullText);
                }
            }
        } catch (error: any) {
            console.error('Error iterating over fullStream:', error);
            console.error('Error stack:', error.stack);
            throw error;
        }

        console.log('Stream iteration completed, fullText length:', fullText.length);

        // Safely handle potentially undefined sources and metadata
        console.log('Resolving sources and metadata...');
        let resolvedSources: any[] = [];
        let groundingMetadata: any = null;

        try {
            console.log('Checking streamResult.sources:', {
                hasSources: !!streamResult?.sources,
                sourcesType: typeof streamResult?.sources,
            });
            if (streamResult?.sources) {
                resolvedSources = (await streamResult.sources) || [];
                console.log('Sources resolved:', resolvedSources.length);
            }
        } catch (error) {
            console.warn('Failed to resolve sources:', error);
            resolvedSources = [];
        }

        try {
            console.log('Checking streamResult.providerMetadata:', {
                hasProviderMetadata: !!streamResult?.providerMetadata,
                providerMetadataType: typeof streamResult?.providerMetadata,
            });
            if (streamResult?.providerMetadata) {
                const metadata = await streamResult.providerMetadata;
                console.log('ProviderMetadata resolved:', {
                    hasMetadata: !!metadata,
                    hasGoogle: !!metadata?.google,
                    hasGroundingMetadata: !!metadata?.google?.groundingMetadata,
                });
                groundingMetadata = metadata?.google?.groundingMetadata || null;
            }
        } catch (error) {
            console.warn('Failed to resolve provider metadata:', error);
            groundingMetadata = null;
        }

        // Extract reasoning details if available
        let reasoning: string = '';
        let reasoningDetails: any[] = [];

        try {
            if (streamResult?.reasoning) {
                reasoning = (await streamResult.reasoning) || '';
                console.log('Reasoning extracted:', reasoning.length);
            }
        } catch (error) {
            console.warn('Failed to resolve reasoning:', error);
        }

        try {
            if (streamResult?.reasoningDetails) {
                reasoningDetails = (await streamResult.reasoningDetails) || [];
                console.log('ReasoningDetails extracted:', reasoningDetails.length);
            }
        } catch (error) {
            console.warn('Failed to resolve reasoningDetails:', error);
        }

        const result = {
            text: fullText,
            sources: resolvedSources,
            groundingMetadata,
            reasoning,
            reasoningDetails,
        };

        console.log('=== generateTextWithGeminiSearch END ===');
        console.log('Returning result:', {
            textLength: result.text.length,
            sourcesCount: result.sources.length,
            hasGroundingMetadata: !!result.groundingMetadata,
            hasReasoning: !!result.reasoning,
            reasoningDetailsCount: result.reasoningDetails.length,
        });

        return result;
    } catch (error: any) {
        console.error('Error in generateTextWithGeminiSearch:', error);

        // Provide more specific error messages
        if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
            throw new Error(
                'Invalid or missing Gemini API key. Please check your API key configuration.'
            );
        } else if (error.message?.includes('403') || error.message?.includes('forbidden')) {
            throw new Error('Gemini API access forbidden. Please check your API key permissions.');
        } else if (error.message?.includes('429')) {
            throw new Error('Gemini API rate limit exceeded. Please try again later.');
        } else if (error.message?.includes('undefined to object')) {
            throw new Error('Gemini web search configuration error. Please check your API setup.');
        }

        throw error;
    }
};

export const generateText = async ({
    prompt,
    model,
    onChunk,
    messages,
    onReasoning,
    onReasoningDetails,
    tools,
    onToolCall,
    onToolResult,
    signal,
    toolChoice = 'auto',
    maxSteps = 2,
    byokKeys,
    useSearchGrounding = false,
    thinkingMode,
}: {
    prompt: string;
    model: ModelEnum;
    onChunk?: (chunk: string, fullText: string) => void;
    messages?: CoreMessage[];
    onReasoning?: (chunk: string, fullText: string) => void;
    onReasoningDetails?: (details: ReasoningDetail[]) => void;
    tools?: ToolSet;
    onToolCall?: (toolCall: any) => void;
    onToolResult?: (toolResult: any) => void;
    signal?: AbortSignal;
    toolChoice?: 'auto' | 'none' | 'required';
    maxSteps?: number;
    byokKeys?: Record<string, string>;
    useSearchGrounding?: boolean;
    thinkingMode?: ThinkingModeConfig;
}) => {
    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        // Filter out messages with empty content to prevent Gemini API errors
        let filteredMessages = messages;
        if (messages?.length) {
            filteredMessages = messages.filter(message => {
                const hasContent =
                    message.content &&
                    (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                          ? message.content.length > 0
                          : true);
                return hasContent;
            });
        }

        // Import reasoning utilities
        const { supportsReasoning, getReasoningType, getReasoningTagName } = await import(
            '../models'
        );

        // Set up middleware based on model's reasoning capabilities
        let middleware: any = undefined;
        const reasoningTagName = getReasoningTagName(model);

        if (reasoningTagName && supportsReasoning(model)) {
            middleware = extractReasoningMiddleware({
                tagName: reasoningTagName,
                separator: '\n',
            });
        }

        const selectedModel = getLanguageModel(model, middleware, byokKeys, useSearchGrounding);

        // Set up provider options based on model's reasoning type
        const providerOptions: any = {};
        const reasoningType = getReasoningType(model);

        if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
            switch (reasoningType) {
                case 'gemini-thinking':
                    // Gemini models use thinkingConfig
                    providerOptions.google = {
                        thinkingConfig: {
                            includeThoughts: thinkingMode.includeThoughts ?? true,
                            maxOutputTokens: thinkingMode.budget,
                        },
                    };
                    break;

                case 'anthropic-reasoning':
                    // Anthropic Claude 4 models support reasoning through beta features
                    providerOptions.anthropic = {
                        reasoning: true,
                    };
                    break;

                case 'deepseek-reasoning':
                    // DeepSeek reasoning models work through middleware extraction
                    // No special provider options needed as middleware handles <think> tags
                    break;
            }
        }

        const streamConfig = filteredMessages?.length
            ? {
                  system: prompt,
                  model: selectedModel,
                  messages: filteredMessages,
                  tools,
                  maxSteps,
                  toolChoice: toolChoice as any,
                  abortSignal: signal,
                  ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
              }
            : {
                  prompt,
                  model: selectedModel,
                  tools,
                  maxSteps,
                  toolChoice: toolChoice as any,
                  abortSignal: signal,
                  ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
              };

        const streamResult = streamText(streamConfig);
        const { fullStream } = streamResult;
        let fullText = '';
        let reasoning = '';

        for await (const chunk of fullStream) {
            if (signal?.aborted) {
                throw new Error('Operation aborted');
            }

            if (chunk.type === 'text-delta') {
                fullText += chunk.textDelta;
                onChunk?.(chunk.textDelta, fullText);
            }
            if (chunk.type === 'reasoning') {
                reasoning += chunk.textDelta;
                onReasoning?.(chunk.textDelta, reasoning);
            }
            if (chunk.type === 'tool-call') {
                onToolCall?.(chunk);
            }
            if (chunk.type === ('tool-result' as any)) {
                onToolResult?.(chunk);
            }

            if (chunk.type === 'error') {
                console.error(chunk.error);
                return Promise.reject(chunk.error);
            }
        }

        // Extract reasoning details if available
        try {
            if (streamResult?.reasoningDetails) {
                const reasoningDetails = (await streamResult.reasoningDetails) || [];
                if (reasoningDetails.length > 0) {
                    onReasoningDetails?.(reasoningDetails);
                }
            }
        } catch (error) {
            console.warn('Failed to resolve reasoningDetails:', error);
        }

        return Promise.resolve(fullText);
    } catch (error) {
        console.error(error);
        return Promise.reject(error);
    }
};

export const generateObject = async ({
    prompt,
    model,
    schema,
    messages,
    signal,
    byokKeys,
    thinkingMode,
}: {
    prompt: string;
    model: ModelEnum;
    schema: ZodSchema;
    messages?: CoreMessage[];
    signal?: AbortSignal;
    byokKeys?: Record<string, string>;
    thinkingMode?: ThinkingModeConfig;
}) => {
    try {
        if (signal?.aborted) {
            throw new Error('Operation aborted');
        }

        console.log('=== generateObject START ===');
        console.log('Input parameters:', {
            prompt: prompt?.slice(0, 100) + '...',
            model,
            hasSchema: !!schema,
            messagesLength: messages?.length,
            hasSignal: !!signal,
            byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        });

        // Filter out messages with empty content to prevent Gemini API errors
        let filteredMessages = messages;
        if (messages?.length) {
            filteredMessages = messages.filter(message => {
                const hasContent =
                    message.content &&
                    (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                          ? message.content.length > 0
                          : true);

                if (!hasContent) {
                    console.warn('Filtering out message with empty content:', {
                        role: message.role,
                        contentType: typeof message.content,
                        contentLength: Array.isArray(message.content)
                            ? message.content.length
                            : typeof message.content === 'string'
                              ? message.content.length
                              : 0,
                    });
                }

                return hasContent;
            });

            console.log('Message filtering:', {
                originalCount: messages.length,
                filteredCount: filteredMessages.length,
                removedCount: messages.length - filteredMessages.length,
            });
        }

        // Import reasoning utilities
        const { supportsReasoning, getReasoningType } = await import('../models');

        const selectedModel = getLanguageModel(model, undefined, byokKeys);
        console.log('Selected model for generateObject:', {
            hasModel: !!selectedModel,
            modelType: typeof selectedModel,
        });

        // Set up provider options based on model's reasoning type
        const providerOptions: any = {};
        const reasoningType = getReasoningType(model);

        if (supportsReasoning(model) && thinkingMode?.enabled && thinkingMode.budget > 0) {
            switch (reasoningType) {
                case ReasoningType.GEMINI_THINKING:
                    // Gemini models use thinkingConfig
                    providerOptions.google = {
                        thinkingConfig: {
                            includeThoughts: thinkingMode.includeThoughts ?? true,
                            maxOutputTokens: thinkingMode.budget,
                        },
                    };
                    break;

                case ReasoningType.ANTHROPIC_REASONING:
                    // Anthropic Claude 4 models support reasoning through beta features
                    providerOptions.anthropic = {
                        reasoning: true,
                    };
                    break;

                case ReasoningType.DEEPSEEK_REASONING:
                    // DeepSeek reasoning models work through middleware extraction
                    // No special provider options needed as middleware handles <think> tags
                    break;
            }
        }

        console.log('Calling generateObjectAi with:', {
            configType: filteredMessages?.length ? 'with-messages' : 'prompt-only',
            hasPrompt: !!prompt,
            hasSchema: !!schema,
            messagesCount: filteredMessages?.length,
            hasProviderOptions: Object.keys(providerOptions).length > 0,
        });

        const generateConfig = filteredMessages?.length
            ? {
                  system: prompt,
                  model: selectedModel,
                  schema,
                  messages: filteredMessages,
                  abortSignal: signal,
                  ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
              }
            : {
                  prompt,
                  model: selectedModel,
                  schema,
                  abortSignal: signal,
                  ...(Object.keys(providerOptions).length > 0 && { providerOptions }),
              };

        const { object } = await generateObjectAi(generateConfig);

        console.log('generateObjectAi successful, result:', {
            hasObject: !!object,
            objectType: typeof object,
        });

        console.log('=== generateObject END ===');
        return JSON.parse(JSON.stringify(object));
    } catch (error: any) {
        console.error('Error in generateObject:', error);

        // Provide more specific error messages for common issues
        if (error.message?.includes('contents.parts must not be empty')) {
            console.error(
                'Empty parts error - this indicates messages with empty content were passed to Gemini API'
            );
            throw new Error(
                'Invalid message format: Some messages have empty content. Please ensure all messages have valid content.'
            );
        } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
            throw new Error(
                'Invalid or missing API key for the selected model. Please check your API key configuration.'
            );
        } else if (error.message?.includes('403') || error.message?.includes('forbidden')) {
            throw new Error('API access forbidden. Please check your API key permissions.');
        } else if (error.message?.includes('429')) {
            throw new Error('API rate limit exceeded. Please try again later.');
        }

        throw error; // Re-throw to let caller handle the error appropriately
    }
};

export type EventSchema<T extends Record<string, any>> = {
    [K in keyof T]: (current: T[K] | undefined) => T[K];
};

export class EventEmitter<T extends Record<string, any>> {
    private listeners: Map<string, ((data: any) => void)[]> = new Map();
    private state: Partial<T> = {};

    constructor(initialState?: Partial<T>) {
        this.state = initialState || {};
    }

    on(event: string, callback: (data: any) => void) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
        return this;
    }

    off(event: string, callback: (data: any) => void) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    }

    emit(event: string, data: any) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
        return this;
    }

    getState(): Partial<T> {
        return { ...this.state };
    }

    updateState<K extends keyof T>(key: K, updater: (current: T[K] | undefined) => T[K]) {
        this.state[key] = updater(this.state[key]);
        return this;
    }
}

export function createEventManager<T extends Record<string, any>>(
    initialState?: Partial<T>,
    schema?: EventSchema<T>
) {
    const emitter = new EventEmitter<T>(initialState);

    return {
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter),
        getState: emitter.getState.bind(emitter),
        update: <K extends keyof T>(
            key: K,
            value: T[K] | ((current: T[K] | undefined) => T[K])
        ) => {
            const updater =
                typeof value === 'function'
                    ? (value as (current: T[K] | undefined) => T[K])
                    : () => value;

            emitter.updateState(key, updater);
            emitter.emit('stateChange', {
                key,
                value: emitter.getState()[key],
            });
            return emitter.getState();
        },
    };
}

export const getHumanizedDate = () => {
    return format(new Date(), 'MMMM dd, yyyy, h:mm a');
};

export const getWebPageContent = async (url: string) => {
    try {
        const result = await readURL(url);
        const title = result?.title ? `# ${result.title}\n\n` : '';
        const description = result?.description
            ? `${result.description}\n\n ${result.markdown}\n\n`
            : '';
        const sourceUrl = result?.url ? `Source: [${result.url}](${result.url})\n\n` : '';
        const content = result?.markdown || '';

        if (!content) return '';

        return `${title}${description}${content}${sourceUrl}`;
    } catch (error) {
        console.error(error);
        return `No Result Found for ${url}`;
    }
};

const processContent = (content: string, maxLength: number = 10000): string => {
    if (!content) return '';

    const chunks = content.split('\n\n');
    let result = '';

    for (const chunk of chunks) {
        if ((result + chunk).length > maxLength) break;
        result += chunk + '\n\n';
    }

    return result.trim();
};

const fetchWithJina = async (url: string): Promise<TReaderResult> => {
    try {
        const response = await fetch(`https://r.jina.ai/${url}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.JINA_API_KEY}`,
                Accept: 'application/json',
                'X-Engine': 'browser',
                // 'X-Md-Link-Style': 'referenced',
                'X-No-Cache': 'true',
                'X-Retain-Images': 'none',
                'X-Return-Format': 'markdown',
                'X-Robots-Txt': 'JinaReader',
                // 'X-With-Links-Summary': 'true',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`Jina API responded with status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.data?.content) {
            return { success: false, error: 'No content found' };
        }

        return {
            success: true,
            title: data.data.title,
            description: data.data.description,
            url: data.data.url,
            markdown: processContent(data.data.content),
            source: 'jina',
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

export const readURL = async (url: string): Promise<TReaderResult> => {
    try {
        if (process.env.JINA_API_KEY) {
            return await fetchWithJina(url);
        } else {
            console.log('No Jina API key found');
        }

        return { success: false };
    } catch (error) {
        console.error('Error in readURL:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export const processWebPages = async (
    results: Array<{ link: string; title: string }>,
    signal?: AbortSignal,
    options = { batchSize: 4, maxPages: 8, timeout: 30000 }
) => {
    const processedResults: Array<{ title: string; link: string; content: string }> = [];
    const timeoutSignal = AbortSignal.timeout(options.timeout);
    const combinedSignal = new AbortController();

    signal?.addEventListener('abort', () => combinedSignal.abort());
    timeoutSignal.addEventListener('abort', () => combinedSignal.abort());

    try {
        const startTime = Date.now();

        for (let i = 0; i < results.length; i += options.batchSize) {
            if (processedResults.length >= options.maxPages) break;
            if (combinedSignal.signal.aborted) break;
            if (Date.now() - startTime > options.timeout) break;

            const batch = results.slice(i, i + options.batchSize);
            const batchPromises = batch.map(result =>
                getWebPageContent(result.link)
                    .then(content => ({
                        title: result.title,
                        link: result.link,
                        content,
                    }))
                    .catch(() => null)
            );

            const batchResults = await Promise.all(batchPromises);
            const validResults = batchResults.filter((r): r is NonNullable<typeof r> => r !== null);
            processedResults.push(...validResults);
        }

        return processedResults.slice(0, options.maxPages);
    } catch (error) {
        console.error('Error in processWebPages:', error);
        return processedResults.slice(0, options.maxPages);
    } finally {
        // Clean up event listeners to prevent memory leaks
        signal?.removeEventListener('abort', () => combinedSignal.abort());
        timeoutSignal.removeEventListener('abort', () => combinedSignal.abort());
    }
};

export type TReaderResponse = {
    success: boolean;
    title: string;
    url: string;
    markdown: string;
    error?: string;
    source?: 'jina' | 'readability';
};

export type TReaderResult = {
    success: boolean;
    title?: string;
    url?: string;
    description?: string;
    markdown?: string;
    source?: 'jina' | 'readability';
    error?: string;
};

export const handleError = (error: Error, { context, events }: TaskParams) => {
    const errorMessage = generateErrorMessage(error);
    console.error('Task failed', error);

    events?.update('error', prev => ({
        ...prev,
        error: errorMessage,
        status: 'ERROR',
    }));

    return Promise.resolve({
        retry: false,
        result: 'error',
    });
};

export const sendEvents = (events?: TypedEventEmitter<WorkflowEventSchema>) => {
    const nextStepId = () => Object.keys(events?.getState('steps') || {}).length;

    const updateStep = (params: {
        stepId: number;
        text?: string;
        stepStatus: 'PENDING' | 'COMPLETED';
        subSteps: Record<string, { status: 'PENDING' | 'COMPLETED'; data?: any }>;
    }) => {
        const { stepId, text, stepStatus, subSteps } = params;
        events?.update('steps', prev => ({
            ...prev,
            [stepId]: {
                ...prev?.[stepId],
                id: stepId,
                text: text || prev?.[stepId]?.text,
                status: stepStatus,
                steps: {
                    ...prev?.[stepId]?.steps,
                    ...Object.entries(subSteps).reduce((acc, [key, value]) => {
                        return {
                            ...acc,
                            [key]: {
                                ...prev?.[stepId]?.steps?.[key],
                                ...value,
                                data: Array.isArray(value?.data)
                                    ? [...(prev?.[stepId]?.steps?.[key]?.data || []), ...value.data]
                                    : typeof value?.data === 'object'
                                      ? {
                                            ...prev?.[stepId]?.steps?.[key]?.data,
                                            ...value.data,
                                        }
                                      : !!value?.data
                                        ? value.data
                                        : prev?.[stepId]?.steps?.[key]?.data,
                            },
                        };
                    }, {}),
                },
            },
        }));
    };

    const addSources = (sources: any[]) => {
        events?.update('sources', prev => {
            const newSources = sources
                ?.filter((result: any) => !prev?.some(source => source.link === result.link))
                .map((result: any, index: number) => ({
                    title: result?.title,
                    link: result?.link,
                    snippet: result?.snippet,
                    index: index + (prev?.length || 1),
                }));
            return [...(prev || []), ...newSources];
        });
    };

    const updateAnswer = ({
        text,
        finalText,
        status,
    }: {
        text?: string;
        finalText?: string;
        status?: 'PENDING' | 'COMPLETED';
    }) => {
        events?.update('answer', prev => ({
            ...prev,
            text: text || prev?.text,
            finalText: finalText || prev?.finalText,
            status: status || prev?.status,
        }));
    };

    const updateStatus = (status: 'PENDING' | 'COMPLETED' | 'ERROR') => {
        events?.update('status', prev => status);
    };

    const updateObject = (object: any) => {
        events?.update('object', prev => object);
    };

    return { updateStep, addSources, updateAnswer, nextStepId, updateStatus, updateObject };
};

/**
 * Selects an appropriate model based on available API keys
 * Provides fallback mechanism when primary model isn't available
 */
export const selectAvailableModel = (
    preferredModel: ModelEnum,
    byokKeys?: Record<string, string>
): ModelEnum => {
    console.log('=== selectAvailableModel START ===');

    // Safe window/self checks for debugging
    let hasSelfApiKeys = false;
    let hasWindowApiKeys = false;

    try {
        hasSelfApiKeys = typeof self !== 'undefined' && !!(self as any).AI_API_KEYS;
    } catch (error) {
        // self not available
    }

    try {
        hasWindowApiKeys = typeof window !== 'undefined' && !!(window as any).AI_API_KEYS;
    } catch (error) {
        // window not available
    }

    console.log('Input:', {
        preferredModel,
        availableKeys: byokKeys ? Object.keys(byokKeys).filter(key => byokKeys[key]) : [],
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        hasSelf: typeof self !== 'undefined',
        hasWindow: (() => {
            try {
                return typeof window !== 'undefined';
            } catch (error) {
                return false;
            }
        })(),
        hasSelfApiKeys,
        hasWindowApiKeys,
    });

    // Check if preferred model's provider has an API key
    const hasApiKeyForModel = (model: ModelEnum): boolean => {
        const providers = {
            // Gemini models
            [ModelEnum.GEMINI_2_0_FLASH]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_0_FLASH_LITE]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_5_FLASH]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_5_FLASH_LITE]: 'GEMINI_API_KEY',
            [ModelEnum.GEMINI_2_5_PRO]: 'GEMINI_API_KEY',
            // OpenAI models
            [ModelEnum.GPT_4o_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4o]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.GPT_4_1_Nano]: 'OPENAI_API_KEY',
            [ModelEnum.O3]: 'OPENAI_API_KEY',
            [ModelEnum.O3_Mini]: 'OPENAI_API_KEY',
            [ModelEnum.O4_Mini]: 'OPENAI_API_KEY',
            // Anthropic models
            [ModelEnum.CLAUDE_4_SONNET]: 'ANTHROPIC_API_KEY',
            [ModelEnum.CLAUDE_4_OPUS]: 'ANTHROPIC_API_KEY',
            // Fireworks models
            [ModelEnum.Deepseek_R1]: 'FIREWORKS_API_KEY',
            // xAI models
            [ModelEnum.GROK_3]: 'XAI_API_KEY',
            [ModelEnum.GROK_3_MINI]: 'XAI_API_KEY',
            // OpenRouter models
            [ModelEnum.DEEPSEEK_V3_0324_FREE]: 'OPENROUTER_API_KEY',
            [ModelEnum.DEEPSEEK_V3_0324]: 'OPENROUTER_API_KEY',
            [ModelEnum.DEEPSEEK_R1_FREE]: 'OPENROUTER_API_KEY',
            [ModelEnum.DEEPSEEK_R1_0528_FREE]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_235B_A22B]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_32B]: 'OPENROUTER_API_KEY',
            [ModelEnum.MISTRAL_NEMO]: 'OPENROUTER_API_KEY',
            [ModelEnum.QWEN3_14B_FREE]: 'OPENROUTER_API_KEY',
        };

        const requiredKey = providers[model];
        if (!requiredKey) return false;

        // Check BYOK keys first
        if (byokKeys?.[requiredKey]) return true;

        // Check environment variables
        if (typeof process !== 'undefined' && process.env?.[requiredKey]) return true;

        // Check self (worker environment)
        try {
            if (typeof self !== 'undefined' && (self as any).AI_API_KEYS) {
                // Map API key names to provider names
                const providerMap: Record<string, string> = {
                    GEMINI_API_KEY: 'google',
                    OPENAI_API_KEY: 'openai',
                    ANTHROPIC_API_KEY: 'anthropic',
                    FIREWORKS_API_KEY: 'fireworks',
                    TOGETHER_API_KEY: 'together',
                    XAI_API_KEY: 'xai',
                    OPENROUTER_API_KEY: 'openrouter',
                };

                const providerName = providerMap[requiredKey];
                if (providerName && (self as any).AI_API_KEYS[providerName]) {
                    return true;
                }
            }
        } catch (error) {
            // self not available
        }

        // Check window (browser environment)
        try {
            if (typeof window !== 'undefined' && (window as any).AI_API_KEYS) {
                // Map API key names to provider names
                const providerMap: Record<string, string> = {
                    GEMINI_API_KEY: 'google',
                    OPENAI_API_KEY: 'openai',
                    ANTHROPIC_API_KEY: 'anthropic',
                    FIREWORKS_API_KEY: 'fireworks',
                    TOGETHER_API_KEY: 'together',
                    XAI_API_KEY: 'xai',
                    OPENROUTER_API_KEY: 'openrouter',
                };

                const providerName = providerMap[requiredKey];
                if (providerName && ((window as any).AI_API_KEYS as any)[providerName]) {
                    return true;
                }
            }
        } catch (error) {
            // window not available
        }

        return false;
    };

    // Try preferred model first
    if (hasApiKeyForModel(preferredModel)) {
        console.log('Using preferred model:', preferredModel);
        return preferredModel;
    }

    // Fallback priority list - most reliable and cost-effective models first
    const fallbackModels = [
        ModelEnum.GPT_4o_Mini, // Most cost-effective OpenAI model
        ModelEnum.GEMINI_2_0_FLASH, // Free/cheap Gemini model
        ModelEnum.CLAUDE_4_SONNET, // Anthropic fallback
        ModelEnum.GPT_4o, // More expensive but reliable
        ModelEnum.GEMINI_2_5_FLASH, // Newer Gemini
    ];

    for (const model of fallbackModels) {
        if (hasApiKeyForModel(model)) {
            console.log('Using fallback model:', model);
            return model;
        }
    }

    console.warn('No API key found for any model, will fail with clear error message');
    // Return the preferred model to let the provider give a clear error message
    return preferredModel;
};
