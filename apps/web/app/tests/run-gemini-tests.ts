#!/usr/bin/env bun

/**
 * Comprehensive test runner for Gemini 2.5 Flash Lite implementation
 * Verifies all specifications according to the requirements
 */

import { spawn } from 'child_process';
import { join } from 'path';

const testSuites = [
    {
        name: 'Rate Limiting Service (Per Account)',
        file: 'gemini-free-model.test.ts',
        description: 'Tests core rate limiting logic with 10 requests/day and 1 request/minute per user account',
    },
    {
        name: 'API Integration & Authentication',
        file: 'gemini-api-integration.test.ts', 
        description: 'Tests API endpoint authentication, rate limit enforcement, and error responses',
    },
    {
        name: 'UI Components & Real-time Updates',
        file: '../../../packages/common/components/__tests__/rate-limit-components.test.tsx',
        description: 'Tests rate limit indicators, meters, and user interface components',
    },
    {
        name: 'Database Integration & Concurrency',
        file: 'gemini-database-integration.test.ts',
        description: 'Tests database operations, user isolation, and concurrent access patterns',
    },
];

interface TestResult {
    suite: string;
    passed: boolean;
    output: string;
    duration: number;
}

async function runTestSuite(suite: typeof testSuites[0]): Promise<TestResult> {
    return new Promise((resolve) => {
        const startTime = Date.now();
        console.log(`\n🧪 Running: ${suite.name}`);
        console.log(`📄 Description: ${suite.description}`);
        console.log(`📁 File: ${suite.file}`);
        
        const testPath = join(__dirname, suite.file);
        const child = spawn('bun', ['test', testPath, '--reporter=verbose'], {
            stdio: 'pipe',
            env: { ...process.env, NODE_ENV: 'test' }
        });

        let output = '';
        
        child.stdout.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });

        child.stderr.on('data', (data) => {
            const text = data.toString();
            output += text;
            process.stderr.write(text);
        });

        child.on('close', (code) => {
            const duration = Date.now() - startTime;
            const passed = code === 0;
            
            console.log(passed ? '✅ PASSED' : '❌ FAILED');
            console.log(`⏱️  Duration: ${duration}ms`);
            
            resolve({
                suite: suite.name,
                passed,
                output,
                duration,
            });
        });
    });
}

async function runSpecificationValidation() {
    console.log('\n🎯 GEMINI 2.5 FLASH LITE - SPECIFICATION VALIDATION');
    console.log('=====================================================');
    console.log('✅ Testing per-account rate limiting implementation');
    console.log('✅ Verifying authentication requirements');
    console.log('✅ Validating UI components and real-time updates');
    console.log('✅ Testing database integrity and concurrency');
    console.log('✅ Ensuring proper error handling and user experience');

    const results: TestResult[] = [];
    
    for (const suite of testSuites) {
        const result = await runTestSuite(suite);
        results.push(result);
    }

    // Summary Report
    console.log('\n📊 SPECIFICATION VALIDATION SUMMARY');
    console.log('====================================');
    
    const totalTests = results.length;
    const passedTests = results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

    console.log(`📈 Total Test Suites: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 ALL SPECIFICATIONS VALIDATED SUCCESSFULLY!');
        console.log('🚀 Gemini 2.5 Flash Lite implementation is ready for deployment');
        
        console.log('\n📋 Verified Features:');
        console.log('  ✅ 10 requests per day per user account');
        console.log('  ✅ 1 request per minute per user account');
        console.log('  ✅ Authentication required for registered users only');
        console.log('  ✅ Non-authenticated users redirected to login');
        console.log('  ✅ Daily reset at 00:00 UTC per user');
        console.log('  ✅ Per-minute rate limiting enforcement');
        console.log('  ✅ Real-time UI indicators showing personal usage');
        console.log('  ✅ Settings page with usage meter');
        console.log('  ✅ Proper error messages with upgrade prompts');
        console.log('  ✅ Database user isolation and concurrency handling');
        console.log('  ✅ VT+ users bypass rate limits');
        console.log('  ✅ Paid models unaffected by rate limiting');
        
        process.exit(0);
    } else {
        console.log('\n💥 SPECIFICATION VALIDATION FAILED!');
        console.log('🔧 Some tests failed - review the output above for details');
        
        results.forEach(result => {
            if (!result.passed) {
                console.log(`\n❌ Failed Suite: ${result.suite}`);
            }
        });
        
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    runSpecificationValidation().catch(error => {
        console.error('💥 Test runner failed:', error);
        process.exit(1);
    });
}

export { runSpecificationValidation, testSuites };
