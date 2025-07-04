import { log } from '@repo/shared/logger';
import { Button } from '@repo/ui';
import { Download, Eye, FileText, X } from 'lucide-react';
import { memo } from 'react';

type DocumentDisplayProps = {
    documentAttachment: {
        base64: string;
        mimeType: string;
        fileName: string;
    };
    onRemove?: () => void;
};

export const DocumentDisplay = memo(({ documentAttachment, onRemove }: DocumentDisplayProps) => {
    const { fileName, mimeType, base64 } = documentAttachment;

    const getFileIcon = () => {
        if (mimeType === 'application/pdf') {
            return <FileText className="text-red-500" size={16} />;
        }
        if (mimeType.includes('word') || mimeType.includes('document')) {
            return <FileText className="text-blue-500" size={16} />;
        }
        if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
            return <FileText className="text-gray-500" size={16} />;
        }
        return <FileText className="text-gray-500" size={16} />;
    };

    const getFileSize = () => {
        // Estimate file size from base64 (roughly 75% of base64 length)
        const sizeInBytes = Math.round((base64.length * 3) / 4);
        if (sizeInBytes < 1024) return `${sizeInBytes}B`;
        if (sizeInBytes < 1024 * 1024) return `${Math.round(sizeInBytes / 1024)}KB`;
        return `${Math.round(sizeInBytes / (1024 * 1024))}MB`;
    };

    const handleDownload = () => {
        try {
            const byteCharacters = atob(base64.split(',')[1] || base64);
            const byteNumbers: number[] = [];
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            log.error('Error downloading file:', { data: error });
        }
    };

    const handlePreview = () => {
        if (mimeType === 'application/pdf') {
            try {
                const byteCharacters = atob(base64.split(',')[1] || base64);
                const byteNumbers: number[] = [];
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                window.open(url, '_blank');
                URL.revokeObjectURL(url);
            } catch (error) {
                log.error('Error previewing PDF:', { data: error });
            }
        }
    };

    return (
        <div className="border-border bg-background flex items-center gap-3 rounded-lg border p-3">
            <div className="flex-shrink-0">{getFileIcon()}</div>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-muted-foreground text-xs">
                    {mimeType.split('/')[1]?.toUpperCase()} • {getFileSize()}
                </p>
            </div>

            <div className="flex items-center gap-1">
                {mimeType === 'application/pdf' && (
                    <Button
                        onClick={handlePreview}
                        size="icon-sm"
                        tooltip="Preview"
                        variant="ghost"
                    >
                        <Eye size={14} />
                    </Button>
                )}

                <Button onClick={handleDownload} size="icon-sm" tooltip="Download" variant="ghost">
                    <Download size={14} />
                </Button>

                {onRemove && (
                    <Button onClick={onRemove} size="icon-sm" tooltip="Remove" variant="ghost">
                        <X size={14} />
                    </Button>
                )}
            </div>
        </div>
    );
});

DocumentDisplay.displayName = 'DocumentDisplay';
