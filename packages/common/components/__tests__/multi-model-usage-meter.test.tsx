import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModelEnum } from '@repo/ai/models';
import { MultiModelUsageMeter } from '../multi-model-usage-meter';

// Mock the chart components to avoid rendering issues in tests
vi.mock('recharts', () => ({
    AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
    Area: () => <div data-testid="area" />,
    CartesianGrid: () => <div data-testid="cartesian-grid" />,
    XAxis: () => <div data-testid="x-axis" />,
    YAxis: () => <div data-testid="y-axis" />,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MultiModelUsageMeter Component - Requirements Verification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        
        // Default successful fetch response
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({
                [ModelEnum.GEMINI_2_5_FLASH_LITE]: {
                    dailyUsed: 5,
                    minuteUsed: 2,
                    dailyLimit: 20,
                    minuteLimit: 5,
                    remainingDaily: 15,
                    remainingMinute: 3,
                    resetTime: {
                        daily: new Date(),
                        minute: new Date(),
                    },
                },
                [ModelEnum.GEMINI_2_5_PRO]: {
                    dailyUsed: 3,
                    minuteUsed: 1,
                    dailyLimit: 10,
                    minuteLimit: 1,
                    remainingDaily: 7,
                    remainingMinute: 0,
                    resetTime: {
                        daily: new Date(),
                        minute: new Date(),
                    },
                },
            }),
        });
    });

    describe('Requirement 1: Charts Instead of Progress Bars', () => {
        it('should render area chart instead of progress bars', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByTestId('area-chart')).toBeInTheDocument();
                expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
            });

            // Should NOT have progress bar elements
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            expect(screen.queryByTestId('progress-bar')).not.toBeInTheDocument();
        });

        it('should display chart with proper structure', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByTestId('area-chart')).toBeInTheDocument();
                expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument();
                expect(screen.getByTestId('x-axis')).toBeInTheDocument();
                expect(screen.getByTestId('y-axis')).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 2: No Cost Information', () => {
        it('should not display cost-related information in main usage display', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should not show cost per request, total costs, or billing information
                expect(screen.queryByText(/\$.*per.*request/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/total.*cost/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/billing/i)).not.toBeInTheDocument();
                expect(screen.queryByText(/cost.*savings/i)).not.toBeInTheDocument();
            });
        });

        it('should show pricing reference only in footer information', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should show Google's pricing reference in footer
                expect(screen.getByText("Google's Pricing Reference")).toBeInTheDocument();
                expect(screen.getByText(/Flash Lite: \$0\.10\/1M tokens/)).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 3: VT+ Dual Quota System Display', () => {
        it('should display VT+ dual quota explanation', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText('VT+ Dual Quota System')).toBeInTheDocument();
                expect(screen.getByText(/Flash Lite.*Unlimited access for VT\+ users/)).toBeInTheDocument();
                expect(screen.getByText(/Flash & Pro.*count against both their own limits AND the Flash Lite quota/)).toBeInTheDocument();
                expect(screen.getByText(/Effective limit.*stricter of the two quotas applies/)).toBeInTheDocument();
            });
        });

        it('should show dual quota notes for Pro and Flash models', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                const vtPlusNotes = screen.getAllByText(/VT\+ Note.*Also counts against Flash Lite quota/);
                expect(vtPlusNotes).toHaveLength(2); // One for Flash, one for Pro
            });
        });

        it('should show unlimited access for VT+ Flash Lite', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                const unlimitedTexts = screen.getAllByText(/VT\+.*Unlimited/);
                expect(unlimitedTexts.length).toBeGreaterThanOrEqual(2); // Flash Lite should show unlimited
            });
        });
    });

    describe('Requirement 4: Model Limit Display', () => {
        it('should display all Gemini model limits correctly', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should show Flash Lite limits
                expect(screen.getByText('Gemini 2.5 Flash Lite')).toBeInTheDocument();
                
                // Should show Flash limits  
                expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
                
                // Should show Pro limits
                expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
            });
        });

        it('should show VT+ vs Free tier comparison', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText('VT+ vs Free Tier Comparison')).toBeInTheDocument();
                expect(screen.getByText('VT+ Users (Server-funded)')).toBeInTheDocument();
                expect(screen.getByText('Free Users (BYOK)')).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 5: Real-time Usage Display', () => {
        it('should fetch and display usage data on mount', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(mockFetch).toHaveBeenCalledWith('/api/rate-limit/status');
            });
        });

        it('should provide refresh functionality', async () => {
            const user = userEvent.setup();
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText('Refresh')).toBeInTheDocument();
            });

            const refreshButton = screen.getByText('Refresh');
            await user.click(refreshButton);

            // Should call the API again
            expect(mockFetch).toHaveBeenCalledTimes(2);
        });

        it('should handle loading states', () => {
            // Mock a pending fetch
            mockFetch.mockImplementation(() => new Promise(() => {}));
            
            render(<MultiModelUsageMeter />);

            // Should show loading state initially
            expect(screen.getByText(/track your gemini model usage/i)).toBeInTheDocument();
        });
    });

    describe('Requirement 6: Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            mockFetch.mockRejectedValue(new Error('API Error'));

            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should still render the component structure
                expect(screen.getByText(/track your gemini model usage/i)).toBeInTheDocument();
            });
        });

        it('should handle invalid API responses', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
            });

            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should still render the component structure
                expect(screen.getByText(/track your gemini model usage/i)).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 7: Accessibility and User Experience', () => {
        it('should have proper heading structure', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
            });
        });

        it('should provide meaningful descriptions', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText(/Server-funded access requires VT\+ subscription/)).toBeInTheDocument();
            });
        });

        it('should have interactive elements with proper accessibility', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                const refreshButton = screen.getByRole('button', { name: /refresh/i });
                expect(refreshButton).toBeInTheDocument();
                expect(refreshButton).toBeEnabled();
            });
        });
    });

    describe('Requirement 8: Data Visualization Requirements', () => {
        it('should use area chart for cumulative usage visualization', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByTestId('area-chart')).toBeInTheDocument();
                // Area charts are better for showing cumulative usage over time
                expect(screen.getAllByTestId('area')).toHaveLength(3); // One for each model
            });
        });

        it('should display usage statistics in a grid format', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should have organized statistics display
                expect(screen.getByText('Per-Model Rate Limits')).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 9: VT+ Feature Integration', () => {
        it('should clearly differentiate VT+ features from free features', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                // Should clearly show VT+ specific features
                expect(screen.getByText('VT+ Dual Quota System')).toBeInTheDocument();
                expect(screen.getByText(/VT\+ Users \(Server-funded\)/)).toBeInTheDocument();
                expect(screen.getByText(/Free Users \(BYOK\)/)).toBeInTheDocument();
            });
        });

        it('should explain the benefit of VT+ subscription', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText(/Server-funded access requires VT\+ subscription/)).toBeInTheDocument();
                expect(screen.getByText(/Unlimited access for VT\+ users/)).toBeInTheDocument();
            });
        });
    });

    describe('Requirement 10: Policy Communication', () => {
        it('should clearly communicate Google Gemini quota policies', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText("Google's Pricing Reference")).toBeInTheDocument();
                expect(screen.getByText('VT+ Dual Quota System')).toBeInTheDocument();
                expect(screen.getByText('Per-Model Rate Limits')).toBeInTheDocument();
            });
        });

        it('should explain the relationship between different quotas', async () => {
            render(<MultiModelUsageMeter />);

            await waitFor(() => {
                expect(screen.getByText(/count against both their own limits AND the Flash Lite quota/)).toBeInTheDocument();
                expect(screen.getByText(/stricter of the two quotas applies/)).toBeInTheDocument();
            });
        });
    });
});
