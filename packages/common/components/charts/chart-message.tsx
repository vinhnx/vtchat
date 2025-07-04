'use client';

import { log } from '@repo/shared/logger';
import { Button } from '@repo/ui';
import { BarChart3 } from 'lucide-react';
import { useMemo } from 'react';
import { type ChartData, ChartPopup, useChartPopup } from './chart-popup';

type ChartMessageProps = {
    content: string;
};

export const ChartMessage = ({ content }: ChartMessageProps) => {
    const { showChart, ChartPopup: ChartPopupComponent } = useChartPopup();

    // Extract chart data from content
    const chartData = useMemo(() => {
        const chartDataMatch = content.match(/\[CHART_DATA:(.*?)\]/);
        if (!chartDataMatch) return null;

        try {
            return JSON.parse(chartDataMatch[1]) as ChartData;
        } catch (error) {
            log.error({ data: error }, 'Failed to parse chart data');
            return null;
        }
    }, [content]);

    // Remove chart data marker from content for display
    const cleanContent = useMemo(() => {
        return content.replace(/\[CHART_DATA:.*?\]/g, '').trim();
    }, [content]);

    const handleViewChart = () => {
        if (chartData) {
            showChart(chartData);
        }
    };

    return (
        <div className="space-y-3">
            {/* Display the cleaned content */}
            <div className="whitespace-pre-wrap">{cleanContent}</div>

            {/* Show chart button if chart data exists */}
            {chartData && (
                <div className="flex justify-start">
                    <Button
                        className="gap-2 border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-300 hover:bg-purple-100"
                        onClick={handleViewChart}
                        size="sm"
                        variant="outline"
                    >
                        <BarChart3 size={16} />
                        View Chart
                    </Button>
                </div>
            )}

            {/* Chart popup */}
            <ChartPopupComponent />
        </div>
    );
};

// Utility function to check if content contains chart data
export const hasChartData = (content: string): boolean => {
    return /\[CHART_DATA:.*?\]/.test(content);
};
