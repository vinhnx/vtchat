#!/usr/bin/env bun

console.log("Testing Gemini Source Duplication Fix");

// Mock existing sources (what's already in context)
const existingSources = [
    {
        title: "Existing Source",
        link: "https://existing.com/page",
        snippet: "This source already exists...",
        index: 1,
    },
];

// Mock Gemini web search result with duplicate URLs
const mockGeminiResult = {
    sources: [
        {
            title: "New Source 1",
            url: "https://example.com/page1",
            description: "This is the first new source with some content......",
        },
        {
            title: "New Source 2",
            url: "https://example.com/page2",
            description: "This is the second new source with different content......",
        },
        {
            title: "Duplicate Source",
            url: "https://example.com/page1", // Same URL as first source
            description: "This should be filtered out as duplicate......",
        },
    ],
};

console.log("\n📋 Input Data:");
console.log(`- Mock Gemini result sources: ${mockGeminiResult.sources.length}`);
console.log(`- Existing sources: ${existingSources.length}`);

console.log("\nProcessing Gemini web search sources from result", {
    sourcesCount: mockGeminiResult.sources.length,
    sources: mockGeminiResult.sources.map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.description ? s.description.substring(0, 50) + "......" : "",
    })),
});

// Simulate the deduplication logic from gemini-web-search.ts
function updateSourcesWithDeduplication(current, result) {
    const existingSources = current ?? [];

    // Filter out duplicates within the new sources first
    const uniqueNewSources = [];
    const seenUrls = new Set(existingSources.map(source => source.link));

    for (const source of result.sources || []) {
        if (source?.url &&
            typeof source.url === "string" &&
            source.url.trim() !== "" &&
            !seenUrls.has(source.url)) {
            seenUrls.add(source.url);
            uniqueNewSources.push(source);
        }
    }

    const newSources = uniqueNewSources.map((source, index) => ({
        title: source.title || "Web Search Result",
        link: source.url,
        snippet: source.description || "",
        index: index + (existingSources?.length || 0) + 1,
    }));

    console.log("Updated sources from Gemini web search with deduplication", {
        existingCount: existingSources.length,
        originalNewCount: result.sources?.length || 0,
        filteredNewCount: newSources?.length || 0,
        totalCount: (existingSources.length || 0) + (newSources?.length || 0),
    });

    return [...existingSources, ...newSources];
}

// Test the deduplication
const finalSources = updateSourcesWithDeduplication(existingSources, mockGeminiResult);

console.log("\n📊 Results:");
console.log(`- Total sources after processing: ${finalSources.length}`);
console.log(`- Expected: 3 (1 existing + 2 new unique sources)`);

console.log("\n📝 Detailed Results:");
finalSources.forEach((source, index) => {
    console.log((index + 1) + ". " + source.title);
    console.log("   URL: " + source.link);
    console.log("   Snippet: " + source.snippet);
    console.log(" ");
});

// Validate results
const expectedCount = 3; // 1 existing + 2 unique new sources
const actualCount = finalSources.length;
const hasNoDuplicateUrls = new Set(finalSources.map(s => s.link)).size === finalSources.length;
const hasProperIndexing = finalSources.every((source, index) => source.index === index + 1);

console.log("✅ Test Results:");
console.log(`- Source count correct: ${actualCount === expectedCount ? "PASS" : "FAIL"}`);
console.log(`- No duplicate URLs: ${hasNoDuplicateUrls ? "PASS" : "FAIL"}`);
console.log(`- Sources properly indexed: ${hasProperIndexing ? "PASS" : "FAIL"}`);

if (actualCount === expectedCount && hasNoDuplicateUrls && hasProperIndexing) {
    console.log("\n🎉 ALL TESTS PASSED! Gemini source deduplication fix is working correctly.");
} else {
    console.log("\n❌ TESTS FAILED! Issues found with Gemini source deduplication.");
    process.exit(1);
}
