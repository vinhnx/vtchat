import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema for checkout request
const CheckoutRequestSchema = z.object({
    priceId: z.string(),
    successUrl: z.string().optional(),
    quantity: z.number().positive().optional().default(1),
});

export async function POST(request: NextRequest) {
    try {
        // Check authentication - try multiple methods to ensure we get the user ID
        const { userId: authUserId } = await auth();
        const user = await currentUser();
        const userId = authUserId || user?.id;

        if (!userId) {
            console.error('Authentication failed: No user ID found');
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();
        const validatedData = CheckoutRequestSchema.parse(body);

        // Get Polar access token from environment
        const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
        if (!polarAccessToken) {
            console.error('POLAR_ACCESS_TOKEN not configured');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
        }

        // Determine API endpoint based on environment (sandbox vs production)
        const isPolarSandbox =
            process.env.POLAR_ENVIRONMENT === 'sandbox' || process.env.NODE_ENV === 'development';
        const polarApiUrl = isPolarSandbox
            ? 'https://sandbox-api.polar.sh/v1/checkouts/'
            : 'https://api.polar.sh/v1/checkouts/';

        console.log(`Using Polar ${isPolarSandbox ? 'sandbox' : 'production'} API:`, polarApiUrl);

        // Map product price IDs to actual Polar price IDs (UUIDs)
        // These should be actual price UUIDs from your Polar.sh dashboard
        const priceMapping = {
            vt_plus_monthly: process.env.POLAR_VT_PLUS_PRICE_ID || 'demo-price-uuid',
            credits_100: process.env.POLAR_CREDITS_100_PRICE_ID || 'demo-price-uuid',
            credits_500: process.env.POLAR_CREDITS_500_PRICE_ID || 'demo-price-uuid',
            credits_1000: process.env.POLAR_CREDITS_1000_PRICE_ID || 'demo-price-uuid',
        };

        const priceId = priceMapping[validatedData.priceId as keyof typeof priceMapping];
        if (!priceId || priceId === 'demo-price-uuid') {
            console.error(`Invalid or missing price ID for: ${validatedData.priceId}`);
            return NextResponse.json(
                {
                    error: 'Product configuration error',
                    message: 'This product is not yet configured. Please contact support.',
                    code: 'PRODUCT_NOT_CONFIGURED',
                },
                { status: 503 }
            );
        }

        // Get user information for checkout
        const userEmail =
            user?.emailAddresses?.[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress;
        const userName =
            user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.fullName || 'Unknown User';

        // Validate email domain (Polar.sh validates email domains)
        if (userEmail && userEmail.includes('@example.com')) {
            console.error('Invalid email domain detected:', userEmail);
            return NextResponse.json(
                {
                    error: 'Invalid email configuration',
                    message: 'Please update your email address to continue.',
                    code: 'INVALID_EMAIL_DOMAIN',
                },
                { status: 400 }
            );
        }

        // Create checkout session using product_price_id approach (simplest method)
        const checkoutData = {
            product_price_id: priceId, // UUID of the price from Polar.sh dashboard
            customer_external_id: userId, // Use Clerk user ID as external reference
            customer_email: userEmail,
            customer_name: userName,
            success_url:
                validatedData.successUrl ||
                process.env.POLAR_SUCCESS_URL ||
                `${process.env.BASE_URL}/success?checkout_id={CHECKOUT_ID}`,
            metadata: {
                clerk_user_id: userId,
                quantity: validatedData.quantity.toString(),
                original_price_id: validatedData.priceId, // Keep track of our internal ID
                source: 'vtchat_web',
            },
        };

        const response = await fetch(polarApiUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${polarAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Polar API error:', errorData);

            // Parse error response to provide specific feedback
            let parsedError;
            try {
                parsedError = JSON.parse(errorData);
            } catch {
                parsedError = { error: errorData };
            }

            // Handle specific Polar API errors
            if (response.status === 401) {
                if (parsedError.error === 'invalid_token') {
                    console.error('Polar API token is invalid or expired');
                    return NextResponse.json(
                        {
                            error: 'Payment system configuration error',
                            message:
                                'Subscription service temporarily unavailable. Please try again later or contact support.',
                            code: 'POLAR_TOKEN_INVALID',
                        },
                        { status: 503 } // Service Unavailable
                    );
                }
                return NextResponse.json(
                    { error: 'Authentication failed with payment provider' },
                    { status: 401 }
                );
            }

            return NextResponse.json(
                { error: 'Failed to create checkout session', details: parsedError },
                { status: response.status }
            );
        }

        const checkout = await response.json();

        return NextResponse.json({
            checkoutId: checkout.id,
            url: checkout.url,
            success: true,
        });
    } catch (error) {
        console.error('Checkout error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
