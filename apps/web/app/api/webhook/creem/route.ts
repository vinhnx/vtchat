// Force dynamic rendering for this webhook route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import { invalidateAllCaches } from '@/lib/cache/cache-invalidation';
import { db } from '@/lib/database';
import { sessions, users, userSubscriptions } from '@/lib/database/schema';
import { log } from '@repo/shared/logger';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { eq } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { z } from 'zod';

// Known event types and statuses for validation
const KNOWN_EVENT_TYPES = [
    'checkout.completed',
    'subscription.active',
    'subscription.paid',
    'subscription.canceled',
    'subscription.expired',
    'subscription.update',
    'subscription.trialing',
] as const;

const KNOWN_SUBSCRIPTION_STATUSES = [
    SubscriptionStatusEnum.ACTIVE,
    SubscriptionStatusEnum.CANCELED,
    SubscriptionStatusEnum.INCOMPLETE,
    SubscriptionStatusEnum.PAST_DUE,
    SubscriptionStatusEnum.TRIALING,
    SubscriptionStatusEnum.EXPIRED,
    SubscriptionStatusEnum.CANCELLED,
    SubscriptionStatusEnum.INACTIVE,
] as const;

// Creem.io webhook event schemas - Updated to be more flexible for new events
const CreemWebhookEventSchema = z.object({
    id: z.string(),
    eventType: z.string(), // Accept any string, validate known types later
    created_at: z.number(),
    object: z.record(z.string(), z.any()),
});

const CreemCheckoutEventSchema = z.object({
    id: z.string(),
    eventType: z.literal('checkout.completed'),
    created_at: z.number(),
    object: z.object({
        id: z.string(),
        status: z.string(),
        customer: z.object({
            id: z.string(),
            email: z.string(),
        }),
        product: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
        }),
        order: z.object({
            id: z.string(),
            amount: z.number(),
            currency: z.string(),
            status: z.string(),
        }),
        subscription: z
            .object({
                id: z.string(),
                status: z.string(),
            })
            .optional(),
        metadata: z.record(z.string(), z.string()).optional(),
    }),
});

const CreemSubscriptionEventSchema = z.object({
    id: z.string(),
    eventType: z
        .string()
        .refine(
            (value) =>
                KNOWN_EVENT_TYPES.includes(value as any) || value.startsWith('subscription.'),
            {
                message:
                    "Event type must be a known subscription event or start with 'subscription.'",
            },
        ),
    created_at: z.number(),
    object: z.object({
        id: z.string(),
        status: z
            .string()
            .refine(
                (value) => KNOWN_SUBSCRIPTION_STATUSES.includes(value as any) || value.length > 0,
                {
                    message: 'Status must be a known subscription status or non-empty string',
                },
            ),
        customer: z.object({
            id: z.string(),
            email: z.string(),
        }),
        product: z.object({
            id: z.string(),
            name: z.string(),
        }),
        current_period_start_date: z.string(),
        current_period_end_date: z.string(),
        metadata: z.record(z.string(), z.string()).optional(),
        canceled_at: z.string().nullable().optional(),
    }),
});

// Explicit product ID to plan mapping - safer than substring matching
const CREEM_VT_PLUS_PRODUCT_ID = process.env.CREEM_PRODUCT_ID;
const CREEM_PRODUCT_ID_TO_PLAN: Record<string, string> = CREEM_VT_PLUS_PRODUCT_ID
    ? { [CREEM_VT_PLUS_PRODUCT_ID]: PlanSlug.VT_PLUS }
    : {};

// Known VT+ product name patterns (as backup to product ID mapping)
const VT_PLUS_PRODUCT_PATTERNS = [
    'vt+ monthly subscription',
    'vt+ yearly subscription',
    'vtchat plus',
    'vt plus',
] as const;

// Map Creem product info to VT Chat plan slugs
function mapCreemProductToPlan(
    productName: string,
    metadata?: Record<string, string>,
    productId?: string,
): string {
    // Priority 1: Check metadata for explicit package mapping
    const metadataPackageId = metadata?.packageId || metadata?.package_id;
    if (metadataPackageId) {
        const packageId = metadataPackageId;
        if (packageId === PlanSlug.VT_PLUS) {
            return PlanSlug.VT_PLUS;
        }
        if (packageId === PlanSlug.VT_BASE) {
            return PlanSlug.VT_BASE;
        }
    }

    // Priority 2: Use explicit product ID mapping if available
    if (productId && CREEM_PRODUCT_ID_TO_PLAN[productId]) {
        return CREEM_PRODUCT_ID_TO_PLAN[productId];
    }

    // Priority 3: Check against known exact product names (safer than substring matching)
    const productLower = productName.toLowerCase().trim();
    if (VT_PLUS_PRODUCT_PATTERNS.some((pattern) => productLower === pattern)) {
        return PlanSlug.VT_PLUS;
    }
    if (
        productLower.includes('vt+')
        || productLower.includes('vt plus')
        || productLower.includes('vt chat plus')
    ) {
        return PlanSlug.VT_PLUS;
    }

    // Priority 4: Safe fallback - log unknown products for manual review
    if (productName && productName.trim().length > 0) {
        log.warn('[Creem Webhook] Unknown product, defaulting to base plan:', {
            productName,
            productId,
            metadata,
        });
    }

    return PlanSlug.VT_BASE; // Safe default
}

// Find user by email from Creem with proper error handling
async function findUserByCreemData(
    customerId: string | undefined,
    customerEmail: string,
): Promise<string | null> {
    try {
        // 1) Match by Creem customer ID if provided
        if (customerId) {
            const bySub = await db
                .select({ userId: userSubscriptions.userId })
                .from(userSubscriptions)
                .where(eq(userSubscriptions.creemCustomerId, customerId))
                .limit(1);

            if (bySub.length > 0) {
                log.info('[Creem Webhook] Found user by creem_customer_id in subscriptions');
                return bySub[0].userId;
            }

            const byUser = await db
                .select({ id: users.id })
                .from(users)
                .where(eq(users.creemCustomerId, customerId))
                .limit(1);

            if (byUser.length > 0) {
                log.info('[Creem Webhook] Found user by creem_customer_id in users');
                return byUser[0].id;
            }
        }

        // 2) Fallback: validate and match by email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(customerEmail)) {
            log.error('[Creem Webhook] Invalid email format provided');
            return null;
        }

        // Find user by email with explicit column selection
        const userByEmail = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, customerEmail.toLowerCase().trim()))
            .limit(1);

        if (userByEmail.length > 0) {
            log.info('[Creem Webhook] Found user by email');
            return userByEmail[0].id;
        }

        log.error('[Creem Webhook] No user found for email');
        return null;
    } catch (error) {
        log.error('[Creem Webhook] Error finding user:', { error });
        return null;
    }
}

// Update user subscription in database and sync with Better Auth
async function updateUserSubscription(
    userId: string,
    planSlug: string,
    status: SubscriptionStatusEnum,
    subscriptionId?: string,
    expiresAt?: Date,
    creemCustomerId?: string,
) {
    try {
        log.info(
            `[Creem Webhook] Updating subscription for user ${userId}: ${planSlug} (${status})`,
        );

        // NOTE: neon-http driver doesn't support transactions, so we do sequential updates
        // This is acceptable for webhook processing as the operations are idempotent

        // 1. Update user's plan and customer ID in the users table
        const userUpdateData: any = {
            planSlug,
            updatedAt: new Date(),
        };

        if (creemCustomerId) {
            userUpdateData.creemCustomerId = creemCustomerId;
        }

        await db.update(users).set(userUpdateData).where(eq(users.id, userId));

        // 2. Update or create user subscription record
        const existingSubscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        const subscriptionData = {
            plan: planSlug,
            status: status, // Use the provided status directly
            ...(expiresAt && { currentPeriodEnd: expiresAt }),
            ...(subscriptionId && { creemSubscriptionId: subscriptionId }), // Store Creem subscription ID
            updatedAt: new Date(),
        };

        if (existingSubscription.length === 0) {
            // Create new subscription
            await db.insert(userSubscriptions).values({
                id: crypto.randomUUID(),
                userId,
                ...subscriptionData,
                createdAt: new Date(),
            });
        } else {
            // Update existing subscription
            await db
                .update(userSubscriptions)
                .set(subscriptionData)
                .where(eq(userSubscriptions.userId, userId));
        }

        log.info(
            `[Creem Webhook] Successfully updated subscription for user ${userId}: ${planSlug} (${status})`,
        );

        // Invalidate all caches across all processes
        await invalidateAllCaches(userId);

        // Invalidate user sessions to force fresh subscription data
        await invalidateUserSessions(userId);
    } catch (error) {
        log.error('[Creem Webhook] Failed to update user subscription:', { error });
        throw error;
    }
}

// Helper function to invalidate user sessions (forces session refresh)
async function invalidateUserSessions(userId: string) {
    try {
        // Instead of deleting all sessions, we'll update session tokens to force refresh
        // This is less disruptive than forcing re-authentication
        const userSessions = await db.select().from(sessions).where(eq(sessions.userId, userId));

        if (userSessions.length > 0) {
            // Update session tokens to force cache invalidation
            await db
                .update(sessions)
                .set({
                    updatedAt: new Date(),
                    // Optionally shorten expiry to force refresh sooner
                })
                .where(eq(sessions.userId, userId));

            log.info(`[Creem Webhook] Updated ${userSessions.length} sessions for user ${userId}`);
        }
    } catch (error) {
        log.error('[Creem Webhook] Error updating user sessions:', { error });
        // Don't throw here as this is not critical for the main operation
    }
}

// Process checkout completed event
async function handleCheckoutCompleted(event: z.infer<typeof CreemCheckoutEventSchema>) {
    const { object: data } = event;

    log.info('[Creem Webhook] Processing checkout completed:', {
        checkoutId: data.id,
        productName: data.product.name,
        amount: data.order.amount,
        subscriptionId: data.subscription?.id,
    });

    // Find user by email
    const userId = await findUserByCreemData(data.customer.id, data.customer.email);

    if (!userId) {
        log.error('[Creem Webhook] No user found for checkout event');
        return;
    }

    const productName = data.product.name;

    // If this is a subscription product, update subscription status
    const planSlug = mapCreemProductToPlan(productName, data.metadata, data.product.id);
    if (planSlug === PlanSlug.VT_PLUS && data.subscription) {
        await updateUserSubscription(
            userId,
            planSlug,
            SubscriptionStatusEnum.ACTIVE, // active since checkout completed
            data.subscription.id,
            undefined, // expiry will be set by subscription events
            data.customer.id,
        );
        log.info(`[Creem Webhook] Updated subscription for checkout: ${data.id}`);
    }

    log.info(`[Creem Webhook] Successfully processed checkout completed for user ${userId}`);
}

// Process subscription events
async function handleSubscriptionEvent(event: z.infer<typeof CreemSubscriptionEventSchema>) {
    const { object: data } = event;

    log.info('[Creem Webhook] Processing subscription event:', {
        eventType: event.eventType,
        subscriptionId: data.id,
        status: data.status,
    });

    // Find user by email
    const userId = await findUserByCreemData(data.customer.id, data.customer.email);

    if (!userId) {
        log.error('[Creem Webhook] No user found for subscription event');
        return;
    }

    const productName = data.product.name;
    let planSlug = mapCreemProductToPlan(productName, data.metadata, data.product.id);

    // Load existing subscription record once for reuse (plan fallback + period end reuse)
    const existing = await db
        .select({
            plan: userSubscriptions.plan,
            currentPeriodEnd: userSubscriptions.currentPeriodEnd,
        })
        .from(userSubscriptions)
        .where(eq(userSubscriptions.userId, userId))
        .limit(1);
    const userPlanRow = await db
        .select({ planSlug: users.planSlug })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    // If mapping is uncertain (base) but we already have VT+ recorded, keep VT+
    if (planSlug === PlanSlug.VT_BASE) {
        const hadVtPlusSubscription = existing.length > 0 && existing[0].plan === PlanSlug.VT_PLUS;
        const hadVtPlusUserPlan =
            userPlanRow.length > 0 && userPlanRow[0].planSlug === PlanSlug.VT_PLUS;

        if (hadVtPlusSubscription || hadVtPlusUserPlan) {
            planSlug = PlanSlug.VT_PLUS;
            log.info(
                '[Creem Webhook] Preserving existing VT+ plan when product mapping was ambiguous',
            );
        }
    }

    // Map event type to appropriate subscription status
    let subscriptionStatus: SubscriptionStatusEnum;
    switch (event.eventType) {
        case 'subscription.expired':
            subscriptionStatus = SubscriptionStatusEnum.EXPIRED;
            break;
        case 'subscription.canceled':
            subscriptionStatus = SubscriptionStatusEnum.CANCELED;
            break;
        case 'subscription.trialing':
            subscriptionStatus = SubscriptionStatusEnum.TRIALING;
            break;
        default:
            // Use the status from the webhook data, but validate it's a known status
            if (KNOWN_SUBSCRIPTION_STATUSES.includes(data.status as any)) {
                subscriptionStatus = data.status as SubscriptionStatusEnum;
            } else {
                // Log unknown status but default to a safe fallback
                log.warn('[Creem Webhook] Unknown subscription status, defaulting to inactive:', {
                    unknownStatus: data.status,
                    eventType: event.eventType,
                });
                subscriptionStatus = SubscriptionStatusEnum.INACTIVE;
            }
            break;
    }

    // Parse expiration date if available; if missing, preserve prior end if it existed
    let expiresAt: Date | undefined;
    if (data.current_period_end_date) {
        expiresAt = new Date(data.current_period_end_date);
    } else if (existing.length > 0 && existing[0].currentPeriodEnd) {
        expiresAt = new Date(existing[0].currentPeriodEnd);
        log.info(
            '[Creem Webhook] Reusing existing period end because webhook omitted current_period_end_date',
        );
    } else {
        log.warn(
            '[Creem Webhook] Missing current_period_end_date and no prior end to reuse',
            { subscriptionId: data.id, eventType: event.eventType },
        );
    }

    // Update subscription status in database
    await updateUserSubscription(
        userId,
        planSlug,
        subscriptionStatus,
        data.id, // subscription ID
        expiresAt,
        data.customer.id, // Creem customer ID
    );

    // Handle specific event types
    switch (event.eventType) {
        case 'subscription.active':
            log.info(
                `[Creem Webhook] New subscription activated: ${data.id} for plan: ${planSlug}`,
            );
            break;

        case 'subscription.paid':
            log.info(
                `[Creem Webhook] Subscription payment received: ${data.id} for plan: ${planSlug}`,
            );
            break;

        case 'subscription.update':
            // Handle subscription updates (e.g., plan changes, renewals)
            log.info(`[Creem Webhook] Subscription updated: ${data.id} for plan: ${planSlug}`);
            break;

        case 'subscription.canceled':
            // For cancelled subscriptions, user retains access until period end
            log.info(
                `[Creem Webhook] Subscription cancelled: ${data.id}. User retains access until period end.`,
            );
            break;

        case 'subscription.expired':
            log.info(`[Creem Webhook] Subscription expired: ${data.id}. Access should be revoked.`);
            break;

        case 'subscription.trialing':
            log.info(`[Creem Webhook] Subscription trialing: ${data.id} for plan: ${planSlug}`);
            break;
    }

    log.info(
        `[Creem Webhook] Successfully processed subscription event: ${event.eventType} for user ${userId}`,
    );
}

// Verify webhook signature based on Creem's official documentation
// https://docs.creem.io/webhooks/verify-webhook-requests
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        // Generate signature using HMAC-SHA256 as specified by Creem
        const computedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        // Compare signatures using timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(computedSignature, 'hex'),
        );
    } catch (error) {
        log.error('[Creem Webhook] Signature verification failed:', { error });
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        log.info('[Creem Webhook] =================================');
        log.info('[Creem Webhook] Received webhook request at /api/webhook/creem');
        log.info('[Creem Webhook] Request metadata:', {
            bodyLength: body.length,
            hasSignature: !!request.headers.get('creem-signature'),
            timestamp: new Date().toISOString(),
        });
        // SECURITY: Don't log headers or raw body to prevent sensitive data exposure

        // Get webhook secret from environment
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        // SECURITY: Always require webhook secret - no development bypass
        if (!webhookSecret) {
            log.error('[Creem Webhook] CREEM_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // SECURITY: Always verify webhook signature regardless of environment
        const signature = request.headers.get('creem-signature');
        if (!signature) {
            log.error('[Creem Webhook] No creem-signature header found');
            return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
        }

        if (!verifyWebhookSignature(body, signature, webhookSecret)) {
            log.error('[Creem Webhook] Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        log.info('[Creem Webhook] Signature verified successfully');

        // Parse webhook event
        let event;
        try {
            event = JSON.parse(body);
        } catch (parseError) {
            log.error('[Creem Webhook] Failed to parse webhook body:', {
                error: parseError,
            });
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const validatedEvent = CreemWebhookEventSchema.parse(event);

        log.info('[Creem Webhook] Processing event:', {
            eventType: validatedEvent.eventType,
            id: validatedEvent.object?.id,
        });

        // Route to appropriate handler
        switch (validatedEvent.eventType) {
            case 'checkout.completed': {
                const checkoutEvent = CreemCheckoutEventSchema.parse(event);
                await handleCheckoutCompleted(checkoutEvent);
                break;
            }

            case 'subscription.active':
            case 'subscription.paid':
            case 'subscription.update':
            case 'subscription.canceled':
            case 'subscription.expired':
            case 'subscription.trialing': {
                const subscriptionEvent = CreemSubscriptionEventSchema.parse(event);
                await handleSubscriptionEvent(subscriptionEvent);
                break;
            }

            default:
                log.info('[Creem Webhook] Unhandled webhook event type:', {
                    data: validatedEvent.eventType,
                });
                // Still return success for unknown events to prevent retries
                break;
        }

        log.info('[Creem Webhook] Event processed successfully');

        // Return HTTP 200 OK as required by Creem.io documentation
        // This signals successful delivery and prevents retries
        return NextResponse.json({ received: true, processed: true }, { status: 200 });
    } catch (error) {
        log.error('[Creem Webhook] Webhook error:', { error });

        if (error instanceof z.ZodError) {
            log.error('[Creem Webhook] Schema validation failed:', {
                data: error.errors,
            });
            return NextResponse.json(
                { error: 'Invalid webhook payload', details: error.errors },
                { status: 400 },
            );
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 },
        );
    }
}
