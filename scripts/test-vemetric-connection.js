#!/usr/bin/env node

/**
 * Test Vemetric connection and CORS configuration
 * Run with: bun scripts/test-vemetric-connection.js
 */

const { log } = require('@repo/shared/logger');
const { getPublicBaseURL } = require('@repo/shared/config/baseUrl');

async function testVemetricConnection() {
    const token = process.env.NEXT_PUBLIC_VEMETRIC_TOKEN;

    if (!token) {
        console.error('❌ NEXT_PUBLIC_VEMETRIC_TOKEN not found');
        log.error('NEXT_PUBLIC_VEMETRIC_TOKEN not found');
        process.exit(1);
    }

    console.log('🔍 Testing Vemetric connection...');
    console.log(`Token: ${token.substring(0, 8)}...`);
    log.info('Starting Vemetric connection test');

    try {
        // Test the main endpoints
        const endpoints = ['https://hub.vemetric.com/l', 'https://hub.vemetric.com/e'];

        for (const endpoint of endpoints) {
            console.log(`\n📡 Testing ${endpoint}`);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                    Origin: getPublicBaseURL(),
                },
                body: JSON.stringify({
                    test: true,
                    timestamp: Date.now(),
                }),
            });

            console.log(`Status: ${response.status}`);
            console.log('Headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                console.log('✅ Connection successful');
                log.info({ endpoint }, 'Vemetric connection successful');
            } else {
                console.log('❌ Connection failed');
                const text = await response.text();
                console.log('Response:', text);
                log.error(
                    { endpoint, status: response.status, response: text },
                    'Vemetric connection failed'
                );
            }
        }
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        log.error({ error: error.message }, 'Vemetric connection error');

        if (error.message.includes('CORS')) {
            console.log('\n🔧 CORS Issue Detected:');
            console.log('1. Check your Vemetric dashboard domain allowlist');
            console.log(`2. Add your domain: ${getPublicBaseURL()}, yourapp.com`);
            console.log('3. Verify your token is valid');
            log.warn('CORS issue detected during Vemetric connection test');
        }
    }
}

testVemetricConnection().catch(console.error);
