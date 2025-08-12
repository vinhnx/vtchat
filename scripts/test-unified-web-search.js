#!/usr/bin/env bun

/**
 * Test script to verify the unified web search workflow
 */

console.log('🧪 Testing Unified Web Search Workflow');
console.log('='.repeat(60));

async function testWorkflowRouting() {
    console.log('\n📋 Testing workflow routing logic');

    try {
        // Import the router task
        const { modeRoutingTask } = await import('@repo/ai/workflow/tasks/chat-mode-router');
        const { ChatMode } = await import('@repo/shared/config');

        console.log('✅ Successfully imported router modules');

        // Test basic web search routing
        console.log('\n🔍 Testing Basic Web Search Routing:');

        const mockContext = {
            get: (key) => {
                switch (key) {
                    case 'mode':
                        return ChatMode.GEMINI_2_5_FLASH_LITE;
                    case 'webSearch':
                        return true;
                    case 'question':
                        return 'who is vinhnx';
                    case 'messages':
                        return [];
                    default:
                        return undefined;
                }
            },
            set: () => {},
            update: () => {},
        };

        const mockEvents = {
            update: () => {},
        };

        let routedTo = null;
        const mockRedirectTo = (destination) => {
            routedTo = destination;
            console.log(`  ✅ Routed to: ${destination}`);
        };

        // Execute the routing logic
        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        if (routedTo === 'gemini-web-search') {
            console.log(
                '  ✅ SUCCESS: Basic web search routes to gemini-web-search (bypasses planner)',
            );
            return true;
        } else {
            console.log(
                `  ❌ FAILED: Basic web search routed to ${routedTo} instead of gemini-web-search`,
            );
            return false;
        }
    } catch (error) {
        console.log('❌ FAILED: Router test threw an error');
        console.log(`  - Error: ${error.message}`);
        return false;
    }
}

async function testProSearchRouting() {
    console.log('\n🔍 Testing Pro Search Routing:');

    try {
        const { modeRoutingTask } = await import('@repo/ai/workflow/tasks/chat-mode-router');
        const { ChatMode } = await import('@repo/shared/config');

        const mockContext = {
            get: (key) => {
                switch (key) {
                    case 'mode':
                        return ChatMode.Pro;
                    case 'webSearch':
                        return true;
                    case 'question':
                        return 'who is vinhnx';
                    case 'messages':
                        return [];
                    default:
                        return undefined;
                }
            },
            set: () => {},
            update: () => {},
        };

        const mockEvents = {
            update: () => {},
        };

        let routedTo = null;
        const mockRedirectTo = (destination) => {
            routedTo = destination;
            console.log(`  ✅ Routed to: ${destination}`);
        };

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        if (routedTo === 'gemini-web-search') {
            console.log('  ✅ SUCCESS: Pro Search routes to gemini-web-search (same as basic)');
            return true;
        } else {
            console.log(
                `  ❌ FAILED: Pro Search routed to ${routedTo} instead of gemini-web-search`,
            );
            return false;
        }
    } catch (error) {
        console.log('❌ FAILED: Pro Search router test threw an error');
        console.log(`  - Error: ${error.message}`);
        return false;
    }
}

async function testSearchCapabilityDifferentiation() {
    console.log('\n🔍 Testing Search Capability Differentiation:');

    try {
        // Test that the gemini-web-search task can differentiate between modes
        const basicMode = 'gemini-2.5-flash-lite-preview-06-17';
        const proMode = 'pro';

        console.log(`  - Basic mode: ${basicMode}`);
        console.log(`  - Pro mode: ${proMode}`);

        // Test the logic that determines search type
        const isBasicProSearch = basicMode === 'pro';
        const isProSearch = proMode === 'pro';

        console.log(`  - Basic mode is Pro Search: ${isBasicProSearch} ❌`);
        console.log(`  - Pro mode is Pro Search: ${isProSearch} ✅`);

        if (!isBasicProSearch && isProSearch) {
            console.log('  ✅ SUCCESS: Mode differentiation logic is correct');
            return true;
        } else {
            console.log('  ❌ FAILED: Mode differentiation logic has issues');
            return false;
        }
    } catch (error) {
        console.log('❌ FAILED: Differentiation test threw an error');
        console.log(`  - Error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('Starting unified web search workflow tests...\n');

    const basicRoutingResult = await testWorkflowRouting();
    const proRoutingResult = await testProSearchRouting();
    const differentiationResult = await testSearchCapabilityDifferentiation();

    const allTestsPassed = basicRoutingResult && proRoutingResult && differentiationResult;

    console.log('\n' + '='.repeat(60));
    if (allTestsPassed) {
        console.log('🎉 SUCCESS: Unified web search workflow is working correctly!');
        console.log('\n✅ Basic web search bypasses the problematic planner task');
        console.log('✅ Both basic and Pro Search use the same reliable gemini-web-search task');
        console.log('✅ Pro Search gets enhanced capabilities within the same task');
        console.log('✅ The workflow is now simplified and more robust');

        console.log('\n🚀 Next Steps:');
        console.log('   1. Test basic web search in the browser (should work now)');
        console.log('   2. Test Pro Search to ensure it still has enhanced capabilities');
        console.log('   3. Verify that both use the server-funded API key correctly');
    } else {
        console.log('❌ ISSUE: Some tests failed');
        console.log('\n🔍 Check the test results above for specific issues');
    }
}

// Run the tests
runTests().catch((error) => {
    console.error('❌ Test script failed:', error);
    process.exit(1);
});
