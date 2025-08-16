import ClientHome from './client-home';

// This page needs dynamic rendering due to real-time chat functionality
export const dynamic = 'force-dynamic';
export async function generateMetadata() {
    return {
        title: 'VT - Advanced AI Chat Platform',
        description:
            'Experience next-generation AI conversations with VT. Powered by state-of-the-art language models with reasoning, web search, and advanced tool capabilities.',
        openGraph: {
            title: 'VT - Advanced AI Chat Platform',
            description:
                'Experience next-generation AI conversations with VT. Powered by state-of-the-art language models with reasoning, web search, and advanced tool capabilities.',
            url: '/',
        },
    };
}

export default function HomePage() {
    // Render a server component that mounts a client component for interactive parts
    return <ClientHome />;
}
