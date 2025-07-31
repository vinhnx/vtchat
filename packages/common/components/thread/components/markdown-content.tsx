"use client";

import { ErrorBoundary, ErrorPlaceholder, mdxComponents } from "@repo/common/components";
import { log } from "@repo/shared/logger";
import { cn } from "@repo/ui";
import { MDXRemote } from "next-mdx-remote";
import type { MDXRemoteSerializeResult } from "next-mdx-remote/rsc";
import { serialize } from "next-mdx-remote/serialize";
import { useTheme } from "next-themes";
import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
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

// Circuit breaker to prevent infinite rendering loops
const renderCounts = new Map<string, number>();
const lastRenderTime = new Map<string, number>();
const MAX_RENDERS = 1; // Reduced to 1 for immediate detection of loops
const RESET_INTERVAL = 10000; // Increased to 10 seconds

export const renderCircuitBreaker = {
    shouldBlock(contentHash: string): boolean {
        const now = Date.now();
        const lastTime = lastRenderTime.get(contentHash) || 0;

        // Reset counter if enough time has passed
        if (now - lastTime > RESET_INTERVAL) {
            renderCounts.set(contentHash, 0);
        }

        const count = renderCounts.get(contentHash) || 0;

        // Check if we should block BEFORE incrementing
        if (count >= MAX_RENDERS) {
            log.warn(
                { contentHash: contentHash.slice(0, 100), count },
                "Circuit breaker triggered for table rendering",
            );
            return true;
        }

        // Only increment if this is a new attempt (not within 100ms of last attempt)
        if (now - lastTime > 100) {
            renderCounts.set(contentHash, count + 1);
            lastRenderTime.set(contentHash, now);
        }

        return false;
    },

    reset(contentHash: string): void {
        renderCounts.delete(contentHash);
        lastRenderTime.delete(contentHash);
    },
};

// Note: Table validation has been simplified to rely on markdown parser
// The circuit breaker provides sufficient protection against problematic content

// Simplified table handling that only intervenes for circuit breaker cases
export const handleIncompleteTable = (content: string): string => {
    // Quick check: if content doesn't contain tables, return as-is
    if (!content.includes("|")) return content;

    // Generate content hash for circuit breaker
    const contentHash = content.substring(0, 100);

    // Check circuit breaker - only convert to code block if truly problematic
    if (renderCircuitBreaker.shouldBlock(contentHash)) {
        log.warn({ contentHash }, "Circuit breaker triggered for table rendering");
        // Convert problematic table to code block
        return `\`\`\`\n${content}\n\`\`\``;
    }

    // For all other cases, let the markdown parser handle table rendering
    // Reset circuit breaker since we're not having issues
    renderCircuitBreaker.reset(contentHash);

    return content;
};

// New function to normalize content before serialization
export const normalizeContent = (content: string) => {
    // Replace literal "\n" strings with actual newlines
    // This handles cases where newlines are escaped in the string
    return content.replace(/\\n/g, "\n");
};

function parseCitationsWithSourceTags(markdown: string): string {
    // Improved citation parsing with better error handling and pattern detection
    try {
        let result = markdown;

        // Check for problematic patterns that might cause infinite loops
        // Pattern: semicolon followed by colon and then markdown tags
        const problematicPattern = /;.*:.*<[^>]*$/;
        if (problematicPattern.test(result)) {
            // If we detect a problematic pattern, be more conservative with parsing
            log.warn("Detected potentially problematic markdown pattern, using safe parsing");

            // Only parse complete, well-formed citations
            const safeCitationRegex = /\[(\d+)\](?=\s|$|[^<])/g;
            result = result.replace(safeCitationRegex, (_match, p1) => {
                return `<Source>${p1}</Source>`;
            });

            return result;
        }

        // First, handle multiple citations like [1,2,3] to avoid conflicts
        const multipleCitationsRegex = /\[(\d+(?:,\s*\d+)+)\]/g;
        result = result.replace(multipleCitationsRegex, (match) => {
            try {
                // Extract all numbers from the citation
                const numbers = match.match(/\d+/g) || [];
                // Create Source tags for each number
                return numbers.map((num) => `<Source>${num}</Source>`).join(" ");
            } catch (error) {
                // If parsing fails, return original match
                return match;
            }
        });

        // Then handle single citations like [1]
        // Use a more specific regex to avoid matching incomplete tags
        const citationRegex = /\[(\d+)\](?![^<]*>)/g;
        result = result.replace(citationRegex, (_match, p1) => {
            return `<Source>${p1}</Source>`;
        });

        return result;
    } catch (error) {
        // If any error occurs during parsing, return original markdown
        console.warn("Error parsing citations:", error);
        return markdown;
    }
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

        // Memoize processed content to prevent unnecessary re-processing
        const processedContent = useMemo(() => {
            if (!content) return "";

            try {
                const normalizedContent = normalizeContent(content);

                // Only handle incomplete tables during streaming, not for completed content
                let contentWithValidTables: string;
                if (isCompleted) {
                    // For completed content, use as-is
                    contentWithValidTables = normalizedContent;
                } else {
                    // Handle incomplete tables during streaming to prevent rendering issues
                    contentWithValidTables = handleIncompleteTable(normalizedContent);
                }

                // Add timeout protection for citation parsing
                const startTime = Date.now();
                const result = parseCitationsWithSourceTags(contentWithValidTables);
                const processingTime = Date.now() - startTime;

                // If processing takes too long, return original content
                if (processingTime > 1000) {
                    log.warn("Citation parsing took too long, using original content", {
                        processingTime,
                    });
                    return contentWithValidTables;
                }

                return result;
            } catch (error) {
                log.error("Error processing content:", { data: error });
                return content; // Return original content as fallback
            }
        }, [content, isCompleted]);

        useEffect(() => {
            if (
                !processedContent ||
                processedContent === contentRef.current ||
                processingRef.current
            )
                return;

            processingRef.current = true;
            contentRef.current = processedContent;

            // Only update if content actually changed to prevent unnecessary re-renders
            setCurrentContent((prev) => {
                if (prev !== processedContent) {
                    // Generate stable key for better React reconciliation
                    setStableKey(`content-${Date.now()}-${processedContent.length}`);
                    return processedContent;
                }
                return prev;
            });
            setPreviousContent([]);
            processingRef.current = false;

            // Cleanup function to clear content when component unmounts
            return () => {
                setPreviousContent([]);
                setCurrentContent("");
                contentRef.current = "";
            };
        }, [processedContent, currentTheme]);

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
            <div
                className={cn(
                    "markdown-content transform-gpu",
                    "min-h-[1.5em] w-full",
                    "transition-all duration-200 ease-out",
                    // Add streaming class for enhanced expansion
                    !isCompleted && "streaming-content",
                    markdownStyles,
                    className,
                )}
                style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    // Remove containment during streaming to allow dynamic expansion
                    contain: isCompleted ? "layout" : "none",
                }}
            >
                {/* Optimized rendering to prevent double rendering conflicts */}
                {!isCompleted && isLast ? (
                    // During streaming: Use progressive markdown renderer for all content
                    <ErrorBoundary
                        fallback={<ErrorPlaceholder />}
                        key={stableKey || "streaming-content"}
                    >
                        <ProgressiveMarkdownRenderer
                            content={previousContent.join("") + currentContent}
                            isStreaming={true}
                        />
                    </ErrorBoundary>
                ) : (
                    // After completion: Render all content chunks normally
                    <>
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
                    </>
                )}
            </div>
        );
    },
);

MarkdownContent.displayName = "MarkdownContent";

// Cache for serialized MDX content to prevent re-processing
const mdxCache = new Map<string, MDXRemoteSerializeResult>();
const CACHE_SIZE_LIMIT = 100;

// Optimized MDX chunk component with caching and deferred rendering
export const MemoizedMdxChunk = memo(({ chunk }: { chunk: string }) => {
    const [mdx, setMdx] = useState<MDXRemoteSerializeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { theme } = useTheme();

    // Create a stable cache key
    const cacheKey = `${chunk.slice(0, 100)}-${chunk.length}-${theme}`;

    useEffect(() => {
        if (!chunk) return;

        // Check cache first
        const cached = mdxCache.get(cacheKey);
        if (cached) {
            setMdx(cached);
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setError(null);
        setIsLoading(true);

        // Use requestIdleCallback for deferred processing when available
        const processChunk = () => {
            (async () => {
                try {
                    // Use normal mode with full features for streaming
                    const serializationPromise = serialize(chunk, {
                        mdxOptions: {
                            remarkPlugins: [remarkGfm],
                            // rehypePlugins: [rehypeSanitize],
                        },
                    });

                    const timeoutPromise = new Promise<never>((_, reject) => {
                        setTimeout(() => reject(new Error("MDX serialization timeout")), 3000);
                    });

                    const serialized = await Promise.race([serializationPromise, timeoutPromise]);

                    if (isMounted) {
                        // Cache the result
                        if (mdxCache.size >= CACHE_SIZE_LIMIT) {
                            // Remove oldest entries
                            const firstKey = mdxCache.keys().next().value;
                            mdxCache.delete(firstKey);
                        }
                        mdxCache.set(cacheKey, serialized);

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
                                    1000, // Reduced timeout for fallback
                                );
                            });

                            const fallbackSerialized = await Promise.race([
                                fallbackPromise,
                                fallbackTimeoutPromise,
                            ]);

                            // Cache fallback result too
                            mdxCache.set(cacheKey, fallbackSerialized);
                            setMdx(fallbackSerialized);
                            setIsLoading(false);
                        } catch (fallbackError) {
                            log.error("Fallback serialization also failed:", {
                                data: fallbackError,
                            });
                            setError("Failed to render content");
                            setIsLoading(false);
                        }
                    }
                }
            })();
        };

        // Use requestIdleCallback for deferred processing when available
        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            window.requestIdleCallback(processChunk, { timeout: 1000 });
        } else {
            // Fallback to setTimeout for browsers without requestIdleCallback
            setTimeout(processChunk, 0);
        }

        return () => {
            isMounted = false;
            // Clear MDX content when component unmounts
            setMdx(null);
            setError(null);
            setIsLoading(false);
        };
    }, [chunk, cacheKey]);

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
                <div
                    className={cn(
                        "markdown-content",
                        "min-h-[1.5em] w-full",
                        "transition-all duration-200 ease-out",
                    )}
                    style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                        // Allow dynamic expansion for streaming content
                        contain: "none",
                    }}
                >
                    <MDXRemote {...mdx} components={mdxComponents} />
                </div>
            </Suspense>
        </ErrorBoundary>
    );
});

MemoizedMdxChunk.displayName = "MemoizedMdxChunk";

// Progressive Markdown Renderer with content versioning and forced refresh
const ProgressiveMarkdownRenderer = memo(
    ({ content, isStreaming }: { content: string; isStreaming: boolean }) => {
        // Content versioning to prevent overlap
        const [contentVersion, setContentVersion] = useState(0);
        const [lastContent, setLastContent] = useState("");
        const contentRef = useRef<HTMLDivElement>(null);

        // Debounced content refresh to prevent rapid re-renders
        useEffect(() => {
            if (content !== lastContent) {
                const debounceTimeout = setTimeout(() => {
                    // Clear any existing content to prevent overlap
                    if (contentRef.current) {
                        contentRef.current.style.opacity = "0";
                        setTimeout(() => {
                            if (contentRef.current) {
                                contentRef.current.style.opacity = "1";
                            }
                        }, 10);
                    }
                    setContentVersion((prev) => prev + 1);
                    setLastContent(content);
                }, 50); // 50ms debounce to prevent excessive updates

                return () => clearTimeout(debounceTimeout);
            }
        }, [content, lastContent]);

        // Parse content into blocks for progressive rendering with debouncing
        const blocks = useMemo(() => {
            if (!content) return [];

            // Split content into logical blocks (paragraphs, headers, code blocks, etc.)
            const lines = content.split("\n");
            const blocks: string[] = [];
            let currentBlock = "";
            let inCodeBlock = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for code block markers
                if (line.trim().startsWith("```")) {
                    if (inCodeBlock) {
                        // End of code block
                        currentBlock += line + "\n";
                        blocks.push(currentBlock);
                        currentBlock = "";
                        inCodeBlock = false;
                    } else {
                        // Start of code block
                        if (currentBlock.trim()) {
                            blocks.push(currentBlock);
                        }
                        currentBlock = line + "\n";
                        inCodeBlock = true;
                    }
                } else if (inCodeBlock) {
                    // Inside code block, add line
                    currentBlock += line + "\n";
                } else if (line.trim() === "") {
                    // Empty line - end current block
                    if (currentBlock.trim()) {
                        blocks.push(currentBlock);
                        currentBlock = "";
                    }
                } else if (line.match(/^#{1,6}\s/)) {
                    // Header - end current block and start new one
                    if (currentBlock.trim()) {
                        blocks.push(currentBlock);
                    }
                    currentBlock = line + "\n";
                } else if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
                    // List item - continue current block or start new one
                    currentBlock += line + "\n";
                } else {
                    // Regular line - add to current block
                    currentBlock += line + "\n";
                }
            }

            // Add remaining content as final block
            if (currentBlock.trim()) {
                blocks.push(currentBlock);
            }

            return blocks;
        }, [content]);

        return (
            <div
                ref={contentRef}
                className="progressive-markdown-renderer"
                style={{
                    // Prevent layout shifts during streaming
                    minHeight: "1.5em",
                    contain: "layout style",
                    transition: "opacity 0.1s ease-out",
                }}
                key={`content-v${contentVersion}`} // Force re-render on version change
            >
                {blocks.map((block, index) => (
                    <MemoizedMarkdownBlock
                        key={`v${contentVersion}-block-${index}-${block.trim().substring(0, 10).replace(/\s+/g, "-")}`}
                        content={block.trim()}
                    />
                ))}
                {isStreaming && (
                    <span
                        className="streaming-cursor inline-block w-0.5 h-5 bg-current ml-0.5"
                        style={{
                            // Ensure cursor doesn't cause layout shifts
                            flexShrink: 0,
                        }}
                    />
                )}
            </div>
        );
    },
);

ProgressiveMarkdownRenderer.displayName = "ProgressiveMarkdownRenderer";

// Memoized markdown block component with stable rendering
const MemoizedMarkdownBlock = memo(
    ({ content }: { content: string }) => {
        return (
            <div
                style={{
                    // Prevent layout shifts within blocks
                    contain: "layout style",
                    minHeight: "1em",
                }}
            >
                <MemoizedMdxChunk chunk={content} />
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Only re-render if content actually changed
        return prevProps.content === nextProps.content;
    },
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";
