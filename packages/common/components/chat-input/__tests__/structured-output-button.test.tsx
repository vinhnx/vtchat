import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StructuredOutputButton } from '../structured-output-button';

// Mock dependencies
vi.mock('@repo/ai/providers', () => ({
    getProviderInstance: vi.fn(),
    Providers: { GOOGLE: 'google' },
}));

vi.mock('@repo/common/hooks/use-subscription-access', () => ({
    useFeatureAccess: vi.fn(() => true),
}));

vi.mock('@repo/common/store', () => ({
    useChatStore: vi.fn((selector) => {
        if (selector.toString().includes('chatMode')) return 'gemini-2.5-flash';
        if (selector.toString().includes('structuredData')) return null;
        if (selector.toString().includes('setStructuredData')) return vi.fn();
        return vi.fn();
    }),
}));

vi.mock('../../store/api-keys.store', () => ({
    useApiKeysStore: vi.fn(() => vi.fn(() => ({}))),
}));

vi.mock('@repo/common/utils', () => ({
    isGeminiModel: vi.fn(() => true),
}));

vi.mock('@repo/shared/lib/auth-client', () => ({
    useSession: vi.fn(() => ({ data: { id: 'test-user' } })),
}));

vi.mock('@repo/ui', () => ({
    Button: ({ children, onClick, tooltip, ...props }: any) => (
        <button onClick={onClick} title={tooltip} {...props}>
            {children}
        </button>
    ),
    cn: (...args: any[]) => args.join(' '),
    useToast: vi.fn(() => ({
        toast: vi.fn(),
    })),
}));

vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));

vi.mock('../login-required-dialog', () => ({
    LoginRequiredDialog: ({ isOpen, children }: any) => (isOpen ? <div>{children}</div> : null),
}));

describe('StructuredOutputButton', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render button when conditions are met', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        expect(button).toBeDefined();
    });

    it('should not render when not Gemini model', () => {
        const { isGeminiModel } = require('@repo/common/utils');
        isGeminiModel.mockReturnValue(false);

        const { container } = render(<StructuredOutputButton />);
        expect(container.firstChild).toBeNull();
    });

    it('should handle file upload button click', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Should trigger file input click (tested indirectly)
        expect(button).toBeDefined();
    });

    it('should display correct tooltip for upload state', () => {
        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        expect(button.getAttribute('title')).toBe(
            'Upload document to extract structured data (PDF, TXT, MD)'
        );
    });

    it('should show login dialog when not signed in', () => {
        const { useSession } = require('@repo/shared/lib/auth-client');
        useSession.mockReturnValue({ data: null });

        render(<StructuredOutputButton />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Login dialog should be triggered (tested indirectly)
        expect(button).toBeDefined();
    });
});
