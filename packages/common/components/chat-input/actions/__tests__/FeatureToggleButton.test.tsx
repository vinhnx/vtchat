import { render, screen } from '@testing-library/react';
import { Globe } from 'lucide-react';
import { FeatureToggleButton } from '../FeatureToggleButton';

// Mock the useFeatureToggle hook
jest.mock('../../hooks/useFeatureToggle', () => ({
    useFeatureToggle: jest.fn(() => ({
        isEnabled: false,
        hasFeatureAccess: true,
        handleToggle: jest.fn(),
        showLoginPrompt: false,
        setShowLoginPrompt: jest.fn(),
    })),
}));

// Mock the GatedFeatureAlert component
jest.mock('@repo/common/components', () => ({
    GatedFeatureAlert: ({ children }: { children: React.ReactNode; }) => <>{children}</>,
}));

describe('FeatureToggleButton', () => {
    const mockProps = {
        enabledSelector: jest.fn(),
        activeKey: 'webSearch' as const,
        icon: <Globe data-testid='icon' />,
        label: 'Web Search',
        colour: 'blue' as const,
        tooltip: (enabled: boolean) => (enabled ? 'Enabled' : 'Disabled'),
        featureName: 'web search',
        logPrefix: '🌐',
        loginDescription: 'Please log in to use web search',
    };

    it('renders correctly in disabled state', () => {
        render(<FeatureToggleButton {...mockProps} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Enable Web Search');

        const icon = screen.getByTestId('icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-muted-foreground');

        // Label should not be visible when disabled
        expect(screen.queryByText('Web Search')).not.toBeInTheDocument();
    });

    it('renders correctly in enabled state', () => {
        // Update the mock to return enabled state
        require('../../hooks/useFeatureToggle').useFeatureToggle.mockReturnValue({
            isEnabled: true,
            hasFeatureAccess: true,
            handleToggle: jest.fn(),
            showLoginPrompt: false,
            setShowLoginPrompt: jest.fn(),
        });

        render(<FeatureToggleButton {...mockProps} />);

        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', 'Web Search Enabled');

        // Button should have the blue background and toggled text color
        expect(button).toHaveClass('bg-blue-600');
        expect(button).toHaveClass('text-white');
        expect(button).toHaveClass('border-0');

        const icon = screen.getByTestId('icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-white');

        // Label should be visible when enabled
        expect(screen.getByText('Web Search')).toBeInTheDocument();
    });
});
