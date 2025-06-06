import { db } from '@/lib/database';
import { users, userSubscriptions } from '@/lib/database/schema';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Creem.io webhook event schemas
const CreemWebhookEventSchema = z.object({
    type: z.string(),
    data: z.record(z.any()),
});

const CreemCheckoutEventSchema = z.object({
    type: z.literal('checkout.completed'),
    data: z.object({
        id: z.string(),
        status: z.string(),
        customer: z.object({
            id: z.string(),
            email: z.string(),
            external_id: z.string().optional(),
        }),
        product: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string().optional(),
        }),
        amount: z.number(),
        currency: z.string(),
        metadata: z.record(z.string()).optional(),
    }),
});

const CreemSubscriptionEventSchema = z.object({
    type: z.enum(['subscription.created', 'subscription.updated', 'subscription.cancelled']),
    data: z.object({
        id: z.string(),
        status: z.enum(['active', 'canceled', 'incomplete', 'past_due', 'trialing']),
        customer: z.object({
            id: z.string(),
            email: z.string(),
            external_id: z.string().optional(),
        }),
        product: z.object({
            id: z.string(),
            name: z.string(),
        }),
        current_period_start: z.string(),
        current_period_end: z.string(),
        metadata: z.record(z.string()).optional(),
    }),
});

// Map Creem product info to VT Chat plan slugs
function mapCreemProductToPlan(productName: string): string {
    const productLower = productName.toLowerCase();

    if (
        productLower.includes('plus') ||
        productLower.includes('premium') ||
        productLower.includes('vt+')
    ) {
        return 'vt_plus';
    }

    return 'vt_base';
}

// Map Creem products to credit amounts
function getCreditsFromProduct(productName: string, amount: number): number {
    const productLower = productName.toLowerCase();

    // Try to extract credit amount from product name first
    if (productLower.includes('100')) return 100;
    if (productLower.includes('500')) return 500;
    if (productLower.includes('1000') || productLower.includes('1,000')) return 1000;

    // For VT+ subscription, give monthly credit allowance
    if (
        productLower.includes('plus') ||
        productLower.includes('premium') ||
        productLower.includes('vt+')
    ) {
        return 1000; // VT+ monthly credit allowance
    }

    // Fallback: calculate credits based on amount (assuming $0.05 per credit)
    return Math.floor(amount / 5); // $5 = 100 credits, so amount in cents / 5
}

// Update user credits in database
async function updateUserCredits(
    userId: string,
    creditsToAdd: number,
    checkoutId?: string,
    productName?: string
) {
    try {
        // Get current user subscription
        const existingSubscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        if (existingSubscription.length === 0) {
            // Create new subscription with credits
            await db.insert(userSubscriptions).values({
                id: crypto.randomUUID(),
                userId,
                plan: 'free',
                status: 'active',
                creditsRemaining: creditsToAdd,
                creditsUsed: 0,
                monthlyCredits: 50,
            });
        } else {
            // Update existing subscription
            const currentCredits = existingSubscription[0].creditsRemaining;
            const newBalance = currentCredits + creditsToAdd;

            await db
                .update(userSubscriptions)
                .set({
                    creditsRemaining: newBalance,
                    updatedAt: new Date(),
                })
                .where(eq(userSubscriptions.userId, userId));
        }

        console.log(`Added ${creditsToAdd} credits to user ${userId}.`);
    } catch (error) {
        console.error('Failed to update user credits:', error);
        throw error;
    }
}

// Update user subscription in database
async function updateUserSubscription(
    userId: string,
    planSlug: string,
    isActive: boolean,
    expiresAt?: Date
) {
    try {
        const existingSubscription = await db
            .select()
            .from(userSubscriptions)
            .where(eq(userSubscriptions.userId, userId))
            .limit(1);

        const subscriptionData = {
            plan: planSlug,
            status: isActive ? 'active' : 'cancelled',
            ...(expiresAt && { currentPeriodEnd: expiresAt }),
            updatedAt: new Date(),
        };

        if (existingSubscription.length === 0) {
            // Create new subscription
            await db.insert(userSubscriptions).values({
                id: crypto.randomUUID(),
                userId,
                ...subscriptionData,
                creditsRemaining: planSlug === 'free' ? 50 : 1000,
                creditsUsed: 0,
                monthlyCredits: planSlug === 'free' ? 50 : 1000,
            });
        } else {
            // Update existing subscription
            await db
                .update(userSubscriptions)
                .set(subscriptionData)
                .where(eq(userSubscriptions.userId, userId));
        }

        console.log(
            `Updated subscription for user ${userId}: ${planSlug} (${isActive ? 'active' : 'inactive'})`
        );
    } catch (error) {
        console.error('Failed to update user subscription:', error);
        throw error;
    }
}

// Process checkout completed event
async function handleCheckoutCompleted(event: z.infer<typeof CreemCheckoutEventSchema>) {
    const { data } = event;

    // Find user by email or external_id
    let userId = data.customer.external_id;

    if (!userId) {
        // Try to find user by email in our database
        try {
            const user = await db
                .select()
                .from(users)
                .where(eq(users.email, data.customer.email))
                .limit(1);

            if (user.length > 0) {
                userId = user[0].id;
            } else {
                console.error('No user found for email:', data.customer.email);
                return;
            }
        } catch (error) {
            console.error('Failed to find user by email:', error);
            return;
        }
    }

    const productName = data.product.name;
    const creditsToAdd = getCreditsFromProduct(productName, data.amount);

    if (creditsToAdd > 0) {
        await updateUserCredits(userId, creditsToAdd, data.id, productName);
    }

    // If this is a subscription product, update subscription status
    const planSlug = mapCreemProductToPlan(productName);
    if (planSlug === 'vt_plus') {
        await updateUserSubscription(userId, planSlug, true);
    }
}

// Process subscription events
async function handleSubscriptionEvent(event: z.infer<typeof CreemSubscriptionEventSchema>) {
    const { data } = event;

    // Find user by email or external_id
    let userId = data.customer.external_id;

    if (!userId) {
        // Try to find user by email in our database
        try {
            const user = await db
                .select()
                .from(users)
                .where(eq(users.email, data.customer.email))
                .limit(1);

            if (user.length > 0) {
                userId = user[0].id;
            } else {
                console.error('No user found for email:', data.customer.email);
                return;
            }
        } catch (error) {
            console.error('Failed to find user by email:', error);
            return;
        }
    }

    const productName = data.product.name;
    const planSlug = mapCreemProductToPlan(productName);
    const isActive = data.status === 'active';

    // Parse expiration date if available
    let expiresAt: Date | undefined;
    if (data.current_period_end) {
        expiresAt = new Date(data.current_period_end);
    }

    await updateUserSubscription(userId, planSlug, isActive, expiresAt);

    // For new active subscriptions, add monthly credits
    if (event.type === 'subscription.created' && isActive && planSlug === 'vt_plus') {
        await updateUserCredits(userId, 1000, data.id, 'VT+ Monthly Credits');
    }
}

// Verify webhook signature (implement based on Creem's documentation)
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();

        // Get webhook secret from environment
        const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('CREEM_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
        }

        // Verify webhook signature
        const signature = request.headers.get('x-creem-signature');
        if (!signature || !verifyWebhookSignature(body, signature, webhookSecret)) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse webhook event
        const event = JSON.parse(body);
        const validatedEvent = CreemWebhookEventSchema.parse(event);

        console.log('Received Creem webhook:', validatedEvent.type);

        // Route to appropriate handler
        switch (validatedEvent.type) {
            case 'checkout.completed':
                const checkoutEvent = CreemCheckoutEventSchema.parse(event);
                await handleCheckoutCompleted(checkoutEvent);
                break;

            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.cancelled':
                const subscriptionEvent = CreemSubscriptionEventSchema.parse(event);
                await handleSubscriptionEvent(subscriptionEvent);
                break;

            default:
                console.log('Unhandled webhook event type:', validatedEvent.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid webhook payload', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
