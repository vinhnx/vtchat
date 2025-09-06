'use client';

import { useSession } from '@repo/shared/lib/auth-client';

interface SEOContentProps {
    showOnHomepage?: boolean;
    className?: string;
}

export function SEOContent({ showOnHomepage = false, className = '' }: SEOContentProps) {
    const { data: session, isPending } = useSession();

    // Only show SEO content for non-logged users or when explicitly requested
    if ((isPending || session) && !showOnHomepage) {
        return null;
    }

    return (
        <div className={`seo-content ${className}`}>
            {/* Additional structured content for search engines - completely hidden */}
            <div className='sr-only pointer-events-none invisible absolute h-0 w-0 overflow-hidden opacity-0'>
                <article>
                    <h2>Complete Guide to Artificial Intelligence (AI)</h2>
                    <p>
                        Artificial Intelligence (AI) represents one of the most transformative
                        technologies of our time. Our comprehensive AI platform features the world's
                        first conversational image editor (Nano Banana) and combines generative AI,
                        deep learning, natural language processing (NLP), large language models
                        (LLMs), and machine learning to deliver advanced artificial intelligence
                        capabilities that rival human intelligence in specific tasks.
                    </p>

                    <h3>Types of Artificial Intelligence Systems</h3>
                    <ol>
                        <li>
                            <strong>Conversational Image Editing (Nano Banana):</strong>{' '}
                            Conversational image editor allowing iterative image modification
                            through natural language
                        </li>
                        <li>
                            <strong>Generative AI:</strong>{' '}
                            Creates new content, text, images, and solutions using advanced
                            algorithms
                        </li>
                        <li>
                            <strong>Deep Learning AI:</strong>{' '}
                            Uses deep neural networks with hidden layers for complex pattern
                            recognition
                        </li>
                        <li>
                            <strong>Natural Language Processing (NLP):</strong>{' '}
                            Enables human-like conversation and text understanding
                        </li>
                        <li>
                            <strong>Machine Learning AI:</strong>{' '}
                            Learns from large amounts of data to improve performance over time
                        </li>
                        <li>
                            <strong>Computer Vision AI:</strong>{' '}
                            Processes and analyzes visual content in real-time
                        </li>
                        <li>
                            <strong>Large Language Models (LLMs):</strong>{' '}
                            Advanced AI systems trained on massive datasets
                        </li>
                    </ol>

                    <h3>How AI Systems Work</h3>
                    <p>
                        Modern AI systems utilize machine learning models trained on large amounts
                        of data to perform tasks that traditionally require human intelligence.
                        These deep neural networks with multiple hidden layers process information
                        through complex algorithms, enabling AI to understand context, generate
                        responses, and solve problems with human-level accuracy.
                    </p>

                    <h3>AI Applications in the Real World</h3>
                    <ol>
                        <li>Conversational image creation and editing with Nano Banana</li>
                        <li>Business automation and process optimization</li>
                        <li>Content creation and creative writing</li>
                        <li>Data analysis and predictive modeling</li>
                        <li>Customer service and support automation</li>
                        <li>Research and scientific discovery</li>
                        <li>Language translation and communication</li>
                        <li>Image and video analysis</li>
                        <li>Decision support systems</li>
                    </ol>

                    <h3>Benefits of Advanced AI Technology</h3>
                    <ul>
                        <li>Increased productivity and efficiency</li>
                        <li>24/7 availability and real-time processing</li>
                        <li>Consistent quality and accuracy</li>
                        <li>Scalable solutions for growing businesses</li>
                        <li>Cost-effective automation of repetitive tasks</li>
                        <li>Enhanced decision-making capabilities</li>
                        <li>Improved user experiences and personalization</li>
                    </ul>

                    <h3>The Future of Artificial General Intelligence (AGI)</h3>
                    <p>
                        While current AI systems excel at specific tasks, the goal of artificial
                        general intelligence (AGI) is to create AI that matches human intelligence
                        across all domains. Our platform represents significant progress toward this
                        goal, moving beyond science fiction to deliver practical AI solutions that
                        demonstrate human-level reasoning and understanding in the real world.
                    </p>

                    <h3>Getting Started with AI</h3>
                    <ol>
                        <li>Choose the right AI platform for your needs</li>
                        <li>Start with simple tasks to understand AI capabilities</li>
                        <li>Gradually integrate AI into your workflow</li>
                        <li>Monitor and optimize AI performance</li>
                        <li>Stay updated with the latest AI developments</li>
                    </ol>
                </article>
            </div>
        </div>
    );
}
