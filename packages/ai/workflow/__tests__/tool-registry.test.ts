import { describe, expect, test, vi } from 'vitest';
import { UserTier } from '@repo/shared/constants/user-tiers';
import {
    getAllToolDescriptions,
    getAvailableTools,
    getToolById,
    hasToolAccess,
    TOOL_REGISTRY,
} from '../tool-registry';

describe('Tool Registry', () => {
    test('should have all expected tools', () => {
        expect(TOOL_REGISTRY).toHaveLength(6);

        const toolIds = TOOL_REGISTRY.map((tool) => tool.id);
        expect(toolIds).toContain('web-search');
        expect(toolIds).toContain('calculator');
        expect(toolIds).toContain('charts');
    });

    test('should have proper tool structure', () => {
        for (const tool of TOOL_REGISTRY) {
            expect(tool).toHaveProperty('id');
            expect(tool).toHaveProperty('name');
            expect(tool).toHaveProperty('description');
            expect(tool).toHaveProperty('tier');
            expect(tool).toHaveProperty('activate');
            expect(tool).toHaveProperty('keywords');
            expect(tool).toHaveProperty('examples');

            expect(typeof tool.id).toBe('string');
            expect(typeof tool.name).toBe('string');
            expect(typeof tool.description).toBe('string');
            expect([UserTier.FREE, UserTier.PLUS]).toContain(tool.tier);
            expect(typeof tool.activate).toBe('function');
            expect(Array.isArray(tool.keywords)).toBe(true);
            expect(Array.isArray(tool.examples)).toBe(true);
        }
    });

    describe('getToolById', () => {
        test('should return tool when found', () => {
            const tool = getToolById('calculator');
            expect(tool).toBeDefined();
            expect(tool?.id).toBe('calculator');
            expect(tool?.name).toBe('Math Calculator');
        });

        test('should return undefined when not found', () => {
            const tool = getToolById('nonexistent');
            expect(tool).toBeUndefined();
        });
    });

    describe('getAvailableTools', () => {
        test('should return only FREE tools for free tier', () => {
            const tools = getAvailableTools(UserTier.FREE);
            expect(tools.every((tool) => tool.tier === UserTier.FREE)).toBe(true);

            const toolIds = tools.map((tool) => tool.id);
            expect(toolIds).toContain('web-search');
            expect(toolIds).toContain('calculator');
            expect(toolIds).toContain('charts'); // Charts now FREE
        });

        test('should return all tools for PLUS tier', () => {
            const tools = getAvailableTools(UserTier.PLUS);
            expect(tools).toHaveLength(TOOL_REGISTRY.length);

            const toolIds = tools.map((tool) => tool.id);
            expect(toolIds).toContain('web-search');
            expect(toolIds).toContain('calculator');
            expect(toolIds).toContain('charts');
        });

        test('should default to FREE tier when no tier specified', () => {
            const tools = getAvailableTools();
            expect(tools.every((tool) => tool.tier === UserTier.FREE)).toBe(true);
        });
    });

    describe('hasToolAccess', () => {
        test('should allow FREE tools for free users', () => {
            expect(hasToolAccess('web-search', UserTier.FREE)).toBe(true);
            expect(hasToolAccess('calculator', UserTier.FREE)).toBe(true);
        });

        test('should allow charts for free users (charts now FREE)', () => {
            expect(hasToolAccess('charts', UserTier.FREE)).toBe(true);
        });

        test('should allow all tools for PLUS users', () => {
            expect(hasToolAccess('web-search', UserTier.PLUS)).toBe(true);
            expect(hasToolAccess('calculator', UserTier.PLUS)).toBe(true);
            expect(hasToolAccess('charts', UserTier.PLUS)).toBe(true);
        });

        test('should return false for nonexistent tools', () => {
            expect(hasToolAccess('nonexistent', UserTier.FREE)).toBe(false);
            expect(hasToolAccess('nonexistent', UserTier.PLUS)).toBe(false);
        });

        test('should default to FREE tier when no tier specified', () => {
            expect(hasToolAccess('charts')).toBe(true); // Charts now FREE tier
            expect(hasToolAccess('calculator')).toBe(true); // FREE tool
        });
    });

    describe('getAllToolDescriptions', () => {
        test('should return descriptions for all tools', () => {
            const descriptions = getAllToolDescriptions();
            expect(descriptions).toHaveLength(TOOL_REGISTRY.length);

            for (const desc of descriptions) {
                expect(desc).toHaveProperty('id');
                expect(desc).toHaveProperty('text');
                expect(typeof desc.id).toBe('string');
                expect(typeof desc.text).toBe('string');
                expect(desc.text.length).toBeGreaterThan(0);
            }
        });

        test('should combine description, keywords, and examples', () => {
            const descriptions = getAllToolDescriptions();
            const calculatorDesc = descriptions.find((d) => d.id === 'calculator');

            expect(calculatorDesc).toBeDefined();
            expect(calculatorDesc!.text).toContain('mathematical calculations');
            expect(calculatorDesc!.text).toContain('calculate'); // keyword
            expect(calculatorDesc!.text).toContain('solve'); // keyword
            expect(calculatorDesc!.text).toContain('15% of 1000'); // example
        });
    });

    describe('tool activation functions', () => {
        test('should properly activate tools on context', () => {
            const mockContext = {
                set: vi.fn(),
            };

            const webSearchTool = getToolById('web-search');
            const calculatorTool = getToolById('calculator');
            const chartsTool = getToolById('charts');

            webSearchTool?.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith('webSearch', true);

            calculatorTool?.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith('mathCalculator', true);

            chartsTool?.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith('charts', true);
        });
    });
});
