import { Footer } from "@repo/common/components";
import { Button, TypographyH1 } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

// This page can be statically generated for better performance
export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "About VT",
    description: "Learn about VT - VT - Minimal AI Chat with Deep Research Features.",
    openGraph: {
        title: "About VT",
        description: "VT - Minimal AI Chat with Deep Research Features.",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://vtchat.io.vn/about",
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
                    <TypographyH1 className="mb-4 text-3xl font-semibold md:text-4xl">
                        VT
                    </TypographyH1>
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                        Stop juggling AI subscriptions and privacy concerns -— VT delivers powerful
                        AI conversations with complete privacy protection, starting free.
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="space-y-8">
                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Our Mission</h3>
                            <p className="text-muted-foreground">
                                Tired of AI tools that compromise your privacy? VT keeps every
                                conversation on your device, never on our servers.
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
                                Frustrated by AI subscription limits? VT gives you unlimited access
                                to ALL premium models with your own API keys.
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Multi-Provider Support:</strong> OpenAI, Anthropic,
                                    Google, Fireworks, Together AI, xAI, plus local providers
                                    (Ollama, LM Studio)
                                </li>
                                <li>
                                    <strong>Premium AI Models (Free with BYOK):</strong> ALL premium
                                    models including Claude 4, GPT-4.1, o3 series, o1 series, Gemini
                                    2.5 Pro, DeepSeek R1, Grok 3 - available to all logged-in users
                                    with their own API keys
                                </li>
                                <li>
                                    <strong>9 Free Server Models:</strong> Gemini 2.0/2.5 Flash
                                    series + OpenRouter models (DeepSeek V3, Qwen3 14B) - no API
                                    keys required
                                </li>
                                <li>
                                    <strong>Free Local AI:</strong> Run AI models on your own
                                    computer with Ollama and LM Studio - completely free, private,
                                    and no API costs
                                </li>
                                <li>
                                    <strong>Chart Visualization (Free):</strong> Create interactive
                                    bar charts, line graphs, pie charts, and scatter plots - always
                                    available and discoverable through smart UI
                                </li>
                                <li>
                                    <strong>Web Search Integration (Free):</strong> Real-time web
                                    search capabilities for current information - always available
                                </li>
                                <li>
                                    <strong>Thinking Mode (Free):</strong> Complete AI SDK reasoning
                                    tokens support with transparent thinking process - available to
                                    all logged-in users
                                </li>
                                <li>
                                    <strong>Document Processing (Free):</strong> Upload and analyze
                                    PDF, DOC, DOCX, TXT, MD files (up to 10MB) - available to all
                                    logged-in users
                                </li>
                                <li>
                                    <strong>Structured Output (Free):</strong> AI-powered JSON data
                                    extraction from documents - available to all logged-in users
                                </li>
                                <li>
                                    <strong>Mathematical Calculator (Free):</strong> Advanced
                                    functions including trigonometry, logarithms, and arithmetic
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Security & Privacy</h3>
                            <p className="text-muted-foreground mb-4">
                                Worried about where your data goes? VT stores everything
                                locally—your conversations never leave your device."
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
                            <h3 className="mb-4 text-xl font-semibold">Technology Stack</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is built with cutting-edge web technologies for optimal
                                performance, security, and developer experience:
                            </p>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <h4 className="mb-2 text-lg font-semibold">Frontend & Core</h4>
                                    <ul className="text-muted-foreground list-inside list-disc space-y-1">
                                        <li>
                                            <strong>Framework:</strong> Next.js 15 (App Router) with
                                            TypeScript
                                        </li>
                                        <li>
                                            <strong>React:</strong> React 19.0.0 (latest stable)
                                        </li>
                                        <li>
                                            <strong>UI Components:</strong> Shadcn UI with Radix UI
                                            primitives
                                        </li>
                                        <li>
                                            <strong>Styling:</strong> Tailwind CSS with modern
                                            design system
                                        </li>
                                        <li>
                                            <strong>State Management:</strong> Zustand + React Query
                                        </li>
                                        <li>
                                            <strong>Animations:</strong> Framer Motion
                                        </li>
                                        <li>
                                            <strong>Icons:</strong> Lucide React
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="mb-2 text-lg font-semibold">
                                        Backend & Infrastructure
                                    </h4>
                                    <ul className="text-muted-foreground list-inside list-disc space-y-1">
                                        <li>
                                            <strong>Database:</strong> Neon PostgreSQL with Drizzle
                                            ORM
                                        </li>
                                        <li>
                                            <strong>Authentication:</strong> Better Auth with 87%
                                            performance improvement
                                        </li>
                                        <li>
                                            <strong>Payment:</strong> Creem.io with customer portal
                                        </li>
                                        <li>
                                            <strong>Local Storage:</strong> IndexedDB via Dexie.js
                                        </li>
                                        <li>
                                            <strong>Deployment:</strong> Fly.io (Singapore +
                                            Virginia regions)
                                        </li>
                                        <li>
                                            <strong>Security:</strong> Bot detection and secure
                                            OAuth
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="mb-2 text-lg font-semibold">
                                        Development & Build
                                    </h4>
                                    <ul className="text-muted-foreground list-inside list-disc space-y-1">
                                        <li>
                                            <strong>Runtime:</strong> Bun (package manager +
                                            JavaScript runtime)
                                        </li>
                                        <li>
                                            <strong>Monorepo:</strong> Turborepo with 87% faster
                                            compilation
                                        </li>
                                        <li>
                                            <strong>Testing:</strong> Vitest with Testing Library
                                        </li>
                                        <li>
                                            <strong>Code Quality:</strong> Biome + oxlint for
                                            comprehensive linting
                                        </li>
                                        <li>
                                            <strong>Type Checking:</strong> TypeScript with strict
                                            configuration
                                        </li>
                                        <li>
                                            <strong>Performance:</strong> React Scan for development
                                            optimization
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="mb-2 text-lg font-semibold">
                                        AI & Integrations
                                    </h4>
                                    <ul className="text-muted-foreground list-inside list-disc space-y-1">
                                        <li>
                                            <strong>AI Providers:</strong> OpenAI, Anthropic,
                                            Google, Fireworks, Together AI, xAI
                                        </li>
                                        <li>
                                            <strong>AI SDK:</strong> Vercel AI SDK with reasoning
                                            tokens support
                                        </li>
                                        <li>
                                            <strong>Local AI:</strong> Ollama and LM Studio
                                            integration
                                        </li>
                                        <li>
                                            <strong>Tool Router:</strong> OpenAI embeddings +
                                            pattern matching
                                        </li>
                                        <li>
                                            <strong>Document Processing:</strong> Multi-format file
                                            analysis
                                        </li>
                                        <li>
                                            <strong>Web Search:</strong> Real-time grounding
                                            capabilities
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-4 text-xl font-semibold">Open Source & Community</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is built with transparency and community in mind. We believe in
                                open development practices and welcome contributions from the
                                community.
                            </p>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <Link
                                    href="https://github.com/vinhnx/vtchat"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    View Source Code on GitHub
                                </Link>
                            </div>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <Link
                                    href="https://x.com/intent/tweet?text=Check%20out%20VT%20-%20Production-ready%20AI%20chat%20with%20all%20premium%20models%20free!&url=https%3A%2F%2Fvtchat.io.vn%2F"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors"
                                >
                                    Share VT on X/Twitter
                                </Link>
                            </div>

                            <div className="mt-8 border-t pt-6">
                                <p className="text-muted-foreground text-center text-sm">
                                    Last updated: July 13, 2025 | Production Status: ✅ Live at{" "}
                                    <Link
                                        href="https://vtchat.io.vn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline"
                                    >
                                        vtchat.io.vn
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
