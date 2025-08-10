/**
 * Enhanced Tool Registry for VT Chat
 * Integrates AI SDK tool streaming patterns with existing VT Chat tools
 */
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
import { ModelEnum } from "../models";
import { openaiWebSearchTool, supportsOpenAIWebSearch } from "./openai-web-search";
import { StreamingToolExecutor } from "./streaming-utils";
export var USER_TIER = {
    VT_BASE: "VT_BASE",
    VT_PLUS: "VT_PLUS",
};
/**
 * Enhanced tool registry that supports AI SDK patterns
 */
var ToolRegistry = /** @class */ (function () {
    function ToolRegistry() {
        this.tools = new Map();
        this.registerDefaultTools();
    }
    /**
     * Get models that support web search based on environment
     */
    ToolRegistry.prototype.getWebSearchSupportedModels = function () {
        // Models that support web search functionality
        var webSearchCapableModels = [
            // OpenAI models with web search
            ModelEnum.GPT_4o_Mini,
            ModelEnum.GPT_4o,
            ModelEnum.GPT_4_1_Mini,
            ModelEnum.GPT_4_1,
            ModelEnum.O3,
            ModelEnum.O3_Mini,
            ModelEnum.O4_Mini,
            // Gemini models with grounding/web search
            ModelEnum.GEMINI_2_5_PRO,
            ModelEnum.GEMINI_2_5_FLASH,
            ModelEnum.GEMINI_2_5_FLASH_LITE,
        ];
        // In production, filter by available API keys or environment config
        // For now, return all web search capable models
        return webSearchCapableModels.filter(function (_model) {
            // Check if model is available in current environment
            // This could be expanded to check for API keys, feature flags, etc.
            return true; // For now, include all web search capable models
        });
    };
    /**
     * Register default VT Chat tools
     */
    ToolRegistry.prototype.registerDefaultTools = function () {
        // Web Search Tool - VT+ ONLY feature for supported models
        var webSearchSupportedModels = this.getWebSearchSupportedModels();
        if (webSearchSupportedModels.length > 0) {
            this.register({
                name: "web_search",
                description: "Search the web using built-in web search capabilities (VT+ subscription required)",
                category: "web-search",
                supportedModels: webSearchSupportedModels,
                supportsStreaming: true,
                autoExecute: true,
                requiredTier: USER_TIER.VT_PLUS,
                tool: openaiWebSearchTool, // This will need to be generalized for multi-provider support
            });
        }
        // Math Calculator Tool (existing)
        this.register({
            name: "math_calculator",
            description: "Perform mathematical calculations",
            category: "math",
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing math tool
        });
        // Chart Visualization Tool (existing)
        this.register({
            name: "chart_visualization",
            description: "Create interactive charts and graphs",
            category: "chart",
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing chart tool
        });
        // Document Processing Tool (existing)
        this.register({
            name: "document_processing",
            description: "Process and analyze documents",
            category: "document",
            supportsStreaming: false,
            autoExecute: true,
            tool: null, // Reference to existing document tool
        });
    };
    /**
     * Register a new tool
     */
    ToolRegistry.prototype.register = function (definition) {
        this.tools.set(definition.name, definition);
    };
    /**
     * Get available tools for a given context
     */
    ToolRegistry.prototype.getAvailableTools = function (context) {
        var _a;
        var availableTools = {};
        for (var _i = 0, _b = Array.from(this.tools.entries()); _i < _b.length; _i++) {
            var _c = _b[_i], name_1 = _c[0], definition = _c[1];
            // Check model compatibility
            if ((_a = definition.supportedModels) === null || _a === void 0 ? void 0 : _a.length) {
                if (!definition.supportedModels.includes(context.model)) {
                    continue;
                }
            }
            // User tier restriction: Check if user has required tier for this tool
            if (definition.requiredTier && context.userTier !== definition.requiredTier) {
                continue;
            }
            // Special handling for web search functionality
            if (name_1 === "web_search") {
                if (!supportsOpenAIWebSearch(context.model)) {
                    continue;
                }
            }
            // Add the tool if it passes all checks
            if (definition.tool) {
                availableTools[name_1] = definition.tool();
            }
        }
        return availableTools;
    };
    /**
     * Get tools that support streaming
     */
    ToolRegistry.prototype.getStreamingTools = function (context) {
        var streamingTools = {};
        for (var _i = 0, _a = Array.from(this.tools.entries()); _i < _a.length; _i++) {
            var _b = _a[_i], name_2 = _b[0], definition = _b[1];
            if (definition.supportsStreaming) {
                var tools = this.getAvailableTools(context);
                if (tools[name_2]) {
                    streamingTools[name_2] = tools[name_2];
                }
            }
        }
        return streamingTools;
    };
    /**
     * Get tools that require user interaction
     */
    ToolRegistry.prototype.getUserInteractionTools = function () {
        return Array.from(this.tools.values()).filter(function (tool) { return !tool.autoExecute; });
    };
    /**
     * Get tool definition by name
     */
    ToolRegistry.prototype.getToolDefinition = function (name) {
        return this.tools.get(name);
    };
    /**
     * Check if a tool supports a specific model
     */
    ToolRegistry.prototype.isToolSupportedForModel = function (toolName, model) {
        var _a;
        var definition = this.tools.get(toolName);
        if (!definition)
            return false;
        if (!((_a = definition.supportedModels) === null || _a === void 0 ? void 0 : _a.length))
            return true;
        return definition.supportedModels.includes(model);
    };
    /**
     * Set up streaming executor for tool execution callbacks
     */
    ToolRegistry.prototype.setupStreaming = function (context) {
        this.streamingExecutor = new StreamingToolExecutor({
            onToolCallUpdate: context.onToolCallUpdate,
            onToolResult: context.onToolResult,
        });
    };
    /**
     * Execute a tool with streaming support
     */
    ToolRegistry.prototype.executeToolWithStreaming = function (toolCall, executor) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.streamingExecutor) {
                            throw new Error("Streaming executor not set up. Call setupStreaming() first.");
                        }
                        return [4 /*yield*/, this.streamingExecutor.executeToolWithStreaming(toolCall, executor)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Handle partial tool call from streaming
     */
    ToolRegistry.prototype.handlePartialToolCall = function (toolCallId, toolName, partialArgs) {
        var _a;
        (_a = this.streamingExecutor) === null || _a === void 0 ? void 0 : _a.handlePartialToolCall(toolCallId, toolName, partialArgs);
    };
    /**
     * Handle complete tool call
     */
    ToolRegistry.prototype.handleCompleteToolCall = function (toolCallId, toolName, args) {
        if (!this.streamingExecutor)
            return null;
        return this.streamingExecutor.handleCompleteToolCall(toolCallId, toolName, args);
    };
    return ToolRegistry;
}());
export { ToolRegistry };
/**
 * Global tool registry instance
 */
export var toolRegistry = new ToolRegistry();
/**
 * Helper function to get tools for AI SDK streamText calls
 * Note: Web search functionality requires VT+ subscription (userTier: USER_TIER.VT_PLUS)
 */
export function getToolsForModel(model, options) {
    if (options === void 0) { options = {}; }
    var context = {
        model: model,
        userTier: options.userTier,
        byokKeys: options.byokKeys,
        onToolCallUpdate: options.onToolCallUpdate,
        onToolResult: options.onToolResult,
    };
    // Set up streaming if callbacks are provided
    if (options.onToolCallUpdate || options.onToolResult) {
        toolRegistry.setupStreaming(context);
    }
    var tools = toolRegistry.getAvailableTools(context);
    var filteredTools = {};
    // Apply feature flags with VT+ restrictions
    if (options.enableWebSearch && tools.web_search && options.userTier === USER_TIER.VT_PLUS) {
        filteredTools.web_search = tools.web_search;
    }
    if (options.enableMath && tools.math_calculator) {
        filteredTools.math_calculator = tools.math_calculator;
    }
    if (options.enableCharts && tools.chart_visualization) {
        filteredTools.chart_visualization = tools.chart_visualization;
    }
    return filteredTools;
}
