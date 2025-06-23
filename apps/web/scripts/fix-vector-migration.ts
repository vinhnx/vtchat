import { db } from '../lib/database';
import { sql } from 'drizzle-orm';

async function runMigration() {
    try {
        console.log('🗄️  Running vector type fix migration...');
        
        // Drop existing embeddings table if it exists
        await db.execute(sql`DROP TABLE IF EXISTS "embeddings" CASCADE`);
        console.log('✅ Dropped existing embeddings table');
        
        // Recreate embeddings table with proper vector type
        await db.execute(sql`
            CREATE TABLE "embeddings" (
                "id" varchar(191) PRIMARY KEY,
                "resource_id" varchar(191) NOT NULL,
                "content" text NOT NULL,
                "embedding" vector(768) NOT NULL,
                CONSTRAINT "embeddings_resource_id_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE
            )
        `);
        console.log('✅ Created new embeddings table with vector(768)');
        
        // Create HNSW index for efficient vector similarity search
        await db.execute(sql`CREATE INDEX "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops)`);
        console.log('✅ Created HNSW vector index');
        
        console.log('🎉 Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration().then(() => process.exit(0));
