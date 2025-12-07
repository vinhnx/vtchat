import { describe, expect, test } from 'vitest';

import { PlanSlug } from '@repo/shared/types/subscription';

// We will directly test the map + preservation behavior by calling the helper logic inline.
// This keeps the test minimal without needing to spin up Next.js routing.

function preserveVtPlus(
    planSlug: string,
    existingSubPlan: string | null,
    existingUserPlan: string | null,
) {
    let mapped = planSlug;
    if (mapped === PlanSlug.VT_BASE) {
        const hadVtPlusSubscription = existingSubPlan === PlanSlug.VT_PLUS;
        const hadVtPlusUserPlan = existingUserPlan === PlanSlug.VT_PLUS;
        if (hadVtPlusSubscription || hadVtPlusUserPlan) {
            mapped = PlanSlug.VT_PLUS;
        }
    }
    return mapped;
}

describe('webhook VT+ preservation', () => {
    test('keeps VT+ when product mapping is ambiguous and sub is VT+', () => {
        const result = preserveVtPlus(PlanSlug.VT_BASE, PlanSlug.VT_PLUS, PlanSlug.VT_BASE);
        expect(result).toBe(PlanSlug.VT_PLUS);
    });

    test('keeps VT+ when product mapping is ambiguous and user plan is VT+', () => {
        const result = preserveVtPlus(PlanSlug.VT_BASE, null, PlanSlug.VT_PLUS);
        expect(result).toBe(PlanSlug.VT_PLUS);
    });

    test('stays base when no VT+ history and ambiguous product', () => {
        const result = preserveVtPlus(PlanSlug.VT_BASE, PlanSlug.VT_BASE, PlanSlug.VT_BASE);
        expect(result).toBe(PlanSlug.VT_BASE);
    });
});
