import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Mock Next.js Image component completely
vi.mock('next/image', () => ({
    default: () => null, // Return null to avoid rendering issues
})); // Mock pdfjs-dist at the global level to prevent import issues
vi.mock('pdfjs-dist', () => ({
    getDocument: vi.fn().mockImplementation(() => ({
        promise: Promise.resolve({
            numPages: 1,
            getPage: vi.fn().mockImplementation(() =>
                Promise.resolve({
                    getTextContent: vi.fn().mockImplementation(() =>
                        Promise.resolve({
                            items: [{ str: 'mocked pdf text' }],
                        })
                    ),
                })
            ),
        }),
    })),
    GlobalWorkerOptions: { workerSrc: '' },
}));

// Mock IntersectionObserver for components that use it
beforeAll(() => {
    global.IntersectionObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));

    // Mock ResizeObserver for components that use it
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));

    // Mock matchMedia for responsive components
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });

    // Mock localStorage and sessionStorage
    const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
    };

    Object.defineProperty(window, 'localStorage', {
        writable: true,
        value: mockStorage,
    });

    Object.defineProperty(window, 'sessionStorage', {
        writable: true,
        value: mockStorage,
    });
});

// Clean up after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
