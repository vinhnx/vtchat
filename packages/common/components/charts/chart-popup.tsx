'use client';

import { ChartRenderer, Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { BarChart3, X } from 'lucide-react';
import { useState } from 'react';

export type ChartData = {
    type: 'barChart' | 'lineChart' | 'areaChart' | 'pieChart' | 'radarChart';
    title: string;
    data: any[];
    [key: string]: any;
};

type ChartPopupProps = {
    chartData: ChartData | null;
    isOpen: boolean;
    onClose: () => void;
};

export const ChartPopup = ({ chartData, isOpen, onClose }: ChartPopupProps) => {
    if (!chartData) return null;

    return (
        <Dialog onOpenChange={onClose} open={isOpen}>
            <DialogContent className="max-h-[80vh] max-w-[95vw] overflow-y-auto sm:max-w-2xl lg:max-w-4xl">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <BarChart3 size={18} />
                        {chartData.title}
                    </DialogTitle>
                    <button
                        className="rounded-md p-1 transition-colors hover:bg-gray-100"
                        onClick={onClose}
                    >
                        <X size={16} />
                    </button>
                </DialogHeader>
                <div className="mt-4">
                    <ChartRenderer {...chartData} />
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const useChartPopup = () => {
    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const showChart = (data: ChartData) => {
        setChartData(data);
        setIsOpen(true);
    };

    const closeChart = () => {
        setIsOpen(false);
        // Don't clear chartData immediately to allow smooth closing animation
        setTimeout(() => setChartData(null), 200);
    };

    return {
        chartData,
        isOpen,
        showChart,
        closeChart,
        ChartPopup: () => <ChartPopup chartData={chartData} isOpen={isOpen} onClose={closeChart} />,
    };
};
