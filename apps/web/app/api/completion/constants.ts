/**
 * Constants for SSE connection management
 */

// Heartbeat configuration (5-10s with jitter to avoid thundering herd)
export const HEARTBEAT_INTERVAL_MS = 7_000; // 7 seconds base interval
export const HEARTBEAT_JITTER_MS = 1_000; // ±1 second jitter
export const HEARTBEAT_COMMENT = ": heartbeat\n\n";

// Connection health check configuration
export const LARGE_PAYLOAD_THRESHOLD = 10_000; // bytes
export const PING_COMMENT = ": ping\n\n";
export const PING_TIMEOUT_MS = 500; // wait 500ms for enqueue() error detection

// Client-side reconnection configuration
export const CLIENT_HEARTBEAT_TIMEOUT_MS = 12_000; // 2x server heartbeat for grace window
export const MAX_RECONNECT_ATTEMPTS = 10;
export const INITIAL_RECONNECT_DELAY_MS = 400;
export const MAX_RECONNECT_DELAY_MS = 30_000;
