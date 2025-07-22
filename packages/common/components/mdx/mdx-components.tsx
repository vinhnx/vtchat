import { CitationProviderContext, CodeBlock, LinkPreviewPopover } from "@repo/common/components";
import { isValidUrl } from "@repo/shared/utils";
import type { MDXRemote } from "next-mdx-remote/rsc";
import { type ComponentProps, type ReactElement, useContext } from "react";

export const mdxComponents: ComponentProps<typeof MDXRemote>["components"] = {
    Source: ({ children }) => {
        const { getSourceByIndex } = useContext(CitationProviderContext);
        const index = children as string;

        const source = getSourceByIndex(Number.parseInt(index));

        const url = source?.link;

        if (!url) {
            return null;
        }

        const isValid = isValidUrl(url);

        if (!isValid) {
            return null;
        }

        return (
            <LinkPreviewPopover source={source}>
                <span className="bg-quaternary text-quaternary-foreground/50 hover:bg-brand group mx-0.5 inline-flex size-3.5 flex-row items-center justify-center gap-1 rounded-sm text-[10px] font-medium hover:text-white">
                    {source?.index}
                </span>
            </LinkPreviewPopover>
        );
    },
    p: ({ children }) => {
        return <div className="mb-5 leading-relaxed markdown-text">{children}</div>;
    },
    h1: ({ children }) => {
        return <h1 className="text-2xl font-bold border-b border-border pb-2 mb-6 mt-8 markdown-text">{children}</h1>;
    },
    h2: ({ children }) => {
        return <h2 className="text-xl font-semibold border-b border-border/60 pb-1 mb-4 mt-7 markdown-text">{children}</h2>;
    },
    h3: ({ children }) => {
        return <h3 className="text-lg font-medium mb-3 mt-6 markdown-text">{children}</h3>;
    },
    h4: ({ children }) => {
        return <h4 className="text-base font-medium opacity-90 mb-3 mt-5 markdown-text">{children}</h4>;
    },
    a: ({ href, children }) => {
        return (
            <a 
                href={href} 
                className="text-brand underline underline-offset-2 hover:no-underline transition-colors" 
                target={href?.startsWith('http') ? "_blank" : undefined}
                rel={href?.startsWith('http') ? "noopener noreferrer" : undefined}
            >
                {children}
            </a>
        );
    },
    ul: ({ children }) => {
        return <ul className="pl-6 my-4 space-y-2">{children}</ul>;
    },
    ol: ({ children }) => {
        return <ol className="pl-6 my-4 space-y-2 list-decimal">{children}</ol>;
    },
    li: ({ children }) => {
        return <li className="my-2 leading-relaxed markdown-text">{children}</li>;
    },
    blockquote: ({ children }) => {
        return <blockquote className="border-l-4 border-border pl-4 italic my-6 text-muted-foreground">{children}</blockquote>;
    },
    hr: () => {
        return <hr className="my-8 border-border" />;
    },
    img: ({ src, alt, ...props }) => {
        return (
            <img 
                src={src} 
                alt={alt || "Image"} 
                className="rounded-md my-6 max-w-full h-auto" 
                loading="lazy"
                {...props}
            />
        );
    },
    table: ({ children }) => {
        return (
            <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse border border-border rounded-lg bg-background">
                    {children}
                </table>
            </div>
        );
    },
    th: ({ children }) => {
        return <th className="text-sm font-semibold bg-tertiary px-4 py-2.5 border border-border markdown-text">{children}</th>;
    },
    td: ({ children }) => {
        return <td className="px-4 py-3 border border-border markdown-text">{children}</td>;
    },
    pre: ({ children }) => {
        if (typeof children === "string") {
            return <CodeBlock code={children.replace(/<FadeEffect \/>$/, "")} />;
        }
        const codeElement = children as ReactElement<any>;
        const className = codeElement?.props?.className || "";
        const lang = className.replace("language-", "");
        const code = codeElement?.props?.children;

        return <CodeBlock code={String(code).replace(/<FadeEffect \/>$/, "")} lang={lang} />;
    },
    code: ({ children, className }) => {
        if (!className) {
            return (
                <code className="font-mono text-sm bg-secondary border-border border rounded-md px-1.5 py-0.5">
                    {children}
                </code>
            );
        }
        const lang = className.replace("language-", "");
        return <CodeBlock code={String(children).replace(/<FadeEffect \/>$/, "")} lang={lang} />;
    },
    strong: ({ children }) => {
        return <strong className="font-semibold markdown-text">{children}</strong>;
    },
    em: ({ children }) => {
        return <em className="italic markdown-text">{children}</em>;
    },
};
