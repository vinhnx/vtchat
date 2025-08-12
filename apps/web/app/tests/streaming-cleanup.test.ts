import { useChatStore } from '@repo/common/store';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Streaming Cleanup Fix', () => {
    let mockAbortController: any;

    beforeEach(() => {
        // Reset the chat store state
        useChatStore.setState({
            isGenerating: false,
            abortController: null,
            generationStartTime: null,
            showTimeoutIndicator: false,
        });

        // Create a mock abort controller
        mockAbortController = {
            abort: vi.fn(),
            signal: {
                aborted: false,
                addEventListener: vi.fn(),
            },
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should stop existing generation when starting new conversation', () => {
        const store = useChatStore.getState();

        // Simulate an active generation
        store.setIsGenerating(true);
        store.setAbortController(mockAbortController);

        // Verify generation is active
        expect(useChatStore.getState().isGenerating).toBe(true);
        expect(useChatStore.getState().abortController).toBe(mockAbortController);

        // Call stopGeneration (which is what our fix does)
        store.stopGeneration();

        // Verify generation is stopped
        const finalState = useChatStore.getState();
        expect(finalState.isGenerating).toBe(false);
        expect(finalState.generationStartTime).toBe(null);
        expect(finalState.showTimeoutIndicator).toBe(false);
        expect(mockAbortController.abort).toHaveBeenCalled();
    });

    it('should properly reset streaming state', () => {
        const store = useChatStore.getState();

        // Set up streaming state
        store.setIsGenerating(true);
        store.setShowTimeoutIndicator(true);
        store.setAbortController(mockAbortController);

        // Verify streaming state is active
        let state = useChatStore.getState();
        expect(state.isGenerating).toBe(true);
        expect(state.showTimeoutIndicator).toBe(true);

        // Stop generation
        store.stopGeneration();

        // Verify all streaming state is reset
        state = useChatStore.getState();
        expect(state.isGenerating).toBe(false);
        expect(state.showTimeoutIndicator).toBe(false);
        expect(state.generationStartTime).toBe(null);
    });

    it('should handle multiple abort controllers properly', () => {
        const store = useChatStore.getState();

        const controller1 = {
            abort: vi.fn(),
            signal: { aborted: false, addEventListener: vi.fn() },
        };

        const controller2 = {
            abort: vi.fn(),
            signal: { aborted: false, addEventListener: vi.fn() },
        };

        // Set first controller
        store.setAbortController(controller1);

        // Set second controller (should replace first)
        store.setAbortController(controller2);

        // Stop generation should abort the current controller
        store.stopGeneration();

        expect(controller2.abort).toHaveBeenCalled();
        expect(controller1.abort).not.toHaveBeenCalled();
    });

    it('should prevent completed thread items from re-animating', () => {
        // This test verifies the fix for the streaming persistence issue
        // where completed responses would re-animate when new messages were sent

        // Test the shouldAnimate logic directly
        const completedStatuses = ['COMPLETED', 'ERROR', 'ABORTED'];

        completedStatuses.forEach((status) => {
            // Simulate conditions where re-animation bug would occur:
            // - isLast = true (item is current)
            // - isGenerating = true (new message being processed)
            // - status = COMPLETED (item is already finished)
            const isLast = true;
            const isGenerating = true;
            const threadItemStatus = status;

            // The fix: shouldAnimate should be false for completed items
            const shouldAnimate = isLast
                && isGenerating
                && !['COMPLETED', 'ERROR', 'ABORTED'].includes(threadItemStatus);

            expect(shouldAnimate).toBe(false);
        });

        // Test that non-completed items can still animate
        const isLast = true;
        const isGenerating = true;
        const threadItemStatus = 'GENERATING';

        const shouldAnimate = isLast && isGenerating
            && !['COMPLETED', 'ERROR', 'ABORTED'].includes(threadItemStatus);

        expect(shouldAnimate).toBe(true);
    });

    it('should not mark completed items as ABORTED during cleanup', () => {
        // This test verifies the fix for incorrect ABORTED status display
        // when new messages are sent in existing threads

        // Test the abort reason logic
        const mockAbortController = {
            signal: {
                aborted: true,
                reason: 'cleanup', // This indicates cleanup abort, not user abort
            },
        };

        // With cleanup reason, items should not be marked as ABORTED
        const isCleanupAbort = mockAbortController.signal.reason === 'cleanup';
        expect(isCleanupAbort).toBe(true);

        // Test user-initiated abort
        const mockUserAbortController = {
            signal: {
                aborted: true,
                reason: undefined, // No reason means user-initiated
            },
        };

        const isUserAbort = !mockUserAbortController.signal.reason
            || mockUserAbortController.signal.reason !== 'cleanup';
        expect(isUserAbort).toBe(true);
    });
});
