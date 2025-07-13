"use client";

import { Button, cn } from "@repo/ui";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ChevronDown, Maximize2, Mic, Minimize2, MoreHorizontal, Plus, Send } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

// Simple media query hook
function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
}

interface MobileChatHeaderProps {
    title?: string;
    subtitle?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    isMinimized?: boolean;
}

export const MobileChatHeader = memo(
    ({
        title = "VT Assistant",
        subtitle = "AI-powered chat",
        onMinimize,
        onMaximize,
        isMinimized = false,
    }: MobileChatHeaderProps) => {
        return (
            <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 flex items-center justify-between bg-gradient-to-r gray-900 p-4 text-white md:hidden"
                initial={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                    <motion.div
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-lg font-bold">V</span>
                    </motion.div>
                    <div className="min-w-0 flex-1">
                        <h1 className="truncate text-base font-semibold">{title}</h1>
                        <p className="truncate text-xs opacity-90">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isMinimized ? (
                        <Button
                            className="text-white hover:bg-white/20"
                            onClick={onMaximize}
                            size="icon-sm"
                            variant="ghost"
                        >
                            <Maximize2 size={16} />
                        </Button>
                    ) : (
                        <Button
                            className="text-white hover:bg-white/20"
                            onClick={onMinimize}
                            size="icon-sm"
                            variant="ghost"
                        >
                            <Minimize2 size={16} />
                        </Button>
                    )}
                    <Button className="text-white hover:bg-white/20" size="icon-sm" variant="ghost">
                        <MoreHorizontal size={16} />
                    </Button>
                </div>
            </motion.div>
        );
    },
);

interface MobileInputToolbarProps {
    onVoiceInput?: () => void;
    onAttach?: () => void;
    onSend?: () => void;
    hasInput?: boolean;
    isRecording?: boolean;
    disabled?: boolean;
}

export const MobileInputToolbar = memo(
    ({
        onVoiceInput,
        onAttach,
        onSend,
        hasInput = false,
        isRecording = false,
        disabled = false,
    }: MobileInputToolbarProps) => {
        return (
            <motion.div
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-2 border-t border-gray-200 bg-white p-3 md:hidden dark:border-gray-700 dark:bg-gray-800"
                initial={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Voice input button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        className={cn("relative overflow-hidden", isRecording && "animate-pulse")}
                        disabled={disabled}
                        onClick={onVoiceInput}
                        size="icon"
                        variant={isRecording ? "destructive" : "outline"}
                    >
                        <Mic size={18} />
                        {isRecording && (
                            <motion.div
                                animate={{ opacity: [0, 1, 0] }}
                                className="absolute inset-0 bg-red-500/20"
                                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                            />
                        )}
                    </Button>
                </motion.div>

                {/* Attachment button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button disabled={disabled} onClick={onAttach} size="icon" variant="outline">
                        <Plus size={18} />
                    </Button>
                </motion.div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Send button */}
                <AnimatePresence>
                    {hasInput && (
                        <motion.div
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            initial={{ scale: 0, rotate: -180 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                className="bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg hover:from-blue-600 hover:to-purple-700"
                                disabled={disabled}
                                onClick={onSend}
                                size="icon"
                                variant="default"
                            >
                                <Send size={18} />
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    },
);

interface SwipeableMessageProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export const SwipeableMessage = memo(
    ({ children, onSwipeLeft, onSwipeRight, className }: SwipeableMessageProps) => {
        const [dragOffset, setDragOffset] = useState(0);
        const [isDragging, setIsDragging] = useState(false);
        const dragThreshold = 100;

        const handleDragStart = () => {
            setIsDragging(true);
        };

        const handleDragEnd = (_event: any, info: PanInfo) => {
            setIsDragging(false);
            const { offset } = info;

            if (Math.abs(offset.x) > dragThreshold) {
                if (offset.x > 0 && onSwipeRight) {
                    onSwipeRight();
                } else if (offset.x < 0 && onSwipeLeft) {
                    onSwipeLeft();
                }
            }

            setDragOffset(0);
        };

        const handleDrag = (_event: any, info: PanInfo) => {
            setDragOffset(info.offset.x);
        };

        return (
            <motion.div
                animate={{ x: isDragging ? dragOffset : 0 }}
                className={cn("relative touch-pan-y", className)}
                drag="x"
                dragElastic={0.3}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                {/* Swipe indicators */}
                <AnimatePresence>
                    {isDragging && Math.abs(dragOffset) > 20 && (
                        <>
                            {dragOffset > 0 && onSwipeRight && (
                                <motion.div
                                    animate={{ opacity: Math.min(dragOffset / dragThreshold, 1) }}
                                    className="absolute bottom-0 left-0 top-0 flex w-16 items-center justify-center bg-green-500/20 text-green-600"
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                >
                                    <ChevronDown className="rotate-90" size={24} />
                                </motion.div>
                            )}
                            {dragOffset < 0 && onSwipeLeft && (
                                <motion.div
                                    animate={{
                                        opacity: Math.min(Math.abs(dragOffset) / dragThreshold, 1),
                                    }}
                                    className="absolute bottom-0 right-0 top-0 flex w-16 items-center justify-center bg-red-500/20 text-red-600"
                                    exit={{ opacity: 0 }}
                                    initial={{ opacity: 0 }}
                                >
                                    <ChevronDown className="-rotate-90" size={24} />
                                </motion.div>
                            )}
                        </>
                    )}
                </AnimatePresence>

                {children}
            </motion.div>
        );
    },
);

interface MobileOptimizedInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
    maxRows?: number;
}

export const MobileOptimizedInput = memo(
    ({
        value,
        onChange,
        onSubmit,
        placeholder = "Type a message...",
        disabled = false,
        maxRows = 4,
    }: MobileOptimizedInputProps) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        const [isFocused, setIsFocused] = useState(false);
        const isMobile = useMediaQuery("(max-width: 768px)");

        // Auto-resize textarea
        useEffect(() => {
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
                const scrollHeight = textareaRef.current.scrollHeight;
                const maxHeight = maxRows * 24; // Approximate line height
                textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
            }
        }, [value, maxRows]);

        const handleKeyPress = (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
            }
        };

        if (!isMobile) {
            return (
                <textarea
                    className={cn(
                        "w-full resize-none border-0 bg-transparent px-4 py-3 text-base",
                        "placeholder:text-gray-500 focus:outline-none focus:ring-0",
                        "max-h-[120px] min-h-[60px]",
                    )}
                    disabled={disabled}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    ref={textareaRef}
                    rows={1}
                    value={value}
                />
            );
        }

        return (
            <motion.div
                className={cn(
                    "relative flex min-h-[60px] w-full items-end",
                    "rounded-2xl border bg-white dark:bg-gray-800",
                    isFocused
                        ? "border-blue-500 shadow-lg ring-2 ring-blue-500/20"
                        : "border-gray-300 dark:border-gray-600",
                )}
                layout
                transition={{ duration: 0.2 }}
            >
                <textarea
                    className={cn(
                        "w-full resize-none border-0 bg-transparent px-4 py-4 text-base",
                        "placeholder:text-gray-500 focus:outline-none focus:ring-0",
                        "overflow-hidden rounded-2xl",
                    )}
                    disabled={disabled}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholder}
                    ref={textareaRef}
                    rows={1}
                    style={{
                        minHeight: "60px",
                        maxHeight: `${maxRows * 24}px`,
                        lineHeight: "24px",
                    }}
                    value={value}
                />

                {/* Input enhancement indicators */}
                <AnimatePresence>
                    {isFocused && (
                        <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute right-2 top-2 flex items-center gap-1"
                            exit={{ opacity: 0, scale: 0.8 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                        >
                            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                            <span className="text-xs font-medium text-gray-500">Ready</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        );
    },
);

interface MobilePullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number;
}

export const MobilePullToRefresh = memo(
    ({ onRefresh, children, threshold = 80 }: MobilePullToRefreshProps) => {
        const [pullDistance, setPullDistance] = useState(0);
        const [isRefreshing, setIsRefreshing] = useState(false);
        const [canRefresh, setCanRefresh] = useState(false);

        const handleDragStart = () => {
            if (window.scrollY === 0) {
                setCanRefresh(true);
            }
        };

        const handleDragEnd = async (_event: any, _info: PanInfo) => {
            if (canRefresh && pullDistance > threshold && !isRefreshing) {
                setIsRefreshing(true);
                try {
                    await onRefresh();
                } finally {
                    setIsRefreshing(false);
                    setPullDistance(0);
                    setCanRefresh(false);
                }
            } else {
                setPullDistance(0);
                setCanRefresh(false);
            }
        };

        const handleDrag = (_event: any, info: PanInfo) => {
            if (canRefresh && info.offset.y > 0) {
                setPullDistance(Math.min(info.offset.y, threshold * 1.5));
            }
        };

        return (
            <motion.div
                className="h-full overflow-hidden"
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                dragMomentum={false}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                {/* Pull indicator */}
                <AnimatePresence>
                    {(pullDistance > 0 || isRefreshing) && (
                        <motion.div
                            animate={{
                                height: isRefreshing ? 60 : Math.min(pullDistance, 60),
                                opacity: 1,
                            }}
                            className="flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20"
                            exit={{ height: 0, opacity: 0 }}
                            initial={{ height: 0, opacity: 0 }}
                        >
                            <motion.div
                                animate={{
                                    rotate: isRefreshing ? 360 : pullDistance * 4,
                                    scale: pullDistance > threshold ? 1.2 : 1,
                                }}
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full",
                                    pullDistance > threshold
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-500 dark:bg-gray-700",
                                )}
                                transition={{
                                    rotate: isRefreshing
                                        ? {
                                              duration: 1,
                                              repeat: Number.POSITIVE_INFINITY,
                                              ease: "linear",
                                          }
                                        : {},
                                }}
                            >
                                <ChevronDown size={16} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    animate={{ y: pullDistance }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    {children}
                </motion.div>
            </motion.div>
        );
    },
);

MobileChatHeader.displayName = "MobileChatHeader";
MobileInputToolbar.displayName = "MobileInputToolbar";
SwipeableMessage.displayName = "SwipeableMessage";
MobileOptimizedInput.displayName = "MobileOptimizedInput";
MobilePullToRefresh.displayName = "MobilePullToRefresh";
