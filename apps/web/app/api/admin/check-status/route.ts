import { type NextRequest, NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/admin';
import { auth } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user?.id) {
            return NextResponse.json({ isAdmin: false });
        }

        const adminStatus = await isUserAdmin(session.user.id);

        console.log('Admin status check:', {
            userId: session.user.id,
            email: session.user.email,
            adminStatus,
        });

        return NextResponse.json({ isAdmin: adminStatus });
    } catch (error) {
        console.error('Error checking admin status:', error);
        return NextResponse.json({ isAdmin: false });
    }
}
