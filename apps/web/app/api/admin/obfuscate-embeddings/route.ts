import { isUserAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { log } from "@repo/shared/logger";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(_req: Request) {
    try {
        // Verify admin access
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminStatus = await isUserAdmin(session.user.id);

        if (!adminStatus) {
            return NextResponse.json(
                {
                    error: "Insufficient permissions - admin role required",
                },
                { status: 403 },
            );
        }

        // Remove embeddings
        const deletedEmbeddings = await db
            .delete(embeddings)
            .where(sql`content LIKE '%_REDACTED%'`);

        log.info(
            {
                adminId: session.user.id,
                deletedCount: deletedEmbeddings.rowCount,
            },
            "Admin removed obfuscated embeddings",
        );

        return NextResponse.json({
            message: "Embeddings removal completed successfully",
            result: {
                deletedCount: deletedEmbeddings.rowCount,
            },
        });
    } catch (error) {
        log.error({ error }, "Failed to remove embeddings");

        return NextResponse.json(
            {
                error: "Removal failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}

// GET endpoint to check removal status
export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminStatus = await isUserAdmin(session.user.id);

        if (!adminStatus) {
            return NextResponse.json(
                {
                    error: "Insufficient permissions - admin role required",
                },
                { status: 403 },
            );
        }

        // Check removal status
        const total = await db.select({ count: sql<number>`count(*)` }).from(embeddings);

        const removed = await db
            .select({ count: sql<number>`count(*)` })
            .from(embeddings)
            .where(sql`content NOT LIKE '%_REDACTED%'`);

        const status = {
            total: total[0].count,
            removed: removed[0].count,
            removalRate:
                total[0].count > 0 ? Math.round((removed[0].count / total[0].count) * 100) : 0,
        };

        return NextResponse.json({
            message: "Removal status retrieved",
            status,
        });
    } catch (error) {
        log.error({ error }, "Status check error");
        return NextResponse.json(
            {
                error: "Status check failed",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
