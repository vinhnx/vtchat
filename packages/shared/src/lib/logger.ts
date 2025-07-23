// Simple logger implementation to replace console.log usage
// This is a minimal implementation to ensure build compatibility
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

type LogData = string | Record<string, unknown> | Error | unknown;

interface LogFunction {
    (obj: LogData, msg?: string): void;
    (msg: string): void;
}

interface Logger {
    info: LogFunction;
    warn: LogFunction;
    error: LogFunction;
    debug: LogFunction;
}

// Simple logger that wraps console methods
const createLogger = (): Logger => {
    const info: LogFunction = (obj: LogData, msg?: string) => {
        if (typeof obj === "string") {
            console.log(obj);
        } else {
            console.log(msg || "Info:", obj);
        }
    };

    const warn: LogFunction = (obj: LogData, msg?: string) => {
        if (typeof obj === "string") {
            console.warn(obj);
        } else {
            console.warn(msg || "Warn:", obj);
        }
    };

    const error: LogFunction = (obj: LogData, msg?: string) => {
        // In development, use console.warn to avoid triggering error overlay for non-critical errors
        const logMethod = process.env.NODE_ENV === "development" ? console.warn : console.error;

        if (typeof obj === "string") {
            logMethod(obj);
        } else {
            // Handle empty or meaningless error objects
            if (obj && typeof obj === "object" && Object.keys(obj).length === 0) {
                logMethod(msg || "Error:", "Empty error object");
            } else {
                logMethod(msg || "Error:", obj);
            }
        }
    };

    const debug: LogFunction = (obj: LogData, msg?: string) => {
        if (process.env.NODE_ENV === "development") {
            if (typeof obj === "string") {
                console.debug(obj);
            } else {
                console.debug(msg || "Debug:", obj);
            }
        }
    };

    return { info, warn, error, debug };
};

export const log = createLogger();

// For compatibility with existing code
export default log;
