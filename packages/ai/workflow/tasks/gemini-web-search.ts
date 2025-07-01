import { createTask } from '@repo/orchestrator';
import { getModelFromChatMode } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateTextWithGeminiSearch, getHumanizedDate, handleError, sendEvents } from '../utils';
import { log } from '@repo/shared/logger';

export const geminiWebSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'gemini-web-search',
    execute: async ({ data, events, context, signal }) => {
        const question = context?.get('question') || '';
        const stepId = data?.stepId;
        const gl = context?.get('gl');
        const { updateStep } = sendEvents(events);

        const prompt = `Please search for and provide comprehensive information to answer this question: "${question}"

The current date is: ${getHumanizedDate()}
${gl?.country ? `Location: ${gl?.country}` : ''}

Please include:
- Current and relevant information
- Specific facts and recent developments
- Source citations when available
- A comprehensive answer that directly addresses the question`;

        try {
            // Use the user's selected model
            const mode = context?.get('mode') || '';
            log.info('=== gemini-web-search EXECUTE START ===');
            log.info('Chat mode:', { data: mode });
            log.info('Context data:', {
                hasQuestion: !!question,
                questionLength: question?.length,
                hasStepId: stepId !== undefined,
                hasGl: !!gl,
                hasApiKeys: !!context?.get('apiKeys'),
                apiKeysKeys: context?.get('apiKeys')
                    ? Object.keys(context.get('apiKeys') || {})
                    : undefined,
            });

            const model = getModelFromChatMode(mode);
            log.info('Selected model result:', {
                model,
                modelType: typeof model,
            });

            if (!model) {
                log.error('No model found for mode:', { data: mode });
                throw new Error(`Invalid model for mode: ${mode}`);
            }

            log.info('Calling generateTextWithGeminiSearch with:', {
                model,
                promptLength: prompt.length,
                hasByokKeys: !!context?.get('apiKeys'),
                hasSignal: !!signal,
            });

            const result = await generateTextWithGeminiSearch({
                model,
                prompt,
                byokKeys: context?.get('apiKeys'),
                signal,
                thinkingMode: context?.get('thinkingMode'),
            });

            log.info('generateTextWithGeminiSearch result:', {
                hasResult: !!result,
                hasText: !!result?.text,
                textLength: result?.text?.length,
                hasSources: !!result?.sources,
                sourcesLength: result?.sources?.length,
                hasGroundingMetadata: !!result?.groundingMetadata,
            });

            // Update sources if available
            if (result.sources && result.sources.length > 0) {
                context?.update('sources', current => {
                    const existingSources = current ?? [];
                    const newSources = result.sources
                        ?.filter(
                            (source: any) =>
                                source &&
                                source.url &&
                                typeof source.url === 'string' &&
                                source.url.trim() !== '' &&
                                !existingSources.some(existing => existing.link === source.url)
                        )
                        .map((source: any, index: number) => ({
                            title: source.title || 'Web Search Result',
                            link: source.url,
                            snippet: source.description || '',
                            index: index + (existingSources?.length || 1),
                        }));
                    return [...existingSources, ...newSources];
                });
            }

            context?.update('summaries', current => [...(current ?? []), result.text]);

            // Mark step as completed
            if (stepId !== undefined) {
                updateStep({
                    stepId,
                    stepStatus: 'COMPLETED',
                    text: 'Web search completed successfully',
                    subSteps: {},
                });
            }

            log.info('=== gemini-web-search EXECUTE END ===');
            return {
                stepId,
                summary: result.text,
                sources: result.sources,
                groundingMetadata: result.groundingMetadata,
            };
        } catch (error: any) {
            log.error('=== gemini-web-search ERROR ===');
            log.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack,
                errorType: typeof error,
            });

            // Mark step as failed if there's an error
            if (stepId !== undefined) {
                updateStep({
                    stepId,
                    stepStatus: 'COMPLETED',
                    text: `Web search failed: ${error.message || 'Unknown error'}`,
                    subSteps: {},
                });
            }

            // Provide more user-friendly error messages
            if (error.message?.includes('API key')) {
                throw new Error(
                    'Gemini API key is required for web search. Please configure your API key in settings.'
                );
            } else if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
                throw new Error('Invalid Gemini API key. Please check your API key in settings.');
            } else if (error.message?.includes('forbidden') || error.message?.includes('403')) {
                throw new Error('Gemini API access denied. Please check your API key permissions.');
            } else if (error.message?.includes('rate limit') || error.message?.includes('429')) {
                throw new Error(
                    'Gemini API rate limit exceeded. Please try again in a few moments.'
                );
            } else if (error.message?.includes('undefined to object')) {
                throw new Error(
                    'Web search configuration error. Please try using a different model or check your settings.'
                );
            }

            throw new Error(
                `Web search failed: ${error.message || 'Please try again or use a different model.'}`
            );
        }
    },
    onError: handleError,
    route: () => 'analysis',
});
