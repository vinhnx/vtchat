import { Footer, MarkdownContent } from '@repo/common/components';
import { privacyPolicy } from '@repo/shared/config';
import { Button } from '@repo/ui';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Privacy Policy | VT',
    description:
        'Privacy Policy for VT - learn how we protect your data, handle privacy, and maintain transparency in our privacy-focused AI chat platform.',
    openGraph: {
        title: 'Privacy Policy | VT',
        description:
            'Privacy Policy for VT - learn how we protect your data and maintain transparency.',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function PrivacyPage() {
    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex w-full items-center justify-between px-4 py-4 max-w-7xl">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">Privacy Policy</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto w-[60%] px-12 md:px-20 lg:px-24 xl:px-32">
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                        <MarkdownContent content={privacyPolicy} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto w-full max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
