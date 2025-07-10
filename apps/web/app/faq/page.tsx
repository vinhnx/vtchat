import { Footer } from '@repo/common/components';
import { VT_PLUS_PRICE_WITH_INTERVAL } from '@repo/shared/constants';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Button,
    TypographyH2,
} from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Help Center - VT',
    description:
        'Help center with questions about VT features, thread isolation, account management, and privacy-focused AI chat capabilities.',
    openGraph: {
        title: 'Help Center - VT',
        description:
            'Help center with questions about VT features and privacy-focused AI chat capabilities.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function HelpCenterPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
                    <Link href="/">
                        <Button className="gap-2" size="sm" variant="ghost">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">Help Center</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <HelpCenterContent />
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

function HelpCenterContent() {
    return (
        <section className="py-8 md:py-16">
            <div className="mx-auto w-full max-w-4xl px-4 md:px-8 lg:px-12 xl:px-16">
                <div className="mb-12 text-center">
                    <TypographyH2 className="mb-4 text-3xl font-semibold md:text-4xl">
                        Help Center
                    </TypographyH2>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Everything you need to know about VT's privacy-focused AI chat features,
                        account management, and advanced capabilities.
                    </p>
                </div>

                <div className="mx-auto max-w-4xl">
                    <Accordion className="w-full space-y-4" collapsible type="single">
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
                                        <strong>Deep Research:</strong> Comprehensive multi-step
                                        research using Gemini 2.5 Pro for in-depth analysis (VT+
                                        exclusive)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Pro Search:</strong> Fast grounding web search using
                                        Gemini 2.5 Flash for quick information retrieval (VT+
                                        exclusive)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Document Processing:</strong> Upload and analyze
                                        PDFs, documents, and images with AI models (Free for all
                                        users)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Structured Output:</strong> Extract structured data
                                        from documents (Free for all users - Gemini models only)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Chart Visualization:</strong> Create interactive bar
                                        charts, line graphs, pie charts, and scatter plots (Free for
                                        all users)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Intelligent Tool Router:</strong> AI-powered
                                        semantic routing automatically activates tools based on your
                                        queries (Free for all users)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Math Calculator:</strong> Advanced mathematical
                                        computations and problem solving
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Web Search Integration:</strong> Real-time web
                                        search capabilities for current information (Free for all
                                        users)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Multiple Chat Modes:</strong> Specialized modes for
                                        different use cases
                                    </li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Advanced Features */}
                        <AccordionItem value="advanced-features">
                            <AccordionTrigger className="font-medium">
                                What advanced features are free vs VT+ exclusive?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    Most advanced features are completely free for logged-in users:
                                </p>
                                <h4 className="text-foreground mb-2 mt-4 font-medium">
                                    Free Features (Logged-in Users):
                                </h4>
                                <ul className="mt-2 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Advanced UI:</strong> Dark mode, thinking mode
                                        toggle, structured output
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Document & Image Processing:</strong> Upload PDFs,
                                        images, analyze documents with structured data extraction
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>AI Capabilities:</strong> Intelligent tool routing,
                                        reasoning chain, thinking mode, Gemini caching, chart
                                        visualization, web search
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>All Chat Tools:</strong> Mathematical computing,
                                        multi-modal processing, productivity tools
                                    </li>
                                </ul>
                                <h4 className="text-foreground mb-2 mt-4 font-medium">
                                    VT+ Exclusive Features ({VT_PLUS_PRICE_WITH_INTERVAL}):
                                </h4>
                                <ul className="mt-2 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Pro Search:</strong> Lightning-fast web search with
                                        AI grounding
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Deep Research:</strong> Comprehensive multi-step
                                        research and analysis
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>AI Memory:</strong> Personal AI assistant with agent
                                        (RAG)
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

                        {/* Research Modes */}
                        <AccordionItem value="research-modes">
                            <AccordionTrigger className="font-medium">
                                What's the difference between Deep Research and Pro Search?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT offers two specialized research modes for different use
                                    cases:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Deep Research (VT+ exclusive):</strong> Uses Gemini
                                        2.5 Pro for comprehensive, multi-step research with detailed
                                        analysis and thorough investigation of complex topics
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Pro Search (VT+ exclusive):</strong> Uses Gemini 2.5
                                        Flash for fast, efficient web search and information
                                        retrieval with quick grounding capabilities
                                    </li>
                                    <li className="text-muted-foreground">
                                        Both modes feature native Google search grounding for
                                        up-to-date information
                                    </li>
                                    <li className="text-muted-foreground">
                                        Choose Deep Research for in-depth analysis, Pro Search for
                                        quick information lookup
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Both research modes are VT+ exclusive features (
                                    {VT_PLUS_PRICE_WITH_INTERVAL}) - part of only 3 premium features
                                    while everything else is free.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Thinking Mode */}
                        <AccordionItem value="thinking-mode">
                            <AccordionTrigger className="font-medium">
                                What is Thinking Mode and how does it work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    Thinking Mode shows you the AI's reasoning process for more
                                    transparent and thoughtful responses (Free for all users):
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Gemini Models Only:</strong> Currently available
                                        only with Google Gemini models that support reasoning
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Free Feature:</strong> Available to all registered
                                        users with adjustable thinking budget in settings
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Reasoning Display:</strong> See the AI's
                                        step-by-step thought process before the final answer
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Thoughtful Responses:</strong> More deliberate and
                                        well-reasoned answers for complex questions
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Transparency:</strong> Understand how the AI arrived
                                        at its conclusions
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Look for the thinking indicator in your chat input when using
                                    Gemini models with VT+ and thinking mode enabled.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Gemini Caching */}
                        <AccordionItem value="gemini-caching">
                            <AccordionTrigger className="font-medium">
                                What is Gemini Explicit Caching and how does it save costs?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    Gemini Explicit Caching reduces API costs by reusing
                                    conversation context across multiple queries (Free for all
                                    users):
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Supported Models:</strong> Available for Gemini 2.5
                                        Pro, 2.5 Flash, 2.0 Flash, 1.5 Flash-001, and 1.5 Pro-001
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Cost Reduction:</strong> Significantly reduces API
                                        costs when you have long conversations or reuse similar
                                        context
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Configurable Duration:</strong> Cache conversations
                                        for 1 minute to 1 hour based on your needs
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Cache Management:</strong> Manage up to 20 cached
                                        conversations simultaneously
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Automatic Cleanup:</strong> Cached content expires
                                        automatically based on your TTL settings
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Smart Context Reuse:</strong> Reuses conversation
                                        context intelligently without compromising response quality
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Enable Gemini caching in your VT+ settings and configure cache
                                    duration and limits to optimize your usage costs.
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

                        {/* Free Gemini Model */}
                        <AccordionItem value="free-gemini-model">
                            <AccordionTrigger className="font-medium">
                                What is the new free Gemini model offering?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT now offers free access to Gemini 2.5 Flash Lite Preview for
                                    registered users with tiered limits:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Free Model:</strong> Gemini 2.5 Flash Lite Preview
                                        with advanced AI capabilities
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Free Users:</strong> 20 requests per day, 5
                                        requests per minute
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>VT+ Users:</strong> Enhanced limits - 100 requests
                                        per day, 10 requests per minute
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Reset Time:</strong> Daily limits reset at 00:00 UTC
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Registration Required:</strong> Must be signed in to
                                        access free model
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Server API Key:</strong> Uses VT's server-side API
                                        key (no need for BYOK)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Unlimited with BYOK:</strong> Set up your own Gemini
                                        API key for unlimited usage
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Upgrade to VT+ for enhanced limits and exclusive features like
                                    web search, deep research, and personal AI assistant. Or set up
                                    your own Gemini API key for unlimited usage.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* VT+ Gemini Models */}
                        <AccordionItem value="vt-plus-gemini-models">
                            <AccordionTrigger className="font-medium">
                                What Gemini models and tools do VT+ users get access to?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    <strong>VT+ Required:</strong> Server-funded access to Gemini
                                    models now requires VT+ subscription. VT+ users get access to
                                    all Gemini models without needing to provide their own API keys:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>All Gemini Models:</strong> Access to Gemini 2.5
                                        Flash Lite (100/day), Gemini 2.5 Flash (50/day), Gemini 2.5
                                        Pro (25/day), and Gemini 2.0 models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Enhanced Tools:</strong> Web search, math
                                        calculator, and chart visualization work seamlessly with all
                                        Gemini models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>No API Key Required:</strong> System automatically
                                        handles API key management for VT+ users
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Premium Features:</strong> Thinking mode, structured
                                        output, and document processing available with all Gemini
                                        models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Budget Protection:</strong> Usage is monitored with
                                        monthly budget caps to ensure service availability
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    <strong>Free users:</strong> Must provide their own Gemini API
                                    key for unlimited access. VT+ users get server-funded access
                                    with rate limits for cost control.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Subscription Plans */}
                        <AccordionItem value="subscription-plans">
                            <AccordionTrigger className="font-medium">
                                What's the difference between Free and VT+ tiers?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT offers free tier, and with VT+ focusing only on 3 exclusive
                                    research capabilities: Deep Research, Pro Search, and RAG
                                    (Personal AI Assistant with Memory).
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Free tier (logged-in users):</strong> ALL premium AI
                                        models (Claude 4, GPT-4.1, O3, DeepSeek R1, Grok 3) + all
                                        advanced features - intelligent tool routing, chart
                                        visualization, web search, dark mode, thinking mode,
                                        structured output, document parsing, reasoning chain,
                                        multi-modal chat, and unlimited BYOK usage.
                                        <strong>Gemini access requires your own API key.</strong>
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>VT+ ({VT_PLUS_PRICE_WITH_INTERVAL}):</strong>{' '}
                                        Everything free + 3 exclusive research features: PRO_SEARCH
                                        (Enhanced Web Search), DEEP_RESEARCH (Deep Research
                                        capabilities), and RAG (Personal AI Assistant with Memory).{' '}
                                        <strong>
                                            Plus server-funded access to all Gemini models
                                        </strong>
                                        (2.5 Flash Lite, 2.5 Flash, 2.5 Pro, 2.0 Flash, etc.) with
                                        rate limits and budget protection.
                                    </li>
                                    <li className="text-muted-foreground">
                                        Both tiers include complete privacy with thread isolation
                                        and local storage.
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

                        {/* Intelligent Tool Router */}
                        <AccordionItem value="intelligent-tool-router">
                            <AccordionTrigger className="font-medium">
                                How does the intelligent tool router work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    VT's intelligent tool router uses AI to automatically activate
                                    the right tools based on your queries, making your experience
                                    seamless and efficient:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Free Feature:</strong> Available to all users with
                                        AI-powered semantic routing
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Smart Detection:</strong> Automatically detects when
                                        you need charts, calculations, web search, or document
                                        processing
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>OpenAI Embeddings:</strong> Uses advanced AI
                                        embeddings to understand query intent and context
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Pattern Matching:</strong> Fast regex patterns for
                                        instant tool activation on common requests
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Automatic Activation:</strong> No need to manually
                                        toggle tools - the AI does it for you
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Context Aware:</strong> Avoids duplicate activations
                                        and respects your current tool settings
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Just type naturally like "create a chart", "calculate 15% of
                                    1000", or "search for latest AI news" and watch the router
                                    automatically activate the right tools!
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Chart Visualization */}
                        <AccordionItem value="chart-visualization">
                            <AccordionTrigger className="font-medium">
                                How does interactive chart generation work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    All users can create beautiful, interactive charts directly from
                                    AI conversations:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Free Feature:</strong> Available to all users with
                                        AI-powered chart generation and intelligent routing
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Chart Types:</strong> Bar charts, line charts, area
                                        charts, pie charts, and radar charts
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Interactive Features:</strong> Hover effects,
                                        tooltips, animations, and responsive design
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Easy Creation:</strong> Simply ask the AI to create
                                        charts with your data or specifications
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Automatic Activation:</strong> The intelligent
                                        router detects chart requests and activates visualization
                                        mode automatically
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Professional Design:</strong> Beautiful
                                        visualizations with shadcn/ui styling and animations
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Just ask for visualizations like "Create a bar chart showing
                                    sales data" and the router will automatically enable charts and
                                    generate your visualization!
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Multi-Modal Chat */}
                        <AccordionItem value="multi-modal-chat">
                            <AccordionTrigger className="font-medium">
                                How does multi-modal chat work with images and PDFs?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    All registered users can upload and analyze images and PDF
                                    documents alongside text conversations using advanced AI models:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Free Feature:</strong> Available to all registered
                                        users with supported AI models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Supported Models:</strong> GPT-4o, Claude models,
                                        Gemini models, and other vision-capable models
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Image Support:</strong> JPEG, PNG, GIF, and WebP
                                        images up to 10MB each
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>PDF Support:</strong> Full PDF document analysis and
                                        text extraction
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Multiple Files:</strong> Upload up to 5 files per
                                        conversation
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Smart Model Selection:</strong> Multi-modal upload
                                        appears only when supported models are selected
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    When using compatible models, look for the "Attach Files" button
                                    in your chat interface to upload images and PDFs for analysis.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* RAG Getting Started */}
                        <AccordionItem value="rag-getting-started">
                            <AccordionTrigger className="font-medium">
                                How do I get started with Personal AI Assistant with Memory?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    Getting started with Personal AI Assistant with Memory is
                                    simple! Here's how to build your personal AI assistant:
                                </p>
                                <ol className="mt-4 list-outside list-decimal space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Get VT+ subscription:</strong> Personal AI Assistant
                                        with Memory is exclusive to VT+ users for enhanced privacy
                                        and features
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Set up API keys:</strong> Add your Google Gemini API
                                        key in Settings → API Keys (required for embeddings)
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Access AI Assistant:</strong> Click "AI Assistant"
                                        in the sidebar navigation
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Start sharing information:</strong> Tell the AI
                                        about yourself, your work, preferences, or important facts
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Ask questions:</strong> Query your stored knowledge
                                        by asking questions about anything you've shared
                                    </li>
                                </ol>
                                <h4 className="mb-2 mt-6 font-medium">
                                    Example conversations to start:
                                </h4>
                                <ul className="list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        "My name is John and I work as a software engineer at
                                        Google"
                                    </li>
                                    <li className="text-muted-foreground">
                                        "I prefer working remotely and my favorite programming
                                        languages are Python and TypeScript"
                                    </li>
                                    <li className="text-muted-foreground">
                                        "I have a meeting with the product team every Tuesday at 2
                                        PM"
                                    </li>
                                    <li className="text-muted-foreground">
                                        "What did I tell you about my work schedule?" (after sharing
                                        information)
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    The AI will automatically save information you share and help
                                    you retrieve it later through natural conversation. The more you
                                    share, the more personalized your assistant becomes!
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* RAG Knowledge Chat */}
                        <AccordionItem value="rag-knowledge-chat">
                            <AccordionTrigger className="font-medium">
                                What is Personal AI Assistant with Memory and how does it work?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-muted-foreground">
                                    RAG Knowledge Chat is a VT+ exclusive feature that lets you
                                    build and query your personal agent using Retrieval-Augmented
                                    Generation (RAG) technology. It's like having your own AI
                                    assistant with perfect memory of everything you've shared:
                                </p>
                                <ul className="mt-4 list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>VT+ Exclusive:</strong> Available only to VT+
                                        subscribers with enhanced privacy and security features
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Personal AI Assistant:</strong> Build your own
                                        intelligent knowledge repository that remembers everything
                                        you share
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Smart Auto-Storage:</strong> Information is
                                        automatically processed, chunked, and embedded using
                                        advanced vector embeddings
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Semantic Search:</strong> AI finds relevant
                                        information using meaning-based search, not just keywords
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Natural Conversations:</strong> Share facts,
                                        preferences, experiences, or ask questions in plain English
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Proactive Learning:</strong> AI encourages you to
                                        build your agent for more personalized assistance
                                    </li>
                                </ul>
                                <h4 className="mb-2 mt-6 font-medium">Key Benefits:</h4>
                                <ul className="list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Persistent Memory:</strong> Unlike regular chat,
                                        your agent grows over time and remembers everything
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Personalized Responses:</strong> Get answers
                                        tailored to your specific information and preferences
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Intelligent Organization:</strong> No need to
                                        manually organize - AI finds connections automatically
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Instant Access:</strong> Quickly retrieve any stored
                                        information through natural conversation
                                    </li>
                                </ul>
                                <h4 className="mb-2 mt-6 font-medium">Privacy & Security:</h4>
                                <ul className="list-outside list-disc space-y-2 pl-4">
                                    <li className="text-muted-foreground">
                                        <strong>Complete Isolation:</strong> Your agent is
                                        completely private and isolated to your account only
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Zero Data Sharing:</strong> No other users can
                                        access your stored information - guaranteed
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>Secure Storage:</strong> All embeddings and data are
                                        encrypted and stored securely in our database
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>User-Controlled:</strong> You can view, delete
                                        individual items, or clear your entire agent anytime
                                    </li>
                                    <li className="text-muted-foreground">
                                        <strong>No Third-Party Sharing:</strong> Your data is never
                                        shared with any third parties and only used to improve your
                                        VT experience
                                    </li>
                                </ul>
                                <p className="text-muted-foreground mt-4 text-sm">
                                    Access RAG Knowledge Chat from the sidebar (VT+ users) and start
                                    building your personalized AI assistant by sharing information
                                    about yourself, your work, preferences, and important facts.
                                </p>
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
                                        Configure PostgreSQL database (local or Neon)
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
