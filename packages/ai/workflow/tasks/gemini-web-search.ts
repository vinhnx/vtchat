import { createTask } from "@repo/orchestrator";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import { getModelFromChatMode, ModelEnum } from "../../models";
import type { WorkflowContextSchema, WorkflowEventSchema } from "../flow";
import { generateTextWithGeminiSearch, getHumanizedDate, handleError, sendEvents } from "../utils";

export const geminiWebSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: "gemini-web-search",
    execute: async ({ data, events, context, signal }) => {
        const question = context?.get("question") || "";
        const stepId = data?.stepId;
        const gl = context?.get("gl");
        const { updateStep } = sendEvents(events);

        const prompt = `Please search for and provide comprehensive information to answer this question: "${question}"

The current date is: ${getHumanizedDate()}
${gl?.country ? `Location: ${gl?.country}` : ""}

Please include:
- Current and relevant information
- Specific facts and recent developments
- Source citations when available
- A comprehensive answer that directly addresses the question`;

        try {
            // Use the user's selected model
            const mode = context?.get("mode") || "";
            const userTier = context?.get("userTier") || UserTier.FREE;
            const userApiKeys = context?.get("apiKeys") || {};
            const isVtPlusUser = userTier === UserTier.PLUS;

            log.info("=== gemini-web-search EXECUTE START ===");
            log.info("Chat mode:", { data: mode });
            log.info("User tier:", { userTier, isVtPlusUser });
            log.info("Context data:", {
                hasQuestion: !!question,
                questionLength: question?.length,
                hasStepId: stepId !== undefined,
                hasGl: !!gl,
                hasApiKeys: !!userApiKeys,
                apiKeysKeys: userApiKeys ? Object.keys(userApiKeys) : undefined,
                isVtPlusUser,
            });

            const model = getModelFromChatMode(mode);
            log.info("Selected model result:", {
                model,
                modelType: typeof model,
            });

            if (!model) {
                log.error("No model found for mode:", { data: mode });
                throw new Error(`Invalid model for mode: ${mode}`);
            }

            log.info("Calling generateTextWithGeminiSearch with:", {
                model,
                promptLength: prompt.length,
                hasByokKeys: !!userApiKeys,
                hasSignal: !!signal,
                isVtPlusUser,
                hasUserApiKey: !!userApiKeys.GEMINI_API_KEY,
            });

            const result = await generateTextWithGeminiSearch({
                model,
                prompt,
                byokKeys: userApiKeys,
                signal,
                thinkingMode: context?.get("thinkingMode"),
                userTier,
                userId: context?.get("userId"),
            });

            log.info("generateTextWithGeminiSearch result:", {
                hasResult: !!result,
                hasText: !!result?.text,
                textLength: result?.text?.length,
                hasSources: !!result?.sources,
                sourcesLength: result?.sources?.length,
                hasGroundingMetadata: !!result?.groundingMetadata,
            });

            // Wrap all result processing in try-catch to isolate the error
            try {
                log.info("Starting result processing...");

                // Update sources if available
                if (result.sources && result.sources.length > 0) {
                    log.info("Processing sources...");
                    context?.update("sources", (current) => {
                        const existingSources = current ?? [];
                        const newSources =
                            result.sources
                                ?.filter(
                                    (source: any) =>
                                        source?.url &&
                                        typeof source.url === "string" &&
                                        source.url.trim() !== "" &&
                                        !existingSources.some(
                                            (existing) => existing.link === source.url,
                                        ),
                                )
                                .map((source: any, index: number) => ({
                                    title: source.title || "Web Search Result",
                                    link: source.url,
                                    snippet: source.description || "",
                                    index: index + (existingSources?.length || 1),
                                })) || [];
                        return [...existingSources, ...newSources];
                    });
                }

                log.info("Processing summaries...");
                context?.update("summaries", (current) => [...(current ?? []), result.text]);

                log.info("Updating step status...");
                // Mark step as completed
                if (stepId !== undefined) {
                    updateStep({
                        stepId,
                        stepStatus: "COMPLETED",
                        text: "Web search completed successfully",
                        subSteps: {},
                    });
                }

                log.info("Result processing completed successfully");

                log.info("=== gemini-web-search EXECUTE END ===");

                // Wrap return in try-catch to isolate return value issues
                try {
                    const returnValue = {
                        stepId,
                        summary: result.text,
                        sources: result.sources,
                        groundingMetadata: result.groundingMetadata,
                    };
                    log.info("Return value prepared successfully:", {
                        hasStepId: !!returnValue.stepId,
                        hasSummary: !!returnValue.summary,
                        summaryLength: returnValue.summary?.length,
                        hasSources: !!returnValue.sources,
                        sourcesLength: returnValue.sources?.length,
                        hasGroundingMetadata: !!returnValue.groundingMetadata,
                    });
                    return returnValue;
                } catch (returnError: unknown) {
                    log.error("Error preparing return value:", {
                        message:
                            returnError instanceof Error
                                ? returnError.message
                                : String(returnError),
                        stack: returnError instanceof Error ? returnError.stack : undefined,
                        resultStructure: {
                            hasResult: !!result,
                            hasText: !!result?.text,
                            hasSources: !!result?.sources,
                            hasGroundingMetadata: !!result?.groundingMetadata,
                        },
                    });
                    throw returnError;
                }
            } catch (processingError: unknown) {
                log.error("Error during result processing:", {
                    message:
                        processingError instanceof Error
                            ? processingError.message
                            : String(processingError),
                    stack: processingError instanceof Error ? processingError.stack : undefined,
                    processingStep: "result processing",
                });
                throw processingError;
            }
        } catch (error: unknown) {
            log.error("=== gemini-web-search ERROR ===");
            log.error("Error details:", {
                message: error instanceof Error ? error.message : "No error message",
                name: error instanceof Error ? error.name : "No error name",
                stack: error instanceof Error ? error.stack : "No stack trace",
                errorType: typeof error,
                fullError: error,
                errorString: String(error),
            });

            // Mark step as failed if there's an error
            if (stepId !== undefined) {
                updateStep({
                    stepId,
                    stepStatus: "COMPLETED",
                    text: `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                    subSteps: {},
                });
            }

            // Get the scoped variables for error handling
            const mode = context?.get("mode") || "";
            const userTier = context?.get("userTier") || UserTier.FREE;
            const userApiKeys = context?.get("apiKeys") || {};
            const model = getModelFromChatMode(mode);

            // Provide more user-friendly error messages based on model and API key status
            const isFreeModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
            const hasUserApiKey = userApiKeys?.GEMINI_API_KEY;
            const hasSystemApiKey = !!process.env.GEMINI_API_KEY;
            const isVtPlusUser = userTier === UserTier.PLUS;

            // Handle AI SDK v5 model version compatibility error
            const errorMessage = error instanceof Error ? error.message : "";
            if (
                errorMessage?.includes("AI_UnsupportedModelVersionError") ||
                errorMessage?.includes("Unsupported model version") ||
                errorMessage?.includes(
                    "AI SDK 4 only supports models that implement specification version 'v1'",
                )
            ) {
                throw new Error(
                    "This model requires a newer version of our AI system. Please try using Gemini 2.5 Flash Lite instead, which is compatible with the current system.",
                );
            }

            if (errorMessage?.includes("Free Gemini model requires system configuration")) {
                // System configuration issue for free model
                throw new Error(
                    "Web search is temporarily unavailable for the free Gemini model. Please try again later or upgrade to use your own API key for unlimited access.",
                );
            }
            if (errorMessage?.includes("API key")) {
                if (isVtPlusUser && !hasUserApiKey && !hasSystemApiKey) {
                    throw new Error(
                        "Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.",
                    );
                }
                if (isFreeModel && !hasUserApiKey) {
                    throw new Error(
                        "Web search requires an API key. You can either:\n1. Add your own Gemini API key in settings for unlimited usage\n2. Try again later if you've reached the daily limit for free usage",
                    );
                }
                throw new Error(
                    "Gemini API key is required for web search. Please configure your API key in settings.",
                );
            }
            if (errorMessage?.includes("unauthorized") || errorMessage?.includes("401")) {
                if (isVtPlusUser && !hasUserApiKey) {
                    throw new Error(
                        "Web search service encountered an authentication issue. Please add your own Gemini API key in settings for unlimited usage.",
                    );
                }
                if (isFreeModel && !hasUserApiKey) {
                    throw new Error(
                        "Free web search limit reached. Add your own Gemini API key in settings for unlimited usage.",
                    );
                }
                throw new Error("Invalid Gemini API key. Please check your API key in settings.");
            }
            if (errorMessage?.includes("forbidden") || errorMessage?.includes("403")) {
                throw new Error("Gemini API access denied. Please check your API key permissions.");
            }
            if (errorMessage?.includes("rate limit") || errorMessage?.includes("429")) {
                if (isVtPlusUser && !hasUserApiKey) {
                    throw new Error(
                        "Web search rate limit reached. Add your own Gemini API key in settings for unlimited usage.",
                    );
                }
                if (isFreeModel && !hasUserApiKey) {
                    throw new Error(
                        "Daily free web search limit reached. Add your own Gemini API key in settings for unlimited usage.",
                    );
                }
                throw new Error(
                    "Gemini API rate limit exceeded. Please try again in a few moments.",
                );
            }
            if (errorMessage?.includes("undefined to object")) {
                throw new Error(
                    "Web search configuration error. Please try using a different model or check your settings.",
                );
            }

            throw new Error(
                `Web search failed: ${errorMessage || "Please try again or use a different model."}`,
            );
        }
    },
    onError: handleError,
    route: () => "analysis",
});
