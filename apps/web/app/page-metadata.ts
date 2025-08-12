import type { Metadata, Viewport } from 'next';

const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://vtchat.io.vn'
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const defaultMetadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: 'VT - Advanced AI Chat Platform with Generative AI & Deep Learning',
        template: '%s | VT - AI Platform',
    },
    description:
        'Advanced AI chat platform with generative AI, deep learning, and natural language processing (NLP). Experience artificial intelligence with large language models (LLMs), machine learning, and real-time AI processing. Privacy-first AI systems for specific tasks requiring human intelligence.',
    keywords: [
        'ai',
        'artificial intelligence',
        'generative ai',
        'deep learning',
        'artificial intelligence ai',
        'machine learning models',
        'real time',
        'computer vision',
        'specific tasks',
        'large amounts of data',
        'machine learning model',
        'large language models llms',
        'natural language processing nlp',
        'perform tasks',
        'ai systems',
        'human intelligence',
        'require human',
        'hidden layer',
        'real world',
        'deep neural networks',
        'artificial general intelligence agi',
        'AI chat',
        'privacy-first AI',
        'BYOK AI',
        'free AI models',
        'Claude 4',
        'GPT-4',
        'Gemini Pro',
        'local AI',
        'document processing',
        'web search AI',
        'chart visualization',
        'thinking mode',
        'AI assistant',
    ],
    authors: [{ name: 'Vinh Nguyen', url: 'https://vinhnx.github.io/' }],
    creator: 'Vinh Nguyen',
    publisher: 'VT',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: baseUrl,
        siteName: 'VT - Advanced AI Platform',
        title: 'Advanced AI Chat Platform - Generative AI with Deep Learning',
        description:
            'Experience advanced artificial intelligence with generative AI, deep learning, and natural language processing. Privacy-first AI systems with large language models (LLMs) and machine learning capabilities.',
        images: [
            {
                url: `${baseUrl}/og-image-v3.jpg?v=5`,
                width: 1200,
                height: 630,
                alt: 'VT - Advanced AI Chat Platform with Generative AI and Deep Learning',
                type: 'image/jpeg',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Advanced AI Chat Platform - Generative AI with Deep Learning',
        description:
            'Experience advanced artificial intelligence with generative AI, deep learning, and natural language processing. Privacy-first AI systems with large language models (LLMs).',
        images: [`${baseUrl}/twitter-image-v3.jpg?v=5`],
        creator: '@vinhnx',
        site: '@vinhnx',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: baseUrl,
    },
    category: 'Technology',
    classification: 'AI Chat Application',
    referrer: 'origin-when-cross-origin',
    verification: {
        // Add your verification codes here when you get them
        // google: "your-google-verification-code",
        // yandex: "your-yandex-verification-code",
        // yahoo: "your-yahoo-verification-code",
    },
};

export const defaultViewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    userScalable: false,
    interactiveWidget: 'resizes-content',
    colorScheme: 'light dark',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
    ],
};
