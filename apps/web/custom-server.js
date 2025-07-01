#!/usr/bin/env node

// Custom server wrapper for Next.js standalone mode
// Ensures proper hostname binding for Fly.io deployment

const { execSync } = require('child_process');
const path = require('path');
const { log } = require('@repo/shared/logger');

// Set environment variables with fallbacks
const PORT = process.env.PORT || '3000';
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

log.info('=== CUSTOM SERVER START ===');
log.info({ PORT, HOSTNAME, NODE_ENV: process.env.NODE_ENV, cwd: process.cwd() }, 'Server environment configured');

// Verify server.js exists - Next.js standalone generates it at the root in production
const serverPath = path.join(process.cwd(), 'server.js');
log.info({ serverPath }, 'Checking for server file');

try {
    require('fs').accessSync(serverPath);
    log.info('Server file found');
} catch (error) {
    log.error({ error: error.message }, 'Server file not found');
    log.info('Directory contents:');
    execSync('ls -la', { stdio: 'inherit' });
    log.info('apps/web contents:');
    execSync('ls -la apps/web/', { stdio: 'inherit' });
    process.exit(1);
}

// Set environment variables for the Next.js standalone server
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

log.info({ HOSTNAME, PORT }, 'Starting Next.js server');
log.info('===========================');

// Start the Next.js standalone server - it's at the root in production
require('./server.js');
