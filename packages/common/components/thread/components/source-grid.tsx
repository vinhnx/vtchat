import { LinkPreview, SourceList } from "@repo/common/components";
import { useAppStore } from "@repo/common/store";
import type { Source } from "@repo/shared/types";
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
                    <div
                        key={`${source.link}-${source.index}`}
                        className="bg-quaternary/60 hover:bg-quaternary flex min-w-[300px] max-w-[350px] cursor-pointer flex-col rounded-md border border-border/10 hover:border-border/30 hover:shadow-sm transition-all duration-200"
                        onClick={() => {
                            window?.open(source?.link, "_blank");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                window?.open(source?.link, "_blank");
                            }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open source: ${source.title}`}
                    >
                        <LinkPreview source={source} />
                    </div>
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
