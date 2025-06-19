import { useDocumentAttachment } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { isGeminiModel } from '@repo/common/utils';
import { DOCUMENT_UPLOAD_CONFIG } from '@repo/shared/constants/document-upload';
import { Button, cn } from '@repo/ui';
import { FileText } from 'lucide-react';
import { useRef } from 'react';

export const DocumentUploadButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const documentAttachment = useChatStore(state => state.documentAttachment);
    const { handleDocumentUpload } = useDocumentAttachment();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Only show for Gemini models
    if (!isGeminiModel(chatMode)) return null;

    const hasDocument = !!documentAttachment?.file;

    const handleClick = () => {
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
                size="icon-sm"
                variant={hasDocument ? 'secondary' : 'ghost'}
                onClick={handleClick}
                tooltip={
                    hasDocument
                        ? `Document uploaded: ${documentAttachment?.fileName}`
                        : 'Document Upload (PDF, DOC, TXT)'
                }
                className={cn(
                    'text-muted-foreground hover:text-foreground',
                    hasDocument && 'bg-blue-500/10 text-blue-500 hover:text-blue-600'
                )}
            >
                <FileText size={16} strokeWidth={2} />
            </Button>
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptString}
                className="hidden"
                onChange={handleFileChange}
            />
        </>
    );
};
