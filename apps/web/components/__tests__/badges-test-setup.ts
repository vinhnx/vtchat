import { vi } from 'vitest';

// Mock Next.js Image at the top level before any imports
vi.mock('next/image', () => ({
    __esModule: true,
    default: () => {
        // Don't return JSX, return a plain object that React can understand
        return null;
    },
}));

// Mock useState to see if the hook issue is specific to Image or all hooks
vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react');
    return {
        ...actual,
        useState: vi.fn((initial) => [initial, vi.fn()]),
    };
});
