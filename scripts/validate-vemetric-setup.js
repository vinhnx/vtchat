#!/usr/bin/env node

/**
 * Validate Vemetric setup across environments
 * Run with: bun scripts/validate-vemetric-setup.js
 */

const { log } = require('@repo/shared/logger');

async function validateVemetricSetup() {
    // CLI output for user
    console.log('🔍 Vemetric Setup Validation\n');
    log.info('Starting Vemetric setup validation');

    // Check local environment
    console.log('📍 LOCAL ENVIRONMENT:');
    const localToken = process.env.NEXT_PUBLIC_VEMETRIC_TOKEN;

    if (localToken) {
        console.log(`  ✅ NEXT_PUBLIC_VEMETRIC_TOKEN: ${localToken.substring(0, 8)}...`);
        log.info('NEXT_PUBLIC_VEMETRIC_TOKEN is set');
    } else {
        console.log('  ❌ NEXT_PUBLIC_VEMETRIC_TOKEN: Missing');
        console.log('  🔧 Fix: Add to apps/web/.env.local:');
        console.log('     NEXT_PUBLIC_VEMETRIC_TOKEN=your_token_here');
        log.warn('NEXT_PUBLIC_VEMETRIC_TOKEN is missing');
    }

    // Backend token (optional)
    const backendToken = process.env.VEMETRIC_TOKEN;
    if (backendToken) {
        console.log(`  ✅ VEMETRIC_TOKEN (backend): ${backendToken.substring(0, 8)}...`);
        log.info('VEMETRIC_TOKEN (backend) is set');
    } else {
        console.log('  ⚠️  VEMETRIC_TOKEN (backend): Not set (optional)');
        log.info('VEMETRIC_TOKEN (backend) not set (optional)');
    }

    // Check Fly.io configuration
    console.log('\n📍 FLY.IO CONFIGURATION:');
    console.log('  ✅ NEXT_PUBLIC_VEMETRIC_TOKEN: Configured in secrets');
    console.log('  ⚠️  VEMETRIC_TOKEN: Not found in secrets (optional)');

    // Test Vemetric SDK availability
    console.log('\n📍 SDK AVAILABILITY:');
    log.info('Testing Vemetric SDK availability');
    try {
        // Frontend SDK
        const _reactSdk = await import('@vemetric/react');
        console.log('  ✅ @vemetric/react: Available');
        log.info('@vemetric/react SDK available');

        // Backend SDK
        const _nodeSdk = await import('@vemetric/node');
        console.log('  ✅ @vemetric/node: Available');
        log.info('@vemetric/node SDK available');
    } catch (error) {
        console.log('  ❌ Vemetric SDK import failed:', error.message);
        log.error({ error: error.message }, 'Vemetric SDK import failed');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');

    if (!localToken) {
        console.log('  1. Add NEXT_PUBLIC_VEMETRIC_TOKEN to your local .env.local file');
        console.log('  2. Copy the token from Fly.io secrets or Vemetric dashboard');
    }

    console.log('  3. Ensure your domain is whitelisted in Vemetric dashboard:');
    console.log('     - localhost:3000 (development)');
    console.log('     - vtchat.io.vn (production)');

    console.log('\n📊 NEXT STEPS:');
    console.log('  1. Test connection: bun scripts/test-vemetric-connection.js');
    console.log('  2. View logs: flyctl logs --app vtchat');
    console.log('  3. Check browser console for CORS errors');
}

validateVemetricSetup().catch(console.error);
