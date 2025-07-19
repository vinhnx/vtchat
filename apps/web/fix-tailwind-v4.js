#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Fix UI components for Tailwind v4 compatibility
function fixUIComponentsV4() {
    console.log('🔧 Fixing UI components for Tailwind v4 compatibility...\n');
    
    // Define breaking changes mapping (more precise patterns)
    const breakingChanges = [
        {
            pattern: /\bshadow-sm\b/g,
            replacement: 'shadow-xs',
            description: 'shadow-sm → shadow-xs'
        },
        {
            pattern: /\bshadow\b(?!-)/g,
            replacement: 'shadow-sm',
            description: 'shadow → shadow-sm'
        },
        {
            pattern: /\brounded-sm\b/g,
            replacement: 'rounded-xs',
            description: 'rounded-sm → rounded-xs'
        },
        {
            pattern: /\brounded\b(?!-)/g,
            replacement: 'rounded-sm',
            description: 'rounded → rounded-sm'
        },
        {
            pattern: /\boutline-none\b/g,
            replacement: 'outline-hidden',
            description: 'outline-none → outline-hidden'
        },
        {
            pattern: /\bring\b(?!-)/g,
            replacement: 'ring-3',
            description: 'ring → ring-3'
        }
    ];
    
    // Find all component files
    let allFiles = [];
    try {
        const findCommand = 'find packages/ui/src packages/common/src apps/web/app -name "*.tsx" -o -name "*.ts" 2>/dev/null';
        const output = execSync(findCommand, { encoding: 'utf8' });
        allFiles = output.trim().split('\n').filter(file => file.length > 0);
    } catch (error) {
        console.error('❌ Could not find component files');
        process.exit(1);
    }
    
    console.log(`📁 Found ${allFiles.length} component files to process\n`);
    
    let totalChanges = 0;
    let filesChanged = 0;
    const changesByFile = {};
    
    allFiles.forEach(filePath => {
        if (!fs.existsSync(filePath)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        let fileChanges = [];
        
        // Apply each breaking change fix
        breakingChanges.forEach(change => {
            const matches = content.match(change.pattern);
            if (matches) {
                const changeCount = matches.length;
                content = content.replace(change.pattern, change.replacement);
                fileChanges.push({
                    description: change.description,
                    count: changeCount
                });
                totalChanges += changeCount;
            }
        });
        
        // Write back if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            changesByFile[filePath] = fileChanges;
            filesChanged++;
        }
    });
    
    // Report results
    if (totalChanges === 0) {
        console.log('✅ All UI components are already compatible with Tailwind v4!');
        console.log('🎉 No changes needed.');
        return true;
    } else {
        console.log(`🔧 Applied ${totalChanges} fixes across ${filesChanged} files:\n`);
        
        Object.entries(changesByFile).forEach(([filePath, changes]) => {
            console.log(`📄 ${filePath}:`);
            changes.forEach(change => {
                console.log(`   ✅ ${change.description} (${change.count} changes)`);
            });
            console.log('');
        });
        
        console.log('📋 Summary of changes applied:');
        breakingChanges.forEach(change => {
            console.log(`   • ${change.description}`);
        });
        
        console.log('\n🎉 All Tailwind v4 compatibility fixes have been applied!');
        console.log('💡 Please review the changes and test your components.');
        
        return true;
    }
}

// Run the fix
const success = fixUIComponentsV4();
process.exit(success ? 0 : 1);
