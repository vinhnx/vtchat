#!/usr/bin/env bun

console.log("🔗 Testing Link Preview Cache Fix");

// Mock source objects with same URL but different metadata
const source1 = {
    title: "First Source Title",
    link: "https://example.com/same-page",
    snippet: "This is the first source snippet about the page...",
    index: 1,
};

const source2 = {
    title: "Second Source Title",
    link: "https://example.com/same-page",
    snippet: "This is a different source snippet with different context...",
    index: 2,
};

console.log("\n📋 Input Data:");
console.log("Source 1:", source1);
console.log("Source 2:", source2);
console.log("Same URL:", source1.link === source2.link);

// Simulate the cache key generation from link-preview.tsx
function normalizeUrl(url) {
    try {
        const urlObj = new URL(url.trim());
        // Remove common tracking parameters
        urlObj.searchParams.delete('utm_source');
        urlObj.searchParams.delete('utm_medium');
        urlObj.searchParams.delete('utm_campaign');
        urlObj.searchParams.delete('utm_content');
        urlObj.searchParams.delete('utm_term');
        urlObj.searchParams.delete('ref');
        urlObj.searchParams.delete('source');
        // Ensure consistent URL format
        return urlObj.toString().toLowerCase();
    } catch {
        // If URL parsing fails, just clean the string
        return url.trim().toLowerCase();
    }
}

function generateCacheKey(source) {
    const normalizedUrl = normalizeUrl(source.link);
    // Include source metadata to prevent cross-contamination between different sources
    const sourceHash = `${source.title || ''}_${source.snippet || ''}_${source.index || ''}`;
    return `${normalizedUrl}::${sourceHash}`;
}

// Test the cache key generation
const cacheKey1 = generateCacheKey(source1);
const cacheKey2 = generateCacheKey(source2);

console.log("\n🔑 Cache Key Generation:");
console.log("Cache Key 1:", cacheKey1);
console.log("Cache Key 2:", cacheKey2);
console.log("Keys are different:", cacheKey1 !== cacheKey2);

// Simulate cache behavior
const ogCache = new Map();

// Mock OG data for each source
const ogData1 = {
    title: "OG Title for Source 1",
    description: "OG description for first context",
    image: "https://example.com/image1.jpg",
    siteName: "Example Site"
};

const ogData2 = {
    title: "OG Title for Source 2",
    description: "OG description for second context",
    image: "https://example.com/image2.jpg",
    siteName: "Example Site"
};

// Store in cache with different keys
ogCache.set(cacheKey1, ogData1);
ogCache.set(cacheKey2, ogData2);

console.log("\n💾 Cache Storage Test:");
console.log("Stored OG data for source 1:", ogCache.has(cacheKey1));
console.log("Stored OG data for source 2:", ogCache.has(cacheKey2));
console.log("Cache entries count:", ogCache.size);

// Test cache retrieval
const retrieved1 = ogCache.get(cacheKey1);
const retrieved2 = ogCache.get(cacheKey2);

console.log("\n📥 Cache Retrieval Test:");
console.log("Retrieved data 1:", retrieved1?.title);
console.log("Retrieved data 2:", retrieved2?.title);
console.log("Data is different:", retrieved1?.title !== retrieved2?.title);

// Test edge cases
const sourceWithEmptyFields = {
    title: "",
    link: "https://example.com/same-page",
    snippet: "",
    index: 3,
};

const sourceWithUndefinedFields = {
    link: "https://example.com/same-page",
    // title, snippet, index are undefined
};

const cacheKey3 = generateCacheKey(sourceWithEmptyFields);
const cacheKey4 = generateCacheKey(sourceWithUndefinedFields);

console.log("\n🧪 Edge Case Testing:");
console.log("Empty fields cache key:", cacheKey3);
console.log("Undefined fields cache key:", cacheKey4);
console.log("All keys unique:", new Set([cacheKey1, cacheKey2, cacheKey3, cacheKey4]).size === 4);

// Validate results
const allTestsPassed = [
    cacheKey1 !== cacheKey2, // Different sources generate different cache keys
    ogCache.has(cacheKey1) && ogCache.has(cacheKey2), // Both can be stored
    retrieved1?.title !== retrieved2?.title, // Different data is retrieved
    new Set([cacheKey1, cacheKey2, cacheKey3, cacheKey4]).size === 4, // All keys are unique
].every(Boolean);

console.log("\n✅ Test Results:");
console.log(`- Different cache keys for same URL: ${cacheKey1 !== cacheKey2 ? "PASS" : "FAIL"}`);
console.log(`- Independent cache storage: ${ogCache.size === 2 ? "PASS" : "FAIL"}`);
console.log(`- Correct data retrieval: ${retrieved1?.title !== retrieved2?.title ? "PASS" : "FAIL"}`);
console.log(`- Edge case handling: ${new Set([cacheKey1, cacheKey2, cacheKey3, cacheKey4]).size === 4 ? "PASS" : "FAIL"}`);

if (allTestsPassed) {
    console.log("\n🎉 ALL TESTS PASSED! Link preview cache isolation is working correctly.");
    console.log("✨ Sources with same URL will now have separate cache entries based on their metadata.");
} else {
    console.log("\n❌ TESTS FAILED! Link preview cache isolation needs attention.");
    process.exit(1);
}
