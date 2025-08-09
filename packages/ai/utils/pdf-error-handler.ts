/**
 * Enhanced error handling for PDF document processing with Gemini
 */

import { log } from "@repo/shared/logger";

export interface PDFProcessingError {
    type: 'PDF_NO_PAGES' | 'PDF_FORMAT_ERROR' | 'PDF_SIZE_ERROR' | 'PDF_CORRUPTED' | 'API_ERROR' | 'UNKNOWN_ERROR';
    message: string;
    userMessage: string;
    suggestion: string;
    retryable: boolean;
}

/**
 * Analyzes PDF processing errors and provides user-friendly messages
 */
export function handlePDFProcessingError(error: any): PDFProcessingError {
    const errorMessage = error?.message || String(error);
    
    log.error('PDF processing error', {
        message: errorMessage,
        stack: error?.stack,
        cause: error?.cause
    });

    // Handle specific Gemini PDF errors
    if (errorMessage.includes('document has no pages')) {
        return {
            type: 'PDF_NO_PAGES',
            message: errorMessage,
            userMessage: 'Unable to read the PDF document',
            suggestion: 'Please ensure the PDF file is not corrupted and contains readable content. Try uploading a different PDF file.',
            retryable: false
        };
    }

    if (errorMessage.includes('Unable to process input image')) {
        return {
            type: 'PDF_FORMAT_ERROR',
            message: errorMessage,
            userMessage: 'PDF format not supported',
            suggestion: 'This PDF format cannot be processed. Try converting the PDF to an image (PNG/JPG) or use a different PDF file with text content.',
            retryable: false
        };
    }

    if (errorMessage.includes('Request payload size exceeds')) {
        return {
            type: 'PDF_SIZE_ERROR',
            message: errorMessage,
            userMessage: 'PDF file is too large',
            suggestion: 'Please upload a smaller PDF file (under 10MB) or compress the PDF before uploading.',
            retryable: false
        };
    }

    if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        return {
            type: 'API_ERROR',
            message: errorMessage,
            userMessage: 'API configuration error',
            suggestion: 'Please check your Gemini API key in Settings > API Keys, or try again later.',
            retryable: true
        };
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        return {
            type: 'API_ERROR',
            message: errorMessage,
            userMessage: 'Rate limit exceeded',
            suggestion: 'Please wait a moment and try again, or check your API quota.',
            retryable: true
        };
    }

    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
        return {
            type: 'API_ERROR',
            message: errorMessage,
            userMessage: 'Network error',
            suggestion: 'Please check your internet connection and try again.',
            retryable: true
        };
    }

    // Generic error
    return {
        type: 'UNKNOWN_ERROR',
        message: errorMessage,
        userMessage: 'Failed to process PDF document',
        suggestion: 'Please try again with a different PDF file, or contact support if the issue persists.',
        retryable: true
    };
}

/**
 * Validates PDF file before processing
 */
export function validatePDFFile(file: File): { valid: boolean; error?: PDFProcessingError } {
    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: {
                type: 'PDF_SIZE_ERROR',
                message: `File size ${file.size} exceeds maximum ${maxSize}`,
                userMessage: 'PDF file is too large',
                suggestion: 'Please upload a PDF file smaller than 10MB.',
                retryable: false
            }
        };
    }

    // Check MIME type
    if (file.type !== 'application/pdf') {
        return {
            valid: false,
            error: {
                type: 'PDF_FORMAT_ERROR',
                message: `Invalid MIME type: ${file.type}`,
                userMessage: 'Invalid file type',
                suggestion: 'Please upload a PDF file (.pdf extension).',
                retryable: false
            }
        };
    }

    // Check file name extension
    if (!file.name.toLowerCase().endsWith('.pdf')) {
        return {
            valid: false,
            error: {
                type: 'PDF_FORMAT_ERROR',
                message: `Invalid file extension: ${file.name}`,
                userMessage: 'Invalid file extension',
                suggestion: 'Please upload a file with .pdf extension.',
                retryable: false
            }
        };
    }

    return { valid: true };
}

/**
 * Checks if a PDF processing error is retryable
 */
export function shouldRetryPDFProcessing(error: PDFProcessingError): boolean {
    return error.retryable && ['API_ERROR'].includes(error.type);
}

/**
 * Gets user-friendly error message for display
 */
export function getPDFErrorDisplayMessage(error: PDFProcessingError): {
    title: string;
    description: string;
    action?: string;
} {
    switch (error.type) {
        case 'PDF_NO_PAGES':
            return {
                title: 'Cannot read PDF',
                description: error.userMessage,
                action: 'Try a different PDF file'
            };
        
        case 'PDF_FORMAT_ERROR':
            return {
                title: 'Unsupported PDF format',
                description: error.userMessage,
                action: 'Convert to image or try different PDF'
            };
        
        case 'PDF_SIZE_ERROR':
            return {
                title: 'File too large',
                description: error.userMessage,
                action: 'Upload smaller file (under 10MB)'
            };
        
        case 'API_ERROR':
            return {
                title: 'Service temporarily unavailable',
                description: error.userMessage,
                action: error.retryable ? 'Try again' : 'Check API settings'
            };
        
        default:
            return {
                title: 'PDF processing failed',
                description: error.userMessage,
                action: 'Try again or use different file'
            };
    }
}
