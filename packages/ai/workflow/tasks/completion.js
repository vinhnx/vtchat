var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { createTask } from "@repo/orchestrator";
import { log } from "@repo/shared/logger";
import { chartTools } from "../../../../apps/web/lib/tools/charts";
import { calculatorTools } from "../../../../apps/web/lib/tools/math";
import { getModelFromChatMode, models, supportsOpenAIWebSearch, supportsTools } from "../../models";
import { MATH_CALCULATOR_PROMPT } from "../../prompts/math-calculator";
import { getWebSearchTool } from "../../tools";
import { openSandbox, startSandbox, stopSandbox } from "../../tools/sandbox";
import { handlePDFProcessingError } from "../../utils/pdf-error-handler";
import { ChunkBuffer, generateText, getHumanizedDate, handleError, selectAvailableModel, } from "../utils";
var MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH = 6000;
export var completionTask = createTask({
    name: "completion",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var customInstructions, mode, webSearch, mathCalculator, charts, codeSandbox, messages, baseModel, model, modelName, supportsOpenAISearch, prompt, reasoningBuffer, chunkBuffer, tools, mathToolsObj, chartToolsObj, webSearchTools, userWantsServerSandbox, userTier, finalTools, lastMathResult, hasPDFAttachment, response, error_1, pdfError_1, errorMessage, modelInfo_1, providerName_1, finalResponse, fallbackPrompt, fallback, fallbackError_1, onFinish;
        var _c, _d, _e, _f, _g, _h, _j;
        var events = _b.events, context = _b.context, signal = _b.signal, redirectTo = _b.redirectTo;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (!context) {
                        throw new Error("Context is required but was not provided");
                    }
                    customInstructions = context === null || context === void 0 ? void 0 : context.get("customInstructions");
                    mode = context.get("mode");
                    webSearch = context.get("webSearch");
                    mathCalculator = context.get("mathCalculator");
                    charts = context.get("charts");
                    codeSandbox = context.get("codeSandbox");
                    messages = ((_c = context
                        .get("messages")) === null || _c === void 0 ? void 0 : _c.filter(function (message) {
                        return (message.role === "user" || message.role === "assistant") &&
                            !!message.content &&
                            (typeof message.content === "string"
                                ? message.content.trim() !== ""
                                : Array.isArray(message.content)
                                    ? message.content.length > 0
                                    : false);
                    })) || [];
                    if (customInstructions &&
                        (customInstructions === null || customInstructions === void 0 ? void 0 : customInstructions.length) < MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH) {
                        messages = __spreadArray([
                            {
                                role: "system",
                                content: "Today is ".concat(getHumanizedDate(), ". and current location is ").concat((_d = context.get("gl")) === null || _d === void 0 ? void 0 : _d.city, ", ").concat((_e = context.get("gl")) === null || _e === void 0 ? void 0 : _e.country, ". \n\n ").concat(customInstructions),
                            }
                        ], messages, true);
                    }
                    baseModel = getModelFromChatMode(mode);
                    model = selectAvailableModel(baseModel, context === null || context === void 0 ? void 0 : context.get("apiKeys"));
                    modelName = ((_f = models.find(function (m) { return m.id === model; })) === null || _f === void 0 ? void 0 : _f.name) || model;
                    // Debug logging for model selection
                    log.info({
                        mode: mode,
                        model: model,
                        modelName: modelName,
                        modelFromFunction: getModelFromChatMode(mode),
                    }, "🔍 Completion task model selection");
                    supportsOpenAISearch = supportsOpenAIWebSearch(model);
                    if (webSearch && !supportsOpenAISearch) {
                        // For non-OpenAI models with web search, redirect to planner (or handle appropriately)
                        redirectTo("planner");
                        return [2 /*return*/];
                    }
                    prompt = "You are VT Chat AI, an advanced AI assistant powered by ".concat(modelName, ". You are designed to help users with a wide range of tasks and questions. You have access to multiple powerful capabilities and tools to provide comprehensive, accurate, and helpful responses.\n\n## Current Context\n- Today is ").concat(getHumanizedDate(), "\n- User location: ").concat(((_g = context.get("gl")) === null || _g === void 0 ? void 0 : _g.city) ? "".concat((_h = context.get("gl")) === null || _h === void 0 ? void 0 : _h.city, ", ").concat((_j = context.get("gl")) === null || _j === void 0 ? void 0 : _j.country) : "Not specified", "\n\n## Core Capabilities\n\n### Multi-Modal Processing\nYou can process and analyze:\n- Text conversations and questions\n- Images and visual content (when supported by the model)\n- Documents: PDF, DOC, DOCX, TXT, MD files (up to 10MB)\n- Structured data extraction from documents\n\n### Document Analysis\nWhen users upload documents, you can:\n- Extract and analyze content from various file formats\n- Provide summaries and insights\n- Answer questions about document content\n- Extract structured data (resumes, invoices, contracts, etc.)\n- Maintain context across document-based conversations\n\n").concat(mathCalculator ? MATH_CALCULATOR_PROMPT : "", "\n\n### Data Visualization\n").concat(charts
                        ? "You have access to advanced chart creation tools. Use these tools when users ask for:\n- Data visualization and graphical representations\n- Charts, graphs, and plots (bar charts, line graphs, pie charts, scatter plots)\n- Trend analysis and comparisons\n- Statistical visualizations\n- Any scenario where visual representation would enhance understanding\n\nAlways create charts when numerical data would be more effective as a visual representation."
                        : "You can describe data visualization concepts, but chart creation tools are not currently enabled.", "\n\n### Web Search & Real-Time Information\n").concat(webSearch && supportsOpenAISearch
                        ? "\n\uD83C\uDF10 IMPORTANT: You have access to real-time web search capabilities. ALWAYS use web search tools when users ask about:\n\n**Current & Time-Sensitive Information:**\n- Current events, breaking news, or recent developments\n- Real-time data (weather, stock prices, sports scores, exchange rates)\n- Current status of companies, products, or services\n- Recent statistics, research findings, or studies\n- Information that changes frequently or might be outdated\n- Specific locations, addresses, or business information\n- Current availability, pricing, or specifications\n\n**People & Entities:**\n- Information about specific people, especially public figures\n- Company information, leadership, or recent changes\n- Current contact information or business details\n\n**Examples that REQUIRE web search:**\n- \"What is the current weather in [location]?\"\n- \"What are the latest news about [topic]?\"\n- \"What is [company]'s stock price today?\"\n- \"What are the current exchange rates?\"\n- \"Who is [person]?\" (especially for public figures)\n- \"What are the latest updates on [product/service]?\"\n- \"What is happening in [location] right now?\"\n\n**Critical Rule:** Do NOT answer these types of questions without using web search first, even if you think you know the answer. Always verify current information with web search."
                        : "Web search capabilities are not currently enabled for this session.", "\n\n## Response Guidelines\n\n### Accuracy & Reliability\n- Always strive for accurate, up-to-date information\n- Use appropriate tools when available to enhance your responses\n- Acknowledge limitations when you don't have access to certain capabilities\n- Cite sources when using web search results\n\n### User Experience\n- Provide clear, well-structured responses\n- Break down complex topics into digestible parts\n- Offer follow-up suggestions when relevant\n- Maintain context throughout conversations\n\n### Tool Usage Best Practices\n- Use mathematical tools for any calculations, even simple ones\n- Create visualizations when data would benefit from graphical representation\n- Search the web for current information rather than relying on training data\n- Process documents thoroughly when uploaded\n\n### Sandbox Guidance\n- When producing runnable code, prefer a lightweight client sandbox via the openSandbox tool with minimal files:\n  - JS/HTML: /index.html, /main.{js,ts}\n  - React: /App.tsx, /index.tsx\n  - Python: /main.py\n- If native packages or long-running processes are needed, use the startSandbox tool with { template, files, cmd, port }.\n- Keep examples small (<300 KB total). Apply edits incrementally to reduce churn.\n\n## E2B Sandbox Tool Usage (Critical)\nWhen the user asks you to create, run, or serve code (e.g., \"Start a server sandbox. Create /main.py that serves 'Hello VT' print it\"), you MUST call the \"startSandbox\" tool with:\n- files: a record mapping file paths to content. Create minimal runnable files (e.g., \"/main.py\").\n- language: primary language (default \"python\").\n- cmd: command to start program (e.g., \"python /main.py\").\n- port: the server port if serving HTTP (commonly 8000). Bind to 0.0.0.0.\n- internetAccess: false by default. Only enable if explicitly needed and user tier allows.\n- timeoutMinutes: keep small (e.g., 10).\nImportant:\n- Ensure server binds to \"0.0.0.0\" so the preview works.\n- Return minimal output text and rely on the tool result to render the sandbox side panel in chat.\n- Do NOT describe running steps if you can execute them via the tool. Prefer executing.\n- If the user says they are VT+ or dev environment is detected, proceed; otherwise inform about VT+ requirement.\nExample (Python simple server):\n- files:/main.py =\n                ```python\n                from http.server import HTTPServer, BaseHTTPRequestHandler\n\n                class H(BaseHTTPRequestHandler):\n                    def do_GET(self):\n                        self.send_response(200)\n                        self.send_header('Content-type','text/plain')\n                        self.end_headers()\n                        self.wfile.write(b\"Hello VT\")\n                        print(\"Hello VT\")\n\n                if __name__ == \"__main__\":\n                    HTTPServer((\"0.0.0.0\", 8000), H).serve_forever()\n                ```\n- language: \"python\"\n- cmd: \"python /main.py\"\n- port: 8000\nAfter the tool call, the UI will show the sandbox preview or files panel automatically.\n\n### Privacy & Security\n- Respect user privacy and data confidentiality\n- Handle uploaded documents securely\n- Don't store or remember personal information beyond the current conversation\n\n## Model-Specific Features\nYour capabilities may vary depending on the AI model being used:\n- Some models support advanced reasoning and thinking modes\n- Certain models excel at document processing and multi-modal tasks\n- Web search availability depends on model compatibility\n\nRemember: You are designed to be helpful, accurate, and comprehensive while leveraging all available tools and capabilities to provide the best possible assistance to users.\n        ");
                    reasoningBuffer = new ChunkBuffer({
                        threshold: 200,
                        breakOn: ["\n\n"],
                        onFlush: function (_chunk, fullText) {
                            events === null || events === void 0 ? void 0 : events.update("steps", function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), { 0: __assign(__assign({}, prev === null || prev === void 0 ? void 0 : prev[0]), { id: 0, status: "COMPLETED", steps: __assign(__assign({}, (_a = prev === null || prev === void 0 ? void 0 : prev[0]) === null || _a === void 0 ? void 0 : _a.steps), { reasoning: {
                                                data: fullText,
                                                status: "COMPLETED",
                                            } }) }) }));
                            });
                        },
                    });
                    chunkBuffer = new ChunkBuffer({
                        threshold: 200,
                        breakOn: ["\n"],
                        onFlush: function (bufferText, fullText) {
                            log.debug("🔄 ChunkBuffer onFlush called", {
                                bufferTextLength: (bufferText === null || bufferText === void 0 ? void 0 : bufferText.length) || 0,
                                fullTextLength: (fullText === null || fullText === void 0 ? void 0 : fullText.length) || 0,
                                bufferPreview: (bufferText === null || bufferText === void 0 ? void 0 : bufferText.substring(0, 50)) + "...",
                                fullTextPreview: (fullText === null || fullText === void 0 ? void 0 : fullText.substring(0, 50)) + "...",
                                threadItemId: context === null || context === void 0 ? void 0 : context.get("threadItemId"),
                            });
                            // Send incremental text updates for streaming display
                            // Use the buffer content for incremental updates
                            events === null || events === void 0 ? void 0 : events.update("answer", function (current) { return (__assign(__assign({}, current), { text: bufferText, status: "PENDING" })); });
                        },
                    });
                    tools = {};
                    if (mathCalculator) {
                        log.info({}, "Math calculator enabled, adding calculator tools...");
                        mathToolsObj = calculatorTools();
                        log.info({ data: Object.keys(mathToolsObj) }, "🔢 Available math tools");
                        tools = __assign(__assign({}, tools), mathToolsObj);
                    }
                    if (charts) {
                        log.info({ model: model }, "🎨 Charts enabled for model, adding chart tools...");
                        chartToolsObj = chartTools();
                        log.info({
                            chartTools: Object.keys(chartToolsObj),
                            model: model,
                            supportsTools: supportsTools ? supportsTools(model) : "unknown",
                        }, "📊 Available chart tools for model");
                        tools = __assign(__assign({}, tools), chartToolsObj);
                    }
                    if (webSearch && supportsOpenAISearch) {
                        webSearchTools = getWebSearchTool(model);
                        if (webSearchTools) {
                            tools = __assign(__assign({}, tools), webSearchTools);
                        }
                    }
                    userWantsServerSandbox = messages.some(function (message) {
                        var text = typeof message.content === "string"
                            ? message.content
                            : Array.isArray(message.content)
                                ? message.content.map(function (p) { return (typeof p.text === "string" ? p.text : ""); }).join("\n")
                                : "";
                        // Common intents and technologies
                        var patterns = [
                            /\b(start|run|launch) (a )?server\b/i,
                            /\bserver sandbox\b/i,
                            /create\s+\/?(main\.py|app\.py|index\.js|server\.js)/i,
                            /\bserve\b/i,
                            /\bstart\s+.*sandbox\b/i,
                            /\b(node|express|flask|fastapi|uvicorn|gunicorn|django|next|vite)\b.*\b(run|dev|serve|start)\b/i,
                            /\b(run|dev|serve|start)\b.*\b(node|express|flask|fastapi|uvicorn|gunicorn|django|next|vite)\b/i,
                            /\bnpm\s+run\s+(dev|start)\b/i,
                            /\byarn\s+(dev|start)\b/i,
                            /\bpnpm\s+(dev|start)\b/i,
                            /\bserve\s+on\s+port\s*\d{2,5}\b/i,
                            /\bport\s*(3000|5173|8000|8080|5000)\b/i,
                            /\b(bind|expose)\s*port\b/i,
                        ];
                        return patterns.some(function (re) { return re.test(text); });
                    });
                    // Sandbox tools: client-only is available to all; server E2B is premium-gated
                    try {
                        tools = __assign(__assign({}, tools), { openSandbox: openSandbox() });
                    }
                    catch (_l) {
                        // No-op if tool factory fails
                    }
                    userTier = context === null || context === void 0 ? void 0 : context.get("userTier");
                    if (userTier === "PLUS" || codeSandbox || userWantsServerSandbox) {
                        try {
                            tools = __assign(__assign({}, tools), { startSandbox: startSandbox(), stopSandbox: stopSandbox() });
                        }
                        catch (_m) {
                            // No-op if tool factory fails
                        }
                    }
                    finalTools = Object.keys(tools).length > 0 ? tools : undefined;
                    log.info({ data: finalTools ? Object.keys(finalTools) : "none" }, "🔧 Final tools for AI");
                    lastMathResult = null;
                    hasPDFAttachment = messages.some(function (message) {
                        return Array.isArray(message.content) &&
                            message.content.some(function (part) { return part.type === "file" && part.mediaType === "application/pdf"; });
                    });
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, generateText({
                            model: model,
                            messages: messages,
                            prompt: prompt,
                            signal: signal,
                            toolChoice: "auto",
                            // Allow enough steps for: tool call(s) + final answer synthesis
                            maxSteps: 4,
                            tools: finalTools,
                            byokKeys: context === null || context === void 0 ? void 0 : context.get("apiKeys"),
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            mode: context === null || context === void 0 ? void 0 : context.get("mode"),
                            onReasoning: function (chunk, _fullText) {
                                reasoningBuffer.add(chunk);
                            },
                            onReasoningDetails: function (details) {
                                events === null || events === void 0 ? void 0 : events.update("steps", function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), { 0: __assign(__assign({}, prev === null || prev === void 0 ? void 0 : prev[0]), { id: 0, status: "COMPLETED", steps: __assign(__assign({}, (_a = prev === null || prev === void 0 ? void 0 : prev[0]) === null || _a === void 0 ? void 0 : _a.steps), { reasoningDetails: {
                                                    data: details,
                                                    status: "COMPLETED",
                                                } }) }) }));
                                });
                            },
                            onChunk: function (chunk, fullText) {
                                log.debug("📝 onChunk called", {
                                    chunkLength: (chunk === null || chunk === void 0 ? void 0 : chunk.length) || 0,
                                    fullTextLength: (fullText === null || fullText === void 0 ? void 0 : fullText.length) || 0,
                                    chunkPreview: (chunk === null || chunk === void 0 ? void 0 : chunk.substring(0, 50)) + "...",
                                    threadItemId: context === null || context === void 0 ? void 0 : context.get("threadItemId"),
                                });
                                chunkBuffer.add(chunk);
                            },
                            onToolCall: function (toolCall) {
                                log.info({ toolName: toolCall.toolName, args: toolCall.args }, "Tool call");
                                // Send tool call event to UI
                                events === null || events === void 0 ? void 0 : events.update("steps", function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), { 0: __assign(__assign({}, prev === null || prev === void 0 ? void 0 : prev[0]), { id: 0, status: "COMPLETED", steps: __assign(__assign({}, (_a = prev === null || prev === void 0 ? void 0 : prev[0]) === null || _a === void 0 ? void 0 : _a.steps), { toolCall: {
                                                    data: {
                                                        toolName: toolCall.toolName,
                                                        args: toolCall.args,
                                                        type: charts &&
                                                            Object.keys(chartTools()).includes(toolCall.toolName)
                                                            ? "charts"
                                                            : mathCalculator
                                                                ? "math_calculator"
                                                                : "unknown",
                                                    },
                                                    status: "COMPLETED",
                                                } }) }) }));
                                });
                                // Also update toolCalls for threadItem
                                events === null || events === void 0 ? void 0 : events.update("toolCalls", function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[toolCall.toolCallId] = {
                                        toolCallId: toolCall.toolCallId,
                                        toolName: toolCall.toolName,
                                        args: toolCall.args,
                                    }, _a)));
                                });
                            },
                            onToolResult: function (toolResult) {
                                var _a;
                                log.info({ toolName: toolResult.toolName, result: toolResult.result }, "Tool result for");
                                // Handle web search tool results - extract and add sources
                                if (toolResult.toolName === "web_search" && ((_a = toolResult.result) === null || _a === void 0 ? void 0 : _a.sources)) {
                                    log.info({
                                        toolName: toolResult.toolName,
                                        sourcesCount: toolResult.result.sources.length,
                                        sources: toolResult.result.sources.map(function (source) {
                                            var _a;
                                            return ({
                                                title: source.title,
                                                url: source.url,
                                                snippet: ((_a = source.snippet) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + "...",
                                            });
                                        }),
                                    }, "Processing web search sources from tool result");
                                    // Add sources to context with proper deduplication
                                    context === null || context === void 0 ? void 0 : context.update("sources", function (current) {
                                        var existingSources = current !== null && current !== void 0 ? current : [];
                                        // Filter out duplicates within the new sources first
                                        var uniqueNewSources = [];
                                        var seenUrls = new Set(existingSources.map(function (source) { return source.link; }));
                                        for (var _i = 0, _a = toolResult.result.sources; _i < _a.length; _i++) {
                                            var source = _a[_i];
                                            if ((source === null || source === void 0 ? void 0 : source.url) && !seenUrls.has(source.url)) {
                                                seenUrls.add(source.url);
                                                uniqueNewSources.push(source);
                                            }
                                        }
                                        var newSources = uniqueNewSources.map(function (source, index) { return ({
                                            title: source.title || "Untitled",
                                            link: source.url,
                                            snippet: source.snippet || source.description || "",
                                            index: index + (existingSources.length || 0) + 1,
                                        }); });
                                        log.info({
                                            existingCount: existingSources.length,
                                            originalNewCount: toolResult.result.sources.length,
                                            filteredNewCount: (newSources === null || newSources === void 0 ? void 0 : newSources.length) || 0,
                                            totalCount: (existingSources.length || 0) + ((newSources === null || newSources === void 0 ? void 0 : newSources.length) || 0),
                                        }, "Updated sources from web search tool with deduplication");
                                        return __spreadArray(__spreadArray([], existingSources, true), (newSources || []), true);
                                    });
                                }
                                // Track math tool results for potential fallback post-processing
                                if ((mathCalculator &&
                                    Object.keys(calculatorTools()).includes(toolResult.toolName || "")) ||
                                    toolResult.toolName === "evaluateExpression") {
                                    lastMathResult = {
                                        toolName: toolResult.toolName,
                                        result: toolResult.result,
                                    };
                                }
                                // Send tool result event to UI
                                events === null || events === void 0 ? void 0 : events.update("steps", function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), { 0: __assign(__assign({}, prev === null || prev === void 0 ? void 0 : prev[0]), { id: 0, status: "COMPLETED", steps: __assign(__assign({}, (_a = prev === null || prev === void 0 ? void 0 : prev[0]) === null || _a === void 0 ? void 0 : _a.steps), { toolResult: {
                                                    data: {
                                                        result: toolResult.result,
                                                        type: charts &&
                                                            Object.keys(chartTools()).includes(toolResult.toolName || "")
                                                            ? "charts"
                                                            : mathCalculator
                                                                ? "math_calculator"
                                                                : toolResult.toolName === "web_search"
                                                                    ? "web_search"
                                                                    : "unknown",
                                                    },
                                                    status: "COMPLETED",
                                                } }) }) }));
                                });
                                // Also update toolResults for threadItem
                                events === null || events === void 0 ? void 0 : events.update("toolResults", function (prev) {
                                    var _a;
                                    return (__assign(__assign({}, prev), (_a = {}, _a[toolResult.toolCallId] = {
                                        toolCallId: toolResult.toolCallId,
                                        toolName: toolResult.toolName || "unknown",
                                        result: toolResult.result,
                                    }, _a)));
                                });
                            },
                        })];
                case 2:
                    response = _k.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _k.sent();
                    // Handle PDF-specific errors with enhanced messaging
                    if (hasPDFAttachment) {
                        pdfError_1 = handlePDFProcessingError(error_1);
                        log.error("PDF processing error", {
                            type: pdfError_1.type,
                            message: pdfError_1.message,
                            userMessage: pdfError_1.userMessage,
                        });
                        // Provide user-friendly error message
                        events === null || events === void 0 ? void 0 : events.update("error", function (_prev) { return ({
                            error: pdfError_1.userMessage,
                            suggestion: pdfError_1.suggestion,
                            type: pdfError_1.type,
                            status: "ERROR",
                        }); });
                        // Also update the answer with error information
                        events === null || events === void 0 ? void 0 : events.update("answer", function (prev) { return (__assign(__assign({}, prev), { text: "I'm sorry, but I encountered an issue processing your PDF document: ".concat(pdfError_1.userMessage, "\n\n").concat(pdfError_1.suggestion), status: "ERROR" })); });
                        // End buffers and return
                        reasoningBuffer.end();
                        chunkBuffer.end();
                        return [2 /*return*/];
                    }
                    // Provide more descriptive error messages for API key issues
                    if (error_1 instanceof Error) {
                        errorMessage = error_1.message.toLowerCase();
                        if (errorMessage.includes("api key") || errorMessage.includes("unauthorized")) {
                            modelInfo_1 = models.find(function (m) { return m.id === model; });
                            if (modelInfo_1) {
                                providerName_1 = modelInfo_1.provider;
                                events === null || events === void 0 ? void 0 : events.update("error", function (_prev) { return ({
                                    error: "API key required for ".concat(modelInfo_1.name, ". Please add your ").concat(providerName_1, " API key in Settings."),
                                    suggestion: "Go to Settings \u2192 API Keys and add your ".concat(providerName_1, " API key to use this model."),
                                    type: "API_KEY_ERROR",
                                    status: "ERROR",
                                }); });
                                // Also update the answer with error information
                                events === null || events === void 0 ? void 0 : events.update("answer", function (prev) { return (__assign(__assign({}, prev), { text: "I'm sorry, but I need an API key for ".concat(modelInfo_1.name, " to continue. Please add your ").concat(providerName_1, " API key in Settings."), status: "ERROR" })); });
                                // End buffers and return
                                reasoningBuffer.end();
                                chunkBuffer.end();
                                return [2 /*return*/];
                            }
                        }
                    }
                    // For non-PDF errors, re-throw to use existing error handling
                    throw error_1;
                case 4:
                    reasoningBuffer.end();
                    chunkBuffer.end();
                    finalResponse = response;
                    if (!((!finalResponse || finalResponse.trim().length === 0) && lastMathResult)) return [3 /*break*/, 8];
                    _k.label = 5;
                case 5:
                    _k.trys.push([5, 7, , 8]);
                    fallbackPrompt = "You performed a mathematical calculation using tool \"".concat(lastMathResult.toolName || "math_calculator", "\" and obtained this JSON output. Write a concise, user-friendly markdown answer that:\n\n1) States the final numeric result clearly (bold the number)\n2) Shows the minimal steps, if helpful\n3) Avoids mentioning internal tools or JSON\n\nTool output JSON:\n\n").concat(typeof lastMathResult.result === "string"
                        ? lastMathResult.result
                        : JSON.stringify(lastMathResult.result));
                    return [4 /*yield*/, generateText({
                            model: model,
                            prompt: fallbackPrompt,
                            signal: signal,
                            toolChoice: "none",
                            maxSteps: 1,
                            byokKeys: context === null || context === void 0 ? void 0 : context.get("apiKeys"),
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            mode: context === null || context === void 0 ? void 0 : context.get("mode"),
                        })];
                case 6:
                    fallback = _k.sent();
                    if (fallback && fallback.trim().length > 0) {
                        finalResponse = fallback;
                    }
                    return [3 /*break*/, 8];
                case 7:
                    fallbackError_1 = _k.sent();
                    log.warn({
                        error: fallbackError_1 instanceof Error ? fallbackError_1.message : fallbackError_1,
                    }, "Math fallback post-processing failed");
                    return [3 /*break*/, 8];
                case 8:
                    log.debug("🏁 Final response update", {
                        finalResponseLength: (finalResponse === null || finalResponse === void 0 ? void 0 : finalResponse.length) || 0,
                        finalResponsePreview: (finalResponse === null || finalResponse === void 0 ? void 0 : finalResponse.substring(0, 100)) + "...",
                        threadItemId: context === null || context === void 0 ? void 0 : context.get("threadItemId"),
                    });
                    events === null || events === void 0 ? void 0 : events.update("answer", function (prev) { return (__assign(__assign({}, prev), { text: finalResponse, fullText: finalResponse, status: "COMPLETED" })); });
                    context.update("answer", function (_) { return finalResponse; });
                    events === null || events === void 0 ? void 0 : events.update("status", function (_prev) { return "COMPLETED"; });
                    onFinish = context.get("onFinish");
                    if (onFinish) {
                        onFinish({
                            answer: response,
                            threadId: context.get("threadId"),
                            threadItemId: context.get("threadItemId"),
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); },
    onError: handleError,
    route: function (_a) {
        var context = _a.context;
        if ((context === null || context === void 0 ? void 0 : context.get("showSuggestions")) && context.get("answer")) {
            return "suggestions";
        }
        return "end";
    },
});
