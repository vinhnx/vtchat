import { cookies, headers } from 'next/headers';

const isLocalhostUrl = (url?: string) => {
    return Boolean(url?.includes('localhost') || url?.includes('127.0.0.1'));
};

const resolveBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_BASE_URL
        || process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

    if (envUrl && !(process.env.NODE_ENV === 'production' && isLocalhostUrl(envUrl))) {
        return envUrl;
    }

    return process.env.NODE_ENV === 'production'
        ? 'https://vtchat.io.vn'
        : 'http://localhost:3000';
};

const baseUrl = resolveBaseUrl();

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
