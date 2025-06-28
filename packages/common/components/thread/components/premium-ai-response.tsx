import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bot, 
    Brain, 
    Sparkles, 
    Copy, 
    ThumbsUp, 
    ThumbsDown, 
    RotateCcw,
    Volume2,
    VolumeX,
    Eye,
    Zap
} from 'lucide-react';
import { Button, cn, Card, CardContent } from '@repo/ui';
import { MarkdownContent, markdownStyles } from '@repo/common/components';
import { useCopyText } from '@repo/common/hooks';
import { ThreadItem } from '@repo/shared/types';

interface PremiumAIResponseProps {
    content: string;
    threadItem: ThreadItem;
    isGenerating?: boolean;
    isLast?: boolean;
}

export const PremiumAIResponse = memo(({
    content,
    threadItem,
    isGenerating = false,
    isLast = false
}: PremiumAIResponseProps) => {
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
            className="flex gap-4 w-full max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            onHoverStart={() => setShowActions(true)}
            onHoverEnd={() => setShowActions(false)}
        >
            {/* AI Avatar with sophisticated styling */}
            <motion.div
                className="relative flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
                <div className="relative">
                    <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        'bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500',
                        'shadow-lg shadow-purple-500/25',
                        'ring-2 ring-white/20',
                        isGenerating && 'animate-pulse'
                    )}>
                        <Bot size={20} className="text-white" />
                    </div>
                    
                    {/* Thinking indicator */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center"
                            >
                                <Brain size={10} className="text-white animate-pulse" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Enhanced message container */}
            <div className="flex-1 min-w-0 space-y-3">
                {/* AI badge and status */}
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700">
                        <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                            VT Assistant
                        </span>
                        {isGenerating && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                                <Zap size={12} className="text-purple-600 dark:text-purple-400" />
                            </motion.div>
                        )}
                    </div>
                    
                    {!isGenerating && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(threadItem.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </span>
                    )}
                </motion.div>

                {/* Enhanced content container */}
                <motion.div
                    className={cn(
                        'relative group',
                        'bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900',
                        'border border-gray-200 dark:border-gray-700',
                        'rounded-2xl shadow-sm hover:shadow-md',
                        'transition-all duration-300',
                        showActions && 'ring-2 ring-blue-200 dark:ring-blue-800'
                    )}
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                >
                    {/* Content */}
                    <div
                        ref={contentRef}
                        className={cn(
                            'p-6 prose prose-sm max-w-none',
                            'prose-gray dark:prose-invert',
                            'prose-headings:font-semibold prose-headings:text-gray-900 dark:prose-headings:text-gray-100',
                            'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed',
                            'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-2 prose-code:py-1 prose-code:rounded-md',
                            'prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700',
                            markdownStyles
                        )}
                    >
                        <MarkdownContent
                            content={content}
                            isCompleted={threadItem.status === 'COMPLETED'}
                            shouldAnimate={isGenerating}
                            isLast={isLast}
                        />
                    </div>

                    {/* Generating indicator */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-6 pb-4"
                            >
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <motion.div className="flex gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                className="w-2 h-2 bg-blue-500 rounded-full"
                                                animate={{
                                                    scale: [1, 1.2, 1],
                                                    opacity: [0.5, 1, 0.5],
                                                }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    delay: i * 0.2,
                                                }}
                                            />
                                        ))}
                                    </motion.div>
                                    <span>AI is thinking...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Enhanced action buttons */}
                    <AnimatePresence>
                        {(showActions || feedback) && !isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-gray-800 dark:via-gray-800/95 border-t border-gray-100 dark:border-gray-700 rounded-b-2xl"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {/* Feedback buttons */}
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleFeedback('up')}
                                            className={cn(
                                                'transition-all duration-200 hover:scale-110',
                                                feedback === 'up' 
                                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                                                    : 'text-gray-500 hover:text-green-600'
                                            )}
                                            tooltip="Helpful response"
                                        >
                                            <ThumbsUp size={14} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => handleFeedback('down')}
                                            className={cn(
                                                'transition-all duration-200 hover:scale-110',
                                                feedback === 'down' 
                                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                                                    : 'text-gray-500 hover:text-red-600'
                                            )}
                                            tooltip="Not helpful"
                                        >
                                            <ThumbsDown size={14} />
                                        </Button>

                                        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

                                        {/* Action buttons */}
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={handleCopy}
                                            className="text-gray-500 hover:text-blue-600 transition-all duration-200 hover:scale-110"
                                            tooltip={status === 'copied' ? 'Copied!' : 'Copy response'}
                                        >
                                            <Copy size={14} />
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={handleTextToSpeech}
                                            className={cn(
                                                'text-gray-500 hover:text-purple-600 transition-all duration-200 hover:scale-110',
                                                isReading && 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                                            )}
                                            tooltip={isReading ? 'Stop reading' : 'Read aloud'}
                                        >
                                            {isReading ? <VolumeX size={14} /> : <Volume2 size={14} />}
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => {/* Handle regenerate */}}
                                            className="text-gray-500 hover:text-orange-600 transition-all duration-200 hover:scale-110"
                                            tooltip="Regenerate response"
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 px-1"
                    >
                        <span>Model: {threadItem.model || 'VT Assistant'}</span>
                        <span>•</span>
                        <span>Response time: ~2.3s</span>
                        <span>•</span>
                        <span>Tokens: {content.length > 0 ? Math.ceil(content.length / 4) : 0}</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
});

PremiumAIResponse.displayName = 'PremiumAIResponse';
