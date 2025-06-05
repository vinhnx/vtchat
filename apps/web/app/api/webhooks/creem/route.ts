import { CREEM_CREDIT_PACKAGES } from '@repo/shared/utils';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Webhook event types from Creem
interface CreemWebhookEvent {
    id: string;
    type: string;
    data: {
        id: string;
        status: string;
        customer: {
            email: string;
            id: string;
        };
        metadata: {
            packageId?: string;
            isSubscription?: string;
            successUrl?: string;
            source?: string;
        };
        amount: number;
        currency: string;
        created_at: string;
    };
}

/**
 * Creem.io Webhook Handler
 *
 * Handles successful payment notifications from Creem.io and updates
 * user credits and subscription status accordingly.
 */
export async function POST(request: NextRequest) {
    try {
        console.log('[Creem Webhook] Received webhook event');

        // Get the raw body for signature verification
        const body = await request.text();
        const signature = headers().get('creem-signature');

        // TODO: Implement signature verification once Creem provides signature details
        // For now, we'll proceed with processing but log for security review
        console.log('[Creem Webhook] Processing event (signature verification pending)');

        // Parse the webhook event
        let event: CreemWebhookEvent;
        try {
            event = JSON.parse(body);
        } catch (error) {
            console.error('[Creem Webhook] Invalid JSON payload:', error);
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        console.log('[Creem Webhook] Event details:', {
            id: event.id,
            type: event.type,
            status: event.data.status,
            customerEmail: event.data.customer?.email,
            amount: event.data.amount,
            metadata: event.data.metadata,
        });

        // Only process successful payment events
        if (event.type !== 'payment.succeeded' && event.data.status !== 'completed') {
            console.log('[Creem Webhook] Event not relevant for processing:', event.type);
            return NextResponse.json({ received: true });
        }

        const { customer, metadata, amount } = event.data;
        const customerEmail = customer?.email;
        const packageId = metadata?.packageId;
        const isSubscription = metadata?.isSubscription === 'true';

        if (!customerEmail) {
            console.error('[Creem Webhook] No customer email found in event');
            return NextResponse.json({ error: 'Customer email required' }, { status: 400 });
        }

        // Find user by email (you'll need to implement this based on your user system)
        // For now, we'll use the Clerk API to find the user
        const user = await findUserByEmail(customerEmail);
        if (!user) {
            console.error('[Creem Webhook] User not found for email:', customerEmail);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log('[Creem Webhook] Processing for user:', user.id);

        if (isSubscription) {
            // Handle VT+ subscription
            await processSubscription(user.id, customerEmail, event);
        } else if (packageId) {
            // Handle one-time credit purchase
            await processCreditPurchase(user.id, packageId, event);
        } else {
            console.warn(
                '[Creem Webhook] Unknown payment type - no packageId or subscription flag'
            );
            return NextResponse.json({ error: 'Unknown payment type' }, { status: 400 });
        }

        console.log('[Creem Webhook] Successfully processed payment event');
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[Creem Webhook] Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}

/**
 * Find user by email using Clerk API
 */
async function findUserByEmail(email: string) {
    try {
        console.log('[Creem Webhook] Looking up user by email:', email);

        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();

        const users = await clerk.users.getUserList({
            emailAddress: [email],
            limit: 1,
        });

        if (users.data && users.data.length > 0) {
            const user = users.data[0];
            console.log('[Creem Webhook] Found user:', user.id);
            return { id: user.id, email: user.emailAddresses[0]?.emailAddress || email };
        }

        console.log('[Creem Webhook] No user found for email:', email);
        return null;
    } catch (error) {
        console.error('[Creem Webhook] Error finding user:', error);
        return null;
    }
}

/**
 * Process VT+ subscription activation
 */
async function processSubscription(userId: string, email: string, event: CreemWebhookEvent) {
    try {
        console.log('[Creem Webhook] Processing VT+ subscription for user:', userId);

        // Update user subscription status in your database
        // This is where you'd update the user's subscription tier to VT+
        await updateUserSubscription(userId, {
            tier: 'vt_plus',
            status: 'active',
            creemCustomerId: event.data.customer.id,
            subscriptionStartDate: new Date(event.data.created_at),
            monthlyCredits: CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION.credits,
        });

        // Add initial monthly credits
        await addCreditsToUser(userId, CREEM_CREDIT_PACKAGES.PLUS_SUBSCRIPTION.credits, {
            type: 'subscription',
            description: 'VT+ Monthly Credits',
            source: 'creem',
            transactionId: event.id,
        });

        console.log('[Creem Webhook] VT+ subscription activated successfully');
    } catch (error) {
        console.error('[Creem Webhook] Error processing subscription:', error);
        throw error;
    }
}

/**
 * Process one-time credit purchase
 */
async function processCreditPurchase(userId: string, packageId: string, event: CreemWebhookEvent) {
    try {
        console.log(
            '[Creem Webhook] Processing credit purchase for user:',
            userId,
            'package:',
            packageId
        );

        // Map package ID to credit amount
        const packageKey = packageId as keyof typeof CREEM_CREDIT_PACKAGES;
        const creditPackage = CREEM_CREDIT_PACKAGES[packageKey];

        if (!creditPackage) {
            throw new Error(`Unknown package ID: ${packageId}`);
        }

        // Add credits to user account
        await addCreditsToUser(userId, creditPackage.credits, {
            type: 'purchase',
            description: `Purchased ${creditPackage.name}`,
            source: 'creem',
            transactionId: event.id,
            packageId,
        });

        console.log('[Creem Webhook] Credits added successfully:', creditPackage.credits);
    } catch (error) {
        console.error('[Creem Webhook] Error processing credit purchase:', error);
        throw error;
    }
}

/**
 * Update user subscription in database
 */
async function updateUserSubscription(userId: string, subscriptionData: any) {
    try {
        console.log('[Creem Webhook] Updating user subscription:', userId, subscriptionData);

        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();

        // Get current user to preserve existing metadata
        const user = await clerk.users.getUser(userId);

        // Update user subscription status in Clerk metadata
        await clerk.users.updateUser(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                planSlug: subscriptionData.tier, // Direct planSlug for easier access (VT+ fix)
                subscription: {
                    plan: subscriptionData.tier, // Use 'plan' to match other webhook
                    isActive: subscriptionData.status === 'active',
                    tier: subscriptionData.tier,
                    status: subscriptionData.status,
                    source: 'creem',
                    creemCustomerId: subscriptionData.creemCustomerId,
                    subscriptionStartDate: subscriptionData.subscriptionStartDate?.toISOString(),
                    lastUpdated: new Date().toISOString(),
                },
            },
            privateMetadata: {
                ...user.privateMetadata,
                subscription: {
                    plan: subscriptionData.tier, // Use 'plan' to match other webhook
                    isActive: subscriptionData.status === 'active',
                    tier: subscriptionData.tier,
                    status: subscriptionData.status,
                    source: 'creem',
                    creemCustomerId: subscriptionData.creemCustomerId,
                    subscriptionStartDate: subscriptionData.subscriptionStartDate?.toISOString(),
                    monthlyCredits: subscriptionData.monthlyCredits,
                    lastUpdated: new Date().toISOString(),
                },
            },
        });

        console.log(
            `[Creem Webhook] Updated user ${userId} subscription to ${subscriptionData.tier}`
        );
    } catch (error) {
        console.error('[Creem Webhook] Error updating user subscription:', error);
        throw error;
    }
}

/**
 * Add credits to user account
 */
async function addCreditsToUser(userId: string, credits: number, metadata: any) {
    try {
        console.log('[Creem Webhook] Adding credits to user:', userId, credits, metadata);

        const { clerkClient } = await import('@clerk/nextjs/server');
        const clerk = await clerkClient();

        // Get current user data
        const user = await clerk.users.getUser(userId);
        const currentCredits = (user.privateMetadata.credits as number) || 0;
        const newBalance = currentCredits + credits;

        // Record the transaction in private metadata
        const transactions = (user.privateMetadata.transactions || []) as Array<any>;
        const transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: metadata.type,
            amount: credits,
            description: metadata.description,
            source: metadata.source,
            transactionId: metadata.transactionId,
            packageId: metadata.packageId,
            timestamp: new Date().toISOString(),
        };

        // Limit transaction history to 100 items to avoid metadata size issues
        const updatedTransactions = [transaction, ...transactions].slice(0, 100);

        // Update user credits and transaction history
        await clerk.users.updateUser(userId, {
            privateMetadata: {
                ...user.privateMetadata,
                credits: newBalance,
                lastCreditUpdate: new Date().toISOString(),
                transactions: updatedTransactions,
            },
        });

        console.log(
            `[Creem Webhook] Added ${credits} credits to user ${userId}. New balance: ${newBalance}`
        );
    } catch (error) {
        console.error('[Creem Webhook] Error adding credits to user:', error);
        throw error;
    }
}
