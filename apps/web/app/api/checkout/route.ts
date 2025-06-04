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

        // Create checkout session with Polar.sh
        const checkoutData = {
            product_price_id: validatedData.priceId,
            customer_id: userId, // Use Clerk user ID as customer ID
            success_url:
                validatedData.successUrl ||
                process.env.POLAR_SUCCESS_URL ||
                `${process.env.BASE_URL}/success?checkout_id={CHECKOUT_ID}`,
            metadata: {
                clerk_user_id: userId,
                quantity: validatedData.quantity.toString(),
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
