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
                    className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border/30 hover:scrollbar-thumb-border/60 flex gap-4 overflow-x-auto pb-4"
                    style={{
                        scrollSnapType: "x mandatory",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    {validSources.map((source) => (
                        <div
                            key={`${source.link}-${source.index}`}
                            className="group relative w-[200px] flex-shrink-0 sm:w-[240px]"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <button
                                type="button"
                                className="bg-card/80 hover:bg-card border-border/20 hover:border-border/40 h-full w-full cursor-pointer overflow-hidden rounded-xl border text-left shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:shadow-md group-hover:scale-[1.02]"
                                onClick={() => {
                                    window?.open(source?.link, "_blank");
                                }}
                                aria-label={`Open source: ${source.title}`}
                            >
                                <LinkPreview source={source} />

                                {/* Source Index Badge */}
                                <div className="bg-primary/90 text-primary-foreground absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium backdrop-blur-sm">
                                    {source.index}
                                </div>
                            </button>
                        </div>
                    ))}

                    {/* View All Button */}
                    {validSources.length > 6 && (
                        <div
                            className="w-[200px] flex-shrink-0"
                            style={{ scrollSnapAlign: "start" }}
                        >
                            <button
                                type="button"
                                className="bg-card/60 hover:bg-card border-border/20 hover:border-border/40 group flex h-full min-h-[200px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border p-6 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-md"
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
                                <div className="flex max-w-[120px] flex-wrap justify-center gap-2">
                                    {validSources.slice(6, 15).map((source) => (
                                        <div
                                            className="ring-border/20 bg-background/60 rounded-full p-1 ring-1"
                                            key={`preview-${source.link}`}
                                        >
                                            <LinkFavicon link={source?.link} size="sm" />
                                        </div>
                                    ))}
                                </div>

                                {/* Text */}
                                <div className="text-center">
                                    <p className="text-foreground mb-1 text-sm font-medium">
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
                <div className="from-background/80 pointer-events-none absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l to-transparent" />
            </div>
        </div>
    );
};
