'use client';

import { Button } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Square } from 'lucide-react';
import { useIsChatPage } from '../hooks/useIsChatPage';
import { ICON_SIZES } from '../config/constants';

interface SendStopButtonProps {
    isGenerating: boolean;
    stopGeneration: () => void;
    hasTextInput: boolean;
    sendMessage: () => void;
}

export function SendStopButton({
    isGenerating,
    stopGeneration,
    hasTextInput,
    sendMessage,
}: SendStopButtonProps) {
    const isChatPage = useIsChatPage();

    return (
        <div className="flex flex-row items-center gap-2">
            <AnimatePresence initial={false} mode="wait">
                {isGenerating && !isChatPage ? (
                    <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        key="stop-button"
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            aria-label="Stop Generation"
                            onClick={stopGeneration}
                            size="icon-sm"
                            tooltip="Stop Generation"
                            variant="default"
                        >
                            <Square size={ICON_SIZES.small} strokeWidth={2} />
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        initial={{ scale: 0.8, opacity: 0 }}
                        key="send-button"
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            aria-label="Send Message"
                            disabled={!hasTextInput}
                            onClick={sendMessage}
                            size="icon-sm"
                            tooltip="Send Message"
                            variant="default"
                        >
                            <ArrowUp size={ICON_SIZES.small} strokeWidth={2} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
