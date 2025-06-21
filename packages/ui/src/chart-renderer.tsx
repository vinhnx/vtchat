'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/card';
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Area,
    AreaChart,
    Pie,
    PieChart,
    Cell,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Legend,
} from 'recharts';

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

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight="500"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function ChartRenderer(props: ChartProps) {
    const { type, title } = props;

    const renderChart = () => {
        switch (type) {
            case 'barChart':
                const colors = chartColors[(props as any).color] || chartColors.default;
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Bar dataKey="value" fill={colors[0]} />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'lineChart':
                const lineColors = chartColors.default;
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Line
                                type="monotone"
                                dataKey="series1"
                                stroke={lineColors[0]}
                                strokeWidth={2}
                                dot={{ fill: lineColors[0] }}
                            />
                            {props.data.some(d => d.series2 !== undefined) && (
                                <Line
                                    type="monotone"
                                    dataKey="series2"
                                    stroke={lineColors[1]}
                                    strokeWidth={2}
                                    dot={{ fill: lineColors[1] }}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'areaChart':
                const areaColors = chartColors.default;
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={props.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Area
                                type="monotone"
                                dataKey="series1"
                                stackId={props.stacked ? '1' : undefined}
                                stroke={areaColors[0]}
                                fill={areaColors[0]}
                                fillOpacity={0.6}
                            />
                            {props.data.some(d => d.series2 !== undefined) && (
                                <Area
                                    type="monotone"
                                    dataKey="series2"
                                    stackId={props.stacked ? '1' : undefined}
                                    stroke={areaColors[1]}
                                    fill={areaColors[1]}
                                    fillOpacity={0.6}
                                />
                            )}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pieChart':
                const pieColors = chartColors.default;
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={props.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={props.showLabels ? renderCustomizedLabel : false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {props.data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={pieColors[index % pieColors.length]}
                                    />
                                ))}
                            </Pie>
                            {props.showLegend && <Legend />}
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'radarChart':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={props.data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="category" />
                            <PolarRadiusAxis angle={90} domain={[0, props.maxValue || 100]} />
                            <Radar
                                name="Value"
                                dataKey="value"
                                stroke={chartColors.default[0]}
                                fill={chartColors.default[0]}
                                fillOpacity={0.3}
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
