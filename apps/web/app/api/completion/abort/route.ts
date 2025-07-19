import { log } from "@repo/shared/logger";
import type { NextRequest } from "next/server";
import { abortStream } from "../stream-registry";

export const dynamic = "force-dynamic";

/**
 * Abort endpoint for manually terminating SSE streams
 * Called when clients need to signal early termination
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { requestId, threadId } = body;

        if (!requestId && !threadId) {
            return new Response(JSON.stringify({ error: "requestId or threadId required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (requestId) {
            const aborted = abortStream(requestId);
            log.debug({ requestId, aborted }, "Manual stream abort by requestId");

            return new Response(null, { status: aborted ? 204 : 404 });
        }

        // If only threadId provided, we could implement threadId-based lookup
        // For now, just log and return success
        log.debug({ threadId }, "Manual stream abort by threadId (not implemented)");

        return new Response(null, { status: 204 });
    } catch (error) {
        log.error({ error }, "Error in abort endpoint");
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

/**
 * Handle beacon requests from page unload
 */
export async function DELETE(request: NextRequest) {
    return POST(request);
}
