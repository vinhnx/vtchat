import { useContextualFeedback } from '@repo/common/hooks';
import { ContextualNotification, ContextualStatus, CopyButton } from '@repo/ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock navigator.clipboard
const mockClipboard = {
    writeText: vi.fn(() => Promise.resolve()),
};

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
    motion: {
        div: 'div',
        span: 'span',
    },
    AnimatePresence: ({ children }: any) => children,
}));

Object.assign(navigator, {
    clipboard: mockClipboard,
});

// Test component using contextual feedback hook
function TestContextualFeedback() {
    const { status, message, executeAction } = useContextualFeedback();

    return (
        <div>
            <button
                onClick={() => {
                    executeAction(
                        async () => {
                            await new Promise(resolve => setTimeout(resolve, 100));
                        },
                        { successMessage: 'Action completed!' },
                    );
                }}
                data-testid='action-button'
            >
                Execute Action
            </button>
            <ContextualNotification
                show={status !== 'idle'}
                variant={status === 'success' ? 'success' : 'error'}
            >
                {message}
            </ContextualNotification>
        </div>
    );
}

describe('Contextual Notifications', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('ContextualNotification Component', () => {
        it('should render notification when show is true', () => {
            render(
                <ContextualNotification show={true} variant='success'>
                    Success message
                </ContextualNotification>,
            );

            expect(screen.getByText('Success message')).toBeInTheDocument();
        });

        it('should not render notification when show is false', () => {
            render(
                <ContextualNotification show={false} variant='success'>
                    Success message
                </ContextualNotification>,
            );

            expect(screen.queryByText('Success message')).not.toBeInTheDocument();
        });

        it('should apply correct variant styles', () => {
            const { rerender } = render(
                <ContextualNotification show={true} variant='success'>
                    Success
                </ContextualNotification>,
            );

            let notification = screen.getByText('Success').closest('span');
            expect(notification).toHaveClass('text-green-700');

            rerender(
                <ContextualNotification show={true} variant='error'>
                    Error
                </ContextualNotification>,
            );

            notification = screen.getByText('Error').closest('span');
            expect(notification).toHaveClass('text-red-700');
        });
    });

    describe('CopyButton Component', () => {
        it('should copy text to clipboard and show success state', async () => {
            render(
                <CopyButton text='Test text to copy' data-testid='copy-button' />,
            );

            const copyButton = screen.getByTestId('copy-button');
            fireEvent.click(copyButton);

            await waitFor(() => {
                expect(mockClipboard.writeText).toHaveBeenCalledWith('Test text to copy');
            });

            // Should show success state
            await waitFor(() => {
                expect(screen.getByText('Copied')).toBeInTheDocument();
            });
        });

        it('should handle copy failures gracefully', async () => {
            mockClipboard.writeText.mockRejectedValueOnce(new Error('Copy failed'));

            render(
                <CopyButton text='Test text' data-testid='copy-button' />,
            );

            const copyButton = screen.getByTestId('copy-button');
            fireEvent.click(copyButton);

            await waitFor(() => {
                expect(screen.getByText('Failed')).toBeInTheDocument();
            });
        });

        it('should reset to idle state after success duration', async () => {
            render(
                <CopyButton text='Test text' resetDelay={200} data-testid='copy-button' />,
            );

            const copyButton = screen.getByTestId('copy-button');
            fireEvent.click(copyButton);

            // Should show success first
            await waitFor(() => {
                expect(screen.getByText('Copied')).toBeInTheDocument();
            });

            // Should reset to idle after delay
            await waitFor(
                () => {
                    expect(screen.getByText('Copy')).toBeInTheDocument();
                },
                { timeout: 500 },
            );
        });
    });

    describe('ContextualStatus Component', () => {
        it('should render different status variants correctly', () => {
            const { rerender } = render(
                <ContextualStatus status='loading' message='Loading...' />,
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();

            rerender(
                <ContextualStatus status='success' message='Completed!' />,
            );

            expect(screen.getByText('Completed!')).toBeInTheDocument();

            rerender(
                <ContextualStatus status='error' message='Failed!' />,
            );

            expect(screen.getByText('Failed!')).toBeInTheDocument();
        });

        it('should show icons by default', () => {
            render(
                <ContextualStatus status='success' message='Success' />,
            );

            // Check for icon presence (SVG element)
            const container = screen.getByText('Success').closest('div');
            expect(container?.querySelector('svg')).toBeInTheDocument();
        });

        it('should hide icons when showIcon is false', () => {
            render(
                <ContextualStatus
                    status='success'
                    message='Success'
                    showIcon={false}
                />,
            );

            const container = screen.getByText('Success').closest('div');
            expect(container?.querySelector('svg')).not.toBeInTheDocument();
        });
    });

    describe('useContextualFeedback Hook', () => {
        it('should execute actions and provide status feedback', async () => {
            render(<TestContextualFeedback />);

            const actionButton = screen.getByTestId('action-button');
            fireEvent.click(actionButton);

            // Should complete successfully
            await waitFor(() => {
                expect(screen.getByText('Action completed!')).toBeInTheDocument();
            });
        });
    });
});

describe('Integration with Existing Components', () => {
    it('should replace toast notifications without breaking functionality', () => {
        // Test that contextual notifications can be used as drop-in replacements
        // for toast notifications in existing components

        const TestComponent = () => {
            const [showNotification, setShowNotification] = React.useState(false);

            return (
                <div>
                    <button
                        onClick={() => setShowNotification(true)}
                        data-testid='trigger-button'
                    >
                        Trigger Action
                    </button>
                    <ContextualNotification
                        show={showNotification}
                        variant='success'
                        onHide={() => setShowNotification(false)}
                    >
                        Action successful - no toast popup!
                    </ContextualNotification>
                </div>
            );
        };

        render(<TestComponent />);

        const triggerButton = screen.getByTestId('trigger-button');
        fireEvent.click(triggerButton);

        // Should show contextual notification instead of toast
        expect(screen.getByText('Action successful - no toast popup!')).toBeInTheDocument();
    });
});
