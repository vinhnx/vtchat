import { QUOTA_WINDOW, VtPlusFeature } from "@repo/common/config/vtPlusLimits";
import { log } from "@repo/shared/lib/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth-server";
import {
    createQuotaConfig,
    getQuotaConfigCacheStats,
    getQuotaConfigsForPlan,
    refreshQuotaConfigCache,
    updateQuotaConfig,
} from "@/lib/services/quota-config.service";

export const dynamic = "force-dynamic";

const UpdateQuotaConfigSchema = z.object({
    feature: z.nativeEnum(VtPlusFeature),
    plan: z.nativeEnum(PlanSlug),
    limit: z.number().min(0).optional(),
    window: z.enum([QUOTA_WINDOW.DAILY, QUOTA_WINDOW.MONTHLY]).optional(),
});

const CreateQuotaConfigSchema = z.object({
    feature: z.nativeEnum(VtPlusFeature),
    plan: z.nativeEnum(PlanSlug),
    limit: z.number().min(0),
    window: z.enum([QUOTA_WINDOW.DAILY, QUOTA_WINDOW.MONTHLY]),
});

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const isUserAdmin = await isAdmin(session.user.id);
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const plan = searchParams.get("plan") as PlanSlug;

        if (plan && Object.values(PlanSlug).includes(plan)) {
            // Get quota configs for specific plan
            const configs = await getQuotaConfigsForPlan(plan);
            return NextResponse.json({ plan, configs });
        } else {
            // Get quota configs for all plans
            const allConfigs = {
                [PlanSlug.VT_BASE]: await getQuotaConfigsForPlan(PlanSlug.VT_BASE),
                [PlanSlug.VT_PLUS]: await getQuotaConfigsForPlan(PlanSlug.VT_PLUS),
            };

            // Include cache stats for debugging
            const cacheStats = getQuotaConfigCacheStats();

            return NextResponse.json({ configs: allConfigs, cacheStats });
        }
    } catch (error) {
        log.error({ error }, "Failed to get quota configurations");
        return NextResponse.json(
            { error: "Failed to retrieve quota configurations" },
            { status: 500 },
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const isUserAdmin = await isAdmin(session.user.id);
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = UpdateQuotaConfigSchema.parse(body);

        await updateQuotaConfig(validatedData.feature, validatedData.plan, {
            limit: validatedData.limit,
            window: validatedData.window,
        });

        log.info(
            {
                adminUserId: session.user.id,
                feature: validatedData.feature,
                plan: validatedData.plan,
                updates: { limit: validatedData.limit, window: validatedData.window },
            },
            "Quota configuration updated by admin",
        );

        return NextResponse.json({
            success: true,
            message: "Quota configuration updated successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 },
            );
        }

        log.error({ error }, "Failed to update quota configuration");
        return NextResponse.json(
            { error: "Failed to update quota configuration" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const isUserAdmin = await isAdmin(session.user.id);
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await request.json();
        const validatedData = CreateQuotaConfigSchema.parse(body);

        await createQuotaConfig(validatedData.feature, validatedData.plan, {
            limit: validatedData.limit,
            window: validatedData.window,
        });

        log.info(
            {
                adminUserId: session.user.id,
                feature: validatedData.feature,
                plan: validatedData.plan,
                config: { limit: validatedData.limit, window: validatedData.window },
            },
            "Quota configuration created by admin",
        );

        return NextResponse.json({
            success: true,
            message: "Quota configuration created successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 },
            );
        }

        log.error({ error }, "Failed to create quota configuration");
        return NextResponse.json(
            { error: "Failed to create quota configuration" },
            { status: 500 },
        );
    }
}

// Refresh cache endpoint
export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        const isUserAdmin = await isAdmin(session.user.id);
        if (!isUserAdmin) {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        await refreshQuotaConfigCache();

        log.info({ adminUserId: session.user.id }, "Quota configuration cache refreshed by admin");

        return NextResponse.json({
            success: true,
            message: "Quota configuration cache refreshed successfully",
        });
    } catch (error) {
        log.error({ error }, "Failed to refresh quota configuration cache");
        return NextResponse.json({ error: "Failed to refresh cache" }, { status: 500 });
    }
}
