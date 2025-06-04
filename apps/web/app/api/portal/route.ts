import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Get Polar access token from environment
        const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
        if (!polarAccessToken) {
            console.error('POLAR_ACCESS_TOKEN not configured');
            return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
        }

        // Determine API endpoint based on environment (sandbox vs production)
        const isPolarSandbox =
            process.env.POLAR_ENVIRONMENT === 'sandbox' || process.env.NODE_ENV === 'development';
        const polarApiBase = isPolarSandbox
            ? 'https://sandbox-api.polar.sh/v1'
            : 'https://api.polar.sh/v1';

        console.log(`Using Polar ${isPolarSandbox ? 'sandbox' : 'production'} API:`, polarApiBase);

        // Get the customer portal URL from Polar.sh
        // First, get the customer by external ID (Clerk user ID)
        const customerResponse = await fetch(`${polarApiBase}/customers?external_id=${userId}`, {
            headers: {
                Authorization: `Bearer ${polarAccessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!customerResponse.ok) {
            console.error('Failed to get customer from Polar');
            return NextResponse.json(
                { error: 'Failed to access customer portal' },
                { status: customerResponse.status }
            );
        }

        const customerData = await customerResponse.json();

        if (!customerData.items || customerData.items.length === 0) {
            return NextResponse.json(
                { error: 'No customer found. Please make a purchase first.' },
                { status: 404 }
            );
        }

        const customer = customerData.items[0];

        // Create customer portal session
        const portalData = {
            customer_id: customer.id,
            return_url: `${process.env.BASE_URL || 'http://localhost:3000'}/dashboard`,
        };

        const portalResponse = await fetch(`${polarApiBase}/customer-portal/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${polarAccessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(portalData),
        });

        if (!portalResponse.ok) {
            const errorData = await portalResponse.text();
            console.error('Polar customer portal error:', errorData);
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
