import { describe, expect, test } from 'bun:test';

describe('Fumadocs Integration', () => {
    test('should have Fumadocs dependencies installed', () => {
        const packageJson = require('../../package.json');

        // Check if Fumadocs dependencies are present
        expect(packageJson.dependencies).toHaveProperty('fumadocs-ui');
        expect(packageJson.dependencies).toHaveProperty('fumadocs-core');
        expect(packageJson.dependencies).toHaveProperty('fumadocs-mdx');
        expect(packageJson.dependencies).toHaveProperty('@types/mdx');
    });

    test('should have MDX postinstall script', () => {
        const packageJson = require('../../package.json');
        expect(packageJson.scripts.postinstall).toBe('fumadocs-mdx');
    });

    test('should have source configuration', () => {
        expect(() => require('../../source.config.ts')).not.toThrow();
    });

    test('should have content directory', () => {
        const fs = require('fs');
        expect(fs.existsSync('../../content/docs')).toBe(true);
        expect(fs.existsSync('../../content/docs/index.mdx')).toBe(true);
        expect(fs.existsSync('../../content/docs/features.mdx')).toBe(true);
        expect(fs.existsSync('../../content/docs/faq.mdx')).toBe(true);
    });

    test('should have generated source files', () => {
        const fs = require('fs');
        expect(fs.existsSync('../../.source')).toBe(true);
        expect(fs.existsSync('../../.source/index.ts')).toBe(true);
    });

    test('should have docs layout files', () => {
        const fs = require('fs');
        expect(fs.existsSync('../docs/layout.tsx')).toBe(true);
        expect(fs.existsSync('../docs/[[...slug]]/page.tsx')).toBe(true);
    });

    test('should have MDX components file', () => {
        const fs = require('fs');
        expect(fs.existsSync('../../mdx-components.tsx')).toBe(true);
    });
});
