"use client";

import { useDocumentAttachment } from "@repo/common/hooks";
import { useChatStore } from "@repo/common/store";
import { isGeminiModel } from "@repo/common/utils";
import { DOCUMENT_UPLOAD_CONFIG } from "@repo/shared/constants/document-upload";
import { useSession } from "@repo/shared/lib/auth-client";
import { Button, cn, useToast } from "@repo/ui";
import { AlertCircle, CheckCircle, FileText, HelpCircle, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { LoginRequiredDialog } from "../login-required-dialog";
import { PDFHelpDialog } from "../pdf-help-dialog";

interface PDFProcessingStatus {
    status: "idle" | "uploading" | "processing" | "success" | "error";
    error?: string;
    suggestion?: string;
}

export const DocumentUploadButton = () => {
    const chatMode = useChatStore((state) => state.chatMode);
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const pdfProcessingStatus = useChatStore((state) => state.pdfProcessingStatus);
    const { handleDocumentUpload, clearAttachment } = useDocumentAttachment();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { toast } = useToast();

    // Only show for Gemini models
    if (!isGeminiModel(chatMode)) return null;

    const hasDocument = !!documentAttachment?.file;

    const validateFile = (file: File): { valid: boolean; error?: string } => {
        // Check file size
        if (file.size > DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File is too large. Maximum size is ${DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
            };
        }

        // Check file type
        if (!Object.keys(DOCUMENT_UPLOAD_CONFIG.ACCEPTED_TYPES).includes(file.type)) {
            return {
                valid: false,
                error: "Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or MD files.",
            };
        }

        // Additional PDF-specific validation
        if (file.type === "application/pdf") {
            // Check if file name has proper extension
            if (!file.name.toLowerCase().endsWith(".pdf")) {
                return {
                    valid: false,
                    error: "Invalid PDF file. Please ensure the file has a .pdf extension.",
                };
            }
        }

        return { valid: true };
    };

    const handleClick = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            useChatStore.getState().setPdfProcessingStatus({
                status: "error",
                error: validation.error,
                suggestion: "Please select a valid document file and try again.",
            });

            toast({
                title: "Invalid file",
                description: validation.error,
                variant: "destructive",
            });

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        try {
            // Show processing status for PDFs
            if (file.type === "application/pdf") {
                useChatStore.getState().setPdfProcessingStatus({ status: "uploading" });
            }

            // Use the existing document upload handler
            await handleDocumentUpload(event);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

            useChatStore.getState().setPdfProcessingStatus({
                status: "error",
                error: errorMessage,
                suggestion: "Please try uploading the file again, or use a different document.",
            });

            toast({
                title: "Upload failed",
                description: errorMessage,
                variant: "destructive",
            });
        }

        // Reset the input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveDocument = () => {
        clearAttachment();

        toast({
            title: "Document removed",
            description: "The attached document has been removed.",
            variant: "default",
        });
    };

    const getButtonIcon = () => {
        switch (pdfProcessingStatus.status) {
            case "uploading":
            case "processing":
                return <Loader2 size={16} className="animate-spin" />;
            case "success":
                return hasDocument ? <CheckCircle size={16} /> : <FileText size={16} />;
            case "error":
                return <AlertCircle size={16} />;
            default:
                return <FileText size={16} strokeWidth={2} />;
        }
    };

    const getButtonVariant = () => {
        if (pdfProcessingStatus.status === "error") return "destructive";
        if (hasDocument || pdfProcessingStatus.status === "success") return "secondary";
        return "ghost";
    };

    const getTooltipContent = () => {
        switch (pdfProcessingStatus.status) {
            case "uploading":
                return "Uploading document...";
            case "processing":
                return "Processing document...";
            case "success":
                return hasDocument
                    ? `Document ready: ${documentAttachment?.fileName}`
                    : "Document Upload (PDF, DOC, TXT)";
            case "error":
                return `Error: ${pdfProcessingStatus.error}`;
            default:
                return hasDocument
                    ? `Document uploaded: ${documentAttachment?.fileName}`
                    : "Document Upload (PDF, DOC, TXT)";
        }
    };

    const acceptString = DOCUMENT_UPLOAD_CONFIG.SUPPORTED_EXTENSIONS.join(",");

    return (
        <>
            <div className="flex items-center gap-1">
                <div className="relative">
                    <Button
                        className={cn(
                            "text-muted-foreground hover:text-foreground",
                            hasDocument && "bg-blue-500/10 text-blue-500 hover:text-blue-600",
                            pdfProcessingStatus.status === "error" &&
                                "bg-red-500/10 text-red-500 hover:text-red-600",
                            pdfProcessingStatus.status === "success" &&
                                "bg-green-500/10 text-green-500 hover:text-green-600",
                        )}
                        onClick={handleClick}
                        size="icon-sm"
                        tooltip={getTooltipContent()}
                        variant={getButtonVariant()}
                        disabled={
                            pdfProcessingStatus.status === "uploading" ||
                            pdfProcessingStatus.status === "processing"
                        }
                    >
                        {getButtonIcon()}
                    </Button>

                    {/* Remove button for uploaded documents */}
                    {hasDocument &&
                        pdfProcessingStatus.status !== "uploading" &&
                        pdfProcessingStatus.status !== "processing" && (
                            <Button
                                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white hover:bg-red-600"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveDocument();
                                }}
                                size="icon"
                                variant="ghost"
                                tooltip="Remove document"
                            >
                                <X size={10} />
                            </Button>
                        )}
                </div>
            </div>

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

            {/* Error Status Display */}
            {pdfProcessingStatus.status === "error" && (
                <div className="absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-md shadow-sm z-10 min-w-64">
                    <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <div className="font-medium text-red-700">Upload Failed</div>
                            <div className="text-red-600 mt-1">{pdfProcessingStatus.error}</div>
                            {pdfProcessingStatus.suggestion && (
                                <div className="text-red-500 text-xs mt-1">
                                    {pdfProcessingStatus.suggestion}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
