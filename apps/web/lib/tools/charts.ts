import { type Tool, tool } from 'ai';
import { z } from 'zod';

type ChartTools = 'barChart' | 'lineChart' | 'areaChart' | 'pieChart' | 'radarChart';

const chartDataSchema = z.object({
    name: z.string().describe('Data point label'),
    value: z.number().describe('Data point value'),
});

const multiSeriesDataSchema = z.object({
    name: z.string().describe('Data point label'),
    series1: z.number().describe('First series value'),
    series2: z.number().optional().describe('Second series value'),
    series3: z.number().optional().describe('Third series value'),
});

export const chartTools = (config?: {
    excludeTools?: ChartTools[];
}): Partial<Record<ChartTools, Tool>> => {
    const tools: Partial<Record<ChartTools, Tool>> = {
        barChart: tool({
            description:
                'Create a bar chart with data points. Useful for comparing categorical data or showing distributions.',
            parameters: z.object({
                title: z.string().optional().describe('Chart title'),
                data: z
                    .array(chartDataSchema)
                    .optional()
                    .describe('Array of data points with name and value'),
                xAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('X-axis label'),
                yAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Y-axis label'),
                color: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Chart color theme (blue, red, green, etc.)'),
            }),
            execute: async ({ title, data, xAxisLabel, yAxisLabel, color = 'blue' }) => {
                const safeData = data && data.length > 0 ? data : generateSampleData.sales();
                return {
                    type: 'barChart',
                    title: title || 'Bar Chart',
                    data: safeData,
                    xAxisLabel,
                    yAxisLabel,
                    color,
                };
            },
        }),

        lineChart: tool({
            description:
                'Create a line chart to show trends over time or continuous data. Perfect for time series data.',
            parameters: z.object({
                title: z.string().optional().describe('Chart title'),
                data: z
                    .array(multiSeriesDataSchema)
                    .optional()
                    .describe('Array of data points with name and values'),
                xAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('X-axis label'),
                yAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Y-axis label'),
                series1Name: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Name for first data series'),
                series2Name: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Name for second data series'),
                series3Name: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Name for third data series'),
            }),
            execute: async ({
                title,
                data,
                xAxisLabel,
                yAxisLabel,
                series1Name = 'Series 1',
                series2Name,
                series3Name,
            }) => {
                const safeData = data && data.length > 0
                    ? data
                    : generateSampleData.multiSeries();
                return {
                    type: 'lineChart',
                    title: title || 'Line Chart',
                    data: safeData,
                    xAxisLabel,
                    yAxisLabel,
                    series1Name,
                    series2Name,
                    series3Name,
                };
            },
        }),

        areaChart: tool({
            description:
                'Create an area chart to show cumulative totals over time or to emphasize the magnitude of change.',
            parameters: z.object({
                title: z.string().optional().describe('Chart title'),
                data: z
                    .array(multiSeriesDataSchema)
                    .optional()
                    .describe('Array of data points with name and values'),
                xAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('X-axis label'),
                yAxisLabel: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Y-axis label'),
                series1Name: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Name for first data series'),
                series2Name: z
                    .string()
                    .nullable()
                    .optional()
                    .describe('Name for second data series'),
                stacked: z
                    .boolean()
                    .nullable()
                    .optional()
                    .describe('Whether to stack the areas'),
            }),
            execute: async ({
                title,
                data,
                xAxisLabel,
                yAxisLabel,
                series1Name = 'Series 1',
                series2Name,
                stacked = false,
            }) => {
                const safeData = data && data.length > 0
                    ? data
                    : generateSampleData.multiSeries();
                return {
                    type: 'areaChart',
                    title: title || 'Area Chart',
                    data: safeData,
                    xAxisLabel,
                    yAxisLabel,
                    series1Name,
                    series2Name,
                    stacked,
                };
            },
        }),

        pieChart: tool({
            description:
                'Create a pie chart to show proportions and percentages of a whole. Great for showing distribution of categories.',
            parameters: z.object({
                title: z.string().optional().describe('Chart title'),
                data: z
                    .array(chartDataSchema)
                    .optional()
                    .describe('Array of data points with name and value'),
                showLabels: z
                    .boolean()
                    .nullable()
                    .optional()
                    .describe('Whether to show data labels'),
                showLegend: z
                    .boolean()
                    .nullable()
                    .optional()
                    .describe('Whether to show legend'),
            }),
            execute: async ({ title, data, showLabels = true, showLegend = true }) => {
                const safeData = data && data.length > 0
                    ? data
                    : generateSampleData.distribution();
                return {
                    type: 'pieChart',
                    title: title || 'Pie Chart',
                    data: safeData,
                    showLabels,
                    showLegend,
                };
            },
        }),

        radarChart: tool({
            description:
                'Create a radar/spider chart to show multivariate data. Perfect for comparing multiple categories or metrics.',
            parameters: z.object({
                title: z.string().optional().describe('Chart title'),
                data: z
                    .array(
                        z.object({
                            category: z.string().describe('Category name'),
                            value: z.number().describe('Value for this category'),
                            fullMark: z
                                .number()
                                .nullable()
                                .optional()
                                .describe('Maximum possible value for this category'),
                        }),
                    )
                    .optional()
                    .describe('Array of categories with their values'),
                maxValue: z
                    .number()
                    .nullable()
                    .optional()
                    .describe('Maximum value for scaling'),
            }),
            execute: async ({ title, data, maxValue }) => {
                const safeData = data && data.length > 0
                    ? data
                    : generateSampleData.performance();
                return {
                    type: 'radarChart',
                    title: title || 'Radar Chart',
                    data: safeData,
                    maxValue,
                };
            },
        }),
    };

    // Filter out excluded tools
    for (const toolName in tools) {
        if (config?.excludeTools?.includes(toolName as ChartTools)) {
            delete tools[toolName as ChartTools];
        }
    }

    return tools;
};

// Helper function to generate sample data
export const generateSampleData = {
    sales: () => [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 5000 },
        { name: 'Apr', value: 4500 },
        { name: 'May', value: 6000 },
        { name: 'Jun', value: 5500 },
    ],

    multiSeries: () => [
        { name: 'Jan', series1: 4000, series2: 2400 },
        { name: 'Feb', series1: 3000, series2: 1398 },
        { name: 'Mar', series1: 5000, series2: 9800 },
        { name: 'Apr', series1: 4500, series2: 3908 },
        { name: 'May', series1: 6000, series2: 4800 },
        { name: 'Jun', series1: 5500, series2: 3800 },
    ],

    distribution: () => [
        { name: 'Desktop', value: 45 },
        { name: 'Mobile', value: 35 },
        { name: 'Tablet', value: 20 },
    ],

    performance: () => [
        { category: 'Speed', value: 85, fullMark: 100 },
        { category: 'Reliability', value: 90, fullMark: 100 },
        { category: 'Usability', value: 78, fullMark: 100 },
        { category: 'Security', value: 95, fullMark: 100 },
        { category: 'Scalability', value: 82, fullMark: 100 },
    ],
};
