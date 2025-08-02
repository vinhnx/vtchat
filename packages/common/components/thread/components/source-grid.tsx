import { LinkPreview, SourceList } from "@repo/common/components";
import { useAppStore } from "@repo/common/store";
import type { Source } from "@repo/shared/types";
import { LinkFavicon } from "@repo/ui";
import { useMemo } from "react";

type SourceGridProps = {
    sources: Source[];
};

export const SourceGrid = ({ sources }: SourceGridProps) => {
    const openSideDrawer = useAppStore((state) => state.openSideDrawer);

    const validSources = useMemo(() => {
        console.log("SourceGrid received sources:", sources);

        if (!(sources && Array.isArray(sources)) || sources?.length === 0) {
            return [];
        }

        // Filter out invalid sources and ensure they have required properties
        const filtered = sources.filter(
            (source) =>
                source &&
                typeof source.title === "string" &&
                typeof source.link === "string" &&
                source.link.trim() !== "" &&
                typeof source.index === "number",
        );

        const sorted = filtered.sort((a, b) => a?.index - b?.index);

        return sorted;
    }, [sources]);

    if (validSources.length === 0) {
        return null;
    }

    return (
        <div className="pb-8 pt-2">
            {/* Waterfall Layout with Horizontal Scroll */}
            <div className="relative">
                <div
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30 hover:scrollbar-thumb-border/60"
                    style={{
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {validSources.map((source) => (
                        <div
                            key={`${source.link}-${source.index}`}
                            className="group relative flex-shrink-0 w-[200px] sm:w-[240px]"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <button
                                type="button"
                                className="bg-card/80 hover:bg-card backdrop-blur-sm cursor-pointer rounded-xl border border-border/20 hover:border-border/40 shadow-sm hover:shadow-md transition-all duration-300 ease-out overflow-hidden group-hover:scale-[1.02] h-full w-full text-left"
                                onClick={() => {
                                    window?.open(source?.link, "_blank");
                                }}
                                aria-label={`Open source: ${source.title}`}
                            >
                                <LinkPreview source={source} />

                                {/* Source Index Badge */}
                                <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium backdrop-blur-sm">
                                    {source.index}
                                </div>
                            </button>
                        </div>
                    ))}

                    {/* View All Button */}
                    {validSources.length > 6 && (
                        <div
                            className="flex-shrink-0 w-[200px]"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <button
                                type="button"
                                className="bg-card/60 hover:bg-card backdrop-blur-sm border border-border/20 hover:border-border/40 w-full h-full min-h-[200px] rounded-xl p-6 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all duration-300 ease-out hover:shadow-md hover:scale-[1.02] group"
                                onClick={() => {
                                    openSideDrawer({
                                        title: "Sources",
                                        badge: validSources.length,
                                        renderContent: () => <SourceList sources={validSources} />,
                                        open: true,
                                    });
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        openSideDrawer({
                                            title: "Sources",
                                            badge: validSources.length,
                                            renderContent: () => (
                                                <SourceList sources={validSources} />
                                            ),
                                            open: true,
                                        });
                                    }
                                }}
                                aria-label={`View all ${validSources.length} sources`}
                            >
                                {/* Preview Icons */}
                                <div className="flex flex-wrap gap-2 justify-center max-w-[120px]">
                                    {validSources.slice(6, 15).map((source) => (
                                        <div
                                            className="ring-1 ring-border/20 rounded-full p-1 bg-background/60"
                                            key={`preview-${source.link}`}
                                        >
                                            <LinkFavicon link={source?.link} size="sm" />
                                        </div>
                                    ))}
                                </div>

                                {/* Text */}
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground mb-1">
                                        View All Sources
                                    </p>
                                    <p className="text-muted-foreground text-xs">
                                        +{validSources.length - 6} more sources
                                    </p>
                                </div>
                            </button>
                        </div>
                    )}
                </div>

                {/* Gradient Fade for Scroll Indicator */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
            </div>
        </div>
    );
};
