import { describe, expect, test } from 'vitest';

import { PlanSlug } from '@repo/shared/types/subscription';

function buildSuccessUrl(protocol: string | null, host: string | null): string {
    const proto = protocol || 'https';
    if (!host) {
        return `/success?plan=${PlanSlug.VT_PLUS}`;
    }
    return `${proto}://${host}/success?plan=${PlanSlug.VT_PLUS}`;
}

describe('checkout success URL host override', () => {
    test('builds https URL when protocol missing but host present', () => {
        const url = buildSuccessUrl(null, 'vtchat.io.vn');
        expect(url).toBe(`https://vtchat.io.vn/success?plan=${PlanSlug.VT_PLUS}`);
    });

    test('builds URL with forwarded proto and host', () => {
        const url = buildSuccessUrl('https', 'app.vtchat.io.vn');
        expect(url).toBe(`https://app.vtchat.io.vn/success?plan=${PlanSlug.VT_PLUS}`);
    });

    test('falls back to relative when host missing', () => {
        const url = buildSuccessUrl('https', null);
        expect(url).toBe(`/success?plan=${PlanSlug.VT_PLUS}`);
    });
});
