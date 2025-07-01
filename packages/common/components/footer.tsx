import { TypographySmall } from '@repo/ui';
import Link from 'next/link';
import { AIDisclaimer } from './ai-disclaimer';

interface FooterProps {
    showBadge?: boolean;
}

export const Footer = ({ showBadge = false }: FooterProps) => {
    const links = [
        {
            href: '/terms',
            label: 'Terms of Service',
        },
        {
            href: '/privacy',
            label: 'Privacy Policy',
        },
        {
            href: '/faq',
            label: 'Help Center',
        },
        {
            href: 'mailto:hello@vtchat.io.vn',
            label: 'Support',
        },
    ];

    return (
        <div className="flex w-full flex-col items-center justify-center gap-4 p-6">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
                {links.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                        {link.label}
                    </Link>
                ))}
            </div>
            {showBadge && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-2">
                    <a
                        href="https://startupfa.me/s/vt-chat?utm_source=vtchat.io.vn"
                        target="_blank"
                    >
                        <img
                            src="https://startupfa.me/badges/featured-badge.webp"
                            alt="Featured on Startup Fame"
                            width="128"
                            height="40"
                            className="w-24 h-8 sm:w-32 sm:h-10"
                        />
                    </a>
                    <a href="https://magicbox.tools" target="_blank">
                        <img
                            src="https://magicbox.tools/badge.svg"
                            alt="Featured on MagicBox.tools"
                            width="150"
                            height="40"
                            className="w-28 h-8 sm:w-36 sm:h-10"
                        />
                    </a>
                    <a
                        href="https://www.producthunt.com/products/vt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-vt"
                        target="_blank"
                    >
                        <img
                            src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=986116&theme=neutral&t=1751345063856"
                            alt="VT - AI chat in browser with your own API keys | Product Hunt"
                            width="180"
                            height="40"
                            className="w-32 h-8 sm:w-44 sm:h-10"
                        />
                    </a>
                </div>
            )}
            <AIDisclaimer className="mb-2" />
            <TypographySmall className="text-muted-foreground text-xs">
                © 2025 VT. All rights reserved.
            </TypographySmall>
        </div>
    );
};
