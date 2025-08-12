import { vi } from 'vitest';

// Mock Next.js environment
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock environment variables for testing
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.LMSTUDIO_BASE_URL = 'http://localhost:1234';
process.env.OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.BETTER_AUTH_SECRET = 'test-secret';
process.env.BETTER_AUTH_URL = 'http://localhost:3000';

// Mock global fetch for API calls
global.fetch = vi.fn();

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: vi.fn(() => 'test-uuid-1234'),
    },
});

// Mock TextEncoder/TextDecoder for streaming tests
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock ReadableStream for streaming responses
global.ReadableStream = class MockReadableStream {
    locked = false;
    constructor(underlyingSource: unknown) {
        this.underlyingSource = underlyingSource;
    }
    underlyingSource: unknown;
    cancel(): Promise<void> {
        return Promise.resolve();
    }
    pipeTo(): Promise<void> {
        return Promise.resolve();
    }
    pipeThrough(): MockReadableStream {
        return this;
    }
    tee(): void {}
    getReader(): {
        read: () => Promise<{ done: true; value: undefined; }>;
        releaseLock: () => void;
        closed: Promise<void>;
        cancel: () => Promise<void>;
    } {
        return {
            read: async () => ({ done: true, value: undefined }),
            releaseLock: () => {},
            closed: Promise.resolve(),
            cancel: () => Promise.resolve(),
        };
    }
};

// Mock AbortController
global.AbortController = class MockAbortController {
    signal = {
        aborted: false,
        addEventListener: () => {},
        removeEventListener: () => {},
        onabort: null,
        reason: null,
        throwIfAborted: () => {},
        dispatchEvent: () => false,
    };
    abort(): void {}
};

// Mock logger to prevent actual logging during tests
vi.mock('@repo/shared/logger', () => ({
    log: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

// Mock the orchestrator to prevent complex workflow execution
vi.mock('@repo/orchestrator', () => ({
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
vi.mock('@/lib/database', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

// Mock Drizzle ORM
vi.mock('drizzle-orm', () => ({
    eq: vi.fn(),
    and: vi.fn(),
    or: vi.fn(),
    sql: vi.fn(),
}));
