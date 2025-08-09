"use client";

// Removed unused imports - now using server-side API route
import { useFeatureAccess } from "@repo/common/hooks/use-subscription-access";
import { useChatStore } from "@repo/common/store";
import { isGeminiModel } from "@repo/common/utils";
import { DOCUMENT_UPLOAD_CONFIG } from "@repo/shared/constants/document-upload";
import { useSession } from "@repo/shared/lib/auth-client";
import { log } from "@repo/shared/logger";
import { FeatureSlug } from "@repo/shared/types/subscription";
import { Button, cn, useToast } from "@repo/ui";
// Removed unused generateObject import - now using server-side API route
import { FileUp, ScanText, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { getPdfWorkerUrl } from "../../constants/pdf-worker";
import { z } from "zod";
import { useApiKeysStore } from "../../store/api-keys.store";
import { LoginRequiredDialog } from "../login-required-dialog";

const StructuredOutputButton = () => {
    const chatMode = useChatStore((state) => state.chatMode);
    const setStructuredData = useChatStore((state) => state.setStructuredData);
    const hasStructuredOutputAccess = useFeatureAccess(FeatureSlug.STRUCTURED_OUTPUT);
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys);
    const { toast } = useToast();
    const { data: session } = useSession();
    const isSignedIn = !!session;
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check if we have structured data already
    const structuredData = useChatStore((state) => state.structuredData);
    const hasProcessedData = !!structuredData;

    // Get the document type from file content
    const getDocumentType = (
        content: string,
        fileName: string,
    ): { type: string; schema: z.ZodSchema } => {
        const lowercaseContent = content.toLowerCase();
        const fileExtension = fileName.split(".").pop()?.toLowerCase();

        // Email detection
        if (
            lowercaseContent.includes("@") &&
            (lowercaseContent.includes("subject:") ||
                lowercaseContent.includes("from:") ||
                lowercaseContent.includes("to:"))
        ) {
            return {
                type: "email",
                schema: z.object({
                    subject: z.string().optional(),
                    from: z.string().optional(),
                    to: z.string().optional(),
                    date: z.string().optional(),
                    body: z.string(),
                    attachments: z.array(z.string()).optional(),
                }),
            };
        }

        // Invoice detection
        if (
            lowercaseContent.includes("invoice") ||
            lowercaseContent.includes("bill") ||
            lowercaseContent.includes("amount due")
        ) {
            return {
                type: "invoice",
                schema: z.object({
                    invoiceNumber: z.string().optional(),
                    date: z.string().optional(),
                    dueDate: z.string().optional(),
                    vendor: z.object({
                        name: z.string(),
                        address: z.string().optional(),
                        email: z.string().optional(),
                    }),
                    customer: z.object({
                        name: z.string(),
                        address: z.string().optional(),
                    }),
                    items: z.array(
                        z.object({
                            description: z.string(),
                            quantity: z.number().optional(),
                            unitPrice: z.number().optional(),
                            total: z.number().optional(),
                        }),
                    ),
                    totals: z.object({
                        subtotal: z.number().optional(),
                        tax: z.number().optional(),
                        total: z.number(),
                        currency: z.string().optional(),
                    }),
                }),
            };
        }

        // Resume detection
        if (
            lowercaseContent.includes("experience") &&
            lowercaseContent.includes("education") &&
            lowercaseContent.includes("skills")
        ) {
            return {
                type: "resume",
                schema: z.object({
                    personalInfo: z.object({
                        name: z.string(),
                        email: z.string().optional(),
                        phone: z.string().optional(),
                        location: z.string().optional(),
                        linkedin: z.string().optional(),
                        website: z.string().optional(),
                    }),
                    summary: z.string().optional(),
                    experience: z.array(
                        z.object({
                            company: z.string(),
                            position: z.string(),
                            startDate: z.string(),
                            endDate: z.string().optional(),
                            description: z.string().optional(),
                        }),
                    ),
                    education: z.array(
                        z.object({
                            institution: z.string(),
                            degree: z.string(),
                            field: z.string().optional(),
                            graduationDate: z.string().optional(),
                        }),
                    ),
                    skills: z.array(z.string()),
                }),
            };
        }

        // Contract detection
        if (
            lowercaseContent.includes("agreement") ||
            lowercaseContent.includes("contract") ||
            lowercaseContent.includes("terms and conditions")
        ) {
            return {
                type: "contract",
                schema: z.object({
                    contractType: z.string(),
                    parties: z.array(
                        z.object({
                            name: z.string(),
                            role: z.string(),
                            address: z.string().optional(),
                        }),
                    ),
                    effectiveDate: z.string().optional(),
                    expirationDate: z.string().optional(),
                    keyTerms: z.array(z.string()),
                    financialTerms: z
                        .object({
                            amount: z.number().optional(),
                            currency: z.string().optional(),
                            paymentSchedule: z.string().optional(),
                        })
                        .optional(),
                }),
            };
        }

        // Document structure for markdown files
        if (fileExtension === "md") {
            return {
                type: "markdown-document",
                schema: z.object({
                    title: z.string().optional(),
                    headings: z.array(
                        z.object({
                            level: z.number(),
                            text: z.string(),
                        }),
                    ),
                    sections: z.array(
                        z.object({
                            heading: z.string(),
                            content: z.string(),
                        }),
                    ),
                    links: z
                        .array(
                            z.object({
                                text: z.string(),
                                url: z.string(),
                            }),
                        )
                        .optional(),
                    codeBlocks: z
                        .array(
                            z.object({
                                language: z.string().optional(),
                                code: z.string(),
                            }),
                        )
                        .optional(),
                }),
            };
        }

        // Generic document schema
        return {
            type: "document",
            schema: z.object({
                documentType: z.string(),
                title: z.string().optional(),
                date: z.string().optional(),
                author: z.string().optional(),
                summary: z.string(),
                keyPoints: z.array(z.string()),
                entities: z.object({
                    people: z.array(z.string()).optional(),
                    organizations: z.array(z.string()).optional(),
                    locations: z.array(z.string()).optional(),
                    dates: z.array(z.string()).optional(),
                    amounts: z.array(z.string()).optional(),
                }),
            }),
        };
    };

    // Extract text from different file types
    const extractTextFromFile = async (file: File): Promise<string> => {
        const fileType = file.type;

        if (fileType === "application/pdf") {
            // Use PDF.js for PDF extraction with CDN worker for version consistency
            const pdfjsLib = await import("pdfjs-dist");
            pdfjsLib.GlobalWorkerOptions.workerSrc = getPdfWorkerUrl();

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map((item: { str: string }) => item.str);
                fullText += `${textItems.join(" ")}\n`;
            }

            return fullText.trim();
        } else if (fileType === "text/plain" || fileType === "text/markdown") {
            // For text and markdown files, just read as text
            return await file.text();
        } else {
            throw new Error(`Unsupported file type: ${fileType}`);
        }
    };

    // Process uploaded file and extract structured data
    const processFile = async (file: File) => {
        setIsProcessing(true);

        try {
            // Show initial toast
            toast({
                title: "Processing Document",
                description: `Analyzing ${file.name} for structured data extraction...`,
            });

            // Extract text content
            const textContent = await extractTextFromFile(file);

            if (!textContent.trim()) {
                throw new Error("No text content found in the document");
            }

            // Get document type - schema is now handled server-side
            const { type } = getDocumentType(textContent, file.name);

            // Call the server-side API route for structured extraction
            const response = await fetch("/api/tools/structured-extract", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    textContent,
                    documentType: type,
                    fileName: file.name,
                    chatMode,
                    userApiKeys: getAllKeys, // Pass user's API keys for non-VT+ users
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to extract structured data");
            }

            const result = await response.json();

            // Store the structured data
            setStructuredData(result);

            // Show success toast
            toast({
                title: "Extraction Complete",
                description: `Successfully extracted ${result.type} data from ${result.fileName}`,
            });

            // Automatically prompt user to use the extracted data
            const extractedDataString = JSON.stringify(result.data, null, 2);
            const chatInput = document.querySelector(
                '[data-testid="chat-input"]',
            ) as HTMLTextAreaElement;
            if (chatInput) {
                chatInput.value = `I've extracted structured data from ${result.fileName}. Here's the extracted ${result.type} data:

\`\`\`json
${extractedDataString}
\`\`\`

Please help me analyze this data and provide insights or answer any questions about it.`;

                // Trigger input change event to update the chat store
                chatInput.dispatchEvent(new Event("input", { bubbles: true }));
                chatInput.focus();
            }
        } catch (error) {
            log.error("Structured extraction failed:", { data: error });
            toast({
                title: "Extraction Failed",
                description:
                    error instanceof Error ? error.message : "Failed to extract structured data",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Handle file upload
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > DOCUMENT_UPLOAD_CONFIG.MAX_FILE_SIZE) {
            toast({
                title: "File too large",
                description: "File size must be less than 10MB",
                variant: "destructive",
            });
            return;
        }

        // Validate file type
        const isValidType = Object.keys(DOCUMENT_UPLOAD_CONFIG.ACCEPTED_TYPES).includes(file.type);
        if (!isValidType) {
            toast({
                title: "Unsupported File Type",
                description: "Please upload a PDF, DOC, DOCX, TXT, or MD file",
                variant: "destructive",
            });
            return;
        }

        await processFile(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Handle button click
    const handleClick = () => {
        if (!isSignedIn) {
            setShowLoginPrompt(true);
            return;
        }

        if (!hasStructuredOutputAccess) {
            toast({
                title: "VT+ Required",
                description:
                    "Structured output extraction is a VT+ feature. Please upgrade to access this functionality.",
                variant: "destructive",
            });
            return;
        }

        if (!isGeminiModel(chatMode)) {
            toast({
                title: "Gemini Model Required",
                description:
                    "Structured output extraction requires a Gemini model. Please switch to a Gemini model.",
                variant: "destructive",
            });
            return;
        }

        // Trigger file upload
        fileInputRef.current?.click();
    };

    // Only show for Gemini models
    if (!isGeminiModel(chatMode)) return null;

    return (
        <>
            <Button
                className={cn(
                    "text-muted-foreground hover:text-foreground",
                    hasProcessedData && "bg-green-500/10 text-green-500 hover:text-green-600",
                    isProcessing && "cursor-not-allowed opacity-50",
                )}
                onClick={handleClick}
                disabled={isProcessing}
                size="icon-sm"
                tooltip={
                    hasStructuredOutputAccess
                        ? hasProcessedData
                            ? `Structured data extracted from ${structuredData?.fileName}`
                            : "Upload document to extract structured data (PDF, TXT, MD)"
                        : "Unlock AI-powered structured data extraction with VT+"
                }
                variant="ghost"
            >
                {isProcessing ? (
                    <ScanText className="animate-spin" size={16} strokeWidth={2} />
                ) : hasProcessedData ? (
                    <ScanText size={16} strokeWidth={2} />
                ) : hasStructuredOutputAccess ? (
                    <FileUp size={16} strokeWidth={2} />
                ) : (
                    <Sparkles size={16} strokeWidth={2} />
                )}
            </Button>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={DOCUMENT_UPLOAD_CONFIG.SUPPORTED_EXTENSIONS.join(",")}
                onChange={handleFileUpload}
                className="hidden"
            />

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

export { StructuredOutputButton };
