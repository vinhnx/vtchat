import { Footer } from '@repo/common/components';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Button } from '@repo/ui';
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
            <header className="border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
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
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <FAQs />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto w-full max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}

function FAQs() {
    return (
        <section className="py-8 md:py-16">
            <div className="mx-auto w-[60%] px-12 md:px-20 lg:px-24 xl:px-32">
                <div className="mb-12 text-center">
                    <h2 className="mb-4 text-3xl font-semibold md:text-4xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Everything you need to know about VT's privacy-focused AI chat features,
                        account management, and advanced capabilities.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {/* Privacy & Thread Isolation */}
                        <AccordionItem value="thread-isolation">
                            <AccordionTrigger className="font-medium">
                                Why do my threads disappear when I switch accounts?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    This is a <strong>security feature</strong>, not a bug! VT
                                    implements per-account thread isolation to protect your privacy.
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Anonymous users</strong> have their own separate
                                        thread database
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Local Storage & Privacy */}
                        <AccordionItem value="conversations-storage">
                            <AccordionTrigger className="font-medium">
                                Where are my conversations stored?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    All your conversations are stored locally in your browser using
                                    IndexedDB. We never send your chat history to our servers.
                                </p>
                                <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        Your threads are stored in your browser's local database
                                        (IndexedDB)
                                    </li>
                                    <li className="text-muted-foreground">
                                        API keys are encrypted and stored locally (never on our
                                        servers)
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Account Switching */}
                        <AccordionItem value="account-switching">
                            <AccordionTrigger className="font-medium">
                                What happens when I log in or switch accounts?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT automatically switches to your account-specific data storage
                                    to maintain privacy:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        Your previous account's threads are safely stored but hidden
                                    </li>
                                    <li className="text-muted-foreground">
                                        You'll see only the threads belonging to your current
                                        account
                                    </li>
                                    <li className="text-muted-foreground">
                                        API keys are switched to your account
                                    </li>
                                    <li className="text-muted-foreground">
                                        This ensures complete data isolation between users
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Logout Security */}
                        <AccordionItem value="logout-security">
                            <AccordionTrigger className="font-medium">
                                What gets cleared when I log out?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* AI Models & Features */}
                        <AccordionItem value="ai-models-features">
                            <AccordionTrigger className="font-medium">
                                What AI models and features does VT support?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT integrates with multiple leading AI providers and offers
                                    advanced research capabilities:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>AI Providers:</strong> OpenAI, Anthropic, Google,
                                        Fireworks, Together AI, and xAI
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Grounding Web Search:</strong> Enhanced search with
                                        web integration for comprehensive analysis
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Document Processing:</strong> Upload and analyze
                                        PDFs, documents, and images with AI models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Structured Output:</strong> Extract structured data
                                        from documents (Gemini models only)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Math Calculator:</strong> Advanced mathematical
                                        computations and problem solving
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Multiple Chat Modes:</strong> Specialized modes for
                                        different use cases
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Tool Integration:</strong> Framework ready for
                                        external tool connectivity (temporarily optimized)
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Advanced Features */}
                        <AccordionItem value="advanced-features">
                            <AccordionTrigger className="font-medium">
                                What are VT's advanced AI capabilities?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT offers cutting-edge AI features for enhanced productivity:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Web Search Integration:</strong> Real-time
                                        information retrieval and grounding for up-to-date responses
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Document Upload & Analysis:</strong> Upload PDFs,
                                        DOCs, TXT files, and images for comprehensive AI analysis
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Structured Data Extraction:</strong> Automatically
                                        extract structured data from PDFs (invoices, resumes,
                                        contracts) using Gemini models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Mathematical Computing:</strong> Advanced math
                                        calculations, equation solving, and numerical analysis
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Multi-modal Processing:</strong> Combine text,
                                        images, and documents in a single conversation
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Structured Output */}
                        <AccordionItem value="structured-output">
                            <AccordionTrigger className="font-medium">
                                How does structured output extraction work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT's structured output feature uses AI to extract organized data
                                    from PDF documents:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Gemini Models Only:</strong> Currently available
                                        only with Google Gemini models for optimal accuracy
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Document Types:</strong> Automatically detects and
                                        extracts data from invoices, resumes, contracts, and general
                                        documents
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Smart Schema:</strong> Uses intelligent schemas to
                                        extract relevant fields like contact info, dates, amounts,
                                        and terms
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Export Options:</strong> Download extracted data as
                                        JSON or view in structured format
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>PDF Support:</strong> Currently supports PDF files
                                        with plans to expand to other document formats
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Look for the structured output icon (lightbulb) when you upload
                                    a PDF with a Gemini model selected.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* BYOK Feature */}
                        <AccordionItem value="byok-feature">
                            <AccordionTrigger className="font-medium">
                                How does "Bring Your Own Key" (BYOK) work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    BYOK allows you to use your own AI provider API keys for
                                    unlimited usage:
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Subscription Plans */}
                        <AccordionItem value="subscription-plans">
                            <AccordionTrigger className="font-medium">
                                What's the difference between VT Base and VT Plus?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT offers two subscription tiers:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>VT Base (Free):</strong> Limited daily requests with
                                        our keys, unlimited with BYOK
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>VT Plus:</strong> Higher daily limits, priority
                                        support, and advanced features
                                    </li>
                                    <li className="text-muted-foreground">
                                        Both tiers support full thread isolation and local storage
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Subscription Management */}
                        <AccordionItem value="subscription-management">
                            <AccordionTrigger className="font-medium">
                                How do I manage my subscription?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT provides seamless subscription management through an
                                    integrated customer portal.
                                </p>
                                <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        Access the customer portal from your account settings
                                    </li>
                                    <li className="text-muted-foreground">
                                        Portal opens in a new tab for seamless UX
                                    </li>
                                    <li className="text-muted-foreground">
                                        Update payment methods, view billing history, and manage
                                        plans
                                    </li>
                                    <li className="text-muted-foreground">
                                        Cancel or modify your subscription at any time
                                    </li>
                                </ol>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Workflow & Orchestration */}
                        <AccordionItem value="workflow-orchestration">
                            <AccordionTrigger className="font-medium">
                                What are VT's agentic capabilities?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT features advanced workflow orchestration for complex AI
                                    tasks:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Workflow Engine:</strong> Custom orchestration for
                                        coordinating complex tasks
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Task Planning:</strong> Intelligent task breakdown
                                        and execution
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Research Agents:</strong> Multi-step research with
                                        information gathering and analysis
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Reflective Analysis:</strong> Self-improvement
                                        through prior reasoning analysis
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Tool Integration */}
                        <AccordionItem value="tool-integration">
                            <AccordionTrigger className="font-medium">
                                What about external tool integration?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT's tool integration features are temporarily optimized to
                                    improve app performance:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        External tool connectivity framework is preserved for future
                                        restoration
                                    </li>
                                    <li className="text-muted-foreground">
                                        Core chat, research, and AI capabilities remain fully
                                        functional
                                    </li>
                                    <li className="text-muted-foreground">
                                        Tool features will be re-enabled based on user demand
                                    </li>
                                    <li className="text-muted-foreground">
                                        The app is now lighter and faster without external
                                        dependencies
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Development & Deployment */}
                        <AccordionItem value="development-deployment">
                            <AccordionTrigger className="font-medium">
                                How can I set up VT locally for development?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT supports local development with comprehensive setup
                                    documentation:
                                </p>
                                <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        Clone the repository and install dependencies with Bun
                                    </li>
                                    <li className="text-muted-foreground">
                                        Set up environment variables (Better Auth, database, API
                                        keys)
                                    </li>
                                    <li className="text-muted-foreground">
                                        Configure PostgreSQL database (local or Railway)
                                    </li>
                                    <li className="text-muted-foreground">
                                        Run development server with <code>bun dev</code>
                                    </li>
                                </ol>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Check our comprehensive local development guide for detailed
                                    setup instructions.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Environment & Configuration */}
                        <AccordionItem value="environment-configuration">
                            <AccordionTrigger className="font-medium">
                                What environment variables do I need?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT requires several environment variables for different
                                    features:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Authentication:</strong> BETTER_AUTH_SECRET,
                                        BETTER_AUTH_URL
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Database:</strong> DATABASE_URL (PostgreSQL with
                                        Neon or local)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>AI Providers:</strong> API keys for OpenAI,
                                        Anthropic, Google, etc. (BYOK)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Payment:</strong> CREEM_API_KEY, CREEM_PRODUCT_ID
                                        (optional)
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Data Export & Backup */}
                        <AccordionItem value="data-export-backup">
                            <AccordionTrigger className="font-medium">
                                Can I export or backup my conversations?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    Since all data is stored locally in your browser, you have full
                                    control over your conversations.
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        Your conversations are stored in your browser's IndexedDB
                                    </li>
                                    <li className="text-muted-foreground">
                                        Use browser developer tools to access and export data if
                                        needed
                                    </li>
                                    <li className="text-muted-foreground">
                                        Consider backing up important conversations manually
                                    </li>
                                    <li className="text-muted-foreground">
                                        Data persistence depends on your browser settings and
                                        storage policies
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Browser Compatibility */}
                        <AccordionItem value="browser-compatibility">
                            <AccordionTrigger className="font-medium">
                                What browsers are supported?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT works best on modern browsers that support IndexedDB and
                                    local storage features.
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Troubleshooting */}
                        <AccordionItem value="troubleshooting">
                            <AccordionTrigger className="font-medium">
                                I'm having issues with threads or account switching
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
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
                            </AccordionContent>
                        </AccordionItem>

                        {/* Support */}
                        <AccordionItem value="support">
                            <AccordionTrigger className="font-medium">
                                How can I get help or report issues?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
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
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
