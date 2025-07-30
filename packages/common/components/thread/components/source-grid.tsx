import { SourceList } from "@repo/common/components";
import { useAppStore } from "@repo/common/store";
import type { Source } from "@repo/shared/types";
import { getHost } from "@repo/shared/utils";
import { LinkFavicon } from "@repo/ui";

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
            typeof source.title === "string" &&
            typeof source.link === "string" &&
            source.link.trim() !== "" &&
            typeof source.index === "number",
    );

    if (validSources.length === 0) {
        return null;
    }

    const sortedSources = [...validSources].sort((a, b) => a?.index - b?.index);

    return (
        <div className="pb-8 pt-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {sortedSources.map((source) => (
                    <button
                        type="button"
                        className="bg-quaternary/60 hover:bg-quaternary flex min-w-[200px] max-w-[250px] cursor-pointer flex-col justify-between rounded-md p-3 text-left transition-all duration-200 border border-border/10 hover:border-border/30 hover:shadow-sm"
                        key={`${source.link}-${source.index}`}
                        onClick={() => {
                            window?.open(source?.link, "_blank");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                window?.open(source?.link, "_blank");
                            }
                        }}
                        aria-label={`Open source: ${source.title}`}
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
                    </button>
                ))}
                {sortedSources.length > 6 && (
                    <button
                        type="button"
                        className="bg-quaternary/60 hover:bg-quaternary flex min-w-[120px] cursor-pointer flex-col items-center justify-center gap-1 rounded-md p-3 transition-all duration-200 border border-border/10 hover:border-border/30 hover:shadow-sm"
                        key="view-all"
                        onClick={() => {
                            openSideDrawer({
                                title: "Sources",
                                badge: sortedSources.length,
                                renderContent: () => <SourceList sources={sortedSources} />,
                            });
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                openSideDrawer({
                                    title: "Sources",
                                    badge: sortedSources.length,
                                    renderContent: () => <SourceList sources={sortedSources} />,
                                });
                            }
                        }}
                        aria-label={`View all ${sortedSources.length} sources`}
                    >
                        <div className="flex flex-row gap-1">
                            {sortedSources
                                .slice(6)
                                .slice(0, 3)
                                .map((source) => (
                                    <div
                                        className="flex flex-row items-center gap-1"
                                        key={`preview-${source.link}`}
                                    >
                                        <LinkFavicon link={source?.link} size="sm" />
                                    </div>
                                ))}
                        </div>
                        <p className="text-muted-foreground text-center text-xs">
                            +{sortedSources.length - 6} more
                        </p>
                    </button>
                )}
            </div>
        </div>
    );
};
