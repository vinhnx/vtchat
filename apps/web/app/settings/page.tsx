import { Footer } from '@repo/common/components';
import { Button, TypographyH1 } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth-server';
import { SettingsContent } from './settings-content';

export const metadata: Metadata = {
    title: 'Settings - VT',
    description:
        'Customize your VT experience and manage your account settings, API keys, preferences, and more.',
    openGraph: {
        title: 'Settings - VT',
        description:
            'Customize your VT experience and manage your account settings, API keys, preferences, and more.',
        type: 'website',
    },
    robots: {
        index: false, // Settings pages should not be indexed
        follow: false,
    },
};

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    // Check if user is authenticated
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login?redirect=/settings');
    }
    return (
        <div className='bg-background pb-safe min-h-screen'>
            {/* Header */}
            <header className='border-border/50 bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm'>
                <div className='mx-auto flex w-full max-w-7xl items-center justify-between px-3 py-3 sm:px-4 md:py-4'>
                    <Link href='/'>
                        <Button className='gap-2' size='sm' variant='ghost'>
                            <ArrowLeft size={16} />
                            <span className='hidden sm:inline'>Back to VT</span>
                            <span className='sm:hidden'>Back</span>
                        </Button>
                    </Link>
                    <div className='text-muted-foreground text-sm font-medium'>Settings</div>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background min-h-[calc(100vh-120px)] w-full px-3 py-6 sm:px-4 md:py-12'>
                <div className='mx-auto max-w-7xl'>
                    <div className='mb-6 text-center md:mb-8'>
                        <TypographyH1 className='mb-2 text-2xl font-semibold md:mb-4 md:text-3xl lg:text-4xl'>
                            Settings
                        </TypographyH1>
                        <p className='text-muted-foreground mx-auto max-w-2xl px-2 text-sm leading-relaxed sm:text-base md:text-lg'>
                            Customize your VT experience and manage your account settings
                        </p>
                    </div>
                    <SettingsContent />
                </div>
            </main>

            {/* Footer */}
            <footer className='border-border/50 bg-background mt-8 border-t md:mt-12'>
                <div className='mx-auto w-full max-w-7xl px-4'>
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
