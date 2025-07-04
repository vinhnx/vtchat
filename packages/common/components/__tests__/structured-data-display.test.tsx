import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatStore } from '../../store';
import { StructuredDataDisplay } from '../structured-data-display';

// Mock the store
vi.mock('../../store', () => ({
    useChatStore: vi.fn(),
}));

const mockStructuredData = {
    data: {
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
    type: 'resume',
    fileName: 'resume.pdf',
    extractedAt: '2024-01-01T00:00:00.000Z',
};

const mockClearStructuredData = vi.fn();

describe('StructuredDataDisplay', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.assign(global, {
            URL: {
                createObjectURL: vi.fn(() => 'blob:mock-url'),
                revokeObjectURL: vi.fn(),
            },
            document: {
                ...global.document,
                createElement: vi.fn(() => ({
                    href: '',
                    download: '',
                    click: vi.fn(),
                    style: { display: '' },
                })),
                body: {
                    appendChild: vi.fn(),
                    removeChild: vi.fn(),
                },
            },
        });
    });

    it('should not render when no structured data', () => {
        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: null,
                clearStructuredData: mockClearStructuredData,
            })
        );

        const { container } = render(<StructuredDataDisplay />);
        expect(container.firstChild).toBeNull();
    });

    it('should render structured data display', () => {
        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: mockStructuredData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        render(<StructuredDataDisplay />);

        expect(screen.getByText('Structured Data Extracted')).toBeDefined();
        expect(screen.getByText('resume.pdf')).toBeDefined();
        expect(screen.getByText('resume')).toBeDefined();
    });

    it('should call clearStructuredData when close button is clicked', () => {
        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: mockStructuredData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        render(<StructuredDataDisplay />);

        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(mockClearStructuredData).toHaveBeenCalledTimes(1);
    });

    it('should trigger download when download button is clicked', () => {
        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: mockStructuredData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        const mockAnchor = {
            href: '',
            download: '',
            click: vi.fn(),
            style: { display: '' },
        };

        const createElementSpy = vi
            .spyOn(document, 'createElement')
            .mockReturnValue(mockAnchor as any);
        const appendChildSpy = vi
            .spyOn(document.body, 'appendChild')
            .mockImplementation(() => mockAnchor as any);
        const removeChildSpy = vi
            .spyOn(document.body, 'removeChild')
            .mockImplementation(() => mockAnchor as any);

        render(<StructuredDataDisplay />);

        const downloadButton = screen.getByRole('button', { name: /download/i });
        fireEvent.click(downloadButton);

        expect(mockAnchor.click).toHaveBeenCalledTimes(1);
        expect(mockAnchor.download).toBe('resume.pdf-structured-data.json');

        // Cleanup spies
        createElementSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    it('should display formatted JSON data', () => {
        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: mockStructuredData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        render(<StructuredDataDisplay />);

        const preElement = screen.getByRole('textbox');
        expect(preElement).toBeDefined();

        // Check that JSON is formatted
        const jsonContent = preElement.textContent || '';
        expect(jsonContent).toContain('"personalInfo"');
        expect(jsonContent).toContain('"name": "John Doe"');
        expect(jsonContent).toContain('"experience"');
    });

    it('should handle different document types', () => {
        const invoiceData = {
            ...mockStructuredData,
            type: 'invoice',
            fileName: 'invoice.pdf',
        };

        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: invoiceData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        render(<StructuredDataDisplay />);

        expect(screen.getByText('invoice.pdf')).toBeDefined();
        expect(screen.getByText('invoice')).toBeDefined();
    });

    it('should handle empty or missing data gracefully', () => {
        const emptyData = {
            ...mockStructuredData,
            data: {},
        };

        (useChatStore as any).mockImplementation((selector: any) =>
            selector({
                structuredData: emptyData,
                clearStructuredData: mockClearStructuredData,
            })
        );

        render(<StructuredDataDisplay />);

        expect(screen.getByText('Structured Data Extracted')).toBeDefined();

        const preElement = screen.getByRole('textbox');
        expect(preElement.textContent).toBe('{}');
    });
});
