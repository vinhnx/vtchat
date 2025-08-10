/**
 * Enhanced error handling for PDF document processing with Gemini
 */
export interface PDFProcessingError {
    type: "PDF_NO_PAGES" | "PDF_FORMAT_ERROR" | "PDF_SIZE_ERROR" | "PDF_CORRUPTED" | "API_ERROR" | "UNKNOWN_ERROR";
    message: string;
    userMessage: string;
    suggestion: string;
    retryable: boolean;
}
/**
 * Analyzes PDF processing errors and provides user-friendly messages
 */
export declare function handlePDFProcessingError(error: any): PDFProcessingError;
/**
 * Validates PDF file before processing
 */
export declare function validatePDFFile(file: File): {
    valid: boolean;
    error?: PDFProcessingError;
};
/**
 * Checks if a PDF processing error is retryable
 */
export declare function shouldRetryPDFProcessing(error: PDFProcessingError): boolean;
/**
 * Gets user-friendly error message for display
 */
export declare function getPDFErrorDisplayMessage(error: PDFProcessingError): {
    title: string;
    description: string;
    action?: string;
};
//# sourceMappingURL=pdf-error-handler.d.ts.map