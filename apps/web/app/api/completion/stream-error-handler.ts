import { VtPlusFeature } from "@repo/common/config/vtPlusLimits";
import { log } from "@repo/shared/logger";
import { sendMessage } from "./stream-handlers";
import type { CompletionData, StreamController } from "./types";

/**
 * Stream Error Handler Enums
 *
 * This module defines enum constants to replace string literals throughout
 * the error handling system for better type safety and maintainability.
 */
export enum StreamErrorStatus {
    ERROR = "error",
    ABORTED = "aborted",
    QUOTA_EXCEEDED = "quota_exceeded",
}

export enum StreamResponseType {
    DONE = "done",
}

export enum ErrorName {
    QUOTA_EXCEEDED_ERROR = "QuotaExceededError",
    TYPE_ERROR = "TypeError",
    TIMEOUT_ERROR = "TimeoutError",
    UNKNOWN_ERROR = "UnknownError",
}

export enum NetworkErrorKeywords {
    FETCH = "fetch",
    NETWORK = "network",
    ECONNRESET = "ECONNRESET",
    ECONNREFUSED = "ECONNREFUSED",
    ETIMEDOUT = "ETIMEDOUT",
}

export enum RateLimitErrorKeywords {
    RATE_LIMIT = "rate limit",
    TOO_MANY_REQUESTS = "too many requests",
}

export enum AuthErrorKeywords {
    UNAUTHORIZED = "unauthorized",
    INVALID_API_KEY = "invalid api key",
    FORBIDDEN = "forbidden",
    API_KEY_REQUIRED = "api key required",
    MISSING_API_KEY = "missing api key",
}

export enum ServiceErrorKeywords {
    MODEL_NOT_FOUND = "model not found",
    SERVICE_UNAVAILABLE = "service unavailable",
}

export enum StreamErrorKeywords {
    STREAM = "stream",
    CONTROLLER = "controller",
    ENQUEUE = "enqueue",
    CLOSED = "closed",
    UNREF = "unref",
}

export enum TimeoutErrorKeywords {
    TIMEOUT = "timeout",
    TIMEOUT_UPPER = "TIMEOUT",
}

export enum VTPlusQuotaKeywords {
    VT_PLUS_QUOTA_EXCEEDED = "VT+ quota exceeded",
    QUOTA_EXCEEDED_FOR = "quota exceeded for",
}

export enum HttpStatusCodes {
    UNAUTHORIZED = "401",
    FORBIDDEN = "403",
    TOO_MANY_REQUESTS = "429",
    BAD_GATEWAY = "502",
    SERVICE_UNAVAILABLE = "503",
    GATEWAY_TIMEOUT = "504",
}

export interface StreamErrorContext {
    error: unknown;
    controller: StreamController;
    encoder: TextEncoder;
    data: CompletionData;
    userId?: string;
    abortController: AbortController;
}

export interface StreamErrorResponse {
    type: StreamResponseType.DONE;
    status: StreamErrorStatus;
    error: string;
    threadId: string;
    threadItemId: string;
    parentThreadItemId?: string;
}

/**
 * Categorizes and handles different types of streaming errors with specific messages
 */
export async function handleStreamError({
    error,
    controller,
    encoder,
    data,
    userId,
    abortController,
}: StreamErrorContext): Promise<StreamErrorResponse> {
    const errorString = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : ErrorName.UNKNOWN_ERROR;

    // Abort/Cancellation errors
    if (abortController.signal.aborted) {
        log.info({ userId, threadId: data.threadId }, "Request aborted by client or timeout");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ABORTED,
            error: "Request was cancelled",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // VT+ Quota exceeded errors
    if (
        errorName === ErrorName.QUOTA_EXCEEDED_ERROR ||
        errorString.includes(VTPlusQuotaKeywords.VT_PLUS_QUOTA_EXCEEDED) ||
        errorString.includes(VTPlusQuotaKeywords.QUOTA_EXCEEDED_FOR)
    ) {
        log.warn({ error, userId, threadId: data.threadId }, "VT+ quota exceeded during request");

        let errorMessage = "VT+ quota exceeded. Please check your usage limits.";
        const resetMessage = "Your quota will reset tomorrow.";

        if (errorString.includes(VtPlusFeature.DEEP_RESEARCH)) {
            errorMessage =
                "Daily Deep Research limit reached (10/10). Try Pro Search or regular chat.";
        } else if (errorString.includes(VtPlusFeature.PRO_SEARCH)) {
            errorMessage =
                "Daily Pro Search limit reached (20/20). Try regular chat or Deep Research.";
        }

        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.QUOTA_EXCEEDED,
            error: `${errorMessage} ${resetMessage}`,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Network/Connection errors
    if (
        errorString.includes(NetworkErrorKeywords.FETCH) ||
        errorString.includes(NetworkErrorKeywords.NETWORK) ||
        errorString.includes(NetworkErrorKeywords.ECONNRESET) ||
        errorString.includes(NetworkErrorKeywords.ECONNREFUSED) ||
        errorString.includes(NetworkErrorKeywords.ETIMEDOUT)
    ) {
        log.error({ error, userId, threadId: data.threadId }, "Network error during streaming");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "Network connection error. Please check your internet connection and try again.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Rate limit errors
    if (
        errorString.includes(RateLimitErrorKeywords.RATE_LIMIT) ||
        errorString.includes(HttpStatusCodes.TOO_MANY_REQUESTS) ||
        errorString.includes(RateLimitErrorKeywords.TOO_MANY_REQUESTS)
    ) {
        log.warn({ error, userId, threadId: data.threadId }, "Rate limit error during streaming");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "Rate limit exceeded. Please wait a moment before trying again.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // API key/Authentication errors
    if (
        errorString.includes(AuthErrorKeywords.UNAUTHORIZED) ||
        errorString.includes(AuthErrorKeywords.INVALID_API_KEY) ||
        errorString.includes(AuthErrorKeywords.FORBIDDEN) ||
        errorString.includes(AuthErrorKeywords.API_KEY_REQUIRED) ||
        errorString.includes(AuthErrorKeywords.MISSING_API_KEY) ||
        errorString.includes(HttpStatusCodes.UNAUTHORIZED) ||
        errorString.includes(HttpStatusCodes.FORBIDDEN)
    ) {
        log.error(
            { error, userId, threadId: data.threadId },
            "Authentication error during streaming",
        );

        // Provide more specific error messages based on error type
        let errorMessage = "API authentication failed. Please check your API keys in Settings.";

        if (
            errorString.includes(AuthErrorKeywords.MISSING_API_KEY) ||
            errorString.includes(AuthErrorKeywords.API_KEY_REQUIRED)
        ) {
            errorMessage =
                "API key required for this model. Add your API key in Settings → API Keys to continue.";
        } else if (
            errorString.includes(AuthErrorKeywords.INVALID_API_KEY) ||
            errorString.includes(HttpStatusCodes.UNAUTHORIZED)
        ) {
            errorMessage =
                "Invalid API key. Please verify your API key is correct and hasn't expired in Settings → API Keys.";
        } else if (errorString.includes(HttpStatusCodes.FORBIDDEN)) {
            errorMessage =
                "API key doesn't have permission for this model. Check your account billing status or try a different model.";
        }

        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: errorMessage,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Model/Service specific errors
    if (
        errorString.includes(ServiceErrorKeywords.MODEL_NOT_FOUND) ||
        errorString.includes(ServiceErrorKeywords.SERVICE_UNAVAILABLE) ||
        errorString.includes(HttpStatusCodes.BAD_GATEWAY) ||
        errorString.includes(HttpStatusCodes.SERVICE_UNAVAILABLE) ||
        errorString.includes(HttpStatusCodes.GATEWAY_TIMEOUT)
    ) {
        log.error({ error, userId, threadId: data.threadId }, "AI service error during streaming");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "AI service temporarily unavailable. Please try a different model or try again later.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // ReadableStream specific errors
    if (
        errorName === ErrorName.TYPE_ERROR &&
        (errorString.includes(StreamErrorKeywords.STREAM) ||
            errorString.includes(StreamErrorKeywords.CONTROLLER))
    ) {
        log.error({ error, userId, threadId: data.threadId }, "Stream controller error");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "Streaming connection interrupted. Please refresh the page and try again.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Timeout errors
    if (
        errorString.includes(TimeoutErrorKeywords.TIMEOUT) ||
        errorString.includes(TimeoutErrorKeywords.TIMEOUT_UPPER) ||
        errorName === ErrorName.TIMEOUT_ERROR
    ) {
        log.warn({ error, userId, threadId: data.threadId }, "Request timeout during streaming");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "Request timed out. Please try again with a shorter prompt or different model.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Bun/Node.js compatibility errors (unref function)
    if (errorName === ErrorName.TYPE_ERROR && errorString.includes(StreamErrorKeywords.UNREF)) {
        log.warn({ error, userId, threadId: data.threadId }, "Runtime compatibility error (unref)");
        const response: StreamErrorResponse = {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ERROR,
            error: "Runtime compatibility issue detected. Please refresh the page and try again.",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
        await sendMessage(controller, encoder, response);
        return response;
    }

    // Controller closed/invalid state errors
    if (
        errorName === ErrorName.TYPE_ERROR &&
        (errorString.includes(StreamErrorKeywords.ENQUEUE) ||
            errorString.includes(StreamErrorKeywords.CLOSED))
    ) {
        log.info({ error, userId, threadId: data.threadId }, "Stream controller already closed");
        // Don't try to send message since controller is closed
        return {
            type: StreamResponseType.DONE,
            status: StreamErrorStatus.ABORTED,
            error: "Connection closed by client",
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        };
    }

    // Generic fallback for unknown errors
    log.error(
        {
            error,
            errorName,
            errorString,
            userId,
            threadId: data.threadId,
            mode: data.mode,
        },
        "Unknown error during streaming",
    );

    const response: StreamErrorResponse = {
        type: StreamResponseType.DONE,
        status: StreamErrorStatus.ERROR,
        error: "An unexpected error occurred. Please try again or contact support if the issue persists.",
        threadId: data.threadId,
        threadItemId: data.threadItemId,
        parentThreadItemId: data.parentThreadItemId,
    };

    try {
        await sendMessage(controller, encoder, response);
    } catch (sendError) {
        log.error({ sendError, originalError: error }, "Failed to send error message to stream");
    }

    return response;
}
