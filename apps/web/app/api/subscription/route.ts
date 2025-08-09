import { log } from "@repo/shared/lib/logger";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { getUserWithSubscription } from "@/lib/database/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const userId = session.user.id;

        // Get user's subscription data
        const userWithSubscription = await getUserWithSubscription(userId);

        const response = {
            subscription: userWithSubscription?.userSubscription || null,
            user: {
                id: userWithSubscription?.user?.id,
                planSlug: userWithSubscription?.user?.planSlug,
            },
        };

        log.info(
            { userId, hasSubscription: !!response.subscription },
            "Subscription data retrieved",
        );

        return NextResponse.json(response);
    } catch (error) {
        log.error({ error }, "Failed to get subscription data");

        return NextResponse.json(
            { error: "Failed to retrieve subscription data" },
            { status: 500 },
        );
    }
}
