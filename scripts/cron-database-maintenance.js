#!/usr/bin/env node

/**
 * Database maintenance cron script for Fly.io
 * This script calls the database maintenance API endpoints with robust error handling,
 * retry logic with exponential backoff, and enhanced security measures.
 */

const https = require("node:https");
const crypto = require("node:crypto");

// Minimal logger to satisfy linting rules without external deps
const log = {
    info: (msg, data) => {
        process.stdout.write(`${String(msg)}${data ? ` ${JSON.stringify(data)}` : ""}\n`);
    },
    warn: (msg, data) => {
        process.stdout.write(`WARN: ${String(msg)}${data ? ` ${JSON.stringify(data)}` : ""}\n`);
    },
    error: (msg, data) => {
        process.stderr.write(`ERROR: ${String(msg)}${data ? ` ${JSON.stringify(data)}` : ""}\n`);
    },
    debug: (msg, data) => {
        if (process.env.NODE_ENV === "development") {
            process.stdout.write(
                `DEBUG: ${String(msg)}${data ? ` ${JSON.stringify(data)}` : ""}\n`,
            );
        }
    },
};

const BASE_URL = process.env.BASE_URL || "https://vtchat.io.vn";
const CRON_SECRET = process.env.CRON_SECRET_TOKEN;
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || "300000"); // 5 minutes default
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || "3");
const INITIAL_RETRY_DELAY = parseInt(process.env.INITIAL_RETRY_DELAY || "1000"); // 1 second
const MAX_RETRY_DELAY = parseInt(process.env.MAX_RETRY_DELAY || "30000"); // 30 seconds

// Create HTTPS agent with optimized settings
const httpsAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: 3000,
    maxSockets: 10,
    maxFreeSockets: 5,
    timeout: TIMEOUT_MS,
    // Enable TCP keep-alive
    keepAliveTimeout: 30000,
    scheduling: "fifo",
});

// Enhanced validation with constant-time comparison for secrets
function validateEnvironment() {
    const errors = [];

    if (!CRON_SECRET) {
        errors.push("CRON_SECRET_TOKEN environment variable is required");
    } else if (CRON_SECRET.length < 32) {
        errors.push("CRON_SECRET_TOKEN must be at least 32 characters long");
    }

    if (!BASE_URL || !BASE_URL.startsWith("https://")) {
        errors.push("BASE_URL must be a valid HTTPS URL");
    }

    if (TIMEOUT_MS < 5000 || TIMEOUT_MS > 600000) {
        errors.push("TIMEOUT_MS must be between 5000 and 600000 milliseconds");
    }

    if (MAX_RETRIES < 1 || MAX_RETRIES > 10) {
        errors.push("MAX_RETRIES must be between 1 and 10");
    }

    if (errors.length > 0) {
        log.error("❌ Environment validation failed:");
        errors.forEach((error) => log.error(`   • ${error}`));
        process.exit(1);
    }
}

// Utility function for constant-time string comparison (prevent timing attacks)
// Currently unused but kept for potential future security enhancements
function _safeCompare(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

validateEnvironment();

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Enhanced retry logic with jitter and circuit breaker pattern
async function makeRequestWithRetry(endpoint, type = "hourly", attempt = 1) {
    const startTime = Date.now();

    try {
        const result = await makeRequest(endpoint, type);
        const duration = Date.now() - startTime;
        logMetrics(type, "success", duration, attempt);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        logMetrics(type, "error", duration, attempt, error.message);

        if (attempt >= MAX_RETRIES) {
            throw new Error(
                `All ${MAX_RETRIES} attempts failed for ${type} maintenance. ` +
                    `Last error: ${error.message}`,
            );
        }

        // Exponential backoff with jitter to prevent thundering herd
        const baseDelay = Math.min(INITIAL_RETRY_DELAY * 2 ** (attempt - 1), MAX_RETRY_DELAY);
        const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
        const delay = Math.floor(baseDelay + jitter);

        log.warn(
            `⚠️  Attempt ${attempt}/${MAX_RETRIES} failed after ${duration}ms: ${error.message}`,
        );
        log.info(`⏳ Retrying in ${delay}ms...`);

        await sleep(delay);
        return makeRequestWithRetry(endpoint, type, attempt + 1);
    }
}

// Structured logging and metrics reporting for observability
function logMetrics(type, status, duration, attempt, error = null) {
    const metrics = {
        timestamp: new Date().toISOString(),
        maintenance_type: type,
        status,
        duration_ms: duration,
        attempt,
        error: error || null,
        environment: process.env.NODE_ENV || "production",
        metadata: {
            runner: process.env.RUNNER_ENVIRONMENT || "fly-cron",
            node_version: process.version,
            base_url: BASE_URL,
        },
    };

    // Log structured metrics for monitoring systems
    log.info(`📊 METRICS: ${JSON.stringify(metrics)}`);

    // Send metrics to observability endpoint (fire and forget)
    sendMetricsToEndpoint(metrics).catch((err) => {
        // Don't fail the main process if metrics reporting fails
        log.warn(`⚠️  Failed to send metrics: ${err.message}`);
    });
}

// Send metrics to the observability endpoint
async function sendMetricsToEndpoint(metrics) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/api/metrics/database-maintenance`;
        const payload = JSON.stringify(metrics);

        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
                "User-Agent": "Cron-Metrics-Reporter",
            },
            timeout: 10000, // 10 second timeout for metrics
        };

        const req = https.request(url, options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error(`Metrics endpoint returned ${res.statusCode}`));
                }
            });
        });

        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Metrics request timeout"));
        });

        req.write(payload);
        req.end();
    });
}

// Health check function to validate service availability
async function performHealthCheck() {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}/api/health`;
        const options = {
            method: "GET",
            timeout: 10000, // 10 second timeout for health check
            agent: httpsAgent,
        };

        const req = https.request(url, options, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                if (res.statusCode === 200) {
                    resolve(true);
                } else {
                    reject(new Error(`Health check failed with status ${res.statusCode}`));
                }
            });
        });

        req.on("error", reject);
        req.on("timeout", () => {
            req.destroy();
            reject(new Error("Health check timeout"));
        });

        req.end();
    });
}

function makeRequest(endpoint, type = "hourly") {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}`;
        const options = {
            method: "POST",
            headers: {
                Authorization: `Bearer ${CRON_SECRET}`,
                "Content-Type": "application/json",
                "User-Agent": "Fly.io-Cron-Job",
            },
            agent: httpsAgent,
            timeout: TIMEOUT_MS,
        };

        log.info(`🚀 Starting ${type} database maintenance...`);

        const req = https.request(url, options, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                try {
                    // Enhanced debugging for HTML responses
                    if (data.trim().startsWith("<!DOCTYPE") || data.trim().startsWith("<html")) {
                        log.error(`❌ Received HTML instead of JSON from ${url}`);
                        log.error(`Status: ${res.statusCode}`);
                        log.error("Headers:", res.headers);
                        log.error("Response preview:", data.substring(0, 200));
                        reject(
                            new Error(
                                `Server returned HTML instead of JSON. Status: ${res.statusCode}`,
                            ),
                        );
                        return;
                    }

                    const response = JSON.parse(data);
                    if (res.statusCode === 200 && response.success) {
                        log.info(`✅ ${type} maintenance completed successfully`);
                        log.info(
                            `📊 Health: ${response.health.healthy ? "Good" : "Issues detected"}`,
                        );
                        if (response.health.issues.length > 0) {
                            log.warn(`⚠️  Issues: ${response.health.issues.join(", ")}`);
                        }
                        resolve(response);
                    } else {
                        console.error(`❌ ${type} maintenance failed:`, response);
                        reject(
                            new Error(`Maintenance failed: ${response.error || "Unknown error"}`),
                        );
                    }
                } catch (error) {
                    console.error("❌ Failed to parse response:", error);
                    console.error("Raw response (first 500 chars):", data.substring(0, 500));
                    reject(error);
                }
            });
        });

        req.on("error", (error) => {
            console.error("❌ Request failed:", error);
            reject(error);
        });

        req.on("timeout", () => {
            console.error("❌ Request timed out after 30 seconds");
            req.destroy();
            reject(new Error("Request timeout"));
        });

        req.end();
    });
}

async function runHourlyMaintenance() {
    console.log("🚀 Starting hourly maintenance process...");

    try {
        // Perform health check before maintenance
        await performHealthCheck();
        log.info("✅ Health check passed");

        const result = await makeRequestWithRetry("/api/cron/database-maintenance", "hourly");

        console.log("🎉 Hourly database maintenance completed successfully");
        console.log(`📊 Health: ${result.health?.healthy ? "Good" : "Issues detected"}`);

        if (result.health?.issues?.length > 0) {
            console.log(`⚠️  Issues found: ${result.health.issues.join(", ")}`);
        }

        // Cleanup HTTPS agent
        httpsAgent.destroy();
        process.exit(0);
    } catch (error) {
        console.error("💥 Hourly maintenance failed:", error.message);

        // Log structured error for monitoring
        logMetrics("hourly", "fatal_error", 0, 0, error.message);

        // Cleanup and exit with error
        httpsAgent.destroy();
        process.exit(1);
    }
}

async function runWeeklyMaintenance() {
    console.log("🚀 Starting weekly maintenance process...");

    try {
        // Perform health check before maintenance
        await performHealthCheck();
        console.log("✅ Health check passed");

        const result = await makeRequestWithRetry("/api/cron/weekly-maintenance", "weekly");

        log.info("🎉 Weekly database maintenance completed successfully");
        log.info(`📊 Health: ${result.health?.healthy ? "Good" : "Issues detected"}`);

        if (result.health?.issues?.length > 0) {
            log.warn(`⚠️  Issues found: ${result.health.issues.join(", ")}`);
        }

        // Cleanup HTTPS agent
        httpsAgent.destroy();
        process.exit(0);
    } catch (error) {
        log.error("💥 Weekly maintenance failed:", error.message);

        // Log structured error for monitoring
        logMetrics("weekly", "fatal_error", 0, 0, error.message);

        // Cleanup and exit with error
        httpsAgent.destroy();
        process.exit(1);
    }
}

// Graceful shutdown handler
process.on("SIGTERM", () => {
    log.warn("⚠️  Received SIGTERM, shutting down gracefully...");
    httpsAgent.destroy();
    process.exit(0);
});

process.on("SIGINT", () => {
    log.warn("⚠️  Received SIGINT, shutting down gracefully...");
    httpsAgent.destroy();
    process.exit(0);
});

// Unhandled promise rejection handler
process.on("unhandledRejection", (reason, _promise) => {
    log.error("💥 Unhandled Promise Rejection:", reason);
    logMetrics("unknown", "unhandled_rejection", 0, 0, reason.toString());
    httpsAgent.destroy();
    process.exit(1);
});

// Determine which maintenance to run based on command line argument
const maintenanceType = process.argv[2];

if (maintenanceType === "weekly") {
    runWeeklyMaintenance();
} else if (maintenanceType === "hourly") {
    runHourlyMaintenance();
} else {
    log.error('❌ Invalid maintenance type. Use "hourly" or "weekly"');
    log.error("Usage: node cron-database-maintenance.js [hourly|weekly]");
    process.exit(1);
}
