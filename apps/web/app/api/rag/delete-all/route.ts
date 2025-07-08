import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { resources, auditLog } from '@/lib/database/schema';
import { checkVTPlusAccess } from '../../subscription/access-control';
import { log, logAuditEvent } from '@repo/shared/lib/logger';
import { withRLS } from '@/lib/database/session';

// Force Node.js runtime for crypto operations
export const runtime = 'nodejs';

export async function DELETE(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await import('next/headers').then((m) => m.headers()),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check VT+ access for RAG feature
        const headers = await import('next/headers').then((m) => m.headers());
        const ip = headers.get('x-real-ip') ?? headers.get('x-forwarded-for') ?? undefined;
        const vtPlusCheck = await checkVTPlusAccess({ userId: session.user.id, ip });
        if (!vtPlusCheck.hasAccess) {
            return NextResponse.json(
                {
                    error: 'VT+ subscription required',
                    message: 'Data deletion is a VT+ exclusive feature.',
                    code: 'VT_PLUS_REQUIRED',
                },
                { status: 403 }
            );
        }

        // Use RLS to ensure user can only delete their own data
        await withRLS(session.user.id, async () => {
            // Delete all resources (embeddings will be cascade deleted)
            await db.delete(resources).where(eq(resources.userId, session.user.id));
        });

        // Log audit event for GDPR compliance
        logAuditEvent(session.user.id, 'DATA_DELETION_COMPLETE', {
            ip,
            timestamp: new Date().toISOString(),
        });

        log.info({ userId: session.user.id }, 'User data deletion completed');

        return NextResponse.json({
            success: true,
            message: 'All your knowledge base data has been permanently deleted.',
        });
    } catch (error) {
        log.error({ error }, 'Data deletion error');
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
