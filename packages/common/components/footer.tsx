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

const mobileLinks = [
    { title: 'Home', href: '/' },
    { title: 'VT+', href: '/pricing' },
    { title: 'Help', href: '/help' },
    { title: 'Contact', href: 'mailto:hello@vtchat.io.vn' },
    { title: 'Terms', href: '/terms' },
    { title: 'Privacy', href: '/privacy' },
];

export const Footer = () => {
    return (
        <footer className='relative z-0 py-4 pb-safe mt-auto bg-transparent border-t border-border/50'>
            {/* Mobile view - minimal layout */}
            <div className='container px-4 md:hidden'>
                <div className='flex flex-wrap justify-center gap-3'>
                    {mobileLinks.map((link, index) => {
                        const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                        const shouldOpenInNewTab = link.href.startsWith('http') || link.href.startsWith('mailto');
                        return (
                            <div key={index} className='inline-block'>
                                {isExternal ? (
                                    <a
                                        href={link.href}
                                        target={shouldOpenInNewTab ? '_blank' : undefined}
                                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                        className='text-xs text-muted-foreground hover:text-primary duration-150 transition-colors'
                                    >
                                        {link.title}
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className='text-xs text-muted-foreground hover:text-primary duration-150 transition-colors'
                                    >
                                        {link.title}
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className='mt-4 pt-3 border-t border-border/50 text-center'>
                    <p className='text-xs text-muted-foreground'>
                        © {new Date().getFullYear()} VT. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Desktop view - full layout */}
            <div className='container px-4 max-md:hidden'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    {linkGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className='space-y-2'>
                            <h3 className='text-sm font-medium leading-none text-foreground'>{group.title}</h3>
                            <ul className='space-y-1.5'>
                                {group.links.map((link, linkIndex) => {
                                    const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                                    const shouldOpenInNewTab = link.href.startsWith('http') || link.href.startsWith('mailto');
                                    return (
                                        <li key={linkIndex}>
                                            {isExternal ? (
                                                <a
                                                    href={link.href}
                                                    target={shouldOpenInNewTab ? '_blank' : undefined}
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
                <div className='mt-6 pt-4 border-t border-border/50 text-center'>
                    <p className='text-xs text-muted-foreground'>
                        © {new Date().getFullYear()} VT. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
