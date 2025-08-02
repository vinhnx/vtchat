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
                                to ALL premium models with your own API keys, plus generous free
                                tiers.
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Multi-Provider Support:</strong> OpenAI, Anthropic,
                                    Google, Fireworks, Together AI, xAI, DeepSeek, plus local
                                    providers (Ollama, LM Studio)
                                </li>
                                <li>
                                    <strong>Premium AI Models (Free with BYOK):</strong> ALL premium
                                    models including Claude 4, GPT-4.1, O3, O1 series, Gemini 2.5
                                    Pro, DeepSeek R1, Grok 3 - available to all logged-in users with
                                    their own API keys
                                </li>
                                <li>
                                    <strong>Server-Funded Models:</strong> Gemini models (2.5 Flash
                                    Lite: 20/day, 2.5 Flash: 10/day, 2.5 Pro: 5/day) + OpenRouter
                                    models - no API keys required
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
                            <h3 className="mb-4 text-xl font-semibold">VT+ Premium Features</h3>
                            <p className="text-muted-foreground mb-4">
                                Upgrade to VT+ for enhanced research capabilities with flexible,
                                database-driven quotas.
                            </p>
                            <ul className="text-muted-foreground list-inside list-disc space-y-2">
                                <li>
                                    <strong>Deep Research:</strong> Advanced research capabilities
                                    with comprehensive analysis - 10 daily uses for VT+ subscribers
                                </li>
                                <li>
                                    <strong>Pro Search:</strong> Enhanced search with web
                                    integration - 20 daily uses for VT+ subscribers
                                </li>
                                <li>
                                    <strong>Google Dynamic Retrieval:</strong> Advanced AI-powered
                                    search with dynamic content retrieval
                                </li>
                                <li>
                                    <strong>All Gemini Models Without BYOK:</strong> Access all
                                    Gemini models plus enhanced tools without needing your own API
                                    keys
                                </li>
                                <li>
                                    <strong>Flexible Quotas:</strong> Database-driven quota system
                                    allows for dynamic adjustments based on usage patterns and
                                    feedback
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
                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                                <a
                                    href="https://devhub.best/projects/vt-chat"
                                    target="_blank"
                                    title="DevHub Top 1 Daily Winner"
                                    rel="noopener noreferrer"
                                >
                                    <img
                                        src="https://devhub.best/images/badges/top1-light.svg"
                                        alt="DevHub Top 1 Daily Winner"
                                        style={{ width: "195px", height: "auto" }}
                                    />
                                </a>
                            </div>

                            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                                <a href="https://indie.deals?ref=https%3A%2F%2Fvtchat.io.vn" target="_blank" rel="noopener noreferrer">
                                  <style>
                                    .indie-deals-badge {
                                      position: relative;
                                      overflow: hidden;
                                      display: inline-block;
                                    }
                                    .indie-deals-badge::after {
                                      content: '';
                                      position: absolute;
                                      top: 0;
                                      left: 0;
                                      width: 100%;
                                      height: 100%;
                                      background: linear-gradient(45deg,
                                        rgba(255,255,255,0) 0%,
                                        rgba(255,255,255,0) 40%,
                                        rgba(255,255,255,0.9) 50%,
                                        rgba(255,255,255,0) 60%,
                                        rgba(255,255,255,0) 100%);
                                      transform: translateX(-100%) rotate(45deg);
                                      pointer-events: none;
                                      transition: transform 0.3s ease-out;
                                    }
                                    .indie-deals-badge:hover::after {
                                      animation: indie-deals-shine 1s ease-out;
                                    }
                                    @keyframes indie-deals-shine {
                                      0% { transform: translateX(-100%) rotate(45deg); }
                                      50% { transform: translateX(0%) rotate(45deg); }
                                      100% { transform: translateX(100%) rotate(45deg); }
                                    }
                                  </style>
                                  <svg
                                    width="180"
                                    height="60"
                                    viewBox="0 0 180 60"
                                    xmlns="http://www.w3.org/2000/svg"
                                    class="indie-deals-badge"
                                  >
                                    <defs>
                                      <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stop-color="#ffffff" />
                                        <stop offset="100%" stop-color="#e6f0fc" />
                                      </linearGradient>
                                    </defs>

                                    <rect
                                      width="180"
                                      height="60"
                                      rx="10"
                                      fill="url(#badgeGradient)"
                                    />

                                    <rect
                                      x="0.75"
                                      y="0.75"
                                      width="178.5"
                                      height="58.5"
                                      rx="9.25"
                                      fill="none"
                                      stroke="#0070f3"
                                      stroke-width="1.5"
                                      stroke-opacity="0.3"
                                    />

                                    <image
                                      href="https://indie.deals/logo_badge.png"
                                      x="14.4"
                                      y="12"
                                      width="36"
                                      height="36"
                                      preserveAspectRatio="xMidYMid meet"
                                      filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.15))"
                                    />

                                    <text
                                      x="120.60000000000001"
                                      y="22.8"
                                      text-anchor="middle"
                                      dominant-baseline="middle"
                                      font-family="system-ui, -apple-system, sans-serif"
                                      font-size="10.799999999999999"
                                      font-weight="normal"
                                      fill="#4b5563"
                                      letter-spacing="0.01em"
                                    >
                                      Find us on
                                    </text>
                                    <text
                                      x="120.60000000000001"
                                      y="39"
                                      text-anchor="middle"
                                      dominant-baseline="middle"
                                      font-family="system-ui, -apple-system, sans-serif"
                                      font-size="13.2"
                                      font-weight="bold"
                                      fill="#0070f3"
                                      letter-spacing="0.01em"
                                    >
                                      Indie.Deals
                                    </text>
                                  </svg>
                                </a>
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
