import { ChatMode } from "@repo/shared/config";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import { REASONING_BUDGETS } from "../constants/reasoning";
import { runWorkflow } from "../workflow/flow";

// Create context for the worker
const ctx: Worker = self as any;

// Create a mock process.env object for the worker context
if (typeof process === "undefined") {
    (self as any).process = { env: {} };
}

// Store for API keys and active workflow
let apiKeys: Record<string, string> = {};
let activeWorkflow: ReturnType<typeof runWorkflow> | null = null;

/**
 * Get thinking mode configuration for specific chat modes
 * Automatically enables high-effort reasoning for research modes
 */
function getThinkingModeForChatMode(
    mode: ChatMode,
    userThinkingMode?: {
        enabled: boolean;
        budget: number;
        includeThoughts: boolean;
    },
) {
    // Auto-enable reasoning for research modes with high budgets
    if (mode === ChatMode.Deep) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.DEEP, // 50K tokens - highest effort
            includeThoughts: userThinkingMode?.includeThoughts ?? true,
        };
    }

    if (mode === ChatMode.Pro) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.BALANCED, // 25K tokens - high effort
            includeThoughts: userThinkingMode?.includeThoughts ?? true,
        };
    }

    // For other modes, use user settings or defaults
    return (
        userThinkingMode || {
            enabled: false,
            budget: 0,
            includeThoughts: false,
        }
    );
}

// Handle messages from the main thread
ctx.addEventListener("message", async (event: MessageEvent) => {
    const { type, payload } = event.data;

    try {
        if (type === "START_WORKFLOW") {
            // If there's an active workflow, abort it before starting a new one
            if (activeWorkflow) {
                try {
                    activeWorkflow.abort?.(false);
                    activeWorkflow = null;
                } catch (e) {
                    log.error("[Worker] Error aborting previous workflow:", { data: e });
                }
            }

            const {
                mode,
                question,
                threadId,
                threadItemId,
                parentThreadItemId,
                messages,
                config,
                apiKeys: newApiKeys,
                webSearch,
                mathCalculator,
                charts,
                showSuggestions,
                thinkingMode,
                userTier = UserTier.FREE,
            } = payload;

            // Set API keys if provided
            if (newApiKeys) {
                apiKeys = newApiKeys;

                self.AI_API_KEYS = {
                    openai: apiKeys.OPENAI_API_KEY,
                    anthropic: apiKeys.ANTHROPIC_API_KEY,
                    fireworks: apiKeys.FIREWORKS_API_KEY,
                    google: apiKeys.GEMINI_API_KEY,
                    together: apiKeys.TOGETHER_API_KEY,
                    xai: apiKeys.XAI_API_KEY,
                    openrouter: apiKeys.OPENROUTER_API_KEY,
                };

                self.JINA_API_KEY = apiKeys.JINA_API_KEY;
                self.NEXT_PUBLIC_APP_URL = apiKeys.NEXT_PUBLIC_APP_URL;

                // SECURITY: Log API key setup without exposing any key metadata
                log.info(
                    {
                        mode,
                        apiKeySetupCompleted: true,
                    },
                    "Worker API keys configured",
                );
            }

            // Initialize the workflow
            activeWorkflow = runWorkflow({
                mode,
                question,
                threadId,
                threadItemId,
                messages,
                config,
                apiKeys: newApiKeys,
                webSearch,
                mathCalculator,
                charts,
                showSuggestions,
                thinkingMode: getThinkingModeForChatMode(mode, thinkingMode),
                userTier,
                onFinish: (_data: any) => {},
            });

            // Forward workflow events to the main thread
            activeWorkflow.onAll((event, payload) => {
                ctx.postMessage({
                    event,
                    threadId,
                    threadItemId,
                    parentThreadItemId,
                    mode,
                    query: question,
                    [event]: payload,
                });
            });

            // Start the workflow with the appropriate task
            const startTask = mode === ChatMode.Deep ? "router" : "router";
            const result = await activeWorkflow.start(startTask, {
                question,
            });

            // Send completion message
            ctx.postMessage({
                type: "done",
                status: "complete",
                threadId,
                threadItemId,
                parentThreadItemId,
                result,
            });

            // Clear the active workflow reference
            activeWorkflow = null;
        } else if (type === "ABORT_WORKFLOW") {
            // Abort handling
            if (activeWorkflow) {
                try {
                    activeWorkflow.abort?.(payload.graceful);
                    activeWorkflow = null;
                } catch (e) {
                    log.error("[Worker] Error aborting workflow:", { data: e });
                }
            }

            ctx.postMessage({
                type: "done",
                status: "aborted",
                threadId: payload.threadId,
                threadItemId: payload.threadItemId,
                parentThreadItemId: payload.parentThreadItemId,
            });
        }
    } catch (error) {
        log.error("[Worker] Error in worker:", { data: error });

        ctx.postMessage({
            type: "done",
            status: "error",
            error: error instanceof Error ? error.message : String(error),
            threadId: payload?.threadId,
            threadItemId: payload?.threadItemId,
            parentThreadItemId: payload?.parentThreadItemId,
        });

        // Clear the active workflow reference on error
        activeWorkflow = null;
    }
});
