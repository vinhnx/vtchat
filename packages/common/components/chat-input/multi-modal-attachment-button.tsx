import { useSubscriptionAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { supportsMultiModal } from '@repo/shared/config';
import { useSession } from '@repo/shared/lib/auth-client';
import { Attachment } from '@repo/shared/types';
import { Button, Tooltip, useToast } from '@repo/ui';
import { Paperclip } from 'lucide-react';
import { FC, useCallback, useRef, useState } from 'react';
import { GatedFeatureAlert } from '../gated-feature-alert';
import { LoginRequiredDialog } from '../login-required-dialog';
import { log } from '@repo/shared/logger';

// Create a wrapper component for Paperclip to match expected icon prop type
const PaperclipIcon: React.ComponentType<{ size?: number; className?: string }> = ({
    size,
    className,
}) => <Paperclip size={size} className={className} />;

interface MultiModalAttachmentButtonProps {
    onAttachmentsChange: (attachments: Attachment[]) => void;
    attachments: Attachment[];
    disabled?: boolean;
}

export const MultiModalAttachmentButton: FC<MultiModalAttachmentButtonProps> = ({
    onAttachmentsChange,
    attachments,
    disabled = false,
}) => {
    const chatMode = useChatStore(state => state.chatMode);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { canAccess } = useSubscriptionAccess();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasAttachments = attachments.length > 0;

    const { toast } = useToast();
    
    const handleFileUpload = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const maxFiles = 5;
        if (attachments.length + files.length > maxFiles) {
            toast({
                title: `Maximum ${maxFiles} files allowed`,
                variant: 'destructive',
            });
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            const newAttachments = [...attachments, ...data.attachments];
            
            onAttachmentsChange(newAttachments);
            toast({
                title: data.message,
                variant: 'success',
            });
        } catch (error) {
            log.error({ data: error }, 'Upload error');
            toast({
                title: error instanceof Error ? error.message : 'Upload failed',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
        }
    }, [attachments, onAttachmentsChange, toast]);

    const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        handleFileUpload(files);
        // Reset input to allow same file to be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleFileUpload]);

    const handleFileSelect = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        if (disabled || uploading) return;

        fileInputRef.current?.click();
    };

    // Only show for models that support multi-modal
    if (!supportsMultiModal(chatMode)) {
        return null;
    }

    const getTooltipContent = () => {
        if (uploading) return 'Uploading...';
        if (hasAttachments) {
            const count = attachments.length;
            const fileNames = attachments.map(a => a.name).join(', ');
            return `${count} file${count > 1 ? 's' : ''} attached: ${fileNames}`;
        }
        return 'Attach images and PDFs';
    };

    const attachmentButton = (
        <>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled || uploading}
            />
            <Tooltip content={getTooltipContent()}>
                <Button
                    variant={hasAttachments ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={handleFileSelect}
                    disabled={disabled || uploading}
                    className={
                        hasAttachments ? 'border-blue-300 bg-blue-100 hover:bg-blue-200' : ''
                    }
                >
                    <Paperclip size={16} strokeWidth={2} />
                </Button>
            </Tooltip>

            {/* Login prompt dialog */}
            <LoginRequiredDialog
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
                description="Please log in to upload and attach files to your messages."
                icon={PaperclipIcon}
            />
        </>
    );

    return attachmentButton;
};
