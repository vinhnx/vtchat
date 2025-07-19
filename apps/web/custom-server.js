#!/usr/bin/env node

// Custom server wrapper for Next.js standalone mode
// Ensures proper hostname binding for Fly.io deployment

const { execSync } = require("node:child_process");
const path = require("node:path");

// Try to use the proper logger, fall back to console if not available in standalone build
let log;
try {
    const { log: pinoLog } = require("@repo/shared/lib/logger");
    log = pinoLog;
} catch {
    // Fallback logger for standalone build
    const IS_PRODUCTION = process.env.NODE_ENV === "production";

    log = {
        info: (msg, obj) => {
            if (IS_PRODUCTION) return;
            const timestamp = new Date().toISOString();
            if (typeof msg === "object") {
                console.log(`[${timestamp}] INFO:`, JSON.stringify(msg));
            } else if (obj) {
                console.log(`[${timestamp}] INFO: ${msg}`, JSON.stringify(obj));
            } else {
                console.log(`[${timestamp}] INFO: ${msg}`);
            }
        },
        error: (msg, obj) => {
            // Always log errors even in production
            const timestamp = new Date().toISOString();
            if (typeof msg === "object") {
                console.error(`[${timestamp}] ERROR:`, JSON.stringify(msg));
            } else if (obj) {
                console.error(`[${timestamp}] ERROR: ${msg}`, JSON.stringify(obj));
            } else {
                console.error(`[${timestamp}] ERROR: ${msg}`);
            }
        },
        warn: (msg, obj) => {
            // Always log warnings even in production
            const timestamp = new Date().toISOString();
            if (typeof msg === "object") {
                console.warn(`[${timestamp}] WARN:`, JSON.stringify(msg));
            } else if (obj) {
                console.warn(`[${timestamp}] WARN: ${msg}`, JSON.stringify(obj));
            } else {
                console.warn(`[${timestamp}] WARN: ${msg}`);
            }
        },
    };
}

// Set environment variables with fallbacks
const PORT = process.env.PORT || "3000";
const HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

log.info("=== CUSTOM SERVER START ===");
log.info(
    { PORT, HOSTNAME, NODE_ENV: process.env.NODE_ENV, cwd: process.cwd() },
    "Server environment configured",
);

// Verify server.js exists - Next.js standalone generates it at the root in production
const serverPath = path.join(process.cwd(), "server.js");
log.info({ serverPath }, "Checking for server file");

try {
    require("node:fs").accessSync(serverPath);
    log.info("Server file found");
} catch (error) {
    log.error({ error: error.message }, "Server file not found");
    log.info("Directory contents:");
    execSync("ls -la", { stdio: "inherit" });
    log.info("apps/web contents:");
    execSync("ls -la apps/web/", { stdio: "inherit" });
    process.exit(1);
}

// Set environment variables for the Next.js standalone server
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

log.info({ HOSTNAME, PORT }, "Starting Next.js server");
log.info("===========================");

// Start the Next.js standalone server - it's at the root in production
require("./server.js");
