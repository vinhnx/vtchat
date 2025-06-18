import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useStructuredExtraction } from '../../../hooks/use-structured-extraction';
import { StructuredOutputButton } from '../structured-output-button';

// Mock the hook
vi.mock('../../../hooks/use-structured-extraction');

const mockUseStructuredExtraction = {
    extractStructuredOutput: vi.fn(),
    clearStructuredData: vi.fn(),
    isGeminiModel: true,
    hasDocument: true,
    isPDF: true,
};

describe('StructuredOutputButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useStructuredExtraction as any).mockReturnValue(mockUseStructuredExtraction);
    });

    it('should render button when all conditions are met', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        expect(button).toBeDefined();
        expect(button.getAttribute('title')).toBe('Extract structured data from document');
    });

    it('should not render when not Gemini model', () => {
        (useStructuredExtraction as any).mockReturnValue({
            ...mockUseStructuredExtraction,
            isGeminiModel: false,
        });

        const { container } = render(<StructuredOutputButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render when no document', () => {
        (useStructuredExtraction as any).mockReturnValue({
            ...mockUseStructuredExtraction,
            hasDocument: false,
        });

        const { container } = render(<StructuredOutputButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should not render when document is not PDF', () => {
        (useStructuredExtraction as any).mockReturnValue({
            ...mockUseStructuredExtraction,
            isPDF: false,
        });

        const { container } = render(<StructuredOutputButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should call extractStructuredOutput when clicked', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockUseStructuredExtraction.extractStructuredOutput).toHaveBeenCalledTimes(1);
    });

    it('should display correct icon and styling', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        expect(button.className).toContain('hover:bg-gray-100');

        // Check for icon presence (FileTextIcon)
        const icon = button.querySelector('svg');
        expect(icon).toBeDefined();
    });
});
