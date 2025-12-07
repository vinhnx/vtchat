import { getMDXComponents } from '@/mdx-components';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';

export default async function Page(props: {
    params: Promise<{ slug?: string[]; }>;
}) {
    const params = await props.params;
    try {
        const { source } = await import('@/lib/source');
        const page = source.getPage(params.slug);
        if (!page) notFound();

        const MDX = page.data.body;

        return (
            <DocsPage toc={page.data.toc} full={page.data.full}>
                <DocsTitle>{page.data.title}</DocsTitle>
                <DocsDescription>{page.data.description}</DocsDescription>
                <DocsBody>
                    <MDX components={getMDXComponents()} />
                </DocsBody>
            </DocsPage>
        );
    } catch (error) {
        // If docs source cannot be loaded, return 404 to unblock build
        return notFound();
    }
}

export async function generateStaticParams() {
    try {
        const { source } = await import('@/lib/source');
        return source.generateParams();
    } catch {
        return [];
    }
}

export async function generateMetadata(props: {
    params: Promise<{ slug?: string[]; }>;
}) {
    const params = await props.params;
    try {
        const { source } = await import('@/lib/source');
        const page = source.getPage(params.slug);
        if (!page) notFound();

        return {
            title: page.data.title,
            description: page.data.description,
        };
    } catch {
        return {
            title: 'Docs',
            description: 'Documentation is unavailable.',
        };
    }
}
