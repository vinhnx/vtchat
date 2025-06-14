import { Button } from '@repo/ui';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <main className="bg-background grid min-h-screen place-items-center px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
                <p className="text-brand text-base font-semibold">404</p>
                <h1 className="text-foreground mt-4 text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
                    Page not found
                </h1>
                <p className="text-muted-foreground mt-6 text-pretty text-lg font-medium sm:text-xl/8">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <Link href="/chat">
                        <Button size="sm" className="flex items-center gap-2">
                            <IconHome size={16} />
                            Go back home
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
