import { auth } from '@/lib/auth';
import { CreemService } from '@repo/shared/utils';
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
        console.log('[Checkout API] Starting checkout process...');

        // Check authentication using Better Auth
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id;
        const user = session?.user;

        if (!userId) {
            console.error('[Checkout API] Authentication failed: No user ID found');
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        console.log(`[Checkout API] User authenticated: ${userId}`);

        // Parse request body
        const body = await request.json();
        console.log('[Checkout API] Request body:', body);
        const validatedData = CheckoutRequestSchema.parse(body);

        // Get Creem API key from environment
        const creemApiKey = process.env.CREEM_API_KEY || 'creem_test_5cCavUDzJjNrmU2z9iaKUa';
        if (!creemApiKey) {
            console.error('CREEM_API_KEY not configured');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
        }

        console.log('Using Creem.io payment system');

        // Map internal price IDs to our product types
        const priceMapping = {
            vt_plus_monthly: 'PLUS_SUBSCRIPTION',
            credits_100: 'SMALL',
            credits_500: 'MEDIUM',
            credits_1000: 'LARGE',
        };

        console.log('Processing checkout with price ID:', validatedData.priceId);
        console.log('Available price mappings:', Object.keys(priceMapping));

        const packageType = priceMapping[validatedData.priceId as keyof typeof priceMapping];
        if (!packageType) {
            console.error(`Invalid price ID: ${validatedData.priceId}`);
            return NextResponse.json(
                {
                    error: 'Product configuration error',
                    message: 'This product is not available. Please contact support.',
                    code: 'PRODUCT_NOT_CONFIGURED',
                },
                { status: 400 }
            );
        }

        console.log('Mapped to package type:', packageType);

        // Get user information for checkout
        const userEmail = user?.email;

        if (!userEmail) {
            console.error('No email found for user:', userId);
            return NextResponse.json(
                {
                    error: 'Email required',
                    message: 'A valid email address is required to complete checkout.',
                    code: 'EMAIL_REQUIRED',
                },
                { status: 400 }
            );
        }

        // Validate email domain
        if (userEmail.includes('@example.com')) {
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

        // Create checkout session using Creem
        let checkout;
        try {
            if (packageType === 'PLUS_SUBSCRIPTION') {
                console.log('Starting VT+ subscription checkout for user:', userEmail);
                checkout = await CreemService.subscribeToVtPlus(userEmail);
            } else {
                checkout = await CreemService.purchaseCredits(
                    packageType as keyof typeof CreemService.getCreditPackages,
                    validatedData.quantity,
                    userEmail
                );
            }
        } catch (error: any) {
            console.error('Creem checkout error:', error, error.stack);
            return NextResponse.json(
                {
                    error: 'Failed to create checkout session',
                    message: error.message || 'Payment system temporarily unavailable.',
                    code: 'CHECKOUT_FAILED',
                },
                { status: 503 }
            );
        }

        return NextResponse.json({
            checkoutId: checkout.checkoutId,
            url: checkout.url,
            success: checkout.success,
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
