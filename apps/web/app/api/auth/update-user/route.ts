export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { log } from '@repo/shared/logger';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';
import { db, withDatabaseErrorHandling } from '@/lib/database';
import { users } from '@/lib/database/schema';

export async function POST(request: NextRequest) {
    try {
        // Get the session from the request headers
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email } = body;

        // Validate input
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Validate field lengths
        if (name.trim().length > 100) {
            return NextResponse.json(
                { error: 'Name must be less than 100 characters' },
                { status: 400 }
            );
        }

        if (email.length > 255) {
            return NextResponse.json(
                { error: 'Email must be less than 255 characters' },
                { status: 400 }
            );
        }

        // Update user in database with error handling
        await withDatabaseErrorHandling(async () => {
            await db
                .update(users)
                .set({
                    name: name.trim(),
                    email: email.trim(),
                    updatedAt: new Date(),
                })
                .where(eq(users.id, session.user.id));
        }, 'Update user profile');

        return NextResponse.json({ success: true });
    } catch (error) {
        log.error('Error updating user:', { error });

        // Return user-friendly error message
        const message = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
