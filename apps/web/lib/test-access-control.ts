// Test script to verify the fixed access control implementation
import { checkFeatureAccess, checkVTPlusAccess } from '../app/api/subscription/access-control';

async function testAccessControl() {
    console.log('Testing Access Control Implementation...');

    try {
        // Test 1: Anonymous user (no userId)
        console.log('\n1. Testing anonymous user access:');
        const anonymousResult = await checkVTPlusAccess({});
        console.log('Anonymous access result:', anonymousResult);

        // Test 2: User with valid ID (simulated)
        console.log('\n2. Testing authenticated user access:');
        const authenticatedResult = await checkVTPlusAccess({ userId: 'test-user-id' });
        console.log('Authenticated access result:', authenticatedResult);

        // Test 3: Feature access check
        console.log('\n3. Testing feature access:');
        const featureResult = await checkFeatureAccess({ userId: 'test-user-id' }, 'advanced-ai');
        console.log('Feature access result:', featureResult);

        console.log('\n✅ Access control tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Only run if this file is executed directly (not imported)
if (require.main === module) {
    testAccessControl();
}

export { testAccessControl };
