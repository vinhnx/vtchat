#!/usr/bin/env bun



// Mock source objects with same URL but different metadata
const source1 = {
    title: 'First Source Title',
    link: 'https://example.com/same-page',
    snippet: 'This is the first source snippet about the page...',
    index: 1,
};

const source2 = {
    title: 'Second Source Title',
    link: 'https://example.com/same-page',
    snippet: 'This is a different source snippet with different context...',
    index: 2,
};






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






// Simulate cache behavior
const ogCache = new Map();

// Mock OG data for each source
const ogData1 = {
    title: 'OG Title for Source 1',
    description: 'OG description for first context',
    image: 'https://example.com/image1.jpg',
    siteName: 'Example Site',
};

const ogData2 = {
    title: 'OG Title for Source 2',
    description: 'OG description for second context',
    image: 'https://example.com/image2.jpg',
    siteName: 'Example Site',
};

// Store in cache with different keys
ogCache.set(cacheKey1, ogData1);
ogCache.set(cacheKey2, ogData2);


);
);


// Test cache retrieval
const retrieved1 = ogCache.get(cacheKey1);
const retrieved2 = ogCache.get(cacheKey2);






// Test edge cases
const sourceWithEmptyFields = {
    title: '',
    link: 'https://example.com/same-page',
    snippet: '',
    index: 3,
};

const sourceWithUndefinedFields = {
    link: 'https://example.com/same-page',
    // title, snippet, index are undefined
};

const cacheKey3 = generateCacheKey(sourceWithEmptyFields);
const cacheKey4 = generateCacheKey(sourceWithUndefinedFields);




.size === 4);

// Validate results
const allTestsPassed = [
    cacheKey1 !== cacheKey2, // Different sources generate different cache keys
    ogCache.has(cacheKey1) && ogCache.has(cacheKey2), // Both can be stored
    retrieved1?.title !== retrieved2?.title, // Different data is retrieved
    new Set([cacheKey1, cacheKey2, cacheKey3, cacheKey4]).size === 4, // All keys are unique
].every(Boolean);





.size === 4 ? 'PASS' : 'FAIL'
    }`,
);

if (allTestsPassed) {
    
    
} else {
    
    process.exit(1);
}
