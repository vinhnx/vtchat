// Force dynamic rendering for this webhook route
export const dynamic = 'force-dynamic';

// Log webhook environment on startup
console.log('[Creem Webhook] Environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasWebhookSecret: !!process.env.CREEM_WEBHOOK_SECRET,
    webhookUrl: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/creem`
        : 'http://localhost:3000/api/webhook/creem',
});

import { db } from '@/lib/database';
import { sessions, users, userSubscriptions } from '@/lib/database/schema';
import { invalidateSubscriptionCache } from '@/lib/subscription-cache';
import { invalidateSessionSubscriptionCache } from '@/lib/subscription-session-cache';
import { PlanSlug } from '@repo/shared/types/subscription';
import { SubscriptionStatusEnum } from '@repo/shared/types/subscription-status';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
            console.log(`[Creem Webhook] Found user by email: ${customerEmail}`);
            return userByEmail[0].id;
        }

        console.error(`[Creem Webhook] No user found for email: ${customerEmail}`);
        return null;
    } catch (error) {
        console.error('[Creem Webhook] Error finding user:', error);
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
        console.log(
            `[Creem Webhook] Updating subscription for user ${userId}: ${planSlug} (${isActive ? 'active' : 'inactive'})`
        );

        // Start a transaction to ensure data consistency
        await db.transaction(async tx => {
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
                ...(subscriptionId && { stripeSubscriptionId: subscriptionId }), // Reuse this field for Creem subscription ID
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

        console.log(
            `[Creem Webhook] Successfully updated subscription for user ${userId}: ${planSlug} (${isActive ? 'active' : 'inactive'})`
        );

        // Invalidate subscription cache to force fresh data on next request
        invalidateSubscriptionCache(userId);
        console.log(`[Creem Webhook] Invalidated subscription cache for user ${userId}`);

        // Invalidate session subscription cache to force fresh data in global provider
        invalidateSessionSubscriptionCache(userId);
        console.log(`[Creem Webhook] Invalidated session subscription cache for user ${userId}`);

        // Invalidate user sessions to force fresh subscription data
        await invalidateUserSessions(userId);
    } catch (error) {
        console.error('[Creem Webhook] Failed to update user subscription:', error);
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

            console.log(
                `[Creem Webhook] Updated ${userSessions.length} sessions for user ${userId}`
            );
        }
    } catch (error) {
        console.error('[Creem Webhook] Error updating user sessions:', error);
        // Don't throw here as this is not critical for the main operation
    }
}

// Process checkout completed event
async function handleCheckoutCompleted(event: z.infer<typeof CreemCheckoutEventSchema>) {
    const { object: data } = event;

    console.log(`[Creem Webhook] Processing checkout completed:`, {
        checkoutId: data.id,
        customerEmail: data.customer.email,
        productName: data.product.name,
        amount: data.order.amount,
        subscriptionId: data.subscription?.id,
    });

    // Find user by email
    const userId = await findUserByCreemData(data.customer.email);

    if (!userId) {
        console.error(`[Creem Webhook] No user found for checkout event:`, {
            email: data.customer.email,
        });
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
        console.log(`[Creem Webhook] Updated subscription for checkout: ${data.id}`);
    }

    console.log(`[Creem Webhook] Successfully processed checkout completed for user ${userId}`);
}

// Process subscription events
async function handleSubscriptionEvent(event: z.infer<typeof CreemSubscriptionEventSchema>) {
    const { object: data } = event;

    console.log(`[Creem Webhook] Processing subscription event: ${event.eventType}`, {
        subscriptionId: data.id,
        status: data.status,
        customerEmail: data.customer.email,
    });

    // Find user by email
    const userId = await findUserByCreemData(data.customer.email);

    if (!userId) {
        console.error(`[Creem Webhook] No user found for subscription event:`, {
            email: data.customer.email,
        });
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
            console.log(
                `[Creem Webhook] New subscription activated: ${data.id} for plan: ${planSlug}`
            );
            break;

        case 'subscription.paid':
            console.log(
                `[Creem Webhook] Subscription payment received: ${data.id} for plan: ${planSlug}`
            );
            break;

        case 'subscription.update':
            // Handle subscription updates (e.g., plan changes, renewals)
            console.log(`[Creem Webhook] Subscription updated: ${data.id} for plan: ${planSlug}`);
            break;

        case 'subscription.canceled':
            // For cancelled subscriptions, user retains access until period end
            console.log(
                `[Creem Webhook] Subscription cancelled: ${data.id}. User retains access until period end.`
            );
            break;

        case 'subscription.expired':
            console.log(
                `[Creem Webhook] Subscription expired: ${data.id}. Access should be revoked.`
            );
            break;
    }

    console.log(
        `[Creem Webhook] Successfully processed subscription event: ${event.eventType} for user ${userId}`
    );
}

// Verify webhook signature based on Creem's documentation
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        // Generate expected signature using HMAC-SHA256
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        console.log('[Creem Webhook] Signature verification debug:', {
            receivedSignature: signature,
            expectedSignature: expectedSignature,
            secretLength: secret.length,
            payloadLength: payload.length,
        });

        // Compare signatures using timing-safe comparison
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('[Creem Webhook] Signature verification failed:', error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        console.log('[Creem Webhook] =================================');
        console.log('[Creem Webhook] Received webhook request at /api/webhook/creem');
        console.log('[Creem Webhook] Headers:', Object.fromEntries(request.headers.entries()));
        console.log('[Creem Webhook] Body length:', body.length);
        console.log('[Creem Webhook] Raw body:', body);

        // Get webhook secret from environment
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;

        // In development, we might not have webhook secret configured
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (!webhookSecret && !isDevelopment) {
            console.error('[Creem Webhook] CREEM_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Verify webhook signature if secret is available and not in development
        if (webhookSecret && !isDevelopment) {
            const signature = request.headers.get('creem-signature');
            if (!signature) {
                console.error('[Creem Webhook] No creem-signature header found');
                return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
            }

            if (!verifyWebhookSignature(body, signature, webhookSecret)) {
                console.error('[Creem Webhook] Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }

            console.log('[Creem Webhook] Signature verified successfully');
        } else {
            console.warn(
                '[Creem Webhook] Running in development mode - skipping signature verification'
            );
        }

        // Parse webhook event
        let event;
        try {
            event = JSON.parse(body);
        } catch (parseError) {
            console.error('[Creem Webhook] Failed to parse webhook body:', parseError);
            return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
        }

        const validatedEvent = CreemWebhookEventSchema.parse(event);

        console.log('[Creem Webhook] Processing event:', {
            eventType: validatedEvent.eventType,
            id: validatedEvent.object?.id,
            customer: validatedEvent.object?.customer?.email,
        });

        // Route to appropriate handler
        switch (validatedEvent.eventType) {
            case 'checkout.completed':
                const checkoutEvent = CreemCheckoutEventSchema.parse(event);
                await handleCheckoutCompleted(checkoutEvent);
                break;

            case 'subscription.active':
            case 'subscription.paid':
            case 'subscription.update':
            case 'subscription.canceled':
            case 'subscription.expired':
                const subscriptionEvent = CreemSubscriptionEventSchema.parse(event);
                await handleSubscriptionEvent(subscriptionEvent);
                break;

            default:
                console.log(
                    '[Creem Webhook] Unhandled webhook event type:',
                    validatedEvent.eventType
                );
        }

        console.log('[Creem Webhook] Event processed successfully');
        return NextResponse.json({ received: true, processed: true });
    } catch (error) {
        console.error('[Creem Webhook] Webhook error:', error);

        if (error instanceof z.ZodError) {
            console.error('[Creem Webhook] Schema validation failed:', error.errors);
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
