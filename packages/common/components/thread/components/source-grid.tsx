import { SourceList } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import type { Source } from '@repo/shared/types';
import { getHost } from '@repo/shared/utils';
import { LinkFavicon } from '@repo/ui';

type SourceGridProps = {
    sources: Source[];
};

export const SourceGrid = ({ sources }: SourceGridProps) => {
    const openSideDrawer = useAppStore((state) => state.openSideDrawer);
    if (!(sources && Array.isArray(sources)) || sources?.length === 0) {
        return null;
    }

    // Filter out invalid sources and ensure they have required properties
    const validSources = sources.filter(
        (source) =>
            source &&
            typeof source.title === 'string' &&
            typeof source.link === 'string' &&
            source.link.trim() !== '' &&
            typeof source.index === 'number'
    );

    if (validSources.length === 0) {
        return null;
    }

    const sortedSources = [...validSources].sort((a, b) => a?.index - b?.index);

    return (
        <div className="grid grid-cols-4 gap-2 pb-8 pt-2">
            {sortedSources.slice(0, 3).map((source, index) => (
                <div
                    className="bg-quaternary/60 hover:bg-quaternary flex cursor-pointer flex-col justify-between rounded-md p-2"
                    key={index}
                    onClick={() => {
                        window?.open(source?.link, '_blank');
                    }}
                >
                    {source?.link && (
                        <div className="flex flex-row items-center gap-1 pb-1">
                            <LinkFavicon link={source?.link} size="sm" />
                            <p className="text-muted-foreground line-clamp-1 text-xs">
                                {getHost(source?.link)}
                            </p>
                        </div>
                    )}
                    <p className="line-clamp-2 text-xs font-medium">{source?.title}</p>
                </div>
            ))}
            {sortedSources.length > 3 && (
                <div
                    className="bg-quaternary/60 hover:bg-quaternary flex cursor-pointer flex-col items-start gap-1 rounded-md p-2"
                    key={4}
                    onClick={() => {
                        openSideDrawer({
                            title: 'Sources',
                            badge: sortedSources.length,
                            renderContent: () => <SourceList sources={sortedSources} />,
                        });
                    }}
                >
                    <div className="flex flex-row gap-1">
                        {sortedSources
                            .slice(3)
                            .slice(0, 5)
                            .map((source, index) => (
                                <div className="flex flex-row items-center gap-1" key={index}>
                                    <LinkFavicon link={source?.link} size="sm" />
                                </div>
                            ))}
                    </div>
                    <div className="flex-1" />
                    <p className="text-muted-foreground flex flex-row items-center gap-1 text-xs">
                        +{sortedSources.length - 3} Sources
                    </p>
                </div>
            )}
        </div>
    );
};
