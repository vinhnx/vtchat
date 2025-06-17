#!/usr/bin/env node

/**
 * Bundle Size Tracker
 *
 * This script tracks and compares bundle sizes across builds.
 * It can be used locally or in CI to monitor bundle size changes.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUNDLE_HISTORY_FILE = 'bundle-history.json';
const WEB_APP_PATH = './apps/web';

function getBundleStats() {
    const buildOutputPath = path.join(WEB_APP_PATH, '.next');

    if (!fs.existsSync(buildOutputPath)) {
        throw new Error('Next.js build output not found. Run `bun run build` first.');
    }

    // Read build manifest for detailed info
    const buildManifest = JSON.parse(
        fs.readFileSync(path.join(buildOutputPath, 'build-manifest.json'), 'utf8')
    );

    const appBuildManifest = JSON.parse(
        fs.readFileSync(path.join(buildOutputPath, 'app-build-manifest.json'), 'utf8')
    );

    // Calculate total sizes
    const allFiles = [
        ...(buildManifest.allFiles || []),
        ...Object.values(appBuildManifest.pages || {}).flat(),
    ];

    let totalSize = 0;
    const fileSizes = {};

    allFiles.forEach(file => {
        const filePath = path.join(buildOutputPath, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            fileSizes[file] = stats.size;
            totalSize += stats.size;
        }
    });

    return {
        timestamp: new Date().toISOString(),
        commit: getGitCommit(),
        totalSize,
        fileCount: allFiles.length,
        pages: Object.keys(buildManifest.pages || {}).length,
        largestFiles: Object.entries(fileSizes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([file, size]) => ({ file, size: formatBytes(size) })),
        breakdown: {
            static: calculateStaticSize(fileSizes),
            chunks: calculateChunksSize(fileSizes),
            pages: calculatePagesSize(fileSizes),
        },
    };
}

function calculateStaticSize(fileSizes) {
    return Object.entries(fileSizes)
        .filter(([file]) => file.includes('/static/'))
        .reduce((sum, [, size]) => sum + size, 0);
}

function calculateChunksSize(fileSizes) {
    return Object.entries(fileSizes)
        .filter(([file]) => file.includes('/chunks/'))
        .reduce((sum, [, size]) => sum + size, 0);
}

function calculatePagesSize(fileSizes) {
    return Object.entries(fileSizes)
        .filter(([file]) => file.includes('/pages/') || file.includes('/app/'))
        .reduce((sum, [, size]) => sum + size, 0);
}

function getGitCommit() {
    try {
        return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch {
        return 'unknown';
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function loadBundleHistory() {
    if (fs.existsSync(BUNDLE_HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(BUNDLE_HISTORY_FILE, 'utf8'));
    }
    return [];
}

function saveBundleHistory(history) {
    fs.writeFileSync(BUNDLE_HISTORY_FILE, JSON.stringify(history, null, 2));
}

function compareBundles(current, previous) {
    if (!previous) {
        return {
            totalSizeChange: 0,
            totalSizeChangePercent: 0,
            isImprovement: null,
        };
    }

    const sizeDiff = current.totalSize - previous.totalSize;
    const sizeChangePercent = (sizeDiff / previous.totalSize) * 100;

    return {
        totalSizeChange: sizeDiff,
        totalSizeChangePercent: sizeChangePercent,
        isImprovement: sizeDiff < 0,
        previousSize: formatBytes(previous.totalSize),
        currentSize: formatBytes(current.totalSize),
        sizeDiffFormatted: `${sizeDiff >= 0 ? '+' : ''}${formatBytes(Math.abs(sizeDiff))}`,
    };
}

function generateReport(stats, comparison) {
    console.log('\n📦 Bundle Size Report\n');
    console.log(`🕐 Timestamp: ${stats.timestamp}`);
    console.log(`📝 Commit: ${stats.commit.substring(0, 8)}`);
    console.log(`📁 Total Files: ${stats.fileCount}`);
    console.log(`📄 Pages: ${stats.pages}`);
    console.log(`💾 Total Bundle Size: ${formatBytes(stats.totalSize)}`);

    if (comparison.previousSize) {
        const emoji = comparison.isImprovement
            ? '🟢'
            : comparison.totalSizeChange === 0
              ? '🟡'
              : '🔴';

        console.log(
            `\n${emoji} Size Change: ${comparison.sizeDiffFormatted} (${comparison.totalSizeChangePercent.toFixed(2)}%)`
        );
        console.log(`   Previous: ${comparison.previousSize}`);
        console.log(`   Current:  ${comparison.currentSize}`);
    }

    console.log('\n📊 Breakdown:');
    console.log(`   Static: ${formatBytes(stats.breakdown.static)}`);
    console.log(`   Chunks: ${formatBytes(stats.breakdown.chunks)}`);
    console.log(`   Pages:  ${formatBytes(stats.breakdown.pages)}`);

    console.log('\n🔍 Largest Files:');
    stats.largestFiles.forEach(({ file, size }, i) => {
        console.log(`   ${i + 1}. ${file} - ${size}`);
    });
}

function main() {
    const command = process.argv[2];

    try {
        switch (command) {
            case 'track':
                console.log('📊 Analyzing current bundle...');
                const stats = getBundleStats();
                const history = loadBundleHistory();
                const previous = history[history.length - 1];
                const comparison = compareBundles(stats, previous);

                // Add to history
                history.push(stats);

                // Keep only last 50 entries
                if (history.length > 50) {
                    history.splice(0, history.length - 50);
                }

                saveBundleHistory(history);
                generateReport(stats, comparison);

                // Exit with error code if bundle size increased significantly
                if (comparison.totalSizeChangePercent > 5) {
                    console.log('\n❌ Bundle size increased by more than 5%!');
                    process.exit(1);
                }
                break;

            case 'history':
                const savedHistory = loadBundleHistory();
                if (savedHistory.length === 0) {
                    console.log('No bundle history found. Run `track` first.');
                    return;
                }

                console.log('\n📈 Bundle Size History\n');
                savedHistory.slice(-10).forEach((entry, i) => {
                    console.log(
                        `${entry.timestamp} | ${entry.commit.substring(0, 8)} | ${formatBytes(entry.totalSize)}`
                    );
                });
                break;

            case 'clean':
                if (fs.existsSync(BUNDLE_HISTORY_FILE)) {
                    fs.unlinkSync(BUNDLE_HISTORY_FILE);
                    console.log('✅ Bundle history cleared.');
                } else {
                    console.log('ℹ️  No bundle history to clear.');
                }
                break;

            default:
                console.log(`
Bundle Size Tracker

Usage:
  node scripts/track-bundle-size.js track     # Track current bundle size
  node scripts/track-bundle-size.js history   # Show bundle size history
  node scripts/track-bundle-size.js clean     # Clear bundle history

Make sure to run 'bun run build' first.
                `);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    getBundleStats,
    formatBytes,
    compareBundles,
};
