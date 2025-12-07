'use client';

import { useEffect } from 'react';

export function FetchMethodPatch() {
    useEffect(() => {
        const globalAny = globalThis as unknown as {
            __vtchatClientFetchPatched?: boolean;
            fetch: typeof fetch;
        };

        if (globalAny.__vtchatClientFetchPatched) {
            return;
        }

        const originalFetch = globalAny.fetch;

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

        globalAny.fetch = patchedFetch;
        globalAny.__vtchatClientFetchPatched = true;
    }, []);

    return null;
}
