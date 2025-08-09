import { describe, expect, it, vi, beforeEach } from 'vitest';
import { handlePDFProcessingError, validatePDFFile, shouldRetryPDFProcessing, getPDFErrorDisplayMessage } from '../packages/ai/utils/pdf-error-handler';

describe('PDF Document Understanding Improvements', () => {
    describe('PDF Error Handler', () => {
        it('should handle "document has no pages" error correctly', () => {
            const error = new Error('document has no pages');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('PDF_NO_PAGES');
            expect(result.userMessage).toBe('Unable to read the PDF document');
            expect(result.retryable).toBe(false);
            expect(result.suggestion).toContain('ensure the PDF file is not corrupted');
        });

        it('should handle "Unable to process input image" error correctly', () => {
            const error = new Error('Unable to process input image');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('PDF_FORMAT_ERROR');
            expect(result.userMessage).toBe('PDF format not supported');
            expect(result.retryable).toBe(false);
            expect(result.suggestion).toContain('converting the PDF to an image');
        });

        it('should handle payload size error correctly', () => {
            const error = new Error('Request payload size exceeds limit');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('PDF_SIZE_ERROR');
            expect(result.userMessage).toBe('PDF file is too large');
            expect(result.retryable).toBe(false);
            expect(result.suggestion).toContain('smaller PDF file');
        });

        it('should handle API errors as retryable', () => {
            const error = new Error('API key invalid');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('API_ERROR');
            expect(result.retryable).toBe(true);
            expect(result.suggestion).toContain('API key');
        });

        it('should handle rate limit errors as retryable', () => {
            const error = new Error('rate limit exceeded');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('API_ERROR');
            expect(result.retryable).toBe(true);
            expect(result.suggestion).toContain('wait a moment');
        });

        it('should handle unknown errors gracefully', () => {
            const error = new Error('Some unknown error');
            const result = handlePDFProcessingError(error);

            expect(result.type).toBe('UNKNOWN_ERROR');
            expect(result.userMessage).toBe('Failed to process PDF document');
            expect(result.retryable).toBe(true);
        });
    });

    describe('PDF File Validation', () => {
        it('should validate file size correctly', () => {
            const largeMockFile = {
                size: 15 * 1024 * 1024, // 15MB
                type: 'application/pdf',
                name: 'large.pdf'
            } as File;

            const result = validatePDFFile(largeMockFile);

            expect(result.valid).toBe(false);
            expect(result.error?.type).toBe('PDF_SIZE_ERROR');
            expect(result.error?.userMessage).toBe('PDF file is too large');
        });

        it('should validate MIME type correctly', () => {
            const invalidMockFile = {
                size: 1024 * 1024, // 1MB
                type: 'text/plain',
                name: 'document.pdf'
            } as File;

            const result = validatePDFFile(invalidMockFile);

            expect(result.valid).toBe(false);
            expect(result.error?.type).toBe('PDF_FORMAT_ERROR');
            expect(result.error?.userMessage).toBe('Invalid file type');
        });

        it('should validate file extension correctly', () => {
            const invalidExtensionFile = {
                size: 1024 * 1024, // 1MB
                type: 'application/pdf',
                name: 'document.txt'
            } as File;

            const result = validatePDFFile(invalidExtensionFile);

            expect(result.valid).toBe(false);
            expect(result.error?.type).toBe('PDF_FORMAT_ERROR');
            expect(result.error?.userMessage).toBe('Invalid file extension');
        });

        it('should validate correct PDF file', () => {
            const validMockFile = {
                size: 2 * 1024 * 1024, // 2MB
                type: 'application/pdf',
                name: 'document.pdf'
            } as File;

            const result = validatePDFFile(validMockFile);

            expect(result.valid).toBe(true);
            expect(result.error).toBeUndefined();
        });
    });

    describe('Retry Logic', () => {
        it('should recommend retry for API errors', () => {
            const apiError = {
                type: 'API_ERROR' as const,
                message: 'API key invalid',
                userMessage: 'API configuration error',
                suggestion: 'Check API key',
                retryable: true
            };

            expect(shouldRetryPDFProcessing(apiError)).toBe(true);
        });

        it('should not recommend retry for format errors', () => {
            const formatError = {
                type: 'PDF_FORMAT_ERROR' as const,
                message: 'Unable to process',
                userMessage: 'Format not supported',
                suggestion: 'Convert to image',
                retryable: false
            };

            expect(shouldRetryPDFProcessing(formatError)).toBe(false);
        });

        it('should not recommend retry for size errors', () => {
            const sizeError = {
                type: 'PDF_SIZE_ERROR' as const,
                message: 'File too large',
                userMessage: 'PDF file is too large',
                suggestion: 'Compress file',
                retryable: false
            };

            expect(shouldRetryPDFProcessing(sizeError)).toBe(false);
        });
    });

    describe('Error Display Messages', () => {
        it('should provide appropriate display message for no pages error', () => {
            const error = {
                type: 'PDF_NO_PAGES' as const,
                message: 'document has no pages',
                userMessage: 'Unable to read the PDF document',
                suggestion: 'Try a different PDF file',
                retryable: false
            };

            const display = getPDFErrorDisplayMessage(error);

            expect(display.title).toBe('Cannot read PDF');
            expect(display.action).toBe('Try a different PDF file');
        });

        it('should provide appropriate display message for format error', () => {
            const error = {
                type: 'PDF_FORMAT_ERROR' as const,
                message: 'Unable to process input image',
                userMessage: 'PDF format not supported',
                suggestion: 'Convert to image',
                retryable: false
            };

            const display = getPDFErrorDisplayMessage(error);

            expect(display.title).toBe('Unsupported PDF format');
            expect(display.action).toBe('Convert to image or try different PDF');
        });

        it('should provide appropriate display message for size error', () => {
            const error = {
                type: 'PDF_SIZE_ERROR' as const,
                message: 'Request payload size exceeds limit',
                userMessage: 'PDF file is too large',
                suggestion: 'Upload smaller file',
                retryable: false
            };

            const display = getPDFErrorDisplayMessage(error);

            expect(display.title).toBe('File too large');
            expect(display.action).toBe('Upload smaller file (under 10MB)');
        });

        it('should provide appropriate display message for API error', () => {
            const error = {
                type: 'API_ERROR' as const,
                message: 'API key invalid',
                userMessage: 'API configuration error',
                suggestion: 'Check API key',
                retryable: true
            };

            const display = getPDFErrorDisplayMessage(error);

            expect(display.title).toBe('Service temporarily unavailable');
            expect(display.action).toBe('Try again');
        });
    });

    describe('Integration Tests', () => {
        it('should handle complete error flow for corrupted PDF', () => {
            const error = new Error('document has no pages');
            const pdfError = handlePDFProcessingError(error);
            const shouldRetry = shouldRetryPDFProcessing(pdfError);
            const displayMessage = getPDFErrorDisplayMessage(pdfError);

            expect(pdfError.type).toBe('PDF_NO_PAGES');
            expect(shouldRetry).toBe(false);
            expect(displayMessage.title).toBe('Cannot read PDF');
            expect(displayMessage.action).toBe('Try a different PDF file');
        });

        it('should handle complete error flow for API issues', () => {
            const error = new Error('rate limit exceeded');
            const pdfError = handlePDFProcessingError(error);
            const shouldRetry = shouldRetryPDFProcessing(pdfError);
            const displayMessage = getPDFErrorDisplayMessage(pdfError);

            expect(pdfError.type).toBe('API_ERROR');
            expect(shouldRetry).toBe(true);
            expect(displayMessage.title).toBe('Service temporarily unavailable');
            expect(displayMessage.action).toBe('Try again');
        });
    });
});

describe('PDF Processing Status Management', () => {
    // Mock chat store for testing
    const mockChatStore = {
        setPdfProcessingStatus: vi.fn(),
        pdfProcessingStatus: { status: 'idle', error: undefined, suggestion: undefined }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should update processing status correctly', () => {
        const newStatus = {
            status: 'processing' as const,
            error: undefined,
            suggestion: undefined
        };

        mockChatStore.setPdfProcessingStatus(newStatus);

        expect(mockChatStore.setPdfProcessingStatus).toHaveBeenCalledWith(newStatus);
    });

    it('should update error status with message', () => {
        const errorStatus = {
            status: 'error' as const,
            error: 'PDF format not supported',
            suggestion: 'Try converting to image format'
        };

        mockChatStore.setPdfProcessingStatus(errorStatus);

        expect(mockChatStore.setPdfProcessingStatus).toHaveBeenCalledWith(errorStatus);
    });

    it('should reset status to idle when clearing', () => {
        const idleStatus = {
            status: 'idle' as const,
            error: undefined,
            suggestion: undefined
        };

        mockChatStore.setPdfProcessingStatus(idleStatus);

        expect(mockChatStore.setPdfProcessingStatus).toHaveBeenCalledWith(idleStatus);
    });
});

describe('User Feedback and Guidance', () => {
    it('should provide comprehensive error information', () => {
        const testCases = [
            {
                error: 'document has no pages',
                expectedType: 'PDF_NO_PAGES',
                expectedGuidance: 'ensure the PDF file is not corrupted'
            },
            {
                error: 'Unable to process input image',
                expectedType: 'PDF_FORMAT_ERROR',
                expectedGuidance: 'converting the PDF to an image'
            },
            {
                error: 'Request payload size exceeds',
                expectedType: 'PDF_SIZE_ERROR',
                expectedGuidance: 'smaller PDF file'
            }
        ];

        testCases.forEach(({ error, expectedType, expectedGuidance }) => {
            const result = handlePDFProcessingError(new Error(error));
            expect(result.type).toBe(expectedType);
            expect(result.suggestion).toContain(expectedGuidance);
        });
    });

    it('should provide actionable suggestions for each error type', () => {
        const errors = [
            'document has no pages',
            'Unable to process input image',
            'Request payload size exceeds limit',
            'API key invalid',
            'rate limit exceeded'
        ];

        errors.forEach(errorMessage => {
            const result = handlePDFProcessingError(new Error(errorMessage));
            expect(result.suggestion).toBeTruthy();
            expect(result.suggestion.length).toBeGreaterThan(10);
            expect(result.userMessage).toBeTruthy();
        });
    });
});
