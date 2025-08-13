#!/usr/bin/env bun

/**
 * Migration Helper Script
 * Analyzes fetch usage and provides migration recommendations
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

interface FetchUsage {
    file: string;
    lines: number;
    fetchCalls: number;
    complexCalls: number;
    migrationPriority: 'high' | 'medium' | 'low';
    estimatedSavings: number;
}

function analyzeFile(filePath: string): FetchUsage | null {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n').length;
        const fetchMatches = content.match(/fetch\(/g) || [];
        const fetchCalls = fetchMatches.length;

        if (fetchCalls === 0) return null;

        // Check for complex patterns that indicate higher savings
        const complexPatterns = [
            /await response\.json\(\)/g,
            /response\.ok/g,
            /response\.status/g,
            /new AbortController/g,
            /setTimeout.*abort/g,
            /Content-Type.*application\/json/g,
        ];

        const complexCalls = complexPatterns.reduce((count, pattern) => {
            return count + (content.match(pattern) || []).length;
        }, 0);

        // Calculate priority and estimated savings
        let priority: 'high' | 'medium' | 'low' = 'low';
        let estimatedSavings = fetchCalls * 3; // Base savings

        if (lines > 500 && fetchCalls >= 3) {
            priority = 'high';
            estimatedSavings = fetchCalls * 8;
        } else if (lines > 200 && fetchCalls >= 2) {
            priority = 'medium';
            estimatedSavings = fetchCalls * 5;
        }

        // Bonus for complex patterns
        estimatedSavings += complexCalls * 2;

        return {
            file: filePath,
            lines,
            fetchCalls,
            complexCalls,
            migrationPriority: priority,
            estimatedSavings,
        };
    } catch (error) {
        console.warn(`Could not analyze ${filePath}:`, error);
        return null;
    }
}

function scanDirectory(dir: string, exclude: string[] = []): FetchUsage[] {
    const results: FetchUsage[] = [];

    try {
        const entries = readdirSync(dir);

        for (const entry of entries) {
            const fullPath = join(dir, entry);

            if (exclude.some(pattern => fullPath.includes(pattern))) {
                continue;
            }

            const stat = statSync(fullPath);

            if (stat.isDirectory()) {
                results.push(...scanDirectory(fullPath, exclude));
            } else if (entry.match(/\.(ts|tsx|js|jsx)$/)) {
                const analysis = analyzeFile(fullPath);
                if (analysis) {
                    results.push(analysis);
                }
            }
        }
    } catch (error) {
        console.warn(`Could not scan directory ${dir}:`, error);
    }

    return results;
}

function generateMigrationPlan(usages: FetchUsage[]): void {
    const sorted = usages.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

    console.log('🔍 Fetch Usage Analysis\n');

    const totalFetchCalls = usages.reduce((sum, u) => sum + u.fetchCalls, 0);
    const totalSavings = usages.reduce((sum, u) => sum + u.estimatedSavings, 0);

    console.log(`📊 Summary:`);
    console.log(`- Files with fetch: ${usages.length}`);
    console.log(`- Total fetch calls: ${totalFetchCalls}`);
    console.log(`- Estimated LOC savings: ${totalSavings} lines\n`);

    const high = sorted.filter(u => u.migrationPriority === 'high');
    const medium = sorted.filter(u => u.migrationPriority === 'medium');
    const low = sorted.filter(u => u.migrationPriority === 'low');

    if (high.length > 0) {
        console.log('🚨 HIGH PRIORITY (Start here!)');
        high.forEach(usage => {
            console.log(`  📄 ${usage.file.replace(process.cwd() + '/', '')}`);
            console.log(`     - ${usage.fetchCalls} fetch calls, ${usage.lines} lines`);
            console.log(`     - Est. savings: ${usage.estimatedSavings} lines`);
            console.log(`     - Complex patterns: ${usage.complexCalls}\n`);
        });
    }

    if (medium.length > 0) {
        console.log('⚠️  MEDIUM PRIORITY');
        medium.slice(0, 5).forEach(usage => {
            console.log(`  📄 ${usage.file.replace(process.cwd() + '/', '')}`);
            console.log(
                `     - ${usage.fetchCalls} fetch calls, est. savings: ${usage.estimatedSavings} lines\n`,
            );
        });

        if (medium.length > 5) {
            console.log(`     ... and ${medium.length - 5} more medium priority files\n`);
        }
    }

    console.log('🎯 Migration Commands:');
    console.log('');
    console.log('# Start with high priority files:');
    high.slice(0, 3).forEach(usage => {
        const relativePath = usage.file.replace(process.cwd() + '/', '');
        console.log(`# Migrate: ${relativePath}`);
        console.log(`code "${usage.file}"`);
    });
    console.log('');
    console.log('# Install additional dependencies for maximum impact:');
    console.log('bun add @tanstack/react-query react-hook-form @hookform/resolvers');
    console.log('');
    console.log('📖 See docs/guides/ky-migration-guide.md for detailed migration steps');
}

// Main execution
const projectRoot = process.cwd();
const excludePatterns = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '__tests__',
    '.test.',
    '.spec.',
];

console.log('🔄 Scanning for fetch usage...\n');

const usages = scanDirectory(projectRoot, excludePatterns);

if (usages.length === 0) {
    console.log('✅ No fetch calls found! Migration complete or no HTTP requests detected.');
} else {
    generateMigrationPlan(usages);
}
