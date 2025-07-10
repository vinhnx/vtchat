export const getHostname = (url: string) => {
    try {
        const hostname = new URL(url).hostname.split('.')[0];
        if (hostname === 'www') {
            return new URL(url).hostname.split('.')[1];
        }
        return hostname;
    } catch (_error) {
        return url;
    }
};

export const getHost = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch (_error) {
        return;
    }
};
