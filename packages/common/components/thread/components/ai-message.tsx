"use client";

import { MarkdownContent, markdownStyles } from "@repo/common/components";
import { useCopyText } from "@repo/common/hooks";
import type { ThreadItem } from "@repo/shared/types";
import { Button, cn } from "@repo/ui";
import { motion } from "framer-motion";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { memo, useRef, useState } from "react";

interface AIMessageProps {
    content: string;
    threadItem: ThreadItem;
    isGenerating?: boolean;
    isLast?: boolean;
    isCompleted?: boolean;
}

/**
 * Get display name for AI model
 */
function getModelDisplayName(mode: string): string {
    const modelMap: Record<string, string> = {
        "gpt-4o": "GPT-4o",
        "gpt-4o-mini": "GPT-4o Mini",
        "gpt-4-turbo": "GPT-4 Turbo",
        "gpt-3.5-turbo": "GPT-3.5 Turbo",
        "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
        "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
        "claude-3-opus-20240229": "Claude 3 Opus",
        "gemini-2.0-flash-exp": "Gemini 2.0 Flash",
        "gemini-1.5-pro": "Gemini 1.5 Pro",
        "gemini-1.5-flash": "Gemini 1.5 Flash",
        "gemini-2.5-flash-lite-preview-06-17": "Gemini 2.5 Flash Lite",
        "o1-preview": "OpenAI o1 Preview",
        "o1-mini": "OpenAI o1 Mini",
        "deepseek-chat": "DeepSeek Chat",
        "llama-3.3-70b-versatile": "Llama 3.3 70B",
        "llama-3.1-8b-instant": "Llama 3.1 8B",
        "mixtral-8x7b-32768": "Mixtral 8x7B",
    };

    return modelMap[mode] || "VT Assistant";
}

/**
 * Enhanced AI message component with avatar and visual differentiation
 * Provides clear distinction from user messages with left-aligned layout
 */
export const AIMessage = memo(
    ({
        content,
        threadItem,
        isGenerating = false,
        isLast = false,
        isCompleted = false,
    }: AIMessageProps) => {
        const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
        const [isReading, setIsReading] = useState(false);
        const contentRef = useRef<HTMLDivElement>(null);
        const { copyToClipboard } = useCopyText();

        const handleCopy = () => {
            if (contentRef.current) {
                copyToClipboard(contentRef.current);
            }
        };

        const handleFeedback = (type: "up" | "down") => {
            setFeedback(type === feedback ? null : type);
        };

        const handleRegenerate = () => {
            // TODO: Implement regenerate functionality
        };

        const handleReadAloud = () => {
            setIsReading(!isReading);
            // TODO: Implement text-to-speech functionality
        };

        return (
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full max-w-none"
                initial={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {/* Message container */}
                <div className="min-w-0 flex-1 space-y-2">
                    {/* AI badge and timestamp */}
                    <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center gap-2 rounded-full border border-200/50 bg-gradient-to-r from-50 to-blue-50 px-3 py-1 dark:border-700/50 dark:from-900/20 dark:to-blue-900/20">
                            <Sparkles className="h-3 w-3 text-600 dark:text-400" />
                            <span className="text-xs font-medium text-700 dark:text-300">
                                {getModelDisplayName(threadItem.mode)}
                            </span>
                            {isGenerating && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: "linear",
                                    }}
                                >
                                    <div className="h-2 w-2 rounded-full bg-600 dark:bg-400" />
                                </motion.div>
                            )}
                        </div>

                        {!isGenerating && (
                            <span className="text-xs text-muted-foreground">
                                {new Date(threadItem.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </motion.div>

                    {/* Content container */}
                    <motion.div
                        animate={{ scale: 1 }}
                        className={cn(
                            "group relative",
                            "bg-gradient-to-br from-background to-muted/30",
                            "border border-border/50 rounded-2xl shadow-sm",
                            "transition-all duration-300",
                            "hover:shadow-md hover:border-border",
                        )}
                        initial={{ scale: 0.98 }}
                        transition={{ delay: 0.3 }}
                    >
                        {/* Message content */}
                        <div
                            className="relative px-4 py-3"
                            ref={contentRef}
                            role="article"
                            aria-label="AI response"
                        >
                            <MarkdownContent
                                content={content}
                                isCompleted={isCompleted}
                                isLast={isLast}
                                className={cn(
                                    "prose-sm max-w-none",
                                    "prose-headings:text-foreground prose-p:text-foreground",
                                    "prose-strong:text-foreground prose-code:text-foreground",
                                    "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
                                    markdownStyles,
                                )}
                            />
                        </div>

                        {/* Generating indicator */}
                        {isGenerating && (
                            <motion.div
                                animate={{ opacity: 1, height: "auto" }}
                                className="border-t border-border/50 px-4 py-3"
                                exit={{ opacity: 0, height: 0 }}
                                initial={{ opacity: 0, height: 0 }}
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <motion.div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                className="h-2 w-2 rounded-full bg-500"
                                                key={i}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Number.POSITIVE_INFINITY,
                                                    delay: i * 0.2,
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                    <span>VT is thinking...</span>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        );
    },
);

AIMessage.displayName = "AIMessage";
