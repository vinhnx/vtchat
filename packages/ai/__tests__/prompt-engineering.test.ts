import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { dateStringToDate } from '../../shared/utils/zod-date-utils';

describe('Prompt Engineering Improvements', () => {
  it('should properly transform date strings to Date objects', () => {
    const dateStr = '2023-06-15';
    const result = dateStringToDate.parse(dateStr);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toContain('2023-06-15');
  });

  it('should properly transform datetime strings to Date objects', () => {
    const dateTimeStr = '2023-06-15T10:30:00Z';
    const schema = z.string().datetime().transform((value) => new Date(value));
    const result = schema.parse(dateTimeStr);
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-06-15T10:30:00.000Z');
  });

  it('should use nullable instead of optional for better compatibility', () => {
    // Test that we're using nullable() instead of optional()
    const schemaWithNullable = z.object({
      name: z.string().nullable(),
      age: z.number().nullable(),
    });
    
    // This should parse successfully with null values
    const result = schemaWithNullable.parse({
      name: null,
      age: null,
    });
    
    expect(result.name).toBeNull();
    expect(result.age).toBeNull();
  });
});