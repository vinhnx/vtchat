import { describe, test, expect } from 'vitest';
import { TOOL_REGISTRY } from '../tool-registry';

// Basic tests for the semantic tool router task structure

describe('SemanticToolRouter', () => {
    test('should have all required tools in registry', () => {
        expect(TOOL_REGISTRY).toBeDefined();
        expect(TOOL_REGISTRY.length).toBeGreaterThan(0);

        // Check that required tools exist
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

            expect(typeof tool.activate).toBe('function');
            expect(Array.isArray(tool.keywords)).toBe(true);
            expect(Array.isArray(tool.examples)).toBe(true);
        }
    });
});
