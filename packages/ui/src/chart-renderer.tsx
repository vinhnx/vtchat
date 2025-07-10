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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/card';

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

export type ChartProps =
    | BarChartProps
    | LineChartProps
    | AreaChartProps
    | PieChartProps
    | RadarChartProps;

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

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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

    const renderChart = () => {
        switch (type) {
            case 'barChart': {
                const colors = chartColors[(props as any).color] || chartColors.default;
                return (
                    <ResponsiveContainer height={300} width="100%">
                        <BarChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Bar dataKey="value" fill={colors[0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );
            }

            case 'lineChart': {
                const lineColors = chartColors.default;
                return (
                    <ResponsiveContainer height={300} width="100%">
                        <LineChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Line
                                dataKey="series1"
                                dot={{ fill: lineColors[0] }}
                                stroke={lineColors[0]}
                                strokeWidth={2}
                                type="monotone"
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Line
                                    dataKey="series2"
                                    dot={{ fill: lineColors[1] }}
                                    stroke={lineColors[1]}
                                    strokeWidth={2}
                                    type="monotone"
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                );
            }

            case 'areaChart': {
                const areaColors = chartColors.default;
                return (
                    <ResponsiveContainer height={300} width="100%">
                        <AreaChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Area
                                dataKey="series1"
                                fill={areaColors[0]}
                                fillOpacity={0.6}
                                stackId={props.stacked ? '1' : undefined}
                                stroke={areaColors[0]}
                                type="monotone"
                            />
                            {props.data.some((d) => d.series2 !== undefined) && (
                                <Area
                                    dataKey="series2"
                                    fill={areaColors[1]}
                                    fillOpacity={0.6}
                                    stackId={props.stacked ? '1' : undefined}
                                    stroke={areaColors[1]}
                                    type="monotone"
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                );
            }

            case 'pieChart': {
                const pieColors = chartColors.default;
                return (
                    <ResponsiveContainer height={300} width="100%">
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
                                {props.data.map((_entry, index) => (
                                    <Cell
                                        fill={pieColors[index % pieColors.length]}
                                        key={`cell-${index}`}
                                    />
                                ))}
                            </Pie>
                            {props.showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );
            }

            case 'radarChart':
                return (
                    <ResponsiveContainer height={300} width="100%">
                        <RadarChart data={props.data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, props.maxValue || 100]} />
                            <Radar
                                dataKey="value"
                                fill={chartColors.default[0]}
                                fillOpacity={0.3}
                                name="Value"
                                stroke={chartColors.default[0]}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
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
            <CardContent>{renderChart()}</CardContent>
        </Card>
    );
}
