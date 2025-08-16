'use client';

import { Footer, WrapperDisclosure } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { TypographyH1 } from '@repo/ui';
import Image from 'next/image';
import Link from 'next/link';
import goodfirmsBadge from 'packages/ui/src/assets/goodfirms_badge.svg';
import peerlistBadge from '../../../public/icons/peerlist_badge.svg';

export function AboutPageClient() {
    const { data: _session, isPending } = useSession();

    return (
        <div className='flex min-h-dvh flex-col'>
            <header className='flex items-center justify-between border-b p-3 md:p-4'>
                <TypographyH1 className='text-lg font-semibold md:text-xl'>VT</TypographyH1>
            </header>
            <div className='flex flex-1 items-center justify-center p-8'>
                <div className='max-w-2xl space-y-6 text-center'>
                    <TypographyH1 className='text-4xl font-bold'>
                        VT - Advanced AI Platform
                    </TypographyH1>
                    <p className='text-muted-foreground break-words px-4 text-base sm:text-lg'>
                        Welcome to VT - Your privacy-focused artificial intelligence chat platform
                        powered by generative AI, deep learning, and natural language processing
                        (NLP). Experience advanced AI systems with large language models (LLMs) and
                        machine learning capabilities.
                    </p>

                    <div className='space-y-4 px-4 text-left'>
                        <h2 className='text-foreground text-xl font-semibold'>
                            Advanced AI Technologies
                        </h2>
                        <ul className='text-muted-foreground space-y-2 text-sm'>
                            <li>
                                • <strong>Generative AI:</strong>{' '}
                                Create content and solve complex problems with artificial
                                intelligence
                            </li>
                            <li>
                                • <strong>Deep Learning:</strong>{' '}
                                Utilize deep neural networks with hidden layers for advanced
                                processing
                            </li>
                            <li>
                                • <strong>Natural Language Processing (NLP):</strong>{' '}
                                Human-like conversation capabilities
                            </li>
                            <li>
                                • <strong>Large Language Models (LLMs):</strong>{' '}
                                Access to the most advanced AI models
                            </li>
                            <li>
                                • <strong>Machine Learning:</strong>{' '}
                                AI systems that learn and adapt to specific tasks
                            </li>
                            <li>
                                • <strong>Computer Vision:</strong>{' '}
                                Process and analyze visual content in real-time
                            </li>
                            <li>
                                • <strong>Real-World Applications:</strong>{' '}
                                Practical AI solutions beyond science fiction
                            </li>
                        </ul>

                        <h3 className='text-foreground pt-4 text-lg font-semibold'>
                            Privacy-First AI Systems
                        </h3>
                        <p className='text-muted-foreground text-sm'>
                            Our artificial intelligence platform prioritizes your privacy while
                            delivering human-level intelligence. All AI processing happens with
                            complete data protection, ensuring your conversations remain private
                            while you access the most advanced artificial general intelligence (AGI)
                            capabilities available.
                        </p>
                    </div>

                    <WrapperDisclosure className='mt-4' />
                    
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
                    
                    <div className='flex flex-wrap items-center justify-center gap-4 pt-8'>
                        <Link
                            href='https://peerlist.io/vinhnx/project/vt'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <Image
                                src={peerlistBadge}
                                alt='Peerlist badge'
                                width={150}
                                height={50}
                                unoptimized
                            />
                        </Link>
                        <Link
                            href='https://www.goodfirms.co/chatbot-software/'
                            target='_blank'
                            rel='noopener noreferrer'
                        >
                            <Image
                                src={goodfirmsBadge}
                                alt='GoodFirms badge'
                                width={150}
                                height={50}
                                unoptimized
                            />
                        </Link>
                    </div>
                </div>
            </div>
            {!isPending && <Footer />}
        </div>
    );
}
