import { describe, expect, it } from 'vitest';
import { secureContentForEmbedding } from '@/lib/utils/content-security';

describe('Address Masking', () => {
    it('should mask complete address information', () => {
        const content =
            'Please send mail to: John Doe, 123 Main Street, Apt 4B, San Francisco, CA 94102';
        const result = secureContentForEmbedding(content);
        expect(result).toBe(
            'Please send mail to: John Doe, [ADDRESS_REDACTED], [UNIT_REDACTED], San Francisco, CA [ZIP_REDACTED]'
        );
    });

    it('should mask various street types', () => {
        const addresses = [
            '456 Oak Avenue',
            '789 Pine Road',
            '101 Elm Drive',
            '202 Maple Lane',
            '303 Cedar Boulevard',
            '404 Birch Court',
            '505 Willow Place',
            '606 Spruce Way',
            '707 Cherry Circle',
        ];

        addresses.forEach((address) => {
            const result = secureContentForEmbedding(`I live at ${address}`);
            expect(result).toBe('I live at [ADDRESS_REDACTED]');
        });
    });

    it('should mask apartment variations', () => {
        const units = ['Apt 4B', 'Apartment 12', 'Unit 5A', 'Suite 100', 'Ste. 25'];

        units.forEach((unit) => {
            const result = secureContentForEmbedding(`My address includes ${unit}`);
            expect(result).toBe('My address includes [UNIT_REDACTED]');
        });
    });

    it('should handle real-world address examples', () => {
        const realExamples = [
            'My office is at 1600 Pennsylvania Avenue, Washington DC 20500',
            'Visit us at 350 Fifth Avenue, New York, NY 10118',
            'Contact: 1 Infinite Loop, Cupertino, CA 95014',
        ];

        const expectedResults = [
            'My office is at [ADDRESS_REDACTED], Washington DC [ZIP_REDACTED]',
            'Visit us at [ADDRESS_REDACTED], New York, NY [ZIP_REDACTED]',
            'Contact: [ADDRESS_REDACTED], Cupertino, CA [ZIP_REDACTED]',
        ];

        realExamples.forEach((example, index) => {
            const result = secureContentForEmbedding(example);
            expect(result).toBe(expectedResults[index]);
        });
    });
});
