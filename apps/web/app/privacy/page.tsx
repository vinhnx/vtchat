import { helpRelatedLinks } from '@/lib/constants/ai-links';
import { Footer, MarkdownContent } from '@repo/common/components';
import { privacyPolicy } from '@repo/shared/config';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
    InternalLinks,
} from '@repo/ui';
import type { Metadata } from 'next';

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
    alternates: {
        canonical: 'https://vtchat.io.vn/privacy',
    },
};

export default function PrivacyPage() {
    return (
        <div className='bg-background min-h-screen'>
            {/* Header */}
            <header className='border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm'>
                <div className='mx-auto w-full max-w-7xl px-4 py-4'>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href='/'>Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>

            {/* Main Content */}
            <main className='bg-background w-full px-4 py-12'>
                <div className='mx-auto w-full max-w-4xl px-4 md:px-8 lg:px-12 xl:px-16'>
                    <h1 className='mb-4 text-3xl font-semibold md:text-4xl'>Privacy Policy</h1>
                    <div className='prose prose-neutral dark:prose-invert max-w-none'>
                        <MarkdownContent content={privacyPolicy} />
                    </div>
                    {/* Related Links - Enhanced Internal Linking for SEO */}
                    <InternalLinks
                        links={Array.isArray(helpRelatedLinks)
                            ? helpRelatedLinks.filter(link => link.href !== '/privacy').map(
                                link => ({ href: link.href, label: link.title }),
                            )
                            : []}
                        title='Helpful Resources'
                        className='mt-12'
                    />
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}
