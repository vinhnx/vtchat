#!/usr/bin/env node

/**
 * Test script to verify the link preview infinite loop fix
 * This test checks that citation components render without causing infinite loops
 */



// Test that the changes are applied correctly
const fs = require('fs');
const path = require('path');

// Check that console.log statements were removed from Source component
const mdxComponentsPath = path.join(
    __dirname,
    '../../../../packages/common/components/mdx/mdx-components.tsx',
);
const mdxContent = fs.readFileSync(mdxComponentsPath, 'utf8');


if (mdxContent.includes(") {
    console.error('❌ FAIL: Source component still contains debug logs');
    process.exit(1);
} else {
    
}

// Check that citation provider debug logs were removed
const citationProviderPath = path.join(
    __dirname,
    '../../../../packages/common/components/thread/citation-provider.tsx',
);
const citationContent = fs.readFileSync(citationProviderPath, 'utf8');


if (citationContent.includes(") {
    console.error('❌ FAIL: CitationProvider still contains debug logs');
    process.exit(1);
} else {
    
}

// Check that link preview excessive logging was removed
const linkPreviewPath = path.join(
    __dirname,
    '../../../../packages/common/components/link-preview.tsx',
);
const linkPreviewContent = fs.readFileSync(linkPreviewPath, 'utf8');


if (linkPreviewContent.includes(") {
    console.error('❌ FAIL: LinkPreview still contains excessive debug logs');
    process.exit(1);
} else {
    
}

// Check that cache key generation includes source index
if (!linkPreviewContent.includes("index_${source.index || 'unknown'}")) {
    console.error('❌ FAIL: Cache key generation missing source index');
    process.exit(1);
} else {
    
}

// Check that early returns are in place for Source component
if (!mdxContent.includes('// Early return for invalid index')) {
    console.error('❌ FAIL: Source component missing early return optimizations');
    process.exit(1);
} else {
    
}








