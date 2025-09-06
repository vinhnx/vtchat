// Server Component: remove 'use client' to allow metadata export

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
    title: 'AI Glossary - Conversational Image Editing & Artificial Intelligence Terms | VT',
    description:
        'Comprehensive AI glossary covering conversational image editing (Nano Banana), artificial intelligence, generative AI, deep learning, natural language processing (NLP), large language models (LLMs), machine learning, computer vision, and AI systems terminology.',
    keywords: [
        'ai glossary',
        'conversational image editing terms',
        'nano banana definitions',
        'artificial intelligence terms',
        'ai definitions',
        'generative ai glossary',
        'deep learning terms',
        'natural language processing nlp glossary',
        'large language models llms definitions',
        'machine learning glossary',
        'ai systems terminology',
        'computer vision terms',
        'artificial general intelligence agi definitions',
        'iterative image editing terms',
    ],
    openGraph: {
        title: 'AI Glossary - Conversational Image Editing & Artificial Intelligence Terms',
        description:
            'Complete glossary of AI terms including conversational image editing (Nano Banana), generative AI, deep learning, natural language processing, and machine learning definitions.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://vtchat.io.vn/ai-glossary',
    },
};

export default function AIGlossaryPage() {
    const glossaryTerms = [
        {
            term: 'Agentic AI',
            definition:
                'AI systems that can work autonomously to achieve goals without direct human input.',
        },
        {
            term: 'Algorithm',
            definition: 'A set of rules or instructions that a machine follows to complete a task.',
        },
        {
            term: 'Artificial General Intelligence (AGI)',
            definition: 'A type of AI that can perform any intellectual task a human can.',
        },
        {
            term: 'Artificial Intelligence (AI)',
            definition:
                'The simulation of human intelligence in machines, enabling them to think and learn.',
        },
        {
            term: 'Autonomous',
            definition: 'A machine that can perform its tasks without human intervention.',
        },
        {
            term: 'Big Data',
            definition:
                'Extremely large and complex datasets that require specialized tools to process.',
        },
        {
            term: 'Chatbot',
            definition: 'A program designed to simulate human conversation through text or voice.',
        },
        {
            term: 'Cognitive Computing',
            definition:
                'AI systems that simulate human thought processes to solve complex problems, combining machine learning, natural language processing, and other AI technologies.',
        },
        {
            term: 'Computer Vision',
            definition:
                'An AI field that trains computers to interpret and understand visual information from the world, enabling machines to identify objects, analyze images, and process visual data in real-time.',
        },
        {
            term: 'Data Mining',
            definition:
                'The process of analyzing large datasets to find new patterns and insights.',
        },
        {
            term: 'Deep Learning',
            definition:
                'A subfield of machine learning that uses neural networks with many layers to learn from large amounts of data.',
        },
        {
            term: 'Deep Neural Networks',
            definition:
                'Neural networks with multiple hidden layers that can learn complex patterns and representations from data, forming the foundation of deep learning systems.',
        },
        {
            term: 'Generative AI',
            definition:
                'AI models that can create new and original content, such as text, images, or music.',
        },
        {
            term: 'Hallucination',
            definition:
                'A confident response from an AI that is not justified by its training data.',
        },
        {
            term: 'Hidden Layers',
            definition:
                'Intermediate layers in neural networks between input and output layers that process and transform data, enabling the network to learn complex patterns and relationships.',
        },
        {
            term: 'Human Intelligence',
            definition:
                'The cognitive abilities that humans possess, including reasoning, learning, problem-solving, creativity, and emotional understanding, which AI systems aim to replicate or augment.',
        },
        {
            term: 'Large Language Model (LLM)',
            definition:
                'A type of AI model trained on vast amounts of text data to understand and generate human-like language.',
        },
        {
            term: 'Machine Learning (ML)',
            definition:
                'A subset of AI that allows computers to learn from data and improve their performance over time without being explicitly programmed.',
        },
        {
            term: 'Machine Learning Models',
            definition:
                'Mathematical algorithms and statistical models that enable computers to learn from and make predictions or decisions based on data without being explicitly programmed for each task.',
        },
        {
            term: 'Natural Language Processing (NLP)',
            definition:
                'A field of AI that focuses on the interaction between computers and human language.',
        },
        {
            term: 'Neural Network',
            definition:
                'A computer system modeled after the human brain, used for tasks like speech and image recognition.',
        },
        {
            term: 'Pattern Recognition',
            definition:
                'The ability of AI systems to identify regularities, trends, and structures in data, enabling them to classify information and make predictions based on learned patterns.',
        },
        {
            term: 'Prompt',
            definition: 'The input given to an AI model to guide its output.',
        },
        {
            term: 'Real-Time Processing',
            definition:
                'The ability of AI systems to process and respond to data immediately as it is received, enabling instant analysis and decision-making for time-sensitive applications.',
        },
        {
            term: 'Specific Tasks',
            definition:
                'Particular functions or activities that AI systems are designed to perform, such as image recognition, language translation, or data analysis, often excelling in narrow domains.',
        },
        {
            term: 'Supervised Learning',
            definition: 'A type of machine learning where the model is trained on labeled data.',
        },
        {
            term: 'Training Data',
            definition:
                'Large amounts of data used to teach AI systems how to perform specific tasks, providing examples and patterns that the AI learns from to improve its performance.',
        },
        {
            term: 'Unsupervised Learning',
            definition:
                'A type of machine learning where the model finds patterns in unlabeled data.',
        },
    ].sort((a, b) => a.term.localeCompare(b.term));

    return (
        <div className='bg-background min-h-screen'>
            {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
            <h1 className='sr-only invisible absolute h-0 w-0 overflow-hidden text-[0px] leading-[0] opacity-0'>
                AI Glossary - Artificial Intelligence Terms & Definitions | VT
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
                                <BreadcrumbPage>AI Glossary</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background w-full px-4 py-12'>
                <div className='mx-auto max-w-4xl'>
                    <div className='mb-12 text-center'>
                        <h2 className='text-foreground mb-4 text-3xl font-semibold md:text-4xl'>
                            Artificial Intelligence Glossary
                        </h2>
                        <p className='text-muted-foreground mx-auto max-w-2xl text-lg'>
                            Comprehensive definitions of artificial intelligence terms, from
                            generative AI and deep learning to natural language processing (NLP) and
                            large language models (LLMs). Understanding AI terminology is essential
                            for navigating the world of artificial intelligence systems.
                        </p>
                    </div>

                    <section aria-labelledby='glossary-heading'>
                        <h2 id='glossary-heading' className='sr-only'>Glossary terms</h2>
                        <dl className='divide-y divide-border'>
                            {glossaryTerms.map((item, index) => (
                                <div key={index} className='py-5'>
                                    <dt className='text-foreground text-lg font-semibold'>
                                        {item.term}
                                    </dt>
                                    <dd className='text-muted-foreground mt-1 leading-relaxed'>
                                        {item.definition}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>

                    {/* Additional AI Context */}
                    <div className='mt-12 space-y-8'>
                        <div className='bg-muted/50 rounded-xl p-8'>
                            <h2 className='text-foreground mb-6 text-2xl font-bold'>
                                Understanding AI in the Real World
                            </h2>
                            <p className='text-muted-foreground mb-4'>
                                Artificial intelligence has moved beyond science fiction to become
                                an integral part of our daily lives. From the AI systems that power
                                search engines to the machine learning models that recommend
                                content, AI technology is everywhere. Understanding these terms
                                helps you navigate the rapidly evolving landscape of artificial
                                intelligence and make informed decisions about AI tools and
                                platforms.
                            </p>
                            <p className='text-muted-foreground'>
                                Whether you're interested in generative AI for content creation,
                                deep learning for data analysis, or natural language processing for
                                communication, this glossary provides the foundation you need to
                                understand and leverage artificial intelligence effectively.
                            </p>
                        </div>

                        <div className='bg-muted/30 rounded-xl p-8'>
                            <h2 className='text-foreground mb-6 text-2xl font-bold'>
                                The Future of Artificial Intelligence
                            </h2>
                            <p className='text-muted-foreground mb-4'>
                                As AI technology continues to advance, new terms and concepts emerge
                                regularly. The goal of artificial general intelligence (AGI)
                                represents the ultimate aspiration of AI research - creating systems
                                that can match human intelligence across all domains rather than
                                excelling at specific tasks.
                            </p>
                            <p className='text-muted-foreground'>
                                Current AI systems, while impressive in their capabilities, are
                                still narrow AI - designed to perform specific tasks with
                                human-level or superhuman performance. The journey toward AGI
                                involves advancing all areas of AI, from improving large language
                                models to developing more sophisticated computer vision and
                                reasoning capabilities.
                            </p>
                        </div>
                    </div>
                    {/* Related Links - Enhanced Internal Linking for SEO */}
                    <InternalLinks
                        links={Array.isArray(aiRelatedLinks)
                            ? aiRelatedLinks.filter(link => link.href !== '/ai-glossary').map(
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
