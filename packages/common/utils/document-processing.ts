import type { ChatMode } from '@repo/shared/config';
import { isGeminiModel } from '@repo/shared/utils';

/**
 * Check if a chat mode corresponds to a Gemini model
 * @deprecated Use isGeminiModel from @repo/shared/utils instead
 */
export const isGeminiModelDeprecated = (chatMode: ChatMode): boolean => {
    return isGeminiModel(chatMode);
};

// Re-export the unified function for backward compatibility
export { isGeminiModel };

/**
 * Check if there are active document processing tool calls
 */
export const hasDocumentProcessingToolCalls = (toolCalls?: Record<string, any>): boolean => {
    if (!toolCalls) return false;

    return Object.values(toolCalls).some(
        (toolCall) =>
            toolCall.toolName
            && (toolCall.toolName.includes('document')
                || toolCall.toolName.includes('file')
                || toolCall.toolName.includes('pdf')
                || toolCall.toolName.includes('read')),
    );
};

/**
 * Check if document processing is completed
 */
export const hasCompletedDocumentProcessing = (toolResults?: Record<string, any>): boolean => {
    if (!toolResults) return false;

    return Object.values(toolResults).some(
        (result) =>
            result.toolName
            && (result.toolName.includes('document')
                || result.toolName.includes('file')
                || result.toolName.includes('pdf')
                || result.toolName.includes('read')),
    );
};
