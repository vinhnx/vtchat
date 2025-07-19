import { PaymentService, PRICE_ID_MAPPING } from "@repo/shared/config/payment";
import { log } from "@repo/shared/logger";
import { PlanSlug } from "@repo/shared/types/subscription";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-server";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

// Schema for checkout request
const CheckoutRequestSchema = z.object({
    priceId: z.literal(PlanSlug.VT_PLUS), // Only VT_PLUS can be checked out
    successUrl: z.string().optional(),
    quantity: z.number().positive().optional().default(1),
});

export async function POST(request: NextRequest) {
    try {
        log.info("[Checkout API] Starting checkout process...");

        // Check authentication using Better Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id;
        const user = session?.user;

        if (!userId) {
            log.error("[Checkout API] Authentication failed: No user ID found");
            return NextResponse.json({ error: "Authentication required" }, { status: 401 });
        }

        log.info(`[Checkout API] User authenticated: ${userId}`);

        // Parse request body
        const body = await request.json();
        log.info("[Checkout API] Request body:", { body });
        const validatedData = CheckoutRequestSchema.parse(body);

        // Get Creem API key from environment
        const creemApiKey = process.env.CREEM_API_KEY;
        if (!creemApiKey) {
            log.error("CREEM_API_KEY not configured");
            return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
        }

        log.info("Using Creem.io payment system");

        // Map internal price IDs to our product types using the centralized config
        log.info("Processing checkout with price ID:", {
            data: validatedData.priceId,
        });
        log.info("Available price mappings:", {
            data: Object.keys(PRICE_ID_MAPPING),
        });

        const packageType = PRICE_ID_MAPPING[validatedData.priceId]; // validatedData.priceId is already PlanSlug.VT_PLUS
        if (!packageType) {
            // This check might be redundant if priceId is always VT_PLUS and mapping exists
            log.error(`Invalid price ID: ${validatedData.priceId}`);
            return NextResponse.json(
                {
                    error: "Product configuration error",
                    message: "This product is not available. Please contact support.",
                    code: "PRODUCT_NOT_CONFIGURED",
                },
                { status: 400 },
            );
        }

        log.info("Mapped to package type:", { data: packageType });

        // Get user information for checkout
        const userEmail = user?.email;

        if (!userEmail) {
            log.error("No email found for user:", { userId });
            return NextResponse.json(
                {
                    error: "Email required",
                    message: "A valid email address is required to complete checkout.",
                    code: "EMAIL_REQUIRED",
                },
                { status: 400 },
            );
        }

        // Validate email domain
        if (userEmail.includes("@example.com")) {
            log.error("Invalid email domain detected");
            return NextResponse.json(
                {
                    error: "Invalid email configuration",
                    message: "Please update your email address to continue.",
                    code: "INVALID_EMAIL_DOMAIN",
                },
                { status: 400 },
            );
        }

        // For VT+ subscriptions, check if user already has an active subscription
        if (packageType === PlanSlug.VT_PLUS) {
            log.info("Checking existing subscription status for VT+ checkout...");

            try {
                // Import database utilities and verification function
                const { db } = await import("@/lib/database");
                const { userSubscriptions, users } = await import("@/lib/database/schema");
                const { eq } = await import("drizzle-orm");
                const { verifyExistingCreemSubscription } = await import(
                    "@repo/shared/utils/subscription-verification"
                );

                // Use comprehensive verification that checks both tables
                const verification = await verifyExistingCreemSubscription(
                    userId,
                    { db, userSubscriptions, users, eq },
                    PlanSlug.VT_PLUS,
                );

                if (verification.hasActiveSubscription) {
                    log.info(`[Checkout API] User ${userId} already has active VT+ subscription:`, {
                        subscriptionId:
                            verification.subscriptionDetails?.creemSubscriptionId ||
                            "legacy/admin-granted",
                        source: verification.verificationSource,
                    });

                    return NextResponse.json(
                        {
                            error: "Active subscription exists",
                            message: verification.message,
                            code: "SUBSCRIPTION_EXISTS",
                            hasActiveSubscription: true,
                            currentPlan: PlanSlug.VT_PLUS,
                            subscriptionId: verification.subscriptionDetails?.creemSubscriptionId,
                            verificationSource: verification.verificationSource,
                        },
                        { status: 409 }, // Conflict status code
                    );
                }

                log.info(
                    `[Checkout API] No active VT+ subscription found (${verification.verificationSource}), proceeding with checkout...`,
                );
            } catch (dbError) {
                log.error("[Checkout API] Error checking existing subscription:", {
                    data: dbError,
                });
                // Don't block checkout on DB errors, but log for monitoring
            }
        }

        // Create checkout session using PaymentService
        let checkout;
        try {
            if (packageType === PlanSlug.VT_PLUS) {
                log.info("Starting VT+ subscription checkout for user");
                checkout = await PaymentService.subscribeToVtPlus(userEmail);
            } else {
                log.error("Invalid package type for VT+ only system:", {
                    data: packageType,
                });
                return NextResponse.json(
                    {
                        error: "Product not available",
                        message: "Only VT+ subscription is available.",
                        code: "PRODUCT_NOT_AVAILABLE",
                    },
                    { status: 400 },
                );
            }
        } catch (error: any) {
            log.error("Creem checkout error:", { data: error, stack: error.stack });
            return NextResponse.json(
                {
                    error: "Failed to create checkout session",
                    message: error.message || "Payment system temporarily unavailable.",
                    code: "CHECKOUT_FAILED",
                },
                { status: 503 },
            );
        }

        return NextResponse.json({
            checkoutId: checkout.checkoutId,
            url: checkout.url,
            success: checkout.success,
        });
    } catch (error) {
        log.error("Checkout error:", { error });

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.errors },
                { status: 400 },
            );
        }

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
