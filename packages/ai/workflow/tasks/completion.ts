import { createTask } from "@repo/orchestrator";
import { log } from "@repo/shared/logger";
import { chartTools } from "../../../../apps/web/lib/tools/charts";
import { calculatorTools } from "../../../../apps/web/lib/tools/math";
import { getModelFromChatMode, supportsOpenAIWebSearch, supportsTools } from "../../models";
import { MATH_CALCULATOR_PROMPT } from "../../prompts/math-calculator";
import { getWebSearchTool } from "../../tools";
import type { WorkflowContextSchema, WorkflowEventSchema } from "../flow";
import { ChunkBuffer, generateText, getHumanizedDate, handleError } from "../utils";

const MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH = 6000;

export const completionTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: "completion",
    execute: async ({ events, context, signal, redirectTo }) => {
        if (!context) {
            throw new Error("Context is required but was not provided");
        }

        const customInstructions = context?.get("customInstructions");
        const mode = context.get("mode");
        const webSearch = context.get("webSearch");
        const mathCalculator = context.get("mathCalculator");
        const charts = context.get("charts");

        let messages =
            context
                .get("messages")
                ?.filter(
                    (message) =>
                        (message.role === "user" || message.role === "assistant") &&
                        !!message.content,
                ) || [];

        if (
            customInstructions &&
            customInstructions?.length < MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH
        ) {
            messages = [
                {
                    role: "system",
                    content: `Today is ${getHumanizedDate()}. and current location is ${context.get("gl")?.city}, ${context.get("gl")?.country}. \n\n ${customInstructions}`,
                },
                ...messages,
            ];
        }

        const model = getModelFromChatMode(mode);

        // Check if model supports OpenAI web search when web search is enabled
        const supportsOpenAISearch = supportsOpenAIWebSearch(model);
        if (webSearch && !supportsOpenAISearch) {
            // For non-OpenAI models with web search, redirect to planner (or handle appropriately)
            redirectTo("planner");
            return;
        }

        const prompt = `You are a helpful assistant that can answer questions and help with tasks.
        Today is ${getHumanizedDate()}.
        ${mathCalculator ? MATH_CALCULATOR_PROMPT : ""}
        ${charts ? "You can create charts and graphs to visualize data. Use chart tools when users ask for data visualization, trends, comparisons, or when displaying numerical data would be more effective as a visual chart." : ""}
        ${
            webSearch && supportsOpenAISearch
                ? `
        IMPORTANT: You have access to web search tools. ALWAYS use web search tools when users ask about:
        - Current events, news, or recent developments
        - Real-time information (weather, stock prices, sports scores, etc.)
        - Current status of companies, products, or services
        - Recent statistics, data, or research
        - Information that might have changed recently
        - Specific locations, addresses, or business information
        - Any question that requires up-to-date information

        Examples of queries that MUST use web search:
        - "What is the current weather in [location]?"
        - "What are the latest news about [topic]?"
        - "What is the stock price of [company]?"
        - "What are the current exchange rates?"
        - "What are the latest updates on [product/service]?"
        - "What is happening in [location] right now?"
        - "Who is [person]?"

        Do NOT answer these types of questions without using web search first, even if you think you know the answer.
        `
                : ""
        }
        `;

        const reasoningBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ["\n\n"],
            onFlush: (_chunk: string, fullText: string) => {
                events?.update("steps", (prev) => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: "COMPLETED",
                        steps: {
                            ...prev?.[0]?.steps,
                            reasoning: {
                                data: fullText,
                                status: "COMPLETED",
                            },
                        },
                    },
                }));
            },
        });

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ["\n"],
            onFlush: (text: string) => {
                events?.update("answer", (current) => ({
                    ...current,
                    text,
                    status: "PENDING" as const,
                }));
            },
        });

        // Combine tools based on enabled features
        let tools: any = {};

        if (mathCalculator) {
            log.info({}, "🧮 Math calculator enabled, adding calculator tools...");
            const mathToolsObj = calculatorTools();
            log.info({ data: Object.keys(mathToolsObj) }, "🔢 Available math tools");
            tools = { ...tools, ...mathToolsObj };
        }

        if (charts) {
            log.info({ model }, "🎨 Charts enabled for model, adding chart tools...");
            const chartToolsObj = chartTools();
            log.info(
                {
                    chartTools: Object.keys(chartToolsObj),
                    model,
                    supportsTools: supportsTools ? supportsTools(model) : "unknown",
                },
                "📊 Available chart tools for model",
            );
            tools = { ...tools, ...chartToolsObj };
        }

        if (webSearch && supportsOpenAISearch) {
            const webSearchTools = getWebSearchTool(model);
            if (webSearchTools) {
                tools = { ...tools, ...webSearchTools };
            }
        }

        // Convert to undefined if no tools are enabled
        const finalTools = Object.keys(tools).length > 0 ? tools : undefined;
        log.info({ data: finalTools ? Object.keys(finalTools) : "none" }, "🔧 Final tools for AI");

        const response = await generateText({
            model,
            messages,
            prompt,
            signal,
            toolChoice: "auto",
            maxSteps: 2,
            tools: finalTools,
            byokKeys: context?.get("apiKeys"),
            thinkingMode: context?.get("thinkingMode"),
            userTier: context?.get("userTier"),
            userId: context?.get("userId"),
            mode: context?.get("mode"),
            onReasoning: (chunk, _fullText) => {
                reasoningBuffer.add(chunk);
            },
            onReasoningDetails: (details) => {
                events?.update("steps", (prev) => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: "COMPLETED",
                        steps: {
                            ...prev?.[0]?.steps,
                            reasoningDetails: {
                                data: details,
                                status: "COMPLETED",
                            },
                        },
                    },
                }));
            },
            onChunk: (chunk, _fullText) => {
                chunkBuffer.add(chunk);
            },
            onToolCall: (toolCall) => {
                log.info({ toolName: toolCall.toolName, args: toolCall.args }, "🔧 Tool call");
                // Send tool call event to UI
                events?.update("steps", (prev) => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: "COMPLETED",
                        steps: {
                            ...prev?.[0]?.steps,
                            toolCall: {
                                data: {
                                    toolName: toolCall.toolName,
                                    args: toolCall.args,
                                    type:
                                        charts &&
                                        Object.keys(chartTools()).includes(toolCall.toolName)
                                            ? "charts"
                                            : mathCalculator
                                              ? "math_calculator"
                                              : "unknown",
                                },
                                status: "COMPLETED",
                            },
                        },
                    },
                }));

                // Also update toolCalls for threadItem
                events?.update("toolCalls", (prev) => [
                    ...(prev || []),
                    {
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName,
                        args: toolCall.args,
                    },
                ]);
            },
            onToolResult: (toolResult) => {
                log.info(
                    { toolName: toolResult.toolName, result: toolResult.result },
                    "🔧 Tool result for",
                );
                // Send tool result event to UI
                events?.update("steps", (prev) => ({
                    ...prev,
                    0: {
                        ...prev?.[0],
                        id: 0,
                        status: "COMPLETED",
                        steps: {
                            ...prev?.[0]?.steps,
                            toolResult: {
                                data: {
                                    result: toolResult.result,
                                    type:
                                        charts &&
                                        Object.keys(chartTools()).includes(
                                            toolResult.toolName || "",
                                        )
                                            ? "charts"
                                            : mathCalculator
                                              ? "math_calculator"
                                              : "unknown",
                                },
                                status: "COMPLETED",
                            },
                        },
                    },
                }));

                // Also update toolResults for threadItem
                events?.update("toolResults", (prev) => [
                    ...(prev || []),
                    {
                        toolCallId: toolResult.toolCallId,
                        toolName: toolResult.toolName || "unknown",
                        result: toolResult.result,
                    },
                ]);
            },
        });

        reasoningBuffer.end();
        chunkBuffer.end();

        events?.update("answer", (prev) => ({
            ...prev,
            text: "",
            fullText: response,
            status: "COMPLETED",
        }));

        context.update("answer", (_) => response);

        events?.update("status", (_prev) => "COMPLETED");

        const onFinish = context.get("onFinish");
        if (onFinish) {
            onFinish({
                answer: response,
                threadId: context.get("threadId"),
                threadItemId: context.get("threadItemId"),
            });
        }
        return;
    },
    onError: handleError,
    route: ({ context }) => {
        if (context?.get("showSuggestions") && context.get("answer")) {
            return "suggestions";
        }
        return "end";
    },
});
