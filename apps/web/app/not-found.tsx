'use client';

import { Footer } from '@repo/common/components';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button } from '@repo/ui';
import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
    const { isPending } = useSession();
    return (
        <div className="flex min-h-dvh flex-col">
            <main className="flex flex-1 items-center justify-center px-4">
                <div className="w-full max-w-md text-center">
                    <div className="mb-8">
                        <h1 className="text-foreground mb-2 text-4xl font-bold">404</h1>
                        <h2 className="text-foreground mb-3 text-xl font-medium">Page Not Found</h2>
                        <p className="text-muted-foreground text-sm">
                            Sorry, we couldn't find the page you're looking for.
                        </p>
                    </div>
                    <Link href="/">
                        <Button size="sm" variant="default">
                            Go back home
                        </Button>
                    </Link>
                </div>
            </main>

            {/* Footer */}
            {!isPending && (
                <footer className="border-border/50 bg-background/50 border-t">
                    <div className="mx-auto max-w-7xl">
                        <Footer />
                    </div>
                </footer>
            )}
        </div>
    );
}
