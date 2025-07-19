import { log } from "@repo/shared/logger";
import { useCallback, useEffect, useRef } from "react";
import {
    CLIENT_HEARTBEAT_TIMEOUT_MS,
    INITIAL_RECONNECT_DELAY_MS,
    MAX_RECONNECT_ATTEMPTS,
    MAX_RECONNECT_DELAY_MS,
} from "@/app/api/completion/constants";

interface UseEventSourceOptions {
    onEvent?: (ev: MessageEvent) => void;
    onError?: (ev: Event) => void;
    onOpen?: (ev: Event) => void;
    onClose?: () => void;
    heartbeatInterval?: number;
    maxRetries?: number;
    autoReconnect?: boolean;
    reconnectDelay?: number;
    maxReconnectDelay?: number;
}

interface EventSourceState {
    readyState: number;
    retryCount: number;
    isReconnecting: boolean;
}

/**
 * Enhanced EventSource hook with automatic reconnection, debouncing, and heartbeat monitoring
 */
export function useEventSource(url: string, options: UseEventSourceOptions = {}) {
    const {
        onEvent,
        onError,
        onOpen,
        onClose,
        heartbeatInterval = CLIENT_HEARTBEAT_TIMEOUT_MS,
        maxRetries = MAX_RECONNECT_ATTEMPTS,
        autoReconnect = true,
        reconnectDelay = INITIAL_RECONNECT_DELAY_MS,
        maxReconnectDelay = MAX_RECONNECT_DELAY_MS,
    } = options;

    const esRef = useRef<EventSource | null>(null);
    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
    const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
    const retriesRef = useRef(0);
    const lastHeartbeatRef = useRef(Date.now());
    const isManuallyClosedRef = useRef(false);
    const stateRef = useRef<EventSourceState>({
        readyState: EventSource.CONNECTING,
        retryCount: 0,
        isReconnecting: false,
    });

    // Clear all timers
    const clearTimers = useCallback(() => {
        if (retryTimerRef.current) {
            clearTimeout(retryTimerRef.current);
            retryTimerRef.current = null;
        }
        if (heartbeatTimerRef.current) {
            clearInterval(heartbeatTimerRef.current);
            heartbeatTimerRef.current = null;
        }
    }, []);

    // Open connection
    const open = useCallback(() => {
        if (esRef.current) {
            esRef.current.close();
        }

        const eventSource = new EventSource(url);
        esRef.current = eventSource;
        stateRef.current.readyState = EventSource.CONNECTING;

        eventSource.onopen = (ev) => {
            log.debug("SSE connection opened");
            retriesRef.current = 0;
            stateRef.current.retryCount = 0;
            stateRef.current.isReconnecting = false;
            stateRef.current.readyState = EventSource.OPEN;
            lastHeartbeatRef.current = Date.now();
            onOpen?.(ev);
        };

        eventSource.onmessage = (ev) => {
            lastHeartbeatRef.current = Date.now();

            // Handle heartbeat and ping messages
            if (ev.data === "heartbeat" || ev.data === "ping") {
                log.debug("SSE heartbeat/ping received");
                return;
            }

            onEvent?.(ev);
        };

        eventSource.addEventListener("done", () => {
            log.debug("SSE stream completed");
            // Server finished successfully - stop retry loop
            retriesRef.current = 0;
            stateRef.current.retryCount = 0;
            clearTimers();
        });

        eventSource.onerror = (ev) => {
            log.warn("SSE connection error");
            stateRef.current.readyState = EventSource.CLOSED;
            onError?.(ev);

            if (!isManuallyClosedRef.current && autoReconnect) {
                scheduleReconnect();
            }
        };
    }, [url, onEvent, onError, onOpen, autoReconnect, clearTimers, scheduleReconnect]);

    // Schedule reconnect with exponential backoff
    const scheduleReconnect = useCallback(() => {
        if (retriesRef.current >= maxRetries) {
            log.warn("Max reconnection attempts reached");
            onClose?.();
            return;
        }

        if (retryTimerRef.current) {
            return; // Already scheduled
        }

        const delay = Math.min(maxReconnectDelay, reconnectDelay * 2 ** retriesRef.current);

        log.debug({ delay, attempt: retriesRef.current + 1 }, "Scheduling SSE reconnection");
        stateRef.current.isReconnecting = true;

        retryTimerRef.current = setTimeout(() => {
            retriesRef.current += 1;
            stateRef.current.retryCount = retriesRef.current;
            retryTimerRef.current = null;
            open();
        }, delay);
    }, [maxRetries, reconnectDelay, maxReconnectDelay, onClose, open]);

    // Heartbeat watchdog - catches silent connection drops
    useEffect(() => {
        heartbeatTimerRef.current = setInterval(() => {
            if (
                esRef.current?.readyState === EventSource.OPEN &&
                Date.now() - lastHeartbeatRef.current > heartbeatInterval
            ) {
                log.warn("SSE heartbeat timeout, reconnecting");
                scheduleReconnect();
            }
        }, heartbeatInterval / 2); // Check twice as often as expected heartbeat

        return () => {
            if (heartbeatTimerRef.current) {
                clearInterval(heartbeatTimerRef.current);
            }
        };
    }, [heartbeatInterval, scheduleReconnect]);

    // Close connection manually
    const close = useCallback(() => {
        log.debug("Manually closing SSE connection");
        isManuallyClosedRef.current = true;
        clearTimers();
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }
        stateRef.current.readyState = EventSource.CLOSED;
        onClose?.();
    }, [clearTimers, onClose]);

    // Retry connection manually
    const retry = useCallback(() => {
        if (isManuallyClosedRef.current) {
            isManuallyClosedRef.current = false;
        }
        retriesRef.current = 0;
        stateRef.current.retryCount = 0;
        clearTimers();
        open();
    }, [clearTimers, open]);

    // Get current state
    const getState = useCallback((): EventSourceState => {
        return {
            readyState: esRef.current?.readyState ?? EventSource.CLOSED,
            retryCount: stateRef.current.retryCount,
            isReconnecting: stateRef.current.isReconnecting,
        };
    }, []);

    // Setup lifecycle
    useEffect(() => {
        if (!isManuallyClosedRef.current) {
            open();
        }

        // Handle page unload
        const handleBeforeUnload = () => {
            log.debug("Page unloading, closing SSE connection");
            close();
            // Optional: Send beacon to notify server
            if (esRef.current && url.includes("threadId=")) {
                const urlParams = new URLSearchParams(url.split("?")[1] || "");
                const threadId = urlParams.get("threadId");
                if (threadId) {
                    navigator.sendBeacon("/api/completion/abort", JSON.stringify({ threadId }));
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                // Page is hidden, consider closing connection to save resources
                log.debug("Page hidden, SSE connection remains open");
            } else if (document.visibilityState === "visible") {
                // Page is visible again, ensure connection is healthy
                if (
                    esRef.current?.readyState !== EventSource.OPEN &&
                    !isManuallyClosedRef.current
                ) {
                    log.debug("Page visible, checking SSE connection");
                    retry();
                }
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            close();
        };
    }, [url, open, close, retry]);

    return {
        close,
        retry,
        getState,
        eventSource: esRef.current,
    };
}
