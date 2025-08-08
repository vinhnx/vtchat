#!/usr/bin/env node

/**
 * Debug script to check if GPT-5 is properly configured in the frontend
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging GPT-5 Frontend Integration...\n');

// Check if the built files contain GPT-5
const checkBuiltFiles = () => {
    console.log('1. Checking built files for GPT-5...');
    
    const nextDir = path.join(__dirname, '../apps/web/.next');
    if (!fs.existsSync(nextDir)) {
        console.log('   ❌ .next directory not found - run `bun run build` first');
        return;
    }
    
    // Check server chunks for GPT-5
    const serverDir = path.join(nextDir, 'server');
    if (fs.existsSync(serverDir)) {
        const files = fs.readdirSync(serverDir, { recursive: true });
        const jsFiles = files.filter(f => f.endsWith('.js'));
        
        let foundGPT5 = false;
        for (const file of jsFiles.slice(0, 5)) { // Check first 5 files
            const filePath = path.join(serverDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                if (content.includes('gpt-5-2025-08-07') || content.includes('GPT_5')) {
                    console.log(`   ✅ Found GPT-5 in ${file}`);
                    foundGPT5 = true;
                    break;
                }
            } catch (e) {
                // Skip binary files
            }
        }
        
        if (!foundGPT5) {
            console.log('   ⚠️  GPT-5 not found in server files - may need rebuild');
        }
    }
};

// Check source files
const checkSourceFiles = () => {
    console.log('\n2. Checking source files...');
    
    const files = [
        '../packages/shared/config/chat-mode.ts',
        '../packages/ai/models.ts',
        '../packages/common/components/chat-input/chat-config.tsx'
    ];
    
    for (const file of files) {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('GPT_5') || content.includes('gpt-5')) {
                console.log(`   ✅ ${path.basename(file)} contains GPT-5`);
            } else {
                console.log(`   ❌ ${path.basename(file)} missing GPT-5`);
            }
        } else {
            console.log(`   ❌ ${file} not found`);
        }
    }
};

// Check ChatMode enum
const checkChatModeEnum = () => {
    console.log('\n3. Checking ChatMode enum...');
    
    try {
        // This is a bit hacky but works for debugging
        const configPath = path.join(__dirname, '../packages/shared/config/chat-mode.ts');
        const content = fs.readFileSync(configPath, 'utf8');
        
        if (content.includes('GPT_5: "gpt-5"')) {
            console.log('   ✅ ChatMode.GPT_5 is defined correctly');
        } else {
            console.log('   ❌ ChatMode.GPT_5 not found or incorrect');
        }
        
        // Check if it's in the config
        if (content.includes('[ChatMode.GPT_5]:')) {
            console.log('   ✅ GPT_5 has configuration');
        } else {
            console.log('   ❌ GPT_5 missing configuration');
        }
        
    } catch (error) {
        console.log('   ❌ Error reading chat-mode.ts:', error.message);
    }
};

// Main execution
checkSourceFiles();
checkChatModeEnum();
checkBuiltFiles();

console.log('\n🎯 Next Steps:');
console.log('1. If source files are correct but built files are missing GPT-5:');
console.log('   → Restart dev server: pkill -f "next dev" && cd apps/web && bun run dev');
console.log('2. If source files are missing GPT-5:');
console.log('   → Re-run the integration steps');
console.log('3. Clear browser cache and try again');
console.log('4. Check browser Network tab to see what mode is actually being sent');
