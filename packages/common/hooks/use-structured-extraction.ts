import { google } from '@ai-sdk/google';
import { useToast } from '@repo/ui';
import { generateObject } from 'ai';
import { useCallback } from 'react';
import { z } from 'zod';
import { useChatStore } from '../store';
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

// Helper to detect document type and select appropriate schema
function getSchemaForDocument(text: string): { schema: z.ZodSchema; type: string } {
    const lowerText = text.toLowerCase();

    if (
        lowerText.includes('invoice') ||
        lowerText.includes('bill') ||
        lowerText.includes('receipt')
    ) {
        return { schema: InvoiceSchema, type: 'invoice' };
    }

    if (
        lowerText.includes('resume') ||
        lowerText.includes('cv') ||
        lowerText.includes('curriculum vitae')
    ) {
        return { schema: ResumeSchema, type: 'resume' };
    }

    if (
        lowerText.includes('contract') ||
        lowerText.includes('agreement') ||
        lowerText.includes('terms')
    ) {
        return { schema: ContractSchema, type: 'contract' };
    }

    return { schema: GenericDocumentSchema, type: 'document' };
}

export const useStructuredExtraction = () => {
    const chatMode = useChatStore(state => state.chatMode);
    const documentAttachment = useChatStore(state => state.documentAttachment);
    const setStructuredData = useChatStore(state => state.setStructuredData);
    const clearStructuredData = useChatStore(state => state.clearStructuredData);
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
            console.error('PDF text extraction failed:', error);
            throw new Error('Failed to extract text from PDF');
        }
    };

    const extractStructuredOutput = useCallback(async () => {
        if (!isGeminiModel(chatMode)) {
            toast({
                title: 'Not Available',
                description: 'Structured output extraction is only available for Gemini models.',
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

            // Detect document type and get appropriate schema
            const { schema, type } = getSchemaForDocument(documentText);

            // Use AI SDK generateObject for structured extraction
            const { object } = await generateObject({
                model: google(chatMode),
                schema,
                prompt: `Please extract structured data from the following ${type} document.
                Be thorough and accurate, extracting all relevant information.
                If any field is not present in the document, omit it or mark it as optional.

                Document content:
                ${documentText}`,
            });

            setStructuredData({
                data: object,
                type,
                fileName: documentAttachment.fileName,
                extractedAt: new Date().toISOString(),
            });

            toast({
                title: 'Extraction Complete',
                description: `Successfully extracted ${type} data from ${documentAttachment.fileName}`,
            });
        } catch (error) {
            console.error('Structured extraction failed:', error);
            toast({
                title: 'Extraction Failed',
                description:
                    error instanceof Error ? error.message : 'Failed to extract structured data',
                variant: 'destructive',
            });
        }
    }, [chatMode, documentAttachment, setStructuredData, toast]);

    return {
        extractStructuredOutput,
        clearStructuredData,
        isGeminiModel: isGeminiModel(chatMode),
        hasDocument: !!documentAttachment?.file,
        isPDF: documentAttachment?.file?.type === 'application/pdf',
    };
};
