export type MergeResult = { text: string; replaced: boolean; };

// Normalize ratio input like '16x9' -> '16:9'
const normalizeRatio = (r: string): string => {
    const m = r.match(/^(\d{1,2})\s*[:xX]\s*(\d{1,2})$/);
    if (m) return `${parseInt(m[1]!, 10)}:${parseInt(m[2]!, 10)}`;
    return r.trim();
};

// Attempts to find an existing AR hint and replace it with the provided ratio.
// Supports forms:
// - 'in 16:9 aspect ratio' (or any numeric pair optionally prefixed by 'in' and suffixed by words)
// - 'aspect ratio' (without a number) -> inject number after phrase
// - '[16:9]' bracketed hint inside templates
export const mergeAspectRatioHint = (text: string, ratio: string): MergeResult => {
    const original = text || '';
    const r = normalizeRatio(ratio);

    // 1) Replace bracketed numeric ratios like '[16:9]'
    const bracketPattern = /\[(\s*)(\d{1,2})\s*[:xX]\s*(\d{1,2})(\s*)\]/;
    if (bracketPattern.test(original)) {
        const next = original.replace(bracketPattern, `[$1${r}$4]`);
        return { text: next, replaced: true };
    }

    // 2) Replace free numeric ratio (optionally with surrounding words)
    const arPhrasePattern = /(?:\bin\s+)?\b(\d{1,2})\s*[:xX]\s*(\d{1,2})\b(?:\s*aspect\s*ratio)?/i;
    if (arPhrasePattern.test(original)) {
        const next = original.replace(arPhrasePattern, `in ${r} aspect ratio`);
        return { text: next, replaced: true };
    }

    // 3) If the phrase exists without numbers, inject the number right after it
    const aspectWordOnly = /aspect\s*ratio(?!\s*\d)/i;
    if (aspectWordOnly.test(original)) {
        const next = original.replace(aspectWordOnly, `aspect ratio ${r}`);
        return { text: next, replaced: true };
    }

    // Nothing to replace – caller can append a hint instead
    return { text: original, replaced: false };
};
