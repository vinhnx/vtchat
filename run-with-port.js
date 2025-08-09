#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables
process.env.PORT = '12000';
process.env.HOSTNAME = '0.0.0.0';
process.env.NEXT_PUBLIC_ALLOW_IFRAME = 'true';

// Run the Next.js dev server with the custom port
const nextDev = spawn('bun', ['--bun', 'node_modules/.bin/next', 'dev', '-p', '12000', '-H', '0.0.0.0'], {
  cwd: path.join(__dirname, 'apps/web'),
  stdio: 'inherit',
  env: process.env
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping development server...');
  nextDev.kill('SIGINT');
});

nextDev.on('close', (code) => {
  console.log(`Development server exited with code ${code}`);
  process.exit(code);
});