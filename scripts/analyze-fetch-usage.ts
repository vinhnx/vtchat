#!/usr/bin/env bun

/**
 * Migration Helper Script
 * Analyzes fetch usage and provides migration recommendations
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { log } from '@repo/shared/lib/logger';

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
        log.error({ error: error as Error, filePath }, `Error analyzing file ${filePath}`);
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
        log.error({ error: error as Error, dir }, `Error scanning directory ${dir}`);
    }

    return results;
}

function generateMigrationPlan(usages: FetchUsage[]): void {
    const sorted = usages.sort((a, b) => b.estimatedSavings - a.estimatedSavings);

    log.info('🚀 Fetch Migration Analysis Report\n================================');

    const totalFetchCalls = usages.reduce((sum, u) => sum + u.fetchCalls, 0);
    const totalSavings = usages.reduce((sum, u) => sum + u.estimatedSavings, 0);

    log.info({ 
        totalFiles: usages.length,
        totalFetchCalls,
        estimatedSavings: totalSavings
    }, '📊 Migration Summary');

    const high = sorted.filter(u => u.migrationPriority === 'high');
    const medium = sorted.filter(u => u.migrationPriority === 'medium');
    const low = sorted.filter(u => u.migrationPriority === 'low');

    if (high.length > 0) {
        log.info({ highPriorityCount: high.length }, '🔴 High Priority Migrations:');
        high.forEach(usage => {
            log.info({
                file: usage.file.replace(process.cwd() + '/', ''),
                fetchCalls: usage.fetchCalls,
                estimatedSavings: usage.estimatedSavings
            }, 'High priority migration target');
        });
    }

    if (medium.length > 0) {
        log.info({ mediumPriorityCount: medium.length }, '🟡 Medium Priority Migrations:');
        medium.slice(0, 5).forEach(usage => {
            log.info({
                file: usage.file.replace(process.cwd() + '/', ''),
                fetchCalls: usage.fetchCalls,
                estimatedSavings: usage.estimatedSavings
            }, 'Medium priority migration target');
        });

        if (medium.length > 5) {
            log.info({ additionalFiles: medium.length - 5 }, 'Additional medium priority files');
        }
    }

    log.info('💡 Top Recommendations:\n   1. Start with high-priority files for maximum impact\n   2. Focus on files with complex fetch patterns first\n   3. Use the new API client for consistent error handling');
    high.slice(0, 3).forEach(usage => {
        const relativePath = usage.file.replace(process.cwd() + '/', '');
        log.info({ file: relativePath }, 'Complex fetch pattern file');
    });

    log.info('🔧 Migration Strategy:\n   1. Replace basic fetch calls with apiClient.get/post/put/delete\n   2. Use apiClient.withRetry() for unreliable endpoints\n   3. Add apiClient.withTimeout() for time-sensitive requests\n   4. Leverage built-in response parsing and error handling');
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

log.info('🔍 Analyzing fetch usage across the codebase...');

const usages = scanDirectory(projectRoot, excludePatterns);

if (usages.length === 0) {
    log.info('✅ No fetch usage found in the codebase. Great job!');
} else {
    generateMigrationPlan(usages);
}
