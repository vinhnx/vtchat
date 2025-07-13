export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

import { log } from "@repo/shared/logger";
import { eq, inArray } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { db } from "@/lib/database";
import { embeddings, resources } from "@/lib/database/schema";
import { checkVTPlusAccess } from "../../subscription/access-control";

export async function DELETE(_req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check VT+ access for RAG feature
        const headersList = await headers();
        const ip = headersList.get("x-real-ip") ?? headersList.get("x-forwarded-for") ?? undefined;
        const vtPlusCheck = await checkVTPlusAccess({ userId: session.user.id, ip });
        if (!vtPlusCheck.hasAccess) {
            return NextResponse.json(
                {
                    error: "VT+ subscription required",
                    message:
                        "Personal AI Assistant with Memory is a VT+ exclusive feature. Please upgrade to access this functionality.",
                    code: "VT_PLUS_REQUIRED",
                },
                { status: 403 },
            );
        }

        const userId = session.user.id;

        // First get all resource IDs for this user
        const userResources = await db
            .select({ id: resources.id })
            .from(resources)
            .where(eq(resources.userId, userId));

        const resourceIds = userResources.map((r) => r.id);

        // Delete all embeddings for user's resources
        if (resourceIds.length > 0) {
            await db.delete(embeddings).where(inArray(embeddings.resourceId, resourceIds));
        }

        // Delete all resources for the user
        await db.delete(resources).where(eq(resources.userId, userId));

        return NextResponse.json(
            { message: "Knowledge base cleared successfully" },
            { status: 200 },
        );
    } catch (error) {
        log.error("Error clearing knowledge base:", { error });
        return NextResponse.json({ error: "Failed to clear knowledge base" }, { status: 500 });
    }
}
