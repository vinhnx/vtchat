import pino from 'pino';
import type { Logger as PinoLogger } from 'pino';

// PII fields to redact from logs
const PII_FIELDS = [
    'apiKey',
    'api_key',
    'apiKeys',
    'token',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'password',
    'secret',
    'authorization',
    'Authorization',
    'email',
    'phone',
    'phoneNumber',
    'creditCard',
    'ssn',
    'sessionId',
    'session_id',
    'userId',
    'user_id'
];

// Function to mask PII data
const maskPII = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
        // For strings, partially mask if they look like sensitive data
        if (obj.length > 8) {
            return `${obj.slice(0, 4)}****${obj.slice(-4)}`;
        }
        return '****';
    }
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map(maskPII);
    }

    const masked: any = {};
    for (const [key, value] of Object.entries(obj)) {
        if (PII_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            masked[key] = typeof value === 'string' && value.length > 8 
                ? `${value.slice(0, 4)}****${value.slice(-4)}`
                : '****';
        } else {
            masked[key] = maskPII(value);
        }
    }
    return masked;
};

// Create Pino logger with proper configuration
const createPinoLogger = (): PinoLogger => {
    const isDev = process.env.NODE_ENV === 'development';
    const isTest = process.env.NODE_ENV === 'test';

    // Don't log anything in test environment unless explicitly enabled
    if (isTest && !process.env.ENABLE_TEST_LOGGING) {
        return pino({ enabled: false });
    }

    return pino({
        level: isDev ? 'debug' : 'info',
        enabled: isDev, // Only log in development by default
        transport: isDev ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
                singleLine: false,
                hideObject: false
            }
        } : undefined,
        redact: {
            paths: PII_FIELDS,
            censor: (value, path) => {
                if (typeof value === 'string' && value.length > 8) {
                    return `${value.slice(0, 4)}****${value.slice(-4)}`;
                }
                return '****';
            }
        },
        serializers: {
            error: (error: Error) => ({
                type: error.constructor.name,
                message: error.message,
                stack: error.stack,
                ...(error.cause && { cause: error.cause })
            })
        },
        base: {
            env: process.env.NODE_ENV,
            service: 'vtchat'
        },
        timestamp: pino.stdTimeFunctions.isoTime
    });
};

// Enhanced logger interface that matches our existing usage patterns
type LogFunction = (obj: any, msg?: string) => void;
type LogFunctionOverloaded = {
    (msg: string): void;
    (obj: any, msg?: string): void;
    (...args: any[]): void;
};

interface Logger {
    info: LogFunctionOverloaded;
    warn: LogFunctionOverloaded;
    error: LogFunctionOverloaded;
    debug: LogFunctionOverloaded;
    fatal: LogFunctionOverloaded;
}

const pinoLogger = createPinoLogger();

// Create wrapper functions that handle multiple argument patterns
const createLogMethod = (level: 'info' | 'warn' | 'error' | 'debug' | 'fatal') => {
    return (...args: any[]): void => {
        const logFn = pinoLogger[level] as any;
        if (!logFn || typeof logFn !== 'function') {
            return;
        }

        if (args.length === 0) {
            return;
        }

        // Single argument - could be string or object
        if (args.length === 1) {
            const [arg] = args;
            if (typeof arg === 'string') {
                logFn(arg);
            } else {
                logFn(maskPII(arg));
            }
            return;
        }

        // Two arguments - handle different patterns
        if (args.length === 2) {
            const [first, second] = args;
            
            // Pattern: log.info({data}, "message") - Pino standard
            if (typeof first === 'object' && first !== null && typeof second === 'string') {
                logFn(maskPII(first), second);
            } 
            // Pattern: log.info("message", {data}) - alternative
            else if (typeof first === 'string' && typeof second === 'object') {
                logFn(maskPII(second), first);
            } 
            // Other combinations
            else {
                logFn({ arg1: first, arg2: second });
            }
            return;
        }

        // More than 2 args - treat as structured data
        if (args.length > 2) {
            const [first, ...rest] = args;
            if (typeof first === 'string') {
                logFn({ data: rest.map(maskPII) }, first);
            } else {
                logFn({ data: args.map(maskPII) });
            }
        }
    };
};

// Enhanced logger implementation
const createLogger = (): Logger => {
    return {
        info: createLogMethod('info'),
        warn: createLogMethod('warn'),
        error: createLogMethod('error'),
        debug: createLogMethod('debug'),
        fatal: createLogMethod('fatal')
    };
};

export const log = createLogger();

// Utility function for logging errors with context
export const logError = (error: Error | unknown, context?: Record<string, any>, message?: string): void => {
    const errorData: Record<string, any> = {};
    
    if (context) {
        const maskedContext = maskPII(context);
        Object.assign(errorData, maskedContext);
    }

    if (error instanceof Error) {
        errorData.error = {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error.cause && { cause: error.cause })
        };
    } else {
        errorData.error = { message: String(error), type: typeof error };
    }

    log.error(errorData, message || 'An error occurred');
};

// Utility function for logging with performance metrics
export const logWithTiming = (
    operation: string,
    startTime: number,
    context?: Record<string, any>
): void => {
    const duration = Date.now() - startTime;
    log.info(
        {
            operation,
            duration_ms: duration,
            ...(context && maskPII(context))
        },
        `Operation completed: ${operation}`
    );
};

// For compatibility with existing code
export default log;
