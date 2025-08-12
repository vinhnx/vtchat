import { ModelEnum } from '@repo/ai/models';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the hooks
const mockUseSession = vi.fn();
const mockUseRateLimit = vi.fn();

vi.mock('@repo/shared/lib/auth-client', () => ({
    useSession: mockUseSession,
}));

vi.mock('@repo/common/hooks', () => ({
    useRateLimit: mockUseRateLimit,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
    formatDistanceToNow: vi.fn((_date, options) => {
        if (options?.addSuffix) {
            return 'in 5 minutes';
        }
        return '5 minutes';
    }),
}));

// Import components after mocks
import { RateLimitIndicator } from '../rate-limit-indicator';
import { RateLimitMeter } from '../rate-limit-meter';

describe('Rate Limit UI Components', () => {
    const authenticatedUser = {
        user: { id: 'user-123', email: 'user@test.com' },
    };

    const mockRateLimitStatus = {
        dailyUsed: 5,
        minuteUsed: 0,
        dailyLimit: 10,
        minuteLimit: 1,
        remainingDaily: 5,
        remainingMinute: 1,
        resetTime: {
            daily: new Date('2024-01-02T00:00:00Z'),
            minute: new Date(Date.now() + 300_000), // 5 minutes from now
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('RateLimitIndicator', () => {
        it('should not render for non-rate-limited models', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: null,
                isLoading: false,
                error: null,
            });

            const { container } = render(<RateLimitIndicator modelId={ModelEnum.GPT_4o} />);

            expect(container.firstChild).toBeNull();
        });

        it('should not render when no user is authenticated', () => {
            mockUseSession.mockReturnValue({ data: null });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            const { container } = render(
                <RateLimitIndicator modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />,
            );

            expect(container.firstChild).toBeNull();
        });

        it('should show loading state', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: null,
                isLoading: true,
                error: null,
            });

            render(<RateLimitIndicator modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />);

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should display usage in compact mode', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitIndicator compact={true} modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />);

            expect(screen.getByText('5/10 today')).toBeInTheDocument();
        });

        it('should show warning when near daily limit', () => {
            const nearLimitStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 8,
                remainingDaily: 2,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: nearLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitIndicator compact={true} modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />);

            // Should show warning icon and text color
            const indicator = screen.getByText('8/10 today');
            expect(indicator).toBeInTheDocument();

            // Check for warning icon (AlertTriangle)
            const warningIcon = screen.getByTestId('alert-triangle')
                || screen.getByRole('img', { hidden: true });
            expect(warningIcon).toBeInTheDocument();
        });

        it('should show minute rate limit warning', () => {
            const minuteLimitStatus = {
                ...mockRateLimitStatus,
                remainingMinute: 0,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: minuteLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitIndicator modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />);

            expect(screen.getByText(/Rate limited • Resets in 5 minutes/)).toBeInTheDocument();
        });

        it('should show daily limit warning', () => {
            const dailyLimitStatus = {
                ...mockRateLimitStatus,
                remainingDaily: 1,
                remainingMinute: 1,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: dailyLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitIndicator modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />);

            expect(screen.getByText('Daily limit almost reached')).toBeInTheDocument();
        });
    });

    describe('RateLimitMeter', () => {
        it('should not render for unauthenticated users', () => {
            mockUseSession.mockReturnValue({ data: null });

            const { container } = render(<RateLimitMeter />);

            expect(container.firstChild).toBeNull();
        });

        it('should show loading state', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: null,
                isLoading: true,
                error: null,
            });

            render(<RateLimitMeter />);

            expect(screen.getByText('Free Model Usage')).toBeInTheDocument();
            expect(
                screen.getByText(/Track your personal daily and per-minute limits/),
            ).toBeInTheDocument();

            // Should show skeleton loaders
            const skeletons = screen.getAllByTestId('skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('should show error state', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: null,
                isLoading: false,
                error: 'Failed to load',
            });

            render(<RateLimitMeter />);

            expect(screen.getByText('Free Model Usage')).toBeInTheDocument();
            expect(
                screen.getByText('Unable to load your personal usage information'),
            ).toBeInTheDocument();
        });

        it('should display current usage statistics', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            // Check daily usage display
            expect(screen.getByText('Daily requests')).toBeInTheDocument();
            expect(screen.getByText('5 / 10')).toBeInTheDocument();
            expect(
                screen.getByText(/5 requests remaining • Resets in 5 minutes/),
            ).toBeInTheDocument();

            // Check per-minute status
            expect(screen.getByText('Per-minute rate limit')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });

        it('should show progress bar with correct color coding', () => {
            // Test with 50% usage (should be green)
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus, // 5/10 = 50%
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
            expect(progressBar).toHaveAttribute('aria-valuenow', '50');

            // Test with high usage (should be amber)
            const highUsageStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 9,
                remainingDaily: 1,
            };

            mockUseRateLimit.mockReturnValue({
                status: highUsageStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            const highProgressBar = screen.getByRole('progressbar');
            expect(highProgressBar).toHaveAttribute('aria-valuenow', '90');
        });

        it('should show rate limit status when minute limit is hit', () => {
            const minuteLimitStatus = {
                ...mockRateLimitStatus,
                remainingMinute: 0,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: minuteLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            expect(screen.getByText('Rate limited')).toBeInTheDocument();
            expect(screen.getByText(/Next request available in 5 minutes/)).toBeInTheDocument();
        });

        it('should show daily limit reached warning', () => {
            const dailyLimitStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 10,
                remainingDaily: 0,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: dailyLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            expect(screen.getByText('Daily limit reached')).toBeInTheDocument();
            expect(screen.getByText(/Upgrade to VT\+ for unlimited access/)).toBeInTheDocument();
        });

        it('should show low requests warning', () => {
            const lowRequestsStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 8,
                remainingDaily: 2,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: lowRequestsStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            expect(screen.getByText('Low on daily requests')).toBeInTheDocument();
            expect(
                screen.getByText(/Consider upgrading to VT\+ for unlimited access/),
            ).toBeInTheDocument();
        });

        it('should display success state with check icon when limits are healthy', () => {
            const healthyStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 3,
                remainingDaily: 7,
                remainingMinute: 1,
            };

            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: healthyStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            // Should show green check icon for healthy status
            expect(screen.getByText('Free Model Usage')).toBeInTheDocument();
            expect(screen.getByText('3 / 10')).toBeInTheDocument();
            expect(screen.getByText('Available')).toBeInTheDocument();
        });
    });

    describe('Component Integration', () => {
        it('should handle real-time updates correctly', async () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });

            // Start with initial status
            const { rerender } = render(<RateLimitMeter />);

            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            rerender(<RateLimitMeter />);
            expect(screen.getByText('5 / 10')).toBeInTheDocument();

            // Update to new status (simulate usage)
            const updatedStatus = {
                ...mockRateLimitStatus,
                dailyUsed: 6,
                remainingDaily: 4,
            };

            mockUseRateLimit.mockReturnValue({
                status: updatedStatus,
                isLoading: false,
                error: null,
            });

            rerender(<RateLimitMeter />);
            expect(screen.getByText('6 / 10')).toBeInTheDocument();
        });

        it('should handle component prop changes', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            const { rerender } = render(
                <RateLimitIndicator compact={false} modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />,
            );

            expect(screen.getByText('Daily usage:')).toBeInTheDocument();

            // Switch to compact mode
            rerender(
                <RateLimitIndicator compact={true} modelId={ModelEnum.GEMINI_2_5_FLASH_LITE} />,
            );

            expect(screen.getByText('5/10 today')).toBeInTheDocument();
            expect(screen.queryByText('Daily usage:')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA labels for progress bars', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '50');
            expect(progressBar).toHaveAttribute('aria-valuemin', '0');
            expect(progressBar).toHaveAttribute('aria-valuemax', '100');
        });

        it('should have proper heading structure', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toHaveTextContent('Free Model Usage');
        });

        it('should provide screen reader friendly content', () => {
            mockUseSession.mockReturnValue({ data: authenticatedUser });
            mockUseRateLimit.mockReturnValue({
                status: mockRateLimitStatus,
                isLoading: false,
                error: null,
            });

            render(<RateLimitMeter />);

            // Check for descriptive text
            expect(
                screen.getByText(/Track your personal daily and per-minute limits/),
            ).toBeInTheDocument();
            expect(screen.getByText(/requests remaining/)).toBeInTheDocument();
        });
    });
});
