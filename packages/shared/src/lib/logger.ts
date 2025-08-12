// Simple logger implementation to replace console.log usage
// This is a minimal implementation to ensure build compatibility
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

type LogFunction = (...args: any[]) => void;

interface Logger {
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    debug: LogFunction;
}

// Helper to determine parameter order and handle both patterns
const logMessage = (
    consoleMethod: (...args: any[]) => void,
    defaultPrefix: string,
    ...args: any[]
) => {
    if (args.length === 0) {
        consoleMethod(defaultPrefix);
        return;
    }

    if (args.length === 1) {
        const [arg] = args;
        if (typeof arg === 'string') {
            consoleMethod(arg);
        } else {
            consoleMethod(defaultPrefix, arg);
        }
        return;
    }

    if (args.length === 2) {
        const [first, second] = args;

        // Pattern: log.info({data}, "message")
        if (typeof first === 'object' && typeof second === 'string') {
            consoleMethod(second, first);
        } // Pattern: log.info("message", {data})
        else if (typeof first === 'string' && typeof second === 'object') {
            consoleMethod(first, second);
        } // Default: treat as message, data
        else {
            consoleMethod(first, second);
        }
        return;
    }

    // More than 2 args, just pass through
    consoleMethod(...args);
};

// Simple logger that wraps console methods
const createLogger = (): Logger => {
    const info: LogFunction = (...args: any[]) => {
        logMessage(console.log, 'Info:', ...args);
    };

    const warn: LogFunction = (...args: any[]) => {
        logMessage(console.warn, 'Warn:', ...args);
    };

    const error: LogFunction = (...args: any[]) => {
        // In development, use console.warn to avoid triggering error overlay for non-critical errors
        const logMethod = process.env.NODE_ENV === 'development' ? console.warn : console.error;
        logMessage(logMethod, 'Error:', ...args);
    };

    const debug: LogFunction = (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            logMessage(console.debug, 'Debug:', ...args);
        }
    };

    return { info, warn, error, debug };
};

export const log = createLogger();

// For compatibility with existing code
export default log;
