import { ChatMode } from '@repo/shared/config';
import type { ThreadItem } from '@repo/shared/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AIMessage } from '../ai-message';

enum TestContent {
    Sample = '**bold** text',
}

const threadItem: ThreadItem = {
    id: '1',
    threadId: 'thread',
    query: '',
    createdAt: new Date(0),
    updatedAt: new Date(0),
    mode: ChatMode.Deep,
};

describe('AIMessage', () => {
    it('renders markdown content', () => {
        render(
            <AIMessage content={TestContent.Sample} threadItem={threadItem} />,
        );
        const strong = screen.getByText('bold');
        expect(strong.tagName).toBe('STRONG');
    });
});
