import { useDocumentAttachment } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { isGeminiModel } from '@repo/common/utils';
import { DOCUMENT_UPLOAD_CONFIG } from '@repo/shared/constants/document-upload';
import { useSession } from '@repo/shared/lib/auth-client';
import { Button, cn } from '@repo/ui';
import { FileText } from 'lucide-react';
import { useRef, useState } from 'react';
import { LoginRequiredDialog } from '../login-required-dialog';

export const DocumentUploadButton = () => {
    const chatMode = useChatStore((state) => state.chatMode);
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const { handleDocumentUpload } = useDocumentAttachment();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    // Only show for Gemini models
    if (!isGeminiModel(chatMode)) return null;

    const hasDocument = !!documentAttachment?.file;

    const handleClick = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleDocumentUpload(event);
        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const acceptString = DOCUMENT_UPLOAD_CONFIG.SUPPORTED_EXTENSIONS.join(',');

    return (
        <>
            <Button
                className={cn(
                    'text-muted-foreground hover:text-foreground',
                    hasDocument && 'bg-blue-500/10 text-blue-500 hover:text-blue-600'
                )}
                onClick={handleClick}
                size="icon-sm"
                tooltip={
                    hasDocument
                        ? `Document uploaded: ${documentAttachment?.fileName}`
                        : 'Document Upload (PDF, DOC, TXT)'
                }
                variant={hasDocument ? 'secondary' : 'ghost'}
            >
                <FileText size={16} strokeWidth={2} />
            </Button>
            <input
                accept={acceptString}
                className="hidden"
                onChange={handleFileChange}
                ref={fileInputRef}
                type="file"
            />

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                description="Please log in to upload and attach documents to your messages."
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
            />
        </>
    );
};
