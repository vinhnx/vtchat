// Test script to verify database can handle 3072-dimensional embeddings
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pool } = require("pg");

async function testDatabaseEmbedding() {
    console.log("Testing database embedding insertion with 3072 dimensions...");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ GEMINI_API_KEY not found in environment");
        process.exit(1);
    }

    // Create Neon database connection
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ DATABASE_URL not found in environment");
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
    });

    try {
        // Generate embedding using Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        const testText =
            "This is a test text for database embedding verification with 3072 dimensions.";
        console.log(`📝 Generating embedding for: "${testText}"`);

        const result = await model.embedContent(testText);
        const embedding = result.embedding.values;

        console.log(`✅ Generated embedding with ${embedding.length} dimensions`);

        // Get a test resource to link to
        const resourceQuery = "SELECT id FROM resources LIMIT 1";
        const resourceResult = await pool.query(resourceQuery);

        if (resourceResult.rows.length === 0) {
            console.log("⚠️ No resources found, creating a test resource...");

            // Create a test user first
            const createUserQuery = `
                INSERT INTO users (id, name, email, email_verified)
                VALUES ('test-user-embed', 'Test User', 'test-embed@example.com', false)
                ON CONFLICT (id) DO NOTHING
                RETURNING id
            `;
            await pool.query(createUserQuery);

            // Create a test resource
            const createResourceQuery = `
                INSERT INTO resources (id, user_id, content)
                VALUES ('test-resource-embed', 'test-user-embed', 'Test resource for embedding')
                ON CONFLICT (id) DO NOTHING
                RETURNING id
            `;
            const createResult = await pool.query(createResourceQuery);
            resourceId = "test-resource-embed";
        } else {
            resourceId = resourceResult.rows[0].id;
        }

        console.log(`🔗 Using resource ID: ${resourceId}`);

        // Insert embedding into database
        const embeddingArray = `[${embedding.join(",")}]`;
        const insertQuery = `
            INSERT INTO embeddings (id, resource_id, content, embedding)
            VALUES ($1, $2, $3, $4::vector)
            RETURNING id, vector_dims(embedding) as dimensions
        `;

        console.log("💾 Inserting embedding into database...");
        const insertResult = await pool.query(insertQuery, [
            "test-embed-3072",
            resourceId,
            testText,
            embeddingArray,
        ]);

        console.log("✅ Successfully inserted embedding!");
        console.log(`📊 Database stored dimensions: ${insertResult.rows[0].dimensions}`);
        console.log(`🆔 Embedding ID: ${insertResult.rows[0].id}`);

        // Test cosine similarity query
        console.log("🔍 Testing cosine similarity query...");
        const similarityQuery = `
            SELECT
                id,
                content,
                embedding <=> $1::vector as cosine_distance
            FROM embeddings
            WHERE id = 'test-embed-3072'
        `;

        const similarityResult = await pool.query(similarityQuery, [embeddingArray]);
        console.log(
            `📏 Cosine distance (self-similarity): ${similarityResult.rows[0].cosine_distance}`,
        );

        console.log(
            "🎉 All tests passed! Database successfully handles 3072-dimensional embeddings.",
        );
    } catch (error) {
        console.error("❌ Error testing database embedding:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

testDatabaseEmbedding();
