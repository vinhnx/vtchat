import type {
  LanguageModelV2Middleware,
  LanguageModelV2StreamPart,
} from '@ai-sdk/provider';
import { log } from '@repo/shared/logger';

/**
 * Logging middleware that logs parameters and generated text of language model calls.
 * Useful for debugging and monitoring AI interactions.
 */
export const loggingMiddleware: LanguageModelV2Middleware = {
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
      LanguageModelV2StreamPart,
      LanguageModelV2StreamPart
    >({
      transform(chunk, controller) {
        switch (chunk.type) {
          case 'text-start': {
            textBlocks.set(chunk.id, '');
            break;
          }
          case 'text-delta': {
            const existing = textBlocks.get(chunk.id) || '';
            textBlocks.set(chunk.id, existing + chunk.delta);
            generatedText += chunk.delta;
            break;
          }
          case 'text-end': {
            log.info(`Text block ${chunk.id} completed:`, {
              text: textBlocks.get(chunk.id),
            });
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