/**
 * Simple browser navigation test to check for errors across the app
 */

class BrowserNavigationTester {
    private errors: Array<{ page: string; error: string; timestamp: string }> = [];
    private visitedPages: string[] = [];

    constructor() {
        this.setupErrorCatching();
    }

    private setupErrorCatching() {
        // Catch JavaScript errors
        window.addEventListener('error', event => {
            this.logError(
                window.location.pathname,
                `JS Error: ${event.message}`,
                event.error?.stack
            );
        });

        // Catch unhandled promise rejections
        window.addEventListener('unhandledrejection', event => {
            this.logError(window.location.pathname, `Unhandled Promise: ${event.reason}`);
        });

        // Catch React errors (if available)
        const originalError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Error:') || message.includes('Warning:')) {
                this.logError(window.location.pathname, `Console Error: ${message}`);
            }
            originalError.apply(console, args);
        };
    }

    private logError(page: string, error: string, stack?: string) {
        const errorEntry = {
            page,
            error: stack ? `${error}\nStack: ${stack}` : error,
            timestamp: new Date().toISOString(),
        };

        this.errors.push(errorEntry);
        console.log(`🚨 [${page}] ${error}`);
    }

    async testNavigation() {
        console.log('🧪 Starting browser navigation test...');

        const testRoutes = [
            '/',
            '/login',
            '/plus',
            '/chat',
            '/recent',
            '/faq',
            '/terms',
            '/privacy',
        ];

        for (const route of testRoutes) {
            await this.visitPage(route);
        }

        this.printResults();
    }

    private async visitPage(route: string) {
        try {
            console.log(`📍 Visiting: ${route}`);

            // Navigate to the page
            window.history.pushState({}, '', route);
            window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));

            // Wait for the page to load and render
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if the page loaded successfully
            const currentPath = window.location.pathname;
            this.visitedPages.push(currentPath);

            // Check for common error indicators
            this.checkPageHealth(route);
        } catch (error) {
            this.logError(route, `Navigation Error: ${error}`);
        }
    }

    private checkPageHealth(route: string) {
        try {
            // Check if page has basic content
            const body = document.body;
            if (!body || body.innerHTML.trim().length === 0) {
                this.logError(route, 'Page appears to be empty');
                return;
            }

            // Check for error boundaries
            const errorElements = document.querySelectorAll('[data-error-boundary]');
            if (errorElements.length > 0) {
                this.logError(route, 'Error boundary detected on page');
            }

            // Check for hydration issues
            const hydrationWarnings = document.querySelectorAll('[data-hydration-warning]');
            if (hydrationWarnings.length > 0) {
                this.logError(route, 'Hydration warnings detected');
            }

            // Check for accessibility issues
            const missingAlt = document.querySelectorAll('img:not([alt])');
            if (missingAlt.length > 0) {
                console.warn(`⚠️ [${route}] ${missingAlt.length} images missing alt text`);
            }

            console.log(`✅ [${route}] Page health check passed`);
        } catch (error) {
            this.logError(route, `Health check failed: ${error}`);
        }
    }

    private printResults() {
        console.log('\n📊 Navigation Test Results:');
        console.log('='.repeat(50));

        console.log(`📍 Pages Visited: ${this.visitedPages.length}`);
        this.visitedPages.forEach(page => {
            console.log(`  ✅ ${page}`);
        });

        console.log(`\n🚨 Errors Found: ${this.errors.length}`);
        if (this.errors.length === 0) {
            console.log('  🎉 No errors detected!');
        } else {
            this.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. [${error.page}] ${error.error}`);
                console.log(`     Time: ${error.timestamp}`);
                console.log('');
            });
        }

        console.log('='.repeat(50));

        const successRate = (
            ((this.visitedPages.length - this.errors.length) / this.visitedPages.length) *
            100
        ).toFixed(1);
        console.log(`📈 Success Rate: ${successRate}%`);

        if (this.errors.length === 0) {
            console.log('🎉 All pages loaded successfully!');
        } else {
            console.log(
                `⚠️ ${this.errors.length} issues detected. Please review the errors above.`
            );
        }
    }

    // Manual methods for individual testing
    async testPlusPage() {
        console.log('🧪 Testing Plus page specifically...');
        await this.visitPage('/plus');

        // Additional plus page specific tests
        const subscribeButtons = document.querySelectorAll(
            'button[class*="subscribe"], button[class*="upgrade"]'
        );
        console.log(`Found ${subscribeButtons.length} subscription-related buttons`);

        const pricingCards = document.querySelectorAll('[class*="pricing"], [class*="plan"]');
        console.log(`Found ${pricingCards.length} pricing cards`);
    }

    async testAuthFlow() {
        console.log('🧪 Testing authentication flow...');
        await this.visitPage('/login');
        await this.visitPage('/chat');
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
        this.visitedPages = [];
    }
}

// Create global instance for manual testing
if (typeof window !== 'undefined') {
    (window as any).navigationTester = new BrowserNavigationTester();

    // Auto-run test after page load in development
    if (process.env.NODE_ENV === 'development') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => {
                    console.log('🚀 Auto-running navigation test...');
                    (window as any).navigationTester.testNavigation();
                }, 3000);
            });
        } else {
            setTimeout(() => {
                console.log('🚀 Auto-running navigation test...');
                (window as any).navigationTester.testNavigation();
            }, 3000);
        }
    }
}

export default BrowserNavigationTester;
