import { describe, expect, it } from 'vitest';

describe('AI SDK v5 Integration', () => {
    it('should import AI SDK v5 successfully', async () => {
        // Test that the new AI SDK can be imported
        const { generateText } = await import('ai');
        expect(generateText).toBeDefined();
        expect(typeof generateText).toBe('function');
    });

    it('should import Google provider successfully', async () => {
        // Test that the Google provider can be imported
        const { google } = await import('@ai-sdk/google');
        expect(google).toBeDefined();
        expect(typeof google).toBe('function');
    });

    it('should be able to create Google model instances', async () => {
        const { google } = await import('@ai-sdk/google');

        // Test creating model instances (these should not throw)
        expect(() => google('gemini-2.5-pro')).not.toThrow();
        expect(() => google('gemini-2.5-flash')).not.toThrow();
        expect(() => google('gemini-2.5-flash-lite')).not.toThrow();
    });

    it('should have correct AI SDK package versions', async () => {
        // Read package.json to verify versions
        const fs = await import('fs/promises');
        const packageJson = JSON.parse(
            await fs.readFile('package.json', 'utf-8'),
        );

        // Verify AI SDK v5 is installed
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
        expect(dependencies['ai']).toMatch(/\^?[5-9]\./); // Version 5 or higher (with optional ^)
    });
});
