'use client';

import { ChartComponent, type ChartComponentData } from './chart-components';

// Example data for the area chart
const sampleAreaData = [
    {
        name: 'Page A',
        uv: 4000,
        pv: 2400,
        amt: 2400,
    },
    {
        name: 'Page B',
        uv: 3000,
        pv: 1398,
        amt: 2210,
    },
    {
        name: 'Page C',
        uv: 2000,
        pv: 9800,
        amt: 2290,
    },
    {
        name: 'Page D',
        uv: 2780,
        pv: 3908,
        amt: 2000,
    },
    {
        name: 'Page E',
        uv: 1890,
        pv: 4800,
        amt: 2181,
    },
    {
        name: 'Page F',
        uv: 2390,
        pv: 3800,
        amt: 2500,
    },
    {
        name: 'Page G',
        uv: 3490,
        pv: 4300,
        amt: 2100,
    },
];

// Example area chart configurations
export const AreaChartExamples = () => {
    // Single series area chart
    const singleSeriesAreaChart: ChartComponentData = {
        type: 'areaChart',
        title: 'Simple Area Chart',
        data: sampleAreaData,
        xAxisLabel: 'Pages',
        yAxisLabel: 'Values',
        series1Name: 'Unique Visitors',
        dataKey1: 'uv',
    };

    // Multi-series area chart
    const multiSeriesAreaChart: ChartComponentData = {
        type: 'areaChart',
        title: 'Multi-Series Area Chart',
        data: sampleAreaData,
        xAxisLabel: 'Pages',
        yAxisLabel: 'Values',
        series1Name: 'Unique Visitors',
        series2Name: 'Page Views',
        series3Name: 'Amount',
        dataKey1: 'uv',
        dataKey2: 'pv',
        dataKey3: 'amt',
    };

    // Stacked area chart
    const stackedAreaChart: ChartComponentData = {
        type: 'areaChart',
        title: 'Stacked Area Chart',
        data: sampleAreaData,
        xAxisLabel: 'Pages',
        yAxisLabel: 'Values',
        series1Name: 'Unique Visitors',
        series2Name: 'Page Views',
        dataKey1: 'uv',
        dataKey2: 'pv',
        stacked: true,
    };

    return (
        <div className='space-y-8'>
            <h2 className='text-2xl font-bold'>Area Chart Examples</h2>

            <div className='space-y-6'>
                <div>
                    <h3 className='mb-4 text-lg font-semibold'>Single Series</h3>
                    <ChartComponent chartData={singleSeriesAreaChart} />
                </div>

                <div>
                    <h3 className='mb-4 text-lg font-semibold'>Multi-Series</h3>
                    <ChartComponent chartData={multiSeriesAreaChart} />
                </div>

                <div>
                    <h3 className='mb-4 text-lg font-semibold'>Stacked</h3>
                    <ChartComponent chartData={stackedAreaChart} />
                </div>
            </div>
        </div>
    );
};

export default AreaChartExamples;
