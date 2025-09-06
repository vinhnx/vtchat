import { aiRelatedLinks } from '@/lib/constants/ai-links';
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
    title:
        'AI Resources - Learn Conversational Image Editing, Artificial Intelligence & Machine Learning | VT',
    description:
        'Comprehensive AI resources covering conversational image editing (Nano Banana), artificial intelligence, generative AI, deep learning, natural language processing (NLP), large language models (LLMs), machine learning tutorials, and AI system guides.',
    keywords: [
        'ai resources',
        'conversational image editing',
        'nano banana image editor',
        'artificial intelligence learning',
        'ai tutorials',
        'generative ai guides',
        'deep learning resources',
        'natural language processing nlp tutorials',
        'large language models llms guides',
        'machine learning resources',
        'ai systems tutorials',
        'computer vision guides',
        'artificial general intelligence agi resources',
        'iterative image editing',
    ],
    openGraph: {
        title:
            'AI Resources - Learn Conversational Image Editing, Artificial Intelligence & Machine Learning',
        description:
            'Comprehensive resources for learning artificial intelligence, including the revolutionary Nano Banana conversational image editor, generative AI, deep learning, natural language processing, and machine learning.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://vtchat.io.vn/ai-resources',
    },
};

export default function AIResourcesPage() {
    const resources = [
        {
            category: 'Getting Started with AI',
            items: [
                {
                    title: 'Introduction to Artificial Intelligence',
                    description:
                        'Learn the fundamentals of AI, including how artificial intelligence systems work, the difference between narrow AI and artificial general intelligence (AGI), and real-world applications of AI technology.',
                },
                {
                    title: 'Understanding Machine Learning',
                    description:
                        'Explore machine learning models, how they learn from large amounts of data, and how they perform specific tasks that traditionally require human intelligence.',
                },
                {
                    title: 'AI vs Human Intelligence',
                    description:
                        'Compare artificial intelligence capabilities with human intelligence, understanding where AI excels and where human cognitive abilities remain superior.',
                },
            ],
        },
        {
            category: 'Generative AI & Large Language Models',
            items: [
                {
                    title: 'What is Generative AI?',
                    description:
                        'Discover how generative AI creates new content, from text and images to code and creative works, using advanced algorithms and large language models (LLMs).',
                },
                {
                    title: 'Large Language Models (LLMs) Explained',
                    description:
                        "Learn about LLMs like GPT-4, Claude, and Gemini, how they're trained on massive datasets, and their capabilities in natural language understanding and generation.",
                },
                {
                    title: 'Prompt Engineering Best Practices',
                    description:
                        'Master the art of communicating with AI systems effectively, crafting prompts that get the best results from generative AI and large language models.',
                },
            ],
        },
        {
            category: 'Deep Learning & Neural Networks',
            items: [
                {
                    title: 'Deep Learning Fundamentals',
                    description:
                        'Understand deep neural networks, hidden layers, and how deep learning enables AI systems to process complex patterns and make sophisticated decisions.',
                },
                {
                    title: 'Neural Network Architecture',
                    description:
                        'Explore different types of neural networks, from simple perceptrons to complex deep neural networks with multiple hidden layers.',
                },
                {
                    title: 'Training AI Models',
                    description:
                        'Learn how AI systems are trained on large amounts of data, the role of algorithms in learning, and how models improve their performance over time.',
                },
            ],
        },
        {
            category: 'Natural Language Processing (NLP)',
            items: [
                {
                    title: 'NLP Basics and Applications',
                    description:
                        'Discover how natural language processing enables AI to understand human language, from chatbots to translation services and sentiment analysis.',
                },
                {
                    title: 'Text Analysis and Understanding',
                    description:
                        'Learn how AI systems process and analyze text, extract meaning, and generate human-like responses in real-time conversations.',
                },
                {
                    title: 'Conversational AI Development',
                    description:
                        'Understand how to build AI systems that can engage in natural conversations, maintaining context and providing relevant responses.',
                },
            ],
        },
        {
            category: 'Computer Vision & Real-Time Processing',
            items: [
                {
                    title: 'Computer Vision Fundamentals',
                    description:
                        'Explore how AI systems process visual information, recognize objects, and analyze images and videos in real-time applications.',
                },
                {
                    title: 'Image Recognition and Analysis',
                    description:
                        'Learn about AI algorithms that can identify objects, faces, and patterns in images, enabling automated visual analysis.',
                },
                {
                    title: 'Real-Time AI Processing',
                    description:
                        'Understand how AI systems process information instantly, enabling immediate responses and real-time decision-making capabilities.',
                },
            ],
        },
        {
            category: 'AI in the Real World',
            items: [
                {
                    title: 'AI Applications Across Industries',
                    description:
                        'Discover how artificial intelligence is transforming industries from healthcare and finance to education and entertainment, moving beyond science fiction.',
                },
                {
                    title: 'Ethical AI and Responsible Development',
                    description:
                        'Learn about the importance of developing AI systems responsibly, considering bias, fairness, and the impact on society.',
                },
                {
                    title: 'The Future of Artificial General Intelligence',
                    description:
                        'Explore the path toward AGI, the challenges involved, and what artificial general intelligence might mean for humanity.',
                },
            ],
        },
    ];

    return (
        <div className='bg-background min-h-screen'>
            {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
            <h1 className='sr-only invisible absolute h-0 w-0 overflow-hidden text-[0px] leading-[0] opacity-0'>
                AI Resources - Learn Artificial Intelligence & Machine Learning | VT
            </h1>

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
                                <BreadcrumbPage>AI Resources</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background w-full px-4 py-12'>
                <div className='mx-auto max-w-6xl'>
                    <div className='mb-12 text-center'>
                        <h2 className='text-foreground mb-4 text-3xl font-semibold md:text-4xl'>
                            Artificial Intelligence Learning Resources
                        </h2>
                        <p className='text-muted-foreground mx-auto max-w-3xl text-lg'>
                            Comprehensive guides and resources for learning artificial intelligence,
                            from basic concepts to advanced topics in generative AI, deep learning,
                            natural language processing (NLP), and machine learning. Whether you're
                            a beginner or an expert, these resources will help you understand and
                            leverage AI systems effectively.
                        </p>
                    </div>

                    <div className='space-y-12'>
                        {resources.map((section, sectionIndex) => (
                            <section key={sectionIndex} className='space-y-4'>
                                <h2 className='text-foreground border-border/30 border-b pb-2 text-2xl font-bold'>
                                    {section.category}
                                </h2>
                                <ul className='divide-y divide-border'>
                                    {section.items.map((item, itemIndex) => (
                                        <li key={itemIndex} className='py-4'>
                                            <p className='text-foreground text-base font-medium'>
                                                {item.title}
                                            </p>
                                            <p className='text-muted-foreground mt-1 text-sm leading-relaxed'>
                                                {item.description}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </div>

                    {/* Additional Content Sections */}
                    <div className='mt-16 space-y-12'>
                        <div className='bg-muted/50 rounded-xl p-8'>
                            <h2 className='text-foreground mb-6 text-2xl font-bold'>
                                Why Learn About Artificial Intelligence?
                            </h2>
                            <div className='grid gap-8 md:grid-cols-2'>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        Career Opportunities
                                    </h3>
                                    <p className='text-muted-foreground mb-4'>
                                        Understanding AI opens doors to exciting career
                                        opportunities in technology, research, and innovation. From
                                        AI engineering to data science, the demand for AI-literate
                                        professionals continues to grow across all industries.
                                    </p>
                                    <ul className='text-muted-foreground space-y-1 text-sm'>
                                        <li>• AI Engineer and Developer roles</li>
                                        <li>• Machine Learning Specialist positions</li>
                                        <li>• Data Scientist opportunities</li>
                                        <li>• AI Product Manager roles</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        Business Innovation
                                    </h3>
                                    <p className='text-muted-foreground mb-4'>
                                        AI knowledge enables businesses to innovate, automate
                                        processes, and create competitive advantages. Understanding
                                        AI helps leaders make informed decisions about technology
                                        adoption and digital transformation.
                                    </p>
                                    <ul className='text-muted-foreground space-y-1 text-sm'>
                                        <li>• Process automation and efficiency</li>
                                        <li>• Customer experience enhancement</li>
                                        <li>• Data-driven decision making</li>
                                        <li>• Competitive advantage through AI</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className='bg-muted/30 rounded-xl p-8'>
                            <h2 className='text-foreground mb-6 text-2xl font-bold'>
                                Learning Path Recommendations
                            </h2>
                            <div className='space-y-6'>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        For Beginners
                                    </h3>
                                    <ol className='text-muted-foreground space-y-2 text-sm'>
                                        <li>1. Start with AI fundamentals and basic concepts</li>
                                        <li>2. Learn about different types of AI systems</li>
                                        <li>3. Explore practical AI applications in daily life</li>
                                        <li>
                                            4. Understand the difference between AI and human
                                            intelligence
                                        </li>
                                        <li>5. Try using AI tools and platforms hands-on</li>
                                    </ol>
                                </div>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        For Intermediate Learners
                                    </h3>
                                    <ol className='text-muted-foreground space-y-2 text-sm'>
                                        <li>
                                            1. Dive deeper into machine learning models and
                                            algorithms
                                        </li>
                                        <li>
                                            2. Study natural language processing and computer vision
                                        </li>
                                        <li>3. Learn about deep learning and neural networks</li>
                                        <li>4. Explore generative AI and large language models</li>
                                        <li>
                                            5. Practice with real-world AI projects and datasets
                                        </li>
                                    </ol>
                                </div>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        For Advanced Practitioners
                                    </h3>
                                    <ol className='text-muted-foreground space-y-2 text-sm'>
                                        <li>1. Research cutting-edge AI developments and papers</li>
                                        <li>2. Contribute to open-source AI projects</li>
                                        <li>3. Develop custom AI models for specific tasks</li>
                                        <li>4. Explore artificial general intelligence research</li>
                                        <li>5. Lead AI initiatives and mentor others</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className='bg-muted/40 rounded-xl p-8'>
                            <h2 className='text-foreground mb-6 text-2xl font-bold'>
                                Staying Updated with AI Developments
                            </h2>
                            <p className='text-muted-foreground mb-6'>
                                The field of artificial intelligence evolves rapidly, with new
                                breakthroughs in generative AI, improvements to large language
                                models, and advances in deep learning happening regularly. Staying
                                informed about these developments is crucial for anyone working with
                                or interested in AI.
                            </p>
                            <div className='grid gap-6 md:grid-cols-2'>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        Key Areas to Watch
                                    </h3>
                                    <ul className='text-muted-foreground space-y-2 text-sm'>
                                        <li>• Advances in large language models (LLMs)</li>
                                        <li>• Breakthroughs in computer vision technology</li>
                                        <li>• Progress toward artificial general intelligence</li>
                                        <li>• New applications of generative AI</li>
                                        <li>• Improvements in real-time processing</li>
                                        <li>• Developments in AI safety and ethics</li>
                                    </ul>
                                </div>
                                <div>
                                    <h3 className='text-foreground mb-3 text-lg font-semibold'>
                                        Learning Resources
                                    </h3>
                                    <ul className='text-muted-foreground space-y-2 text-sm'>
                                        <li>• Research papers and academic publications</li>
                                        <li>• AI conferences and industry events</li>
                                        <li>• Online courses and certification programs</li>
                                        <li>• AI community forums and discussions</li>
                                        <li>• Hands-on experimentation with AI tools</li>
                                        <li>• Following AI researchers and thought leaders</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Related Links - Enhanced Internal Linking for SEO */}
                    <InternalLinks
                        links={Array.isArray(aiRelatedLinks)
                            ? aiRelatedLinks.filter(link => link.href !== '/ai-resources').map(
                                link => ({ href: link.href, label: link.title }),
                            )
                            : []}
                        title='Explore More AI Resources'
                        className='mt-12'
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
