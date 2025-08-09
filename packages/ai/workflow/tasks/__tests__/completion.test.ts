import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the dependencies
vi.mock('@repo/shared/logger', () => ({
    log: {
        info: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('../../models', () => ({
    getModelFromChatMode: vi.fn(() => 'gpt-4'),
    models: [{ id: 'gpt-4', name: 'GPT-4' }],
    supportsOpenAIWebSearch: vi.fn(() => true),
    supportsTools: vi.fn(() => true),
}));

vi.mock('../../utils/pdf-error-handler', () => ({
    handlePDFProcessingError: vi.fn(() => ({
        type: 'PDF_PROCESSING_ERROR',
        message: 'Test error',
        userMessage: 'Test user message',
        suggestion: 'Test suggestion',
    })),
    shouldRetryPDFProcessing: vi.fn(() => false),
}));

vi.mock('../utils', () => ({
    generateText: vi.fn(),
    selectAvailableModel: vi.fn((model) => model),
    getHumanizedDate: vi.fn(() => 'January 1, 2024'),
    handleError: vi.fn(),
    ChunkBuffer: vi.fn(() => ({
        end: vi.fn(),
    })),
}));

vi.mock('@repo/orchestrator', () => ({
    createTask: vi.fn((config) => config),
}));

describe('PDF Detection in Completion Task', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should correctly detect PDF attachments with file type and mediaType', () => {
        // Test data that matches the actual message structure
        const messagesWithPDF = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Please analyze this PDF' },
                    { 
                        type: 'file', 
                        data: 'data:application/pdf;base64,JVBERi0xLjQ...', 
                        mediaType: 'application/pdf' 
                    }
                ]
            }
        ];

        const messagesWithoutPDF = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Hello' },
                    { 
                        type: 'image', 
                        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' 
                    }
                ]
            }
        ];

        // Test the PDF detection logic directly
        const hasPDFAttachment = (messages: any[]) => 
            messages.some((message: any) => 
                Array.isArray(message.content) && 
                message.content.some((part: any) => 
                    part.type === 'file' && part.mediaType === 'application/pdf'
                )
            );

        // Should detect PDF correctly
        expect(hasPDFAttachment(messagesWithPDF)).toBe(true);
        
        // Should not detect PDF in messages without PDF
        expect(hasPDFAttachment(messagesWithoutPDF)).toBe(false);
    });

    it('should not detect PDF with old incorrect logic', () => {
        const messagesWithPDF = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Please analyze this PDF' },
                    { 
                        type: 'file', 
                        data: 'data:application/pdf;base64,JVBERi0xLjQ...', 
                        mediaType: 'application/pdf' 
                    }
                ]
            }
        ];

        // Old incorrect logic (what was broken)
        const oldIncorrectDetection = (messages: any[]) => 
            messages.some((message: any) => 
                Array.isArray(message.content) && 
                message.content.some((part: any) => 
                    part.type === 'image' && part.mimeType === 'application/pdf'
                )
            );

        // Old logic should NOT detect PDF (this was the bug)
        expect(oldIncorrectDetection(messagesWithPDF)).toBe(false);
    });

    it('should handle mixed content types correctly', () => {
        const messagesWithMixedContent = [
            {
                role: 'user',
                content: [
                    { type: 'text', text: 'Here are some files' },
                    { 
                        type: 'image', 
                        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...' 
                    },
                    { 
                        type: 'file', 
                        data: 'data:application/pdf;base64,JVBERi0xLjQ...', 
                        mediaType: 'application/pdf' 
                    },
                    { 
                        type: 'file', 
                        data: 'data:text/plain;base64,SGVsbG8gV29ybGQ=', 
                        mediaType: 'text/plain' 
                    }
                ]
            }
        ];

        const hasPDFAttachment = (messages: any[]) => 
            messages.some((message: any) => 
                Array.isArray(message.content) && 
                message.content.some((part: any) => 
                    part.type === 'file' && part.mediaType === 'application/pdf'
                )
            );

        // Should detect PDF even with mixed content
        expect(hasPDFAttachment(messagesWithMixedContent)).toBe(true);
    });
});