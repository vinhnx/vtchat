# React Effects Analysis & Optimization Guide

## Key Principles from React Documentation

Based on the React documentation "You Might Not Need an Effect", here are the core principles:

### When NOT to Use Effects

1. **Don't use Effects to transform data for rendering** - Calculate during render instead
2. **Don't use Effects to handle user events** - Use event handlers instead
3. **Don't use Effects for derived state** - Calculate from existing props/state during render
4. **Don't use Effects to reset state on prop changes** - Use the `key` prop instead

### When TO Use Effects

Effects should only be used for **synchronizing with external systems**:

- Network requests
- Browser APIs (DOM manipulation, timers)
- Third-party libraries
- Subscriptions and cleanup

## Codebase Analysis

### ✅ Good Effect Usage

#### 1. Service Worker Management (`use-service-worker.ts`)

```typescript
useEffect(() => {
    if (!isSupported || !swManager) {
        setIsLoading(false);
        return;
    }
    // ... service worker initialization
}, []);
```

**✅ Correct**: Synchronizing with external system (Service Worker API)

#### 2. Event Source Connection (`useEventSource.ts`)

```typescript
useEffect(() => {
    if (!isManuallyClosedRef.current) {
        open();
    }
    return () => {
        close();
    };
}, []);
```

**✅ Correct**: Managing external connection lifecycle

#### 3. Media Query Listener (`use-mobile.ts`)

```typescript
React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
}, []);
```

**✅ Correct**: Synchronizing with browser API (matchMedia)

### ⚠️ Questionable Effect Usage

#### 1. RAG Onboarding Hook (`use-rag-onboarding.ts`)

```typescript
// CURRENT - Potentially unnecessary
const [showOnboarding, setShowOnboarding] = useState(false);
const hasApiKeys = Object.keys(apiKeys).some(/*...*/);

useEffect(() => {
    if (!hasApiKeys) {
        setShowOnboarding(true);
    }
}, [hasApiKeys]);
```

**🔧 IMPROVED - Derived state**:

```typescript
export function useRagOnboarding() {
    const { getAllKeys } = useApiKeysStore();
    const apiKeys = getAllKeys();

    // Calculate derived state during render
    const hasApiKeys = Object.keys(apiKeys).some(
        key => key === API_KEY_NAMES.GOOGLE || key === API_KEY_NAMES.OPENAI
    );

    // Derive showOnboarding directly from hasApiKeys
    const showOnboarding = !hasApiKeys;

    return {
        showOnboarding,
        hasApiKeys,
        completeOnboarding: () => {}, // Could be handled by parent
        skipOnboarding: () => {}, // Could be handled by parent
    };
}
```

#### 2. Thread Item Status Debouncing (`thread-item.tsx`)

```typescript
// CURRENT - Potentially unnecessary
const [_debouncedStatus, setDebouncedStatus] = useState(threadItem.status);
const [_debouncedError, setDebouncedError] = useState(threadItem.error);

useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedStatus(threadItem.status);
        setDebouncedError(threadItem.error);
    }, 50);
    return () => clearTimeout(timer);
}, [threadItem.status, threadItem.error]);
```

**🔧 IMPROVED - Custom hook with useMemo**:

```typescript
function useDebounced<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// In component:
const debouncedStatus = useDebounced(threadItem.status, 50);
const debouncedError = useDebounced(threadItem.error, 50);
```

#### 3. PWA Banner Auto-dismiss (`pwa-manager.tsx`)

```typescript
// CURRENT - Complex effect logic
useEffect(() => {
    if (
        isSupported &&
        !isInstalled &&
        (deferredPrompt || isIOS) &&
        isHomepage &&
        !bannerDismissed
    ) {
        setShowBanner(true);

        const timer = setTimeout(() => {
            setShowBanner(false);
            setBannerDismissed(true);
        }, 4000);

        return () => clearTimeout(timer);
    } else {
        setShowBanner(false);
    }
}, [isSupported, isInstalled, deferredPrompt, isIOS, isHomepage, bannerDismissed]);
```

**🔧 IMPROVED - Separate concerns**:

```typescript
// Derive banner visibility
const shouldShowBanner =
    isSupported && !isInstalled && (deferredPrompt || isIOS) && isHomepage && !bannerDismissed;

// Separate effect for auto-dismiss timer
useEffect(() => {
    if (!shouldShowBanner) return;

    const timer = setTimeout(() => {
        setBannerDismissed(true);
    }, 4000);

    return () => clearTimeout(timer);
}, [shouldShowBanner]);

// Use derived state for showBanner
const showBanner = shouldShowBanner;
```

### 🚨 Problematic Effect Usage

#### 1. Chat Store Initialization

The chat store has complex initialization logic that could be simplified by moving more logic to derived state and reducing effect dependencies.

#### 2. Multiple Effects in Thread Item

The `ThreadItem` component has several effects that could be optimized:

- Source extraction could be derived state
- Error toast logic could be moved to event handlers
- View tracking could use a custom hook

## Optimization Recommendations

### 1. Convert Derived State

- Replace effects that update state based on props/state with calculated values
- Use `useMemo` for expensive calculations
- Remove unnecessary state variables

### 2. Consolidate Effects

- Combine related effects where possible
- Extract complex effect logic into custom hooks
- Separate concerns (data fetching vs. UI updates)

### 3. Use Event Handlers

- Move user interaction logic from effects to event handlers
- Use callbacks for state updates triggered by user actions

### 4. Optimize Dependencies

- Minimize effect dependencies
- Use `useCallback` and `useMemo` to stabilize dependencies
- Consider using refs for values that don't need to trigger re-renders

## Implementation Priority

### High Priority

1. Fix `useRagOnboarding` hook - simple derived state case
2. Optimize PWA banner logic - separate concerns
3. Review thread item effects - multiple optimization opportunities

### Medium Priority

1. Audit chat store initialization
2. Review all custom hooks for unnecessary effects
3. Optimize component re-renders with better memoization

### Low Priority

1. Performance audit with React DevTools
2. Add ESLint rules for effect best practices
3. Create reusable effect patterns/hooks

## Best Practices Going Forward

1. **Think "derived state first"** - Can this be calculated from existing state?
2. **Question every effect** - Is this really synchronizing with an external system?
3. **Prefer event handlers** - For user interactions, use event handlers
4. **Use the `key` prop** - For resetting component state
5. **Extract custom hooks** - For reusable effect logic
6. **Minimize dependencies** - Keep effect dependency arrays small and stable
