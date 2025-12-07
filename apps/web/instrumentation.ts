export async function register() {
    const globalAny = globalThis as unknown as { __vtchatFetchPatched?: boolean; };

    if (globalAny.__vtchatFetchPatched) {
        return;
    }

    const originalFetch = globalThis.fetch;

    const patchedFetch: typeof fetch = (input, init) => {
        // Ensure init is an object
        const safeInit = init || {};
        const method = (safeInit as { method?: unknown; }).method;

        // Normalize method to always be a string
        const normalizedInit = {
            ...safeInit,
            method: method === undefined || method === null
                ? 'GET'
                : typeof method === 'string'
                    ? method
                    : String(method),
        };

        return originalFetch(input as any, normalizedInit as any);
    };

    globalAny.__vtchatFetchPatched = true;
    globalThis.fetch = patchedFetch;
}
