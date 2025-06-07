import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id;
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get Creem API key from environment
        const creemApiKey = process.env.CREEM_API_KEY;
        if (!creemApiKey) {
            console.error('CREEM_API_KEY not configured');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
        }

        // Determine API endpoint based on environment (sandbox vs production)
        const isCreemSandbox =
            process.env.CREEM_ENVIRONMENT === 'sandbox' || process.env.NODE_ENV === 'development';
        const creemApiBase = isCreemSandbox
            ? 'https://sandbox.creem.io/api/v1'
            : 'https://api.creem.io/v1';

        console.log(`Using Creem ${isCreemSandbox ? 'sandbox' : 'production'} API:`, creemApiBase);

        // Create customer portal session with Creem.io
        const portalData = {
            customer_id: userId, // Use Better Auth user ID as customer ID
            return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard`,
        };

        const portalResponse = await fetch(`${creemApiBase}/customer-portal`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${creemApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(portalData),
        });

        if (!portalResponse.ok) {
            const errorData = await portalResponse.text();
            console.error('Creem customer portal error:', errorData);
            return NextResponse.json(
                { error: 'Failed to create portal session' },
                { status: portalResponse.status }
            );
        }

        const portal = await portalResponse.json();

        return NextResponse.json({
            url: portal.url,
            success: true,
        });
    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
