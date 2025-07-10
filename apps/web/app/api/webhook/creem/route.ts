// Force dynamic rendering for this webhook route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const revalidate = 0;

import crypto from 'node:crypto';
import { log } from '@repo/shared/logger';
import { EnvironmentType, getCurrentEnvironment } from '@repo/shared/types/environment';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';
import { sessions, userSubscriptions, users } from '@/lib/database/schema';
import { invalidateSubscriptionCache } from '@/lib/subscription-cache';
import { invalidateSessionSubscriptionCache } from '@/lib/subscription-session-cache';

// Creem.io webhook event schemas - Updated to match actual Creem events
const CreemWebhookEventSchema = z.object({
    id: z.string(),
    eventType: z.string(), // Creem uses eventType, not type
    created_at: z.number(),
    object: z.record(z.any()),
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
        metadata: z.record(z.string()).optional(),
    }),
});

const CreemSubscriptionEventSchema = z.object({
    id: z.string(),
    eventType: z.enum([
        'subscription.active',
        'subscription.paid',
        'subscription.canceled',
        'subscription.expired',
        'subscription.update',
    ]),
    created_at: z.number(),
    object: z.object({
        id: z.string(),
        status: z.enum([
            SubscriptionStatusEnum.ACTIVE,
            SubscriptionStatusEnum.CANCELED,
            SubscriptionStatusEnum.INCOMPLETE,
            SubscriptionStatusEnum.PAST_DUE,
            SubscriptionStatusEnum.TRIALING,
            SubscriptionStatusEnum.EXPIRED,
        ]),
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
        metadata: z.record(z.string()).optional(),
        canceled_at: z.string().nullable().optional(),
    }),
});

// Map Creem product info to VT Chat plan slugs
function mapCreemProductToPlan(productName: string, metadata?: Record<string, string>): string {
    // Check metadata first for explicit package mapping
    if (metadata?.packageId) {
        const packageId = metadata.packageId;
        if (packageId === PlanSlug.VT_PLUS || packageId.includes('plus')) {
            return PlanSlug.VT_PLUS;
        }
    }

    const productLower = productName.toLowerCase();

    if (
        productLower.includes('plus') ||
        productLower.includes('premium') ||
        productLower.includes('vt+')
    ) {
        return PlanSlug.VT_PLUS;
    }

    return PlanSlug.VT_BASE; // Default to base for credit purchases
}

// Find user by email from Creem
async function findUserByCreemData(customerEmail: string): Promise<string | null> {
    try {
        // Find user by email
        const userByEmail = await db
            .select()
            .from(users)
            .where(eq(users.email, customerEmail))
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
    isActive: boolean,
    subscriptionId?: string,
    expiresAt?: Date,
    creemCustomerId?: string
) {
    try {
        log.info(
            `[Creem Webhook] Updating subscription for user ${userId}: ${planSlug} (${isActive ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE})`
        );

        // Start a transaction to ensure data consistency
        await db.transaction(async (tx) => {
            // Update user's plan and customer ID in the users table
            const userUpdateData: any = {
                planSlug,
                updatedAt: new Date(),
            };

            if (creemCustomerId) {
                userUpdateData.creemCustomerId = creemCustomerId;
            }

            await tx.update(users).set(userUpdateData).where(eq(users.id, userId));

            // Update or create user subscription record
            const existingSubscription = await tx
                .select()
                .from(userSubscriptions)
                .where(eq(userSubscriptions.userId, userId))
                .limit(1);

            const subscriptionData = {
                plan: planSlug,
                status: isActive ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.CANCELED, // Use enum
                ...(expiresAt && { currentPeriodEnd: expiresAt }),
                ...(subscriptionId && { creemSubscriptionId: subscriptionId }), // Store Creem subscription ID
                updatedAt: new Date(),
            };

            if (existingSubscription.length === 0) {
                // Create new subscription
                await tx.insert(userSubscriptions).values({
                    id: crypto.randomUUID(),
                    userId,
                    ...subscriptionData,
                    createdAt: new Date(),
                });
            } else {
                // Update existing subscription
                await tx
                    .update(userSubscriptions)
                    .set(subscriptionData)
                    .where(eq(userSubscriptions.userId, userId));
            }
        });

        log.info(
            `[Creem Webhook] Successfully updated subscription for user ${userId}: ${planSlug} (${isActive ? SubscriptionStatusEnum.ACTIVE : SubscriptionStatusEnum.INACTIVE})`
        );

        // Invalidate subscription cache to force fresh data on next request
        invalidateSubscriptionCache(userId);
        log.info(`[Creem Webhook] Invalidated subscription cache for user ${userId}`);

        // Invalidate session subscription cache to force fresh data in global provider
        invalidateSessionSubscriptionCache(userId);
        log.info(`[Creem Webhook] Invalidated session subscription cache for user ${userId}`);

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
    const userId = await findUserByCreemData(data.customer.email);

    if (!userId) {
        log.error('[Creem Webhook] No user found for checkout event');
        return;
    }

    const productName = data.product.name;

    // If this is a subscription product, update subscription status
    const planSlug = mapCreemProductToPlan(productName, data.metadata);
    if (planSlug === PlanSlug.VT_PLUS && data.subscription) {
        await updateUserSubscription(
            userId,
            planSlug,
            true, // active since checkout completed
            data.subscription.id,
            undefined, // expiry will be set by subscription events
            data.customer.id
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
    const userId = await findUserByCreemData(data.customer.email);

    if (!userId) {
        log.error('[Creem Webhook] No user found for subscription event');
        return;
    }

    const productName = data.product.name;
    const planSlug = mapCreemProductToPlan(productName, data.metadata);
    const isActive = data.status === SubscriptionStatusEnum.ACTIVE;

    // Parse expiration date if available
    let expiresAt: Date | undefined;
    if (data.current_period_end_date) {
        expiresAt = new Date(data.current_period_end_date);
    }

    // Update subscription status in database
    await updateUserSubscription(
        userId,
        planSlug,
        isActive,
        data.id, // subscription ID
        expiresAt,
        data.customer.id // Creem customer ID
    );

    // Handle specific event types
    switch (event.eventType) {
        case 'subscription.active':
            log.info(
                `[Creem Webhook] New subscription activated: ${data.id} for plan: ${planSlug}`
            );
            break;

        case 'subscription.paid':
            log.info(
                `[Creem Webhook] Subscription payment received: ${data.id} for plan: ${planSlug}`
            );
            break;

        case 'subscription.update':
            // Handle subscription updates (e.g., plan changes, renewals)
            log.info(`[Creem Webhook] Subscription updated: ${data.id} for plan: ${planSlug}`);
            break;

        case 'subscription.canceled':
            // For cancelled subscriptions, user retains access until period end
            log.info(
                `[Creem Webhook] Subscription cancelled: ${data.id}. User retains access until period end.`
            );
            break;

        case 'subscription.expired':
            log.info(`[Creem Webhook] Subscription expired: ${data.id}. Access should be revoked.`);
            break;
    }

    log.info(
        `[Creem Webhook] Successfully processed subscription event: ${event.eventType} for user ${userId}`
    );
}

// Verify webhook signature based on Creem's documentation
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        // Generate expected signature using HMAC-SHA256
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        log.info('[Creem Webhook] Signature verification debug:', {
            receivedSignature: signature,
            expectedSignature,
            secretLength: secret.length,
            payloadLength: payload.length,
        });

        // Compare signatures using timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
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
        log.info('[Creem Webhook] Headers:', {
            headers: Object.fromEntries(request.headers.entries()),
        });
        log.info('[Creem Webhook] Body length:', { bodyLength: body.length });
        log.info('[Creem Webhook] Raw body:', { body });

        // Get webhook secret from environment
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        // In development, we might not have webhook secret configured
        const isDevelopment = getCurrentEnvironment() === EnvironmentType.DEVELOPMENT;

        if (!(webhookSecret || isDevelopment)) {
            log.error('[Creem Webhook] CREEM_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Verify webhook signature if secret is available and not in development
        if (webhookSecret && !isDevelopment) {
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
        } else {
            log.warn(
                '[Creem Webhook] Running in development mode - skipping signature verification'
            );
        }

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
            case 'subscription.expired': {
                const subscriptionEvent = CreemSubscriptionEventSchema.parse(event);
                await handleSubscriptionEvent(subscriptionEvent);
                break;
            }

            default:
                log.info('[Creem Webhook] Unhandled webhook event type:', {
                    data: validatedEvent.eventType,
                });
        }

        log.info('[Creem Webhook] Event processed successfully');
        return NextResponse.json({ received: true, processed: true });
    } catch (error) {
        log.error('[Creem Webhook] Webhook error:', { error });

        if (error instanceof z.ZodError) {
            log.error('[Creem Webhook] Schema validation failed:', {
                data: error.errors,
            });
            return NextResponse.json(
                { error: 'Invalid webhook payload', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
