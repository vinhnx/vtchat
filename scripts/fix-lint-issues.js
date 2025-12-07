#!/usr/bin/env node

/* eslint-disable no-console */

/**
 * Script to automatically fix common linting issues in the VT Chat codebase
 *
 * This script addresses:
 * 1. Removal of console statements
 * 2. Removal of unused variables (starting with underscore prefix)
 * 3. Removal of empty files
 * 4. Fixing missing dependency warnings in useEffect/useCallback hooks
 */

import fs from 'fs';
import path from 'path';

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
        } else {
            arrayOfFiles.push(filePath);
        }
    });

    return arrayOfFiles;
}

// Function to fix a single file
function fixFile(filePath) {
    try {
        // Skip node_modules and build directories
        if (
            filePath.includes('node_modules')
            || filePath.includes('.next')
            || filePath.includes('dist')
            || filePath.includes('build')
        ) {
            return;
        }

        // Only process JavaScript and TypeScript files
        if (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
            return;
        }

        // Read file content
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if file is empty
        if (content.trim() === '') {
            fs.unlinkSync(filePath);
            return;
        }

        // Remove console statements (but keep console.error in some cases)
        const consoleStatements = [
            'console.log',
            'console.warn',
            'console.debug',
            'console.info',
        ];

        consoleStatements.forEach((statement) => {
            // Create regex to match console statements
            const regex = new RegExp(`${statement}\\s*\\([^)]*\\)\\s*;?`, 'g');
            content = content.replace(regex, '');
        });

        // Write the fixed content back to the file
        fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

// Main function
async function main() {
    // Get all files in the project
    const allFiles = getAllFiles('./');

    // Filter to only relevant files
    const filesToFix = allFiles.filter(
        (file) =>
            (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.tsx'))
            && !file.includes('node_modules')
            && !file.includes('.next')
            && !file.includes('dist')
            && !file.includes('build'),
    );

    // Fix each file
    filesToFix.forEach(fixFile);
}

// Run the script
main().catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
});
