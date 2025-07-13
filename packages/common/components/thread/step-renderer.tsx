import { MarkdownContent, SearchResultsList, StepStatus } from "@repo/common/components";
import type { Step } from "@repo/shared/types";
import { Badge, Label } from "@repo/ui";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export type StepRendererType = {
    step: Step;
};

export const StepRenderer = ({ step }: StepRendererType) => {
    const isCompleted = step.status === "COMPLETED";

    const renderTextStep = () => {
        if (step?.text) {
            return (
                <motion.div
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    className="text-muted-foreground text-sm leading-relaxed"
                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.1,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <MarkdownContent
                        content={step.text}
                        isCompleted={isCompleted}
                        isLast={false}
                        shouldAnimate={!isCompleted}
                    />
                </motion.div>
            );
        }
        return null;
    };

    const renderSearchStep = () => {
        if (step?.steps && "search" in step.steps) {
            return (
                <motion.div
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    className="flex flex-col gap-3"
                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.2,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <div className="flex flex-col gap-3">
                        <motion.div
                            className="w-fit"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        >
                            <Label className="text-xs font-medium text-muted-foreground/80">
                                Searching
                            </Label>
                        </motion.div>

                        <motion.div
                            className="flex flex-row flex-wrap gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.3 }}
                        >
                            {Array.isArray(step.steps?.search?.data) &&
                                step.steps?.search?.data?.map((query: string, index: number) => (
                                    <motion.div
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                        }}
                                        initial={{
                                            opacity: 0,
                                            y: 4,
                                            scale: 0.95,
                                        }}
                                        key={index}
                                        transition={{
                                            duration: 0.3,
                                            delay: 0.5 + index * 0.08,
                                            ease: [0.23, 1, 0.32, 1],
                                        }}
                                    >
                                        <Badge className="bg-muted/50 hover:bg-muted/70 border-border/50 transition-colors duration-200">
                                            <Search className="opacity-60 mr-1.5" size={11} />
                                            <span className="text-xs">{query}</span>
                                        </Badge>
                                    </motion.div>
                                ))}
                        </motion.div>
                    </div>
                </motion.div>
            );
        }
    };

    const renderReadStep = () => {
        if (step?.steps && "read" in step.steps) {
            return (
                <motion.div
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    className="flex flex-col gap-3"
                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <motion.div
                        className="w-fit"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.3 }}
                    >
                        <Label className="text-xs font-medium text-muted-foreground/80">
                            Reading
                        </Label>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <SearchResultsList
                            sources={
                                Array.isArray(step.steps?.read?.data) ? step.steps.read.data : []
                            }
                        />
                    </motion.div>
                </motion.div>
            );
        }
        return null;
    };

    const renderReasoningStep = () => {
        if (step?.steps && "reasoning" in step.steps) {
            const reasoningData =
                typeof step.steps?.reasoning?.data === "string" ? step.steps.reasoning.data : "";

            return (
                <motion.div
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    className="flex flex-col gap-3"
                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <motion.div
                        className="w-fit"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                    >
                        <Label className="text-xs font-medium text-muted-foreground/80">
                            Analyzing
                        </Label>
                    </motion.div>
                    <motion.div
                        className="text-muted-foreground text-sm leading-relaxed"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        <MarkdownContent
                            content={reasoningData}
                            isCompleted={isCompleted}
                            isLast={false}
                            shouldAnimate={!isCompleted}
                        />
                    </motion.div>
                </motion.div>
            );
        }
        return null;
    };

    const renderWrapupStep = () => {
        if (step?.steps && "wrapup" in step.steps) {
            return (
                <motion.div
                    animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                    }}
                    className="flex flex-col gap-3"
                    initial={{
                        opacity: 0,
                        y: 8,
                        scale: 0.98,
                    }}
                    transition={{
                        duration: 0.4,
                        delay: 0.5,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <motion.div
                        className="w-fit"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6, duration: 0.3 }}
                    >
                        <Label className="text-xs font-medium text-muted-foreground/80">
                            Wrapping up
                        </Label>
                    </motion.div>
                    <motion.div
                        className="text-muted-foreground text-sm leading-relaxed"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.3 }}
                    >
                        <MarkdownContent
                            content={step.steps?.wrapup?.data || ""}
                            isCompleted={isCompleted}
                            isLast={false}
                            shouldAnimate={!isCompleted}
                        />
                    </motion.div>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <motion.div
            className="flex w-full flex-row items-stretch justify-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
            }}
        >
            {/* Enhanced timeline indicator */}
            <div className="flex min-h-full shrink-0 flex-col items-center justify-start px-2">
                <motion.div
                    className="bg-border/30 h-2 shrink-0"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                />

                <motion.div
                    className="bg-background z-10 p-1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        delay: 0.2,
                        duration: 0.4,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                >
                    <StepStatus status={step.status} />
                </motion.div>

                <motion.div
                    animate={{
                        height: "100%",
                        opacity: isCompleted ? 0.6 : 0.3,
                    }}
                    className="border-border/40 min-h-full w-[1px] flex-1 border-l border-dashed transition-opacity duration-500"
                    initial={{ height: 0, opacity: 0.1 }}
                    transition={{
                        duration: 0.6,
                        delay: 0.3,
                        ease: [0.23, 1, 0.32, 1],
                    }}
                />
            </div>

            {/* Enhanced content area */}
            <motion.div
                animate={{
                    opacity: 1,
                    y: 0,
                    x: 0,
                }}
                className="flex w-full flex-1 flex-col gap-5 overflow-hidden pb-3 pr-2"
                initial={{
                    opacity: 0,
                    y: 10,
                    x: -5,
                }}
                transition={{
                    duration: 0.4,
                    delay: 0.15,
                    ease: [0.23, 1, 0.32, 1],
                }}
            >
                {renderWrapupStep()}
                {renderTextStep()}
                {renderReasoningStep()}
                {renderSearchStep()}
                {renderReadStep()}
            </motion.div>
        </motion.div>
    );
};
