import { CitationProviderContext, CodeBlock, LinkPreviewPopover } from '@repo/common/components';
import { isValidUrl } from '@repo/shared/utils';
import type { MDXRemote } from 'next-mdx-remote/rsc';
import { type ComponentProps, type ReactElement, useContext } from 'react';
import { TableErrorBoundary } from '../thread/components/table-error-boundary';

export const mdxComponents: ComponentProps<typeof MDXRemote>['components'] = {
    Source: ({ children }) => {
        const { getSourceByIndex } = useContext(CitationProviderContext);
        const index = children as string;

        const numericIndex = Number.parseInt(index);

        // Early return for invalid index
        if (Number.isNaN(numericIndex)) {
            return null;
        }

        const source = getSourceByIndex(numericIndex);

        // Early return if no source found
        if (!source?.link) {
            return null;
        }

        const isValid = isValidUrl(source.link);

        // Early return for invalid URL
        if (!isValid) {
            return null;
        }

        return (
            <LinkPreviewPopover source={source}>
                <span className='from-brand/15 to-brand/5 text-brand border-brand/30 hover:from-brand hover:to-brand hover:border-brand hover:shadow-brand/25 group mx-1 inline-flex size-6 flex-row items-center justify-center gap-1 rounded-lg border bg-gradient-to-br text-xs font-bold transition-all duration-300 hover:scale-105 hover:text-white hover:shadow-lg'>
                    {source.index}
                </span>
            </LinkPreviewPopover>
        );
    },
    p: ({ children }) => {
        return <div className='markdown-text mb-6 text-base leading-loose'>{children}</div>;
    },
    h1: ({ children }) => {
        return (
            <h1 className='border-border markdown-text mb-6 mt-12 border-b pb-2 text-2xl font-bold tracking-tight'>
                {children}
            </h1>
        );
    },
    h2: ({ children }) => {
        return (
            <h2 className='border-border/60 markdown-text mb-5 mt-10 border-b pb-1 text-xl font-semibold tracking-tight'>
                {children}
            </h2>
        );
    },
    h3: ({ children }) => {
        return <h3 className='markdown-text mb-4 mt-9 text-lg font-medium'>{children}</h3>;
    },
    h4: ({ children }) => {
        return (
            <h4 className='markdown-text mb-4 mt-8 text-base font-medium opacity-90'>{children}</h4>
        );
    },
    a: ({ href, children }) => {
        return (
            <a
                href={href}
                className='text-brand font-medium underline decoration-[0.08em] underline-offset-2 transition-colors hover:no-underline'
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {children}
            </a>
        );
    },
    ul: ({ children }) => {
        return <ul className='my-4 space-y-2 pl-6'>{children}</ul>;
    },
    ol: ({ children }) => {
        return <ol className='my-4 list-decimal space-y-2 pl-6'>{children}</ol>;
    },
    li: ({ children }) => {
        return <li className='markdown-text my-2 pl-1 text-base leading-relaxed'>{children}</li>;
    },
    blockquote: ({ children }) => {
        return (
            <blockquote className='border-border text-muted-foreground bg-secondary/20 my-6 rounded-r-md border-l-4 py-1 pl-4 italic'>
                {children}
            </blockquote>
        );
    },
    hr: () => {
        return <hr className='border-border my-8' />;
    },
    img: ({ src, alt, ...props }) => {
        return (
            <img
                src={src}
                alt={alt || 'Image'}
                className='mx-auto my-6 h-auto max-w-full rounded-md shadow-sm'
                loading='lazy'
                {...props}
            />
        );
    },
    table: ({ children }) => {
        return (
            <TableErrorBoundary
                onError={(_error) => {
                    // Silent error handling for table rendering issues
                }}
                fallback={
                    <div className='border-warning bg-warning/10 text-warning my-4 rounded-md border p-4'>
                        <div className='text-sm font-medium'>Table Rendering Issue</div>
                        <div className='mt-1 text-xs opacity-80'>
                            This table couldn't be rendered properly. Content continues below.
                        </div>
                    </div>
                }
            >
                <div className='border-border my-6 overflow-x-auto rounded-lg border'>
                    <table className='bg-background w-full border-collapse'>{children}</table>
                </div>
            </TableErrorBoundary>
        );
    },
    th: ({ children }) => {
        return (
            <th className='bg-tertiary border-border markdown-text border-b border-r px-4 py-2.5 text-left text-sm font-semibold last:border-r-0'>
                {children}
            </th>
        );
    },
    td: ({ children }) => {
        return (
            <td className='border-border markdown-text border-b border-r px-4 py-3 align-top last:border-r-0'>
                {children}
            </td>
        );
    },
    pre: ({ children }) => {
        if (typeof children === 'string') {
            return <CodeBlock code={children.replace(/<FadeEffect \/>$/, '')} />;
        }
        const codeElement = children as ReactElement<any>;
        const className = codeElement?.props?.className || '';
        const lang = className.replace('language-', '');
        const code = codeElement?.props?.children;

        return <CodeBlock code={String(code).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
    },
    code: ({ children, className }) => {
        if (!className) {
            return (
                <code className='bg-muted/70 text-foreground border-border/40 whitespace-nowrap rounded-md border px-2 py-1 font-mono text-sm font-medium shadow-sm'>
                    {children}
                </code>
            );
        }
        const lang = className.replace('language-', '');
        return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, '')} lang={lang} />;
    },
    strong: ({ children }) => {
        return <strong className='markdown-text font-semibold'>{children}</strong>;
    },
    em: ({ children }) => {
        return <em className='markdown-text italic'>{children}</em>;
    },
};
