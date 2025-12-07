export async function register() {
    const globalAny = globalThis as unknown as { __vtchatFetchPatched?: boolean; };

    if (globalAny.__vtchatFetchPatched) {
        return;
    }

    const originalFetch = globalThis.fetch;

    const patchedFetch: typeof fetch = (input, init) => {
        if (init) {
            const method = (init as { method?: unknown; }).method;

            if (method === undefined) {
                init = { ...init, method: 'GET' };
            } else if (typeof method !== 'string') {
                init = { ...init, method: String(method) };
            }
        }

        return originalFetch(input as any, init as any);
    };

    globalAny.__vtchatFetchPatched = true;
    globalThis.fetch = patchedFetch;
}
