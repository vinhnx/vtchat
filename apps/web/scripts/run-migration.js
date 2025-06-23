import { neon } from '@neondatabase/serverless';

async function runMigration() {
    try {
        console.log('🗄️  Connecting to database...');
        
        // Get database URL from environment
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable not set');
        }
        
        const sql = neon(databaseUrl);
        
        console.log('🗄️  Running migration to fix vector dimensions...');
        
        // Check current table structure
        console.log('📋 Checking current embeddings table...');
        try {
            const tableInfo = await sql`
                SELECT column_name, data_type, character_maximum_length 
                FROM information_schema.columns 
                WHERE table_name = 'embeddings' AND column_name = 'embedding'
            `;
            console.log('Current table info:', tableInfo);
        } catch (e) {
            console.log('Table might not exist yet:', e.message);
        }
        
        // Drop and recreate the embeddings table with correct dimensions
        console.log('🗑️  Dropping existing embeddings table...');
        await sql`DROP TABLE IF EXISTS "embeddings" CASCADE`;
        
        console.log('📦 Creating embeddings table with vector(768)...');
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
        
        console.log('🚀 Creating HNSW vector index...');
        await sql`CREATE INDEX "embedding_index" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops)`;
        
        console.log('✅ Migration completed successfully!');
        console.log('📊 New table structure:');
        
        const newTableInfo = await sql`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'embeddings'
        `;
        console.table(newTableInfo);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration().then(() => {
    console.log('🎉 Migration script completed');
    process.exit(0);
});
