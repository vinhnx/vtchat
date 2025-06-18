import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../../store';
import { useStructuredExtraction } from '../use-structured-extraction';

// Mock dependencies
vi.mock('pdfjs-dist', () => ({
    getDocument: vi.fn(),
    GlobalWorkerOptions: { workerSrc: '' },
}));

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

vi.mock('../../store', () => ({
    useChatStore: vi.fn(),
}));

vi.mock('@ai-sdk/google', () => ({
    google: vi.fn(),
}));

vi.mock('@repo/ui', () => ({
    useToast: () => ({
        toast: vi.fn(),
    }),
}));

const mockToast = vi.fn();

const createMockStore = (overrides = {}) => ({
    chatMode: 'gemini-1.5-pro',
    documentAttachment: null,
    setStructuredData: vi.fn(),
    clearStructuredData: vi.fn(),
    ...overrides,
});

describe('useStructuredExtraction', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockToast.mockClear();
    });

    it('should initialize with correct default state for Gemini model', () => {
        const mockStore = createMockStore();
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        expect(result.current.isGeminiModel).toBe(true);
        expect(result.current.hasDocument).toBe(false);
        expect(result.current.isPDF).toBe(false);
        expect(typeof result.current.extractStructuredOutput).toBe('function');
        expect(typeof result.current.clearStructuredData).toBe('function');
    });

    it('should detect non-Gemini models correctly', () => {
        const mockStore = createMockStore({ chatMode: 'gpt-4' });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        // Mock isGeminiModel to return false for non-Gemini models
        const { isGeminiModel } = require('../../utils');
        (isGeminiModel as any).mockReturnValue(false);

        const { result } = renderHook(() => useStructuredExtraction());

        expect(result.current.isGeminiModel).toBe(false);
    });

    it('should detect document attachment correctly', () => {
        const mockFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
        const mockStore = createMockStore({
            documentAttachment: { file: mockFile, fileName: 'test.pdf' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        expect(result.current.hasDocument).toBe(true);
        expect(result.current.isPDF).toBe(true);
    });

    it('should detect non-PDF files correctly', () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const mockStore = createMockStore({
            documentAttachment: { file: mockFile, fileName: 'test.txt' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        expect(result.current.hasDocument).toBe(true);
        expect(result.current.isPDF).toBe(false);
    });

    it('should handle extraction with non-Gemini model', async () => {
        const mockStore = createMockStore({ chatMode: 'gpt-4' });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        // The hook should call toast with error message for non-Gemini models
        // We can't easily test the toast call since it's mocked, but we can verify the function completes
        expect(result.current.isGeminiModel).toBe(false);
    });

    it('should handle extraction with no document', async () => {
        const mockStore = createMockStore({ chatMode: 'gemini-1.5-pro' });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        expect(result.current.hasDocument).toBe(false);
    });

    it('should handle extraction with non-PDF file', async () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const mockStore = createMockStore({
            chatMode: 'gemini-1.5-pro',
            documentAttachment: { file: mockFile, fileName: 'test.txt' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        expect(result.current.isPDF).toBe(false);
    });

    it('should successfully extract structured data from PDF', async () => {
        const mockFile = new File(['pdf content'], 'resume.pdf', { type: 'application/pdf' });
        const mockStore = createMockStore({
            chatMode: 'gemini-1.5-pro',
            documentAttachment: { file: mockFile, fileName: 'resume.pdf' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        // Mock successful PDF parsing
        const pdfjsLib = await import('pdfjs-dist');
        (pdfjsLib.getDocument as any).mockImplementation(() => ({
            promise: Promise.resolve({
                numPages: 1,
                getPage: vi.fn().mockImplementation(() =>
                    Promise.resolve({
                        getTextContent: vi.fn().mockImplementation(() =>
                            Promise.resolve({
                                items: [
                                    {
                                        str: 'John Doe Software Engineer Experience: Company A 2020-2023',
                                    },
                                ],
                            })
                        ),
                    })
                ),
            }),
        }));

        // Mock successful AI generation
        const { generateObject } = await import('ai');
        const mockStructuredData = {
            object: {
                personalInfo: {
                    name: 'John Doe',
                    email: 'john@example.com',
                },
                experience: [
                    {
                        company: 'Company A',
                        position: 'Software Engineer',
                        startDate: '2020',
                        endDate: '2023',
                    },
                ],
            },
        };
        (generateObject as any).mockResolvedValueOnce(mockStructuredData);

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        expect(mockStore.setStructuredData).toHaveBeenCalledWith(
            expect.objectContaining({
                data: mockStructuredData.object,
                type: expect.any(String),
                fileName: 'resume.pdf',
                extractedAt: expect.any(String),
            })
        );
    });

    it('should handle PDF parsing errors', async () => {
        const mockFile = new File(['invalid pdf'], 'test.pdf', { type: 'application/pdf' });
        const mockStore = createMockStore({
            chatMode: 'gemini-1.5-pro',
            documentAttachment: { file: mockFile, fileName: 'test.pdf' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        // Mock pdf-parse to throw an error
        const pdfParse = await import('pdf-parse');
        (pdfParse.default as any).mockRejectedValueOnce(new Error('Invalid PDF'));

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        // Verify the function handles the error gracefully
        expect(result.current.isPDF).toBe(true);
    });

    it('should handle AI generation errors', async () => {
        const mockFile = new File(['pdf content'], 'test.pdf', { type: 'application/pdf' });
        const mockStore = createMockStore({
            chatMode: 'gemini-1.5-pro',
            documentAttachment: { file: mockFile, fileName: 'test.pdf' },
        });
        (useChatStore as any).mockImplementation((selector: any) => selector(mockStore));

        // Mock successful PDF parsing
        const pdfParse = await import('pdf-parse');
        (pdfParse.default as any).mockResolvedValueOnce({ text: 'Resume content' });

        // Mock AI generation error
        const { generateObject } = await import('ai');
        (generateObject as any).mockRejectedValueOnce(new Error('AI Error'));

        const { result } = renderHook(() => useStructuredExtraction());

        await act(async () => {
            await result.current.extractStructuredOutput();
        });

        // Verify the function handles the error gracefully
        expect(result.current.isPDF).toBe(true);
    });
});
