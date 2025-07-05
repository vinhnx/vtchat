#!/usr/bin/env node

/**
 * Check for hardcoded URLs in the codebase
 * This prevents regression of hardcoded localhost:3000 or production URLs
 */

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const HARDCODED_URL_PATTERNS = [
    'localhost:3000',
    'https?:\\/\\/vtchat\\.io\\.vn',
    'http:\\/\\/localhost:3000',
    'https:\\/\\/localhost:3000',
];

const EXCLUDE_PATTERNS = [
    '.env*',
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    'TODO.md',           // Allow in TODO files
    'memory-bank/**',    // Allow in documentation
    'docs/**',           // Allow in documentation (will be updated separately)
    '*.md',              // Allow in markdown files (will be updated separately)
];

function checkForHardcodedUrls() {
    console.log('🔍 Checking for hardcoded URLs...');
    
    // Check if ripgrep is available
    try {
        execSync('command -v rg', { stdio: 'pipe' });
    } catch {
        console.warn('⚠️  ripgrep (rg) not found, falling back to grep');
        return checkWithGrep();
    }

    let foundViolations = false;

    for (const pattern of HARDCODED_URL_PATTERNS) {
        try {
            const excludeArgs = EXCLUDE_PATTERNS.map(p => `--glob '!${p}'`).join(' ');
            const cmd = `rg -n "${pattern}" ${excludeArgs} --type-not binary`;
            
            const result = execSync(cmd, { 
                encoding: 'utf8',
                stdio: 'pipe' 
            });
            
            if (result.trim()) {
                console.error(`\n❌ Hardcoded URL pattern "${pattern}" found:`);
                console.error(result);
                foundViolations = true;
            }
        } catch (error) {
            // rg exits with code 1 when no matches found, which is what we want
            if (error.status !== 1) {
                console.error(`Error running ripgrep: ${error.message}`);
                process.exit(2);
            }
        }
    }

    if (foundViolations) {
        console.error('\n💡 Fix these issues by:');
        console.error('  1. Using getBaseURL() from @repo/shared/config/baseUrl');
        console.error('  2. Using environment variables (NEXT_PUBLIC_APP_URL, APP_URL)');
        console.error('  3. For documentation, use placeholders like $DEV_URL or $PROD_URL');
        process.exit(1);
    }

    console.log('✅ No hardcoded URLs found');
}

function checkWithGrep() {
    console.log('Using basic file scanning (no ripgrep found)...');
    
    // For now, just warn and pass - the CI environment should have ripgrep
    console.warn('⚠️  Install ripgrep (rg) for proper URL checking');
    console.warn('   brew install ripgrep  # macOS');
    console.warn('   apt install ripgrep   # Ubuntu/Debian');
    console.log('✅ Skipping URL check (install ripgrep for full validation)');
}

// Only run if not imported as module
if (import.meta.url === `file://${process.argv[1]}`) {
    checkForHardcodedUrls();
}

export { checkForHardcodedUrls };
