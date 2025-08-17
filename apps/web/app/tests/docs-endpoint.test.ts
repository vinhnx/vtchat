import { describe, expect, test } from 'bun:test';

describe('Docs Endpoint Implementation', () => {
    test('should have docs route structure', () => {
        const fs = require('fs');

        // Check if docs directory and files exist
        expect(fs.existsSync('./app/docs')).toBe(true);
        expect(fs.existsSync('./app/docs/layout.tsx')).toBe(true);
        expect(fs.existsSync('./app/docs/[[...slug]]')).toBe(true);
        expect(fs.existsSync('./app/docs/[[...slug]]/page.tsx')).toBe(true);
    });

    test('should have search API endpoint', () => {
        const fs = require('fs');
        expect(fs.existsSync('./app/api/search')).toBe(true);
        expect(fs.existsSync('./app/api/search/route.ts')).toBe(true);
    });

    test('should have layout config', () => {
        const fs = require('fs');
        expect(fs.existsSync('./app/layout.config.tsx')).toBe(true);
    });

    test('should have source configuration and generated files', () => {
        const fs = require('fs');
        expect(fs.existsSync('./source.config.ts')).toBe(true);
        expect(fs.existsSync('./.source')).toBe(true);
    });

    test('should have content directory', () => {
        const fs = require('fs');
        expect(fs.existsSync('./content')).toBe(true);
        expect(fs.existsSync('./content/docs')).toBe(true);
    });

    test('should have MDX components', () => {
        const fs = require('fs');
        expect(fs.existsSync('./mdx-components.tsx')).toBe(true);
    });

    test('should have Fumadocs styles in globals.css', () => {
        const fs = require('fs');
        const globalsContent = fs.readFileSync('./app/globals.css', 'utf8');
        expect(globalsContent).toContain('fumadocs-ui/css/neutral.css');
        expect(globalsContent).toContain('fumadocs-ui/css/preset.css');
    });

    test('should have Fumadocs integration in layout', () => {
        const fs = require('fs');
        const layoutContent = fs.readFileSync('./app/layout.tsx', 'utf8');
        expect(layoutContent).toContain('fumadocs-ui/provider');
        expect(layoutContent).toContain('FumadocsRootProvider');
    });
});
