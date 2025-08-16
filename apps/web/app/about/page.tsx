import { BadgesSection } from '@/components/badges';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { RelatedLinks, aiRelatedLinks } from '@/components/internal-links';
import { Footer } from '@repo/common/components';
import { Button } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

// This page can be statically generated for better performance
export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'About VT - Advanced AI Platform with Generative AI & Deep Learning',
    description:
        "Learn about VT's advanced artificial intelligence platform featuring generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first AI systems with machine learning capabilities.",
    keywords: [
        'about ai platform',
        'artificial intelligence',
        'generative ai',
        'deep learning',
        'natural language processing nlp',
        'large language models llms',
        'machine learning',
        'ai systems',
        'computer vision',
        'privacy-first ai',
    ],
    openGraph: {
        title: 'About VT - Advanced AI Platform with Generative AI & Deep Learning',
        description:
            "Learn about VT's advanced artificial intelligence platform featuring generative AI, deep learning, natural language processing, and large language models. Privacy-first AI systems.",
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://vtchat.io.vn/about',
    },
};

export default function AboutPage() {
    return (
        <div className='bg-background min-h-screen'>
            {/* Header */}
            <header className='border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm'>
                <div className='mx-auto w-full max-w-7xl px-4 py-4'>
                    <div className='flex items-center justify-between'>
                        <Link href='/'>
                            <Button className='gap-2' size='sm' variant='ghost'>
                                <ArrowLeft size={16} />
                                Back to VT
                            </Button>
                        </Link>
                        <div className='text-muted-foreground text-sm'>About</div>
                    </div>
                    <div className='mt-3'>
                        <BreadcrumbNav />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background w-full px-4 py-12'>
                <div className='mx-auto max-w-7xl'>
                    {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
                    <h1 className='sr-only invisible absolute h-0 w-0 overflow-hidden text-[0px] leading-[0] opacity-0'>
                        About VT - Advanced AI Chat Platform with Privacy-First Architecture
                    </h1>
                    <AboutContent />
                </div>
            </main>

            {/* Footer */}
            <footer className='border-border/50 bg-background border-t'>
                <div className='mx-auto w-full max-w-7xl'>
                    <Footer />
                </div>
            </footer>
        </div>
    );
}

function AboutContent() {
    return (
        <section className='py-8 md:py-16'>
            <div className='mx-auto w-full max-w-4xl px-4 md:px-8 lg:px-12 xl:px-16'>
                <div className='mb-12 text-center'>
                    <h2 className='text-foreground mb-4 text-3xl font-semibold md:text-4xl'>
                        VT
                    </h2>
                    <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
                        VT is a production-ready, privacy-first AI chat application with advanced AI
                        capabilities, offering all premium models for free with BYOK and exclusive
                        research features for professionals.
                    </p>
                </div>

                <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
                    <iframe
                        width='560'
                        height='315'
                        src='https://www.youtube-nocookie.com/embed/5ChJ-b3Ie-k?si=RphgJ7OMT67Xmcpc&amp;controls=0'
                        title='YouTube video player'
                        style={{ border: 0 }}
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                        referrerPolicy='strict-origin-when-cross-origin'
                        allowFullScreen
                    >
                    </iframe>
                </div>

                <br />
                <div className='prose prose-neutral dark:prose-invert max-w-none'>
                    <div className='space-y-8'>
                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>Our Mission</h3>
                            <p className='text-muted-foreground'>
                                VT empowers users with secure, privacy-first AI conversations by
                                offering unlimited access to premium AI models through BYOK while
                                maintaining complete data sovereignty.
                            </p>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>
                                Privacy-First Architecture
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                Your privacy is our top priority. VT implements a local-first
                                storage approach where all your conversations are stored directly in
                                your browser's IndexedDB via Dexie.js.
                            </p>
                            <ul className='text-muted-foreground list-inside list-disc space-y-2'>
                                <li>
                                    <strong>Zero Server Storage:</strong>{' '}
                                    Your conversations never leave your device
                                </li>
                                <li>
                                    <strong>Multi-User Isolation:</strong>{' '}
                                    Complete data separation on shared devices
                                </li>
                                <li>
                                    <strong>Thread Isolation:</strong>{' '}
                                    Each user account gets completely separate storage
                                </li>
                                <li>
                                    <strong>Client-Side Encryption:</strong>{' '}
                                    API keys are encrypted and stored locally
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>
                                Advanced AI Capabilities
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                Frustrated by AI subscription limits? VT gives you unlimited access
                                to ALL premium models with your own API keys, plus generous free
                                tiers.
                            </p>
                            <ul className='text-muted-foreground list-inside list-disc space-y-2'>
                                <li>
                                    <strong>Multi-Provider Support:</strong>{' '}
                                    OpenAI, Anthropic, Google, Fireworks, Together AI, xAI,
                                    DeepSeek, plus local providers (Ollama, LM Studio)
                                </li>
                                <li>
                                    <strong>Premium AI Models (Free with BYOK):</strong>{' '}
                                    ALL premium models including Claude 4, GPT-4.1, O3, O1 series,
                                    Gemini 2.5 Pro, DeepSeek R1, Grok 3 - available to all logged-in
                                    users with their own API keys
                                </li>
                                <li>
                                    <strong>Server-Funded Models:</strong>{' '}
                                    Gemini models (2.5 Flash Lite: 20/day, 2.5 Flash: 10/day, 2.5
                                    Pro: 5/day) + OpenRouter models - no API keys required
                                </li>
                                <li>
                                    <strong>Free Local AI:</strong>{' '}
                                    Run AI models on your own computer with Ollama and LM Studio -
                                    completely free, private, and no API costs
                                </li>
                                <li>
                                    <strong>Chart Visualization (Free):</strong>{' '}
                                    Create interactive bar charts, line graphs, pie charts, and
                                    scatter plots - always available and discoverable through smart
                                    UI
                                </li>
                                <li>
                                    <strong>Web Search Integration (Free):</strong>{' '}
                                    Real-time web search capabilities for current information -
                                    always available
                                </li>
                                <li>
                                    <strong>Thinking Mode (Free):</strong>{' '}
                                    Complete AI SDK reasoning tokens support with transparent
                                    thinking process - available to all logged-in users
                                </li>
                                <li>
                                    <strong>Document Processing (Free):</strong>{' '}
                                    Upload and analyze PDF, DOC, DOCX, TXT, MD files (up to 10MB) -
                                    available to all logged-in users
                                </li>
                                <li>
                                    <strong>Structured Output (Free):</strong>{' '}
                                    AI-powered JSON data extraction from documents - available to
                                    all logged-in users
                                </li>
                                <li>
                                    <strong>Mathematical Calculator (Free):</strong>{' '}
                                    Advanced functions including trigonometry, logarithms, and
                                    arithmetic
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>
                                VT+ Premium Features
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                Upgrade to VT+ for enhanced research capabilities with flexible,
                                database-driven quotas.
                            </p>
                            <ul className='text-muted-foreground list-inside list-disc space-y-2'>
                                <li>
                                    <strong>Deep Research:</strong>{' '}
                                    Advanced research capabilities with comprehensive analysis - 10
                                    daily uses for VT+ subscribers
                                </li>
                                <li>
                                    <strong>Pro Search:</strong>{' '}
                                    Enhanced search with web integration - 20 daily uses for VT+
                                    subscribers
                                </li>
                                <li>
                                    <strong>Google Dynamic Retrieval:</strong>{' '}
                                    Advanced AI-powered search with dynamic content retrieval
                                </li>
                                <li>
                                    <strong>All Gemini Models Without BYOK:</strong>{' '}
                                    Access all Gemini models plus enhanced tools without needing
                                    your own API keys
                                </li>
                                <li>
                                    <strong>Flexible Quotas:</strong>{' '}
                                    Database-driven quota system allows for dynamic adjustments
                                    based on usage patterns and feedback
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>Security & Privacy</h3>
                            <p className='text-muted-foreground mb-4'>
                                Worried about where your data goes? VT stores everything
                                locally—your conversations never leave your device."
                            </p>
                            <ul className='text-muted-foreground list-inside list-disc space-y-2'>
                                <li>
                                    <strong>Bot Protection:</strong>{' '}
                                    Intelligent bot detection for authentication endpoints
                                </li>
                                <li>
                                    <strong>Better Auth:</strong>{' '}
                                    Modern session management with secure OAuth integration
                                </li>
                                <li>
                                    <strong>Local Storage:</strong>{' '}
                                    All conversations stored on your device for maximum privacy
                                </li>
                                <li>
                                    <strong>Direct API Access:</strong>{' '}
                                    Messages sent directly to AI providers, never stored on our
                                    servers
                                </li>
                                <li>
                                    <strong>Encrypted API Keys:</strong>{' '}
                                    Your API keys are encrypted and stored locally only
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>Technology Stack</h3>
                            <p className='text-muted-foreground mb-4'>
                                VT is built with cutting-edge web technologies for optimal
                                performance, security, and developer experience:
                            </p>

                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <div>
                                    <h4 className='mb-2 text-lg font-semibold'>
                                        Frontend & Core
                                    </h4>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-1'>
                                        <li>
                                            <strong>Framework:</strong>{' '}
                                            Next.js 15 (App Router) with TypeScript
                                        </li>
                                        <li>
                                            <strong>React:</strong> React 19.0.0 (latest stable)
                                        </li>
                                        <li>
                                            <strong>UI Components:</strong>{' '}
                                            Shadcn UI with Radix UI primitives
                                        </li>
                                        <li>
                                            <strong>Styling:</strong>{' '}
                                            Tailwind CSS with modern design system
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
                                    <h4 className='mb-2 text-lg font-semibold'>
                                        Backend & Infrastructure
                                    </h4>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-1'>
                                        <li>
                                            <strong>Database:</strong>{' '}
                                            Neon PostgreSQL with Drizzle ORM
                                        </li>
                                        <li>
                                            <strong>Authentication:</strong>{' '}
                                            Better Auth with 87% performance improvement
                                        </li>
                                        <li>
                                            <strong>Payment:</strong> Creem.io with customer portal
                                        </li>
                                        <li>
                                            <strong>Local Storage:</strong> IndexedDB via Dexie.js
                                        </li>
                                        <li>
                                            <strong>Deployment:</strong>{' '}
                                            Fly.io (Singapore + Virginia regions)
                                        </li>
                                        <li>
                                            <strong>Security:</strong>{' '}
                                            Bot detection and secure OAuth
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className='mb-2 text-lg font-semibold'>
                                        Development & Build
                                    </h4>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-1'>
                                        <li>
                                            <strong>Runtime:</strong>{' '}
                                            Bun (package manager + JavaScript runtime)
                                        </li>
                                        <li>
                                            <strong>Monorepo:</strong>{' '}
                                            Turborepo with 87% faster compilation
                                        </li>
                                        <li>
                                            <strong>Testing:</strong> Vitest with Testing Library
                                        </li>
                                        <li>
                                            <strong>Code Quality:</strong>{' '}
                                            dprint + oxlint for comprehensive linting
                                        </li>
                                        <li>
                                            <strong>Type Checking:</strong>{' '}
                                            TypeScript with strict configuration
                                        </li>
                                        <li>
                                            <strong>Performance:</strong>{' '}
                                            React Scan for development optimization
                                        </li>
                                    </ul>
                                </div>

                                <div>
                                    <h4 className='mb-2 text-lg font-semibold'>
                                        AI & Integrations
                                    </h4>
                                    <ul className='text-muted-foreground list-inside list-disc space-y-1'>
                                        <li>
                                            <strong>AI Providers:</strong>{' '}
                                            OpenAI, Anthropic, Google, Fireworks, Together AI, xAI
                                        </li>
                                        <li>
                                            <strong>AI SDK:</strong>{' '}
                                            Vercel AI SDK with reasoning tokens support
                                        </li>
                                        <li>
                                            <strong>Local AI:</strong>{' '}
                                            Ollama and LM Studio integration
                                        </li>
                                        <li>
                                            <strong>Tool Router:</strong>{' '}
                                            OpenAI embeddings + pattern matching
                                        </li>
                                        <li>
                                            <strong>Document Processing:</strong>{' '}
                                            Multi-format file analysis
                                        </li>
                                        <li>
                                            <strong>Web Search:</strong>{' '}
                                            Real-time grounding capabilities
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className='mb-4 text-xl font-semibold'>
                                Open Source & Community
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                VT is built with transparency and community in mind. We believe in
                                open development practices and welcome contributions from the
                                community.
                            </p>

                            <div className='mt-6 flex flex-wrap items-center justify-center gap-4'>
                                <Link
                                    href='https://github.com/vinhnx/vtchat'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-primary hover:underline'
                                >
                                    <Button variant='outline' className='gap-2'>
                                        <svg
                                            className='h-4 w-4'
                                            fill='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <title>GitHub</title>
                                            <path d='M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z' />
                                        </svg>
                                        View on GitHub
                                    </Button>
                                </Link>
                                <Link
                                    href='https://twitter.com/intent/tweet?text=Check%20out%20VT%20-%20Privacy-first%20AI%20chat%20with%20all%20premium%20models%20for%20free!&url=https://vtchat.io.vn'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-primary hover:underline'
                                >
                                    <Button variant='outline' className='gap-2'>
                                        <svg
                                            className='h-4 w-4'
                                            fill='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <title>X (Twitter)</title>
                                            <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
                                        </svg>
                                        Share on X
                                    </Button>
                                </Link>
                            </div>

                            {/* Badges Section - Organized and Performance Optimized */}
                            <div className='mt-8 border-t pt-6'>
                                <h4 className='mb-4 text-center text-lg font-semibold'>
                                    Recognition & Community
                                </h4>
                                <BadgesSection className='mb-6' />
                            </div>

                            <div className='flex justify-center pt-6'>
                                <Link
                                    href='https://vtchat.userjot.com'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='text-primary hover:text-primary/80 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted'
                                >
                                    Send Feedback
                                </Link>
                            </div>
                        </div>

                        {/* Related Links - Enhanced Internal Linking for SEO */}
                        <RelatedLinks 
                            links={aiRelatedLinks.filter(link => link.href !== '/about')} 
                            title='Explore More AI Resources'
                            className='mt-12'
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
