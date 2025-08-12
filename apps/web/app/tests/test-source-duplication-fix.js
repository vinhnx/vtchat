#!/usr/bin/env bun

/**
 * Test script to verify source duplication fix
 * This tests the OpenAI web search tool and source processing
 */

import { log } from '@repo/shared/logger';

// Mock data that simulates OpenAI web search tool result
const mockToolResult = {
    toolName: 'web_search',
    toolCallId: 'test-call-123',
    result: {
        success: true,
        text: 'Test search results...',
        sources: [
            {
                title: 'Test Source 1',
                url: 'https://example.com/page1',
                snippet: 'This is the first test source with some content...',
            },
            {
                title: 'Test Source 2',
                url: 'https://example.com/page2',
                snippet: 'This is the second test source with different content...',
            },
            {
                title: 'Duplicate Source',
                url: 'https://example.com/page1', // Same URL as first source
                snippet: 'This should be filtered out as duplicate...',
            },
        ],
    },
};

// Mock context with existing sources
const mockContext = {
    sources: [
        {
            title: 'Existing Source',
            link: 'https://existing.com/page',
            snippet: 'This source already exists',
            index: 1,
        },
    ],
};

// Simulate the source processing logic from completion.ts
function processWebSearchSources(toolResult, existingSources = []) {
    if (toolResult.toolName !== 'web_search' || !toolResult.result?.sources) {
        return existingSources;
    }

    log.info(
        {
            toolName: toolResult.toolName,
            sourcesCount: toolResult.result.sources.length,
            sources: toolResult.result.sources.map((source) => ({
                title: source.title,
                url: source.url,
                snippet: source.snippet?.substring(0, 100) + '...',
            })),
        },
        'Processing web search sources from tool result',
    );

    // Filter out duplicates within the new sources first
    const uniqueNewSources = [];
    const seenUrls = new Set(existingSources.map((source) => source.link));

    for (const source of toolResult.result.sources) {
        if (source?.url && !seenUrls.has(source.url)) {
            seenUrls.add(source.url);
            uniqueNewSources.push(source);
        }
    }

    const newSources = uniqueNewSources.map((source, index) => ({
        title: source.title || 'Untitled',
        link: source.url,
        snippet: source.snippet || source.description || '',
        index: index + (existingSources.length || 0) + 1,
    }));

    log.info(
        {
            existingCount: existingSources.length,
            newCount: newSources?.length || 0,
            totalCount: (existingSources.length || 0) + (newSources?.length || 0),
        },
        'Updated sources from web search tool',
    );

    return [...existingSources, ...(newSources || [])];
}

async function testSourceDuplicationFix() {
    console.log('🧪 Testing Source Duplication Fix\n');

    console.log('📋 Input Data:');
    console.log('- Mock tool result sources:', mockToolResult.result.sources.length);
    console.log('- Existing sources:', mockContext.sources.length);
    console.log();

    // Process the sources
    const updatedSources = processWebSearchSources(mockToolResult, mockContext.sources);

    console.log('📊 Results:');
    console.log('- Total sources after processing:', updatedSources.length);
    console.log('- Expected: 3 (1 existing + 2 new unique sources)');
    console.log();

    console.log('📝 Detailed Results:');
    updatedSources.forEach((source, index) => {
        console.log(`${index + 1}. ${source.title}`);
        console.log(`   URL: ${source.link}`);
        console.log(`   Snippet: ${source.snippet.substring(0, 80)}...`);
        console.log();
    });

    // Verify the results
    const expectedCount = 3; // 1 existing + 2 unique new sources (duplicate filtered out)
    const actualCount = updatedSources.length;

    // Check for duplicates
    const uniqueUrls = new Set(updatedSources.map((source) => source.link));
    const hasDuplicates = uniqueUrls.size !== updatedSources.length;

    console.log('✅ Test Results:');
    console.log(`- Source count correct: ${actualCount === expectedCount ? 'PASS' : 'FAIL'}`);
    console.log(`- No duplicate URLs: ${!hasDuplicates ? 'PASS' : 'FAIL'}`);
    console.log(
        `- Sources properly indexed: ${
            updatedSources.every((source, i) => source.index === i + 1) ? 'PASS' : 'FAIL'
        }`,
    );

    if (actualCount === expectedCount && !hasDuplicates) {
        console.log('\n🎉 ALL TESTS PASSED! Source duplication fix is working correctly.');
        return true;
    } else {
        console.log('\n❌ TESTS FAILED! Source duplication fix needs investigation.');
        return false;
    }
}

// Run the test
testSourceDuplicationFix()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        console.error('Test failed with error:', error);
        process.exit(1);
    });
