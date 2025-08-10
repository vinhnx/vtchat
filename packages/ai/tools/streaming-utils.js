/**
 * Enhanced tool call utilities for AI SDK streaming integration
 * Based on AI SDK's tool call streaming patterns
 */
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
/**
 * Creates a partial tool call for streaming display
 */
export function createPartialToolCall(toolCallId, toolName, partialArgs) {
    if (partialArgs === void 0) { partialArgs = {}; }
    return {
        type: "tool-call",
        toolCallId: toolCallId,
        toolName: toolName,
        args: partialArgs,
        state: "partial-call",
        timestamp: Date.now(),
    };
}
/**
 * Creates a full tool call
 */
export function createFullToolCall(toolCallId, toolName, args) {
    return {
        type: "tool-call",
        toolCallId: toolCallId,
        toolName: toolName,
        args: args,
        state: "call",
        timestamp: Date.now(),
    };
}
/**
 * Updates a tool call to executing state
 */
export function setToolCallExecuting(toolCall) {
    return __assign(__assign({}, toolCall), { state: "executing", timestamp: Date.now() });
}
/**
 * Creates a tool result from a successful execution
 */
export function createToolResult(toolCall, result, executionTime) {
    return {
        type: "tool-result",
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        args: toolCall.args,
        result: result,
        state: "result",
        executionTime: executionTime,
        timestamp: Date.now(),
    };
}
/**
 * Creates a tool error result
 */
export function createToolError(toolCall, error, executionTime) {
    return {
        type: "tool-result",
        toolCallId: toolCall.toolCallId,
        toolName: toolCall.toolName,
        args: toolCall.args,
        result: error,
        state: "error",
        executionTime: executionTime,
        timestamp: Date.now(),
    };
}
/**
 * Utility to check if a tool invocation is in a specific state
 */
export function isToolInState(toolCall, state) {
    if (toolCall.type === "tool-call") {
        return toolCall.state === state;
    }
    else {
        return toolCall.state === state;
    }
}
/**
 * Gets the display priority for tool states (for sorting)
 */
export function getToolStatePriority(state) {
    var priorities = {
        "partial-call": 1,
        call: 2,
        executing: 3,
        result: 4,
        error: 5,
    };
    return priorities[state] || 0;
}
/**
 * Enhanced tool call executor with streaming support
 */
var StreamingToolExecutor = /** @class */ (function () {
    function StreamingToolExecutor(callbacks) {
        if (callbacks === void 0) { callbacks = {}; }
        this.onToolCallUpdate = callbacks.onToolCallUpdate;
        this.onToolResult = callbacks.onToolResult;
    }
    /**
     * Execute a tool with streaming updates
     */
    StreamingToolExecutor.prototype.executeToolWithStreaming = function (toolCall, executor) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, executingCall, result, executionTime, toolResult, error_1, executionTime, toolError;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        startTime = Date.now();
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        executingCall = setToolCallExecuting(toolCall);
                        (_a = this.onToolCallUpdate) === null || _a === void 0 ? void 0 : _a.call(this, executingCall);
                        return [4 /*yield*/, executor(toolCall.args)];
                    case 2:
                        result = _d.sent();
                        executionTime = Date.now() - startTime;
                        toolResult = createToolResult(toolCall, result, executionTime);
                        (_b = this.onToolResult) === null || _b === void 0 ? void 0 : _b.call(this, toolResult);
                        return [2 /*return*/, toolResult];
                    case 3:
                        error_1 = _d.sent();
                        executionTime = Date.now() - startTime;
                        toolError = createToolError(toolCall, error_1, executionTime);
                        (_c = this.onToolResult) === null || _c === void 0 ? void 0 : _c.call(this, toolError);
                        return [2 /*return*/, toolError];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle partial tool call streaming (for OpenAI streaming)
     */
    StreamingToolExecutor.prototype.handlePartialToolCall = function (toolCallId, toolName, partialArgs) {
        var _a;
        var partialCall = createPartialToolCall(toolCallId, toolName, partialArgs);
        (_a = this.onToolCallUpdate) === null || _a === void 0 ? void 0 : _a.call(this, partialCall);
    };
    /**
     * Handle complete tool call
     */
    StreamingToolExecutor.prototype.handleCompleteToolCall = function (toolCallId, toolName, args) {
        var _a;
        var fullCall = createFullToolCall(toolCallId, toolName, args);
        (_a = this.onToolCallUpdate) === null || _a === void 0 ? void 0 : _a.call(this, fullCall);
        return fullCall;
    };
    return StreamingToolExecutor;
}());
export { StreamingToolExecutor };
