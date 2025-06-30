#!/usr/bin/env node

// Custom server wrapper for Next.js standalone mode
// Ensures proper hostname binding for Fly.io deployment

const { execSync } = require('child_process');
const path = require('path');

// Set environment variables with fallbacks
const PORT = process.env.PORT || '3000';
const HOSTNAME = process.env.HOSTNAME || '0.0.0.0';

console.log('=== CUSTOM SERVER START ===');
console.log('PORT:', PORT);
console.log('HOSTNAME:', HOSTNAME);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', process.cwd());

// Verify server.js exists
const serverPath = path.join(process.cwd(), 'apps/web/server.js');
console.log('Server path:', serverPath);

try {
    require('fs').accessSync(serverPath);
    console.log('Server file found');
} catch (error) {
    console.error('Server file not found:', error.message);
    console.log('Directory contents:');
    execSync('ls -la', { stdio: 'inherit' });
    console.log('apps/web contents:');
    execSync('ls -la apps/web/', { stdio: 'inherit' });
    process.exit(1);
}

// Set environment variables for the Next.js standalone server
process.env.PORT = PORT;
process.env.HOSTNAME = HOSTNAME;

console.log(`Starting Next.js server on ${HOSTNAME}:${PORT}...`);
console.log('===========================');

// Start the Next.js standalone server
require('./apps/web/server.js');
