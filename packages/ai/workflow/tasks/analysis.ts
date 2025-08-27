import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { getFormattingInstructions } from '../../config/formatting-guidelines';
import { getModelFromChatMode, ModelEnum } from '../../models';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    ChunkBuffer,
    generateText,
    getHumanizedDate,
    handleError,
    selectAvailableModel,
    sendEvents,
} from '../utils';

export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'analysis',
    execute: async ({ events, context, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const prevSummaries = context?.get('summaries') || [];
        const { updateStep, nextStepId, addSources } = sendEvents(events);
        const stepId = nextStepId();
        const prompt = `


                # Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Analyst tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report.

You gonna perform pre-writing analysis of the research findings.


## Research Materials

<research_findings>
${
            prevSummaries
                ?.map(
                    (s, index) => `

## Finding ${index + 1}

${s}

`,
                )
                .join('\n\n\n')
        }
</research_findings>


## Analysis Instructions
- Analyze the research findings one by one and highlight the most important information which will be used to compose a comprehensive report.
- Document your analysis in a structured format that will serve as the foundation for creating a comprehensive report.

${getFormattingInstructions('analysis')}

                `;

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (chunk: string, fullText: string) => {
                updateStep({
                    stepId,
                    stepStatus: 'PENDING',
                    text: chunk,
                    subSteps: {
                        reasoning: { status: 'PENDING', data: fullText },
                    },
                });
            },
        });

        const mode = context?.get('mode') || '';
        // For Deep Research workflow, select available model with fallback mechanism
        const baseModel = mode === ChatMode.Deep
            ? ModelEnum.GEMINI_2_5_FLASH
            : getModelFromChatMode(mode);
        const model = selectAvailableModel(baseModel, context?.get('apiKeys'));

        // Choose between messages (for chat) or prompt (for single interactions) - AI SDK 5.0 compatibility
        const generateTextParams: any = {
            model,
            signal,
            byokKeys: context?.get('apiKeys'),
            thinkingMode: context?.get('thinkingMode'),
            userTier: context?.get('userTier'),
            userId: context?.get('userId'),
            mode: context?.get('mode'),
            onReasoning: (reasoning) => {
                chunkBuffer.add(reasoning);
            },
            onReasoningDetails: (details) => {
                updateStep({
                    stepId,
                    stepStatus: 'COMPLETED',
                    subSteps: {
                        reasoningDetails: {
                            status: 'COMPLETED',
                            data: details,
                        },
                    },
                });
            },
        };

        // Prioritize messages for chat-style interactions, fallback to prompt
        if (messages && messages.length > 0) {
            // Ensure messages are properly formatted for AI SDK v5
            const validMessages = messages.filter(msg =>
                msg
                && msg.role
                && msg.hasOwnProperty('content') // Ensure content property exists
                && (msg.content || (Array.isArray(msg.content) && msg.content.length > 0))
            );

            if (validMessages.length > 0) {
                // Add system message if prompt exists and is not empty
                const systemMessage = prompt && prompt.trim()
                    ? {
                        role: 'system' as const,
                        content: prompt,
                    }
                    : null;

                generateTextParams.messages = systemMessage
                    ? [systemMessage, ...validMessages]
                    : validMessages;
            } else {
                // No valid messages, use prompt instead
                generateTextParams.prompt = prompt;
            }
        } else {
            generateTextParams.prompt = prompt;
        }

        const text = await generateText(generateTextParams);

        chunkBuffer.flush();

        updateStep({
            stepId,
            stepStatus: 'COMPLETED',
            subSteps: {
                reasoning: { status: 'COMPLETED' },
            },
        });

        addSources(context?.get('sources') || []);

        return {
            queries: [],
            analysis: text,
            stepId,
        };
    },
    onError: handleError,
    route: () => 'writer',
});
