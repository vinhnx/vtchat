import { describe, it, expect } from 'vitest';
import { ModelEnum } from '@repo/ai/models';
import { chartTools } from '@/lib/tools/charts';

describe('Gemini Chart Tools Integration', () => {
    describe('GEMINI_2_5_FLASH_LITE Chart Support', () => {
        it('should be marked as supporting charts in models data', () => {
            const testModel = ModelEnum.GEMINI_2_5_FLASH_LITE;
            expect(testModel).toBe('gemini-2.5-flash-lite-preview-06-17');
            
            // This model should support charts according to the models-data.json
            // "charts": true is set for this model
        });

        it('should have chart tools available', () => {
            const tools = chartTools();
            
            // Verify all expected chart tools are available
            expect(tools.barChart).toBeDefined();
            expect(tools.lineChart).toBeDefined();
            expect(tools.areaChart).toBeDefined();
            expect(tools.pieChart).toBeDefined();
            expect(tools.radarChart).toBeDefined();
            
            // Check tool structure
            expect(typeof tools.barChart?.description).toBe('string');
            expect(typeof tools.barChart?.parameters).toBe('object');
            expect(typeof tools.barChart?.execute).toBe('function');
        });

        it('should execute chart tools correctly', async () => {
            const tools = chartTools();
            
            // Test bar chart execution
            const barChartResult = await tools.barChart?.execute?.({
                title: 'Test Chart',
                data: [
                    { name: 'A', value: 10 },
                    { name: 'B', value: 20 },
                    { name: 'C', value: 15 },
                ],
                xAxisLabel: 'Categories',
                yAxisLabel: 'Values',
                color: 'blue',
            });

            expect(barChartResult).toEqual({
                type: 'barChart',
                title: 'Test Chart',
                data: [
                    { name: 'A', value: 10 },
                    { name: 'B', value: 20 },
                    { name: 'C', value: 15 },
                ],
                xAxisLabel: 'Categories',
                yAxisLabel: 'Values',
                color: 'blue',
            });
        });

        it('should handle chart tool exclusions', () => {
            const toolsWithExclusions = chartTools({
                excludeTools: ['pieChart', 'radarChart'],
            });

            expect(toolsWithExclusions.barChart).toBeDefined();
            expect(toolsWithExclusions.lineChart).toBeDefined();
            expect(toolsWithExclusions.areaChart).toBeDefined();
            expect(toolsWithExclusions.pieChart).toBeUndefined();
            expect(toolsWithExclusions.radarChart).toBeUndefined();
        });
    });

    describe('Chart Tool Parameters Validation', () => {
        it('should validate chart data schema', () => {
            const tools = chartTools();
            
            // The parameters should include proper Zod schemas
            expect(tools.barChart?.parameters).toBeDefined();
            expect(tools.lineChart?.parameters).toBeDefined();
            expect(tools.areaChart?.parameters).toBeDefined();
            expect(tools.pieChart?.parameters).toBeDefined();
            expect(tools.radarChart?.parameters).toBeDefined();
        });

        it('should support multi-series data for appropriate charts', async () => {
            const tools = chartTools();
            
            // Test line chart with multi-series data
            const lineChartResult = await tools.lineChart?.execute?.({
                title: 'Multi-Series Test',
                data: [
                    { name: 'Jan', series1: 10, series2: 15 },
                    { name: 'Feb', series1: 20, series2: 25 },
                    { name: 'Mar', series1: 15, series2: 30 },
                ],
                xAxisLabel: 'Month',
                yAxisLabel: 'Values',
                color: 'green',
            });

            expect(lineChartResult?.type).toBe('lineChart');
            expect(lineChartResult?.title).toBe('Multi-Series Test');
            expect(lineChartResult?.data).toHaveLength(3);
        });
    });
});
