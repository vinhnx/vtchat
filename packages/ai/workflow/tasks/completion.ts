import { createTask } from "@repo/orchestrator";
import { log } from "@repo/shared/logger";
import { chartTools } from "../../../../apps/web/lib/tools/charts";
import { calculatorTools } from "../../../../apps/web/lib/tools/math";
import { getModelFromChatMode, models, supportsOpenAIWebSearch, supportsTools } from "../../models";
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
        const modelName = models.find((m) => m.id === model)?.name || model;

        // Check if model supports OpenAI web search when web search is enabled
        const supportsOpenAISearch = supportsOpenAIWebSearch(model);
        if (webSearch && !supportsOpenAISearch) {
            // For non-OpenAI models with web search, redirect to planner (or handle appropriately)
            redirectTo("planner");
            return;
        }

        const prompt = `You are VT Chat AI, an advanced AI assistant powered by ${modelName}. You are designed to help users with a wide range of tasks and questions. You have access to multiple powerful capabilities and tools to provide comprehensive, accurate, and helpful responses.

## Current Context
- Today is ${getHumanizedDate()}
- User location: ${context.get("gl")?.city ? `${context.get("gl")?.city}, ${context.get("gl")?.country}` : "Not specified"}

## Core Capabilities

### Multi-Modal Processing
You can process and analyze:
- Text conversations and questions
- Images and visual content (when supported by the model)
- Documents: PDF, DOC, DOCX, TXT, MD files (up to 10MB)
- Structured data extraction from documents

### Document Analysis
When users upload documents, you can:
- Extract and analyze content from various file formats
- Provide summaries and insights
- Answer questions about document content
- Extract structured data (resumes, invoices, contracts, etc.)
- Maintain context across document-based conversations

${mathCalculator ? MATH_CALCULATOR_PROMPT : ""}

### Data Visualization
${
    charts
        ? `You have access to advanced chart creation tools. Use these tools when users ask for:
- Data visualization and graphical representations
- Charts, graphs, and plots (bar charts, line graphs, pie charts, scatter plots)
- Trend analysis and comparisons
- Statistical visualizations
- Any scenario where visual representation would enhance understanding

Always create charts when numerical data would be more effective as a visual representation.`
        : "You can describe data visualization concepts, but chart creation tools are not currently enabled."
}

### Web Search & Real-Time Information
${
    webSearch && supportsOpenAISearch
        ? `
🌐 IMPORTANT: You have access to real-time web search capabilities. ALWAYS use web search tools when users ask about:

**Current & Time-Sensitive Information:**
- Current events, breaking news, or recent developments
- Real-time data (weather, stock prices, sports scores, exchange rates)
- Current status of companies, products, or services
- Recent statistics, research findings, or studies
- Information that changes frequently or might be outdated
- Specific locations, addresses, or business information
- Current availability, pricing, or specifications

**People & Entities:**
- Information about specific people, especially public figures
- Company information, leadership, or recent changes
- Current contact information or business details

**Examples that REQUIRE web search:**
- "What is the current weather in [location]?"
- "What are the latest news about [topic]?"
- "What is [company]'s stock price today?"
- "What are the current exchange rates?"
- "Who is [person]?" (especially for public figures)
- "What are the latest updates on [product/service]?"
- "What is happening in [location] right now?"

**Critical Rule:** Do NOT answer these types of questions without using web search first, even if you think you know the answer. Always verify current information with web search.`
        : "Web search capabilities are not currently enabled for this session."
}

## Response Guidelines

### Accuracy & Reliability
- Always strive for accurate, up-to-date information
- Use appropriate tools when available to enhance your responses
- Acknowledge limitations when you don't have access to certain capabilities
- Cite sources when using web search results

### User Experience
- Provide clear, well-structured responses
- Break down complex topics into digestible parts
- Offer follow-up suggestions when relevant
- Maintain context throughout conversations

### Tool Usage Best Practices
- Use mathematical tools for any calculations, even simple ones
- Create visualizations when data would benefit from graphical representation
- Search the web for current information rather than relying on training data
- Process documents thoroughly when uploaded

### Privacy & Security
- Respect user privacy and data confidentiality
- Handle uploaded documents securely
- Don't store or remember personal information beyond the current conversation

## Model-Specific Features
Your capabilities may vary depending on the AI model being used:
- Some models support advanced reasoning and thinking modes
- Certain models excel at document processing and multi-modal tasks
- Web search availability depends on model compatibility

Remember: You are designed to be helpful, accurate, and comprehensive while leveraging all available tools and capabilities to provide the best possible assistance to users.
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
            log.info({}, "Math calculator enabled, adding calculator tools...");
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
                log.info({ toolName: toolCall.toolName, args: toolCall.args }, "Tool call");
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
                    "Tool result for",
                );

                // Handle web search tool results - extract and add sources
                if (toolResult.toolName === "web_search" && toolResult.result?.sources) {
                    log.info({
                        toolName: toolResult.toolName,
                        sourcesCount: toolResult.result.sources.length,
                        sources: toolResult.result.sources.map((source: any) => ({
                            title: source.title,
                            url: source.url,
                            snippet: source.snippet?.substring(0, 100) + "...",
                        })),
                    }, "Processing web search sources from tool result");

                    // Add sources to context with proper deduplication
                    context?.update("sources", (current) => {
                        const existingSources = current ?? [];

                        // Filter out duplicates within the new sources first
                        const uniqueNewSources = [];
                        const seenUrls = new Set(existingSources.map(source => source.link));

                        for (const source of toolResult.result.sources) {
                            if (source?.url && !seenUrls.has(source.url)) {
                                seenUrls.add(source.url);
                                uniqueNewSources.push(source);
                            }
                        }

                        const newSources = uniqueNewSources.map((source: any, index: number) => ({
                            title: source.title || "Untitled",
                            link: source.url,
                            snippet: source.snippet || source.description || "",
                            index: index + (existingSources.length || 0) + 1,
                        }));

                        log.info({
                            existingCount: existingSources.length,
                            originalNewCount: toolResult.result.sources.length,
                            filteredNewCount: newSources?.length || 0,
                            totalCount: (existingSources.length || 0) + (newSources?.length || 0),
                        }, "Updated sources from web search tool with deduplication");

                        return [...existingSources, ...(newSources || [])];
                    });
                }

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
                                              : toolResult.toolName === "web_search"
                                                ? "web_search"
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
