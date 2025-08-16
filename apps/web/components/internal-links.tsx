'use client';

import Link from 'next/link';

interface InternalLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export function InternalLink({ href, children, className = '', title }: InternalLinkProps) {
    return (
        <Link 
            href={href} 
            className={`text-primary hover:text-primary/80 underline transition-colors ${className}`}
            title={title}
        >
            {children}
        </Link>
    );
}

interface RelatedLinksProps {
    links: Array<{
        href: string;
        title: string;
        description?: string;
    }>;
    title?: string;
    className?: string;
}

export function RelatedLinks({ links, title = 'Related Pages', className = '' }: RelatedLinksProps) {
    if (links.length === 0) return null;

    return (
        <aside className={`mt-8 rounded-lg border bg-muted/50 p-6 ${className}`}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">{title}</h3>
            <ul className="space-y-3">
                {links.map((link, index) => (
                    <li key={index}>
                        <Link
                            href={link.href}
                            className="block hover:bg-muted/80 rounded p-2 transition-colors"
                            title={`Learn more about ${link.title}`}
                        >
                            <div className="font-medium text-primary hover:text-primary/80">
                                {link.title}
                            </div>
                            {link.description && (
                                <div className="text-sm text-muted-foreground mt-1">
                                    {link.description}
                                </div>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

// Common related links for AI pages
export const aiRelatedLinks = [
    {
        href: '/about',
        title: 'About VT AI Platform',
        description: 'Learn about our advanced artificial intelligence features and privacy-first approach'
    },
    {
        href: '/pricing',
        title: 'AI Platform Pricing',
        description: 'Discover our free AI models and premium VT+ research tools'
    },
    {
        href: '/ai-resources',
        title: 'AI Learning Resources',
        description: 'Comprehensive guides on artificial intelligence, machine learning, and deep learning'
    },
    {
        href: '/ai-glossary',
        title: 'AI Terms Glossary',
        description: 'Definitions of key artificial intelligence and machine learning terms'
    }
];

// Common related links for help pages
export const helpRelatedLinks = [
    {
        href: '/help',
        title: 'Help Center',
        description: 'Get help with using VT AI platform features and tools'
    },
    {
        href: '/faq',
        title: 'Frequently Asked Questions',
        description: 'Common questions about AI features, pricing, and technical support'
    },
    {
        href: '/about',
        title: 'Platform Overview',
        description: 'Learn about VT\'s AI capabilities and technical architecture'
    }
];