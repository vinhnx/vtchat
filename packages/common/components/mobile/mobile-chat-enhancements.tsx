import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
    ChevronDown, 
    Maximize2, 
    Minimize2,
    Mic,
    Send,
    Plus,
    MoreHorizontal
} from 'lucide-react';
import { Button, cn } from '@repo/ui';
import { useMediaQuery } from '@repo/common/hooks';

interface MobileChatHeaderProps {
    title?: string;
    subtitle?: string;
    onMinimize?: () => void;
    onMaximize?: () => void;
    isMinimized?: boolean;
}

export const MobileChatHeader = memo(({
    title = "VT Assistant",
    subtitle = "AI-powered chat",
    onMinimize,
    onMaximize,
    isMinimized = false
}: MobileChatHeaderProps) => {
    return (
        <motion.div
            className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white sticky top-0 z-50 md:hidden"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <motion.div
                    className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="text-lg font-bold">V</span>
                </motion.div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-semibold text-base truncate">{title}</h1>
                    <p className="text-xs opacity-90 truncate">{subtitle}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                {!isMinimized ? (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onMinimize}
                        className="text-white hover:bg-white/20"
                    >
                        <Minimize2 size={16} />
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onMaximize}
                        className="text-white hover:bg-white/20"
                    >
                        <Maximize2 size={16} />
                    </Button>
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-white hover:bg-white/20"
                >
                    <MoreHorizontal size={16} />
                </Button>
            </div>
        </motion.div>
    );
});

interface MobileInputToolbarProps {
    onVoiceInput?: () => void;
    onAttach?: () => void;
    onSend?: () => void;
    hasInput?: boolean;
    isRecording?: boolean;
    disabled?: boolean;
}

export const MobileInputToolbar = memo(({
    onVoiceInput,
    onAttach,
    onSend,
    hasInput = false,
    isRecording = false,
    disabled = false
}: MobileInputToolbarProps) => {
    return (
        <motion.div
            className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            {/* Voice input button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    variant={isRecording ? "destructive" : "outline"}
                    size="icon"
                    onClick={onVoiceInput}
                    disabled={disabled}
                    className={cn(
                        "relative overflow-hidden",
                        isRecording && "animate-pulse"
                    )}
                >
                    <Mic size={18} />
                    {isRecording && (
                        <motion.div
                            className="absolute inset-0 bg-red-500/20"
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                    )}
                </Button>
            </motion.div>

            {/* Attachment button */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onAttach}
                    disabled={disabled}
                >
                    <Plus size={18} />
                </Button>
            </motion.div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Send button */}
            <AnimatePresence>
                {hasInput && (
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ 
                            type: "spring", 
                            stiffness: 300, 
                            damping: 20 
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            variant="default"
                            size="icon"
                            onClick={onSend}
                            disabled={disabled}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                        >
                            <Send size={18} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

interface SwipeableMessageProps {
    children: React.ReactNode;
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    className?: string;
}

export const SwipeableMessage = memo(({
    children,
    onSwipeLeft,
    onSwipeRight,
    className
}: SwipeableMessageProps) => {
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragThreshold = 100;

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = (event: any, info: PanInfo) => {
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

    const handleDrag = (event: any, info: PanInfo) => {
        setDragOffset(info.offset.x);
    };

    return (
        <motion.div
            className={cn("relative touch-pan-y", className)}
            drag="x"
            dragElastic={0.3}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            animate={{ x: isDragging ? dragOffset : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {/* Swipe indicators */}
            <AnimatePresence>
                {isDragging && Math.abs(dragOffset) > 20 && (
                    <>
                        {dragOffset > 0 && onSwipeRight && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: Math.min(dragOffset / dragThreshold, 1) }}
                                exit={{ opacity: 0 }}
                                className="absolute left-0 top-0 bottom-0 flex items-center justify-center w-16 bg-green-500/20 text-green-600"
                            >
                                <ChevronDown className="rotate-90" size={24} />
                            </motion.div>
                        )}
                        {dragOffset < 0 && onSwipeLeft && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: Math.min(Math.abs(dragOffset) / dragThreshold, 1) }}
                                exit={{ opacity: 0 }}
                                className="absolute right-0 top-0 bottom-0 flex items-center justify-center w-16 bg-red-500/20 text-red-600"
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
});

interface MobileOptimizedInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    disabled?: boolean;
    maxRows?: number;
}

export const MobileOptimizedInput = memo(({
    value,
    onChange,
    onSubmit,
    placeholder = "Type a message...",
    disabled = false,
    maxRows = 4
}: MobileOptimizedInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const isMobile = useMediaQuery('(max-width: 768px)');

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = maxRows * 24; // Approximate line height
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [value, maxRows]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
        }
    };

    if (!isMobile) {
        return (
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full resize-none border-0 bg-transparent px-4 py-3 text-base",
                    "placeholder:text-gray-500 focus:outline-none focus:ring-0",
                    "min-h-[60px] max-h-[120px]"
                )}
                rows={1}
            />
        );
    }

    return (
        <motion.div
            className={cn(
                "relative w-full min-h-[60px] flex items-end",
                "bg-white dark:bg-gray-800 rounded-2xl border",
                isFocused 
                    ? "border-blue-500 shadow-lg ring-2 ring-blue-500/20" 
                    : "border-gray-300 dark:border-gray-600"
            )}
            layout
            transition={{ duration: 0.2 }}
        >
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    "w-full resize-none border-0 bg-transparent px-4 py-4 text-base",
                    "placeholder:text-gray-500 focus:outline-none focus:ring-0",
                    "rounded-2xl overflow-hidden"
                )}
                style={{
                    minHeight: '60px',
                    maxHeight: `${maxRows * 24}px`,
                    lineHeight: '24px'
                }}
                rows={1}
            />

            {/* Input enhancement indicators */}
            <AnimatePresence>
                {isFocused && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-2 right-2 flex items-center gap-1"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500 font-medium">Ready</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

interface MobilePullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    threshold?: number;
}

export const MobilePullToRefresh = memo(({
    onRefresh,
    children,
    threshold = 80
}: MobilePullToRefreshProps) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [canRefresh, setCanRefresh] = useState(false);

    const handleDragStart = () => {
        if (window.scrollY === 0) {
            setCanRefresh(true);
        }
    };

    const handleDragEnd = async (event: any, info: PanInfo) => {
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

    const handleDrag = (event: any, info: PanInfo) => {
        if (canRefresh && info.offset.y > 0) {
            setPullDistance(Math.min(info.offset.y, threshold * 1.5));
        }
    };

    return (
        <motion.div
            className="h-full overflow-hidden"
            drag="y"
            dragElastic={0.2}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
            dragConstraints={{ top: 0, bottom: 0 }}
        >
            {/* Pull indicator */}
            <AnimatePresence>
                {(pullDistance > 0 || isRefreshing) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                            height: isRefreshing ? 60 : Math.min(pullDistance, 60),
                            opacity: 1 
                        }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex items-center justify-center bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20"
                    >
                        <motion.div
                            animate={{ 
                                rotate: isRefreshing ? 360 : pullDistance * 4,
                                scale: pullDistance > threshold ? 1.2 : 1
                            }}
                            transition={{ 
                                rotate: isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : {}
                            }}
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-full",
                                pullDistance > threshold 
                                    ? "bg-blue-500 text-white" 
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}
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
});

MobileChatHeader.displayName = 'MobileChatHeader';
MobileInputToolbar.displayName = 'MobileInputToolbar';
SwipeableMessage.displayName = 'SwipeableMessage';
MobileOptimizedInput.displayName = 'MobileOptimizedInput';
MobilePullToRefresh.displayName = 'MobilePullToRefresh';
