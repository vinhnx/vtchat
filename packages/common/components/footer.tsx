import Link from 'next/link';

const linkGroups = [
    {
        title: 'Product',
        links: [
            { title: 'Home', href: '/' },
            { title: 'VT+', href: '/pricing' },
            { title: 'About', href: '/about' },
        ],
    },
    {
        title: 'Legal',
        links: [
            { title: 'Terms', href: '/terms' },
            { title: 'Privacy', href: '/privacy' },
        ],
    },
    {
        title: 'Support',
        links: [
            { title: 'Help', href: '/help' },
            { title: 'FAQ', href: '/faq' },
            { title: 'Contact', href: 'mailto:hello@vtchat.io.vn' },
            { title: 'Feedback', href: 'https://vtchat.userjot.com' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { title: 'AI Glossary', href: '/ai-glossary' },
            { title: 'AI Resources', href: '/ai-resources' },
            { title: 'X', href: 'https://x.com/vtdotai' },
        ],
    },
];

export const Footer = () => {
    return (
        <footer className='relative z-0 py-6 pb-safe mt-auto bg-transparent border-t border-border/50'>
            <div className='container px-4 md:px-6'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
                    {linkGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className='space-y-3'>
                            <h3 className='text-sm font-medium leading-none text-foreground'>{group.title}</h3>
                            <ul className='space-y-2'>
                                {group.links.map((link, linkIndex) => {
                                    const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                                    return (
                                        <li key={linkIndex}>
                                            {isExternal ? (
                                                <a
                                                    href={link.href}
                                                    target={link.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className='text-sm text-muted-foreground hover:text-primary duration-150 transition-colors'
                                                >
                                                    {link.title}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className='text-sm text-muted-foreground hover:text-primary duration-150 transition-colors'
                                                >
                                                    {link.title}
                                                </Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className='mt-8 pt-4 border-t border-border/50 text-center'>
                    <p className='text-xs text-muted-foreground'>
                        © {new Date().getFullYear()} VT. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
