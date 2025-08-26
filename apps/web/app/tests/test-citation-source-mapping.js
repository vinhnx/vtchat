#!/usr/bin/env bun



// Mock source data that would typically come from AI search results
const mockSources = [
    {
        title: 'First Article Title',
        link: 'https://example.com/article-1',
        snippet: 'This is the first article snippet with important information...',
        index: 1,
    },
    {
        title: 'Second Article Title',
        link: 'https://example.com/article-2',
        snippet: 'This is the second article snippet with different content...',
        index: 2,
    },
    {
        title: 'Third Article Title',
        link: 'https://example.com/article-3',
        snippet: 'This is the third article snippet with more information...',
        index: 3,
    },
];


mockSources.forEach((source, i) => {
    
});

// Simulate the getSourceByIndex function from citation-provider.tsx
function getSourceByIndex(sourceList, index) {
    const result = sourceList.find((source) => source.index === index);
    -> ${result ? `Found: ${result.title}` : 'Not found'}`);
    return result;
}


// Test looking up each source by index
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(mockSources, i);
}

// Test edge cases

getSourceByIndex(mockSources, 0); // Should not find
getSourceByIndex(mockSources, 4); // Should not find
getSourceByIndex(mockSources, '1'); // String instead of number
getSourceByIndex(mockSources, 1.5); // Float instead of integer

// Test what happens if indices are incorrect


const badSources1 = [
    { title: 'Article 1', index: 0 }, // Index starts at 0 instead of 1
    { title: 'Article 2', index: 1 },
    { title: 'Article 3', index: 2 },
];

const badSources2 = [
    { title: 'Article 1', index: 1 },
    { title: 'Article 2', index: 1 }, // Duplicate index
    { title: 'Article 3', index: 3 }, // Missing index 2
];

const badSources3 = [
    { title: 'Article 1' }, // Missing index property
    { title: 'Article 2', index: 2 },
    { title: 'Article 3', index: 3 },
];

:');
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources1, i);
}

:');
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources2, i);
}

:');
for (let i = 1; i <= 3; i++) {
    getSourceByIndex(badSources3, i);
}

// Test citation parsing similar to markdown-content.tsx


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
        return numbers.map((num) => `<Source>${num}</Source>`).join(' ');
    });

    // Handle single citations like [1]
    const citationRegex = /\[(\d+)\](?![^<]*>)/g;
    result = result.replace(citationRegex, (_match, p1) => {
        return `<Source>${p1}</Source>`;
    });

    return result;
}

const parsed = parseCitationsWithSourceTags(testMarkdown);
);
);

// Extract source indices from parsed content
const sourceMatches = parsed.match(/<Source>(\d+)<\/Source>/g) || [];
const extractedIndices = sourceMatches
    .map((match) => {
        const indexMatch = match.match(/<Source>(\d+)<\/Source>/);
        return indexMatch ? Number.parseInt(indexMatch[1]) : null;
    })
    .filter(Boolean);



// Test if all extracted indices can be resolved

extractedIndices.forEach((index) => {
    const source = getSourceByIndex(mockSources, index);
    
});






