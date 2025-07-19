// Simple logger implementation to replace console.log usage
// This is a minimal implementation to ensure build compatibility

interface LogFunction {
    (obj: any, msg?: string): void;
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
    const info: LogFunction = (obj: any, msg?: string) => {
        if (typeof obj === "string") {
            console.log(obj);
        } else {
            console.log(msg || "Info:", obj);
        }
    };

    const warn: LogFunction = (obj: any, msg?: string) => {
        if (typeof obj === "string") {
            console.warn(obj);
        } else {
            console.warn(msg || "Warn:", obj);
        }
    };

    const error: LogFunction = (obj: any, msg?: string) => {
        if (typeof obj === "string") {
            console.error(obj);
        } else {
            console.error(msg || "Error:", obj);
        }
    };

    const debug: LogFunction = (obj: any, msg?: string) => {
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
