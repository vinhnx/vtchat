import { Footer } from '@repo/common/components';
import { Button, TypographyH2 } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About VT',
    description:
        'Learn about VT - Your privacy-focused AI chat platform with enterprise-grade security and advanced AI capabilities.',
    openGraph: {
        title: 'About VT',
        description:
            'Learn about VT - Your privacy-focused AI chat platform with enterprise-grade security.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function AboutPage() {
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
                    <div className="text-muted-foreground text-sm">About</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <AboutContent />
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

function AboutContent() {
    return (
        <section className="py-8 md:py-16">
            <div className="mx-auto w-full max-w-4xl px-4 md:px-8 lg:px-12 xl:px-16">
                <div className="mb-12 text-center">
                    <TypographyH2 className="mb-4 text-3xl font-semibold md:text-4xl">
                        About VT
                    </TypographyH2>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        VT is a modern, privacy-first AI chat application with enterprise-grade
                        security and advanced AI capabilities.
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Our Mission</h3>
                            <p className="text-muted-foreground">
                                VT delivers cutting-edge AI capabilities through a sophisticated
                                dual-tier subscription system while maintaining a privacy-first
                                architecture. We believe in providing the most generous free tier in
                                the industry while offering premium research capabilities for power
                                users.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">
                                Privacy-First Architecture
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                Your privacy is our top priority. VT implements a local-first
                                storage approach where all your conversations are stored directly in
                                your browser's IndexedDB via Dexie.js.
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Zero Server Storage:</strong> Your conversations never
                                    leave your device
                                </li>
                                <li>
                                    <strong>Multi-User Isolation:</strong> Complete data separation
                                    on shared devices
                                </li>
                                <li>
                                    <strong>Thread Isolation:</strong> Each user account gets
                                    completely separate storage
                                </li>
                                <li>
                                    <strong>Client-Side Encryption:</strong> API keys are encrypted
                                    and stored locally
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Advanced AI Capabilities</h3>
                            <p className="text-muted-foreground mb-4">
                                VT integrates with multiple leading AI providers to offer
                                comprehensive AI capabilities:
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Multi-Provider Support:</strong> OpenAI, Anthropic,
                                    Google, Fireworks, Together AI, and xAI
                                </li>
                                <li>
                                    <strong>Intelligent Tool Router:</strong> AI-powered semantic
                                    routing automatically activates tools based on query intent
                                    using OpenAI embeddings and pattern matching
                                </li>
                                <li>
                                    <strong>Premium AI Models:</strong> Claude 4, GPT-4.1, O3
                                    series, Gemini 2.5 Pro, DeepSeek R1, Grok 3
                                </li>
                                <li>
                                    <strong>Free AI Models:</strong> 9 models including Gemini
                                    2.0/2.5 Flash and OpenRouter models with tiered rate limits (VT+
                                    users get up to 5x enhanced limits)
                                </li>
                                <li>
                                    <strong>Chart Visualization:</strong> Create interactive bar
                                    charts, line graphs, pie charts, and scatter plots - available
                                    to all users
                                </li>
                                <li>
                                    <strong>Web Search Integration:</strong> Real-time web search
                                    capabilities for current information and grounding
                                </li>
                                <li>
                                    <strong>Thinking Mode:</strong> AI SDK reasoning tokens with
                                    transparent thinking process
                                </li>
                                <li>
                                    <strong>Document Processing:</strong> Upload and analyze PDFs,
                                    documents, and images
                                </li>
                                <li>
                                    <strong>Structured Output:</strong> Extract structured data from
                                    documents
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Security & Privacy</h3>
                            <p className="text-muted-foreground mb-4">
                                VT implements security measures focused on privacy and user
                                protection:
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Bot Protection:</strong> Intelligent bot detection for
                                    authentication endpoints
                                </li>
                                <li>
                                    <strong>Better Auth:</strong> Modern session management with
                                    secure OAuth integration
                                </li>
                                <li>
                                    <strong>Local Storage:</strong> All conversations stored on your
                                    device for maximum privacy
                                </li>
                                <li>
                                    <strong>Direct API Access:</strong> Messages sent directly to AI
                                    providers, never stored on our servers
                                </li>
                                <li>
                                    <strong>Encrypted API Keys:</strong> Your API keys are encrypted
                                    and stored locally only
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Subscription Tiers</h3>
                            <p className="text-muted-foreground mb-4">
                                VT provides comprehensive free access with just 3 features behind
                                the premium tier. Upgrade to VT+ for Deep Research tools, Pro Search
                                capabilities, and RAG document intelligence.
                            </p>
                            <div className="text-center">
                                <Link href="/plus">
                                    <Button className="gap-2" size="lg">
                                        View Subscription Plans
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Technology Stack</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is built with modern web technologies for optimal performance and
                                reliability:
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Frontend:</strong> Next.js 14 with App Router,
                                    TypeScript, Tailwind CSS
                                </li>
                                <li>
                                    <strong>UI Components:</strong> Shadcn UI with Radix UI
                                    primitives
                                </li>
                                <li>
                                    <strong>Database:</strong> Neon PostgreSQL with Drizzle ORM
                                </li>
                                <li>
                                    <strong>Authentication:</strong> Better Auth with secure session
                                    management
                                </li>
                                <li>
                                    <strong>Deployment:</strong> Fly.io with Singapore region
                                    optimization
                                </li>
                                <li>
                                    <strong>Build System:</strong> Turborepo monorepo with 87%
                                    faster compilation
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">
                                Performance & Reliability
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                VT is production-ready with enterprise-grade performance
                                optimization:
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>87% Faster Compilation:</strong> Build time reduced from
                                    24s to 3s
                                </li>
                                <li>
                                    <strong>Auth Performance:</strong> 80-90% faster session
                                    validation
                                </li>
                                <li>
                                    <strong>Database Optimization:</strong> 70-80% faster queries
                                    with proper indexing
                                </li>
                                <li>
                                    <strong>Production Deployment:</strong> Auto-scaling with health
                                    monitoring
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Open Source & Community</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is built with transparency and community in mind. We believe in
                                open development practices and welcome contributions from the
                                community. Our codebase maintains zero TypeScript errors and
                                comprehensive test coverage for reliability.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <a
                                    href="https://vtchat.io.vn"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                                >
                                    🚀 Verified Startup
                                </a>
                            </div>
                        </div>

                        <div className="pt-8 text-center">
                            <Link href="/">
                                <Button className="gap-2" size="lg">
                                    Get Started with VT
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
