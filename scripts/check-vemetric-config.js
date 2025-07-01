#!/usr/bin/env node

/**
 * Check Vemetric configuration
 * Run with: bun scripts/check-vemetric-config.js
 */

const { log } = require('@repo/shared/logger');

function checkVemetricConfig() {
    console.log('🔧 Vemetric Configuration Check\n');
    log.info('Starting Vemetric configuration check');

    const checks = [
        {
            name: 'NEXT_PUBLIC_VEMETRIC_TOKEN',
            value: process.env.NEXT_PUBLIC_VEMETRIC_TOKEN,
            required: true
        },
        {
            name: 'VEMETRIC_TOKEN (backend)',
            value: process.env.VEMETRIC_TOKEN,
            required: false
        },
        {
            name: 'VEMETRIC_HOST',
            value: process.env.VEMETRIC_HOST,
            required: false,
            default: 'https://hub.vemetric.com'
        }
    ];

    let allGood = true;

    checks.forEach(check => {
        console.log(`${check.name}:`);
        
        if (check.value) {
            const masked = check.value.length > 8 
                ? `${check.value.substring(0, 8)}...` 
                : check.value;
            console.log(`  ✅ Set: ${masked}`);
        } else if (check.required) {
            console.log(`  ❌ Missing (required)`);
            allGood = false;
        } else {
            const defaultText = check.default ? ` (using default: ${check.default})` : '';
            console.log(`  ⚠️  Not set${defaultText}`);
        }
        console.log();
    });

    if (allGood) {
        console.log('✅ Configuration looks good!');
        console.log('\nIf you\'re still seeing CORS errors:');
        console.log('1. Check Vemetric dashboard domain allowlist');
        console.log('2. Run: bun scripts/test-vemetric-connection.js');
        log.info('Vemetric configuration check passed');
    } else {
        console.log('❌ Configuration issues detected');
        console.log('Add missing environment variables to your .env.local file');
        log.warn('Vemetric configuration issues detected');
    }
}

checkVemetricConfig();
