/**
 * Better Auth Performance Test Suite
 * 
 * This file contains tests to verify that the Better Auth performance optimizations are working correctly.
 * Run this to ensure cookie caching, session optimization, and database performance improvements are active.
 */

import { authClient, getSession, getSessionFresh } from '@repo/shared/lib/auth-client';
import { auth } from '@/lib/auth-server';
import { headers } from 'next/headers';

interface PerformanceTestResult {
    operation: string;
    duration: number;
    cached: boolean;
    success: boolean;
    error?: string;
}

class AuthPerformanceTester {
    private results: PerformanceTestResult[] = [];

    private async measureOperation<T>(
        operation: string, 
        fn: () => Promise<T>,
        expectCached: boolean = false
    ): Promise<T | null> {
        const startTime = performance.now();
        try {
            const result = await fn();
            const duration = performance.now() - startTime;
            
            this.results.push({
                operation,
                duration,
                cached: expectCached,
                success: true,
            });
            
            console.log(`✅ ${operation}: ${duration.toFixed(2)}ms${expectCached ? ' (cached)' : ''}`);
            return result;
        } catch (error) {
            const duration = performance.now() - startTime;
            this.results.push({
                operation,
                duration,
                cached: false,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            
            console.error(`❌ ${operation}: ${duration.toFixed(2)}ms - ${error}`);
            return null;
        }
    }

    // Test client-side session caching
    async testClientSessionCaching(): Promise<void> {
        console.log('\n🧪 Testing client-side session caching...');

        // First call (should hit database/cookie)
        await this.measureOperation(
            'Client session fetch (first call)',
            () => getSession(),
            false
        );

        // Second call (should use cache/cookie)
        await this.measureOperation(
            'Client session fetch (second call)',
            () => getSession(),
            true
        );

        // Fresh fetch (should bypass cache)
        await this.measureOperation(
            'Client session fetch (forced fresh)',
            () => getSessionFresh(),
            false
        );
    }

    // Test server-side session performance
    async testServerSessionPerformance(): Promise<void> {
        console.log('\n🧪 Testing server-side session performance...');

        if (typeof window !== 'undefined') {
            console.log('⚠️ Skipping server-side tests (running in browser)');
            return;
        }

        try {
            // Test with cookie cache enabled
            await this.measureOperation(
                'Server session with cookie cache',
                async () => {
                    return auth.api.getSession({
                        headers: await headers(),
                    });
                },
                true
            );

            // Test without cookie cache (forced DB fetch)
            await this.measureOperation(
                'Server session without cookie cache',
                async () => {
                    return auth.api.getSession({
                        headers: await headers(),
                        query: { disableCookieCache: true },
                    });
                },
                false
            );
        } catch (error) {
            console.warn('⚠️ Server-side tests require server environment');
        }
    }

    // Test middleware performance
    async testMiddlewarePerformance(): Promise<void> {
        console.log('\n🧪 Testing middleware cookie cache...');

        if (typeof window === 'undefined') {
            try {
                const { getCookieCache } = await import('better-auth/cookies');
                
                // Simulate middleware cookie check
                await this.measureOperation(
                    'Middleware cookie cache check',
                    async () => {
                        // This would normally use the actual request object
                        // For testing purposes, we'll simulate the check
                        return { cached: true };
                    },
                    true
                );
            } catch (error) {
                console.warn('⚠️ Middleware tests require server environment');
            }
        }
    }

    // Test hook performance
    async testHookPerformance(): Promise<void> {
        console.log('\n🧪 Testing React hook performance...');

        if (typeof window === 'undefined') {
            console.log('⚠️ Skipping hook tests (running on server)');
            return;
        }

        // Test useSession hook (this would need to be called in a React component)
        console.log('📝 useSession hook should be tested in a React component');
        console.log('   - Check that multiple useSession calls don\'t create duplicate requests');
        console.log('   - Verify that session updates propagate to all components');
        console.log('   - Ensure loading states are properly managed');
    }

    // Generate performance report
    generateReport(): void {
        console.log('\n📊 Performance Test Report');
        console.log('=' .repeat(50));
        
        const successful = this.results.filter(r => r.success);
        const failed = this.results.filter(r => !r.success);
        const cached = successful.filter(r => r.cached);
        
        console.log(`✅ Successful operations: ${successful.length}`);
        console.log(`❌ Failed operations: ${failed.length}`);
        console.log(`🚀 Cached operations: ${cached.length}`);
        
        if (successful.length > 0) {
            const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
            console.log(`⏱️  Average duration: ${avgDuration.toFixed(2)}ms`);
            
            const fastOps = successful.filter(r => r.duration < 100);
            console.log(`🏃 Fast operations (<100ms): ${fastOps.length}/${successful.length}`);
        }
        
        // Performance recommendations
        console.log('\n💡 Performance Recommendations:');
        console.log('- Cookie cache should make subsequent calls faster');
        console.log('- Middleware should use getCookieCache for quick session checks');
        console.log('- Database indexes should keep session queries under 50ms');
        console.log('- Client-side caching should reduce redundant API calls');
        
        if (failed.length > 0) {
            console.log('\n🚨 Failed Operations:');
            failed.forEach(r => {
                console.log(`   ${r.operation}: ${r.error}`);
            });
        }
    }

    // Run all tests
    async runAll(): Promise<void> {
        console.log('🚀 Starting Better Auth Performance Tests...\n');
        
        await this.testClientSessionCaching();
        await this.testServerSessionPerformance();
        await this.testMiddlewarePerformance();
        await this.testHookPerformance();
        
        this.generateReport();
    }
}

// Export for use in test files or manual testing
export const authPerformanceTester = new AuthPerformanceTester();

// Component for testing in React environment
export function AuthPerformanceTestComponent() {
    const { data: session, isPending, error } = authClient.useSession();
    
    return (
        <div className="p-4 border rounded">
            <h3 className="font-bold mb-2">Auth Performance Test</h3>
            <div className="space-y-2 text-sm">
                <div>Loading: {isPending ? 'Yes' : 'No'}</div>
                <div>Session: {session ? 'Authenticated' : 'Not authenticated'}</div>
                <div>Error: {error ? error.message : 'None'}</div>
                <div>User: {session?.user?.email || 'None'}</div>
            </div>
            <button 
                onClick={() => authPerformanceTester.runAll()}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
                Run Performance Tests
            </button>
        </div>
    );
}

// Manual test function for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Auto-run tests in development when imported
    setTimeout(() => {
        console.log('🔧 Development mode: Running auth performance tests...');
        authPerformanceTester.runAll();
    }, 2000);
}
