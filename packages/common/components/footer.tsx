import Link from 'next/link';

// Essential footer items for all public pages
const links = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'About',
        href: '/about',
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
        title: 'Help',
        href: '/help',
    },
    {
        title: 'FAQ',
        href: '/faq',
    },
    {
        title: 'VT+',
        href: '/pricing',
    },
    {
        title: 'Contact',
        href: 'mailto:hello@vtchat.io.vn',
    },
];

export const Footer = () => {
    return (
        <footer className='relative z-0 py-2 pb-safe sm:py-3 md:py-4 mt-auto bg-transparent'>
            <div className='mx-auto max-w-5xl px-3 sm:px-4 md:px-6'>
                {/* Mobile-first responsive design with reduced spacing */}
                <div className='flex flex-wrap items-center justify-center gap-2 text-xs sm:gap-3 sm:text-sm md:gap-4 md:text-sm'>
                    {links.map((link, index) => {
                        const isExternal = link.href.startsWith('http') || link.href.startsWith('mailto');
                        const shouldOpenInNewTab = link.href.startsWith('http') || link.href.startsWith('mailto');
                        return isExternal ? (
                            <a
                                key={index}
                                href={link.href}
                                target={shouldOpenInNewTab ? '_blank' : undefined}
                                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                className='text-muted-foreground hover:text-primary duration-150 transition-colors'
                            >
                                <span>{link.title}</span>
                            </a>
                        ) : (
                            <Link
                                key={index}
                                href={link.href}
                                className='text-muted-foreground hover:text-primary duration-150 transition-colors'
                            >
                                <span>{link.title}</span>
                            </Link>
                        );
                    })}
                </div>
                
                {/* Copyright with reduced spacing and mobile optimization */}
                <div className='text-muted-foreground mt-1 text-center text-xs sm:mt-2 sm:text-xs md:mt-3 md:text-sm'>
                    © {new Date().getFullYear()} VT, All rights reserved
                </div>
            </div>
            
            {/* Mobile viewport spacing adjustment for chat input overlap prevention */}
            <div className='h-2 sm:h-3 md:h-4' />
        </footer>
    );
};
