#!/usr/bin/env node

// Custom server wrapper for Next.js standalone mode
// Ensures proper hostname binding for Fly.io deployment

const { execSync } = require('node:child_process');
const path = require('node:path');

// Try to use the proper logger, fall back to console if not available in standalone build
let log;
try {
    const { log: pinoLog } = require('@repo/shared/src/lib/logger');
    log = pinoLog;
} catch {
    // Fallback logger for standalone build
    const IS_PRODUCTION = process.env.NODE_ENV === 'production';

    // Fallback logger that mimics Pino's structured logging interface
    log = {
        info: (obj, msg) => {
            if (IS_PRODUCTION) return;
            const timestamp = new Date().toISOString();
            if (typeof obj === 'object' && obj !== null) {
                // eslint-disable-next-line no-console
                console.log(`[${timestamp}] INFO: ${msg || 'Info'}`, JSON.stringify(obj, null, 2));
            } else {
                // If first param is string, treat as message
                // eslint-disable-next-line no-console
                console.log(`[${timestamp}] INFO: ${obj}`);
            }
        },
        error: (obj, msg) => {
            // Always log errors even in production
            const timestamp = new Date().toISOString();
            if (typeof obj === 'object' && obj !== null) {
                // eslint-disable-next-line no-console
                console.error(`[${timestamp}] ERROR: ${msg || 'Error'}`, JSON.stringify(obj, null, 2));
            } else {
                // eslint-disable-next-line no-console
                console.error(`[${timestamp}] ERROR: ${obj}`);
            }
        },
        warn: (obj, msg) => {
            // Always log warnings even in production
            const timestamp = new Date().toISOString();
            if (typeof obj === 'object' && obj !== null) {
                // eslint-disable-next-line no-console
                console.warn(`[${timestamp}] WARN: ${msg || 'Warning'}`, JSON.stringify(obj, null, 2));
            } else {
                // eslint-disable-next-line no-console
                console.warn(`[${timestamp}] WARN: ${obj}`);
            }
        },
    };
}

// Set environment variables with fallbacks
const PORT = process.env.PORT || '3000';
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

log.info('=== CUSTOM SERVER START ===');
log.info(
    { PORT, HOSTNAME, NODE_ENV: process.env.NODE_ENV, cwd: process.cwd() },
    'Server environment configured',
);

// Verify server.js exists - check multiple possible locations
const possibleServerPaths = [
    path.join(process.cwd(), 'server.js'), // Root level (expected in standalone)
    path.join(process.cwd(), 'apps/web/server.js'), // In apps/web directory
    path.join(__dirname, 'server.js'), // Same directory as custom-server.js
];

let serverPath = null;
for (const testPath of possibleServerPaths) {
    try {
        require('node:fs').accessSync(testPath);
        serverPath = testPath;
        log.info({ serverPath }, 'Server file found');
        break;
    } catch {
        // Continue to next path
    }
}

if (!serverPath) {
    log.error('Server file not found in any expected location');
    log.info('Directory contents:');
    execSync('ls -la', { stdio: 'inherit' });
    log.info('apps/web contents:');
    execSync('ls -la apps/web/', { stdio: 'inherit' });
    process.exit(1);
}

// Set environment variables for the Next.js standalone server
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

log.info({ HOSTNAME, PORT, serverPath }, 'Starting Next.js server');
log.info('===========================');

// Start the Next.js standalone server
require(serverPath);
