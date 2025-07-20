#!/usr/bin/env bun

/**
 * Database diagnostic script for RAG/embeddings issues
 * This script checks the database setup for pgvector and embeddings table
 */

import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

// Load environment variables
config({ path: ['.env.local', '.env'] });

async function diagnoseDatabaseIssues() {
    try {
        console.log('🔍 Starting database diagnostics...');

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable not set');
        }

        const sql = neon(databaseUrl);

        // 1. Check if pgvector extension is installed
        console.log('\n📦 Checking pgvector extension...');
        try {
            const extensions = await sql`
                SELECT name, default_version, installed_version
                FROM pg_available_extensions
                WHERE name = 'vector'
            `;

            if (extensions.length === 0) {
                console.log('❌ pgvector extension is not available');
            } else {
                const ext = extensions[0];
                console.log('✅ pgvector extension found:');
                console.log(`   - Name: ${ext.name}`);
                console.log(`   - Default version: ${ext.default_version}`);
                console.log(`   - Installed version: ${ext.installed_version || 'NOT INSTALLED'}`);

                if (!ext.installed_version) {
                    console.log('⚠️  pgvector extension is available but not installed');
                    console.log('   Run: CREATE EXTENSION IF NOT EXISTS vector;');
                }
            }
        } catch (error) {
            console.log('❌ Error checking pgvector:', error.message);
        }

        // 2. Check if embeddings table exists
        console.log('\n📋 Checking embeddings table...');
        try {
            const tables = await sql`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'embeddings'
            `;

            if (tables.length === 0) {
                console.log('❌ embeddings table does not exist');
            } else {
                console.log('✅ embeddings table exists');

                // Check table structure
                const columns = await sql`
                    SELECT column_name, data_type, character_maximum_length
                    FROM information_schema.columns
                    WHERE table_name = 'embeddings'
                    ORDER BY ordinal_position
                `;

                console.log('   Table structure:');
                columns.forEach(col => {
                    console.log(`   - ${col.column_name}: ${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`);
                });
            }
        } catch (error) {
            console.log('❌ Error checking embeddings table:', error.message);
        }

        // 3. Check if vector similarity operators are available
        console.log('\n🧮 Checking vector operators...');
        try {
            const operators = await sql`
                SELECT oprname, oprleft::regtype, oprright::regtype
                FROM pg_operator
                WHERE oprname IN ('<->', '<#>', '<=>')
            `;

            if (operators.length === 0) {
                console.log('❌ Vector similarity operators not found');
                console.log('   This suggests pgvector extension is not properly installed');
            } else {
                console.log('✅ Vector operators found:');
                operators.forEach(op => {
                    console.log(`   - ${op.oprname}: ${op.oprleft} ${op.oprname} ${op.oprright}`);
                });
            }
        } catch (error) {
            console.log('❌ Error checking vector operators:', error.message);
        }

        // 4. Check if resources table exists (required for embeddings)
        console.log('\n📝 Checking resources table...');
        try {
            const resources = await sql`
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public' AND table_name = 'resources'
            `;

            if (resources.length === 0) {
                console.log('❌ resources table does not exist');
            } else {
                console.log('✅ resources table exists');

                // Check row count
                const count = await sql`SELECT COUNT(*) as count FROM resources`;
                console.log(`   Contains ${count[0].count} resources`);
            }
        } catch (error) {
            console.log('❌ Error checking resources table:', error.message);
        }

        // 5. Test simple vector query (if possible)
        console.log('\n🧪 Testing vector operations...');
        try {
            // Only test if pgvector is installed
            const extensions = await sql`
                SELECT installed_version
                FROM pg_available_extensions
                WHERE name = 'vector' AND installed_version IS NOT NULL
            `;

            if (extensions.length > 0) {
                // Test vector creation and similarity
                const testResult = await sql`
                    SELECT '[1,2,3]'::vector <-> '[1,2,4]'::vector as distance
                `;
                console.log('✅ Vector operations working');
                console.log(`   Test distance: ${testResult[0].distance}`);
            } else {
                console.log('⚠️  Skipping vector test - pgvector not installed');
            }
        } catch (error) {
            console.log('❌ Vector operation test failed:', error.message);
        }

        console.log('\n🏁 Database diagnostics completed');

    } catch (error) {
        console.error('❌ Database diagnostics failed:', error);
        process.exit(1);
    }
}

// Run diagnostics
diagnoseDatabaseIssues()
    .then(() => {
        console.log('\n✅ Diagnostics completed successfully');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Diagnostics failed:', error);
        process.exit(1);
    });
