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

            // Update sources if available
            if (result.sources && result.sources.length > 0) {
                context?.update("sources", (current) => {
                    const existingSources = current ?? [];
                    const newSources = result.sources
                        ?.filter(
                            (source: any) =>
                                source?.url &&
                                typeof source.url === "string" &&
                                source.url.trim() !== "" &&
                                !existingSources.some((existing) => existing.link === source.url),
                        )
                        .map((source: any, index: number) => ({
                            title: source.title || "Web Search Result",
                            link: source.url,
                            snippet: source.description || "",
                            index: index + (existingSources?.length || 1),
                        }));
                    return [...existingSources, ...newSources];
                });
            }

            context?.update("summaries", (current) => [...(current ?? []), result.text]);

            // Mark step as completed
            if (stepId !== undefined) {
                updateStep({
                    stepId,
                    stepStatus: "COMPLETED",
                    text: "Web search completed successfully",
                    subSteps: {},
                });
            }

            log.info("=== gemini-web-search EXECUTE END ===");
            return {
                stepId,
                summary: result.text,
                sources: result.sources,
                groundingMetadata: result.groundingMetadata,
            };
        } catch (error: any) {
            log.error("=== gemini-web-search ERROR ===");
            log.error("Error details:", {
                message: error.message,
                name: error.name,
                stack: error.stack,
                errorType: typeof error,
            });

            // Mark step as failed if there's an error
            if (stepId !== undefined) {
                updateStep({
                    stepId,
                    stepStatus: "COMPLETED",
                    text: `Web search failed: ${error.message || "Unknown error"}`,
                    subSteps: {},
                });
            }

            // Provide more user-friendly error messages based on model and API key status
            const isFreeModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
            const hasUserApiKey = userApiKeys?.GEMINI_API_KEY;
            const hasSystemApiKey = !!process.env.GEMINI_API_KEY;
            const isVtPlusUser = userTier === UserTier.PLUS;

            if (error.message?.includes("Free Gemini model requires system configuration")) {
                // System configuration issue for free model
                throw new Error(
                    "Web search is temporarily unavailable for the free Gemini model. Please try again later or upgrade to use your own API key for unlimited access.",
                );
            }
            if (error.message?.includes("API key")) {
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
            if (error.message?.includes("unauthorized") || error.message?.includes("401")) {
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
            if (error.message?.includes("forbidden") || error.message?.includes("403")) {
                throw new Error("Gemini API access denied. Please check your API key permissions.");
            }
            if (error.message?.includes("rate limit") || error.message?.includes("429")) {
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
            if (error.message?.includes("undefined to object")) {
                throw new Error(
                    "Web search configuration error. Please try using a different model or check your settings.",
                );
            }

            throw new Error(
                `Web search failed: ${error.message || "Please try again or use a different model."}`,
            );
        }
    },
    onError: handleError,
    route: () => "analysis",
});
