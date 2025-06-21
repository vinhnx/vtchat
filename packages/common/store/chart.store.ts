'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChartData = {
    id: string;
    type: 'barChart' | 'lineChart' | 'areaChart' | 'pieChart' | 'radarChart';
    title: string;
    data: any[];
    threadItemId?: string;
    createdAt: number;
    [key: string]: any;
};

type ChartStore = {
    charts: ChartData[];
    addChart: (chart: Omit<ChartData, 'id' | 'createdAt'>) => string;
    getChart: (id: string) => ChartData | undefined;
    getChartsForThreadItem: (threadItemId: string) => ChartData[];
    clearCharts: () => void;
    removeChart: (id: string) => void;
};

export const useChartStore = create<ChartStore>()(
    persist(
        (set, get) => ({
            charts: [],

            addChart: (chartData) => {
                const id = `chart_${Date.now()}_${Math.random().toString(36).substring(7)}`;
                const chart: ChartData = {
                    ...chartData,
                    id,
                    createdAt: Date.now(),
                };
                
                set((state) => ({
                    charts: [...state.charts, chart],
                }));
                
                return id;
            },

            getChart: (id) => {
                return get().charts.find(chart => chart.id === id);
            },

            getChartsForThreadItem: (threadItemId) => {
                return get().charts.filter(chart => chart.threadItemId === threadItemId);
            },

            removeChart: (id) => {
                set((state) => ({
                    charts: state.charts.filter(chart => chart.id !== id),
                }));
            },

            clearCharts: () => {
                set({ charts: [] });
            },
        }),
        {
            name: 'vtchat-charts',
            version: 1,
        }
    )
);
