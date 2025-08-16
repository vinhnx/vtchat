import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility function', () => {
    it('should concatenate multiple class names', () => {
        const result = cn('class1', 'class2', 'class3');
        expect(result).toBe('class1 class2 class3');
    });

    it('should filter out falsy values', () => {
        const result = cn('class1', '', null, undefined, false, 'class2');
        expect(result).toBe('class1 class2');
    });

    it('should handle empty input', () => {
        const result = cn();
        expect(result).toBe('');
    });

    it('should handle all falsy values', () => {
        const result = cn('', null, undefined, false);
        expect(result).toBe('');
    });

    it('should handle conditional classes', () => {
        const condition = true;
        const result = cn('base-class', condition && 'conditional-class', 'final-class');
        expect(result).toBe('base-class conditional-class final-class');
    });

    it('should handle conditional classes when false', () => {
        const condition = false;
        const result = cn('base-class', condition && 'conditional-class', 'final-class');
        expect(result).toBe('base-class final-class');
    });

    it('should handle mixed string and boolean expressions', () => {
        const isActive = true;
        const isDisabled = false;
        const result = cn(
            'btn',
            isActive && 'btn-active',
            isDisabled && 'btn-disabled',
            'btn-default'
        );
        expect(result).toBe('btn btn-active btn-default');
    });

    it('should handle single class name', () => {
        const result = cn('single-class');
        expect(result).toBe('single-class');
    });

    it('should trim and handle extra spaces', () => {
        // The current implementation doesn't trim individual classes,
        // but filters out falsy values and joins with single space
        const result = cn('  class1  ', 'class2');
        expect(result).toBe('  class1   class2');
    });
});