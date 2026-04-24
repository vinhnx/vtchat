import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitErrorAlert } from '../rate-limit-error-alert';

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
    writable: true,
    value: mockWindowOpen,
});

describe('RateLimitErrorAlert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render a standard error alert for non-rate-limit errors', () => {
        render(<RateLimitErrorAlert error='Something went wrong' />);

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.queryByText('View Usage')).not.toBeInTheDocument();
        expect(screen.queryByText('Open Settings')).not.toBeInTheDocument();
    });

    it('should render a diagnostic error message with suggestions', () => {
        const diagnosticError =
            'API key issue detected. This could be due to missing, invalid, or expired API keys.\n\n🔧 Try these steps:\n1. Check your API keys in Settings → API Keys\n2. Verify your API key is valid and not expired';

        render(<RateLimitErrorAlert error={diagnosticError} />);

        expect(
            screen.getByText(
                'API key issue detected. This could be due to missing, invalid, or expired API keys.',
            ),
        ).toBeInTheDocument();
        expect(screen.getByText('Try these steps:')).toBeInTheDocument();
        expect(screen.getByText('Check your API keys in Settings → API Keys')).toBeInTheDocument();
        expect(
            screen.getByText('Verify your API key is valid and not expired'),
        ).toBeInTheDocument();
        expect(screen.getByText('Open Settings')).toBeInTheDocument();
        expect(screen.getByText('Refresh Page')).toBeInTheDocument();
    });

    it('should render rate limit error with CTA buttons for rate limit errors', () => {
        render(<RateLimitErrorAlert error='You have reached the daily limit of requests' />);

        expect(
            screen.getByText(/You have reached the daily limit of requests/),
        ).toBeInTheDocument();
        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Open Settings')).toBeInTheDocument();
    });

    it('should detect rate limit error by "rate limit" keyword', () => {
        render(
            <RateLimitErrorAlert error='You have reached the rate limit for requests per minute' />,
        );

        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Open Settings')).toBeInTheDocument();
    });

    it('should detect rate limit error by "per minute" keyword', () => {
        render(
            <RateLimitErrorAlert error='Please try again in 1 minute or use your own API key' />,
        );

        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Open Settings')).toBeInTheDocument();
    });

    it('should open usage settings when View Usage button is clicked', () => {
        render(<RateLimitErrorAlert error='You have reached the daily limit of requests' />);

        const viewUsageButton = screen.getByText('View Usage');
        expect(viewUsageButton).toBeInTheDocument();

        fireEvent.click(viewUsageButton);

        expect(mockWindowOpen).toHaveBeenCalledWith('/settings?tab=usage', '_blank');
    });

    it('should open settings when the secondary action is clicked', () => {
        render(<RateLimitErrorAlert error='You have reached the daily limit of requests' />);

        const settingsButton = screen.getByText('Open Settings');
        fireEvent.click(settingsButton);

        expect(mockWindowOpen).toHaveBeenCalledWith('/settings?tab=usage', '_blank');
    });

    it('should apply custom className when provided', () => {
        const { container } = render(
            <RateLimitErrorAlert
                className='custom-class'
                error='You have reached the daily limit of requests'
            />,
        );

        const alertElement = container.querySelector('[role="alert"]');
        expect(alertElement).toHaveClass('custom-class');
    });
});
