#!/usr/bin/env bun

console.log("🔍 Testing Citation Source Mapping");

// Mock source data that would typically come from AI search results
const mockSources = [
    {
        title: "First Article Title",
        link: "https://example.com/article-1",
        snippet: "This is the first article snippet with important information...",
        index: 1,
    },
    {
        title: "Second Article Title",
        link: "https://example.com/article-2",
        snippet: "This is the second article snippet with different content...",
        index: 2,
    },
    {
        title: "Third Article Title",
        link: "https://example.com/article-3",
        snippet: "This is the third article snippet with more information...",
        index: 3,
    },
];

console.log("\n📋 Mock Sources Data:");
mockSources.forEach((source, i) => {
    console.log(`Source ${i}: index=${source.index}, title="${source.title}"`);
});

// Simulate the getSourceByIndex function from citation-provider.tsx
function getSourceByIndex(sourceList, index) {
    const result = sourceList.find((source) => source.index === index);
    console.log(`getSourceByIndex(${index}) -> ${result ? `Found: ${result.title}` : "Not found"}`);
    return result;
}

console.log("\n🔍 Testing Source Lookup:");
// Test looking up each source by index
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(mockSources, i);
}

// Test edge cases
console.log("\n🧪 Edge Case Testing:");
getSourceByIndex(mockSources, 0); // Should not find
getSourceByIndex(mockSources, 4); // Should not find
getSourceByIndex(mockSources, "1"); // String instead of number
getSourceByIndex(mockSources, 1.5); // Float instead of integer

// Test what happens if indices are incorrect
console.log("\n⚠️ Testing Problematic Index Scenarios:");

const badSources1 = [
    { title: "Article 1", index: 0 }, // Index starts at 0 instead of 1
    { title: "Article 2", index: 1 },
    { title: "Article 3", index: 2 },
];

const badSources2 = [
    { title: "Article 1", index: 1 },
    { title: "Article 2", index: 1 }, // Duplicate index
    { title: "Article 3", index: 3 }, // Missing index 2
];

const badSources3 = [
    { title: "Article 1" }, // Missing index property
    { title: "Article 2", index: 2 },
    { title: "Article 3", index: 3 },
];

console.log("\nBad Sources 1 (0-based indexing):");
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources1, i);
}

console.log("\nBad Sources 2 (duplicate/missing indices):");
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources2, i);
}

console.log("\nBad Sources 3 (missing index property):");
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources3, i);
}

// Test citation parsing similar to markdown-content.tsx
console.log("\n📝 Testing Citation Parsing:");

const testMarkdown = `
Here is some text with citations [1] and [2].
Multiple citations [1,2,3] should work too.
Another reference [3] at the end.
`;

function parseCitationsWithSourceTags(markdown) {
    let result = markdown;

    // Handle multiple citations like [1,2,3]
    const multipleCitationsRegex = /\[(\d+(?:,\s*\d+)+)\]/g;
    result = result.replace(multipleCitationsRegex, (match) => {
        const numbers = match.match(/\d+/g) || [];
        return numbers.map((num) => `<Source>${num}</Source>`).join(" ");
    });

    // Handle single citations like [1]
    const citationRegex = /\[(\d+)\](?![^<]*>)/g;
    result = result.replace(citationRegex, (_match, p1) => {
        return `<Source>${p1}</Source>`;
    });

    return result;
}

const parsed = parseCitationsWithSourceTags(testMarkdown);
console.log("Original:", testMarkdown.trim());
console.log("Parsed:", parsed.trim());

// Extract source indices from parsed content
const sourceMatches = parsed.match(/<Source>(\d+)<\/Source>/g) || [];
const extractedIndices = sourceMatches
    .map((match) => {
        const indexMatch = match.match(/<Source>(\d+)<\/Source>/);
        return indexMatch ? Number.parseInt(indexMatch[1]) : null;
    })
    .filter(Boolean);

console.log("Extracted indices:", extractedIndices);

// Test if all extracted indices can be resolved
console.log("\n✅ Index Resolution Test:");
extractedIndices.forEach((index) => {
    const source = getSourceByIndex(mockSources, index);
    console.log(`Citation ${index}: ${source ? "✅ RESOLVED" : "❌ NOT FOUND"}`);
});

console.log("\n🎯 Summary:");
console.log("- Citation parsing extracts indices correctly");
console.log("- Source lookup depends on exact index matching");
console.log("- Issues occur when source.index doesn't match citation number");
console.log("- Common problems: 0-based vs 1-based indexing, missing/duplicate indices");
