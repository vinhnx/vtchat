import { Footer } from '@repo/common/components';
import { Button } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'FAQ - VT',
    description:
        'Frequently asked questions about VT features, thread isolation, account management, and privacy-focused AI chat capabilities.',
    openGraph: {
        title: 'FAQ - VT',
        description:
            'Frequently asked questions about VT features and privacy-focused AI chat capabilities.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function FAQPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">Frequently Asked Questions</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-screen-lg px-4 py-12">
                <FAQs />
            </main>

            {/* Footer */}
            <footer className="border-border/50 bg-muted/20 border-t">
                <div className="mx-auto max-w-screen-lg">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}

function FAQs() {
    return (
        <section className="scroll-py-16 py-16 md:scroll-py-32 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
                    <div className="text-center lg:text-left">
                        <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Frequently <br className="hidden lg:block" /> Asked{' '}
                            <br className="hidden lg:block" />
                            Questions
                        </h2>
                        <p className="text-muted-foreground">
                            Everything you need to know about VT's privacy-focused AI chat features,
                            account management, and advanced capabilities.
                        </p>
                    </div>

                    <div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
                        {/* Privacy & Thread Isolation */}
                        <div className="pb-6">
                            <h3 className="font-medium">
                                Why do my threads disappear when I switch accounts?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                This is a <strong>security feature</strong>, not a bug! VT
                                implements per-account thread isolation to protect your privacy.
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>Anonymous users</strong> have their own separate thread
                                    database
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Each logged-in user</strong> gets their own isolated
                                    thread storage
                                </li>
                                <li className="text-muted-foreground">
                                    This ensures your conversations never mix with other users
                                </li>
                                <li className="text-muted-foreground">
                                    Perfect for shared computers and maximum privacy protection
                                </li>
                            </ul>
                        </div>

                        {/* Local Storage & Privacy */}
                        <div className="py-6">
                            <h3 className="font-medium">Where are my conversations stored?</h3>
                            <p className="text-muted-foreground mt-4">
                                All your conversations are stored locally in your browser using
                                IndexedDB. We never send your chat history to our servers.
                            </p>
                            <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Your threads are stored in your browser's local database
                                    (IndexedDB)
                                </li>
                                <li className="text-muted-foreground">
                                    API keys are encrypted and stored locally (never on our servers)
                                </li>
                                <li className="text-muted-foreground">
                                    Each user account gets a completely separate database for
                                    maximum privacy
                                </li>
                                <li className="text-muted-foreground">
                                    Your data stays on your device - we can't access your
                                    conversations
                                </li>
                            </ol>
                        </div>

                        {/* Account Switching */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                What happens when I log in or switch accounts?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                VT automatically switches to your account-specific data storage to
                                maintain privacy:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Your previous account's threads are safely stored but hidden
                                </li>
                                <li className="text-muted-foreground">
                                    You'll see only the threads belonging to your current account
                                </li>
                                <li className="text-muted-foreground">
                                    API keys are switched to your account
                                </li>
                                <li className="text-muted-foreground">
                                    This ensures complete data isolation between users
                                </li>
                            </ul>
                        </div>

                        {/* Logout Security */}
                        <div className="py-6">
                            <h3 className="font-medium">What gets cleared when I log out?</h3>
                            <p className="text-muted-foreground mt-4">
                                For security, logout performs a comprehensive cleanup:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    All API keys are cleared (BYOK security)
                                </li>
                                <li className="text-muted-foreground">
                                    All cached data is cleared
                                </li>
                                <li className="text-muted-foreground">
                                    Thread database switches back to anonymous mode
                                </li>
                                <li className="text-muted-foreground">
                                    Subscription cache and preferences are cleared
                                </li>
                            </ul>
                        </div>

                        {/* AI Models & Features */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                What AI models and features does VT support?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                VT integrates with multiple leading AI providers and offers advanced
                                research capabilities:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>AI Providers:</strong> OpenAI, Anthropic, Google,
                                    Fireworks, Together AI, and xAI
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Grounding Web Search:</strong> Enhanced search with web
                                    integration for comprehensive analysis
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Multiple Chat Modes:</strong> Specialized modes for
                                    different use cases
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Tool Integration:</strong> Framework ready for external
                                    tool connectivity (temporarily optimized)
                                </li>
                            </ul>
                        </div>

                        {/* BYOK Feature */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                How does "Bring Your Own Key" (BYOK) work?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                BYOK allows you to use your own AI provider API keys for unlimited
                                usage:
                            </p>
                            <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Add your API keys in Settings → API Keys
                                </li>
                                <li className="text-muted-foreground">
                                    Keys are encrypted and stored only in your browser
                                </li>
                                <li className="text-muted-foreground">
                                    Each account has separate API key storage
                                </li>
                                <li className="text-muted-foreground">
                                    Keys are automatically cleared on logout for security
                                </li>
                            </ol>
                        </div>

                        {/* Subscription Plans */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                What's the difference between VT Base and VT Plus?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                VT offers two subscription tiers:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>VT Base (Free):</strong> Limited daily requests with our
                                    keys, unlimited with BYOK
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>VT Plus:</strong> Higher daily limits, priority support,
                                    and advanced features
                                </li>
                                <li className="text-muted-foreground">
                                    Both tiers support full thread isolation and local storage
                                </li>
                            </ul>
                        </div>

                        {/* Subscription Management */}
                        <div className="py-6">
                            <h3 className="font-medium">How do I manage my subscription?</h3>
                            <p className="text-muted-foreground mt-4">
                                VT provides seamless subscription management through an integrated
                                customer portal.
                            </p>
                            <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Access the customer portal from your account settings
                                </li>
                                <li className="text-muted-foreground">
                                    Portal opens in a new tab for seamless UX
                                </li>
                                <li className="text-muted-foreground">
                                    Update payment methods, view billing history, and manage plans
                                </li>
                                <li className="text-muted-foreground">
                                    Cancel or modify your subscription at any time
                                </li>
                            </ol>
                        </div>

                        {/* Workflow & Orchestration */}
                        <div className="py-6">
                            <h3 className="font-medium">What are VT's agentic capabilities?</h3>
                            <p className="text-muted-foreground mt-4">
                                VT features advanced workflow orchestration for complex AI tasks:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>Workflow Engine:</strong> Custom orchestration for
                                    coordinating complex tasks
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Task Planning:</strong> Intelligent task breakdown and
                                    execution
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Research Agents:</strong> Multi-step research with
                                    information gathering and analysis
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Reflective Analysis:</strong> Self-improvement through
                                    prior reasoning analysis
                                </li>
                            </ul>
                        </div>

                        {/* Tool Integration */}
                        <div className="py-6">
                            <h3 className="font-medium">What about external tool integration?</h3>
                            <p className="text-muted-foreground mt-4">
                                VT's tool integration features are temporarily optimized to improve
                                app performance:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    External tool connectivity framework is preserved for future
                                    restoration
                                </li>
                                <li className="text-muted-foreground">
                                    Core chat, research, and AI capabilities remain fully functional
                                </li>
                                <li className="text-muted-foreground">
                                    Tool features will be re-enabled based on user demand
                                </li>
                                <li className="text-muted-foreground">
                                    The app is now lighter and faster without external dependencies
                                </li>
                            </ul>
                        </div>

                        {/* Development & Deployment */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                How can I set up VT locally for development?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                VT supports local development with comprehensive setup
                                documentation:
                            </p>
                            <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Clone the repository and install dependencies with Bun
                                </li>
                                <li className="text-muted-foreground">
                                    Set up environment variables (Better Auth, database, API keys)
                                </li>
                                <li className="text-muted-foreground">
                                    Configure PostgreSQL database (local or Railway)
                                </li>
                                <li className="text-muted-foreground">
                                    Run development server with <code>bun dev</code>
                                </li>
                            </ol>
                            <p className="text-muted-foreground mt-4 text-sm">
                                Check our comprehensive local development guide for detailed setup
                                instructions.
                            </p>
                        </div>

                        {/* Environment & Configuration */}
                        <div className="py-6">
                            <h3 className="font-medium">What environment variables do I need?</h3>
                            <p className="text-muted-foreground mt-4">
                                VT requires several environment variables for different features:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>Authentication:</strong> BETTER_AUTH_SECRET,
                                    BETTER_AUTH_URL
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Database:</strong> DATABASE_URL (PostgreSQL with Neon or
                                    local)
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>AI Providers:</strong> API keys for OpenAI, Anthropic,
                                    Google, etc. (BYOK)
                                </li>
                                <li className="text-muted-foreground">
                                    <strong>Payment:</strong> CREEM_API_KEY, CREEM_PRODUCT_ID
                                    (optional)
                                </li>
                            </ul>
                        </div>

                        {/* Data Export & Backup */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                Can I export or backup my conversations?
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                Since all data is stored locally in your browser, you have full
                                control over your conversations.
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Your conversations are stored in your browser's IndexedDB
                                </li>
                                <li className="text-muted-foreground">
                                    Use browser developer tools to access and export data if needed
                                </li>
                                <li className="text-muted-foreground">
                                    Consider backing up important conversations manually
                                </li>
                                <li className="text-muted-foreground">
                                    Data persistence depends on your browser settings and storage
                                    policies
                                </li>
                            </ul>
                        </div>

                        {/* Browser Compatibility */}
                        <div className="py-6">
                            <h3 className="font-medium">What browsers are supported?</h3>
                            <p className="text-muted-foreground mt-4">
                                VT works best on modern browsers that support IndexedDB and local
                                storage features.
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    <strong>Recommended:</strong> Chrome, Firefox, Safari, Edge
                                    (latest versions)
                                </li>
                                <li className="text-muted-foreground">
                                    Requires JavaScript and local storage enabled
                                </li>
                                <li className="text-muted-foreground">
                                    IndexedDB support is required for thread storage
                                </li>
                                <li className="text-muted-foreground">
                                    Clear browser data will remove your local conversations
                                </li>
                            </ul>
                        </div>

                        {/* Troubleshooting */}
                        <div className="py-6">
                            <h3 className="font-medium">
                                I'm having issues with threads or account switching
                            </h3>
                            <p className="text-muted-foreground mt-4">
                                Here are some common solutions:
                            </p>
                            <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Refresh the page to reset the database connection
                                </li>
                                <li className="text-muted-foreground">
                                    Check browser console for any error messages
                                </li>
                                <li className="text-muted-foreground">
                                    Clear browser cache if you see corrupted data warnings
                                </li>
                                <li className="text-muted-foreground">
                                    Remember: missing threads after account switch is normal
                                    behavior
                                </li>
                            </ol>
                        </div>

                        {/* Support */}
                        <div className="pt-6">
                            <h3 className="font-medium">How can I get help or report issues?</h3>
                            <p className="text-muted-foreground mt-4">
                                We're here to help! You can reach us through:
                            </p>
                            <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                <li className="text-muted-foreground">
                                    Use the feedback widget in the app for bug reports and
                                    suggestions
                                </li>
                                <li className="text-muted-foreground">
                                    Check our documentation for detailed feature explanations
                                </li>
                                <li className="text-muted-foreground">
                                    Review our privacy policy and terms of service for policy
                                    questions
                                </li>
                                <li className="text-muted-foreground">
                                    Contact our support team for account-related issues
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
