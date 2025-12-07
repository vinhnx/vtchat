import { log } from '@repo/shared/lib/logger';
import { createFromSource } from 'fumadocs-core/search/server';

export async function GET(request: Request) {
    try {
        const { source } = await import('@/lib/source');
        const { GET } = createFromSource(source, {
            // https://docs.orama.com/docs/orama-js/supported-languages
            language: 'english',
        });
        return await GET(request);
    } catch (error) {
        log.error({ error }, 'Search API failed, returning fallback');
        return new Response(
            JSON.stringify({ message: 'Search is temporarily unavailable' }),
            { status: 503 },
        );
    }
}
