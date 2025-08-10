import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import { db } from "@/lib/database";
import { sandboxUsage, users } from "@/lib/database/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { log } from "@repo/shared/logger";
import { PlanSlug } from "@repo/shared/types/subscription";

const RATE_LIMITS = {
  [PlanSlug.VT_PLUS]: {
    dailyLimit: 2,
    maxTimeoutMinutes: 30,
  },
  [PlanSlug.VT_BASE]: {
    dailyLimit: 0,
    maxTimeoutMinutes: 0,
  },
  default: {
    dailyLimit: 0,
    maxTimeoutMinutes: 0,
  },
};

// Helper function to get user subscription tier
async function getUserTier(userId: string) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    return user?.planSlug || PlanSlug.ANONYMOUS;
  } catch (error) {
    log.error("Failed to get user tier", { error, userId });
    return PlanSlug.ANONYMOUS;
  }
}

// Helper function to check sandbox usage
async function checkSandboxUsage(userId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const usageToday = await db
      .select({ count: sql<number>`count(*)` })
      .from(sandboxUsage)
      .where(
        and(
          eq(sandboxUsage.userId, userId),
          eq(sandboxUsage.success, true),
          gte(sandboxUsage.createdAt, today),
        ),
      );

    const todayCount = usageToday[0]?.count || 0;
    return todayCount;
  } catch (error) {
    log.error("Failed to check sandbox usage", { error, userId });
    return 0;
  }
}

// GET /api/sandbox/usage - Get sandbox usage stats
export const GET = withAuth(async (req, session) => {
  try {
    const userId = session.user.id;
    
    // Get user tier
    const userTier = await getUserTier(userId);
    
    // Check usage limits
    const usageCount = await checkSandboxUsage(userId);
    const limit = RATE_LIMITS[userTier as keyof typeof RATE_LIMITS]?.dailyLimit || 0;
    const remaining = Math.max(0, limit - usageCount);
    
    return NextResponse.json({
      remaining,
      limit,
      used: usageCount
    });
  } catch (error) {
    log.error("Failed to get sandbox usage", { error });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});

// POST /api/sandbox/start - Start a new sandbox session
export const POST = withAuth(async (req, session) => {
  try {
    const userId = session.user.id;
    
    // Get user tier
    const userTier = await getUserTier(userId);
    
    // Check if user has access to sandbox
    if (userTier !== PlanSlug.VT_PLUS) {
      return NextResponse.json({ 
        error: "Sandbox feature requires VT+ subscription" 
      }, { status: 403 });
    }
    
    // Check usage limits
    const usageCount = await checkSandboxUsage(userId);
    const limit = RATE_LIMITS[userTier as keyof typeof RATE_LIMITS]?.dailyLimit || 0;
    
    if (usageCount >= limit) {
      return NextResponse.json({ 
        error: `Daily sandbox limit reached (${usageCount}/${limit})` 
      }, { status: 429 });
    }
    
    const body = await req.json();
    
    // Validate request
    if (!body.files || typeof body.files !== 'object') {
      return NextResponse.json({ error: "Invalid files parameter" }, { status: 400 });
    }
    
    // In a real implementation, this would actually start an E2B sandbox
    // For now, we'll simulate a successful response
    const sandboxId = "sandbox_" + Date.now();
    
    // Track usage
    await db.insert(sandboxUsage).values({
      userId,
      sandboxId,
      success: true,
      language: body.language || "javascript",
      timeoutMinutes: 10,
      internetAccess: false,
      metadata: {
        source: "api-route",
        userTier
      }
    });
    
    return NextResponse.json({
      sandboxId,
      files: body.files,
      language: body.language || "javascript",
      success: true,
      message: `Sandbox session started successfully! This counts as ${usageCount + 1} of your ${limit} daily runs.`
    });
  } catch (error) {
    log.error("Failed to start sandbox", { error });
    return NextResponse.json(
      { error: `Sandbox creation failed: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
});

// POST /api/sandbox/stop - Stop a sandbox session
export const PUT = withAuth(async (req, session) => {
  try {
    const body = await req.json();
    
    if (!body.sandboxId) {
      return NextResponse.json({ error: "Missing sandboxId" }, { status: 400 });
    }
    
    // In a real implementation, this would actually stop an E2B sandbox
    // For now, we'll simulate a successful response
    return NextResponse.json({
      success: true,
      message: `Sandbox ${body.sandboxId} stopped successfully.`,
      sandboxId: body.sandboxId,
    });
  } catch (error) {
    log.error("Failed to stop sandbox", { error });
    return NextResponse.json(
      { error: `Failed to stop sandbox: ${error.message}` },
      { status: 500 }
    );
  }
});