import { Footer } from '@repo/common/components';
import { Button, TypographyH2 } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About VT',
    description: 'Learn about VT - Your privacy-focused AI chat platform with enterprise-grade security and advanced AI capabilities.',
    openGraph: {
        title: 'About VT',
        description: 'Learn about VT - Your privacy-focused AI chat platform with enterprise-grade security.',
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
                        <Button variant="ghost" size="sm" className="gap-2">
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
                        VT is a modern, privacy-first AI chat application with enterprise-grade security and advanced AI capabilities.
                    </p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                            <p className="text-muted-foreground">
                                VT delivers cutting-edge AI capabilities through a sophisticated dual-tier subscription system while maintaining a privacy-first architecture. We believe in providing the most generous free tier in the industry while offering premium research capabilities for power users.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Privacy-First Architecture</h3>
                            <p className="text-muted-foreground mb-4">
                                Your privacy is our top priority. VT implements a local-first storage approach where all your conversations are stored directly in your browser's IndexedDB via Dexie.js.
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Zero Server Storage:</strong> Your conversations never leave your device</li>
                                <li><strong>Multi-User Isolation:</strong> Complete data separation on shared devices</li>
                                <li><strong>Thread Isolation:</strong> Each user account gets completely separate storage</li>
                                <li><strong>Client-Side Encryption:</strong> API keys are encrypted and stored locally</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Advanced AI Capabilities</h3>
                            <p className="text-muted-foreground mb-4">
                                VT integrates with multiple leading AI providers to offer comprehensive AI capabilities:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Multi-Provider Support:</strong> OpenAI, Anthropic, Google, Fireworks, Together AI, and xAI</li>
                                <li><strong>Premium AI Models:</strong> Claude 4, GPT-4.1, O3 series, Gemini 2.5 Pro, DeepSeek R1, Grok 3</li>
                                <li><strong>Free AI Models:</strong> 9 models including Gemini 2.0/2.5 Flash and OpenRouter models</li>
                                <li><strong>Thinking Mode:</strong> AI SDK reasoning tokens with transparent thinking process</li>
                                <li><strong>Document Processing:</strong> Upload and analyze PDFs, documents, and images</li>
                                <li><strong>Structured Output:</strong> Extract structured data from documents</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Enterprise-Grade Security</h3>
                            <p className="text-muted-foreground mb-4">
                                VT implements comprehensive security measures with Arcjet protection:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Advanced Rate Limiting:</strong> Multiple algorithms with user-specific protection</li>
                                <li><strong>Bot Protection:</strong> Intelligent bot detection with configurable policies</li>
                                <li><strong>Email Validation:</strong> Blocks disposable and suspicious emails</li>
                                <li><strong>Web Application Firewall:</strong> Protection against SQL injection and XSS</li>
                                <li><strong>Better Auth:</strong> Modern session management with 87% performance improvement</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Subscription Tiers</h3>
                            <p className="text-muted-foreground mb-4">
                                VT offers the most generous free tier in the industry with only 3 premium features. Upgrade to VT+ for enhanced research capabilities and premium AI models.
                            </p>
                            <div className="text-center">
                                <Link href="/plus">
                                    <Button size="lg" className="gap-2">
                                        View Subscription Plans
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Technology Stack</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is built with modern web technologies for optimal performance and reliability:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>Frontend:</strong> Next.js 14 with App Router, TypeScript, Tailwind CSS</li>
                                <li><strong>UI Components:</strong> Shadcn UI with Radix UI primitives</li>
                                <li><strong>Database:</strong> Neon PostgreSQL with Drizzle ORM</li>
                                <li><strong>Authentication:</strong> Better Auth with secure session management</li>
                                <li><strong>Deployment:</strong> Fly.io with Singapore region optimization</li>
                                <li><strong>Build System:</strong> Turborepo monorepo with 87% faster compilation</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Performance & Reliability</h3>
                            <p className="text-muted-foreground mb-4">
                                VT is production-ready with enterprise-grade performance optimization:
                            </p>
                            <ul className="list-disc list-inside text-muted-foreground space-y-2">
                                <li><strong>87% Faster Compilation:</strong> Build time reduced from 24s to 3s</li>
                                <li><strong>Auth Performance:</strong> 80-90% faster session validation</li>
                                <li><strong>Database Optimization:</strong> 70-80% faster queries with proper indexing</li>
                                <li><strong>Production Deployment:</strong> Auto-scaling with health monitoring</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold mb-4">Open Source & Community</h3>
                            <p className="text-muted-foreground">
                                VT is built with transparency and community in mind. We believe in open development practices and welcome contributions from the community. Our codebase maintains zero TypeScript errors and comprehensive test coverage for reliability.
                            </p>
                        </div>

                        <div className="text-center pt-8">
                            <Link href="/">
                                <Button size="lg" className="gap-2">
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
