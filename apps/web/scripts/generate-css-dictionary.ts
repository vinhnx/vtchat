import type { Dirent } from 'node:fs';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const appDir = path.resolve(new URL('.', import.meta.url).pathname, '..');
const builtCssDir = path.join(appDir, '.next', 'static', 'css');
const standaloneCssDir = path.join(appDir, '.next', 'standalone', '.next', 'static', 'css');
const outputFile = path.join(builtCssDir, 'full.css');
const standaloneOutputFile = path.join(standaloneCssDir, 'full.css');
const sourceMapPattern = /\/\*# sourceMappingURL=.*?\*\//g;

function stripSourceMaps(input: string): string {
    return input.replace(sourceMapPattern, '').trim();
}

async function writeDictionary(targetPath: string, payload: string): Promise<void> {
    await mkdir(path.dirname(targetPath), { recursive: true });
    await writeFile(targetPath, payload, 'utf8');
}

async function buildDictionary(): Promise<void> {
    let entries: Dirent[] = [];

    try {
        entries = await readdir(builtCssDir, { withFileTypes: true });
    } catch {
        process.stdout.write('CSS dictionary: skipped (no built CSS found).\n');
        return;
    }

    const cssFiles = entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.css'))
        .map((entry) => entry.name)
        .filter((name) => name !== 'full.css')
        .sort();

    if (cssFiles.length === 0) {
        process.stdout.write('CSS dictionary: skipped (no CSS files to combine).\n');
        return;
    }

    const parts: string[] = [];

    for (const fileName of cssFiles) {
        const cssPath = path.join(builtCssDir, fileName);
        const content = await readFile(cssPath, 'utf8');
        parts.push(`/* ${fileName} */\n${stripSourceMaps(content)}`);
    }

    const payload = parts.join('\n\n');

    await writeDictionary(outputFile, payload);

    try {
        await writeDictionary(standaloneOutputFile, payload);
    } catch {
        process.stdout.write('CSS dictionary: standalone sync skipped.\n');
    }

    process.stdout.write(
        `CSS dictionary: generated from ${cssFiles.length} files -> ${outputFile}\n`,
    );
}

buildDictionary().catch((error) => {
    process.stderr.write(`CSS dictionary: failed to build (${String(error)}).\n`);
    process.exitCode = 0;
});
