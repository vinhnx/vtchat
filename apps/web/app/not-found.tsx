import { Button } from '@repo/ui';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@repo/common/components';

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
    return (
        <main className="bg-background flex min-h-dvh items-center justify-center px-4">
            <div className="bg-card mx-auto w-full max-w-md rounded-xl border p-6 text-center shadow md:p-8">
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
            
            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </main>
    );
}
