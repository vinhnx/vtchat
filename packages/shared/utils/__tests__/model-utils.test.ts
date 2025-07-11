import { describe, expect, it } from 'vitest';
import { isGeminiModel, GEMINI_MODEL_ENUMS_ARRAY, GEMINI_CHAT_MODES } from '../model-utils';
import { ChatMode } from '../../config';
import { ModelEnum } from '@repo/ai/models';

describe('isGeminiModel', () => {
    it('should return true for Gemini ChatMode values', () => {
        expect(isGeminiModel(ChatMode.Deep)).toBe(true);
        expect(isGeminiModel(ChatMode.Pro)).toBe(true);
        expect(isGeminiModel(ChatMode.GEMINI_2_5_PRO)).toBe(true);
        expect(isGeminiModel(ChatMode.GEMINI_2_5_FLASH)).toBe(true);
        expect(isGeminiModel(ChatMode.GEMINI_2_5_FLASH_LITE)).toBe(true);
    });

    it('should return false for non-Gemini ChatMode values', () => {
        expect(isGeminiModel(ChatMode.GPT_4o)).toBe(false);
        expect(isGeminiModel(ChatMode.CLAUDE_4_SONNET)).toBe(false);
        expect(isGeminiModel(ChatMode.DEEPSEEK_R1)).toBe(false);
        expect(isGeminiModel(ChatMode.O3)).toBe(false);
    });

    it('should return true for Gemini ModelEnum values', () => {
        expect(isGeminiModel(ModelEnum.GEMINI_2_5_PRO)).toBe(true);
        expect(isGeminiModel(ModelEnum.GEMINI_2_5_FLASH)).toBe(true);
        expect(isGeminiModel(ModelEnum.GEMINI_2_5_FLASH_LITE)).toBe(true);
    });

    it('should return false for non-Gemini ModelEnum values', () => {
        expect(isGeminiModel(ModelEnum.GPT_4o)).toBe(false);
        expect(isGeminiModel(ModelEnum.CLAUDE_4_SONNET)).toBe(false);
        expect(isGeminiModel(ModelEnum.Deepseek_R1)).toBe(false);
    });

    it('should return true for Gemini embedding models', () => {
        expect(isGeminiModel('text-embedding-004')).toBe(true);
        expect(isGeminiModel('text-embedding-preview-0409')).toBe(true);
        expect(isGeminiModel('text-embedding-001')).toBe(true);
    });

    it('should return true for string containing "gemini"', () => {
        expect(isGeminiModel('gemini-pro')).toBe(true);
        expect(isGeminiModel('gemini-flash')).toBe(true);
        expect(isGeminiModel('custom-gemini-model')).toBe(true);
        expect(isGeminiModel('GEMINI-TEST')).toBe(true);
    });

    it('should return false for strings not containing "gemini"', () => {
        expect(isGeminiModel('gpt-4')).toBe(false);
        expect(isGeminiModel('claude-3')).toBe(false);
        expect(isGeminiModel('text-embedding-ada')).toBe(false);
    });

    it('should handle edge cases', () => {
        expect(isGeminiModel('')).toBe(false);
        expect(isGeminiModel('gem')).toBe(false);
        expect(isGeminiModel('mini')).toBe(false);
    });

    it('should have correct constants exported', () => {
        expect(GEMINI_MODEL_ENUMS_ARRAY).toHaveLength(3);
        expect(GEMINI_MODEL_ENUMS_ARRAY).toContain(ModelEnum.GEMINI_2_5_PRO);
        expect(GEMINI_MODEL_ENUMS_ARRAY).toContain(ModelEnum.GEMINI_2_5_FLASH);
        expect(GEMINI_MODEL_ENUMS_ARRAY).toContain(ModelEnum.GEMINI_2_5_FLASH_LITE);

        expect(GEMINI_CHAT_MODES).toHaveLength(8);
        expect(GEMINI_CHAT_MODES).toContain(ChatMode.Deep);
        expect(GEMINI_CHAT_MODES).toContain(ChatMode.Pro);
        expect(GEMINI_CHAT_MODES).toContain(ChatMode.GEMINI_2_5_PRO);
    });
});
