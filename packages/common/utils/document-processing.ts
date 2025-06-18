import { ChatMode } from '@repo/shared/config';
import { GEMINI_MODELS } from '@repo/shared/constants/document-upload';

/**
 * Check if a chat mode corresponds to a Gemini model
 */
export const isGeminiModel = (chatMode: ChatMode): boolean => {
    const geminiModelStrings = GEMINI_MODELS as readonly string[];
    return geminiModelStrings.includes(chatMode as string);
};

/**
 * Check if there are active document processing tool calls
 */
export const hasDocumentProcessingToolCalls = (toolCalls?: Record<string, any>): boolean => {
    if (!toolCalls) return false;

    return Object.values(toolCalls).some(
        toolCall =>
            toolCall.toolName &&
            (toolCall.toolName.includes('document') ||
                toolCall.toolName.includes('file') ||
                toolCall.toolName.includes('pdf') ||
                toolCall.toolName.includes('read'))
    );
};

/**
 * Check if document processing is completed
 */
export const hasCompletedDocumentProcessing = (toolResults?: Record<string, any>): boolean => {
    if (!toolResults) return false;

    return Object.values(toolResults).some(
        result =>
            result.toolName &&
            (result.toolName.includes('document') ||
                result.toolName.includes('file') ||
                result.toolName.includes('pdf') ||
                result.toolName.includes('read'))
    );
};
