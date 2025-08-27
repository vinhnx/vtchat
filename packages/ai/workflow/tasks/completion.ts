import { createTask } from '@repo/orchestrator';
import { log } from '@repo/shared/logger';
import { stepCountIs, streamText } from 'ai';
import { chartTools } from '../../../../apps/web/lib/tools/charts';
import { calculatorTools } from '../../../../apps/web/lib/tools/math';
import { getModelFromChatMode, models, supportsOpenAIWebSearch, supportsTools } from '../../models';
import { MATH_CALCULATOR_PROMPT } from '../../prompts/math-calculator';
import { getWebSearchTool } from '../../tools';
import { handlePDFProcessingError } from '../../utils/pdf-error-handler';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    ChunkBuffer,
    generateText,
    getHumanizedDate,
    handleError,
    selectAvailableModel,
} from '../utils';

const MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH = 6000;

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'completion',
    execute: async ({ events, context, signal, redirectTo }) => {
        if (!context) {
            throw new Error('Context is required but was not provided');
        }

        const customInstructions = context?.get('customInstructions');
        const mode = context.get('mode');
        const webSearch = context.get('webSearch');
        const mathCalculator = context.get('mathCalculator');
        const charts = context.get('charts');

        let messages = context
            .get('messages')
            ?.filter(
                (message) =>
                    (message.role === 'user' || message.role === 'assistant')
                    && !!message.content
                    && (typeof message.content === 'string'
                        ? message.content.trim() !== ''
                        : Array.isArray(message.content)
                        ? message.content.length > 0
                        : false),
            ) || [];

        if (
            customInstructions
            && customInstructions?.length < MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH
        ) {
            messages = [
                {
                    role: 'system',
                    content: `Today is ${getHumanizedDate()}. and current location is ${
                        context.get('gl')?.city
                    }, ${context.get('gl')?.country}. \n\n ${customInstructions}`,
                },
                ...messages,
            ];
        }

        const baseModel = getModelFromChatMode(mode);
        const model = selectAvailableModel(baseModel, context?.get('apiKeys'));
        const modelName = models.find((m) => m.id === model)?.name || model;

        // Debug logging for model selection
        log.info(
            {
                mode,
                model,
                modelName,
                modelFromFunction: getModelFromChatMode(mode),
            },
            '🔍 Completion task model selection',
        );

        // Check if model supports OpenAI web search when web search is enabled
        const supportsOpenAISearch = supportsOpenAIWebSearch(model);
        if (webSearch && !supportsOpenAISearch) {
            // For non-OpenAI models with web search, redirect to planner (or handle appropriately)
            redirectTo('planner');
            return;
        }

        const prompt =
            `You are VT Chat AI, an advanced AI assistant powered by ${modelName}. You are designed to help users with a wide range of tasks and questions. You have access to multiple powerful capabilities and tools to provide comprehensive, accurate, and helpful responses.

## Current Context
- Today is ${getHumanizedDate()}
- User location: ${
                context.get('gl')?.city
                    ? `${context.get('gl')?.city}, ${context.get('gl')?.country}`
                    : 'Not specified'
            }

## Core Capabilities

### Multi-Modal Processing
You can process and analyze:
- Text conversations and questions
- Images and visual content (when supported by the model)
- Documents: PDF, DOC, DOCX, TXT, MD files (up to 10MB)
- Structured data extraction from documents

### Document Analysis
When users upload documents, you can:
- Extract and analyze content from various file formats
- Provide summaries and insights
- Answer questions about document content
- Extract structured data (resumes, invoices, contracts, etc.)
- Maintain context across document-based conversations

${mathCalculator ? MATH_CALCULATOR_PROMPT : ''}

### Data Visualization
${
                charts
                    ? `You have access to advanced chart creation tools. Use these tools when users ask for:
- Data visualization and graphical representations
- Charts, graphs, and plots (bar charts, line graphs, pie charts, scatter plots)
- Trend analysis and comparisons
- Statistical visualizations
- Any scenario where visual representation would enhance understanding

Always create charts when numerical data would be more effective as a visual representation.`
                    : 'You can describe data visualization concepts, but chart creation tools are not currently enabled.'
            }

### Web Search & Real-Time Information
${
                webSearch && supportsOpenAISearch
                    ? `
🌐 IMPORTANT: You have access to real-time web search capabilities. ALWAYS use web search tools when users ask about:

**Current & Time-Sensitive Information:**
- Current events, breaking news, or recent developments
- Real-time data (weather, stock prices, sports scores, exchange rates)
- Current status of companies, products, or services
- Recent statistics, research findings, or studies
- Information that changes frequently or might be outdated
- Specific locations, addresses, or business information
- Current availability, pricing, or specifications

**People & Entities:**
- Information about specific people, especially public figures
- Company information, leadership, or recent changes
- Current contact information or business details

**Examples that REQUIRE web search:**
- "What is the current weather in [location]?"
- "What are the latest news about [topic]?"
- "What is [company]'s stock price today?"
- "What are the current exchange rates?"
- "Who is [person]?" (especially for public figures)
- "What are the latest updates on [product/service]?"
- "What is happening in [location] right now?"

**Critical Rule:** Do NOT answer these types of questions without using web search first, even if you think you know the answer. Always verify current information with web search.`
                    : 'Web search capabilities are not currently enabled for this session.'
            }

## Response Guidelines

### Accuracy & Reliability
- Always strive for accurate, up-to-date information
- Use appropriate tools when available to enhance your responses
- Acknowledge limitations when you don't have access to certain capabilities
- Cite sources when using web search results

### User Experience
- Provide clear, well-structured responses
- Break down complex topics into digestible parts
- Offer follow-up suggestions when relevant
- Maintain context throughout conversations

### Tool Usage Best Practices
- Use mathematical tools for any calculations, even simple ones
- Create visualizations when data would benefit from graphical representation
- Search the web for current information rather than relying on training data
- Process documents thoroughly when uploaded

### Privacy & Security
- Respect user privacy and data confidentiality
- Handle uploaded documents securely
- Don't store or remember personal information beyond the current conversation

## Model-Specific Features
Your capabilities may vary depending on the AI model being used:
- Some models support advanced reasoning and thinking modes
- Certain models excel at document processing and multi-modal tasks
- Web search availability depends on model compatibility

Remember: You are designed to be helpful, accurate, and comprehensive while leveraging all available tools and capabilities to provide the best possible assistance to users.
        `;

        const reasoningBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (_chunk: string, fullText: string) => {
                events?.update('steps', (prev) => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: 'COMPLETED',
                        steps: {
                            ...prev?.[0]?.steps,
                            reasoning: {
                                data: fullText,
                                status: 'COMPLETED',
                            },
                        },
                    },
                }));
            },
        });

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n'],
            onFlush: (bufferText: string, fullText: string) => {
                log.debug('🔄 ChunkBuffer onFlush called', {
                    bufferTextLength: bufferText?.length || 0,
                    fullTextLength: fullText?.length || 0,
                    bufferPreview: bufferText?.substring(0, 50) + '...',
                    fullTextPreview: fullText?.substring(0, 50) + '...',
                    threadItemId: context?.get('threadItemId'),
                });

                // Send incremental text updates for streaming display
                // Use the buffer content for incremental updates
                events?.update('answer', (current) => ({
                    ...current,
                    text: bufferText,
                    status: 'PENDING' as const,
                }));
            },
        });

        // Combine tools based on enabled features
        let tools: any = {};

        if (mathCalculator) {
            log.info({}, 'Math calculator enabled, adding calculator tools...');
            const mathToolsObj = calculatorTools();
            log.info({ data: Object.keys(mathToolsObj) }, '🔢 Available math tools');
            tools = { ...tools, ...mathToolsObj };
        }

        if (charts) {
            log.info({ model }, '🎨 Charts enabled for model, adding chart tools...');
            const chartToolsObj = chartTools();
            log.info(
                {
                    chartTools: Object.keys(chartToolsObj),
                    model,
                    supportsTools: supportsTools ? supportsTools(model) : 'unknown',
                },
                '📊 Available chart tools for model',
            );
            tools = { ...tools, ...chartToolsObj };
        }

        if (webSearch && supportsOpenAISearch) {
            const webSearchTools = getWebSearchTool(model);
            if (webSearchTools) {
                tools = { ...tools, ...webSearchTools };
            }
        }

        // Convert to undefined if no tools are enabled
        const finalTools = Object.keys(tools).length > 0 ? tools : undefined;
        log.info({ data: finalTools ? Object.keys(finalTools) : 'none' }, '🔧 Final tools for AI');

        // Track last math calculation result to enable fallback post-processing if needed
        let lastMathResult: { toolName?: string; result?: any; } | null = null;

        // Check if messages contain PDF attachments for enhanced error handling
        const hasPDFAttachment = messages.some(
            (message: any) =>
                Array.isArray(message.content)
                && message.content.some(
                    (part: any) => part.type === 'file' && part.mediaType === 'application/pdf',
                ),
        );

        let response: string;

        try {
            // Use AI SDK v5 streamText for proper streaming response
            // Choose between messages (for chat) or prompt (for single interactions)
            const streamTextParams: any = {
                model,
                abortSignal: signal,
                toolChoice: 'auto',
                // Allow enough steps for: tool call(s) + final answer synthesis
                stopWhen: stepCountIs(4),
                tools: finalTools,
            };

            // Prioritize messages for chat-style interactions, fallback to prompt
            if (messages && messages.length > 0) {
                streamTextParams.messages = messages;
            } else {
                streamTextParams.prompt = prompt;
            }

            const result = streamText(streamTextParams);

            // Create streaming response with proper headers for AI SDK v5
            const streamingResponse = result.toUIMessageStreamResponse({
                headers: {
                    'Content-Encoding': 'none', // Required for proxy compatibility
                    'Transfer-Encoding': 'chunked',
                    'Connection': 'keep-alive',
                },
                onError: (error) => {
                    log.error({ error: error.message }, 'Streaming response error');
                    return `An error occurred while processing your request: ${error.message}`;
                },
            });

            // Handle streaming chunks for backward compatibility with existing workflow
            let fullText = '';
            let _reasoning = ''; // For future use with reasoning streaming

            for await (const chunk of result.textStream) {
                fullText += chunk;
                chunkBuffer.add(chunk);

                // Send incremental updates through existing events system
                events?.update('answer', (current) => ({
                    ...current,
                    text: chunk,
                    status: 'PENDING' as const,
                }));
            }

            // Handle tool calls and reasoning
            for await (const part of result.fullStream) {
                switch (part.type) {
                    case 'reasoning':
                        _reasoning += part.textDelta || '';
                        reasoningBuffer.add(part.textDelta || '');
                        break;
                    case 'tool-call':
                        // Handle tool calls through existing system
                        const toolCall = {
                            toolCallId: part.toolCallId,
                            toolName: part.toolName,
                            input: part.args,
                        };
                        // Trigger existing tool call handling
                        events?.update('tool-call', (_prev) => toolCall);
                        break;
                    case 'tool-result':
                        const toolResult = {
                            toolCallId: part.toolCallId,
                            toolName: part.toolName,
                            output: part.result,
                        };
                        events?.update('tool-result', (_prev) => toolResult);
                        break;
                }
            }

            response = fullText;

            // Return the streaming response
            return streamingResponse;

            // Handle PDF-specific errors with enhanced messaging
            if (hasPDFAttachment) {
                const pdfError = handlePDFProcessingError(error);

                log.error('PDF processing error', {
                    type: pdfError.type,
                    message: pdfError.message,
                    userMessage: pdfError.userMessage,
                });

                // Send error event with enhanced error information
                events?.update('error', (_prev) => ({
                    error: pdfError.userMessage,
                    suggestion: pdfError.suggestion,
                    type: pdfError.type,
                    status: 'ERROR',
                }));

                // Also update the answer with error information
                events?.update('answer', (prev) => ({
                    ...prev,
                    text:
                        `I'm sorry, but I encountered an issue processing your PDF document: ${pdfError.userMessage}\n\n${pdfError.suggestion}`,
                    status: 'ERROR',
                }));

                // End buffers and return
                reasoningBuffer.end();
                chunkBuffer.end();
                return;
            }

            // Provide more descriptive error messages for API key issues
            if (error instanceof Error) {
                const errorMessage = error.message.toLowerCase();
                if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
                    const modelInfo = models.find((m) => m.id === model);
                    if (modelInfo) {
                        const providerName = modelInfo.provider;
                        events?.update('error', (_prev) => ({
                            error:
                                `API key required for ${modelInfo.name}. Please add your ${providerName} API key in Settings.`,
                            suggestion:
                                `Go to Settings → API Keys and add your ${providerName} API key to use this model.`,
                            type: 'API_KEY_ERROR',
                            status: 'ERROR',
                        }));

                        // Also update the answer with error information
                        events?.update('answer', (prev) => ({
                            ...prev,
                            text:
                                `I'm sorry, but I need an API key for ${modelInfo.name} to continue. Please add your ${providerName} API key in Settings.`,
                            status: 'ERROR',
                        }));

                        // End buffers and return
                        reasoningBuffer.end();
                        chunkBuffer.end();
                        return;
                    }
                }

                // Handle tool errors specifically
                if (errorMessage.includes('tool')) {
                    events?.update('tool-error', (_prev) => ({
                        error: error.message,
                        status: 'ERROR',
                    }));
                }
            }

            // For non-PDF errors, re-throw to use existing error handling
            throw error;
        } finally {
            reasoningBuffer.end();
            chunkBuffer.end();
        }

        let finalResponse = response;

        // Fallback: if model didn't produce a response but we have a math result,
        // ask the model to briefly explain and present the result as markdown
        if ((!finalResponse || finalResponse.trim().length === 0) && lastMathResult) {
            try {
                const fallbackPrompt = `You performed a mathematical calculation using tool "${
                    lastMathResult.toolName || 'math_calculator'
                }" and obtained this JSON output. Write a concise, user-friendly markdown answer that:

1) States the final numeric result clearly (bold the number)
2) Shows the minimal steps, if helpful
3) Avoids mentioning internal tools or JSON

Tool output JSON:\n\n${
                    typeof lastMathResult.result === 'string'
                        ? lastMathResult.result
                        : JSON.stringify(lastMathResult.result)
                }`;

                const fallback = await generateText({
                    model,
                    prompt: fallbackPrompt,
                    signal,
                    toolChoice: 'none',
                    stopWhen: stepCountIs(1),
                    byokKeys: context?.get('apiKeys'),
                    thinkingMode: context?.get('thinkingMode'),
                    userTier: context?.get('userTier'),
                    userId: context?.get('userId'),
                    mode: context?.get('mode'),
                });

                // Debug the fallback response if in development
                if (process.env.NODE_ENV === 'development') {
                    const { debugAIResponse } = await import('../../utils/debug-utils');
                    debugAIResponse(
                        { warnings: [], request: { body: null } },
                        'Fallback generateText',
                    );
                }

                if (fallback && fallback.trim().length > 0) {
                    finalResponse = fallback;
                }
            } catch (fallbackError) {
                log.warn(
                    {
                        error: fallbackError instanceof Error
                            ? fallbackError.message
                            : fallbackError,
                    },
                    'Math fallback post-processing failed',
                );
            }
        }

        log.debug('🏁 Final response update', {
            finalResponseLength: finalResponse?.length || 0,
            finalResponsePreview: finalResponse?.substring(0, 100) + '...',
            threadItemId: context?.get('threadItemId'),
        });

        events?.update('answer', (prev) => ({
            ...prev,
            text: finalResponse, // Set the complete final text
            fullText: finalResponse, // Also set fullText for compatibility
            status: 'COMPLETED',
        }));

        context.update('answer', (_) => finalResponse);

        events?.update('status', (_prev) => 'COMPLETED');

        const onFinish = context.get('onFinish');
        if (onFinish) {
            onFinish({
                answer: response,
                threadId: context.get('threadId'),
                threadItemId: context.get('threadItemId'),
            });
        }
        return;
    },
    onError: handleError,
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
