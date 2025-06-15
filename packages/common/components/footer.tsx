import Link from 'next/link';
import { TypographySmall } from '@repo/ui';

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
    ];

    return (
        <div className="flex w-full flex-col items-center justify-center gap-4 p-6">
            <div className="flex flex-row items-center gap-6">
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
            <TypographySmall className="text-muted-foreground text-xs">© 2025 VT. All rights reserved.</TypographySmall>
        </div>
    );
};
