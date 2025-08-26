import { helpRelatedLinks } from '@/lib/constants/ai-links';
import { Footer } from '@repo/common/components';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    InternalLinks,
} from '@repo/ui';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
    title: 'FAQ - Artificial Intelligence Platform Questions | VT',
    description:
        "Frequently asked questions about VT's advanced AI platform featuring generative AI, deep learning, natural language processing (NLP), large language models (LLMs), and machine learning capabilities. Learn about our AI systems and artificial intelligence features.",
    keywords: [
        'ai faq',
        'artificial intelligence questions',
        'generative ai faq',
        'deep learning questions',
        'natural language processing nlp faq',
        'large language models llms faq',
        'machine learning faq',
        'ai systems questions',
        'computer vision faq',
        'real time ai faq',
        'artificial general intelligence agi faq',
    ],
    openGraph: {
        title: 'FAQ - Artificial Intelligence Platform Questions',
        description:
            "Get answers to frequently asked questions about VT's advanced AI platform with generative AI, deep learning, and natural language processing capabilities.",
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://vtchat.io.vn/faq',
    },
};

export default function FAQPage() {
    return (
        <div className='bg-background min-h-screen'>
            {/* Header */}
            <header className='border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm'>
                <div className='mx-auto w-full max-w-7xl px-4 py-4'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>FAQ</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background w-full px-4 py-12'>
                <div className='mx-auto max-w-4xl'>
                    {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
                    <h1 className='sr-only invisible absolute h-0 w-0 overflow-hidden text-[0px] leading-[0] opacity-0'>
                        FAQ - Artificial Intelligence Platform Questions | VT
                    </h1>

                    <div className='mb-12 text-center'>
                        <h2 className='text-foreground mb-4 text-3xl font-semibold md:text-4xl'>
                            Frequently Asked Questions
                        </h2>
                        <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
                            Learn about VT's advanced artificial intelligence platform, generative
                            AI capabilities, deep learning features, and natural language processing
                            (NLP) systems.
                        </p>
                    </div>

                    <div className='space-y-8'>
                        <div className='space-y-6'>
                            <h2 className='text-foreground text-2xl font-semibold'>
                                Artificial Intelligence & AI Systems
                            </h2>

                            <div className='space-y-4'>
                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        What artificial intelligence technologies does VT use?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        VT utilizes advanced AI systems including generative AI,
                                        deep learning with deep neural networks, natural language
                                        processing (NLP), large language models (LLMs), machine
                                        learning models, and computer vision. Our AI platform
                                        combines these technologies to deliver human-level
                                        intelligence for specific tasks in real-time processing.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        How does generative AI work in VT?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Our generative AI systems use large language models (LLMs)
                                        trained on large amounts of data to perform tasks that
                                        require human intelligence. These AI systems utilize deep
                                        neural networks with hidden layers to generate content,
                                        solve complex problems, and provide intelligent responses
                                        that move beyond science fiction into real-world
                                        applications.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        What is natural language processing (NLP) and how does VT
                                        use it?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Natural language processing (NLP) is a branch of artificial
                                        intelligence that helps computers understand and process
                                        human language. VT's AI systems use advanced NLP to enable
                                        human-like conversations, understand context, and provide
                                        intelligent responses. Our machine learning models are
                                        specifically trained for natural language understanding and
                                        generation.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <h2 className='text-foreground text-2xl font-semibold'>
                                Deep Learning & Machine Learning
                            </h2>

                            <div className='space-y-4'>
                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        How does deep learning enhance VT's AI capabilities?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Deep learning uses deep neural networks with multiple hidden
                                        layers to process large amounts of data and learn complex
                                        patterns. VT's AI systems leverage deep learning for
                                        advanced pattern recognition, content generation, and
                                        intelligent decision-making. This enables our AI to perform
                                        specific tasks with human-level accuracy and understanding.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        What machine learning models does VT support?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        VT supports various machine learning models including large
                                        language models (LLMs) from OpenAI, Anthropic, Google, and
                                        other providers. Our platform also integrates with local AI
                                        systems like Ollama and LM Studio, allowing you to run
                                        machine learning models on your own hardware for complete
                                        privacy and control.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        Does VT support computer vision and real-time processing?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Yes, VT includes computer vision capabilities for analyzing
                                        images and visual content. Our AI systems provide real-time
                                        processing for immediate responses and analysis. The
                                        platform can handle multimedia content and provide
                                        intelligent insights using advanced AI algorithms designed
                                        for specific tasks.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <h2 className='text-foreground text-2xl font-semibold'>
                                Large Language Models (LLMs) & AI Features
                            </h2>

                            <div className='space-y-4'>
                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        What large language models (LLMs) are available?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        VT provides access to the most advanced large language
                                        models (LLMs) including Claude 4, GPT-4.1, O3 series, Gemini
                                        2.5 Pro, and many others. These AI systems are trained on
                                        large amounts of data and can perform tasks that require
                                        human intelligence, from creative writing to complex
                                        analysis and problem-solving.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        How does VT approach artificial general intelligence (AGI)?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        While true artificial general intelligence (AGI) is still
                                        developing, VT's AI systems combine multiple AI technologies
                                        to provide comprehensive capabilities. Our platform
                                        integrates generative AI, deep learning, natural language
                                        processing, and machine learning to create AI systems that
                                        can handle diverse real-world tasks with human-level
                                        performance.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        Is VT's AI platform suitable for professional use?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Absolutely. VT's artificial intelligence platform is
                                        designed for both personal and professional use. Our AI
                                        systems can perform specific tasks required in business
                                        environments, research, content creation, data analysis, and
                                        more. The platform's privacy-first approach ensures your
                                        sensitive data remains secure while leveraging the power of
                                        advanced AI technologies.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-6'>
                            <h2 className='text-foreground text-2xl font-semibold'>
                                Privacy & Security
                            </h2>

                            <div className='space-y-4'>
                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        How does VT ensure AI privacy and data security?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        VT implements a privacy-first architecture where all
                                        conversations are stored locally in your browser's
                                        IndexedDB. Our AI systems process your data without storing
                                        it on our servers. This approach ensures that your
                                        interactions with artificial intelligence remain completely
                                        private while still providing access to the most advanced AI
                                        capabilities.
                                    </p>
                                </div>

                                <div className='bg-card rounded-lg p-6'>
                                    <h3 className='mb-2 text-lg font-semibold'>
                                        Can I use VT's AI systems offline or locally?
                                    </h3>
                                    <p className='text-muted-foreground'>
                                        Yes, VT supports local AI through integration with Ollama
                                        and LM Studio. You can run machine learning models and large
                                        language models (LLMs) directly on your own hardware,
                                        ensuring complete privacy and eliminating the need for
                                        internet connectivity. This local AI approach provides the
                                        benefits of artificial intelligence without any external
                                        dependencies.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Related Links - Enhanced Internal Linking for SEO */}
                    <InternalLinks
                        links={Array.isArray(helpRelatedLinks)
                            ? helpRelatedLinks.filter(link => link.href !== '/faq').map(link => ({
                                href: link.href,
                                label: link.title,
                            }))
                            : []}
                        title='Helpful Resources'
                        className='mt-12'
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
