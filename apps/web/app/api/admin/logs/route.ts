import { auth } from '@/lib/auth-server';
import { db } from '@/lib/database';
import { sessions, users } from '@/lib/database/schema';
import { count, desc, eq, gt, sql, isNotNull, and, or, like } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status') || '';
        const impersonation = searchParams.get('impersonation') || '';

        // Build where conditions
        let whereConditions = [];

        if (search) {
            whereConditions.push(
                or(
                    like(users.name, `%${search}%`),
                    like(users.email, `%${search}%`),
                    like(sessions.ipAddress, `%${search}%`)
                )
            );
        }

        if (status === 'active') {
            whereConditions.push(gt(sessions.expiresAt, sql`NOW()`));
        } else if (status === 'expired') {
            whereConditions.push(sql`${sessions.expiresAt} <= NOW()`);
        }

        if (impersonation === 'impersonated') {
            whereConditions.push(isNotNull(sessions.impersonatedBy));
        } else if (impersonation === 'normal') {
            whereConditions.push(sql`${sessions.impersonatedBy} IS NULL`);
        }

        // Get session logs with user data
        const logsQuery = db
            .select({
                id: sessions.id,
                userId: sessions.userId,
                userName: users.name,
                userEmail: users.email,
                ipAddress: sessions.ipAddress,
                userAgent: sessions.userAgent,
                impersonatedBy: sessions.impersonatedBy,
                createdAt: sessions.createdAt,
                expiresAt: sessions.expiresAt,
            })
            .from(sessions)
            .leftJoin(users, eq(sessions.userId, users.id))
            .orderBy(desc(sessions.createdAt));

        if (whereConditions.length > 0) {
            logsQuery.where(and(...whereConditions));
        }

        const logs = await logsQuery.limit(limit).offset(offset);

        // Get total count for pagination
        const countQuery = db
            .select({ count: count() })
            .from(sessions)
            .leftJoin(users, eq(sessions.userId, users.id));

        if (whereConditions.length > 0) {
            countQuery.where(and(...whereConditions));
        }

        const [totalCount] = await countQuery;

        // Get stats
        const [activeSessionsCount] = await db
            .select({ count: count() })
            .from(sessions)
            .where(gt(sessions.expiresAt, sql`NOW()`));

        const [impersonationCount] = await db
            .select({ count: count() })
            .from(sessions)
            .where(isNotNull(sessions.impersonatedBy));

        return NextResponse.json({
            logs,
            pagination: {
                page,
                limit,
                total: totalCount.count,
                totalPages: Math.ceil(totalCount.count / limit),
            },
            stats: {
                totalSessions: totalCount.count,
                activeSessions: activeSessionsCount.count,
                impersonatedSessions: impersonationCount.count,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}
