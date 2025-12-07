import { cookies, headers } from 'next/headers';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    || process.env.NEXT_PUBLIC_BETTER_AUTH_URL
    || 'http://localhost:3000';

export async function fetchWithAuth(path: string) {
    const cookieStore = cookies();
    const headerStore = headers();
    const cookie = cookieStore.toString();
    const forwardedProto = headerStore.get('x-forwarded-proto');
    const forwardedHost = headerStore.get('x-forwarded-host');
    const origin = forwardedProto && forwardedHost
        ? `${forwardedProto}://${forwardedHost}`
        : baseUrl;

    const response = await fetch(`${origin}${path}`, {
        method: 'GET',
        cache: 'no-store',
        headers: cookie ? { cookie } : {},
    });

    if (!response.ok) {
        return null;
    }

    try {
        return await response.json();
    } catch {
        return null;
    }
}
