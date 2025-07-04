import { PaymentService } from '@repo/shared/config/payment';
import { log } from '@repo/shared/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth-server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id;
        const userEmail = session?.user?.email;

        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // Use the PaymentService to get portal URL
        const portalResult = await PaymentService.getPortalUrl(userEmail, userId);

        if (!portalResult.success) {
            return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
        }

        return NextResponse.json({
            url: portalResult.url,
            success: true,
        });
    } catch (error) {
        log.error('Portal error:', { error });
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
