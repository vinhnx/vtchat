import { log } from "@repo/shared/lib/logger";
import { and, count, desc, eq, gte, like, or, sql, sum } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { providerUsage, sessions, users } from "@/lib/database/schema";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = Math.min(parseInt(searchParams.get("limit") || "25"), 100);
        const offset = (page - 1) * limit;
        const search = searchParams.get("search") || "";
        const planFilter = searchParams.get("plan") || "";
        const statusFilter = searchParams.get("status") || "";

        // Build where conditions
        const whereConditions = [];

        if (search) {
            whereConditions.push(
                or(like(users.name, `%${search}%`), like(users.email, `%${search}%`)),
            );
        }

        if (planFilter) {
            whereConditions.push(eq(users.planSlug, planFilter));
        }

        if (statusFilter === "banned") {
            whereConditions.push(eq(users.banned, true));
        } else if (statusFilter === "active") {
            whereConditions.push(eq(users.banned, false));
        }

        // Get users with pagination - pin admin users to top
        const usersQuery = db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                emailVerified: users.emailVerified,
                image: users.image,
                role: users.role,
                banned: users.banned,
                banReason: users.banReason,
                banExpires: users.banExpires,
                protected: users.protected,
                planSlug: users.planSlug,
                creemCustomerId: users.creemCustomerId,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .orderBy(
                // Pin admin users to top, then sort by creation date
                sql`CASE WHEN ${users.role} = 'admin' THEN 0 ELSE 1 END`,
                desc(users.createdAt),
            );

        if (whereConditions.length > 0) {
            usersQuery.where(and(...whereConditions));
        }

        const usersList = await usersQuery.limit(limit).offset(offset);

        // Get total count for pagination
        const countQuery = db.select({ count: count() }).from(users);
        if (whereConditions.length > 0) {
            countQuery.where(and(...whereConditions));
        }
        const [totalCount] = await countQuery;

        // Get user statistics
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [totalUsers] = await db.select({ count: count() }).from(users);

        const [activeUsers] = await db
            .select({ count: count() })
            .from(sessions)
            .where(gte(sessions.createdAt, oneDayAgo));

        const [newUsers30d] = await db
            .select({ count: count() })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo));

        const [newUsers7d] = await db
            .select({ count: count() })
            .from(users)
            .where(gte(users.createdAt, sevenDaysAgo));

        const [vtPlusUsers] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.planSlug, "vt_plus"));

        const [bannedUsers] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.banned, true));

        const [verifiedUsers] = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.emailVerified, true));

        // Get plan distribution
        const planDistribution = await db
            .select({
                plan: users.planSlug,
                count: count(),
            })
            .from(users)
            .groupBy(users.planSlug);

        // Get user activity metrics
        const userActivity = await db
            .select({
                userId: providerUsage.userId,
                totalRequests: count(),
                totalCostCents: sum(providerUsage.estimatedCostCents),
            })
            .from(providerUsage)
            .where(gte(providerUsage.requestTimestamp, thirtyDaysAgo))
            .groupBy(providerUsage.userId)
            .orderBy(desc(count()))
            .limit(10);

        // Get recent user registrations
        const recentRegistrations = await db
            .select({
                date: sql<string>`DATE(${users.createdAt})`,
                count: count(),
            })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo))
            .groupBy(sql`DATE(${users.createdAt})`)
            .orderBy(sql`DATE(${users.createdAt})`);

        return NextResponse.json({
            users: usersList,
            pagination: {
                page,
                limit,
                total: totalCount.count,
                totalPages: Math.ceil(totalCount.count / limit),
            },
            statistics: {
                totalUsers: totalUsers.count,
                activeUsers: activeUsers.count,
                newUsers30d: newUsers30d.count,
                newUsers7d: newUsers7d.count,
                vtPlusUsers: vtPlusUsers.count,
                bannedUsers: bannedUsers.count,
                verifiedUsers: verifiedUsers.count,
                conversionRate:
                    totalUsers.count > 0
                        ? ((vtPlusUsers.count / totalUsers.count) * 100).toFixed(2)
                        : "0.00",
                verificationRate:
                    totalUsers.count > 0
                        ? ((verifiedUsers.count / totalUsers.count) * 100).toFixed(2)
                        : "0.00",
            },
            planDistribution,
            topActiveUsers: userActivity,
            registrationTrend: recentRegistrations,
        });
    } catch {
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    });

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { action, userId, data } = body;

        // Validate required fields
        if (!action || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Log the request for debugging
        log.info({ action, userId, data }, "Admin user action requested");

        // Basic user ID validation (just check it's not empty and reasonable length)
        if (!userId || typeof userId !== "string" || userId.length < 10 || userId.length > 50) {
            log.warn({ userId }, "Invalid user ID");
            return NextResponse.json(
                {
                    error: "Invalid user ID",
                    receivedId: userId,
                },
                { status: 400 },
            );
        }

        // Check if the target user exists
        const targetUser = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (!targetUser) {
            log.warn({ userId }, "User not found in database");
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prevent admin from demoting themselves
        if (action === "updateRole" && userId === session.user.id && data.role !== "admin") {
            return NextResponse.json(
                {
                    error: "Cannot demote yourself from admin role",
                },
                { status: 400 },
            );
        }

        switch (action) {
            case "ban":
                await db
                    .update(users)
                    .set({
                        banned: true,
                        banReason: data.reason || "Banned by admin",
                        banExpires: data.expires ? new Date(data.expires) : null,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
                break;

            case "unban":
                await db
                    .update(users)
                    .set({
                        banned: false,
                        banReason: null,
                        banExpires: null,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
                break;

            case "updateRole":
                if (!data.role || !["user", "admin"].includes(data.role)) {
                    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
                }

                await db
                    .update(users)
                    .set({
                        role: data.role,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
                break;

            case "updatePlan":
                if (!data.planSlug) {
                    return NextResponse.json({ error: "Missing plan slug" }, { status: 400 });
                }

                await db
                    .update(users)
                    .set({
                        planSlug: data.planSlug,
                        updatedAt: new Date(),
                    })
                    .where(eq(users.id, userId));
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        log.error({ error }, "Admin users API error");
        return NextResponse.json(
            {
                error: "Failed to update user",
                details: process.env.NODE_ENV === "development" ? String(error) : undefined,
            },
            { status: 500 },
        );
    }
}
