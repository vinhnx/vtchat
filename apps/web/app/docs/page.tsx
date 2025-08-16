import { mdxComponents } from '@repo/common/components';
import { DocsPath } from '@repo/common/constants/docs';
import { log } from '@repo/shared/lib/logger';
import { DocsBody, DocsDescription, DocsPage as FumaDocsPage, DocsTitle } from 'fumadocs-ui/page';
import type { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import fs from 'node:fs/promises';
import path from 'node:path';

export const metadata: Metadata = {
    title: 'VT Documentation',
    description: 'Project overview and guides',
};

async function loadDocs(): Promise<string> {
    const filePath = path.join(process.cwd(), '..', '..', DocsPath.Base, DocsPath.IndexFile);
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (error) {
        log.error({ error }, 'failed to load docs file');
        return '';
    }
}

export async function DocsPage() {
    const source = await loadDocs();
    return (
        <FumaDocsPage>
            <DocsTitle>VT Documentation</DocsTitle>
            <DocsDescription>Project overview and guides</DocsDescription>
            <DocsBody>
                <MDXRemote source={source} components={mdxComponents} />
            </DocsBody>
        </FumaDocsPage>
    );
}

export default DocsPage;
