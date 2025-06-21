import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { accounts } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
    try {
        // Get the current session
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const userId = session.user.id;

        // Query the accounts table directly for this user's linked accounts
        const linkedAccounts = await db
            .select({
                id: accounts.id,
                accountId: accounts.accountId,
                providerId: accounts.providerId,
                userId: accounts.userId,
                createdAt: accounts.createdAt,
                updatedAt: accounts.updatedAt,
            })
            .from(accounts)
            .where(eq(accounts.userId, userId));

        console.log(
            `[List Accounts API] Found ${linkedAccounts.length} linked accounts for user ${userId}`
        );

        return NextResponse.json({
            success: true,
            accounts: linkedAccounts,
            userId: userId,
        });
    } catch (error) {
        console.error('[List Accounts API] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch linked accounts',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
