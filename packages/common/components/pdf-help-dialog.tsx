'use client';

import { Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@repo/ui';
import { AlertCircle, CheckCircle, FileText, HelpCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface PDFHelpDialogProps {
    trigger?: React.ReactNode;
}

export const PDFHelpDialog = ({ trigger }: PDFHelpDialogProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const defaultTrigger = (
        <Button variant='ghost' size='sm' className='text-muted-foreground hover:text-foreground'>
            <HelpCircle size={16} />
            PDF Help
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2'>
                        <FileText size={20} />
                        PDF Document Support
                    </DialogTitle>
                </DialogHeader>

                <div className='space-y-6'>
                    {/* Supported Formats */}
                    <div>
                        <h3 className='text-lg font-semibold mb-3'>Supported PDF Formats</h3>
                        <div className='space-y-3'>
                            <div className='flex items-start gap-3'>
                                <CheckCircle
                                    size={16}
                                    className='text-green-500 mt-0.5 flex-shrink-0'
                                />
                                <div>
                                    <div className='font-medium'>Text-based PDFs</div>
                                    <div className='text-sm text-muted-foreground'>
                                        Documents with selectable text content
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <CheckCircle
                                    size={16}
                                    className='text-green-500 mt-0.5 flex-shrink-0'
                                />
                                <div>
                                    <div className='font-medium'>Mixed content PDFs</div>
                                    <div className='text-sm text-muted-foreground'>
                                        Documents with both text and images
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <AlertCircle
                                    size={16}
                                    className='text-yellow-500 mt-0.5 flex-shrink-0'
                                />
                                <div>
                                    <div className='font-medium'>Image-only PDFs</div>
                                    <div className='text-sm text-muted-foreground'>
                                        Scanned documents (limited accuracy)
                                    </div>
                                </div>
                            </div>
                            <div className='flex items-start gap-3'>
                                <XCircle size={16} className='text-red-500 mt-0.5 flex-shrink-0' />
                                <div>
                                    <div className='font-medium'>Password-protected PDFs</div>
                                    <div className='text-sm text-muted-foreground'>
                                        Must be unlocked before upload
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Requirements */}
                    <div>
                        <h3 className='text-lg font-semibold mb-3'>File Requirements</h3>
                        <div className='bg-muted/50 p-4 rounded-lg space-y-2'>
                            <div className='flex justify-between'>
                                <span className='font-medium'>Maximum file size:</span>
                                <span>10MB</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-medium'>Recommended size:</span>
                                <span>Under 5MB</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-medium'>File extension:</span>
                                <span>.pdf</span>
                            </div>
                            <div className='flex justify-between'>
                                <span className='font-medium'>PDF versions:</span>
                                <span>All standard versions (1.0 - 2.0)</span>
                            </div>
                        </div>
                    </div>

                    {/* Common Issues */}
                    <div>
                        <h3 className='text-lg font-semibold mb-3'>Common Issues & Solutions</h3>
                        <div className='space-y-4'>
                            <div className='border rounded-lg p-4'>
                                <div className='font-medium text-red-600 mb-2'>
                                    "Document has no pages"
                                </div>
                                <div className='text-sm text-muted-foreground mb-2'>
                                    PDF file is corrupted or empty
                                </div>
                                <div className='text-sm'>
                                    <strong>Solutions:</strong>
                                    <ul className='list-disc list-inside mt-1 space-y-1'>
                                        <li>Verify the PDF opens in a PDF viewer</li>
                                        <li>Re-export from the original source</li>
                                        <li>Try a different PDF file</li>
                                    </ul>
                                </div>
                            </div>

                            <div className='border rounded-lg p-4'>
                                <div className='font-medium text-red-600 mb-2'>
                                    "Unable to process input image"
                                </div>
                                <div className='text-sm text-muted-foreground mb-2'>
                                    PDF format not compatible with processing
                                </div>
                                <div className='text-sm'>
                                    <strong>Solutions:</strong>
                                    <ul className='list-disc list-inside mt-1 space-y-1'>
                                        <li>Convert PDF to images (PNG/JPG)</li>
                                        <li>Use a text-based PDF instead</li>
                                        <li>Apply OCR to create searchable PDF</li>
                                    </ul>
                                </div>
                            </div>

                            <div className='border rounded-lg p-4'>
                                <div className='font-medium text-red-600 mb-2'>
                                    "File too large"
                                </div>
                                <div className='text-sm text-muted-foreground mb-2'>
                                    PDF exceeds 10MB size limit
                                </div>
                                <div className='text-sm'>
                                    <strong>Solutions:</strong>
                                    <ul className='list-disc list-inside mt-1 space-y-1'>
                                        <li>Compress the PDF file</li>
                                        <li>Split into smaller sections</li>
                                        <li>Reduce image quality/resolution</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Best Practices */}
                    <div>
                        <h3 className='text-lg font-semibold mb-3'>Best Practices</h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <h4 className='font-medium'>For Best Results:</h4>
                                <ul className='text-sm space-y-1'>
                                    <li>• Use text-based PDFs when possible</li>
                                    <li>• Keep files under 5MB</li>
                                    <li>• Ensure good text quality</li>
                                    <li>• Test simple documents first</li>
                                </ul>
                            </div>
                            <div className='space-y-2'>
                                <h4 className='font-medium'>Document Preparation:</h4>
                                <ul className='text-sm space-y-1'>
                                    <li>• Remove passwords before upload</li>
                                    <li>• Flatten forms with filled data</li>
                                    <li>• Optimize file size</li>
                                    <li>• Use descriptive filenames</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Alternative Approaches */}
                    <div>
                        <h3 className='text-lg font-semibold mb-3'>Alternative Approaches</h3>
                        <div className='bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg'>
                            <div className='text-sm space-y-2'>
                                <div>
                                    <strong>If PDF processing fails:</strong>
                                </div>
                                <ul className='list-disc list-inside space-y-1'>
                                    <li>Convert to images (PNG/JPG files)</li>
                                    <li>Extract and paste text content directly</li>
                                    <li>Convert PDF to Word/TXT format</li>
                                    <li>Upload document sections separately</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end pt-4'>
                    <Button onClick={() => setIsOpen(false)}>
                        Got it
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
