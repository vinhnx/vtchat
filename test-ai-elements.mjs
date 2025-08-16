#!/usr/bin/env node

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function testAIElementsIntegration() {
    console.log('🧪 Testing AI Elements Integration...\n');
    
    const results = [];
    
    // Test 1: Check if AI Elements components files exist
    try {
        const aiElementsPath = join(__dirname, 'apps/web/components/ai-elements');
        const files = await fs.readdir(aiElementsPath);
        
        const requiredFiles = ['index.ts', 'tool.tsx', 'task.tsx'];
        const hasAllFiles = requiredFiles.every(file => files.includes(file));
        
        results.push({
            test: 'AI Elements component files exist',
            passed: hasAllFiles,
            details: hasAllFiles ? `Found: ${files.join(', ')}` : `Missing files from: ${files.join(', ')}`
        });
    } catch (error) {
        results.push({
            test: 'AI Elements component files exist',
            passed: false,
            details: error.message
        });
    }
    
    // Test 2: Check if tool.tsx has the correct exports
    try {
        const toolPath = join(__dirname, 'apps/web/components/ai-elements/tool.tsx');
        const toolContent = await fs.readFile(toolPath, 'utf-8');
        
        const hasToolExports = [
            'export { Tool',
            'ToolContent',
            'ToolHeader', 
            'ToolInput',
            'ToolOutput'
        ].every(exp => toolContent.includes(exp));
        
        results.push({
            test: 'Tool component exports correct interfaces',
            passed: hasToolExports,
            details: hasToolExports ? 'All exports found' : 'Missing some exports'
        });
    } catch (error) {
        results.push({
            test: 'Tool component exports correct interfaces',
            passed: false,
            details: error.message
        });
    }
    
    // Test 3: Check if task.tsx has the correct exports
    try {
        const taskPath = join(__dirname, 'apps/web/components/ai-elements/task.tsx');
        const taskContent = await fs.readFile(taskPath, 'utf-8');
        
        const hasTaskExports = [
            'export { Task',
            'TaskContent',
            'TaskItem',
            'TaskItemFile',
            'TaskTrigger'
        ].every(exp => taskContent.includes(exp));
        
        results.push({
            test: 'Task component exports correct interfaces',
            passed: hasTaskExports,
            details: hasTaskExports ? 'All exports found' : 'Missing some exports'
        });
    } catch (error) {
        results.push({
            test: 'Task component exports correct interfaces',
            passed: false,
            details: error.message
        });
    }
    
    // Test 4: Check if enhanced tool-call component was updated
    try {
        const toolCallPath = join(__dirname, 'packages/common/components/thread/components/tool-call.tsx');
        const toolCallContent = await fs.readFile(toolCallPath, 'utf-8');
        
        const hasAIElementsIntegration = toolCallContent.includes('AIElementsToolCallStep') 
            && toolCallContent.includes('@/components/ai-elements');
        
        results.push({
            test: 'Tool call component enhanced with AI Elements',
            passed: hasAIElementsIntegration,
            details: hasAIElementsIntegration ? 'AI Elements integration found' : 'No AI Elements integration found'
        });
    } catch (error) {
        results.push({
            test: 'Tool call component enhanced with AI Elements',
            passed: false,
            details: error.message
        });
    }
    
    // Test 5: Check if step renderer was updated
    try {
        const stepRendererPath = join(__dirname, 'packages/common/components/thread/step-renderer.tsx');
        const stepRendererContent = await fs.readFile(stepRendererPath, 'utf-8');
        
        const hasTaskIntegration = stepRendererContent.includes('AIElementsStepRenderer') 
            && stepRendererContent.includes('@/components/ai-elements');
        
        results.push({
            test: 'Step renderer enhanced with Task components',
            passed: hasTaskIntegration,
            details: hasTaskIntegration ? 'Task component integration found' : 'No Task component integration found'
        });
    } catch (error) {
        results.push({
            test: 'Step renderer enhanced with Task components',
            passed: false,
            details: error.message
        });
    }
    
    // Test 6: Check if demo page was created
    try {
        const demoPath = join(__dirname, 'apps/web/app/ai-elements-demo/page.tsx');
        const demoContent = await fs.readFile(demoPath, 'utf-8');
        
        const hasDemoPage = demoContent.includes('AIElementsDemoPage') 
            && demoContent.includes('@/components/ai-elements');
        
        results.push({
            test: 'Demo page created',
            passed: hasDemoPage,
            details: hasDemoPage ? 'Demo page with AI Elements showcase created' : 'Demo page not found or incomplete'
        });
    } catch (error) {
        results.push({
            test: 'Demo page created',
            passed: false,
            details: error.message
        });
    }
    
    // Print results
    console.log('Test Results:');
    console.log('=============\n');
    
    let passedTests = 0;
    results.forEach((result, index) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`${index + 1}. ${status} ${result.test}`);
        console.log(`   ${result.details}\n`);
        if (result.passed) passedTests++;
    });
    
    console.log(`Summary: ${passedTests}/${results.length} tests passed\n`);
    
    if (passedTests === results.length) {
        console.log('🎉 All tests passed! AI Elements integration appears to be successful.');
    } else {
        console.log('⚠️  Some tests failed. Please review the integration.');
    }
}

testAIElementsIntegration().catch(console.error);