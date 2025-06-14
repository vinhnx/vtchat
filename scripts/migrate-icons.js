#!/usr/bin/env node

/**
 * Icon Migration Script: @tabler/icons-react to lucide-react
 * 
 * This script automatically migrates icon imports from @tabler/icons-react to lucide-react
 * across the entire codebase.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping from @tabler/icons-react to lucide-react
const iconMapping = {
    'IconAlertCircle': 'AlertCircle',
    'IconArrowBarLeft': 'PanelLeftClose',
    'IconArrowBarRight': 'PanelRightClose', 
    'IconArrowRight': 'ArrowRight',
    'IconArrowUp': 'ArrowUp',
    'IconAtom': 'Atom',
    'IconBolt': 'Zap',
    'IconBoltFilled': 'Zap',
    'IconBook': 'Book',
    'IconBrandJavascript': 'FileCode',
    'IconBrandPython': 'FileCode',
    'IconBrandReact': 'FileCode',
    'IconBrandTypescript': 'FileCode',
    'IconBulb': 'Lightbulb',
    'IconCaretDownFilled': 'ChevronDown',
    'IconChartBar': 'BarChart',
    'IconCheck': 'Check',
    'IconChecklist': 'CheckSquare',
    'IconChevronDown': 'ChevronDown',
    'IconChevronRight': 'ChevronRight',
    'IconCircleCheckFilled': 'CheckCircle',
    'IconClock': 'Clock',
    'IconCodeDots': 'Code',
    'IconCommand': 'Command',
    'IconCopy': 'Copy',
    'IconCornerDownRight': 'CornerDownRight',
    'IconCrown': 'Crown',
    'IconExternalLink': 'ExternalLink',
    'IconFileFilled': 'File',
    'IconHelpHexagon': 'HelpCircle',
    'IconHelpSmall': 'HelpCircle',
    'IconJson': 'FileJson',
    'IconKey': 'Key',
    'IconLoader2': 'Loader2',
    'IconLogout': 'LogOut',
    'IconMarkdown': 'FileText',
    'IconMessageCircleFilled': 'MessageCircle',
    'IconMoon': 'Moon',
    'IconNorthStar': 'Star',
    'IconPaperclip': 'Paperclip',
    'IconPencil': 'Pencil',
    'IconPhotoPlus': 'ImagePlus',
    'IconPinned': 'Pin',
    'IconPlayerStopFilled': 'Square',
    'IconPlus': 'Plus',
    'IconQuestionMark': 'HelpCircle',
    'IconRefresh': 'RotateCcw',
    'IconSearch': 'Search',
    'IconSelector': 'ChevronsUpDown',
    'IconSettings': 'Settings',
    'IconSettings2': 'Settings2',
    'IconSpiral': 'Loader',
    'IconSquare': 'Square',
    'IconSun': 'Sun',
    'IconTerminal': 'Terminal',
    'IconTools': 'Wrench',
    'IconTrash': 'Trash',
    'IconUser': 'User',
    'IconWorld': 'Globe',
    'IconX': 'X'
};

// Get all TypeScript/JavaScript files that might contain icon imports
function getAllFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            // Skip node_modules and .next directories
            if (!['node_modules', '.next', '.git', 'dist', 'build'].includes(file)) {
                results = results.concat(getAllFiles(filePath, extensions));
            }
        } else {
            if (extensions.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        }
    });
    
    return results;
}

// Process a single file
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Check if file contains @tabler/icons-react imports
    if (!content.includes('@tabler/icons-react')) {
        return false;
    }
    
    console.log(`Processing: ${filePath}`);
    
    // Replace import statements
    // Handle single-line imports: import { X, IconY } from 'lucide-react';
    const singleLineImportRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]@tabler\/icons-react['"];?/g;
    
    newContent = newContent.replace(singleLineImportRegex, (match, iconList) => {
        const icons = iconList.split(',').map(icon => icon.trim());
        const mappedIcons = icons.map(icon => {
            const mapped = iconMapping[icon];
            if (!mapped) {
                console.warn(`Warning: No mapping found for ${icon} in ${filePath}`);
                return icon; // Keep original if no mapping found
            }
            return mapped;
        });
        
        modified = true;
        return `import { ${mappedIcons.join(', ')} } from 'lucide-react';`;
    });
    
    // Handle multi-line imports
    const multiLineImportRegex = /import\s*\{([^}]*)\}\s*from\s*['"]@tabler\/icons-react['"];?/gs;
    
    newContent = newContent.replace(multiLineImportRegex, (match, iconList) => {
        const icons = iconList.split(',').map(icon => icon.trim()).filter(icon => icon);
        const mappedIcons = icons.map(icon => {
            const mapped = iconMapping[icon];
            if (!mapped) {
                console.warn(`Warning: No mapping found for ${icon} in ${filePath}`);
                return icon; // Keep original if no mapping found
            }
            return mapped;
        });
        
        modified = true;
        
        // Format as multi-line if there are many icons
        if (mappedIcons.length > 3) {
            return `import {\n    ${mappedIcons.join(',\n    ')}\n} from 'lucide-react';`;
        } else {
            return `import { ${mappedIcons.join(', ')} } from 'lucide-react';`;
        }
    });
    
    // Replace icon usage in JSX (this handles the component names in the actual JSX)
    Object.keys(iconMapping).forEach(tablerIcon => {
        const lucideIcon = iconMapping[tablerIcon];
        // Replace JSX usage: <X  /> -> <X />
        const jsxRegex = new RegExp(`<${tablerIcon}(\\s[^>]*)?\\s*/>`, 'g');
        if (newContent.match(jsxRegex)) {
            newContent = newContent.replace(jsxRegex, `<${lucideIcon}$1 />`);
            modified = true;
        }
        
        // Replace JSX usage with children: <X>...</X> -> <X>...</X>
        const jsxWithChildrenRegex = new RegExp(`<${tablerIcon}(\\s[^>]*)?>(.*?)</${tablerIcon}>`, 'gs');
        if (newContent.match(jsxWithChildrenRegex)) {
            newContent = newContent.replace(jsxWithChildrenRegex, `<${lucideIcon}$1>$2</${lucideIcon}>`);
            modified = true;
        }
    });
    
    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
        return true;
    }
    
    return false;
}

// Main execution
function main() {
    console.log('🚀 Starting icon migration from @tabler/icons-react to lucide-react...\n');
    
    const rootDir = process.cwd();
    const files = getAllFiles(rootDir);
    
    let processedCount = 0;
    let modifiedCount = 0;
    
    files.forEach(file => {
        processedCount++;
        if (processFile(file)) {
            modifiedCount++;
        }
    });
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Files processed: ${processedCount}`);
    console.log(`   Files modified: ${modifiedCount}`);
    
    if (modifiedCount > 0) {
        console.log(`\n✅ Migration completed! ${modifiedCount} files were updated.`);
        console.log(`\n📝 Next steps:`);
        console.log(`   1. Review the changes with: git diff`);
        console.log(`   2. Test the application to ensure all icons render correctly`);
        console.log(`   3. Update package.json to remove @tabler/icons-react`);
        console.log(`   4. Commit the changes`);
    } else {
        console.log(`\n✨ No files needed migration.`);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { processFile, iconMapping };
