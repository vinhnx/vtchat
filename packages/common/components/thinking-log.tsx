'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { ThreadItem } from '@repo/shared/types';
import { FeatureSlug } from '@repo/shared/types/subscription';

import { AnimatePresence, motion } from 'framer-motion';
import { Brain, ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { MarkdownContent } from './thread/components/markdown-content';

type ThinkingLogProps = {
    threadItem: ThreadItem;
};

export const ThinkingLog = ({ threadItem }: ThinkingLogProps) => {
    // Auto-expand when reasoning is in progress
    const isReasoningInProgress =
        ('status' in threadItem && threadItem.status === 'IN_PROGRESS') ||
        threadItem.parts?.some(
            part =>
                part.type === 'reasoning' &&
                'status' in part &&
                (part as any).status === 'IN_PROGRESS'
        );
    const [isExpanded, setIsExpanded] = useState(true);

    // Always expand when reasoning is in progress
    if (isReasoningInProgress && !isExpanded) setIsExpanded(true);

    const thinkingMode = useChatStore(state => state.thinkingMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);
    const currentModel = useChatStore(state => state.model);

    // Check if we have any reasoning data to show (legacy reasoning, reasoningDetails, or parts)
    const hasReasoningData =
        threadItem.reasoning ||
        threadItem.reasoningDetails?.length ||
        threadItem.parts?.some(part => part.type === 'reasoning');

    // Only show thinking log if:
    // 1. User has access to thinking mode (VT+)
    // 2. Thinking mode is enabled and includeThoughts is true
    // 3. Current model supports reasoning
    // 4. There's actually reasoning data to show
    if (
        !hasThinkingModeAccess ||
        !thinkingMode.enabled ||
        !thinkingMode.includeThoughts ||
        !hasReasoningData
    ) {
        return null;
    }

    return (
        <div className="my-4">
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group flex w-full items-center justify-between rounded-lg border border-[#BFB38F]/30 bg-gradient-to-r from-[#262626] to-[#262626]/95 p-4 text-left shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-[#D99A4E]/50 hover:shadow-[0_0_20px_rgba(217,154,78,0.1)] dark:border-[#BFB38F]/20 dark:hover:border-[#D99A4E]/40"
            >
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={isExpanded ? { rotate: 360 } : { rotate: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Sparkles
                            size={18}
                            className="flex-shrink-0 text-[#D99A4E] drop-shadow-sm"
                        />
                    </motion.div>
                    <span className="text-sm font-medium text-[#BFB38F] drop-shadow-sm">
                        Thinking Steps ({currentModel?.name || currentModel?.id || 'AI'})
                    </span>
                    <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="rounded-full border border-[#D99A4E]/30 bg-gradient-to-r from-[#D99A4E]/20 to-[#BFB38F]/20 px-3 py-1 text-xs font-medium text-[#D99A4E] backdrop-blur-sm flex items-center gap-1"
                    >
                        <Sparkles size={12} />
                        VT+ Feature
                    </motion.span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-[#BFB38F]/80">
                        {isExpanded ? 'Hide' : 'Show'} thoughts
                    </span>
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown size={16} className="text-[#D99A4E]" />
                    </motion.div>
                </div>
            </motion.button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -10 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 rounded-lg border border-[#BFB38F]/20 bg-gradient-to-br from-[#262626] via-[#262626]/95 to-[#262626]/90 p-6 shadow-2xl backdrop-blur-md">
                            <div className="space-y-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                    className="flex items-center gap-3 border-b border-[#BFB38F]/20 pb-3"
                                >
                                    <Brain size={16} className="text-[#D99A4E] drop-shadow-sm" />
                                    <span className="text-sm font-medium text-[#BFB38F]">
                                        Thinking Steps
                                    </span>
                                </motion.div>

                                <div className="scrollbar-thin scrollbar-track-[#262626] scrollbar-thumb-[#BFB38F]/30 max-h-96 space-y-4 overflow-y-auto">
                                    {/* Display legacy reasoning text with markdown */}
                                    {threadItem.reasoning && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2, duration: 0.3 }}
                                            className="rounded-lg border border-[#BFB38F]/10 bg-[#262626]/50 p-4"
                                        >
                                            <MarkdownContent
                                                content={threadItem.reasoning}
                                                isCompleted={true}
                                                className="text-sm text-[#BFB38F] [&>*]:text-[#BFB38F] [&_b]:font-semibold [&_b]:text-[#D99A4E] dark:[&_b]:text-[#D99A4E] [&_code]:bg-[#D99A4E]/20 [&_code]:text-[#D99A4E] [&_pre]:border-[#BFB38F]/20 [&_pre]:bg-[#262626] [&_strong]:font-semibold [&_strong]:text-[#D99A4E] dark:[&_strong]:text-[#D99A4E]"
                                            />
                                        </motion.div>
                                    )}

                                    {/* Display AI SDK reasoning parts */}
                                    {threadItem.parts
                                        ?.filter(part => part.type === 'reasoning')
                                        .map((part, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: 0.2 + index * 0.1,
                                                    duration: 0.3,
                                                }}
                                                className="rounded-lg border border-[#D99A4E]/20 bg-gradient-to-r from-[#D99A4E]/5 to-[#BFB38F]/5 p-4"
                                            >
                                                {part.details?.map((detail, detailIndex) => (
                                                    <div key={detailIndex} className="space-y-2">
                                                        {detail.type === 'text' && detail.text && (
                                                            <MarkdownContent
                                                                content={detail.text}
                                                                isCompleted={true}
                                                                className="text-sm text-[#BFB38F] [&>*]:text-[#BFB38F] [&_b]:font-semibold [&_b]:text-[#D99A4E] dark:[&_b]:text-[#D99A4E] [&_code]:bg-[#D99A4E]/20 [&_code]:text-[#D99A4E] [&_pre]:border-[#BFB38F]/20 [&_pre]:bg-[#262626] [&_strong]:font-semibold [&_strong]:text-[#D99A4E] dark:[&_strong]:text-[#D99A4E]"
                                                            />
                                                        )}
                                                        {detail.type === 'redacted' && (
                                                            <div className="rounded-md border border-[#D99A4E]/20 bg-[#D99A4E]/10 p-3 flex items-center gap-2">
                                                            <span className="text-sm font-medium text-[#D99A4E]">
                                                            Redacted reasoning content
                                                            </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        ))}

                                    {/* Display structured reasoning details */}
                                    {threadItem.reasoningDetails?.map((detail, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                                            className="border-l-2 border-[#D99A4E]/50 pl-4"
                                        >
                                            {detail.type === 'text' && detail.text && (
                                                <div className="space-y-2">
                                                    <MarkdownContent
                                                        content={detail.text}
                                                        isCompleted={true}
                                                        className="text-sm text-[#BFB38F] [&>*]:text-[#BFB38F] [&_b]:font-semibold [&_b]:text-[#D99A4E] dark:[&_b]:text-[#D99A4E] [&_code]:bg-[#D99A4E]/20 [&_code]:text-[#D99A4E] [&_pre]:border-[#BFB38F]/20 [&_pre]:bg-[#262626] [&_strong]:font-semibold [&_strong]:text-[#D99A4E] dark:[&_strong]:text-[#D99A4E]"
                                                    />
                                                    {detail.signature && (
                                                        <div className="text-xs text-[#BFB38F]/70">
                                                            <span className="font-semibold">
                                                                Signature:
                                                            </span>{' '}
                                                            {detail.signature}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {detail.type === 'redacted' && detail.data && (
                                            <div className="rounded-md border border-[#D99A4E]/20 bg-[#D99A4E]/10 p-3 flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#D99A4E]">
                                            Redacted:
                                            </span>
                                            <span className="ml-2 text-sm text-[#BFB38F]/80">
                                            {detail.data}
                                            </span>
                                            </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                    className="border-t border-[#BFB38F]/20 pt-3"
                                >
                                    <p className="flex items-center gap-2 text-xs text-[#BFB38F]/60">
                                        <Sparkles size={12} className="text-[#D99A4E]" />
                                        This reveals the AI's step-by-step reasoning before
                                        generating the response
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
