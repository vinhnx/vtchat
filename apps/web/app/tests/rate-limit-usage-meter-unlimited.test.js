/**
 * Test case for VT+ and BYOK handling in rate-limit-usage-meter
 * Ensures proper overlay display and visual feedback for unlimited users
 */

import { expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock the hooks
vi.mock('@repo/common/hooks/use-subscription-access', () => ({
    useVtPlusAccess: vi.fn(),
}));

vi.mock('@repo/common/store/api-keys.store', () => ({
    useApiKeysStore: vi.fn(),
}));

// Mock UI components
vi.mock('@repo/ui', () => ({
    cn: (...classes) => classes.filter(Boolean).join(' '),
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Card: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardContent: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardDescription: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
    CardTitle: ({ children, ...props }) => <div {...props}>{children}</div>,
    Progress: ({ children, ...props }) => <div {...props}>{children}</div>,
    Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
    Clock: () => <div data-testid="clock-icon" />,
    Zap: () => <div data-testid="zap-icon" />,
    Star: () => <div data-testid="star-icon" />,
    TrendingUp: () => <div data-testid="trending-up-icon" />,
    RefreshCw: () => <div data-testid="refresh-icon" />,
    Crown: () => <div data-testid="crown-icon" />,
    ArrowUp: () => <div data-testid="arrow-up-icon" />,
    Key: () => <div data-testid="key-icon" />,
}));

// Mock fetch
global.fetch = vi.fn();

import RateLimitUsageMeter from '@repo/common/components/rate-limit-usage-meter';
import { useVtPlusAccess } from '@repo/common/hooks/use-subscription-access';
import { useApiKeysStore } from '@repo/common/store/api-keys.store';

describe('RateLimitUsageMeter - VT+ and BYOK Handling', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                dailyUsed: 10,
                minuteUsed: 2,
                dailyLimit: 100,
                minuteLimit: 10,
                remainingDaily: 90,
                remainingMinute: 8,
                resetTime: {
                    daily: new Date().toISOString(),
                    minute: new Date().toISOString(),
                },
            }),
        });
    });

    test('shows BYOK overlay when user has Gemini API key', async () => {
        // Mock BYOK user (has API key, not VT+)
        useVtPlusAccess.mockReturnValue(false);
        useApiKeysStore.mockReturnValue(() => ({
            GEMINI_API_KEY: 'test-api-key-123',
        }));

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Check for BYOK overlay elements
        expect(screen.getByTestId('key-icon')).toBeInTheDocument();
        expect(screen.getByText('Using Your API Key')).toBeInTheDocument();
        expect(screen.getByText('No Usage Restrictions')).toBeInTheDocument();
        expect(screen.getByText(/You are using your own Gemini API key/)).toBeInTheDocument();
    });

    test('shows VT+ overlay when user has VT+ subscription but no API key', async () => {
        // Mock VT+ user (no API key, has VT+)
        useVtPlusAccess.mockReturnValue(true);
        useApiKeysStore.mockReturnValue(() => ({}));

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Check for VT+ overlay elements
        expect(screen.getByTestId('crown-icon')).toBeInTheDocument();
        expect(screen.getByText('VT+ Unlimited')).toBeInTheDocument();
        expect(screen.getByText('Unlimited Usage')).toBeInTheDocument();
        expect(screen.getByText(/Your VT\+ subscription provides unlimited access/)).toBeInTheDocument();
    });

    test('prioritizes BYOK over VT+ when user has both', async () => {
        // Mock user with both BYOK and VT+
        useVtPlusAccess.mockReturnValue(true);
        useApiKeysStore.mockReturnValue(() => ({
            GEMINI_API_KEY: 'test-api-key-123',
        }));

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Should show BYOK overlay (higher priority)
        expect(screen.getByTestId('key-icon')).toBeInTheDocument();
        expect(screen.getByText('Using Your API Key')).toBeInTheDocument();
        expect(screen.queryByTestId('crown-icon')).not.toBeInTheDocument();
    });

    test('shows normal usage meter when user has neither VT+ nor BYOK', async () => {
        // Mock regular user (no API key, no VT+)
        useVtPlusAccess.mockReturnValue(false);
        useApiKeysStore.mockReturnValue(() => ({}));

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Should not show any overlay
        expect(screen.queryByText('Using Your API Key')).not.toBeInTheDocument();
        expect(screen.queryByText('VT+ Unlimited')).not.toBeInTheDocument();
        expect(screen.queryByTestId('key-icon')).not.toBeInTheDocument();
        expect(screen.queryByTestId('crown-icon')).not.toBeInTheDocument();

        // Should show normal usage stats
        expect(screen.getByText('Daily Usage')).toBeInTheDocument();
        expect(screen.getByText('Current Activity')).toBeInTheDocument();
    });

    test('disables refresh button when user has unlimited access', async () => {
        // Mock VT+ user
        useVtPlusAccess.mockReturnValue(true);
        useApiKeysStore.mockReturnValue(() => ({}));

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Check if refresh button is disabled
        const refreshButton = screen.getByRole('button', { name: /refresh usage/i });
        expect(refreshButton).toBeDisabled();
    });

    test('hides VT+ upgrade CTA when user has unlimited access', async () => {
        // Mock VT+ user with high usage (which would normally trigger CTA)
        useVtPlusAccess.mockReturnValue(true);
        useApiKeysStore.mockReturnValue(() => ({}));
        
        // Mock high usage to trigger CTA
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                dailyUsed: 80, // High usage
                minuteUsed: 8,
                dailyLimit: 100,
                minuteLimit: 10,
                remainingDaily: 20,
                remainingMinute: 2,
                resetTime: {
                    daily: new Date().toISOString(),
                    minute: new Date().toISOString(),
                },
            }),
        });

        render(<RateLimitUsageMeter userId="test-user" />);

        // Wait for component to load
        await screen.findByText('Usage Overview');

        // Should not show upgrade CTA
        expect(screen.queryByText(/Upgrade to VT\+/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Loving VT\? Upgrade to VT\+ for More!/)).not.toBeInTheDocument();
    });
});
