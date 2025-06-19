import { createTask } from '@repo/orchestrator';
import { calculatorTools } from '../../../../apps/web/lib/tools/math';
import { getModelFromChatMode } from '../../models';
import { MATH_CALCULATOR_PROMPT } from '../../prompts/math-calculator';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, getHumanizedDate, handleError } from '../utils';

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

        if (webSearch) {
            redirectTo('quickSearch');
            return;
        }

        const model = getModelFromChatMode(mode);

        let prompt = `You are a helpful assistant that can answer questions and help with tasks.
        Today is ${getHumanizedDate()}.
        ${mathCalculator ? MATH_CALCULATOR_PROMPT : ''}
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

        const tools = mathCalculator ? calculatorTools() : undefined;

        const response = await generateText({
            model,
            messages,
            prompt,
            signal,
            toolChoice: 'auto',
            maxSteps: 2,
            tools,
            byokKeys: context?.get('apiKeys'),
            thinkingMode: context?.get('thinkingMode'),
            onReasoning: (chunk, _fullText) => {
                reasoningBuffer.add(chunk);
            },
            onReasoningDetails: (details) => {
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
                                    type: 'math_calculator',
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
                                    type: 'math_calculator',
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
