'use client';

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';

interface BaseChartData {
    name: string;
    value: number;
}

interface MultiSeriesData {
    name: string;
    series1: number;
    series2?: number;
    series3?: number;
}

interface RadarData {
    category: string;
    value: number;
    fullMark?: number;
}

interface BarChartProps {
    type: 'barChart';
    title: string;
    data: BaseChartData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    color?: string;
}

interface LineChartProps {
    type: 'lineChart';
    title: string;
    data: MultiSeriesData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    series1Name?: string;
    series2Name?: string;
    series3Name?: string;
}

interface AreaChartProps {
    type: 'areaChart';
    title: string;
    data: MultiSeriesData[];
    xAxisLabel?: string;
    yAxisLabel?: string;
    series1Name?: string;
    series2Name?: string;
    stacked?: boolean;
}

interface PieChartProps {
    type: 'pieChart';
    title: string;
    data: BaseChartData[];
    showLabels?: boolean;
    showLegend?: boolean;
}

interface RadarChartProps {
    type: 'radarChart';
    title: string;
    data: RadarData[];
    maxValue?: number;
}

type ChartProps = BarChartProps | LineChartProps | AreaChartProps | PieChartProps | RadarChartProps;

// Color palettes
const chartColors = {
    blue: ['#3b82f6', '#60a5fa', '#93c5fd'],
    red: ['#ef4444', '#f87171', '#fca5a5'],
    green: ['#10b981', '#34d399', '#6ee7b7'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    orange: ['#f97316', '#fb923c', '#fdba74'],
    default: ['#3b82f6', '#60a5fa', '#93c5fd'],
};

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
}: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            dominantBaseline="central"
            fill="white"
            fontSize={12}
            fontWeight="500"
            textAnchor={x > cx ? 'start' : 'end'}
            x={x}
            y={y}
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function ChartRenderer(props: ChartProps) {
    const { type, title } = props;

    const getChartConfig = (): ChartConfig => {
        const colors = chartColors[(props as any).color] || chartColors.default;

        if (type === 'lineChart' || type === 'areaChart') {
            return {
                series1: {
                    label: (props as LineChartProps).series1Name || 'Series 1',
                    color: colors[0],
                },
                series2: {
                    label: (props as LineChartProps).series2Name || 'Series 2',
                    color: colors[1],
                },
                series3: {
                    label: (props as LineChartProps).series3Name || 'Series 3',
                    color: colors[2],
                },
            };
        }

        return {
            value: {
                label: 'Value',
                color: colors[0],
            },
        };
    };

    const renderChart = () => {
        switch (type) {
            case 'barChart':
                return (
                    <ChartContainer config={getChartConfig()}>
                        <BarChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="var(--color-value)" />
                        </BarChart>
                    </ChartContainer>
                );

            case 'lineChart':
                return (
                    <ChartContainer config={getChartConfig()}>
                        <LineChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                dataKey="series1"
                                dot={{ fill: 'var(--color-series1)' }}
                                stroke="var(--color-series1)"
                                strokeWidth={2}
                                type="monotone"
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Line
                                    dataKey="series2"
                                    dot={{ fill: 'var(--color-series2)' }}
                                    stroke="var(--color-series2)"
                                    strokeWidth={2}
                                    type="monotone"
                                />
                            )}
                            {props.data.some((d) => d.series3 !== undefined) && (
                                <Line
                                    dataKey="series3"
                                    dot={{ fill: 'var(--color-series3)' }}
                                    stroke="var(--color-series3)"
                                    strokeWidth={2}
                                    type="monotone"
                                />
                            )}
                        </LineChart>
                    </ChartContainer>
                );

            case 'areaChart':
                return (
                    <ChartContainer config={getChartConfig()}>
                        <AreaChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                                dataKey="series1"
                                fill="var(--color-series1)"
                                fillOpacity={0.6}
                                stackId={props.stacked ? '1' : undefined}
                                stroke="var(--color-series1)"
                                type="monotone"
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Area
                                    dataKey="series2"
                                    fill="var(--color-series2)"
                                    fillOpacity={0.6}
                                    stackId={props.stacked ? '1' : undefined}
                                    stroke="var(--color-series2)"
                                    type="monotone"
                                />
                            )}
                        </AreaChart>
                    </ChartContainer>
                );

            case 'pieChart': {
                const colors = chartColors.default;
                return (
                    <ChartContainer config={getChartConfig()}>
                        <PieChart>
                            <Pie
                                cx="50%"
                                cy="50%"
                                data={props.data}
                                dataKey="value"
                                fill="#8884d8"
                                label={props.showLabels ? renderCustomizedLabel : false}
                                labelLine={false}
                                outerRadius={80}
                            >
                                {props.data.map((entry, index) => (
                                    <Cell
                                        fill={colors[index % colors.length]}
                                        key={`cell-${index}`}
                                    />
                                ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            {props.showLegend && <Legend />}
                        </PieChart>
                    </ChartContainer>
                );
            }

            case 'radarChart':
                return (
                    <ChartContainer config={getChartConfig()}>
                        <RadarChart data={props.data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, props.maxValue || 100]} />
                            <Radar
                                dataKey="value"
                                fill="var(--color-value)"
                                fillOpacity={0.3}
                                name="Value"
                                stroke="var(--color-value)"
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                        </RadarChart>
                    </ChartContainer>
                );

            default:
                return <div>Unsupported chart type</div>;
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {(props as any).xAxisLabel && (
                    <CardDescription>
                        {(props as any).xAxisLabel} vs {(props as any).yAxisLabel}
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">{renderChart()}</div>
            </CardContent>
        </Card>
    );
}
