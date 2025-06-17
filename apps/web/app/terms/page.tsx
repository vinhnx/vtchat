import { Footer, MarkdownContent } from '@repo/common/components';
import { termsMdx } from '@repo/shared/config';
import { Button } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Terms of Service | VT',
    description:
        'Terms of Service for VT - your privacy-focused AI chat platform. Learn about our service terms, user responsibilities, and platform policies.',
    openGraph: {
        title: 'Terms of Service | VT',
        description: 'Terms of Service for VT - your privacy-focused AI chat platform.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function TermsPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border/50 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex max-w-screen-lg items-center justify-between px-4 py-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">Terms of Service</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-screen-lg px-4 py-12">
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <MarkdownContent content={termsMdx} />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-border/50 bg-muted/20 border-t">
                <div className="mx-auto max-w-screen-lg">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
