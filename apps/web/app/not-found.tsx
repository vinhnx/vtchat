import { Button } from '@repo/ui';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <main className="bg-background flex min-h-screen items-center justify-center">
            <div className="bg-card mx-auto w-full max-w-md rounded-xl border p-8 text-center shadow">
                <div className="bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <AlertTriangle className="text-destructive" size={32} />
                </div>
                <h2 className="text-foreground text-2xl font-semibold">Page Not Found</h2>
                <p className="text-muted-foreground mt-2 text-base">
                    Sorry, we couldn’t find the page you’re looking for.
                </p>
                <div className="mt-6 flex justify-center">
                    <Link href="/chat">
                        <Button size="sm" variant="outline">
                            Go back home
                        </Button>
                    </Link>
                </div>
            </div>
        </main>
    );
}
