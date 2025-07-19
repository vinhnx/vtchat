import { neon } from "@neondatabase/serverless";
import { log } from "@repo/shared/logger";

async function runMigration() {
    try {
        log.info("🗄️  Connecting to database...");

        // Get database URL from environment
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error("DATABASE_URL environment variable not set");
        }

        const sql = neon(databaseUrl);

        log.info("🗄️  Running migration to fix vector dimensions...");

        // Check current table structure
        log.info("📋 Checking current embeddings table...");
        try {
            const tableInfo = await sql`
                SELECT column_name, data_type, character_maximum_length 
                FROM information_schema.columns 
                WHERE table_name = 'embeddings' AND column_name = 'embedding'
            `;
            log.info({ tableInfo }, "Current table info");
        } catch (e) {
            log.warn({ error: e.message }, "Table might not exist yet");
        }

        // Drop and recreate the embeddings table with correct dimensions
        log.info("🗑️  Dropping existing embeddings table...");
        await sql`DROP TABLE IF EXISTS "embeddings" CASCADE`;

        log.info("📦 Creating embeddings table with vector(768)...");
        await sql`
            CREATE TABLE "embeddings" (
                "id" varchar(191) PRIMARY KEY,
                "resource_id" varchar(191) NOT NULL,
                "content" text NOT NULL,
                "embedding" vector(768) NOT NULL,
                CONSTRAINT "embeddings_resource_id_resources_id_fk" 
                FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE
            )
        `;

        log.info("🚀 Creating HNSW vector index...");
        await sql`CREATE INDEX "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops)`;

        log.info("✅ Migration completed successfully!");
        log.info("📊 New table structure:");

        const newTableInfo = await sql`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'embeddings'
        `;
        log.info({ newTableInfo }, "New table structure");
    } catch (error) {
        log.error({ error }, "❌ Migration failed");
        process.exit(1);
    }
}

runMigration().then(() => {
    log.info("🎉 Migration script completed");
    process.exit(0);
});
