# Streaming Cleanup Fix - Thread Details Issue

**Date**: 2025-01-29
**Issue**: Old conversation text continues streaming when starting new chat in same thread
**Status**: ✅ FIXED

## Update: Streaming Persistence Issue Fix

**Additional Issue Found**: Previous conversation responses were re-animating when new messages were sent in the same thread
**Status**: ✅ FIXED

## Problem Description

When users started a new chat conversation within an existing thread, the old conversation's streaming text would continue to display. This created a confusing user experience where multiple streaming responses appeared simultaneously.

### Root Cause

The issue was in the `handleSubmit` function in `packages/common/hooks/agent-provider.tsx`. When starting a new conversation:

1. A new `AbortController` was created immediately
2. `setIsGenerating(true)` was called for the new conversation
3. **But the existing streaming was never stopped**
4. This caused both old and new streaming to run concurrently

## Solution Implemented

### Code Changes

**File**: `packages/common/hooks/agent-provider.tsx`
**Function**: `handleSubmit` (lines 586-619)

Added proper cleanup at the beginning of `handleSubmit`:

```typescript
// Stop any existing generation before starting new conversation
// This prevents old streaming text from continuing when starting new chat
const { stopGeneration } = useChatStore.getState();
stopGeneration();

// Clean up any tracked active controllers
activeControllersRef.current.forEach(controller => {
    if (!controller.signal.aborted) {
        controller.abort();
    }
});
activeControllersRef.current.clear();
```

### What the Fix Does

1. **Calls `stopGeneration()`**: This function in the chat store:
    - Sets `isGenerating` to false
    - Clears generation start time and timeout indicator
    - Aborts the current `abortController`

2. **Cleans up active controllers**: Ensures all tracked abort controllers are properly aborted and cleared from the tracking set

3. **Prevents race conditions**: Ensures old streaming is completely stopped before new streaming begins

## Testing

Created comprehensive test suite in `apps/web/app/tests/streaming-cleanup.test.ts`:

- ✅ Verifies `stopGeneration()` properly resets all streaming state
- ✅ Confirms abort controllers are called correctly
- ✅ Tests multiple controller scenarios
- ✅ All tests passing

## Impact

- **User Experience**: No more confusing multiple streaming responses
- **Performance**: Prevents unnecessary resource usage from multiple concurrent streams
- **Reliability**: Ensures clean state transitions between conversations
- **Backward Compatible**: No breaking changes to existing functionality

## Technical Details

### Components Affected

- `packages/common/hooks/agent-provider.tsx` - Main fix location
- `packages/common/store/chat.store.ts` - `stopGeneration()` function used
- `packages/common/components/thread/components/premium-ai-response.tsx` - Displays streaming indicators
- `packages/common/components/thread/thread-item.tsx` - Individual thread items

### State Management

The fix leverages the existing `stopGeneration()` function which properly manages:

- `isGenerating` boolean state
- `abortController` cleanup
- `generationStartTime` reset
- `showTimeoutIndicator` reset

## Verification

To verify the fix works:

1. Start a chat conversation in a thread
2. While it's streaming, start a new conversation in the same thread
3. **Before fix**: Both conversations would stream simultaneously
4. **After fix**: Old streaming stops immediately, only new conversation streams

## Additional Fix: Streaming Persistence Issue

### Problem

After fixing the concurrent streaming issue, we discovered another related problem: completed conversation responses would re-animate when new messages were sent in the same thread.

### Root Cause

The `useAnimatedText` hook in `ThreadItem` was receiving `shouldAnimate = isLast && isGenerating`, which meant:

- When a new message was sent, `isGenerating` became `true` globally
- Completed thread items could briefly get `shouldAnimate = true` due to timing issues
- This triggered the animation to restart from the beginning

### Solution

**File**: `packages/common/components/thread/thread-item.tsx`
**Lines**: 40-50

Added status-aware animation logic:

```typescript
// Determine if this thread item should animate
// Only animate if it's the last item, currently generating, AND not already completed
const shouldAnimate =
    isLast && isGenerating && !['COMPLETED', 'ERROR', 'ABORTED'].includes(threadItem.status || '');

const { isAnimationComplete, text: animatedText } = useAnimatedText(
    threadItem.answer?.text || '',
    shouldAnimate
);
```

### Impact

- ✅ Completed responses remain static when new messages are sent
- ✅ Only current/new responses stream text
- ✅ No re-streaming of historical conversation content
- ✅ Thread history displays correctly without text animation replaying

## Future Considerations

This fix establishes a pattern for proper streaming cleanup that should be followed in any future streaming implementations. The key principles are:

1. **Always stop existing generation before starting new generation**
2. **Never animate completed thread items regardless of global state**
3. **Use thread item status to determine animation eligibility**

## Additional Fix: Incorrect ABORTED Status Display

### Problem

When entering new messages in existing threads, previous completed messages were incorrectly showing the ABORTED alert with "Generation stopped" text, even though they should have been marked as COMPLETED.

### Root Cause

The `stopGeneration()` function was calling `abortController?.abort()` without distinguishing between user-initiated aborts and cleanup aborts. This caused the abort event listener to mark all current thread items as "ABORTED" when starting new conversations.

### Solution

**Files**:

- `packages/common/hooks/agent-provider.tsx` (lines 267-294, 754-770)
- `packages/common/store/chat.store.ts` (line 1259)

Added abort reason differentiation:

```typescript
// In stopGeneration - use cleanup reason
state.abortController?.abort('cleanup');

// In abort event listeners - check reason
if (!abortController.signal.reason || abortController.signal.reason !== 'cleanup') {
    // Only mark as ABORTED for user-initiated aborts
    updateThreadItem(threadId, {
        id: threadItemId,
        status: 'ABORTED',
        error: 'Generation stopped',
    });
} else {
    // For cleanup aborts, mark as completed if there's content
    if (threadItem?.answer?.text) {
        updateThreadItem(threadId, {
            id: threadItemId,
            status: 'COMPLETED',
        });
    }
}
```

## Additional Fix: Screen Flashing Prevention

### Problem

The interface was experiencing visual flashing/flickering when new messages were added to existing threads due to unnecessary re-renders.

### Solution

**File**: `packages/common/components/thread/thread-combo.tsx`

Added better memoization for thread items:

```typescript
// Memoize current thread item to prevent unnecessary re-renders
const memoizedCurrentThreadItem = useMemo(() => {
    if (!currentThreadItem) return null;

    return (
        <div key={currentThreadItem.id} className="min-h-[calc(100dvh-16rem)]">
            <ThreadItem
                key={currentThreadItem.id}
                threadItem={currentThreadItem}
                isAnimated={true}
                isGenerating={isGenerating}
                isLast={true}
            />
        </div>
    );
}, [currentThreadItem, isGenerating]);
```

### Impact

- ✅ Previous completed messages maintain COMPLETED status
- ✅ No incorrect ABORTED alerts on completed messages
- ✅ Reduced screen flashing during thread updates
- ✅ Better performance through optimized re-rendering

## Future Considerations

This fix establishes a pattern for proper streaming cleanup that should be followed in any future streaming implementations. The key principles are:

1. **Always stop existing generation before starting new generation**
2. **Never animate completed thread items regardless of global state**
3. **Use thread item status to determine animation eligibility**
4. **Distinguish between user-initiated and cleanup aborts**
5. **Optimize component re-rendering to prevent visual flashing**

## Final Fix: Remaining Screen Flashing Prevention

### Problem

Despite previous fixes, there was still visual flashing/flickering when new messages were added to chat threads, particularly around the ABORTED status alert component.

### Root Cause

The remaining flashing was caused by:

1. Rapid status transitions during cleanup (GENERATING → ABORTED → COMPLETED)
2. The ABORTED alert briefly appearing and disappearing during these transitions
3. Insufficient debouncing of status changes in the UI

### Solution

**File**: `packages/common/components/thread/thread-item.tsx`

Added debounced status state and improved memoization:

```typescript
// Debounced status to prevent flashing during rapid status changes
const [debouncedStatus, setDebouncedStatus] = useState(threadItem.status);
const [debouncedError, setDebouncedError] = useState(threadItem.error);

useEffect(() => {
    // Add a small delay to prevent flashing during rapid status transitions
    const timer = setTimeout(() => {
        setDebouncedStatus(threadItem.status);
        setDebouncedError(threadItem.error);
    }, 50); // 50ms delay to smooth out rapid changes

    return () => clearTimeout(timer);
}, [threadItem.status, threadItem.error]);

// Use debounced values in alert
{debouncedStatus === "ABORTED" && debouncedError && (
    <Alert>
        <AlertDescription>
            <AlertCircle className="mt-0.5 size-3.5" />
            {debouncedError}
        </AlertDescription>
    </Alert>
)}
```

Also improved the memo comparison function:

```typescript
// Custom comparison function to prevent unnecessary re-renders and flashing
(prevProps, nextProps) => {
    return (
        prevProps.threadItem.id === nextProps.threadItem.id &&
        prevProps.threadItem.status === nextProps.threadItem.status &&
        prevProps.threadItem.error === nextProps.threadItem.error &&
        prevProps.threadItem.answer?.text === nextProps.threadItem.answer?.text &&
        prevProps.threadItem.updatedAt?.getTime() === nextProps.threadItem.updatedAt?.getTime() &&
        prevProps.isGenerating === nextProps.isGenerating &&
        prevProps.isLast === nextProps.isLast
    );
};
```

### Impact

- ✅ **Eliminated all visual flashing** when adding new messages to threads
- ✅ **Smooth status transitions** without rapid UI changes
- ✅ **Debounced alert display** prevents brief flashes of ABORTED alerts
- ✅ **Optimized re-rendering** through improved memoization
- ✅ **Professional user experience** with stable visual transitions

## Complete Solution Summary

All streaming and visual issues have been resolved:

1. **Concurrent Streaming**: Fixed cleanup in `handleSubmit` to stop existing generation
2. **Streaming Persistence**: Prevented completed items from re-animating
3. **Incorrect ABORTED Status**: Distinguished cleanup vs user-initiated aborts
4. **Screen Flashing**: Added debouncing and optimized re-rendering

The chat interface now provides a smooth, professional experience without any visual artifacts or incorrect status displays.
