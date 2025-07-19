/**
 * AI SDK v5 Migration Test
 *
 * This script tests the core functionality after migrating to AI SDK v5
 * to ensure that tool calling, chart generation, and other features work correctly.
 */

import { describe, it, expect } from 'vitest';
import { chartTools } from '../../lib/tools/charts';
import { calculatorTools } from '../../lib/tools/math';

describe('AI SDK v5 Migration Verification', () => {
    it('should have chart tools with inputSchema property', () => {
        const charts = chartTools();

        // Check if tools have the new inputSchema property
        const barChart = charts.barChart;
        expect(barChart).toBeDefined();
        expect(barChart?.inputSchema).toBeDefined();
        expect(barChart?.description).toBeDefined();
        expect(typeof barChart?.execute).toBe('function');

        console.log('✅ Chart tools have proper AI SDK v5 structure');
    });

    it('should have calculator tools with inputSchema property', () => {
        const calc = calculatorTools();

        // Check if tools have the new inputSchema property
        const addTool = calc.add;
        expect(addTool).toBeDefined();
        expect(addTool?.inputSchema).toBeDefined();
        expect(addTool?.description).toBeDefined();
        expect(typeof addTool?.execute).toBe('function');

        console.log('✅ Calculator tools have proper AI SDK v5 structure');
    });

    it('should execute chart tools successfully', async () => {
        const charts = chartTools();
        const barChart = charts.barChart;

        expect(barChart).toBeDefined();

        // Test a simple chart creation
        const testData = {
            title: 'Test Chart',
            data: [
                { name: 'A', value: 10 },
                { name: 'B', value: 20 },
            ],
        };

        const result = await barChart!.execute(testData);
        expect(result).toBeDefined();

        console.log('✅ Chart tool execution successful');
    });

    it('should execute calculator tools successfully', async () => {
        const calc = calculatorTools();
        const addTool = calc.add;

        expect(addTool).toBeDefined();

        // Test a simple calculation
        const result = await addTool!.execute({ a: 5, b: 3 });
        expect(result).toEqual({ result: 8 });

        console.log('✅ Calculator tool execution successful (5 + 3 = 8)');
    });

    it('should have all tools properly migrated to AI SDK v5', () => {
        const charts = chartTools();
        const calc = calculatorTools();

        let allToolsValid = true;
        const issues: string[] = [];

        // Check all chart tools
        Object.entries(charts).forEach(([name, tool]) => {
            if (!tool.inputSchema) {
                issues.push(`${name} missing inputSchema`);
                allToolsValid = false;
            }
            if (!tool.description) {
                issues.push(`${name} missing description`);
                allToolsValid = false;
            }
            if (typeof tool.execute !== 'function') {
                issues.push(`${name} missing execute function`);
                allToolsValid = false;
            }
        });

        // Check some calculator tools
        ['add', 'subtract', 'multiply', 'divide'].forEach(name => {
            const tool = calc[name as keyof typeof calc];
            if (!tool || !tool.inputSchema) {
                issues.push(`${name} missing inputSchema`);
                allToolsValid = false;
            }
        });

        if (!allToolsValid) {
            console.log('❌ Issues found:', issues);
        }

        expect(allToolsValid).toBe(true);
        console.log('✅ All tools have proper AI SDK v5 structure');
    });

    it('should verify property migration from v4 to v5', () => {
        const charts = chartTools();
        const calc = calculatorTools();

        // Verify that old 'parameters' property doesn't exist
        Object.values(charts).forEach(tool => {
            expect((tool as any).parameters).toBeUndefined();
            expect(tool.inputSchema).toBeDefined();
        });

        Object.values(calc).forEach(tool => {
            if (tool) {
                expect((tool as any).parameters).toBeUndefined();
                expect(tool.inputSchema).toBeDefined();
            }
        });

        console.log('✅ Property migration from parameters to inputSchema verified');
    });
});
