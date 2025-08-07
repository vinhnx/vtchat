"use client";

import { useSession } from "@repo/shared/lib/auth-client";
import NextDynamic from "next/dynamic";
import { SEOContent } from "../components/seo-content";

// This page needs dynamic rendering due to real-time chat functionality
export const dynamic = "force-dynamic";

// Dynamically import components that use agent hooks with no SSR
const ThreadWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.ThreadWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center">
                <div className="animate-pulse">Loading AI chat...</div>
            </div>
        ),
    },
);

const ChatInputWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.ChatInputWithSuspense,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-16 items-center justify-center">
                <div className="animate-pulse">Loading AI input...</div>
            </div>
        ),
    },
);

const FooterWithSuspense = NextDynamic(
    () =>
        import("../components/lazy-components").then((mod) => ({
            default: mod.FooterWithSuspense,
        })),
    {
        ssr: false,
        loading: () => <div className="bg-muted h-16 animate-pulse rounded" />,
    },
);

export default function HomePage() {
    const { data: session, isPending } = useSession();

    return (
        <div className="relative flex h-dvh w-full flex-col">
            {/* SEO-optimized H1 - Completely hidden from view but accessible to search engines */}
            <h1 className="sr-only absolute opacity-0 invisible h-0 w-0 overflow-hidden text-[0px] leading-[0]">
                VT - Advanced AI Chat Platform with Generative AI & Deep Learning
            </h1>

            {/* Hidden SEO Content Section - Only for search engines, completely invisible to users */}
            <div className="sr-only absolute opacity-0 invisible h-0 w-0 overflow-hidden pointer-events-none">
                {!(isPending || session) && (
                    <section className="px-4 py-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Hero Section */}
                            <div className="text-center space-y-6">
                                <h2 className="text-3xl font-bold text-foreground">
                                    What is Artificial Intelligence (AI)?
                                </h2>
                                <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                                    Artificial Intelligence (AI) is a revolutionary technology that
                                    enables machines to simulate human intelligence and perform
                                    tasks that traditionally require human cognitive abilities. Our
                                    advanced AI platform combines generative AI, deep learning,
                                    natural language processing (NLP), and machine learning to
                                    create intelligent systems that can understand, learn, and
                                    respond like humans.
                                </p>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                                    VT represents the cutting edge of AI technology, offering users
                                    access to the most advanced artificial intelligence systems
                                    available today. From large language models (LLMs) like GPT-4
                                    and Claude to sophisticated computer vision capabilities, our
                                    platform democratizes access to enterprise-grade AI tools while
                                    maintaining complete privacy and data sovereignty.
                                </p>
                            </div>

                            {/* Introduction to AI Concepts */}
                            <div className="bg-muted/50 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6">
                                    Understanding Modern AI Technology
                                </h2>
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        Modern artificial intelligence has evolved far beyond simple
                                        automation. Today's AI systems utilize deep neural networks
                                        with multiple hidden layers to process and understand
                                        complex patterns in data. These systems can perform specific
                                        tasks that traditionally require human intelligence, from
                                        understanding natural language to generating creative
                                        content and solving complex problems.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        The foundation of contemporary AI lies in machine learning
                                        models trained on large amounts of data. These models learn
                                        to recognize patterns, make predictions, and generate
                                        responses that often match or exceed human-level performance
                                        in specific domains. The real-world applications of this
                                        technology span across industries, transforming how we work,
                                        communicate, and solve problems.
                                    </p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        What sets VT apart is our commitment to making advanced AI
                                        accessible to everyone while maintaining the highest
                                        standards of privacy and security. Unlike traditional AI
                                        platforms that store your data on remote servers, VT
                                        processes everything locally, ensuring your conversations
                                        and sensitive information never leave your device.
                                    </p>
                                </div>
                            </div>

                            {/* Core AI Technologies */}
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-card rounded-lg p-6 shadow-sm">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">
                                        Generative AI & Large Language Models (LLMs)
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Our platform leverages cutting-edge large language models
                                        (LLMs) including GPT-4, Claude 4, Gemini Pro, and other
                                        advanced AI systems. These generative AI models are trained
                                        on large amounts of data to perform specific tasks with
                                        human-level accuracy.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Advanced text generation and analysis</li>
                                        <li>• Creative content creation</li>
                                        <li>• Complex problem-solving capabilities</li>
                                        <li>• Multi-language support and translation</li>
                                    </ul>
                                </div>

                                <div className="bg-card rounded-lg p-6 shadow-sm">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">
                                        Deep Learning & Neural Networks
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Deep learning utilizes deep neural networks with multiple
                                        hidden layers to process and analyze complex patterns in
                                        data. Our AI systems employ these advanced machine learning
                                        models to deliver sophisticated artificial intelligence
                                        capabilities.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Pattern recognition and analysis</li>
                                        <li>• Predictive modeling and forecasting</li>
                                        <li>• Automated decision-making</li>
                                        <li>• Continuous learning and adaptation</li>
                                    </ul>
                                </div>

                                <div className="bg-card rounded-lg p-6 shadow-sm">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">
                                        Natural Language Processing (NLP)
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        Natural Language Processing (NLP) enables our AI systems to
                                        understand, interpret, and generate human language
                                        naturally. This technology bridges the gap between human
                                        communication and machine understanding.
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Human-like conversation capabilities</li>
                                        <li>• Sentiment analysis and understanding</li>
                                        <li>• Language translation and localization</li>
                                        <li>• Text summarization and extraction</li>
                                    </ul>
                                </div>
                            </div>

                            {/* AI Applications and Use Cases */}
                            <div className="bg-muted/40 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                                    Real-World AI Applications
                                </h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-foreground">
                                            Business Intelligence
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            AI systems analyze business data, generate insights, and
                                            automate decision-making processes to improve efficiency
                                            and productivity.
                                        </p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-foreground">
                                            Content Creation
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Generative AI creates high-quality content, from
                                            articles and marketing copy to code and creative
                                            writing, saving time and resources.
                                        </p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-foreground">
                                            Research & Analysis
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            AI performs complex research tasks, analyzes large
                                            datasets, and provides comprehensive insights that would
                                            require human experts.
                                        </p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-foreground">
                                            Customer Support
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            AI-powered chatbots and virtual assistants provide 24/7
                                            customer support with human-level understanding and
                                            response quality.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced AI Features */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-foreground text-center">
                                    Advanced AI Technologies & Features
                                </h2>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            Machine Learning & Computer Vision
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Our AI platform integrates advanced machine learning
                                            models with computer vision capabilities to process and
                                            analyze visual content in real-time. These AI systems
                                            can perform specific tasks that traditionally require
                                            human intelligence, from image recognition to complex
                                            visual analysis.
                                        </p>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• Image and video analysis</li>
                                            <li>• Object detection and recognition</li>
                                            <li>• Visual content understanding</li>
                                            <li>• Real-time processing capabilities</li>
                                            <li>• Automated visual quality assessment</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            Artificial General Intelligence (AGI) Progress
                                        </h3>
                                        <p className="text-muted-foreground">
                                            While true artificial general intelligence (AGI) remains
                                            a future goal, our AI systems represent significant
                                            progress toward creating machines that can match human
                                            intelligence across diverse domains. Our platform moves
                                            beyond science fiction to deliver practical AI solutions
                                            in the real world.
                                        </p>
                                        <ul className="text-sm text-muted-foreground space-y-2">
                                            <li>• Multi-domain problem solving</li>
                                            <li>• Adaptive learning capabilities</li>
                                            <li>• Cross-functional AI integration</li>
                                            <li>• Human-level reasoning</li>
                                            <li>• Contextual understanding</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy and Security */}
                            <div className="bg-muted/30 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                                    Privacy-First AI Architecture
                                </h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                                            Local Data Storage
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            All conversations and data are stored locally in your
                                            browser, ensuring complete privacy and data sovereignty.
                                        </p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                                            Encrypted Processing
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            AI processing happens with end-to-end encryption,
                                            protecting your sensitive information throughout the
                                            entire workflow.
                                        </p>
                                    </div>
                                    <div className="text-center space-y-3">
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">
                                            No Server Storage
                                        </h4>
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            Your AI interactions never leave your device, providing
                                            maximum security and privacy protection.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Industry Impact */}
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-foreground text-center">
                                    The Impact of AI on Modern Industries
                                </h2>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            Transforming Business Operations
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Artificial intelligence is revolutionizing how
                                            businesses operate across all sectors. From automating
                                            routine tasks to providing deep insights from data
                                            analysis, AI systems are enabling companies to operate
                                            more efficiently and make better decisions. Machine
                                            learning models can process large amounts of data in
                                            real-time, identifying patterns and trends that would be
                                            impossible for humans to detect manually.
                                        </p>
                                        <p className="text-muted-foreground">
                                            In customer service, AI-powered chatbots and virtual
                                            assistants provide 24/7 support, handling complex
                                            queries with human-level understanding. Marketing teams
                                            use generative AI to create personalized content at
                                            scale, while sales organizations leverage predictive
                                            analytics to identify the most promising leads and
                                            opportunities.
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-foreground">
                                            Advancing Scientific Research
                                        </h3>
                                        <p className="text-muted-foreground">
                                            In research and development, AI systems are accelerating
                                            discovery and innovation. Deep learning algorithms
                                            analyze complex datasets in fields like genomics,
                                            climate science, and materials research, uncovering
                                            insights that drive breakthrough discoveries. Natural
                                            language processing helps researchers process vast
                                            amounts of scientific literature, identifying
                                            connections and patterns across disciplines.
                                        </p>
                                        <p className="text-muted-foreground">
                                            Computer vision applications in medical imaging help
                                            doctors detect diseases earlier and more accurately,
                                            while AI-driven drug discovery platforms are reducing
                                            the time and cost of bringing new treatments to market.
                                            These applications demonstrate how AI moves beyond
                                            science fiction to deliver tangible benefits in the real
                                            world.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Future of AI */}
                            <div className="bg-muted/60 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                                    The Future of Artificial Intelligence
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-muted-foreground leading-relaxed">
                                        The journey toward artificial general intelligence (AGI)
                                        represents one of the most ambitious goals in technology.
                                        While current AI systems excel at specific tasks, the vision
                                        of AGI involves creating systems that can match human
                                        intelligence across all domains. This would represent a
                                        fundamental shift in how we interact with technology and
                                        solve complex global challenges.
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                                Emerging AI Capabilities
                                            </h3>
                                            <ul className="text-sm text-muted-foreground space-y-2">
                                                <li>
                                                    • Multi-modal AI that combines text, images, and
                                                    audio processing
                                                </li>
                                                <li>
                                                    • Improved reasoning and logical thinking
                                                    capabilities
                                                </li>
                                                <li>
                                                    • Better understanding of context and nuance in
                                                    communication
                                                </li>
                                                <li>
                                                    • Enhanced creativity and problem-solving
                                                    abilities
                                                </li>
                                                <li>
                                                    • More efficient learning from smaller datasets
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground mb-3">
                                                Ethical AI Development
                                            </h3>
                                            <ul className="text-sm text-muted-foreground space-y-2">
                                                <li>• Ensuring AI systems are fair and unbiased</li>
                                                <li>
                                                    • Protecting user privacy and data sovereignty
                                                </li>
                                                <li>• Maintaining human oversight and control</li>
                                                <li>
                                                    • Promoting transparency in AI decision-making
                                                </li>
                                                <li>
                                                    • Addressing the societal impact of AI
                                                    automation
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Getting Started */}
                            <div className="text-center space-y-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-foreground">
                                    Start Your AI Journey Today
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                    Join thousands of users who are already leveraging the power of
                                    artificial intelligence with VT's advanced AI platform. Whether
                                    you're a developer, researcher, content creator, or business
                                    professional, our AI systems provide the tools you need to
                                    enhance productivity and achieve better results.
                                </p>

                                <div className="text-left max-w-2xl mx-auto mt-8">
                                    <h3 className="text-xl font-semibold text-foreground mb-4">
                                        Your Step-by-Step Guide to AI Success
                                    </h3>
                                    <ol className="text-muted-foreground space-y-3">
                                        <li className="flex items-start">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-3">
                                                1.
                                            </span>
                                            <span>
                                                Choose your preferred AI model from our extensive
                                                collection of large language models (LLMs) including
                                                GPT-4, Claude, and Gemini
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-3">
                                                2.
                                            </span>
                                            <span>
                                                Start with simple tasks to understand how AI systems
                                                respond to your specific needs and requirements
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-3">
                                                3.
                                            </span>
                                            <span>
                                                Explore advanced features like generative AI,
                                                natural language processing, and computer vision
                                                capabilities
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-3">
                                                4.
                                            </span>
                                            <span>
                                                Integrate AI into your daily workflow for tasks that
                                                traditionally require human intelligence and
                                                expertise
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-semibold text-blue-600 dark:text-blue-400 mr-3">
                                                5.
                                            </span>
                                            <span>
                                                Scale your AI usage and explore more sophisticated
                                                applications as you become comfortable with the
                                                technology
                                            </span>
                                        </li>
                                    </ol>
                                </div>
                                <div className="grid md:grid-cols-3 gap-6 mt-8">
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">
                                            Free Access
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Start using advanced AI features immediately with our
                                            generous free tier and bring-your-own-key (BYOK)
                                            options.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">
                                            Premium Models
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Access the latest AI models including GPT-4, Claude 4,
                                            Gemini Pro, and other cutting-edge systems from leading
                                            providers.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-foreground">
                                            Local AI Support
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Run AI models locally with Ollama and LM Studio for
                                            complete privacy and offline capabilities.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            <main id="main-content" className="flex-1 overflow-hidden">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-y-auto">
                        <ThreadWithSuspense />
                    </div>
                </div>
            </main>

            <div className="pb-safe-area-inset-bottom flex-shrink-0">
                <ChatInputWithSuspense showGreeting={true} />
            </div>

            {/* SEO Content for search engines */}
            <SEOContent showOnHomepage={true} />

            {/* Footer pinned to bottom with padding for non-logged users */}
            {!(isPending || session) && (
                <div className="homepage-footer pointer-events-none p-2 md:p-4">
                    <div className="pointer-events-auto">
                        <FooterWithSuspense />
                    </div>
                </div>
            )}
        </div>
    );
}
