import { MarkdownContent, markdownStyles } from '@repo/common/components';
import { useCopyText } from '@repo/common/hooks';
import type { ThreadItem } from '@repo/shared/types';
import { Button, cn } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    Brain,
    Copy,
    Eye,
    RotateCcw,
    Sparkles,
    ThumbsDown,
    ThumbsUp,
    Volume2,
    VolumeX,
    Zap,
} from 'lucide-react';
import { memo, useRef, useState } from 'react';

interface PremiumAIResponseProps {
    content: string;
    threadItem: ThreadItem;
    isGenerating?: boolean;
    isLast?: boolean;
}

export const PremiumAIResponse = memo(
    ({ content, threadItem, isGenerating = false, isLast = false }: PremiumAIResponseProps) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [showActions, setShowActions] = useState(false);
        const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
        const [isReading, setIsReading] = useState(false);
        const contentRef = useRef<HTMLDivElement>(null);
        const { copyToClipboard, status } = useCopyText();

        const handleCopy = () => {
            if (contentRef.current) {
                copyToClipboard(contentRef.current);
            }
        };

        const handleFeedback = (type: 'up' | 'down') => {
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
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                {/* AI Avatar with sophisticated styling */}
                <motion.div
                    animate={{ scale: 1 }}
                    className="relative flex-shrink-0"
                    initial={{ scale: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                    <div className="relative">
                        <div
                            className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl',
                                'bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500',
                                'shadow-lg shadow-purple-500/25',
                                'ring-2 ring-white/20',
                                isGenerating && 'animate-pulse'
                            )}
                        >
                            <Bot className="text-white" size={20} />
                        </div>

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
                        <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 dark:border-purple-700 dark:from-purple-900/30 dark:to-blue-900/30">
                            <Sparkles className="text-purple-600 dark:text-purple-400" size={14} />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                VT Assistant
                            </span>
                            {isGenerating && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 2,
                                        repeat: Number.POSITIVE_INFINITY,
                                        ease: 'linear',
                                    }}
                                >
                                    <Zap
                                        className="text-purple-600 dark:text-purple-400"
                                        size={12}
                                    />
                                </motion.div>
                            )}
                        </div>

                        {!isGenerating && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(threadItem.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        )}
                    </motion.div>

                    {/* Enhanced content container */}
                    <motion.div
                        animate={{ scale: 1 }}
                        className={cn(
                            'group relative',
                            'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900',
                            'border border-gray-200 dark:border-gray-700',
                            'rounded-2xl shadow-sm hover:shadow-md',
                            'transition-all duration-300',
                            showActions && 'ring-2 ring-blue-200 dark:ring-blue-800'
                        )}
                        initial={{ scale: 0.98 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        {/* Content */}
                        <div
                            className={cn(
                                'prose prose-base max-w-none p-6',
                                'prose-gray dark:prose-invert',
                                'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
                                'prose-p:text-gray-700 prose-p:leading-relaxed dark:prose-p:text-gray-300',
                                'prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 dark:prose-code:bg-gray-800',
                                'prose-pre:border prose-pre:border-gray-200 prose-pre:bg-gray-100 dark:prose-pre:border-gray-700 dark:prose-pre:bg-gray-800',
                                markdownStyles
                            )}
                            ref={contentRef}
                        >
                            <MarkdownContent
                                content={content}
                                isCompleted={threadItem.status === 'COMPLETED'}
                                isLast={isLast}
                                shouldAnimate={isGenerating}
                            />
                        </div>

                        {/* Generating indicator */}
                        <AnimatePresence>
                            {isGenerating && (
                                <motion.div
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="px-6 pb-4"
                                    exit={{ opacity: 0, height: 0 }}
                                    initial={{ opacity: 0, height: 0 }}
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                        <motion.div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    animate={{
                                                        scale: [1, 1.2, 1],
                                                        opacity: [0.5, 1, 0.5],
                                                    }}
                                                    className="h-2 w-2 rounded-full bg-blue-500"
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
                        </AnimatePresence>

                        {/* Enhanced action buttons */}
                        <AnimatePresence>
                            {(showActions || feedback) && !isGenerating && (
                                <motion.div
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute bottom-0 left-0 right-0 rounded-b-2xl border-t border-gray-100 bg-gradient-to-t from-white via-white/95 to-transparent p-4 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800/95"
                                    exit={{ opacity: 0, y: 10 }}
                                    initial={{ opacity: 0, y: 10 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {/* Feedback buttons */}
                                            <Button
                                                className={cn(
                                                    'transition-all duration-200 hover:scale-110',
                                                    feedback === 'up'
                                                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'text-gray-500 hover:text-green-600'
                                                )}
                                                onClick={() => handleFeedback('up')}
                                                size="icon-sm"
                                                tooltip="Helpful response"
                                                variant="ghost"
                                            >
                                                <ThumbsUp size={14} />
                                            </Button>

                                            <Button
                                                className={cn(
                                                    'transition-all duration-200 hover:scale-110',
                                                    feedback === 'down'
                                                        ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                                                        : 'text-gray-500 hover:text-red-600'
                                                )}
                                                onClick={() => handleFeedback('down')}
                                                size="icon-sm"
                                                tooltip="Not helpful"
                                                variant="ghost"
                                            >
                                                <ThumbsDown size={14} />
                                            </Button>

                                            <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

                                            {/* Action buttons */}
                                            <Button
                                                className="text-gray-500 transition-all duration-200 hover:scale-110 hover:text-blue-600"
                                                onClick={handleCopy}
                                                size="icon-sm"
                                                tooltip={
                                                    status === 'copied'
                                                        ? 'Copied!'
                                                        : 'Copy response'
                                                }
                                                variant="ghost"
                                            >
                                                <Copy size={14} />
                                            </Button>

                                            <Button
                                                className={cn(
                                                    'text-gray-500 transition-all duration-200 hover:scale-110 hover:text-purple-600',
                                                    isReading &&
                                                        'bg-purple-100 text-purple-600 dark:bg-purple-900/30'
                                                )}
                                                onClick={handleTextToSpeech}
                                                size="icon-sm"
                                                tooltip={isReading ? 'Stop reading' : 'Read aloud'}
                                                variant="ghost"
                                            >
                                                {isReading ? (
                                                    <VolumeX size={14} />
                                                ) : (
                                                    <Volume2 size={14} />
                                                )}
                                            </Button>

                                            <Button
                                                className="text-gray-500 transition-all duration-200 hover:scale-110 hover:text-orange-600"
                                                onClick={() => {
                                                    /* Handle regenerate */
                                                }}
                                                size="icon-sm"
                                                tooltip="Regenerate response"
                                                variant="ghost"
                                            >
                                                <RotateCcw size={14} />
                                            </Button>
                                        </div>

                                        {/* Response quality indicator */}
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Eye size={12} />
                                            <span>High quality response</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Response metadata */}
                    {!isGenerating && (
                        <motion.div
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-4 px-1 text-xs text-gray-500 dark:text-gray-400"
                            initial={{ opacity: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <span>Model: {threadItem.model || 'VT Assistant'}</span>
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
    }
);

PremiumAIResponse.displayName = 'PremiumAIResponse';
