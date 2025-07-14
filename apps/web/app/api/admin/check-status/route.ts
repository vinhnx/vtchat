import { type NextRequest, NextResponse } from "next/server";
import { log } from "@repo/shared/lib/logger";
import { isUserAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ isAdmin: false });
        }

        const adminStatus = await isUserAdmin(session.user.id);

        log.debug({
            userId: session.user.id,
            email: session.user.email,
            adminStatus,
        }, "Admin status check");

        return NextResponse.json({ isAdmin: adminStatus });
    } catch (error) {
        log.error({ error }, "Error checking admin status");
        return NextResponse.json({ isAdmin: false });
    }
}
