import { z } from "zod";
export declare const InvoiceSchema: z.ZodObject<{
    invoiceNumber: z.ZodString;
    date: z.ZodString;
    dueDate: z.ZodOptional<z.ZodString>;
    vendor: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    }>;
    customer: z.ZodObject<{
        name: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
    }, {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodOptional<z.ZodNumber>;
        unitPrice: z.ZodOptional<z.ZodNumber>;
        total: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        total?: number | undefined;
    }, {
        description: string;
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        total?: number | undefined;
    }>, "many">;
    totals: z.ZodObject<{
        subtotal: z.ZodOptional<z.ZodNumber>;
        tax: z.ZodOptional<z.ZodNumber>;
        total: z.ZodNumber;
        currency: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        total: number;
        subtotal?: number | undefined;
        tax?: number | undefined;
        currency?: string | undefined;
    }, {
        total: number;
        subtotal?: number | undefined;
        tax?: number | undefined;
        currency?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    date: string;
    invoiceNumber: string;
    vendor: {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    };
    customer: {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
    };
    items: {
        description: string;
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        total?: number | undefined;
    }[];
    totals: {
        total: number;
        subtotal?: number | undefined;
        tax?: number | undefined;
        currency?: string | undefined;
    };
    dueDate?: string | undefined;
}, {
    date: string;
    invoiceNumber: string;
    vendor: {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
        phone?: string | undefined;
    };
    customer: {
        name: string;
        email?: string | undefined;
        address?: string | undefined;
    };
    items: {
        description: string;
        quantity?: number | undefined;
        unitPrice?: number | undefined;
        total?: number | undefined;
    }[];
    totals: {
        total: number;
        subtotal?: number | undefined;
        tax?: number | undefined;
        currency?: string | undefined;
    };
    dueDate?: string | undefined;
}>;
export declare const ResumeSchema: z.ZodObject<{
    personalInfo: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        linkedin: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        location?: string | undefined;
        linkedin?: string | undefined;
        website?: string | undefined;
    }, {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        location?: string | undefined;
        linkedin?: string | undefined;
        website?: string | undefined;
    }>;
    summary: z.ZodOptional<z.ZodString>;
    experience: z.ZodArray<z.ZodObject<{
        company: z.ZodString;
        position: z.ZodString;
        duration: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        achievements: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        duration: string;
        company: string;
        position: string;
        description?: string | undefined;
        achievements?: string[] | undefined;
    }, {
        duration: string;
        company: string;
        position: string;
        description?: string | undefined;
        achievements?: string[] | undefined;
    }>, "many">;
    education: z.ZodArray<z.ZodObject<{
        institution: z.ZodString;
        degree: z.ZodString;
        duration: z.ZodOptional<z.ZodString>;
        gpa: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        institution: string;
        degree: string;
        duration?: string | undefined;
        gpa?: string | undefined;
    }, {
        institution: string;
        degree: string;
        duration?: string | undefined;
        gpa?: string | undefined;
    }>, "many">;
    skills: z.ZodArray<z.ZodString, "many">;
    certifications: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        issuer: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        date?: string | undefined;
        issuer?: string | undefined;
    }, {
        name: string;
        date?: string | undefined;
        issuer?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    personalInfo: {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        location?: string | undefined;
        linkedin?: string | undefined;
        website?: string | undefined;
    };
    experience: {
        duration: string;
        company: string;
        position: string;
        description?: string | undefined;
        achievements?: string[] | undefined;
    }[];
    education: {
        institution: string;
        degree: string;
        duration?: string | undefined;
        gpa?: string | undefined;
    }[];
    skills: string[];
    summary?: string | undefined;
    certifications?: {
        name: string;
        date?: string | undefined;
        issuer?: string | undefined;
    }[] | undefined;
}, {
    personalInfo: {
        name: string;
        email?: string | undefined;
        phone?: string | undefined;
        location?: string | undefined;
        linkedin?: string | undefined;
        website?: string | undefined;
    };
    experience: {
        duration: string;
        company: string;
        position: string;
        description?: string | undefined;
        achievements?: string[] | undefined;
    }[];
    education: {
        institution: string;
        degree: string;
        duration?: string | undefined;
        gpa?: string | undefined;
    }[];
    skills: string[];
    summary?: string | undefined;
    certifications?: {
        name: string;
        date?: string | undefined;
        issuer?: string | undefined;
    }[] | undefined;
}>;
export declare const ContractSchema: z.ZodObject<{
    title: z.ZodString;
    parties: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        role: z.ZodString;
        address: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        role: string;
        address?: string | undefined;
    }, {
        name: string;
        role: string;
        address?: string | undefined;
    }>, "many">;
    effectiveDate: z.ZodOptional<z.ZodString>;
    expirationDate: z.ZodOptional<z.ZodString>;
    terms: z.ZodObject<{
        paymentTerms: z.ZodOptional<z.ZodString>;
        deliverables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        timeline: z.ZodOptional<z.ZodString>;
        amount: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        paymentTerms?: string | undefined;
        deliverables?: string[] | undefined;
        timeline?: string | undefined;
        amount?: string | undefined;
    }, {
        paymentTerms?: string | undefined;
        deliverables?: string[] | undefined;
        timeline?: string | undefined;
        amount?: string | undefined;
    }>;
    keyProvisions: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    title: string;
    parties: {
        name: string;
        role: string;
        address?: string | undefined;
    }[];
    terms: {
        paymentTerms?: string | undefined;
        deliverables?: string[] | undefined;
        timeline?: string | undefined;
        amount?: string | undefined;
    };
    keyProvisions: string[];
    effectiveDate?: string | undefined;
    expirationDate?: string | undefined;
}, {
    title: string;
    parties: {
        name: string;
        role: string;
        address?: string | undefined;
    }[];
    terms: {
        paymentTerms?: string | undefined;
        deliverables?: string[] | undefined;
        timeline?: string | undefined;
        amount?: string | undefined;
    };
    keyProvisions: string[];
    effectiveDate?: string | undefined;
    expirationDate?: string | undefined;
}>;
export declare const GenericDocumentSchema: z.ZodObject<{
    documentType: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    summary: z.ZodString;
    keyPoints: z.ZodArray<z.ZodString, "many">;
    entities: z.ZodObject<{
        people: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        organizations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        locations: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        dates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        amounts: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        people?: string[] | undefined;
        organizations?: string[] | undefined;
        locations?: string[] | undefined;
        dates?: string[] | undefined;
        amounts?: string[] | undefined;
    }, {
        people?: string[] | undefined;
        organizations?: string[] | undefined;
        locations?: string[] | undefined;
        dates?: string[] | undefined;
        amounts?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    documentType: string;
    keyPoints: string[];
    entities: {
        people?: string[] | undefined;
        organizations?: string[] | undefined;
        locations?: string[] | undefined;
        dates?: string[] | undefined;
        amounts?: string[] | undefined;
    };
    title?: string | undefined;
    date?: string | undefined;
    author?: string | undefined;
}, {
    summary: string;
    documentType: string;
    keyPoints: string[];
    entities: {
        people?: string[] | undefined;
        organizations?: string[] | undefined;
        locations?: string[] | undefined;
        dates?: string[] | undefined;
        amounts?: string[] | undefined;
    };
    title?: string | undefined;
    date?: string | undefined;
    author?: string | undefined;
}>;
export declare function getSchemaForDocument(text: string): {
    schema: z.ZodSchema;
    type: string;
};
export declare function extractStructuredData(documentText: string, model?: string): Promise<{
    success: boolean;
    data: any;
    type: string;
    schema: z.ZodTypeDef;
    error?: undefined;
} | {
    success: boolean;
    error: string;
    type: string;
    data?: undefined;
    schema?: undefined;
}>;
//# sourceMappingURL=structured-extraction.d.ts.map