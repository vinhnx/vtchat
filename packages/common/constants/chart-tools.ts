export const CHART_TOOL_NAMES = [
    "barChart",
    "lineChart",
    "areaChart",
    "pieChart",
    "radarChart",
] as const;

export const isChartTool = (toolName: string | undefined): boolean => {
    return !!toolName && CHART_TOOL_NAMES.includes(toolName as any);
};
