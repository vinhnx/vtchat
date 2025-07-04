'use client';

import { useStructuredExtraction } from '@repo/common/hooks';
import { useFeatureAccess } from '@repo/common/hooks/use-subscription-access';
import { useChatStore } from '@repo/common/store';
import { useSession } from '@repo/shared/lib/auth-client';
import { FeatureSlug } from '@repo/shared/types/subscription';
import {
    Button,
    cn,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    useToast,
} from '@repo/ui';
import { FileText, FileUp, Info, ScanText, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CustomSchemaBuilder } from '../custom-schema-builder';
import { LoginRequiredDialog } from '../login-required-dialog';

export const StructuredOutputButton = () => {
    const { extractStructuredOutput, isGeminiModel, hasDocument, isPDF } =
        useStructuredExtraction();
    const hasStructuredOutputAccess = useFeatureAccess(FeatureSlug.STRUCTURED_OUTPUT);
    const [showDialog, setShowDialog] = useState(false);
    const [showSchemaBuilder, setShowSchemaBuilder] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const { data: session } = useSession();
    const isSignedIn = !!session;

    // Use individual selectors to avoid infinite re-renders
    const structuredData = useChatStore((state) => state.structuredData);
    const useStructuredOutput = useChatStore((state) => state.useStructuredOutput);
    const setUseStructuredOutput = useChatStore((state) => state.setUseStructuredOutput);

    const isProcessed = !!structuredData;

    const handleClick = () => {
        // Check login first
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        // Check subscription access first
        if (!hasStructuredOutputAccess) {
            setShowDialog(true);
            return;
        }

        // Check if document is attached
        if (!hasDocument) {
            setShowDialog(true);
            return;
        }

        // Check if document is PDF
        if (!isPDF) {
            toast({
                title: 'Unsupported Document Type',
                description:
                    'Structured output extraction currently supports PDF files only. Please upload a PDF document.',
                variant: 'destructive',
            });
            return;
        }

        // Check if model is Gemini
        if (!isGeminiModel) {
            setShowDialog(true);
            return;
        }

        // All checks passed, toggle structured output mode and extract if enabling
        if (useStructuredOutput) {
            setUseStructuredOutput(false);
            toast({
                title: 'Structured Output Disabled',
                description: 'Structured output parsing has been turned off.',
            });
        } else {
            setUseStructuredOutput(true);
            extractStructuredOutput();
        }
    };

    const handleCustomSchemaCreate = (schemaData: { schema: any; type: string }) => {
        if (!hasStructuredOutputAccess) {
            toast({
                title: 'Sign In Required',
                description: 'Custom schema creation requires sign in.',
                variant: 'destructive',
            });
            return;
        }

        // Extract with custom schema
        extractStructuredOutput(schemaData.schema);
        setShowSchemaBuilder(false);
        toast({
            title: 'Custom Schema Applied',
            description: `Using custom schema "${schemaData.type}" for structured extraction.`,
        });
    };

    const getDialogContent = () => {
        if (!hasStructuredOutputAccess) {
            return {
                title: 'Unlock Structured Output',
                description:
                    'Transform your PDFs into organized data with AI-powered extraction. This powerful feature analyzes documents and creates structured JSON output perfect for data processing, analysis, and automation.',
                icon: <Sparkles className="h-6 w-6 text-yellow-500" />,
                showUpgrade: true,
            };
        }

        if (!hasDocument) {
            return {
                title: 'Upload a Document First',
                description:
                    'To use structured output extraction, please upload a PDF document first. This feature uses AI to extract organized data from your documents.',
                icon: <FileUp className="h-6 w-6 text-blue-500" />,
                showUpgrade: false,
            };
        }

        if (!isGeminiModel) {
            return {
                title: 'Gemini Model Required',
                description:
                    'Structured output extraction is only available when using Gemini models. Please switch to a Gemini model to use this feature.',
                icon: <Info className="h-6 w-6 text-orange-500" />,
                showUpgrade: false,
            };
        }

        return {
            title: 'Feature Guide',
            description: 'This feature extracts structured data from PDF documents using AI.',
            icon: <FileText className="h-6 w-6 text-green-500" />,
            showUpgrade: false,
        };
    };

    const dialogContent = getDialogContent();

    // Always show the button, but with different states
    return (
        <>
            <Button
                className={cn(
                    'text-muted-foreground hover:text-foreground',
                    useStructuredOutput && 'bg-green-500/10 text-green-500 hover:text-green-600',
                    isProcessed && 'text-green-600 hover:text-green-700',
                    !hasStructuredOutputAccess && 'opacity-50'
                )}
                onClick={handleClick}
                size="icon-sm"
                tooltip={
                    hasStructuredOutputAccess
                        ? hasDocument
                            ? isPDF
                                ? isGeminiModel
                                    ? isProcessed
                                        ? `Structured data extracted from ${structuredData?.fileName}`
                                        : 'Extract structured data from PDF (Gemini only)'
                                    : 'Switch to Gemini model to use structured output'
                                : 'Only PDF documents are supported'
                            : 'Upload a PDF document to extract structured data'
                        : 'Unlock AI-powered structured data extraction with VT+'
                }
                variant="ghost"
            >
                {hasStructuredOutputAccess ? (
                    hasDocument ? (
                        isGeminiModel ? (
                            <ScanText
                                className={isProcessed ? 'text-green-600' : ''}
                                size={16}
                                strokeWidth={2}
                            />
                        ) : (
                            <Info size={16} strokeWidth={2} />
                        )
                    ) : (
                        <FileUp size={16} strokeWidth={2} />
                    )
                ) : (
                    <Sparkles size={16} strokeWidth={2} />
                )}
            </Button>

            {/* Information/Guide Dialog */}
            <Dialog onOpenChange={setShowDialog} open={showDialog}>
                <DialogContent ariaTitle="Structured Output Information" className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            {dialogContent.icon}
                            <DialogTitle>{dialogContent.title}</DialogTitle>
                        </div>
                        <DialogDescription className="text-left">
                            {dialogContent.description}
                        </DialogDescription>
                    </DialogHeader>

                    {hasStructuredOutputAccess && hasDocument && isGeminiModel && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h4 className="mb-2 font-medium">How Structured Output Works:</h4>
                                <ul className="text-muted-foreground space-y-1 text-sm">
                                    <li>• AI analyzes your PDF document</li>
                                    <li>• Extracts organized data in JSON format</li>
                                    <li>
                                        • Automatically detects document type (invoice, receipt,
                                        etc.)
                                    </li>
                                    <li>• Supports custom schemas for specific needs</li>
                                </ul>
                            </div>

                            {hasStructuredOutputAccess && (
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        setShowDialog(false);
                                        setShowSchemaBuilder(true);
                                    }}
                                    size="sm"
                                    variant="outlined"
                                >
                                    <Sparkles className="mr-2" size={14} />
                                    Create Custom Schema (VT+ Only)
                                </Button>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {dialogContent.showUpgrade ? (
                            <div className="flex w-full gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={() => setShowDialog(false)}
                                    variant="outlined"
                                >
                                    Maybe Later
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        setShowDialog(false);
                                        router.push('/plus');
                                    }}
                                >
                                    <Sparkles className="mr-2" size={14} />
                                    Sign In
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => setShowDialog(false)}>
                                Got it!
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Custom Schema Builder Dialog */}
            {showSchemaBuilder && (
                <Dialog onOpenChange={setShowSchemaBuilder} open={showSchemaBuilder}>
                    <DialogContent
                        ariaTitle="Custom Schema Builder"
                        className="max-h-[80vh] overflow-y-auto sm:max-w-4xl"
                    >
                        <CustomSchemaBuilder
                            onClose={() => setShowSchemaBuilder(false)}
                            onSchemaCreate={handleCustomSchemaCreate}
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* Login Required Dialog */}
            <LoginRequiredDialog
                description="Please log in to use structured output extraction functionality."
                isOpen={showLoginPrompt}
                onClose={() => setShowLoginPrompt(false)}
                title="Login Required"
            />
        </>
    );
};
