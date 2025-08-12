'use client';

import { useSession } from '@repo/shared/lib/auth-client';
import { log } from '@repo/shared/logger';
import { Button, Textarea } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, HelpCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';

export const FeedbackWidget = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const [isOpen, setIsOpen] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = async () => {
        if (!feedback.trim()) return;

        setIsSubmitting(true);

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                body: JSON.stringify({ feedback }),
            });
            setIsSuccess(true);
            setFeedback('');

            setTimeout(() => {
                setIsSuccess(false);
                setIsOpen(false);
            }, 2000);
        } catch (error) {
            log.error('Failed to submit feedback:', { data: error });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!userId) {
        return null;
    }

    return (
        <div className='fixed bottom-6 right-6 z-50 flex items-end justify-end'>
            <AnimatePresence mode='wait'>
                {isOpen
                    ? (
                        <motion.div
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className='border-hard w-80 max-w-xs rounded-xl border bg-white shadow-2xl'
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isSuccess
                                ? (
                                    <div className='flex w-full flex-row gap-3 p-4'>
                                        <div className='flex flex-col items-center justify-center'>
                                            <CheckCircle
                                                className='text-brand'
                                                size={24}
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div className='flex flex-col gap-0'>
                                            <p className='text-sm font-medium'>Thank you!</p>
                                            <p className='text-muted-foreground/50 text-sm'>
                                                Your feedback has been sent.
                                            </p>
                                        </div>
                                    </div>
                                )
                                : (
                                    <>
                                        <div className='flex w-full flex-row justify-between px-4 pt-4'>
                                            <p className='text-sm font-medium'>Help us improve</p>
                                            <Button
                                                onClick={() => setIsOpen(false)}
                                                rounded='full'
                                                size='icon-xs'
                                                variant='ghost'
                                            >
                                                <X size={14} strokeWidth={2} />
                                            </Button>
                                        </div>
                                        <Textarea
                                            className='placeholder:text-muted-foreground/50 border-none bg-transparent px-4 py-2'
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder='Share your thoughts or suggestions to help us improve.'
                                            ref={inputRef}
                                            value={feedback}
                                        />
                                        <div className='flex w-full flex-row justify-end px-4 pb-4'>
                                            <Button
                                                disabled={isSubmitting || !feedback.trim()}
                                                onClick={handleSubmit}
                                                rounded='full'
                                                size='xs'
                                                variant='default'
                                            >
                                                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                                            </Button>
                                        </div>
                                    </>
                                )}
                        </motion.div>
                    )
                    : (
                        <motion.button
                            animate={{ opacity: 1, y: 0 }}
                            className=' bg-muted-foreground/30 text-background flex h-6 w-6 items-center justify-center rounded-full shadow-2xl'
                            exit={{ opacity: 0, y: 10 }}
                            initial={{ opacity: 0, y: 10 }}
                            onClick={() => {
                                setIsOpen(true);
                                setTimeout(() => {
                                    inputRef.current?.focus();
                                }, 100);
                            }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <HelpCircle className='text-background' size={24} strokeWidth={2} />
                        </motion.button>
                    )}
            </AnimatePresence>
        </div>
    );
};
