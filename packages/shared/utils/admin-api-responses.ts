import { NextResponse } from "next/server";
import { log } from "@repo/shared/lib/logger";

/**
 * Standardized API response utilities for admin routes
 * Provides consistent error messages, status codes, and response formats
 */

export interface ApiError {
    error: string;
    code?: string;
    details?: unknown;
}

export interface ApiSuccess<T = unknown> {
    data?: T;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
        limit?: number;
        [key: string]: unknown;
    };
}

/**
 * Standard admin API error responses
 */
export const AdminApiResponses = {
    /**
     * 401 Unauthorized - User not authenticated
     */
    unauthorized: (message = "Unauthorized") =>
        NextResponse.json({ error: message } as ApiError, { status: 401 }),

    /**
     * 403 Forbidden - User authenticated but not authorized
     */
    forbidden: (message = "Forbidden") =>
        NextResponse.json({ error: message } as ApiError, { status: 403 }),

    /**
     * 400 Bad Request - Invalid request data
     */
    badRequest: (message = "Bad Request", details?: unknown) =>
        NextResponse.json({ error: message, details } as ApiError, { status: 400 }),

    /**
     * 404 Not Found - Resource not found
     */
    notFound: (message = "Not Found") =>
        NextResponse.json({ error: message } as ApiError, { status: 404 }),

    /**
     * 409 Conflict - Resource conflict
     */
    conflict: (message = "Conflict", details?: unknown) =>
        NextResponse.json({ error: message, details } as ApiError, { status: 409 }),

    /**
     * 422 Unprocessable Entity - Validation error
     */
    validationError: (message = "Validation Error", details?: unknown) =>
        NextResponse.json({ error: message, details } as ApiError, { status: 422 }),

    /**
     * 429 Too Many Requests - Rate limit exceeded
     */
    rateLimited: (message = "Too Many Requests") =>
        NextResponse.json({ error: message } as ApiError, { status: 429 }),

    /**
     * 500 Internal Server Error - Generic server error
     */
    internalError: (message = "Internal Server Error", details?: unknown) =>
        NextResponse.json({ error: message, details } as ApiError, { status: 500 }),

    /**
     * 503 Service Unavailable - Service temporarily unavailable
     */
    serviceUnavailable: (message = "Service Unavailable") =>
        NextResponse.json({ error: message } as ApiError, { status: 503 }),
} as const;

/**
 * Standard admin API success responses
 */
export const AdminApiSuccess = {
    /**
     * 200 OK - Success with data
     */
    ok: <T>(data: T, message?: string) =>
        NextResponse.json({ data, message } as ApiSuccess<T>, { status: 200 }),

    /**
     * 201 Created - Resource created successfully
     */
    created: <T>(data: T, message = "Created successfully") =>
        NextResponse.json({ data, message } as ApiSuccess<T>, { status: 201 }),

    /**
     * 202 Accepted - Request accepted for processing
     */
    accepted: (message = "Request accepted") =>
        NextResponse.json({ message } as ApiSuccess, { status: 202 }),

    /**
     * 204 No Content - Success with no response body
     */
    noContent: () => new NextResponse(null, { status: 204 }),

    /**
     * Paginated response with metadata
     */
    paginated: <T>(
        data: T[],
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages?: number;
            hasNext?: boolean;
            hasPrev?: boolean;
        },
    ) => {
        const totalPages = Math.ceil(meta.total / meta.limit);
        const hasNext = meta.page < totalPages;
        const hasPrev = meta.page > 1;

        return NextResponse.json(
            {
                data,
                meta: {
                    ...meta,
                    totalPages,
                    hasNext,
                    hasPrev,
                },
            } as ApiSuccess<T[]>,
            { status: 200 },
        );
    },
} as const;

/**
 * Helper function to handle common admin route patterns
 */
export function handleAdminRouteError(error: unknown, context?: string): NextResponse {
    if (error instanceof Error) {
        // Log the error with context using structured logging
        log.error({ error, context }, `Admin route error${context ? ` in ${context}` : ""}`);

        // Return appropriate error response based on error type
        if (error.name === "ValidationError") {
            return AdminApiResponses.validationError(error.message);
        }

        if (error.name === "NotFoundError") {
            return AdminApiResponses.notFound(error.message);
        }

        if (error.name === "ConflictError") {
            return AdminApiResponses.conflict(error.message);
        }

        // Generic server error for unknown errors
        return AdminApiResponses.internalError("An unexpected error occurred");
    }

    // Handle non-Error objects
    log.error({ error, context }, `Admin route error${context ? ` in ${context}` : ""}`);
    return AdminApiResponses.internalError("An unexpected error occurred");
}

/**
 * Type-safe wrapper for admin route handlers
 */
export type AdminRouteHandler<T = unknown> = () => Promise<T>;

/**
 * Execute admin route handler with standardized error handling
 */
export async function executeAdminRoute<T>(
    handler: AdminRouteHandler<T>,
    context?: string,
): Promise<NextResponse> {
    try {
        const result = await handler();
        return AdminApiSuccess.ok(result);
    } catch (error) {
        return handleAdminRouteError(error, context);
    }
}

/**
 * Common response messages for admin operations
 */
export const AdminMessages = {
    USER_UPDATED: "User updated successfully",
    USER_DELETED: "User deleted successfully",
    USER_BANNED: "User banned successfully",
    USER_UNBANNED: "User unbanned successfully",
    SESSION_REVOKED: "Session revoked successfully",
    OPERATION_COMPLETED: "Operation completed successfully",
    DATA_EXPORTED: "Data exported successfully",
    SETTINGS_UPDATED: "Settings updated successfully",
    CACHE_CLEARED: "Cache cleared successfully",
} as const;
