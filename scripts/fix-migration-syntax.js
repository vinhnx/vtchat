#!/usr/bin/env node

/**
 * Fix syntax errors introduced by the console migration script
 */

const fs = require('fs');
const path = require('path');

const filesToFix = [
    'packages/ai/workflow/flow.ts',
    'packages/common/components/byok-validation-dialog.tsx',
    'packages/common/utils/account-linking-db.ts',
    'apps/web/app/api/checkout/route.ts',
    'apps/web/app/api/webhook/creem/route.ts',
    'packages/ai/workflow/tasks/completion.ts',
    'packages/ai/workflow/tasks/refine-query.ts',
    'packages/ai/workflow/utils.ts',
    'packages/orchestrator/engine.ts'
];

function fixFile(filePath) {
    try {
        console.log(`Fixing ${filePath}...`);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix broken import statements
        content = content.replace(/import \{\nimport { logger } from '@repo\/shared\/logger';\n/g, 
            "import { logger } from '@repo/shared/logger';\nimport {\n");
        
        // Fix object syntax issues
        content = content.replace(/'([^']+)':\s*([^,}]+)/g, '$1: $2');
        
        // Fix parentheses mismatches  
        content = content.replace(/entries\(\s*}\)\)\)/g, 'entries())');
        content = content.replace(/PRICE_ID_MAPPING\s*}\)\)/g, 'PRICE_ID_MAPPING)');
        content = content.replace(/Object\.keys\([^}]+}\)\)/g, (match) => {
            return match.replace(/}\)\)$/, ')');
        });
        
        // Fix Content-Type header syntax
        content = content.replace(/Content-Type:/g, "'Content-Type':");
        
        // Fix more complex syntax issues
        content = content.replace(/Object\.keys\(([^}]+)}\)\)/g, 'Object.keys($1))');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed ${filePath}`);
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function main() {
    console.log('🔧 Fixing syntax errors from migration...\n');
    
    for (const file of filesToFix) {
        const fullPath = path.resolve(__dirname, '..', file);
        if (fs.existsSync(fullPath)) {
            fixFile(fullPath);
        } else {
            console.log(`⚠️ File not found: ${file}`);
        }
    }
    
    console.log('\n🎉 Syntax fixes completed!');
}

main();
