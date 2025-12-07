import { describe, expect, it } from 'vitest';

import { normalizeBarChartData } from '../../lib/tools/charts';

describe('normalizeBarChartData', () => {
    it('maps category to name when name is missing', () => {
        const input = [
            { category: 'Apples', value: 10 },
            { category: 'Bananas', value: 15 },
        ];

        const result = normalizeBarChartData(input);

        expect(result).toHaveLength(2);
        expect(result[0]).toMatchObject({ name: 'Apples', value: 10 });
        expect(result[1]).toMatchObject({ name: 'Bananas', value: 15 });
    });

    it('drops entries without name or category and falls back to defaults if none remain', () => {
        const input = [
            { value: 10 }, // no label
            { category: '', value: 5 }, // empty label
        ];

        const result = normalizeBarChartData(input);

        expect(result.length).toBeGreaterThan(0);
        expect(result.every((r) => typeof r.name === 'string' && r.name.length > 0)).toBe(true);
    });

    it('converts numeric-like values safely', () => {
        const input = [{ category: 'Value', value: '42' as unknown as number }];

        const result = normalizeBarChartData(input);

        expect(result[0]).toMatchObject({ name: 'Value', value: 42 });
    });
});
