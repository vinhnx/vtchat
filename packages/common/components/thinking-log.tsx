'use client';

import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { ThreadItem } from '@repo/shared/types';
import { FeatureSlug } from '@repo/shared/types/subscription';
import { Alert, AlertDescription } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

type ThinkingLogProps = {
    threadItem: ThreadItem;
};

export const ThinkingLog = ({ threadItem }: ThinkingLogProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const thinkingMode = useChatStore(state => state.thinkingMode);
    const hasThinkingModeAccess = useFeatureAccess(FeatureSlug.THINKING_MODE);

    // Check if current model is Gemini (thinking mode only works with Gemini)
    const isGeminiModel = useMemo(() => {
        return threadItem.mode.toLowerCase().includes('gemini');
    }, [threadItem.mode]);

    // Check if we have any reasoning data to show
    const hasReasoningData = threadItem.reasoning || threadItem.reasoningDetails?.length;

    // Only show thinking log if:
    // 1. User has access to thinking mode (VT+)
    // 2. Thinking mode is enabled and includeThoughts is true
    // 3. Current model is Gemini
    // 4. There's actually reasoning data to show
    if (
        !hasThinkingModeAccess ||
        !thinkingMode.enabled ||
        !thinkingMode.includeThoughts ||
        !isGeminiModel ||
        !hasReasoningData
    ) {
        return null;
    }

    return (
        <div className="my-4">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="group flex w-full items-center justify-between rounded-lg border border-purple-200 bg-purple-50 p-3 text-left transition-all hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/30 dark:hover:bg-purple-950/50"
            >
                <div className="flex items-center gap-2">
                    <Brain
                        size={16}
                        className="flex-shrink-0 text-purple-600 dark:text-purple-400"
                    />
                    <span className="text-sm font-medium text-purple-800 dark:text-purple-300">
                        AI Thinking Process
                    </span>
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-600 dark:bg-purple-900/50 dark:text-purple-400">
                        VT+ Feature
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-purple-600 dark:text-purple-400">
                        {isExpanded ? 'Hide' : 'Show'} thoughts
                    </span>
                    {isExpanded ? (
                        <ChevronDown size={16} className="text-purple-600 dark:text-purple-400" />
                    ) : (
                        <ChevronRight size={16} className="text-purple-600 dark:text-purple-400" />
                    )}
                </div>
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <Alert className="mt-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100/50 dark:border-purple-800 dark:from-purple-950/50 dark:to-purple-900/30">
                            <AlertDescription className="text-sm text-purple-900 dark:text-purple-100">
                                <div className="space-y-2">
                                    <div className="mb-3 flex items-center gap-2">
                                        <Brain
                                            size={14}
                                            className="text-purple-600 dark:text-purple-400"
                                        />
                                        <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                                            Here's how the AI reasoned through your question:
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto space-y-2">
                                    {/* Display legacy reasoning text if available */}
                                        {threadItem.reasoning && (
                                             <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-purple-800 dark:text-purple-200">
                                                 {threadItem.reasoning}
                                             </div>
                                         )}
                                         
                                         {/* Display structured reasoning details */}
                                         {threadItem.reasoningDetails?.map((detail, index) => (
                                             <div key={index} className="border-l-2 border-purple-300 pl-3 dark:border-purple-600">
                                                 {detail.type === 'text' && detail.text && (
                                                     <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-purple-800 dark:text-purple-200">
                                                         {detail.text}
                                                         {detail.signature && (
                                                             <div className="mt-1 text-xs text-purple-600 dark:text-purple-400">
                                                                 <span className="font-semibold">Signature:</span> {detail.signature}
                                                             </div>
                                                         )}
                                                     </div>
                                                 )}
                                                 {detail.type === 'redacted' && detail.data && (
                                                     <div className="rounded bg-purple-100 p-2 text-xs text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                                         <span className="font-semibold">🔒 Redacted content:</span> {detail.data}
                                                     </div>
                                                 )}
                                             </div>
                                         ))}
                                     </div>
                                    <div className="mt-3 border-t border-purple-200 pt-2 dark:border-purple-700">
                                        <p className="text-xs text-purple-600 dark:text-purple-400">
                                            💡 This shows the AI's internal reasoning process before
                                            generating the final answer.
                                        </p>
                                    </div>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
