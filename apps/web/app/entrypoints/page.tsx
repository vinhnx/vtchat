'use client';

import { PublicRoutes } from '@repo/shared/constants/routes';
import { TypographyH3, TypographyP } from '@repo/ui';
import Link from 'next/link';

enum EntryPointsText {
    TITLE = 'Entrypoints',
    DESCRIPTION = 'Quick access to core areas of the app',
}

enum EntryPointLabel {
    CHAT = 'Chat',
    RECENT = 'Recent Chats',
    HELP = 'Help Center',
    ABOUT = 'About',
}

const entryPointLinks = [
    { href: PublicRoutes.HOME, label: EntryPointLabel.CHAT },
    { href: PublicRoutes.RECENT, label: EntryPointLabel.RECENT },
    { href: PublicRoutes.HELP, label: EntryPointLabel.HELP },
    { href: PublicRoutes.ABOUT, label: EntryPointLabel.ABOUT },
];

export default function EntryPointsPage() {
    return (
        <div className='mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-16'>
            <TypographyH3 className='font-clash text-brand tracking-wide'>
                {EntryPointsText.TITLE}
            </TypographyH3>
            <TypographyP>{EntryPointsText.DESCRIPTION}</TypographyP>
            <ul className='mt-2 flex flex-col gap-2'>
                {entryPointLinks.map((link) => (
                    <li key={link.href}>
                        <Link className='text-primary underline' href={link.href}>
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
