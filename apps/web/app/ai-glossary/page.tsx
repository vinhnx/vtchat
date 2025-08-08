import { Footer } from "@repo/common/components";
import { Button } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "AI Glossary - Artificial Intelligence Terms & Definitions | VT",
    description:
        "Comprehensive AI glossary covering artificial intelligence, generative AI, deep learning, natural language processing (NLP), large language models (LLMs), machine learning, computer vision, and AI systems terminology.",
    keywords: [
        "ai glossary",
        "artificial intelligence terms",
        "ai definitions",
        "generative ai glossary",
        "deep learning terms",
        "natural language processing nlp glossary",
        "large language models llms definitions",
        "machine learning glossary",
        "ai systems terminology",
        "computer vision terms",
        "artificial general intelligence agi definitions",
    ],
    openGraph: {
        title: "AI Glossary - Artificial Intelligence Terms & Definitions",
        description:
            "Complete glossary of artificial intelligence terms including generative AI, deep learning, natural language processing, and machine learning definitions.",
        type: "website",
    },
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://vtchat.io.vn/ai-glossary",
    },
};

export default function AIGlossaryPage() {
    const glossaryTerms = [
        {
            term: "Artificial Intelligence (AI)",
            definition:
                "A branch of computer science that aims to create machines capable of performing tasks that typically require human intelligence, including learning, reasoning, problem-solving, and understanding natural language.",
        },
        {
            term: "Generative AI",
            definition:
                "AI systems that can create new content, including text, images, code, and other media, by learning patterns from training data and generating novel outputs based on prompts or inputs.",
        },
        {
            term: "Deep Learning",
            definition:
                "A subset of machine learning that uses deep neural networks with multiple hidden layers to process and analyze complex patterns in large amounts of data, mimicking the way human brains work.",
        },
        {
            term: "Natural Language Processing (NLP)",
            definition:
                "A field of AI that focuses on enabling computers to understand, interpret, and generate human language in a way that is both meaningful and useful for real-world applications.",
        },
        {
            term: "Large Language Models (LLMs)",
            definition:
                "Advanced AI systems trained on massive datasets of text to understand and generate human-like language, capable of performing various language tasks with human-level proficiency.",
        },
        {
            term: "Machine Learning",
            definition:
                "A method of data analysis that automates analytical model building, allowing AI systems to learn from data, identify patterns, and make decisions with minimal human intervention.",
        },
        {
            term: "Computer Vision",
            definition:
                "An AI field that trains computers to interpret and understand visual information from the world, enabling machines to identify objects, analyze images, and process visual data in real-time.",
        },
        {
            term: "Neural Networks",
            definition:
                "Computing systems inspired by biological neural networks, consisting of interconnected nodes (neurons) that process information and learn patterns from data.",
        },
        {
            term: "Deep Neural Networks",
            definition:
                "Neural networks with multiple hidden layers that can learn complex patterns and representations from data, forming the foundation of deep learning systems.",
        },
        {
            term: "Hidden Layers",
            definition:
                "Intermediate layers in neural networks between input and output layers that process and transform data, enabling the network to learn complex patterns and relationships.",
        },
        {
            term: "Artificial General Intelligence (AGI)",
            definition:
                "A theoretical form of AI that would match or exceed human cognitive abilities across all domains, capable of understanding, learning, and applying intelligence to any problem.",
        },
        {
            term: "Machine Learning Models",
            definition:
                "Mathematical algorithms and statistical models that enable computers to learn from and make predictions or decisions based on data without being explicitly programmed for each task.",
        },
        {
            term: "Real-Time Processing",
            definition:
                "The ability of AI systems to process and respond to data immediately as it is received, enabling instant analysis and decision-making for time-sensitive applications.",
        },
        {
            term: "Training Data",
            definition:
                "Large amounts of data used to teach AI systems how to perform specific tasks, providing examples and patterns that the AI learns from to improve its performance.",
        },
        {
            term: "AI Systems",
            definition:
                "Complete artificial intelligence solutions that combine various AI technologies, algorithms, and models to perform complex tasks that traditionally require human intelligence.",
        },
        {
            term: "Human Intelligence",
            definition:
                "The cognitive abilities that humans possess, including reasoning, learning, problem-solving, creativity, and emotional understanding, which AI systems aim to replicate or augment.",
        },
        {
            term: "Specific Tasks",
            definition:
                "Particular functions or activities that AI systems are designed to perform, such as image recognition, language translation, or data analysis, often excelling in narrow domains.",
        },
        {
            term: "Algorithm",
            definition:
                "A set of rules or instructions that AI systems follow to solve problems, process data, or make decisions, forming the logical foundation of artificial intelligence operations.",
        },
        {
            term: "Pattern Recognition",
            definition:
                "The ability of AI systems to identify regularities, trends, and structures in data, enabling them to classify information and make predictions based on learned patterns.",
        },
        {
            term: "Cognitive Computing",
            definition:
                "AI systems that simulate human thought processes to solve complex problems, combining machine learning, natural language processing, and other AI technologies.",
        },
    ];

    return (
        <div className="bg-background min-h-screen">
            {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
            <h1 className="sr-only invisible absolute h-0 w-0 overflow-hidden text-[0px] leading-[0] opacity-0">
                AI Glossary - Artificial Intelligence Terms & Definitions | VT
            </h1>

            {/* Header */}
            <header className="border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
                    <Link href="/">
                        <Button className="gap-2" size="sm" variant="ghost">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">AI Glossary</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto max-w-4xl">
                    <div className="mb-12 text-center">
                        <h2 className="text-foreground mb-4 text-3xl font-semibold md:text-4xl">
                            Artificial Intelligence Glossary
                        </h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
                            Comprehensive definitions of artificial intelligence terms, from
                            generative AI and deep learning to natural language processing (NLP) and
                            large language models (LLMs). Understanding AI terminology is essential
                            for navigating the world of artificial intelligence systems.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {glossaryTerms.map((item, index) => (
                            <div key={index} className="bg-card rounded-lg p-6">
                                <h3 className="text-foreground mb-3 text-xl font-semibold">
                                    {item.term}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.definition}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Additional AI Context */}
                    <div className="mt-12 space-y-8">
                        <div className="bg-muted/50 rounded-xl p-8">
                            <h2 className="text-foreground mb-6 text-2xl font-bold">
                                Understanding AI in the Real World
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                Artificial intelligence has moved beyond science fiction to become
                                an integral part of our daily lives. From the AI systems that power
                                search engines to the machine learning models that recommend
                                content, AI technology is everywhere. Understanding these terms
                                helps you navigate the rapidly evolving landscape of artificial
                                intelligence and make informed decisions about AI tools and
                                platforms.
                            </p>
                            <p className="text-muted-foreground">
                                Whether you're interested in generative AI for content creation,
                                deep learning for data analysis, or natural language processing for
                                communication, this glossary provides the foundation you need to
                                understand and leverage artificial intelligence effectively.
                            </p>
                        </div>

                        <div className="bg-muted/30 rounded-xl p-8">
                            <h2 className="text-foreground mb-6 text-2xl font-bold">
                                The Future of Artificial Intelligence
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                As AI technology continues to advance, new terms and concepts emerge
                                regularly. The goal of artificial general intelligence (AGI)
                                represents the ultimate aspiration of AI research - creating systems
                                that can match human intelligence across all domains rather than
                                excelling at specific tasks.
                            </p>
                            <p className="text-muted-foreground">
                                Current AI systems, while impressive in their capabilities, are
                                still narrow AI - designed to perform specific tasks with
                                human-level or superhuman performance. The journey toward AGI
                                involves advancing all areas of AI, from improving large language
                                models to developing more sophisticated computer vision and
                                reasoning capabilities.
                            </p>
                        </div>
                    </div>
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
