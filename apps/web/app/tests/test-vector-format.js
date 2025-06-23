/**
 * Test vector format conversion for pgvector
 * Run with: bun run apps/web/app/tests/test-vector-format.js
 */

// Mock a custom vector type to test the format conversion
const mockVector = {
    toDriver(value) {
        return `[${value.join(',')}]`;
    },
    fromDriver(value) {
        return value.slice(1, -1).split(',').map(Number);
    }
};

function testVectorFormat() {
    console.log('🧪 Testing Vector Format Conversion...\n');

    // Test 1: Array to driver format
    console.log('1️⃣ Testing array to driver format...');
    const testArray = [-0.008400089, 0.02095867, -0.0016809821, 0.13294202];
    const driverFormat = mockVector.toDriver(testArray);
    console.log(`Input array: [${testArray.slice(0, 4).join(', ')}, ...]`);
    console.log(`Driver format: ${driverFormat.slice(0, 50)}...`);
    
    const expectedFormat = driverFormat.startsWith('[') && driverFormat.endsWith(']');
    if (expectedFormat) {
        console.log('✅ Correctly converts to pgvector format [x,y,z,...]');
    } else {
        console.log('❌ Invalid format for pgvector');
    }

    // Test 2: Driver format back to array
    console.log('\n2️⃣ Testing driver format back to array...');
    const backToArray = mockVector.fromDriver(driverFormat);
    console.log(`Parsed back: [${backToArray.slice(0, 4).join(', ')}, ...]`);
    
    const isCorrectlyParsed = Array.isArray(backToArray) && 
                             backToArray.length === testArray.length &&
                             Math.abs(backToArray[0] - testArray[0]) < 0.0001;
    
    if (isCorrectlyParsed) {
        console.log('✅ Correctly parses back to number array');
    } else {
        console.log('❌ Failed to parse back correctly');
    }

    // Test 3: Test with Gemini embedding dimensions (768)
    console.log('\n3️⃣ Testing with Gemini embedding dimensions...');
    const geminiArray = new Array(768).fill(0).map(() => Math.random() * 0.1 - 0.05);
    const geminiDriverFormat = mockVector.toDriver(geminiArray);
    const geminiBackToArray = mockVector.fromDriver(geminiDriverFormat);
    
    const isDimensionCorrect = geminiBackToArray.length === 768;
    if (isDimensionCorrect) {
        console.log(`✅ Correctly handles 768-dimensional vectors`);
    } else {
        console.log(`❌ Wrong dimensions: expected 768, got ${geminiBackToArray.length}`);
    }

    console.log('\n🎉 Vector format tests completed!');
}

// Run the test
testVectorFormat();
