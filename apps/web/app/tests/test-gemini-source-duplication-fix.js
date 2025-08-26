#!/usr/bin/env bun



// Mock existing sources (what's already in context)
const existingSources = [
    {
        title: 'Existing Source',
        link: 'https://existing.com/page',
        snippet: 'This source already exists...',
        index: 1,
    },
];

// Mock Gemini web search result with duplicate URLs
const mockGeminiResult = {
    sources: [
        {
            title: 'New Source 1',
            url: 'https://example.com/page1',
            description: 'This is the first new source with some content......',
        },
        {
            title: 'New Source 2',
            url: 'https://example.com/page2',
            description: 'This is the second new source with different content......',
        },
        {
            title: 'Duplicate Source',
            url: 'https://example.com/page1', // Same URL as first source
            description: 'This should be filtered out as duplicate......',
        },
    ],
};





=> ({
        title: s.title,
        url: s.url,
        snippet: s.description ? s.description.substring(0, 50) + '......' : '',
    })),
});

// Simulate the deduplication logic from gemini-web-search.ts
function updateSourcesWithDeduplication(current, result) {
    const existingSources = current ?? [];

    // Filter out duplicates within the new sources first
    const uniqueNewSources = [];
    const seenUrls = new Set(existingSources.map((source) => source.link));

    for (const source of result.sources || []) {
        if (
            source?.url
            && typeof source.url === 'string'
            && source.url.trim() !== ''
            && !seenUrls.has(source.url)
        ) {
            seenUrls.add(source.url);
            uniqueNewSources.push(source);
        }
    }

    const newSources = uniqueNewSources.map((source, index) => ({
        title: source.title || 'Web Search Result',
        link: source.url,
        snippet: source.description || '',
        index: index + (existingSources?.length || 0) + 1,
    }));

    + (newSources?.length || 0),
    });

    return [...existingSources, ...newSources];
}

// Test the deduplication
const finalSources = updateSourcesWithDeduplication(existingSources, mockGeminiResult);



');


finalSources.forEach((source, index) => {
    
    
    
    
});

// Validate results
const expectedCount = 3; // 1 existing + 2 unique new sources
const actualCount = finalSources.length;
const hasNoDuplicateUrls = new Set(finalSources.map((s) => s.link)).size === finalSources.length;
const hasProperIndexing = finalSources.every((source, index) => source.index === index + 1);






if (actualCount === expectedCount && hasNoDuplicateUrls && hasProperIndexing) {
    
} else {
    
    process.exit(1);
}
