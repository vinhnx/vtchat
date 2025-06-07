type LogContext = Record<string, any>;

export const logger = {
    // Log errors to console only
    error: (message: string, error?: any, context: LogContext = {}) => {
        console.error(message, error, context);
    },

    // For important operational events
    info: (message: string, context: LogContext = {}) => {
        console.log(message, context);
    },

    // For potential issues that aren't errors
    warn: (message: string, context: LogContext = {}) => {
        console.warn(message, context);
    },

    // Only use locally, never in production
    debug: (message: string, context: LogContext = {}) => {
        if (process.env.LOG_LEVEL === 'debug' || process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, context);
        }
    },
};
