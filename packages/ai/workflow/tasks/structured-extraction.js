var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { google } from "@ai-sdk/google";
import { log } from "@repo/shared/logger";
import { generateObject } from "ai";
import { z } from "zod";
// Common schemas for structured extraction
export var InvoiceSchema = z.object({
    invoiceNumber: z.string().describe("Invoice number or ID"),
    date: z.string().describe("Invoice date"),
    dueDate: z.string().optional().describe("Due date if present"),
    vendor: z.object({
        name: z.string().describe("Vendor/company name"),
        address: z.string().optional().describe("Vendor address"),
        email: z.string().optional().describe("Vendor email"),
        phone: z.string().optional().describe("Vendor phone number"),
    }),
    customer: z.object({
        name: z.string().describe("Customer name"),
        address: z.string().optional().describe("Customer address"),
        email: z.string().optional().describe("Customer email"),
    }),
    items: z.array(z.object({
        description: z.string().describe("Item description"),
        quantity: z.number().optional().describe("Quantity"),
        unitPrice: z.number().optional().describe("Unit price"),
        total: z.number().optional().describe("Line total"),
    })),
    totals: z.object({
        subtotal: z.number().optional().describe("Subtotal amount"),
        tax: z.number().optional().describe("Tax amount"),
        total: z.number().describe("Total amount"),
        currency: z.string().optional().describe("Currency symbol or code"),
    }),
});
export var ResumeSchema = z.object({
    personalInfo: z.object({
        name: z.string().describe("Full name"),
        email: z.string().optional().describe("Email address"),
        phone: z.string().optional().describe("Phone number"),
        location: z.string().optional().describe("Location/address"),
        linkedin: z.string().optional().describe("LinkedIn profile URL"),
        website: z.string().optional().describe("Personal website URL"),
    }),
    summary: z.string().optional().describe("Professional summary or objective"),
    experience: z.array(z.object({
        company: z.string().describe("Company name"),
        position: z.string().describe("Job title/position"),
        duration: z.string().describe("Employment duration"),
        description: z.string().optional().describe("Job description"),
        achievements: z.array(z.string()).optional().describe("Key achievements"),
    })),
    education: z.array(z.object({
        institution: z.string().describe("School/university name"),
        degree: z.string().describe("Degree type and field"),
        duration: z.string().optional().describe("Study period"),
        gpa: z.string().optional().describe("GPA if mentioned"),
    })),
    skills: z.array(z.string()).describe("List of skills"),
    certifications: z
        .array(z.object({
        name: z.string().describe("Certification name"),
        issuer: z.string().optional().describe("Issuing organization"),
        date: z.string().optional().describe("Date obtained"),
    }))
        .optional(),
});
export var ContractSchema = z.object({
    title: z.string().describe("Contract title or type"),
    parties: z.array(z.object({
        name: z.string().describe("Party name"),
        role: z.string().describe("Role in contract (e.g., client, contractor)"),
        address: z.string().optional().describe("Party address"),
    })),
    effectiveDate: z.string().optional().describe("Contract effective date"),
    expirationDate: z.string().optional().describe("Contract expiration date"),
    terms: z.object({
        paymentTerms: z.string().optional().describe("Payment terms and conditions"),
        deliverables: z.array(z.string()).optional().describe("List of deliverables"),
        timeline: z.string().optional().describe("Project timeline"),
        amount: z.string().optional().describe("Contract value/amount"),
    }),
    keyProvisions: z.array(z.string()).describe("Important contract provisions"),
});
export var GenericDocumentSchema = z.object({
    documentType: z.string().describe("Type of document (e.g., letter, report, form)"),
    title: z.string().optional().describe("Document title"),
    date: z.string().optional().describe("Document date"),
    author: z.string().optional().describe("Document author"),
    summary: z.string().describe("Brief summary of the document content"),
    keyPoints: z.array(z.string()).describe("Main points or topics covered"),
    entities: z.object({
        people: z.array(z.string()).optional().describe("People mentioned"),
        organizations: z.array(z.string()).optional().describe("Organizations mentioned"),
        locations: z.array(z.string()).optional().describe("Locations mentioned"),
        dates: z.array(z.string()).optional().describe("Important dates"),
        amounts: z.array(z.string()).optional().describe("Financial amounts or numbers"),
    }),
});
// Helper to detect document type and select appropriate schema
export function getSchemaForDocument(text) {
    var lowerText = text.toLowerCase();
    if (lowerText.includes("invoice") ||
        lowerText.includes("bill") ||
        lowerText.includes("receipt")) {
        return { schema: InvoiceSchema, type: "invoice" };
    }
    if (lowerText.includes("resume") ||
        lowerText.includes("cv") ||
        lowerText.includes("curriculum vitae")) {
        return { schema: ResumeSchema, type: "resume" };
    }
    if (lowerText.includes("contract") ||
        lowerText.includes("agreement") ||
        lowerText.includes("terms")) {
        return { schema: ContractSchema, type: "contract" };
    }
    return { schema: GenericDocumentSchema, type: "document" };
}
export function extractStructuredData(documentText_1) {
    return __awaiter(this, arguments, void 0, function (documentText, model) {
        var _a, schema, type, result, error_1;
        if (model === void 0) { model = "gemini-2.0-flash"; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = getSchemaForDocument(documentText), schema = _a.schema, type = _a.type;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateObject({
                            model: google(model),
                            schema: schema,
                            prompt: "Please extract structured data from the following ".concat(type, ".\n            Be thorough and accurate, extracting all relevant information.\n            If any field is not present in the document, omit it or mark it as optional.\n\n            Document content:\n            ").concat(documentText),
                        })];
                case 2:
                    result = _b.sent();
                    return [2 /*return*/, {
                            success: true,
                            data: result.object,
                            type: type,
                            schema: schema._def,
                        }];
                case 3:
                    error_1 = _b.sent();
                    log.error("Structured extraction failed:", { data: error_1 });
                    return [2 /*return*/, {
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : "Unknown error",
                            type: type,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
