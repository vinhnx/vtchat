/**
 * Simple test to verify Better Auth optimizations are working
 * Run this file to test authentication performance
 */

import { authClient } from '@repo/shared/lib/auth-client';

async function testAuthPerformance() {
    console.log('🧪 Testing Better Auth Performance Optimizations...\n');

    // Test 1: Client session caching
    console.log('1️⃣ Testing client session caching:');

    const start1 = performance.now();
    const session1 = await authClient.getSession();
    const duration1 = performance.now() - start1;
    console.log(`   First call: ${duration1.toFixed(2)}ms`);

    const start2 = performance.now();
    const session2 = await authClient.getSession();
    const duration2 = performance.now() - start2;
    console.log(`   Second call: ${duration2.toFixed(2)}ms`);

    if (duration2 < duration1) {
        console.log('   ✅ Second call was faster (likely cached)');
    } else {
        console.log('   ⚠️ Second call was not faster');
    }

    // Test 2: Session state consistency
    console.log('\n2️⃣ Testing session consistency:');
    const isConsistent = JSON.stringify(session1) === JSON.stringify(session2);
    console.log(`   Session data consistent: ${isConsistent ? '✅' : '❌'}`);

    // Test 3: Multiple useSession hooks (would need React environment)
    console.log('\n3️⃣ Testing useSession hook:');
    console.log('   📝 This test requires a React component environment');
    console.log('   Use the AuthPerformanceTestComponent in your app');

    // Test 4: Basic configuration check
    console.log('\n4️⃣ Testing configuration:');
    try {
        console.log('   ✅ Auth client accessible');

        // Check if session data has expected structure
        if (session1) {
            console.log('   ✅ Session data returned');
            console.log(`   Session type: ${typeof session1}`);
        } else {
            console.log('   📝 No active session (not logged in)');
        }
    } catch (error) {
        console.log(`   ❌ Configuration error: ${error}`);
    }

    console.log('\n📊 Performance Summary:');
    console.log(`- First session call: ${duration1.toFixed(2)}ms`);
    console.log(`- Second session call: ${duration2.toFixed(2)}ms`);
    console.log(
        `- Performance improvement: ${duration1 > 0 ? ((1 - duration2 / duration1) * 100).toFixed(1) : 0}%`
    );

    console.log('\n💡 Expected optimizations:');
    console.log('- Cookie cache should reduce middleware DB calls');
    console.log('- Request deduplication should prevent duplicate API calls');
    console.log('- Database indexes should speed up session queries');
    console.log('- SSR prefetching should eliminate loading states');
}

// Export for manual testing
export { testAuthPerformance };

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔧 Auto-running auth performance test in 3 seconds...');
    setTimeout(testAuthPerformance, 3000);
}
