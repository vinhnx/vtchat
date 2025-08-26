import { log } from '@repo/shared/logger';
import type { LanguageModelV1Middleware } from 'ai';

/**
 * Guardrails middleware that filters sensitive content from generated text.
 * Useful for ensuring safe and appropriate responses.
 */
export const guardrailsMiddleware: LanguageModelV1Middleware = {
    wrapGenerate: async ({ doGenerate }) => {
        const result = await doGenerate();

        // Apply content filtering to the generated text
        const filteredText = filterSensitiveContent(result.text || '');

        // Log if any filtering was applied
        if (filteredText !== result.text) {
            log.info('Applied content filtering to generated text', {
                originalLength: result.text?.length || 0,
                filteredLength: filteredText.length,
            });
        }

        return {
            ...result,
            text: filteredText,
        };
    },

    // Note: Streaming guardrails are difficult to implement because
    // you don't know the full content of the stream until it's finished.
    // For now, we'll just pass through the stream without filtering
    wrapStream: async ({ doStream }) => {
        log.info('Streaming request bypassing guardrails (not implemented for streaming)');
        return doStream();
    },
};

/**
 * Simple content filtering function that replaces sensitive content with placeholders.
 * In a real implementation, you might use a more sophisticated filtering approach.
 */
function filterSensitiveContent(text: string): string {
    // Example filtering rules - replace with your actual filtering logic
    return text
        // Filter potential PII (Personal Identifiable Information)
        .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED: SSN]') // Social Security Numbers
        .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '[REDACTED: CC]') // Credit Cards
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED: EMAIL]') // Email addresses
        .replace(
            /\b(?:\+\d{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
            '[REDACTED: PHONE]',
        ) // Phone numbers
        // Filter potentially harmful content
        .replace(/\b(drop database|delete from|truncate table)\b/gi, '[REDACTED: SQL COMMAND]'); // Add more filtering rules as needed
}
