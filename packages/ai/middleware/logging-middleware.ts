import type { LanguageModelV1StreamPart } from '@ai-sdk/provider';
import { log } from '@repo/shared/logger';
import type { LanguageModelV1Middleware } from 'ai';

/**
 * Logging middleware that logs parameters and generated text of language model calls.
 * Useful for debugging and monitoring AI interactions.
 */
export const loggingMiddleware: LanguageModelV1Middleware = {
    wrapGenerate: async ({ doGenerate, params }) => {
        log.info('Language Model Generate Called', {
            params: JSON.stringify(params, null, 2),
        });

        const result = await doGenerate();

        log.info('Language Model Generate Completed', {
            textLength: result.text?.length || 0,
            finishReason: result.finishReason,
            usage: result.usage,
        });

        return result;
    },

    wrapStream: async ({ doStream, params }) => {
        log.info('Language Model Stream Called', {
            params: JSON.stringify(params, null, 2),
        });

        const { stream, ...rest } = await doStream();

        let generatedText = '';
        const textBlocks = new Map<string, string>();

        const transformStream = new TransformStream<
            LanguageModelV1StreamPart,
            LanguageModelV1StreamPart
        >({
            transform(chunk, controller) {
                switch (chunk.type) {
                    case 'text-delta': {
                        const existing = textBlocks.get('default') || '';
                        const delta = (chunk as any).textDelta ?? (chunk as any).delta ?? '';
                        textBlocks.set('default', existing + delta);
                        generatedText += delta;
                        break;
                    }
                    default: {
                        // pass through other chunk types unchanged
                        break;
                    }
                }

                controller.enqueue(chunk);
            },

            flush() {
                log.info('Language Model Stream Completed', {
                    generatedTextLength: generatedText.length,
                });
            },
        });

        return {
            stream: stream.pipeThrough(transformStream),
            ...rest,
        };
    },
};
