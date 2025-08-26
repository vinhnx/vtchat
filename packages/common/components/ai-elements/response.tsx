'use client';

import { CodeBlock } from '@repo/common/components';
import { cn } from '@repo/ui';
import remarkGfm from 'remark-gfm';
import { Streamdown } from 'streamdown';
import type { ComponentProps, ReactNode } from 'react';

type ResponseProps = {
    children: string;
    parseIncompleteMarkdown?: boolean;
    className?: string;
    components?: ComponentProps<typeof Streamdown>['components'];
    allowedImagePrefixes?: string[];
    allowedLinkPrefixes?: string[];
    defaultOrigin?: string;
    rehypePlugins?: any[];
    remarkPlugins?: any[];
} & Omit<ComponentProps<'div'>, 'children'>;

// Default component mappings to mirror VTChat styles
const defaultComponents: NonNullable<ComponentProps<typeof Streamdown>['components']> = {
    p: ({ children }) => (
        <div className='markdown-text mb-6 text-base leading-loose'>{children}</div>
    ),
    h1: ({ children }) => (
        <h1 className='border-border markdown-text mb-6 mt-12 border-b pb-2 text-2xl font-bold tracking-tight'>
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className='border-border/60 markdown-text mb-5 mt-10 border-b pb-1 text-xl font-semibold tracking-tight'>
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className='markdown-text mb-4 mt-9 text-lg font-medium'>{children}</h3>
    ),
    h4: ({ children }) => (
        <h4 className='markdown-text mb-4 mt-8 text-base font-medium opacity-90'>{children}</h4>
    ),
    a: ({ href, children }) => (
        <a
            href={href as string}
            className='text-brand font-medium underline decoration-[0.08em] underline-offset-2 transition-colors hover:no-underline'
            target={typeof href === 'string' && href.startsWith('http') ? '_blank' : undefined}
            rel={typeof href === 'string' && href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
            {children}
        </a>
    ),
    ul: ({ children }) => <ul className='my-4 space-y-2 pl-6'>{children}</ul>,
    ol: ({ children }) => <ol className='my-4 list-decimal space-y-2 pl-6'>{children}</ol>,
    li: ({ children }) => (
        <li className='markdown-text my-2 pl-1 text-base leading-relaxed'>{children}</li>
    ),
    blockquote: ({ children }) => (
        <blockquote className='border-border text-muted-foreground bg-secondary/20 my-6 rounded-r-md border-l-4 py-1 pl-4 italic'>
            {children}
        </blockquote>
    ),
    hr: () => <hr className='border-border my-8' />,
    img: ({ src, alt, ...props }) => (
        // @ts-expect-error streamdown/react-markdown image typing
        <img
            src={src as string}
            alt={(alt as string) || 'Image'}
            className='mx-auto my-6 h-auto max-w-full rounded-md shadow-sm'
            loading='lazy'
            {...props}
        />
    ),
    table: ({ children }) => (
        <div className='border-border my-6 overflow-x-auto rounded-lg border'>
            <table className='bg-background w-full border-collapse'>{children}</table>
        </div>
    ),
    th: ({ children }) => (
        <th className='bg-tertiary border-border markdown-text border-b border-r px-4 py-2.5 text-left text-sm font-semibold last:border-r-0'>
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className='border-border markdown-text border-b border-r px-4 py-3 align-top last:border-r-0'>
            {children}
        </td>
    ),
    code: ({ inline, className, children }) => {
        const content = String(children).replace(/<FadeEffect \/>$/, '');
        if (!className && inline) {
            return (
                <code className='bg-muted/70 text-foreground border-border/40 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-sm font-medium shadow-sm'>
                    {content}
                </code>
            );
        }
        const lang = (className || '').replace('language-', '');
        return <CodeBlock code={content} lang={lang} />;
    },
    pre: ({ children }) => (
        <pre className='prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4'>
            {children}
        </pre>
    ),
    strong: ({ children }) => <strong className='markdown-text font-semibold'>{children}</strong>,
    em: ({ children }) => <em className='markdown-text italic'>{children}</em>,
};

export function Response({
    children,
    parseIncompleteMarkdown = true,
    className,
    components,
    allowedImagePrefixes = ['*'],
    allowedLinkPrefixes = ['*'],
    defaultOrigin,
    rehypePlugins,
    remarkPlugins,
    ...rest
}: ResponseProps) {
    return (
        <div
            {...rest}
            className={cn(
                'markdown-content min-w-full',
                // The container gets prose styling from parent in our chat bubble
                className,
            )}
        >
            <Streamdown
                className='min-w-full'
                parseIncompleteMarkdown={parseIncompleteMarkdown}
                // Keep GFM by default; allow override/extension
                remarkPlugins={remarkPlugins ?? [remarkGfm]}
                rehypePlugins={rehypePlugins}
                components={{ ...defaultComponents, ...(components || {}) }}
                allowedImagePrefixes={allowedImagePrefixes}
                allowedLinkPrefixes={allowedLinkPrefixes}
                defaultOrigin={defaultOrigin}
            >
                {children}
            </Streamdown>
        </div>
    );
}

export default Response;

