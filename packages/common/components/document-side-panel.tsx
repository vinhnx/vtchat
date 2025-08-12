import type { DocumentAttachment } from '@repo/shared/types';
import { Button, Sheet, SheetContent, SheetTrigger, TypographyH2, TypographyH4 } from '@repo/ui';
import { FileText, Lightbulb } from 'lucide-react';
import { memo } from 'react';
import { DocumentDisplay } from './thread/components/document-display';

type DocumentSidePanelProps = {
    documentAttachment: DocumentAttachment;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
};

export const DocumentSidePanel = memo(
    ({ documentAttachment, isOpen, onOpenChange }: DocumentSidePanelProps) => {
        return (
            <Sheet onOpenChange={onOpenChange} open={isOpen}>
                <SheetTrigger asChild>
                    <Button className='flex items-center gap-2' size='sm' variant='outlined'>
                        <FileText size={16} />
                        View Document
                    </Button>
                </SheetTrigger>

                <SheetContent className='p-6' title='Document Attachment Details' width='md'>
                    <div className='mb-6 flex items-center gap-2'>
                        <FileText size={20} />
                        <TypographyH2 className='text-lg font-semibold'>
                            Document Attachment
                        </TypographyH2>
                    </div>

                    <div className='space-y-4'>
                        <DocumentDisplay documentAttachment={documentAttachment} />

                        <div className='bg-muted/50 rounded-lg p-4'>
                            <TypographyH4 className='mb-2 text-sm font-medium'>
                                Document Details
                            </TypographyH4>
                            <div className='text-muted-foreground space-y-1 text-sm'>
                                <p>
                                    <strong>File Name:</strong> {documentAttachment.fileName}
                                </p>
                                <p>
                                    <strong>Type:</strong> {documentAttachment.mimeType}
                                </p>
                                <p>
                                    <strong>Size:</strong>{' '}
                                    {Math.round((documentAttachment.base64.length * 3) / 4 / 1024)}
                                    {' '}
                                    KB
                                </p>
                            </div>
                        </div>

                        <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                            <TypographyH4 className='mb-2 flex items-center gap-2 text-sm font-medium text-blue-800'>
                                <Lightbulb size={16} />
                                Document Processing
                            </TypographyH4>
                            <p className='text-xs text-blue-700'>
                                This document is being processed by Gemini AI. You can ask questions
                                about its content, request summaries, or have it analyzed in the
                                context of your conversation.
                            </p>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        );
    },
);

DocumentSidePanel.displayName = 'DocumentSidePanel';
