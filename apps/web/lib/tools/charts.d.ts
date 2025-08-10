import { type Tool } from "ai";
type ChartTools = "barChart" | "lineChart" | "areaChart" | "pieChart" | "radarChart";
export declare const chartTools: (config?: {
    excludeTools?: ChartTools[];
}) => Partial<Record<ChartTools, Tool>>;
export declare const generateSampleData: {
    sales: () => {
        name: string;
        value: number;
    }[];
    multiSeries: () => {
        name: string;
        series1: number;
        series2: number;
    }[];
    distribution: () => {
        name: string;
        value: number;
    }[];
    performance: () => {
        category: string;
        value: number;
        fullMark: number;
    }[];
};
export {};
//# sourceMappingURL=charts.d.ts.map