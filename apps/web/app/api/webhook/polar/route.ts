import { clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Polar.sh webhook event schemas
const PolarWebhookEventSchema = z.object({
    type: z.string(),
    data: z.record(z.any()),
});

const CheckoutEventSchema = z.object({
    type: z.literal('checkout.created'),
    data: z.object({
        id: z.string(),
        status: z.string(),
        customer_id: z.string(),
        product_price: z.object({
            id: z.string(),
            price_amount: z.number(),
            price_currency: z.string(),
            product: z.object({
                name: z.string(),
                description: z.string().optional(),
            }),
        }),
        metadata: z.record(z.string()).optional(),
    }),
});

const SubscriptionEventSchema = z.object({
    type: z.enum(['subscription.created', 'subscription.updated', 'subscription.cancelled']),
    data: z.object({
        id: z.string(),
        status: z.enum(['active', 'canceled', 'incomplete', 'past_due', 'trialing']),
        customer_id: z.string(),
        product_price: z.object({
            id: z.string(),
            product: z.object({
                name: z.string(),
            }),
        }),
        current_period_start: z.string(),
        current_period_end: z.string(),
        metadata: z.record(z.string()).optional(),
    }),
});

// Map Polar product names to VT Chat plan slugs
function mapPolarProductToPlan(productName: string): string {
    const productLower = productName.toLowerCase();

    if (productLower.includes('plus') || productLower.includes('premium')) {
        return 'vt_plus';
    }

    return 'vt_base';
}

// Map Polar products to credit amounts
function getCreditsFromProduct(productName: string): number {
    const productLower = productName.toLowerCase();

    if (productLower.includes('100')) return 100;
    if (productLower.includes('500')) return 500;
    if (productLower.includes('1000') || productLower.includes('1,000')) return 1000;

    return 0; // Default for non-credit products
}

// Update user credits in Clerk
async function updateUserCredits(
    clerkUserId: string,
    creditsToAdd: number,
    checkoutId?: string,
    productName?: string
) {
    try {
        // Get current user data
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(clerkUserId);
        const currentCredits = (user.privateMetadata.credits as number) || 0;
        const newBalance = currentCredits + creditsToAdd;

        // Record the transaction in private metadata
        const transactions = (user.privateMetadata.transactions || []) as Array<any>;
        const transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: 'purchase',
            amount: creditsToAdd,
            timestamp: new Date().toISOString(),
            checkoutId,
            productName,
        };

        // Limit transaction history to 100 items to avoid metadata size issues
        const updatedTransactions = [transaction, ...transactions].slice(0, 100);

        // Update user credits and transaction history
        await clerk.users.updateUser(clerkUserId, {
            privateMetadata: {
                ...user.privateMetadata,
                credits: newBalance,
                lastCreditUpdate: new Date().toISOString(),
                transactions: updatedTransactions,
            },
        });

        console.log(
            `Updated user ${clerkUserId} credits: +${creditsToAdd} (balance: ${newBalance})`
        );
    } catch (error) {
        console.error(`Failed to update user ${clerkUserId} credits:`, error);
        throw error;
    }
}

// Update user subscription in Clerk
async function updateUserSubscription(
    clerkUserId: string,
    planSlug: string,
    isActive: boolean,
    expiresAt?: Date
) {
    try {
        const clerk = await clerkClient();
        await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
                planSlug,
            },
            privateMetadata: {
                subscription: {
                    isActive,
                    expiresAt: expiresAt?.toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            },
        });

        console.log(`Updated user ${clerkUserId} subscription: ${planSlug}, active: ${isActive}`);
    } catch (error) {
        console.error(`Failed to update user ${clerkUserId} subscription:`, error);
        throw error;
    }
}

// Process checkout completed event
async function handleCheckoutCreated(event: z.infer<typeof CheckoutEventSchema>) {
    const { data } = event;

    if (data.status !== 'confirmed') {
        console.log(`Checkout ${data.id} not confirmed yet, status: ${data.status}`);
        return;
    }

    const clerkUserId = data.metadata?.clerk_user_id;
    if (!clerkUserId) {
        console.error('No clerk_user_id in checkout metadata');
        return;
    }

    const productName = data.product_price.product.name;

    // Check if this is a credit purchase
    const creditsAmount = getCreditsFromProduct(productName);

    if (creditsAmount > 0) {
        // Handle credit purchase
        await updateUserCredits(clerkUserId, creditsAmount, data.id, productName);
    } else {
        // Handle subscription purchase
        const planSlug = mapPolarProductToPlan(productName);
        await updateUserSubscription(clerkUserId, planSlug, true);
    }
}

// Process subscription events
async function handleSubscriptionEvent(event: z.infer<typeof SubscriptionEventSchema>) {
    const { data } = event;

    const clerkUserId = data.metadata?.clerk_user_id;
    if (!clerkUserId) {
        console.error('No clerk_user_id in subscription metadata');
        return;
    }

    const planSlug = mapPolarProductToPlan(data.product_price.product.name);
    const isActive = data.status === 'active';
    const expiresAt = new Date(data.current_period_end);

    await updateUserSubscription(clerkUserId, planSlug, isActive, expiresAt);
}

export async function POST(request: NextRequest) {
    try {
        // Get the raw body for webhook signature verification
        const body = await request.text();
        const event = JSON.parse(body);

        // Validate webhook signature
        const signature = request.headers.get('polar-signature');
        if (process.env.POLAR_WEBHOOK_SECRET && signature) {
            const timestamp = signature.split(',')[0].split('=')[1];
            const signedPayload = `${timestamp}.${body}`;

            const expectedSignature = crypto
                .createHmac('sha256', process.env.POLAR_WEBHOOK_SECRET)
                .update(signedPayload)
                .digest('hex');

            const providedSignature = signature.split(',')[1].split('=')[1];

            if (expectedSignature !== providedSignature) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
            }
        } else if (process.env.NODE_ENV === 'production') {
            // Only enforce signatures in production
            console.error('Missing webhook signature or secret');
            return NextResponse.json(
                { error: 'Missing webhook signature or secret' },
                { status: 401 }
            );
        }

        // Parse and validate the event
        const parsedEvent = PolarWebhookEventSchema.parse(event);

        console.log(`Received Polar webhook: ${parsedEvent.type}`);

        // Handle different event types
        switch (parsedEvent.type) {
            case 'checkout.created':
                const checkoutEvent = CheckoutEventSchema.parse(parsedEvent);
                await handleCheckoutCreated(checkoutEvent);
                break;

            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.cancelled':
                const subscriptionEvent = SubscriptionEventSchema.parse(parsedEvent);
                await handleSubscriptionEvent(subscriptionEvent);
                break;

            default:
                console.log(`Unhandled webhook event type: ${parsedEvent.type}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);

        if (error instanceof z.ZodError) {
            console.error('Webhook validation error:', error.errors);
            return NextResponse.json(
                { error: 'Invalid webhook payload', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

// Support GET for webhook endpoint verification
export async function GET() {
    return NextResponse.json({ status: 'Polar webhook endpoint active' });
}
