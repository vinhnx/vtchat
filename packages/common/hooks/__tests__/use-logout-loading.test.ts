import { act, renderHook } from '@testing-library/react';
import { useLogout } from '../use-logout';

// Mock the dependencies
jest.mock('@repo/shared/lib/auth-client', () => ({
    signOut: jest.fn(() => Promise.resolve()),
}));

jest.mock('next-themes', () => ({
    useTheme: () => ({
        setTheme: jest.fn(),
    }),
}));

jest.mock('../store/api-keys.store', () => ({
    useApiKeysStore: () => ({
        clearAllKeys: jest.fn(),
    }),
}));

jest.mock('../store/chat.store', () => ({
    useChatStore: () => ({
        clearAllThreads: jest.fn(() => Promise.resolve()),
    }),
}));

jest.mock('../store/app.store', () => ({
    useAppStore: () => ({
        resetUserState: jest.fn(),
    }),
}));

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
    })
) as jest.Mock;

// Mock window.location.reload
Object.defineProperty(window, 'location', {
    value: {
        reload: jest.fn(),
    },
    writable: true,
});

describe('useLogout loading state', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should manage loading state during logout', async () => {
        const { result } = renderHook(() => useLogout());

        // Initially, should not be logging out
        expect(result.current.isLoggingOut).toBe(false);

        // Start logout
        act(() => {
            result.current.logout();
        });

        // Should be logging out immediately
        expect(result.current.isLoggingOut).toBe(true);

        // Wait for logout to complete
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
        });

        // Should not be logging out after completion
        expect(result.current.isLoggingOut).toBe(false);
    });

    it('should prevent multiple simultaneous logout attempts', async () => {
        const { result } = renderHook(() => useLogout());

        // Start first logout
        act(() => {
            result.current.logout();
        });

        expect(result.current.isLoggingOut).toBe(true);

        // Try to start second logout while first is in progress
        act(() => {
            result.current.logout();
        });

        // Should still be logging out (second call should be ignored)
        expect(result.current.isLoggingOut).toBe(true);
    });
});
