/**
 * Script to promote a user to admin status
 * Usage: bun run scripts/promote-admin.js vinhnguyen2308@gmail.com
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

// Import schema (adjust path as needed)
const _users = {
    id: 'id',
    email: 'email',
    role: 'role',
};

async function promoteUserToAdmin(email) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const _db = drizzle(client);

        // Update user role to admin
        const result = await client.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
            ['admin', email],
        );

        if (result.rows.length === 0) {
            console.log(`❌ No user found with email: ${email}`);
            return false;
        }

        const user = result.rows[0];
        console.log('✅ Successfully promoted user to admin:');
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);

        return true;
    } catch (error) {
        console.error('❌ Error promoting user to admin:', error);
        return false;
    } finally {
        await client.end();
        console.log('Database connection closed');
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    console.log('❌ Please provide an email address');
    console.log('Usage: bun run scripts/promote-admin.js <email>');
    process.exit(1);
}

// Run the promotion
promoteUserToAdmin(email).then((success) => {
    process.exit(success ? 0 : 1);
});
