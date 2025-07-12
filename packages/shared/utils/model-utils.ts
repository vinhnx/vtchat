import { ModelEnum } from '@repo/ai/models';
import { ChatMode } from '../config';

/**
 * All Gemini ChatMode values
 */
export const GEMINI_CHAT_MODES = [
    ChatMode.Deep,
    ChatMode.Pro,
    ChatMode.GEMINI_2_5_PRO,
    ChatMode.GEMINI_2_5_FLASH,
    ChatMode.GEMINI_2_5_FLASH_LITE,
] as const;

/**
 * All Gemini ModelEnum values
 */
export const GEMINI_MODEL_ENUMS = [
    ModelEnum.GEMINI_2_5_FLASH_LITE,
    ModelEnum.GEMINI_2_5_FLASH,
    ModelEnum.GEMINI_2_5_PRO,
] as const;

/**
 * All Gemini embedding models
 */
export const GEMINI_EMBEDDING_MODELS = [
    'text-embedding-004',
    'text-embedding-preview-0409',
    'text-embedding-001',
] as const;

/**
 * Unified constant for Gemini ModelEnum values used across the codebase
 * Use this instead of hardcoded arrays
 */
export const GEMINI_MODEL_ENUMS_ARRAY = GEMINI_MODEL_ENUMS;

/**
 * Unified function to check if a model is a Gemini model
 *
 * @param model - Can be ChatMode, ModelEnum, or embedding model string
 * @returns boolean indicating if the model is a Gemini model
 */
export function isGeminiModel(model: ChatMode | ModelEnum | string): boolean {
    // Check for ChatMode
    if (GEMINI_CHAT_MODES.includes(model as ChatMode)) {
        return true;
    }

    // Check for ModelEnum
    if (GEMINI_MODEL_ENUMS.includes(model as ModelEnum)) {
        return true;
    }

    // Check for embedding models
    if (GEMINI_EMBEDDING_MODELS.includes(model as any)) {
        return true;
    }

    // Check for string patterns (fallback for any model ID containing 'gemini')
    if (typeof model === 'string' && model.toLowerCase().includes('gemini')) {
        return true;
    }

    return false;
}

/**
 * Check if a ChatMode corresponds to a Gemini model
 * @deprecated Use isGeminiModel instead
 */
export const isGeminiChatMode = (chatMode: ChatMode): boolean => {
    return isGeminiModel(chatMode);
};

/**
 * Check if a ModelEnum corresponds to a Gemini model
 * @deprecated Use isGeminiModel instead
 */
export const isGeminiModelEnum = (modelEnum: ModelEnum): boolean => {
    return isGeminiModel(modelEnum);
};
