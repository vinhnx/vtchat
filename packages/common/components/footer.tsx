import { TypographySmall } from '@repo/ui';
import Link from 'next/link';
import { AIDisclaimer } from './ai-disclaimer';

export const Footer = () => {
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
                {links.map((link) => (
                    <Link
                        className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                        href={link.href}
                        key={link.href}
                    >
                        {link.label}
                    </Link>
                ))}
            </div>

            <AIDisclaimer className="mb-2" />
            <TypographySmall className="text-muted-foreground text-xs">
                © 2025 VT. All rights reserved.
            </TypographySmall>
        </div>
    );
};
