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

        const _db = drizzle(client);

        // Update user role to admin
        const result = await client.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, email, role',
            ['admin', email],
        );

        if (result.rows.length === 0) {
            return false;
        }

        const user = result.rows[0];

        return true;
    } catch (error) {
        console.error('❌ Error promoting user to admin:', error);
        return false;
    } finally {
        await client.end();
    }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
    process.exit(1);
}

// Run the promotion
promoteUserToAdmin(email).then((success) => {
    process.exit(success ? 0 : 1);
});
