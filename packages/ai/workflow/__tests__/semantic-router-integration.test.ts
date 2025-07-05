import { describe, test, expect, vi } from 'vitest';
import { cosine } from '../utils/embeddings';
import { TOOL_REGISTRY, getToolById, hasToolAccess, getAvailableTools } from '../tool-registry';

describe('Semantic Router Integration', () => {
    describe('cosine similarity', () => {
        test('should calculate similarity correctly', () => {
            const vectorA = [1, 0, 0];
            const vectorB = [1, 0, 0];
            expect(cosine(vectorA, vectorB)).toBeCloseTo(1.0);
        });

        test('should handle different vectors', () => {
            const vectorA = [1, 0, 0];
            const vectorB = [0, 1, 0];
            expect(cosine(vectorA, vectorB)).toBeCloseTo(0.0);
        });
    });

    describe('tool registry', () => {
        test('should have required tools', () => {
            expect(getToolById('calculator')).toBeDefined();
            expect(getToolById('web-search')).toBeDefined();
            expect(getToolById('charts')).toBeDefined();
        });

        test('should respect tier access', () => {
            expect(hasToolAccess('calculator', 'FREE')).toBe(true);
            expect(hasToolAccess('web-search', 'FREE')).toBe(true);
            expect(hasToolAccess('charts', 'FREE')).toBe(true);
            expect(hasToolAccess('charts', 'PLUS')).toBe(true);
        });

        test('should filter tools by tier', () => {
            const freeTools = getAvailableTools('FREE');
            const plusTools = getAvailableTools('PLUS');

            // Now all tools are FREE tier, so lengths should be equal
            expect(freeTools.length).toBe(plusTools.length);
            expect(plusTools.length).toBe(TOOL_REGISTRY.length);
        });
    });

    describe('tool activation', () => {
        test('should activate tools correctly', () => {
            const mockContext = {
                set: vi.fn(),
            };

            const calculatorTool = getToolById('calculator');
            expect(calculatorTool).toBeDefined();

            calculatorTool!.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith('mathCalculator', true);
        });
    });
});
