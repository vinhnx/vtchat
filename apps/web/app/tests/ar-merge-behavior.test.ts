import { mergeAspectRatioHint } from '@repo/common/utils/aspect-ratio';
import { describe, expect, it } from 'vitest';

describe('mergeAspectRatioHint', () => {
    it('replaces previously inserted "in 16:9 aspect ratio" with new ratio', () => {
        const src = 'A cat sitting by the window in 16:9 aspect ratio.';
        const { text, replaced } = mergeAspectRatioHint(src, '1:1');
        expect(replaced).toBe(true);
        expect(text).toContain('in 1:1 aspect ratio');
        expect(text).not.toContain('16:9');
    });

    it('replaces free numeric ratio like 16x9', () => {
        const src = 'Landscape photo 16x9 with mountains.';
        const { text, replaced } = mergeAspectRatioHint(src, '3:2');
        expect(replaced).toBe(true);
        expect(text).toContain('in 3:2 aspect ratio');
        expect(text).not.toContain('16x9');
    });

    it('injects number after "aspect ratio" phrase if missing', () => {
        const src = 'Please render with aspect ratio for a widescreen look.';
        const { text, replaced } = mergeAspectRatioHint(src, '21:9');
        expect(replaced).toBe(true);
        expect(text).toContain('aspect ratio 21:9');
    });

    it('replaces bracketed ratio like [4:3]', () => {
        const src = 'Minimalist composition [4:3] with negative space.';
        const { text, replaced } = mergeAspectRatioHint(src, '1:1');
        expect(replaced).toBe(true);
        expect(text).toContain('[1:1]');
        expect(text).not.toContain('[4:3]');
    });

    it('falls back with replaced=false when no hint present', () => {
        const src = 'A photorealistic portrait of a dog.';
        const { text, replaced } = mergeAspectRatioHint(src, '16:9');
        expect(replaced).toBe(false);
        expect(text).toBe(src);
    });
});
