import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'VT - Advanced AI Chat Platform with Generative AI & Deep Learning',
        short_name: 'VT AI',
        description:
            'Advanced AI chat platform with generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first artificial intelligence for everyone.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: 'hsl(60 20% 99%)',
        theme_color: 'hsl(60 1% 10%)',
        categories: ['productivity', 'utilities', 'AI', 'chat'],
        lang: 'en',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-mask.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        screenshots: [
            {
                src: '/og-image-v3.jpg',
                sizes: '1200x630',
                type: 'image/jpeg',
                form_factor: 'wide',
                label: 'VT Chat Interface',
            },
        ],
        shortcuts: [
            {
                name: 'New Chat',
                short_name: 'New Chat',
                description: 'Start a new conversation',
                url: '/chat',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                    },
                ],
            },
            {
                name: 'Settings',
                short_name: 'Settings',
                description: 'Open app settings',
                url: '/settings',
                icons: [
                    {
                        src: '/icon-192.png',
                        sizes: '192x192',
                    },
                ],
            },
        ],
        prefer_related_applications: false,
    };
}
