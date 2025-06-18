/**
 * Simple hydration test to verify no hydration errors occur
 */

export function testHydration() {
    console.log('🧪 Testing hydration...');

    // Check if we're running in browser
    if (typeof window === 'undefined') {
        console.log('❌ Not in browser environment');
        return false;
    }

    // Check for hydration errors in console
    const originalError = console.error;
    let hydrationErrors: string[] = [];

    console.error = (...args: any[]) => {
        const message = args.join(' ');

        // Check for Next.js hydration error patterns
        if (
            message.includes('Hydration failed') ||
            message.includes('hydration error') ||
            message.includes("server rendered HTML didn't match") ||
            message.includes('Text content does not match')
        ) {
            hydrationErrors.push(message);
        }

        // Call original error handler
        originalError.apply(console, args);
    };

    // Wait for hydration to complete
    setTimeout(() => {
        console.error = originalError;

        if (hydrationErrors.length === 0) {
            console.log('✅ No hydration errors detected');
        } else {
            console.log('❌ Hydration errors found:');
            hydrationErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
    }, 2000);

    return true;
}

// Auto-run test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    document.addEventListener('DOMContentLoaded', () => {
        testHydration();
    });
}
