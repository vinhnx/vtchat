#!/usr/bin/env node

/**
 * Migration script to replace console.* statements with Pino logger
 * Focuses on main application code, excludes test files and build scripts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files/directories to exclude from migration
const EXCLUDE_PATTERNS = [
    '/test/',
    '/tests/',
    '.test.',
    '.spec.',
    '/scripts/',
    '/build/',
    '/dist/',
    'node_modules/',
    '.worker.js',
    '.worker.ts',
    'next.config.',
    'tailwind.config.',
    'vitest.config.',
    '.min.js',
    'bundle-history.json'
];

// Mapping of console methods to logger methods
const CONSOLE_TO_LOGGER = {
    'console.log': 'logger.info',
    'console.info': 'logger.info', 
    'console.warn': 'logger.warn',
    'console.error': 'logger.error',
    'console.debug': 'logger.debug'
};

// Import statement to add
const LOGGER_IMPORT = "import { logger } from '@repo/shared/logger';";

/**
 * Check if file should be excluded from migration
 */
function shouldExcludeFile(filePath) {
    return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Check if file contains console statements
 */
function hasConsoleStatements(content) {
    return /console\.(log|error|warn|info|debug)/.test(content);
}

/**
 * Check if file already has logger import
 */
function hasLoggerImport(content) {
    return content.includes("from '@repo/shared/logger'");
}

/**
 * Add logger import to file if not present
 */
function addLoggerImport(content) {
    if (hasLoggerImport(content)) {
        return content;
    }

    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') && !lines[i].includes('type ')) {
            lastImportIndex = i;
        }
    }

    if (lastImportIndex >= 0) {
        lines.splice(lastImportIndex + 1, 0, LOGGER_IMPORT);
        return lines.join('\n');
    }

    // If no imports found, add at the beginning after directives
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('export const') || lines[i].startsWith('export const runtime')) {
            insertIndex = i + 1;
            break;
        }
    }
    
    lines.splice(insertIndex, 0, '', LOGGER_IMPORT);
    return lines.join('\n');
}

/**
 * Replace console statements with logger statements
 */
function replaceConsoleStatements(content) {
    let updatedContent = content;
    
    // Replace simple console statements
    Object.entries(CONSOLE_TO_LOGGER).forEach(([consoleFn, loggerFn]) => {
        // Handle simple cases: console.log('message')
        const simplePattern = new RegExp(`${consoleFn}\\((['"][^'"]*['"])\\)`, 'g');
        updatedContent = updatedContent.replace(simplePattern, `${loggerFn}($1)`);
        
        // Handle cases with variables: console.log('message', variable)
        const withVariablePattern = new RegExp(`${consoleFn}\\((['"][^'"]*['"])[,\\s]+([^)]+)\\)`, 'g');
        updatedContent = updatedContent.replace(withVariablePattern, (match, message, variable) => {
            // Convert to structured logging format
            const cleanMessage = message.replace(/['"]$/, '').replace(/^['"]/, '');
            if (variable.trim().startsWith('{')) {
                return `${loggerFn}('${cleanMessage}', ${variable})`;
            } else {
                return `${loggerFn}('${cleanMessage}', { data: ${variable} })`;
            }
        });
        
        // Handle object-only cases: console.log({ key: value })
        const objectOnlyPattern = new RegExp(`${consoleFn}\\(\\s*\\{[^}]+\\}\\s*\\)`, 'g');
        updatedContent = updatedContent.replace(objectOnlyPattern, (match) => {
            const objectPart = match.replace(consoleFn + '(', '').replace(')', '');
            return `${loggerFn}('Debug info', ${objectPart})`;
        });
    });

    return updatedContent;
}

/**
 * Process a single file
 */
function processFile(filePath) {
    if (shouldExcludeFile(filePath)) {
        return { processed: false, reason: 'excluded' };
    }

    let content;
    try {
        content = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        return { processed: false, reason: 'read_error', error };
    }

    if (!hasConsoleStatements(content)) {
        return { processed: false, reason: 'no_console' };
    }

    // Add logger import if needed
    let updatedContent = addLoggerImport(content);
    
    // Replace console statements
    updatedContent = replaceConsoleStatements(updatedContent);

    // Only write if content changed
    if (updatedContent !== content) {
        try {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            return { processed: true, reason: 'migrated' };
        } catch (error) {
            return { processed: false, reason: 'write_error', error };
        }
    }

    return { processed: false, reason: 'no_changes' };
}

/**
 * Find all TypeScript/JavaScript files
 */
function findFiles(directory) {
    const files = [];
    
    function walk(dir) {
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    if (!item.startsWith('.') && item !== 'node_modules') {
                        walk(fullPath);
                    }
                } else if (stat.isFile()) {
                    if (/\.(ts|tsx|js|jsx)$/.test(item) && !item.endsWith('.d.ts')) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not read directory ${dir}:`, error.message);
        }
    }
    
    walk(directory);
    return files;
}

/**
 * Main migration function
 */
function main() {
    console.log('🚀 Starting console.* to Pino logger migration...\n');

    const rootDir = path.resolve(__dirname, '..');
    const targetDirs = [
        path.join(rootDir, 'apps/web/app/api'),
        path.join(rootDir, 'apps/web/components'), 
        path.join(rootDir, 'apps/web/lib'),
        path.join(rootDir, 'packages')
    ];
    const stats = {
        total: 0,
        migrated: 0,
        excluded: 0,
        noConsole: 0,
        errors: 0
    };

    for (const targetDir of targetDirs) {
        if (!fs.existsSync(targetDir)) {
            console.log(`⚠️  Directory ${targetDir} does not exist, skipping...`);
            continue;
        }

        console.log(`📁 Processing directory: ${targetDir}`);
        const files = findFiles(targetDir);
        
        for (const file of files) {
            stats.total++;
            const result = processFile(file);
            
            switch (result.reason) {
                case 'migrated':
                    stats.migrated++;
                    console.log(`  ✅ ${file}`);
                    break;
                case 'excluded':
                    stats.excluded++;
                    break;
                case 'no_console':
                    stats.noConsole++;
                    break;
                case 'read_error':
                case 'write_error':
                    stats.errors++;
                    console.log(`  ❌ ${file}: ${result.error?.message}`);
                    break;
            }
        }
    }

    console.log('\n📊 Migration Summary:');
    console.log('='.repeat(50));
    console.log(`📁 Total files processed: ${stats.total}`);
    console.log(`✅ Files migrated: ${stats.migrated}`);
    console.log(`⏭️  Files excluded: ${stats.excluded}`);
    console.log(`📝 Files without console statements: ${stats.noConsole}`);
    console.log(`❌ Errors: ${stats.errors}`);

    if (stats.migrated > 0) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Review the changes with: git diff');
        console.log('2. Test the application to ensure logging works correctly');
        console.log('3. Run build to check for any issues: bun run build');
        console.log('4. Commit the changes');
    } else {
        console.log('\n✨ No files needed migration.');
    }
}

if (require.main === module) {
    main();
}

module.exports = { processFile, findFiles };
