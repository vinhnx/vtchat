import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { log } from '@repo/shared/logger';
import { formatDate } from '@repo/shared/utils';
import { getFormattingInstructions } from '../../config/formatting-guidelines';
import { getModelFromChatMode, ModelEnum } from '../../models';
import { ContentMonitor } from '../../utils/content-monitor';
import type { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, handleError, selectAvailableModel, sendEvents } from '../utils';

export const writerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'writer',
    execute: async ({ events, context, data, signal }) => {
        const analysis = data?.analysis || '';

        const question = context?.get('question') || '';
        const summaries = context?.get('summaries') || [];
        const messages = context?.get('messages') || [];
        const { updateStep, nextStepId, updateAnswer, updateStatus } = sendEvents(events);

        log.info('📋 Writer task data:', {
            threadId: context?.get('threadId'),
            threadItemId: context?.get('threadItemId'),
            question,
            summariesCount: summaries?.length || 0,
            summariesPreview: summaries?.slice(0, 2).map(s => s?.substring(0, 50) + '...') || [],
            analysisLength: analysis?.length || 0,
        });
        const stepId = nextStepId();

        const currentDate = new Date();
        const humanizedDate = formatDate(currentDate, 'MMMM dd, yyyy, h:mm a');

        const prompt = `

    Today is ${humanizedDate}.
You are a Comprehensive Research Writer tasked with providing an extremely detailed and thorough writing about "${question}".
Your goal is to create a comprehensive report based on the research information provided.

First, carefully read and analyze the following research information:

<research_findings>
${
            summaries && summaries.length > 0
                ? summaries.map((summary) =>
                    `<finding>${summary || 'No content available'}</finding>`
                ).join('\n')
                : '<finding>No search results available</finding>'
        }
</research_findings>

<analysis>
${analysis}
</analysis>

## Report Requirements:
1. Structure and Organization:
   - Begin with a concise executive summary highlighting key developments
   - Organize content thematically with clear progression between topics, Group related information into coherent categories
   - Use a consistent hierarchical structure throughout
   - Conclude with analytical insights identifying patterns, implications, and future directions

2. Content and Analysis:
   - Provide specific details, data points, and technical information where relevant
   - Analyze the significance of key findings within the broader context
   - Make connections between related information across different sources
   - Maintain an objective, analytical tone throughout


3. Formatting Standards:
   - Highlight key figures, critical statistics, and significant findings with bold text
   - Construct balanced continuous paragraphs (4-5 sentences per paragraph not more than that) with logical flow instead of shorter sentences.
   - Use headings strategically only for thematic shifts depending on the question asked and content
   - Ensure proper spacing between sections for optimal readability

4. Citations:
   - Based on provided references in each findings, you must cite the sources in the report.
   - Use inline citations like [1] to reference the source
   - For example: According to recent findings [1][3], progress in this area has accelerated
   - When information appears in multiple findings, cite all relevant findings using multiple numbers
   - Integrate citations naturally without disrupting reading flow

Note: **Reference list at the end is not required.**

${getFormattingInstructions('writer')}
    `;

        if (stepId) {
            updateStep({
                stepId: stepId + 1,
                stepStatus: 'COMPLETED',
                subSteps: {
                    wrapup: { status: 'COMPLETED' },
                },
            });
        }
        // Initialize content monitor to prevent getting stuck on tables
        const contentMonitor = new ContentMonitor({
            onStuckDetected: (content, issue) => {
                updateAnswer({
                    text:
                        '\n\n**Note**: Switching to alternative formatting to improve readability...\n\n',
                    status: 'PENDING',
                });
            },
        });

        let fullContent = '';
        const chunkBuffer = new ChunkBuffer({
            threshold: 150,
            breakOn: ['\n\n', '.', '!', '?'],
            onFlush: (text: string) => {
                fullContent += text;

                // Monitor content for issues
                const check = contentMonitor.checkContent(fullContent);
                if (check.isStuck && check.suggestion) {
                    // Add suggestion to help redirect the AI
                    text += `\n\n*[Formatting note: ${check.suggestion}]*\n\n`;
                }

                updateAnswer({
                    text,
                    status: 'PENDING',
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
            onChunk: (chunk, _fullText) => {
                chunkBuffer.add(chunk);
            },
        };

        // Prioritize messages for chat-style interactions, fallback to prompt
        if (messages && messages.length > 0) {
            generateTextParams.messages = messages;
        } else {
            generateTextParams.prompt = prompt;
        }

        const answer = await generateText(generateTextParams);

        // Make sure to flush any remaining content
        chunkBuffer.flush();

        log.info('📝 Writer task completed:', {
            threadId: context?.get('threadId'),
            threadItemId: context?.get('threadItemId'),
            answerLength: answer?.length || 0,
            answerPreview: answer?.substring(0, 100) + '...' || 'empty',
            hasAnswer: !!answer,
        });

        // Update context with answer BEFORE routing decision
        context?.update('answer', (_) => answer);

        // Emit answer event BEFORE status update
        updateAnswer({
            text: '',
            finalText: answer,
            status: 'COMPLETED',
        });

        log.info('✅ updateAnswer called with finalText:', {
            finalTextLength: answer?.length || 0,
            status: 'COMPLETED',
        });

        // CRITICAL: Wait for the answer event to be processed
        // This ensures the answer reaches the client before workflow ends
        await new Promise(resolve => setTimeout(resolve, 200));

        context?.get('onFinish')?.({
            answer,
            threadId: context?.get('threadId'),
            threadItemId: context?.get('threadItemId'),
        });

        // Small delay to ensure answer event is processed before status update
        await new Promise(resolve => setTimeout(resolve, 100));

        updateStatus('COMPLETED');

        return answer;
    },
    onError: handleError,
    route: ({ context }) => {
        if (context?.get('showSuggestions') && !!context?.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
