import { vi } from "vitest";

// Mock Next.js environment
process.env.NODE_ENV = "test";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";

// Mock environment variables for testing
process.env.GEMINI_API_KEY = "test-gemini-key";
process.env.LMSTUDIO_BASE_URL = "http://localhost:1234";
process.env.OLLAMA_BASE_URL = "http://127.0.0.1:11434";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.BETTER_AUTH_SECRET = "test-secret";
process.env.BETTER_AUTH_URL = "http://localhost:3000";

// Mock global fetch for API calls
global.fetch = vi.fn();

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, "crypto", {
    value: {
        randomUUID: vi.fn(() => "test-uuid-1234"),
    },
});

// Mock TextEncoder/TextDecoder for streaming tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock ReadableStream for streaming responses
global.ReadableStream = class MockReadableStream {
    constructor(underlyingSource: any) {
        this.underlyingSource = underlyingSource;
    }

    underlyingSource: any;

    getReader() {
        return {
            read: vi.fn().mockResolvedValue({ done: true, value: undefined }),
            releaseLock: vi.fn(),
        };
    }
};

// Mock AbortController
global.AbortController = class MockAbortController {
    signal = {
        aborted: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    };

    abort() {
        this.signal.aborted = true;
    }
};

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
console.log = vi.fn();
console.info = vi.fn();
console.warn = vi.fn();
console.error = vi.fn();

// Restore console for debugging when needed
export const restoreConsole = () => {
    Object.assign(console, originalConsole);
};

// Mock logger to prevent actual logging during tests
vi.mock("@repo/shared/logger", () => ({
    log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock the orchestrator to prevent complex workflow execution
vi.mock("@repo/orchestrator", () => ({
    createContext: vi.fn(() => ({})),
    createTypedEventEmitter: vi.fn(() => ({
        getAllState: vi.fn(() => ({})),
        emit: vi.fn(),
        on: vi.fn(),
    })),
    WorkflowBuilder: vi.fn(() => ({
        addTasks: vi.fn(),
        build: vi.fn(() => ({
            execute: vi.fn().mockResolvedValue({ success: true }),
        })),
    })),
}));

// Mock database to prevent connection issues
vi.mock("@/lib/database", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock Drizzle ORM
vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    sql: vi.fn(),
}));
