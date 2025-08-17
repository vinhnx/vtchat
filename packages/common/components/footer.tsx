import Link from 'next/link';

const links = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Documentation',
        href: '/docs',
    },
    {
        title: 'Terms',
        href: '/terms',
    },
    {
        title: 'Privacy',
        href: '/privacy',
    },
    {
        title: 'VT+',
        href: '/pricing',
    },
    {
        title: 'Hello',
        href: 'mailto:hello@vtdotai.io.vn',
    },
    {
        title: 'Help',
        href: '/help',
    },
    {
        title: 'Feedback',
        href: 'https://vtchat.userjot.com',
    },
    {
        title: 'About',
        href: '/about',
    },
    {
        title: 'FAQ',
        href: '/faq',
    },
    {
        title: 'AI Glossary',
        href: '/ai-glossary',
    },
    {
        title: 'AI Resources',
        href: '/ai-resources',
    },
    {
        title: 'X',
        href: 'https://x.com/vtdotai',
    },
];

export const Footer = () => {
    return (
        <footer className='relative z-0 py-2 pb-safe sm:py-3 md:py-4 mt-auto bg-transparent'>
            {/* Mobile-first responsive design with reduced spacing */}
            <div className='flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3 sm:text-sm md:gap-4 md:text-sm px-3 sm:px-4 md:px-6'>
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className='text-muted-foreground hover:text-primary duration-150 transition-colors'
                    >
                        <span>{link.title}</span>
                    </Link>
                ))}
            </div>
            
            {/* Copyright with reduced spacing and mobile optimization */}
            <div className='text-muted-foreground mt-1 text-center text-xs sm:mt-2 sm:text-xs md:mt-3 md:text-sm px-3 sm:px-4 md:px-6'>
                © {new Date().getFullYear()} VT, All rights reserved
            </div>
        </footer>
    );
};
