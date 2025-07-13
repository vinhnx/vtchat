import { getProviderInstance, Providers } from "@repo/ai/providers";
import { isGeminiModel } from "@repo/common/utils";
import { log } from "@repo/shared/logger";
import { generateObject } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkVTPlusAccess } from "../../subscription/access-control";

// Move schemas to a shared location or keep them here
const getDocumentSchemas = () => ({
    email: z.object({
        subject: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        date: z.string().optional(),
        body: z.string(),
        attachments: z.array(z.string()).optional(),
    }),
    invoice: z.object({
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
    resume: z.object({
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
    contract: z.object({
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
    "markdown-document": z.object({
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
    document: z.object({
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
});

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { textContent, documentType, fileName, chatMode, userApiKeys } = body;

        // Validate required fields
        if (!textContent || !documentType || !chatMode) {
            return NextResponse.json(
                { error: "Missing required fields: textContent, documentType, chatMode" },
                { status: 400 },
            );
        }

        // Validate that it's a Gemini model
        if (!isGeminiModel(chatMode)) {
            return NextResponse.json(
                { error: "Structured extraction only supports Gemini models" },
                { status: 400 },
            );
        }

        // Check if user has VT+ access
        const { hasAccess: hasVtPlusAccess } = await checkVTPlusAccess(request);

        // For VT+ users, use system API key; for others, use their provided keys
        let effectiveApiKeys = userApiKeys || {};
        if (hasVtPlusAccess && !effectiveApiKeys.GEMINI_API_KEY) {
            if (!process.env.GEMINI_API_KEY) {
                return NextResponse.json(
                    { error: "System Gemini API key not configured" },
                    { status: 500 },
                );
            }
            effectiveApiKeys = {
                ...effectiveApiKeys,
                GEMINI_API_KEY: process.env.GEMINI_API_KEY,
            };
        }

        // Get the document schema
        const schemas = getDocumentSchemas();
        const schema = schemas[documentType as keyof typeof schemas];
        if (!schema) {
            return NextResponse.json(
                { error: `Unsupported document type: ${documentType}` },
                { status: 400 },
            );
        }

        // Get the Google provider instance
        const googleProvider = getProviderInstance(Providers.GOOGLE, effectiveApiKeys);

        // Generate structured output using AI SDK
        const { object } = await generateObject({
            model: googleProvider(chatMode),
            schema,
            prompt: `You are an expert document analyzer. Extract structured data from the following ${documentType} document.
                
Be thorough and accurate in your extraction. Follow these guidelines:
- Extract all relevant information that matches the schema
- For optional fields, include them if the information is available
- For dates, try to standardize the format
- For amounts, include currency information when available
- If information is not present, omit the field rather than guessing
- Be precise and factual in your extraction

Document content:
${textContent}`,
        });

        // Return the structured data
        return NextResponse.json({
            data: object,
            type: documentType,
            fileName: fileName || "unknown",
            extractedAt: new Date().toISOString(),
            confidence: 0.9,
        });
    } catch (error) {
        log.error("Structured extraction failed:", { error });
        return NextResponse.json(
            {
                error: "Failed to extract structured data",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
