import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RateLimitErrorAlert } from '../rate-limit-error-alert';

// Mock the app store
const mockSetSettingTab = vi.fn();
const mockSetShowSettings = vi.fn();

vi.mock('../store', () => ({
    SETTING_TABS: {
        USAGE: 'usage',
    },
    useAppStore: () => ({
        setSettingTab: mockSetSettingTab,
        setIsSettingsOpen: mockSetShowSettings,
    }),
}));

// Mock window.open
const mockWindowOpen = vi.fn();
global.window.open = mockWindowOpen;

describe('RateLimitErrorAlert', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render a standard error alert for non-rate-limit errors', () => {
        render(<RateLimitErrorAlert error="Something went wrong" />);
        
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.queryByText('View Usage')).not.toBeInTheDocument();
        expect(screen.queryByText('Upgrade to VT+')).not.toBeInTheDocument();
    });

    it('should render rate limit error with CTA buttons for rate limit errors', () => {
        render(<RateLimitErrorAlert error="You have reached the daily limit of requests" />);
        
        expect(screen.getByText(/You have reached the daily limit of requests/)).toBeInTheDocument();
        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Upgrade to VT+')).toBeInTheDocument();
    });

    it('should detect rate limit error by "rate limit" keyword', () => {
        render(<RateLimitErrorAlert error="You have reached the rate limit for requests per minute" />);
        
        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Upgrade to VT+')).toBeInTheDocument();
    });

    it('should detect rate limit error by "per minute" keyword', () => {
        render(<RateLimitErrorAlert error="Please try again in 1 minute or use your own API key" />);
        
        expect(screen.getByText('View Usage')).toBeInTheDocument();
        expect(screen.getByText('Upgrade to VT+')).toBeInTheDocument();
    });

    it('should open usage settings when View Usage button is clicked', () => {
        render(<RateLimitErrorAlert error="You have reached the daily limit of requests" />);
        
        const viewUsageButton = screen.getByText('View Usage');
        expect(viewUsageButton).toBeInTheDocument();
        
        fireEvent.click(viewUsageButton);
        
        expect(mockSetSettingTab).toHaveBeenCalledWith('usage');
        expect(mockSetShowSettings).toHaveBeenCalledWith(true);
    });

    it('should open upgrade page when Upgrade to VT+ button is clicked', () => {
        render(<RateLimitErrorAlert error="You have reached the daily limit of requests" />);
        
        const upgradeButton = screen.getByText('Upgrade to VT+');
        fireEvent.click(upgradeButton);
        
        expect(mockWindowOpen).toHaveBeenCalledWith('/plus', '_blank');
    });

    it('should apply custom className when provided', () => {
        const { container } = render(
            <RateLimitErrorAlert 
                error="You have reached the daily limit of requests" 
                className="custom-class" 
            />
        );
        
        const alertElement = container.querySelector('[role="alert"]');
        expect(alertElement).toHaveClass('custom-class');
    });
});
