import { TypographySmall } from '@repo/ui';
import Link from 'next/link';
import { AIDisclaimer } from './ai-disclaimer';
import Image from 'next/image';

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
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 mb-2">
                    <Link
                        href="https://startupfa.me/s/vt-chat?utm_source=vtchat.io.vn"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="https://startupfa.me/badges/featured-badge.webp"
                            alt="Featured on Startup Fame"
                            width={128}
                            height={40}
                            unoptimized
                            className="transition-opacity hover:opacity-80 sm:w-44 sm:h-14"
                        />
                    </Link>
                    <Link
                        href="https://magicbox.tools"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Image
                            src="https://magicbox.tools/badge.svg"
                            alt="Featured on MagicBox.tools"
                            width={128}
                            height={40}
                            unoptimized
                            className="transition-opacity hover:opacity-80 sm:w-44 sm:h-14"
                        />
                    </Link>
                </div>
            )}
            <AIDisclaimer className="mb-2" />
            <TypographySmall className="text-muted-foreground text-xs">
                © 2025 VT. All rights reserved.
            </TypographySmall>
        </div>
    );
};
