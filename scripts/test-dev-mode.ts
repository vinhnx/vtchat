#!/usr/bin/env bun

/**
 * DEV TEST MODE Verification Script
 *
 * This script tests the DEV TEST MODE functionality across the application
 */

import { isDevTestMode } from '@repo/shared/utils';

// Test environment variables
const testCases = [
    { env: 'true', expected: true, description: 'DEV TEST MODE enabled' },
    { env: 'false', expected: false, description: 'DEV TEST MODE disabled' },
    { env: undefined, expected: false, description: 'DEV TEST MODE not set' },
    { env: 'TRUE', expected: false, description: 'Case sensitive check' },
    { env: '1', expected: false, description: 'Numeric value should be false' },
];

console.log('🚧 DEV TEST MODE Verification\n');

for (const testCase of testCases) {
    // Set environment variable
    if (testCase.env !== undefined) {
        process.env.NEXT_PUBLIC_DEV_TEST_MODE = testCase.env;
    } else {
        delete process.env.NEXT_PUBLIC_DEV_TEST_MODE;
    }

    const result = isDevTestMode();
    const status = result === testCase.expected ? '✅' : '❌';

    console.log(`${status} ${testCase.description}`);
    console.log(`   ENV: ${testCase.env || 'undefined'}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Actual: ${result}`);
    console.log();
}

// Test the bypass functionality
console.log('🔧 Testing Bypass Functions\n');

// Test with DEV TEST MODE enabled
process.env.NEXT_PUBLIC_DEV_TEST_MODE = 'true';

console.log('✅ DEV TEST MODE enabled:');
console.log(`   isDevTestMode(): ${isDevTestMode()}`);

// Test with DEV TEST MODE disabled
process.env.NEXT_PUBLIC_DEV_TEST_MODE = 'false';

console.log('❌ DEV TEST MODE disabled:');
console.log(`   isDevTestMode(): ${isDevTestMode()}`);

console.log('\n🎉 DEV TEST MODE verification complete!');
console.log('\nTo enable DEV TEST MODE in your application:');
console.log('1. Set NEXT_PUBLIC_DEV_TEST_MODE=true in your .env file');
console.log('2. Restart your development server');
console.log('3. All restrictions will be bypassed automatically');
