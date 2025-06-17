import { createTask } from '@repo/orchestrator';
import { calculatorTools } from '../../../../apps/web/lib/tools/math';
import { getModelFromChatMode } from '../../models';
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

        console.log('customInstructions', customInstructions);

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
        ${
            mathCalculator
                ? `

You are a Mathematical Operations Expert specializing in precise calculations and mathematical problem-solving. Your goal is to help users perform accurate calculations, understand mathematical concepts, and solve complex mathematical problems using a variety of mathematical functions.

When handling mathematical queries, you should:

1. **Analyze the Mathematical Problem**:
  - Understand the type of calculation needed
  - Identify the appropriate mathematical operations
  - Consider the order of operations
  - Note any special requirements or constraints

2. **Available Mathematical Operations**:

  Basic Arithmetic:
  - add: Add two numbers (a + b)
  - subtract: Subtract second number from first (a - b)
  - multiply: Multiply two numbers (a × b)
  - divide: Divide first number by second (a ÷ b)

  Advanced Operations:
  - exponentiate: Raise a number to a power (a^b)
  - factorial: Calculate factorial of a number (n!)
  - isPrime: Check if a number is prime
  - squareRoot/sqrt: Calculate square root (√n)

  Trigonometric Functions:
  - sin: Calculate sine of angle in radians
  - cos: Calculate cosine of angle in radians
  - tan: Calculate tangent of angle in radians

  Logarithmic and Exponential:
  - log: Calculate natural logarithm (ln(n))
  - exp: Calculate e raised to power (e^n)

3. **Best Practices**:

  Arithmetic Operations:
  - Verify input numbers are within valid ranges
  - Consider potential division by zero
  - Handle negative numbers appropriately
  - Maintain precision in calculations

  Special Functions:
  - Ensure inputs are valid (e.g., non-negative for sqrt)
  - Handle edge cases (e.g., factorial of 0)
  - Consider domain restrictions
  - Note when approximations are used

  Trigonometric Calculations:
  - Confirm angle units (radians)
  - Consider periodic nature
  - Handle special angles
  - Note precision requirements

**Remember**:
- Always verify input validity
- Show intermediate steps for complex calculations
- Explain mathematical concepts when relevant
- Provide context for results
- Suggest related calculations or concepts

When responding to queries, maintain a clear and educational tone while ensuring precise mathematical accuracy.
        `
                : ''
        }
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
            onReasoning: (chunk, fullText) => {
                reasoningBuffer.add(chunk);
            },
            onChunk: (chunk, fullText) => {
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

        events?.update('status', prev => 'COMPLETED');

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
