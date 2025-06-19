import { describe, it, expect, vi } from 'vitest';
import { supportsReasoning, getReasoningType } from '../models';
import { ModelEnum } from '../models';

describe('Reasoning Support', () => {
    describe('supportsReasoning', () => {
        it('should return true for Gemini 2.5 models', () => {
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_FLASH)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_PRO)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_FLASH_LITE)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_FLASH_PREVIEW)).toBe(true);
            expect(supportsReasoning(ModelEnum.GEMINI_2_5_PRO_PREVIEW)).toBe(true);
        });

        it('should return true for DeepSeek reasoning models', () => {
            expect(supportsReasoning(ModelEnum.Deepseek_R1)).toBe(true);
            expect(supportsReasoning(ModelEnum.DEEPSEEK_R1_FREE)).toBe(true);
            expect(supportsReasoning(ModelEnum.DEEPSEEK_R1_0528_FREE)).toBe(true);
        });

        it('should return true for Anthropic reasoning models', () => {
            expect(supportsReasoning(ModelEnum.CLAUDE_4_SONNET)).toBe(true);
            expect(supportsReasoning(ModelEnum.CLAUDE_4_OPUS)).toBe(true);
        });

        it('should return false for non-reasoning models', () => {
            expect(supportsReasoning(ModelEnum.GEMINI_2_0_FLASH)).toBe(false);
            expect(supportsReasoning(ModelEnum.GPT_4o)).toBe(false);
        });
    });

    describe('getReasoningType', () => {
        it('should return gemini-thinking for Gemini models', () => {
            expect(getReasoningType(ModelEnum.GEMINI_2_5_FLASH)).toBe('gemini-thinking');
            expect(getReasoningType(ModelEnum.GEMINI_2_5_PRO)).toBe('gemini-thinking');
        });

        it('should return deepseek-reasoning for DeepSeek models', () => {
            expect(getReasoningType(ModelEnum.Deepseek_R1)).toBe('deepseek-reasoning');
            expect(getReasoningType(ModelEnum.DEEPSEEK_R1_FREE)).toBe('deepseek-reasoning');
        });

        it('should return anthropic-reasoning for Anthropic models', () => {
            expect(getReasoningType(ModelEnum.CLAUDE_4_SONNET)).toBe('anthropic-reasoning');
            expect(getReasoningType(ModelEnum.CLAUDE_4_OPUS)).toBe('anthropic-reasoning');
        });

        it('should return none for non-reasoning models', () => {
            expect(getReasoningType(ModelEnum.GEMINI_2_0_FLASH)).toBe('none');
            expect(getReasoningType(ModelEnum.GPT_4o)).toBe('none');
        });
    });
});

describe('Reasoning Details Types', () => {
    it('should handle text reasoning details', () => {
        const textDetail = {
            type: 'text' as const,
            text: 'Let me think about this step by step...',
            signature: 'reasoning-step-1'
        };

        expect(textDetail.type).toBe('text');
        expect(textDetail.text).toBeDefined();
        expect(textDetail.signature).toBeDefined();
    });

    it('should handle redacted reasoning details', () => {
        const redactedDetail = {
            type: 'redacted' as const,
            data: 'sensitive reasoning content'
        };

        expect(redactedDetail.type).toBe('redacted');
        expect(redactedDetail.data).toBeDefined();
    });
});

describe('Reasoning Parts', () => {
    it('should handle reasoning parts in messages', () => {
        const messageParts = [
            {
                type: 'text' as const,
                text: 'Here is my response:'
            },
            {
                type: 'reasoning' as const,
                details: [
                    {
                        type: 'text' as const,
                        text: 'First, I need to analyze the question...'
                    },
                    {
                        type: 'redacted' as const
                    }
                ]
            }
        ];

        const textPart = messageParts[0];
        const reasoningPart = messageParts[1];

        expect(textPart.type).toBe('text');
        expect(textPart.text).toBeDefined();

        expect(reasoningPart.type).toBe('reasoning');
        expect(reasoningPart.details).toHaveLength(2);
        expect(reasoningPart.details![0].type).toBe('text');
        expect(reasoningPart.details![1].type).toBe('redacted');
    });
});
