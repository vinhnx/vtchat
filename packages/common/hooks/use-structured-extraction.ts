import { getProviderInstance, Providers } from '@repo/ai/providers';
import { log } from '@repo/shared/logger';
import { useToast } from '@repo/ui';
import { generateObject } from 'ai';
import { useCallback } from 'react';
import { z } from 'zod';
import { useChatStore } from '../store';
import { useApiKeysStore } from '../store/api-keys.store';
import { isGeminiModel } from '../utils';

// Dynamic import for pdfjs-dist to handle browser environment
let pdfjsLib: any = null;

const initPdfJs = async () => {
    if (!pdfjsLib && typeof window !== 'undefined') {
        pdfjsLib = await import('pdfjs-dist');
        // Set worker source for pdfjs-dist
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    }
    return pdfjsLib;
};

// Define schemas for different document types
const InvoiceSchema = z.object({
    invoiceNumber: z.string().describe('Invoice number or ID'),
    date: z.string().describe('Invoice date'),
    dueDate: z.string().optional().describe('Due date if present'),
    vendor: z.object({
        name: z.string().describe('Vendor/company name'),
        address: z.string().optional().describe('Vendor address'),
        email: z.string().optional().describe('Vendor email'),
        phone: z.string().optional().describe('Vendor phone number'),
    }),
    customer: z.object({
        name: z.string().describe('Customer name'),
        address: z.string().optional().describe('Customer address'),
        email: z.string().optional().describe('Customer email'),
    }),
    items: z.array(
        z.object({
            description: z.string().describe('Item description'),
            quantity: z.number().optional().describe('Quantity'),
            unitPrice: z.number().optional().describe('Unit price'),
            total: z.number().optional().describe('Line total'),
        })
    ),
    totals: z.object({
        subtotal: z.number().optional().describe('Subtotal amount'),
        tax: z.number().optional().describe('Tax amount'),
        total: z.number().describe('Total amount'),
        currency: z.string().optional().describe('Currency symbol or code'),
    }),
});

const ResumeSchema = z.object({
    personalInfo: z.object({
        name: z.string().describe('Full name'),
        email: z.string().optional().describe('Email address'),
        phone: z.string().optional().describe('Phone number'),
        location: z.string().optional().describe('Location/address'),
        linkedin: z.string().optional().describe('LinkedIn profile URL'),
        website: z.string().optional().describe('Personal website URL'),
    }),
    summary: z.string().optional().describe('Professional summary or objective'),
    experience: z.array(
        z.object({
            company: z.string().describe('Company name'),
            position: z.string().describe('Job title/position'),
            startDate: z.string().describe('Start date'),
            endDate: z.string().optional().describe('End date (current if ongoing)'),
            description: z.string().optional().describe('Job description or accomplishments'),
        })
    ),
    education: z.array(
        z.object({
            institution: z.string().describe('School/university name'),
            degree: z.string().describe('Degree or certification'),
            field: z.string().optional().describe('Field of study'),
            graduationDate: z.string().optional().describe('Graduation date'),
        })
    ),
    skills: z.array(z.string()).describe('List of skills and competencies'),
});

const ContractSchema = z.object({
    contractType: z.string().describe('Type of contract (e.g., employment, service, lease)'),
    parties: z.array(
        z.object({
            name: z.string().describe('Party name'),
            role: z.string().describe('Role in contract (e.g., employer, contractor, tenant)'),
            address: z.string().optional().describe('Address'),
        })
    ),
    effectiveDate: z.string().optional().describe('Contract effective date'),
    expirationDate: z.string().optional().describe('Contract expiration date'),
    keyTerms: z.array(z.string()).describe('Main contract terms and conditions'),
    financialTerms: z
        .object({
            amount: z.number().optional().describe('Contract value or payment amount'),
            currency: z.string().optional().describe('Currency'),
            paymentSchedule: z.string().optional().describe('Payment schedule'),
        })
        .optional(),
});

const GenericDocumentSchema = z.object({
    documentType: z.string().describe('Type of document (e.g., letter, report, form)'),
    title: z.string().optional().describe('Document title'),
    date: z.string().optional().describe('Document date'),
    author: z.string().optional().describe('Document author'),
    summary: z.string().describe('Brief summary of the document content'),
    keyPoints: z.array(z.string()).describe('Main points or topics covered'),
    entities: z.object({
        people: z.array(z.string()).optional().describe('People mentioned'),
        organizations: z.array(z.string()).optional().describe('Organizations mentioned'),
        locations: z.array(z.string()).optional().describe('Locations mentioned'),
        dates: z.array(z.string()).optional().describe('Important dates'),
        amounts: z.array(z.string()).optional().describe('Financial amounts or numbers'),
    }),
});

// Custom schema builder for user-defined extraction
export const createCustomSchema = (
    fields: Array<{
        name: string;
        type: 'string' | 'number' | 'boolean' | 'array' | 'object';
        description?: string;
        optional?: boolean;
    }>
) => {
    const schemaFields: Record<string, any> = {};

    fields.forEach((field) => {
        let zodType;
        switch (field.type) {
            case 'string':
                zodType = z.string();
                break;
            case 'number':
                zodType = z.number();
                break;
            case 'boolean':
                zodType = z.boolean();
                break;
            case 'array':
                zodType = z.array(z.string());
                break;
            case 'object':
                zodType = z.record(z.any());
                break;
            default:
                zodType = z.string();
        }

        if (field.description) {
            zodType = zodType.describe(field.description);
        }

        if (field.optional) {
            zodType = zodType.optional();
        }

        schemaFields[field.name] = zodType;
    });

    return z.object(schemaFields);
};

// Enhanced document type detection with confidence scoring
function getSchemaForDocument(text: string): {
    schema: z.ZodSchema;
    type: string;
    confidence: number;
} {
    const lowerText = text.toLowerCase();
    const documentTypes = [
        {
            type: 'invoice',
            schema: InvoiceSchema as z.ZodSchema,
            keywords: [
                'invoice',
                'bill',
                'receipt',
                'payment',
                'due date',
                'amount due',
                'tax',
                'subtotal',
            ],
            weight: [3, 3, 2, 1, 2, 2, 1, 1],
        },
        {
            type: 'resume',
            schema: ResumeSchema as z.ZodSchema,
            keywords: [
                'resume',
                'cv',
                'curriculum vitae',
                'experience',
                'education',
                'skills',
                'employment',
                'qualifications',
            ],
            weight: [3, 3, 3, 2, 2, 2, 1, 1],
        },
        {
            type: 'contract',
            schema: ContractSchema as z.ZodSchema,
            keywords: [
                'contract',
                'agreement',
                'terms',
                'conditions',
                'parties',
                'effective date',
                'termination',
                'obligations',
            ],
            weight: [3, 3, 2, 2, 1, 2, 1, 1],
        },
    ];

    let bestMatch = {
        type: 'document',
        schema: GenericDocumentSchema as z.ZodSchema,
        confidence: 0,
    };

    for (const docType of documentTypes) {
        let score = 0;
        let maxScore = 0;

        docType.keywords.forEach((keyword, index) => {
            const weight = docType.weight[index] || 1;
            maxScore += weight;
            if (lowerText.includes(keyword)) {
                score += weight;
            }
        });

        const confidence = maxScore > 0 ? score / maxScore : 0;

        if (confidence > bestMatch.confidence && confidence > 0.3) {
            // Minimum confidence threshold
            bestMatch = {
                type: docType.type,
                schema: docType.schema,
                confidence,
            };
        }
    }

    return bestMatch;
}

export const useStructuredExtraction = () => {
    const chatMode = useChatStore((state) => state.chatMode);
    const documentAttachment = useChatStore((state) => state.documentAttachment);
    const setStructuredData = useChatStore((state) => state.setStructuredData);
    const clearStructuredData = useChatStore((state) => state.clearStructuredData);
    const getAllKeys = useApiKeysStore((state) => state.getAllKeys());
    const { toast } = useToast();

    const extractTextFromPDF = async (file: File): Promise<string> => {
        try {
            // Initialize PDF.js dynamically
            const pdfjs = await initPdfJs();
            if (!pdfjs) {
                throw new Error('PDF.js not available');
            }

            const arrayBuffer = await file.arrayBuffer();
            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            const pdf = await loadingTask.promise;

            let fullText = '';

            // Extract text from all pages
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                const textItems = textContent.items.map((item: any) => item.str);
                fullText += textItems.join(' ') + '\n';
            }

            return fullText.trim();
        } catch (error) {
            log.error('PDF text extraction failed:', { data: error });
            throw new Error('Failed to extract text from PDF');
        }
    };

    const extractStructuredOutput = useCallback(
        async (customSchema?: z.ZodSchema) => {
            if (!isGeminiModel(chatMode)) {
                toast({
                    title: 'Not Available',
                    description:
                        'Structured output extraction is only available for Gemini models.',
                    variant: 'destructive',
                });
                return;
            }

            if (!documentAttachment?.file) {
                toast({
                    title: 'No Document',
                    description: 'Please upload a document first.',
                    variant: 'destructive',
                });
                return;
            }

            // Only support PDFs for now
            if (documentAttachment.file.type !== 'application/pdf') {
                toast({
                    title: 'Unsupported Format',
                    description: 'Structured extraction currently only supports PDF files.',
                    variant: 'destructive',
                });
                return;
            }

            try {
                // Show loading toast
                toast({
                    title: 'Extracting Data',
                    description: `Analyzing ${documentAttachment.fileName} for structured content...`,
                });

                // Extract text from PDF
                const documentText = await extractTextFromPDF(documentAttachment.file);

                if (!documentText.trim()) {
                    throw new Error('No text found in the PDF document');
                }

                // Use custom schema if provided, otherwise detect document type
                let schema: z.ZodSchema;
                let type: string;
                let confidence: number;

                if (customSchema) {
                    schema = customSchema;
                    type = 'custom';
                    confidence = 1.0;
                } else {
                    const detectedResult = getSchemaForDocument(documentText);
                    schema = detectedResult.schema;
                    type = detectedResult.type;
                    confidence = detectedResult.confidence;
                }

                // Use the predefined prompt for structured output extraction
                const basePrompt =
                    'Extract structured data from the document and return it in JSON format';

                // Get BYOK keys for API authentication
                const byokKeys = getAllKeys;

                // Get the correct Google provider instance with BYOK keys
                const googleProvider = getProviderInstance(Providers.GOOGLE, byokKeys);

                // Use AI SDK generateObject for structured extraction
                const { object } = await generateObject({
                    model: googleProvider(chatMode),
                    schema,
                    prompt: `${basePrompt}

Please extract structured data from the following ${type} document.
Be thorough and accurate, extracting all relevant information.
If any field is not present in the document, omit it or mark it as optional.
${customSchema ? 'Follow the provided custom schema structure exactly.' : ''}

Document content:
${documentText}`,
                });

                setStructuredData({
                    data: object,
                    type,
                    fileName: documentAttachment.fileName,
                    extractedAt: new Date().toISOString(),
                    confidence,
                });

                toast({
                    title: 'Extraction Complete',
                    description: `Successfully extracted ${type} data from ${documentAttachment.fileName}${
                        !customSchema && confidence < 0.8
                            ? ' (low confidence - manual review recommended)'
                            : ''
                    }`,
                });
            } catch (error) {
                log.error('Structured extraction failed:', { data: error });
                toast({
                    title: 'Extraction Failed',
                    description:
                        error instanceof Error
                            ? error.message
                            : 'Failed to extract structured data',
                    variant: 'destructive',
                });
            }
        },
        [chatMode, documentAttachment, setStructuredData, toast, getAllKeys]
    );

    return {
        extractStructuredOutput,
        clearStructuredData,
        createCustomSchema,
        isGeminiModel: isGeminiModel(chatMode),
        hasDocument: !!documentAttachment?.file,
        isPDF: documentAttachment?.file?.type === 'application/pdf',
    };
};
