import { createTask } from '@repo/orchestrator';
import { calculatorTools } from '../../../../apps/web/lib/tools/math';
import { chartTools } from '../../../../apps/web/lib/tools/charts';
import { getModelFromChatMode, supportsOpenAIWebSearch } from '../../models';
import { MATH_CALCULATOR_PROMPT } from '../../prompts/math-calculator';
import { getWebSearchTool } from '../../tools';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, getHumanizedDate, handleError } from '../utils';
import { logger } from '@repo/shared/logger';

const MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH = 6000;

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'completion',
    execute: async ({ events, context, signal, redirectTo }) => {
        if (!context) {
            throw new Error('Context is required but was not provided');
        }

        const customInstructions = context?.get('customInstructions');
        const mode = context.get('mode');
        const webSearch = context.get('webSearch') || false;
        const mathCalculator = context.get('mathCalculator') || false;
        const charts = context.get('charts') || false;

        let messages =
            context
                .get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];

        if (
            customInstructions &&
            customInstructions?.length < MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH
        ) {
            messages = [
                {
                    role: 'system',
                    content: `Today is ${getHumanizedDate()}. and current location is ${context.get('gl')?.city}, ${context.get('gl')?.country}. \n\n ${customInstructions}`,
                },
                ...messages,
            ];
        }

        const model = getModelFromChatMode(mode);

        // Check if model supports OpenAI web search when web search is enabled
        const supportsOpenAISearch = supportsOpenAIWebSearch(model);
        if (webSearch && !supportsOpenAISearch) {
            // For non-OpenAI models with web search, redirect to planner (or handle appropriately)
            redirectTo('planner');
            return;
        }

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
        Today is ${getHumanizedDate()}.
        ${mathCalculator ? MATH_CALCULATOR_PROMPT : ''}
        ${charts ? 'You can create charts and graphs to visualize data. Use chart tools when users ask for data visualization, trends, comparisons, or when displaying numerical data would be more effective as a visual chart.' : ''}
        `;

        const reasoningBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (_chunk: string, fullText: string) => {
                events?.update('steps', prev => ({
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
            onFlush: (text: string) => {
                events?.update('answer', current => ({
                    ...current,
                    text,
                    status: 'PENDING' as const,
                }));
            },
        });

        // Combine tools based on enabled features
        let tools: any = {};

        if (mathCalculator) {
            logger.info('🧮 Math calculator enabled, adding calculator tools...');
            const mathToolsObj = calculatorTools();
            logger.info('🔢 Available math tools:', { data: Object.keys(mathToolsObj) });
            tools = { ...tools, ...mathToolsObj };
        }

        if (charts) {
            logger.info('🎨 Charts enabled, adding chart tools...');
            const chartToolsObj = chartTools();
            logger.info('📊 Available chart tools:', { data: Object.keys(chartToolsObj) });
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
        logger.info('🔧 Final tools for AI:', { data: finalTools ? Object.keys(finalTools) : 'none' });

        const response = await generateText({
            model,
            messages,
            prompt,
            signal,
            toolChoice: 'auto',
            maxSteps: 2,
            tools: finalTools,
            byokKeys: context?.get('apiKeys'),
            thinkingMode: context?.get('thinkingMode'),
            onReasoning: (chunk, _fullText) => {
                reasoningBuffer.add(chunk);
            },
            onReasoningDetails: details => {
                events?.update('steps', prev => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: 'COMPLETED',
                        steps: {
                            ...prev?.[0]?.steps,
                            reasoningDetails: {
                                data: details,
                                status: 'COMPLETED',
                            },
                        },
                    },
                }));
            },
            onChunk: (chunk, _fullText) => {
                chunkBuffer.add(chunk);
            },
            onToolCall: toolCall => {
                logger.info('🔧 Tool call:', { toolName: toolCall.toolName, args: toolCall.args });
                // Send tool call event to UI
                events?.update('steps', prev => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: 'COMPLETED',
                        steps: {
                            ...prev?.[0]?.steps,
                            toolCall: {
                                data: {
                                    toolName: toolCall.toolName,
                                    args: toolCall.args,
                                    type:
                                        charts &&
                                        Object.keys(chartTools()).includes(toolCall.toolName)
                                            ? 'charts'
                                            : mathCalculator
                                              ? 'math_calculator'
                                              : 'unknown',
                                },
                                status: 'COMPLETED',
                            },
                        },
                    },
                }));

                // Also update toolCalls for threadItem
                events?.update('toolCalls', prev => [
                    ...(prev || []),
                    {
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName,
                        args: toolCall.args,
                    },
                ]);
            },
            onToolResult: toolResult => {
                logger.info('🔧 Tool result for:', { toolName: toolResult.toolName, result: toolResult.result });
                // Send tool result event to UI
                events?.update('steps', prev => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: 'COMPLETED',
                        steps: {
                            ...prev?.[0]?.steps,
                            toolResult: {
                                data: {
                                    result: toolResult.result,
                                    type:
                                        charts &&
                                        Object.keys(chartTools()).includes(
                                            toolResult.toolName || ''
                                        )
                                            ? 'charts'
                                            : mathCalculator
                                              ? 'math_calculator'
                                              : 'unknown',
                                },
                                status: 'COMPLETED',
                            },
                        },
                    },
                }));

                // Also update toolResults for threadItem
                events?.update('toolResults', prev => [
                    ...(prev || []),
                    {
                        toolCallId: toolResult.toolCallId,
                        toolName: toolResult.toolName || 'unknown',
                        result: toolResult.result,
                    },
                ]);
            },
        });

        reasoningBuffer.end();
        chunkBuffer.end();

        events?.update('answer', prev => ({
            ...prev,
            text: '',
            fullText: response,
            status: 'COMPLETED',
        }));

        context.update('answer', _ => response);

        events?.update('status', _prev => 'COMPLETED');

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