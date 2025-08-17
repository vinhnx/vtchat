'use client';

import { cn } from '../lib/utils';
import { Button, type ButtonProps } from './button';
import { AnimatePresence, motion } from 'framer-motion';
import { 
    Check, 
    Clipboard, 
    Download, 
    Save, 
    Share, 
    Heart, 
    Star,
    Bookmark,
    AlertCircle,
    Loader2
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

type ActionStatus = 'idle' | 'loading' | 'success' | 'error';

type ContextualButtonProps = ButtonProps & {
    action: () => Promise<void> | void;
    idleIcon?: React.ReactNode;
    loadingIcon?: React.ReactNode;
    successIcon?: React.ReactNode;
    errorIcon?: React.ReactNode;
    idleText?: string;
    loadingText?: string;
    successText?: string;
    errorText?: string;
    showTextOnSuccess?: boolean;
    showTextOnError?: boolean;
    resetDelay?: number;
    onStatusChange?: (status: ActionStatus) => void;
};

export function ContextualButton({
    action,
    idleIcon,
    loadingIcon = <Loader2 size={16} className='animate-spin' />,
    successIcon = <Check size={16} strokeWidth={2} />,
    errorIcon = <AlertCircle size={16} strokeWidth={2} />,
    idleText,
    loadingText,
    successText,
    errorText,
    showTextOnSuccess = false,
    showTextOnError = true,
    resetDelay = 2000,
    onStatusChange,
    className,
    children,
    disabled,
    ...props
}: ContextualButtonProps) {
    const [status, setStatus] = useState<ActionStatus>('idle');

    const handleClick = useCallback(async () => {
        if (status === 'loading') return;

        try {
            setStatus('loading');
            onStatusChange?.('loading');
            
            await action();
            
            setStatus('success');
            onStatusChange?.('success');

            setTimeout(() => {
                setStatus('idle');
                onStatusChange?.('idle');
            }, resetDelay);
        } catch (error) {
            setStatus('error');
            onStatusChange?.('error');

            setTimeout(() => {
                setStatus('idle');
                onStatusChange?.('idle');
            }, resetDelay + 1000);
        }
    }, [action, status, resetDelay, onStatusChange]);

    const getCurrentIcon = () => {
        switch (status) {
            case 'loading':
                return loadingIcon;
            case 'success':
                return successIcon;
            case 'error':
                return errorIcon;
            default:
                return idleIcon;
        }
    };

    const getCurrentText = () => {
        switch (status) {
            case 'loading':
                return loadingText;
            case 'success':
                return showTextOnSuccess ? successText : idleText;
            case 'error':
                return showTextOnError ? errorText : idleText;
            default:
                return idleText;
        }
    };

    const getButtonVariant = () => {
        if (status === 'error') return 'destructive';
        return props.variant || 'default';
    };

    return (
        <Button
            {...props}
            className={cn(
                'transition-colors duration-200 min-w-max',
                status === 'success' && 'text-green-600 border-green-200 dark:text-green-400 dark:border-green-800',
                className
            )}
            disabled={disabled || status === 'loading'}
            onClick={handleClick}
            variant={getButtonVariant()}
        >
            <AnimatePresence mode='wait'>
                <motion.span
                    animate={{ scale: 1, opacity: 1 }}
                    className='flex items-center gap-2 min-w-0'
                    exit={{ scale: 0.8, opacity: 0 }}
                    initial={{ scale: 0.8, opacity: 0 }}
                    key={status}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                    {getCurrentIcon()}
                    {(getCurrentText() || children) && (
                        <span className='truncate'>
                            {getCurrentText() || children}
                        </span>
                    )}
                </motion.span>
            </AnimatePresence>
        </Button>
    );
}

// Preset contextual buttons for common actions
export function CopyButton({
    onCopy,
    text,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onCopy?: () => Promise<void> | void;
    text?: string;
}) {
    const handleCopy = useCallback(async () => {
        if (text) {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
            } else {
                throw new Error('Clipboard not supported');
            }
        }
        await onCopy?.();
    }, [text, onCopy]);

    return (
        <ContextualButton
            action={handleCopy}
            className={cn('min-w-[100px]', className)}
            errorText='Failed'
            idleIcon={<Clipboard size={16} strokeWidth={2} />}
            idleText='Copy'
            loadingText='Copying...'
            successIcon={<Check size={16} strokeWidth={2} />}
            successText='Copied'
            {...props}
        />
    );
}

export function SaveButton({
    onSave,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onSave: () => Promise<void> | void;
}) {
    return (
        <ContextualButton
            action={onSave}
            className={cn('min-w-[100px]', className)}
            errorText='Save failed'
            idleIcon={<Save size={16} strokeWidth={2} />}
            idleText='Save'
            loadingText='Saving...'
            successIcon={<Check size={16} strokeWidth={2} />}
            successText='Saved'
            {...props}
        />
    );
}

export function DownloadButton({
    onDownload,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onDownload: () => Promise<void> | void;
}) {
    return (
        <ContextualButton
            action={onDownload}
            className={cn('min-w-[100px]', className)}
            errorText='Download failed'
            idleIcon={<Download size={16} strokeWidth={2} />}
            idleText='Download'
            loadingText='Downloading...'
            successIcon={<Check size={16} strokeWidth={2} />}
            successText='Downloaded'
            {...props}
        />
    );
}

export function ShareButton({
    onShare,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onShare: () => Promise<void> | void;
}) {
    return (
        <ContextualButton
            action={onShare}
            className={cn('min-w-[100px]', className)}
            errorText='Share failed'
            idleIcon={<Share size={16} strokeWidth={2} />}
            idleText='Share'
            loadingText='Sharing...'
            successIcon={<Check size={16} strokeWidth={2} />}
            successText='Shared'
            {...props}
        />
    );
}

export function LikeButton({
    onLike,
    isLiked = false,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onLike: () => Promise<void> | void;
    isLiked?: boolean;
}) {
    return (
        <ContextualButton
            action={onLike}
            className={cn('min-w-[100px]', className)}
            errorText='Failed'
            idleIcon={<Heart size={16} strokeWidth={2} fill={isLiked ? 'currentColor' : 'none'} />}
            idleText={isLiked ? 'Liked' : 'Like'}
            loadingText={isLiked ? 'Unliking...' : 'Liking...'}
            successIcon={<Heart size={16} strokeWidth={2} fill={!isLiked ? 'currentColor' : 'none'} />}
            successText={!isLiked ? 'Liked' : 'Unliked'}
            showTextOnSuccess
            {...props}
        />
    );
}

export function BookmarkButton({
    onBookmark,
    isBookmarked = false,
    className,
    ...props
}: Omit<ContextualButtonProps, 'action' | 'idleIcon' | 'successIcon'> & {
    onBookmark: () => Promise<void> | void;
    isBookmarked?: boolean;
}) {
    return (
        <ContextualButton
            action={onBookmark}
            className={cn('min-w-[100px]', className)}
            errorText='Failed'
            idleIcon={<Bookmark size={16} strokeWidth={2} fill={isBookmarked ? 'currentColor' : 'none'} />}
            idleText={isBookmarked ? 'Bookmarked' : 'Bookmark'}
            loadingText={isBookmarked ? 'Removing...' : 'Adding...'}
            successIcon={<Bookmark size={16} strokeWidth={2} fill={!isBookmarked ? 'currentColor' : 'none'} />}
            successText={!isBookmarked ? 'Bookmarked' : 'Removed'}
            showTextOnSuccess
            {...props}
        />
    );
}