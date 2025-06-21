import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThinkingLog } from '../components/thinking-log';
import { ThreadItem } from '@repo/shared/types';
import { ChatMode } from '@repo/shared/config';

// Mock the stores and hooks
vi.mock('@repo/common/store', () => ({
    useChatStore: vi.fn(selector => {
        return selector({
            thinkingMode: {
                enabled: true,
                includeThoughts: true,
                budget: 10000,
            },
        });
    }),
}));

vi.mock('@repo/common/hooks/use-subscription-access', () => ({
    useFeatureAccess: vi.fn(() => true),
}));

vi.mock('../components/thread/components/markdown-content', () => ({
    MarkdownContent: ({ content }: { content: string }) => (
        <div data-testid="markdown-content">{content}</div>
    ),
}));

describe('ThinkingLog', () => {
    const createThreadItem = (overrides: Partial<ThreadItem> = {}): ThreadItem => ({
        id: 'test-id',
        threadId: 'test-thread',
        mode: ChatMode.GEMINI_2_5_PRO_PREVIEW,
        query: 'Test query',
        answer: { text: 'Test answer' },
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
        role: 'assistant',
        ...overrides,
    });

    it('should render reasoning log when reasoning data is available', () => {
        const threadItem = createThreadItem({
            reasoning: 'This is my reasoning process...',
        });

        render(<ThinkingLog threadItem={threadItem} />);

        expect(screen.getByText('AI Reasoning Process')).toBeInTheDocument();
        expect(screen.getByText('Show thoughts')).toBeInTheDocument();
    });

    it('should expand and show reasoning content when clicked', () => {
        const threadItem = createThreadItem({
            reasoning: '# Step-by-step reasoning\n\n1. First, I analyze...\n2. Then, I consider...',
        });

        render(<ThinkingLog threadItem={threadItem} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByText('Hide thoughts')).toBeInTheDocument();
        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should render reasoning details from AI SDK format', () => {
        const threadItem = createThreadItem({
            reasoningDetails: [
                {
                    type: 'text',
                    text: 'Let me think about this...',
                    signature: 'step-1',
                },
                {
                    type: 'redacted',
                    data: 'sensitive content',
                },
            ],
        });

        render(<ThinkingLog threadItem={threadItem} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
        expect(screen.getByText('🔒 Redacted:')).toBeInTheDocument();
    });

    it('should render reasoning parts from message parts', () => {
        const threadItem = createThreadItem({
            parts: [
                {
                    type: 'text',
                    text: 'Here is my response',
                },
                {
                    type: 'reasoning',
                    details: [
                        {
                            type: 'text',
                            text: 'My reasoning process...',
                        },
                    ],
                },
            ],
        });

        render(<ThinkingLog threadItem={threadItem} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
    });

    it('should not render when user lacks access', () => {
        const { rerender } = render(
            <ThinkingLog threadItem={createThreadItem({ reasoning: 'test' })} />
        );

        // Mock no access
        vi.mocked(
            require('@repo/common/hooks/use-subscription-access').useFeatureAccess
        ).mockReturnValue(false);

        rerender(<ThinkingLog threadItem={createThreadItem({ reasoning: 'test' })} />);

        expect(screen.queryByText('AI Reasoning Process')).not.toBeInTheDocument();
    });

    it('should not render when thinking mode is disabled', () => {
        // Mock disabled thinking mode
        vi.mocked(require('@repo/common/store').useChatStore).mockImplementation(selector => {
            return selector({
                thinkingMode: {
                    enabled: false,
                    includeThoughts: true,
                    budget: 10000,
                },
            });
        });

        render(<ThinkingLog threadItem={createThreadItem({ reasoning: 'test' })} />);

        expect(screen.queryByText('AI Reasoning Process')).not.toBeInTheDocument();
    });

    it('should not render when no reasoning data is available', () => {
        render(<ThinkingLog threadItem={createThreadItem()} />);

        expect(screen.queryByText('AI Reasoning Process')).not.toBeInTheDocument();
    });
});
