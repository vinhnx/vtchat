"use client";

import { ErrorBoundary, ErrorPlaceholder, mdxComponents } from "@repo/common/components";
import { log } from "@repo/shared/logger";
import { cn } from "@repo/ui";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
import { serialize } from "next-mdx-remote/serialize";
import { useTheme } from "next-themes";
import { memo, Suspense, useEffect, useRef, useState } from "react";
import remarkGfm from "remark-gfm";
import "./markdown-content.css";

export const markdownStyles = {
    // Base prose styling with animation and theme support
    "animate-fade-in prose prose-base min-w-full dark:prose-invert": true,

    // Improved spacing and layout
    "prose-p:mb-5 prose-p:leading-loose prose-p:text-base": true,
    "prose-headings:mb-4 prose-headings:mt-6 prose-headings:font-semibold prose-headings:tracking-tight": true,

    // Heading hierarchy with improved typography
    "prose-h1:text-2xl prose-h1:font-bold prose-h1:border-b prose-h1:border-border prose-h1:pb-2 prose-h1:mb-6": true,
    "prose-h2:text-xl prose-h2:font-semibold prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-1": true,
    "prose-h3:text-lg prose-h3:font-medium": true,
    "prose-h4:text-base prose-h4:font-medium prose-h4:opacity-90": true,

    // List styling with improved spacing
    "prose-ul:pl-6 prose-ul:my-4 prose-ol:pl-6 prose-ol:my-4": true,
    "prose-li:my-2 prose-li:leading-loose prose-li:text-base prose-li:pl-1": true,

    // Blockquote styling with improved visual design
    "prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:italic prose-blockquote:my-6 prose-blockquote:bg-secondary/20 prose-blockquote:rounded-r-md": true,

    // Code styling with improved readability
    "prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-code:whitespace-nowrap": true,
    "prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5": true,

    // Pre (code block) styling with improved visual design
    "prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-4": true,

    // Table styling with improved structure and readability
    "prose-table:w-full prose-table:my-6 prose-table:border-collapse prose-table:bg-background": true,
    "prose-th:text-sm prose-th:font-semibold prose-th:bg-tertiary prose-th:px-4 prose-th:py-2.5 prose-th:border-b prose-th:border-r prose-th:last:border-r-0 prose-th:border-border prose-th:text-left": true,
    "prose-tr:border-b prose-tr:border-border": true,
    "prose-td:px-4 prose-td:py-3 prose-td:border-b prose-td:border-r prose-td:last:border-r-0 prose-td:border-border prose-td:align-top": true,

    // Link styling with improved accessibility
    "prose-a:text-brand prose-a:underline prose-a:underline-offset-2 prose-a:decoration-[0.08em] hover:prose-a:no-underline prose-a:font-medium": true,

    // Strong and emphasis with improved contrast
    "prose-strong:font-semibold prose-em:italic": true,

    // Horizontal rule
    "prose-hr:my-8 prose-hr:border-border": true,

    // Image styling with improved display
    "prose-img:rounded-md prose-img:my-6 prose-img:max-w-full prose-img:shadow-sm prose-img:mx-auto": true,

    // Theme
    "prose-prosetheme": true,
};

type MarkdownContentProps = {
    content: string;
    className?: string;
    shouldAnimate?: boolean;
    isCompleted?: boolean;
    isLast?: boolean;
};

export const removeIncompleteTags = (content: string) => {
    // A simpler approach that handles most cases:
    // 1. If the last < doesn't have a matching >, remove from that point onward
    const lastLessThan = content.lastIndexOf("<");
    if (lastLessThan !== -1) {
        const textAfterLastLessThan = content.substring(lastLessThan);
        if (!textAfterLastLessThan.includes(">")) {
            return content.substring(0, lastLessThan);
        }
    }

    return content;
};

// Function to detect and handle incomplete table markdown
export const handleIncompleteTable = (content: string): string => {
    // Check if content contains table markdown
    const hasTableStart = content.includes("|");
    if (!hasTableStart) return content;

    const lines = content.split("\n");
    let tableStartIndex = -1;
    let tableEndIndex = -1;
    let inTable = false;

    // Find table boundaries
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if line looks like a table row (contains |)
        if (line.includes("|") && line.length > 0) {
            if (!inTable) {
                tableStartIndex = i;
                inTable = true;
            }
            tableEndIndex = i;
        } else if (inTable && line.length === 0) {
        } else if (inTable && !line.includes("|")) {
            // Non-table line after table content
            break;
        }
    }

    // If we found a table, check if it's complete
    if (tableStartIndex !== -1) {
        const tableLines = lines.slice(tableStartIndex, tableEndIndex + 1);

        // Check if table has proper header separator (second line should contain dashes)
        if (tableLines.length >= 2) {
            const headerSeparator = tableLines[1];
            const hasValidSeparator =
                headerSeparator.includes("-") && headerSeparator.includes("|");

            if (!hasValidSeparator) {
                // Table is incomplete, remove the incomplete table
                const beforeTable = lines.slice(0, tableStartIndex).join("\n");
                const afterTable = lines.slice(tableEndIndex + 1).join("\n");
                return `${beforeTable}${afterTable ? `\n${afterTable}` : ""}`;
            }
        } else if (tableLines.length === 1) {
            // Only one line of table, likely incomplete
            const beforeTable = lines.slice(0, tableStartIndex).join("\n");
            const afterTable = lines.slice(tableEndIndex + 1).join("\n");
            return `${beforeTable}${afterTable ? `\n${afterTable}` : ""}`;
        }
    }

    return content;
};

// New function to normalize content before serialization
export const normalizeContent = (content: string) => {
    // Replace literal "\n" strings with actual newlines
    // This handles cases where newlines are escaped in the string
    return content.replace(/\\n/g, "\n");
};

function parseCitationsWithSourceTags(markdown: string): string {
    // Basic single citation regex
    const citationRegex = /\[(\d+)\]/g;
    let result = markdown;

    // Replace each citation with the wrapped version
    result = result.replace(citationRegex, (_match, p1) => {
        return `<Source>${p1}</Source>`;
    });

    // This regex and replacement logic needs to be fixed
    const multipleCitationsRegex = /\[(\d+(?:,\s*\d+)+)\]/g;
    result = result.replace(multipleCitationsRegex, (match) => {
        // Extract all numbers from the citation
        const numbers = match.match(/\d+/g) || [];
        // Create Source tags for each number
        return numbers.map((num) => `<Source>${num}</Source>`).join(" ");
    });

    return result;
}

export const MarkdownContent = memo(
    ({ content, className, isCompleted, isLast }: MarkdownContentProps) => {
        const [previousContent, setPreviousContent] = useState<string[]>([]);
        const [currentContent, setCurrentContent] = useState<string>("");
        const [stableKey, setStableKey] = useState<string>("");
        // Force re-render when theme changes
        const { currentTheme } = useTheme();
        const contentRef = useRef<string>("");
        const processingRef = useRef<boolean>(false);

        useEffect(() => {
            if (!content || content === contentRef.current || processingRef.current) return;

            processingRef.current = true;
            contentRef.current = content;

            try {
                const normalizedContent = normalizeContent(content);
                // Handle incomplete tables during streaming to prevent rendering issues
                const contentWithValidTables = isCompleted
                    ? normalizedContent
                    : handleIncompleteTable(normalizedContent);
                const contentWithCitations = parseCitationsWithSourceTags(contentWithValidTables);

                // Only update if content actually changed to prevent unnecessary re-renders
                setCurrentContent((prev) => {
                    if (prev !== contentWithCitations) {
                        // Generate stable key for better React reconciliation
                        setStableKey(`content-${Date.now()}-${contentWithCitations.length}`);
                        return contentWithCitations;
                    }
                    return prev;
                });
                setPreviousContent([]);
            } catch (error) {
                log.error("Error processing content:", { data: error });
            } finally {
                processingRef.current = false;
            }

            // Cleanup function to clear content when component unmounts
            return () => {
                setPreviousContent([]);
                setCurrentContent("");
                contentRef.current = "";
            };
        }, [content, isCompleted, currentTheme]);

        if (isCompleted && !isLast) {
            return (
                <div className={cn("markdown-content transform-gpu", markdownStyles, className)}>
                    <ErrorBoundary fallback={<ErrorPlaceholder />}>
                        <MemoizedMdxChunk chunk={currentContent} key={stableKey} />
                    </ErrorBoundary>
                </div>
            );
        }

        return (
            <div className={cn("markdown-content transform-gpu", markdownStyles, className)}>
                {previousContent.length > 0 &&
                    previousContent.map((chunk, index) => (
                        <ErrorBoundary
                            fallback={<ErrorPlaceholder />}
                            key={`prev-${chunk.slice(0, 50).replace(/\s/g, "")}-${index}`}
                        >
                            <MemoizedMdxChunk chunk={chunk} />
                        </ErrorBoundary>
                    ))}
                {currentContent && (
                    <ErrorBoundary
                        fallback={<ErrorPlaceholder />}
                        key={stableKey || "current-chunk"}
                    >
                        <MemoizedMdxChunk chunk={currentContent} />
                    </ErrorBoundary>
                )}
            </div>
        );
    },
);

MarkdownContent.displayName = "MarkdownContent";

export const MemoizedMdxChunk = memo(({ chunk }: { chunk: string }) => {
    const [mdx, setMdx] = useState<MDXRemoteSerializeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { theme } = useTheme();

    useEffect(() => {
        if (!chunk) return;

        let isMounted = true;
        setError(null);
        setIsLoading(true);

        (async () => {
            try {
                // Add timeout to prevent hanging on problematic content
                const serializationPromise = serialize(chunk, {
                    mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        // rehypePlugins: [rehypeSanitize],
                    },
                });

                const timeoutPromise = new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error("MDX serialization timeout")), 5000);
                });

                const serialized = await Promise.race([serializationPromise, timeoutPromise]);

                if (isMounted) {
                    setMdx(serialized);
                    setIsLoading(false);
                }
            } catch (serializationError) {
                log.error("Error serializing MDX chunk:", {
                    data: serializationError,
                    chunkLength: chunk.length,
                    chunkPreview: chunk.substring(0, 200),
                });

                if (isMounted) {
                    // Try to render as plain text if MDX serialization fails
                    try {
                        const fallbackPromise = serialize(chunk, {
                            mdxOptions: {
                                // Remove remarkGfm to avoid table parsing issues
                                remarkPlugins: [],
                            },
                        });

                        const fallbackTimeoutPromise = new Promise<never>((_, reject) => {
                            setTimeout(
                                () => reject(new Error("Fallback serialization timeout")),
                                2000,
                            );
                        });

                        const fallbackSerialized = await Promise.race([
                            fallbackPromise,
                            fallbackTimeoutPromise,
                        ]);
                        setMdx(fallbackSerialized);
                        setIsLoading(false);
                    } catch (fallbackError) {
                        log.error("Fallback serialization also failed:", { data: fallbackError });
                        setError("Failed to render content");
                        setIsLoading(false);
                    }
                }
            }
        })();

        return () => {
            isMounted = false;
            // Clear MDX content when component unmounts
            setMdx(null);
            setError(null);
            setIsLoading(false);
        };
    }, [chunk, theme]);

    if (error) {
        return (
            <div
                className="text-muted-foreground border-border bg-secondary/30 rounded-md border p-4 text-sm"
                role="alert"
                aria-live="polite"
            >
                <p className="mb-2 font-medium">Content rendering error</p>
                <pre className="markdown-text bg-background border-border overflow-x-auto whitespace-pre-wrap rounded border p-2 text-xs">
                    {chunk}
                </pre>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="animate-pulse space-y-3 py-2" aria-live="polite" aria-busy="true">
                <div className="bg-secondary h-4 w-3/4 rounded"></div>
                <div className="bg-secondary h-4 w-1/2 rounded"></div>
                <div className="bg-secondary h-4 w-5/6 rounded"></div>
            </div>
        );
    }

    if (!mdx) {
        return null;
    }

    return (
        <ErrorBoundary fallback={<ErrorPlaceholder />}>
            <Suspense
                fallback={
                    <div
                        className="animate-pulse space-y-3 py-2"
                        aria-live="polite"
                        aria-busy="true"
                    >
                        <div className="bg-secondary h-4 w-3/4 rounded"></div>
                        <div className="bg-secondary h-4 w-1/2 rounded"></div>
                        <div className="bg-secondary h-4 w-5/6 rounded"></div>
                    </div>
                }
            >
                <div className="markdown-content">
                    <MDXRemote {...mdx} components={mdxComponents} />
                </div>
            </Suspense>
        </ErrorBoundary>
    );
});

MemoizedMdxChunk.displayName = "MemoizedMdxChunk";
