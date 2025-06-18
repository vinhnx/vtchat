import { useDocumentAttachment } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { isGeminiModel } from '@repo/common/utils';
import { DOCUMENT_UPLOAD_CONFIG } from '@repo/shared/constants/document-upload';
import { Button } from '@repo/ui';
import { FileText } from 'lucide-react';
import { useRef } from 'react';

export const DocumentUploadButton = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const { handleDocumentAttachment } = useDocumentAttachment();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Only show for Gemini models
    if (!isGeminiModel(chatMode)) return null;

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleDocumentAttachment(event);
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
                variant="ghost"
                onClick={handleClick}
                tooltip="Document Upload (PDF, DOC, TXT)"
                className="text-muted-foreground hover:text-foreground"
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
