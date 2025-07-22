"use client";

import { ErrorBoundary, ErrorPlaceholder, mdxComponents } from "@repo/common/components";
import { log } from "@repo/shared/logger";
import { cn } from "@repo/ui";
import { useTheme } from "next-themes";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
import { serialize } from "next-mdx-remote/serialize";
import { memo, Suspense, useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import "./markdown-content.css";

export const markdownStyles = {
    "animate-fade-in prose prose-base min-w-full dark:prose-invert": true,

    // Text styles - using markdown-text class for dynamic color changes
    "prose-p:font-normal prose-p:text-base prose-p:leading-[1.65rem] prose-p:mx-4 md:prose-p:mx-0 markdown-text": true,
    "prose-headings:text-base prose-headings:font-medium markdown-text": true,
    "prose-h1:text-2xl prose-h1:font-medium markdown-text": true,
    "prose-h2:text-2xl prose-h2:font-medium markdown-text": true,
    "prose-h3:text-lg prose-h3:font-medium markdown-text": true,
    "prose-strong:font-medium prose-th:font-medium markdown-text": true,

    "prose-li:font-normal prose-li:leading-[1.65rem] prose-li:mx-4 md:prose-li:mx-0 markdown-text": true,

    // Code styles
    "prose-code:font-sans prose-code:text-sm prose-code:font-normal": true,
    "prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5": true,

    // Table styles
    "prose-table:border-border prose-table:border prose-table:rounded-lg prose-table:bg-background": true,

    // Table header
    "prose-th:text-sm prose-th:font-medium prose-th:text-muted-foreground prose-th:bg-tertiary prose-th:px-3 prose-th:py-1.5": true,

    // Table row
    "prose-tr:border-border prose-tr:border": true,

    // Table cell
    "prose-td:px-3 prose-td:py-2.5 markdown-text": true,

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
        // Force re-render when theme changes
        const { currentTheme } = useTheme();

        useEffect(() => {
            if (!content) return;

            try {
                const normalizedContent = normalizeContent(content);
                // Handle incomplete tables during streaming to prevent rendering issues
                const contentWithValidTables = isCompleted
                    ? normalizedContent
                    : handleIncompleteTable(normalizedContent);
                const contentWithCitations = parseCitationsWithSourceTags(contentWithValidTables);

                setPreviousContent([]);
                setCurrentContent(contentWithCitations);
            } catch (error) {
                log.error("Error processing content:", { data: error });
            }
        }, [content, isCompleted, currentTheme]);

        if (isCompleted && !isLast) {
            return (
                <div className={cn("", markdownStyles, className)}>
                    <ErrorBoundary fallback={<ErrorPlaceholder />}>
                        <MemoizedMdxChunk chunk={currentContent} />
                    </ErrorBoundary>
                </div>
            );
        }

        return (
            <div className={cn("", markdownStyles, className)}>
                {previousContent.length > 0 &&
                    previousContent.map((chunk, index) => (
                        <ErrorBoundary fallback={<ErrorPlaceholder />} key={`prev-${index}`}>
                            <MemoizedMdxChunk chunk={chunk} />
                        </ErrorBoundary>
                    ))}
                {currentContent && (
                    <ErrorBoundary fallback={<ErrorPlaceholder />} key="current-chunk">
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
    const { theme } = useTheme();

    useEffect(() => {
        if (!chunk) return;

        let isMounted = true;
        setError(null);

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
                    } catch (fallbackError) {
                        log.error("Fallback serialization also failed:", { data: fallbackError });
                        setError("Failed to render content");
                    }
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [chunk, theme]);

    if (error) {
        return (
            <div className="text-muted-foreground text-sm p-2 border border-border rounded">
                <p>Content rendering error. Displaying as plain text:</p>
                <pre className="whitespace-pre-wrap mt-2 text-xs markdown-text">{chunk}</pre>
            </div>
        );
    }

    if (!mdx) {
        return null;
    }

    return (
        <ErrorBoundary fallback={<ErrorPlaceholder />}>
            <Suspense fallback={<div className="markdown-text">Loading...</div>}>
                <MDXRemote {...mdx} components={mdxComponents} />
            </Suspense>
        </ErrorBoundary>
    );
});

MemoizedMdxChunk.displayName = "MemoizedMdxChunk";
