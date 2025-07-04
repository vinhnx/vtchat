import Image from 'next/image';

const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

const getHost = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch (error) {
        return null;
    }
};

const getFavIcon = (host?: string) => {
    if (!host) {
        return null;
    }
    // Skip favicon for grounding API redirects
    if (
        host.includes('vertexaisearch.cloud.google.com') ||
        host.includes('grounding-api-redirect')
    ) {
        return null;
    }
    try {
        return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch (error) {
        return null;
    }
};

export const SourcesStack = ({ urls }: { urls: string[] }) => {
    if (urls.length === 0) {
        return null;
    }
    return (
        <div className="bg-secondary flex flex-row items-center gap-2 rounded-full border p-1 text-xs">
            <div className="-gap-2 flex flex-row">
                {urls.slice(0, 3).map((url, index) => {
                    const host = getHost(url);
                    const favIcon = getFavIcon(host ?? '');
                    if (isValidUrl(url) && favIcon) {
                        return (
                            <div
                                className="border-border bg-background relative -mr-2 h-6 w-6 overflow-hidden rounded-full border"
                                key={index}
                            >
                                <Image
                                    alt={host ?? ''}
                                    className="not-prose absolute inset-0 h-full w-full object-cover"
                                    fill
                                    src={favIcon}
                                />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>{' '}
            <div className="text-brand px-1 text-xs">{urls.length} sources</div>
        </div>
    );
};
