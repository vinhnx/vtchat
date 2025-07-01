#!/usr/bin/env node

/**
 * Test Vemetric connection and CORS configuration
 * Run with: bun scripts/test-vemetric-connection.js
 */

async function testVemetricConnection() {
    const token = process.env.NEXT_PUBLIC_VEMETRIC_TOKEN;
    
    if (!token) {
        console.error('❌ NEXT_PUBLIC_VEMETRIC_TOKEN not found');
        process.exit(1);
    }

    console.log('🔍 Testing Vemetric connection...');
    console.log(`Token: ${token.substring(0, 8)}...`);

    try {
        // Test the main endpoints
        const endpoints = [
            'https://hub.vemetric.com/l',
            'https://hub.vemetric.com/e'
        ];

        for (const endpoint of endpoints) {
            console.log(`\n📡 Testing ${endpoint}`);
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Origin': 'http://localhost:3000'
                },
                body: JSON.stringify({
                    test: true,
                    timestamp: Date.now()
                })
            });

            console.log(`Status: ${response.status}`);
            console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                console.log('✅ Connection successful');
            } else {
                console.log('❌ Connection failed');
                const text = await response.text();
                console.log('Response:', text);
            }
        }
    } catch (error) {
        console.error('❌ Connection error:', error.message);
        
        if (error.message.includes('CORS')) {
            console.log('\n🔧 CORS Issue Detected:');
            console.log('1. Check your Vemetric dashboard domain allowlist');
            console.log('2. Add your domain: localhost:3000, yourapp.com');
            console.log('3. Verify your token is valid');
        }
    }
}

testVemetricConnection().catch(console.error);
