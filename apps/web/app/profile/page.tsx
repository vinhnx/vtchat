import { Footer } from '@repo/common/components';
import { Button, TypographyH1 } from '@repo/ui';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '../../lib/auth-server';

export const metadata = {
    title: 'Profile - VT',
    description: 'View your VT profile details and quick account actions.',
    openGraph: {
        title: 'Profile - VT',
        description: 'View your VT profile details and quick account actions.',
        type: 'website',
    },
    robots: {
        index: false,
        follow: false,
    },
};

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect('/login?redirect=/profile');
    }

    const user = session.user;
    const displayName = user.name || user.email || 'User';
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    const createdLabel = createdAt ? createdAt.toLocaleString() : 'Unknown';

    return (
        <div className='bg-background pb-safe min-h-screen'>
            <header className='border-border/50 bg-background/95 sticky top-0 z-50 border-b backdrop-blur-sm'>
                <div className='mx-auto flex w-full max-w-6xl items-center justify-between px-3 py-3 sm:px-4 md:py-4'>
                    <Link href='/'>
                        <Button className='gap-2' size='sm' variant='ghost'>
                            Back to VT
                        </Button>
                    </Link>
                    <div className='text-muted-foreground text-sm font-medium'>Profile</div>
                </div>
            </header>

            <main className='bg-background min-h-[calc(100vh-120px)] w-full px-3 py-6 sm:px-4 md:py-12'>
                <div className='mx-auto max-w-4xl space-y-6'>
                    <div className='text-center'>
                        <TypographyH1 className='mb-2 text-2xl font-semibold md:text-3xl'>
                            Profile
                        </TypographyH1>
                        <p className='text-muted-foreground mx-auto max-w-xl text-sm leading-relaxed sm:text-base'>
                            Keep your VT account details in one place and jump to settings when
                            needed.
                        </p>
                    </div>

                    <div className='rounded-lg border bg-card p-6 shadow-sm'>
                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                            <div>
                                <div className='text-foreground text-xl font-semibold'>
                                    {displayName}
                                </div>
                                <div className='text-muted-foreground text-sm'>
                                    {user.email || 'No email on file'}
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                <Link href='/settings'>
                                    <Button size='sm' variant='outline'>
                                        Settings
                                    </Button>
                                </Link>
                                <Link href='/'>
                                    <Button size='sm'>Back to chat</Button>
                                </Link>
                            </div>
                        </div>

                        <div className='mt-6 grid gap-4 md:grid-cols-2'>
                            <div className='rounded-md border bg-background p-4'>
                                <div className='text-sm font-medium text-foreground'>User ID</div>
                                <div className='text-muted-foreground break-all text-sm'>
                                    {user.id}
                                </div>
                            </div>
                            <div className='rounded-md border bg-background p-4'>
                                <div className='text-sm font-medium text-foreground'>
                                    Account created
                                </div>
                                <div className='text-muted-foreground text-sm'>{createdLabel}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
