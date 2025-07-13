import { beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Global test setup for Gemini 2.5 Flash Lite tests
beforeEach(() => {
    // Clear all mocks between tests
    vi.clearAllMocks();

    // Reset system time
    vi.useRealTimers();

    // Mock environment variables
    process.env.NODE_ENV = "test";
    process.env.GEMINI_API_KEY = "test-gemini-key";
    process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";

    // Mock crypto.randomUUID for consistent test IDs
    if (!global.crypto) {
        global.crypto = {
            randomUUID: vi.fn(() => "test-uuid-123"),
        } as any;
    }
});

// Mock ResizeObserver for UI tests
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock IntersectionObserver for UI tests
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock window.location for redirect tests
Object.defineProperty(window, "location", {
    value: {
        href: "http://localhost:3000",
        assign: vi.fn(),
        reload: vi.fn(),
    },
    writable: true,
});
