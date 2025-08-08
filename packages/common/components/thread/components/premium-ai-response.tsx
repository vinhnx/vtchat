import { MarkdownContent, markdownStyles } from "@repo/common/components";
import { useCopyText } from "@repo/common/hooks";
import type { ThreadItem } from "@repo/shared/types";
import { cn } from "@repo/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sparkles, Zap } from "lucide-react";
import { memo, useRef, useState } from "react";

interface PremiumAIResponseProps {
    content: string;
    threadItem: ThreadItem;
    isGenerating?: boolean;
    isLast?: boolean;
}

export const PremiumAIResponse = memo(
    ({ content, threadItem, isGenerating = false, isLast = false }: PremiumAIResponseProps) => {
        const [_isExpanded, _setIsExpanded] = useState(false);
        const [showActions, setShowActions] = useState(false);
        const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
        const [isReading, setIsReading] = useState(false);
        const contentRef = useRef<HTMLDivElement>(null);
        const { copyToClipboard, status } = useCopyText();

        const handleCopy = () => {
            if (contentRef.current) {
                copyToClipboard(contentRef.current);
            }
        };

        const handleFeedback = (type: "up" | "down") => {
            setFeedback(type === feedback ? null : type);
        };

        const handleTextToSpeech = () => {
            if (isReading) {
                speechSynthesis.cancel();
                setIsReading(false);
            } else {
                const utterance = new SpeechSynthesisUtterance(content);
                utterance.rate = 0.8;
                utterance.pitch = 1;
                utterance.onend = () => setIsReading(false);
                speechSynthesis.speak(utterance);
                setIsReading(true);
            }
        };

        return (
            <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex w-full max-w-none gap-4"
                initial={{ opacity: 0, y: 20 }}
                onHoverEnd={() => setShowActions(false)}
                onHoverStart={() => setShowActions(true)}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* AI Avatar with sophisticated styling */}
                <motion.div
                    animate={{ scale: 1 }}
                    className="relative flex-shrink-0"
                    initial={{ scale: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <div className="relative">
                        {/* Thinking indicator */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    animate={{ scale: 1 }}
                                    className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-400"
                                    exit={{ scale: 0 }}
                                    initial={{ scale: 0 }}
                                >
                                    <Brain className="animate-pulse text-white" size={10} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Enhanced message container */}
                <div className="min-w-0 flex-1 space-y-3">
                    {/* AI badge and status */}
                    <motion.div
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="border-200 from-100 dark:border-700 dark:from-900/30 flex items-center gap-2 rounded-full border bg-gradient-to-r to-blue-100 px-3 py-1 dark:to-blue-900/30">
                            <Sparkles className="text-600 dark:text-400" size={14} />
                            <span className="text-700 dark:text-300 text-sm font-medium">
                                VT Assistant
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
                                    <Zap className="text-600 dark:text-400" size={12} />
                                </motion.div>
                            )}
                        </div>

                        {!isGenerating && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(threadItem.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </span>
                        )}
                    </motion.div>

                    {/* Enhanced content container */}
                    <motion.div
                        animate={{ scale: 1 }}
                        className={cn(
                            "group relative",
                            "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900",
                            "border border-gray-200 dark:border-gray-700",
                            "rounded-2xl shadow-sm hover:shadow-md",
                            "transition-all duration-300",
                            showActions && "ring-2 ring-blue-200 dark:ring-blue-800",
                        )}
                        initial={{ scale: 0.98 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        {/* Content */}
                        <div
                            className={cn(
                                "prose prose-base max-w-none p-6",
                                "prose-gray dark:prose-invert",
                                "prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100",
                                "prose-p:text-foreground prose-p:leading-relaxed",
                                "prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 dark:prose-code:bg-gray-800",
                                "prose-pre:border prose-pre:border-gray-200 prose-pre:bg-gray-100 dark:prose-pre:border-gray-700 dark:prose-pre:bg-gray-800",
                                markdownStyles,
                            )}
                            ref={contentRef}
                        >
                            <MarkdownContent
                                content={content}
                                isCompleted={threadItem.status === "COMPLETED"}
                                isLast={isLast}
                                shouldAnimate={threadItem.status !== "COMPLETED"}
                            />
                        </div>
                    </motion.div>

                    {/* Response metadata */}
                    {!isGenerating && (
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 px-1 text-xs text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <span>Model: {threadItem.model || "VT Assistant"}</span>
                            <span>•</span>
                            <span>Response time: ~2.3s</span>
                            <span>•</span>
                            <span>
                                Tokens: {content.length > 0 ? Math.ceil(content.length / 4) : 0}
                            </span>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        );
    },
);

PremiumAIResponse.displayName = "PremiumAIResponse";
