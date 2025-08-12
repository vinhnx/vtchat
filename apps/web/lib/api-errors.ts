import { log } from '@repo/shared/logger';
import { NextResponse } from 'next/server';

/**
 * Standardized API error responses
 */
export const ApiErrorResponses = {
    NOT_FOUND: {
        error: 'Not Found',
        message: 'The requested resource was not found.',
        status: 404,
    },
    UNAUTHORIZED: {
        error: 'Unauthorized',
        message: 'Authentication required.',
        status: 401,
    },
    FORBIDDEN: {
        error: 'Forbidden',
        message: 'Access denied.',
        status: 403,
    },
    BAD_REQUEST: {
        error: 'Bad Request',
        message: 'The request is invalid.',
        status: 400,
    },
    INTERNAL_ERROR: {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred.',
        status: 500,
    },
    METHOD_NOT_ALLOWED: {
        error: 'Method Not Allowed',
        message: 'This HTTP method is not supported for this endpoint.',
        status: 405,
    },
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
    errorType: keyof typeof ApiErrorResponses,
    customMessage?: string,
    details?: Record<string, unknown>,
) {
    const errorConfig = ApiErrorResponses[errorType];

    const response = {
        ...errorConfig,
        message: customMessage || errorConfig.message,
        ...(details && { details }),
        timestamp: new Date().toISOString(),
    };

    // Log the error for monitoring
    log.error(
        {
            errorType,
            status: errorConfig.status,
            message: response.message,
            details,
        },
        'API error response',
    );

    return NextResponse.json(response, { status: errorConfig.status });
}

/**
 * Generic API error handler wrapper
 */
export function withErrorHandling<T extends unknown[], R>(handler: (...args: T) => Promise<R>) {
    return async (...args: T): Promise<R | NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            log.error({ error }, 'Unhandled API error');

            return createErrorResponse(
                'INTERNAL_ERROR',
                'An unexpected error occurred. Please try again later.',
            );
        }
    };
}
