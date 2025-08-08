export const WWW_PREFIX = "www.";

export const getHostname = (url: string): string => {
    try {
        const { hostname } = new URL(url);
        return hostname.startsWith(WWW_PREFIX) ? hostname.slice(WWW_PREFIX.length) : hostname;
    } catch {
        return url;
    }
};

export const getHost = (url: string): string | undefined => {
    try {
        return new URL(url).hostname;
    } catch {
        return undefined;
    }
};
