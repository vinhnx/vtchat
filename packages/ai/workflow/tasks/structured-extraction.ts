import { google } from '@ai-sdk/google';
import { log } from '@repo/shared/logger';
import { generateObject } from 'ai';
import { z } from 'zod';

// Common schemas for structured extraction
export const InvoiceSchema = z.object({
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

export const ResumeSchema = z.object({
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
            duration: z.string().describe('Employment duration'),
            description: z.string().optional().describe('Job description'),
            achievements: z.array(z.string()).optional().describe('Key achievements'),
        })
    ),
    education: z.array(
        z.object({
            institution: z.string().describe('School/university name'),
            degree: z.string().describe('Degree type and field'),
            duration: z.string().optional().describe('Study period'),
            gpa: z.string().optional().describe('GPA if mentioned'),
        })
    ),
    skills: z.array(z.string()).describe('List of skills'),
    certifications: z
        .array(
            z.object({
                name: z.string().describe('Certification name'),
                issuer: z.string().optional().describe('Issuing organization'),
                date: z.string().optional().describe('Date obtained'),
            })
        )
        .optional(),
});

export const ContractSchema = z.object({
    title: z.string().describe('Contract title or type'),
    parties: z.array(
        z.object({
            name: z.string().describe('Party name'),
            role: z.string().describe('Role in contract (e.g., client, contractor)'),
            address: z.string().optional().describe('Party address'),
        })
    ),
    effectiveDate: z.string().optional().describe('Contract effective date'),
    expirationDate: z.string().optional().describe('Contract expiration date'),
    terms: z.object({
        paymentTerms: z.string().optional().describe('Payment terms and conditions'),
        deliverables: z.array(z.string()).optional().describe('List of deliverables'),
        timeline: z.string().optional().describe('Project timeline'),
        amount: z.string().optional().describe('Contract value/amount'),
    }),
    keyProvisions: z.array(z.string()).describe('Important contract provisions'),
});

export const GenericDocumentSchema = z.object({
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
export function getSchemaForDocument(text: string): {
    schema: z.ZodSchema;
    type: string;
} {
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

export async function extractStructuredData(documentText: string, model = 'gemini-2.0-flash') {
    const { schema, type } = getSchemaForDocument(documentText);

    try {
        const result = await generateObject({
            model: google(model),
            schema,
            prompt: `Please extract structured data from the following ${type}.
            Be thorough and accurate, extracting all relevant information.
            If any field is not present in the document, omit it or mark it as optional.

            Document content:
            ${documentText}`,
        });

        return {
            success: true,
            data: result.object,
            type,
            schema: schema._def,
        };
    } catch (error) {
        log.error('Structured extraction failed:', { data: error });
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            type,
        };
    }
}
