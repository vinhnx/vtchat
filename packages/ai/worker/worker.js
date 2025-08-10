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
import { ChatMode } from "@repo/shared/config";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import { REASONING_BUDGETS } from "../constants/reasoning";
import { runWorkflow } from "../workflow/flow";
// Create context for the worker
var ctx = self;
// Create a mock process.env object for the worker context
if (typeof process === "undefined") {
    self.process = { env: {} };
}
// Store for API keys and active workflow
var apiKeys = {};
var activeWorkflow = null;
/**
 * Get thinking mode configuration for specific chat modes
 * Automatically enables high-effort reasoning for research modes
 */
function getThinkingModeForChatMode(mode, userThinkingMode) {
    var _a, _b;
    // Auto-enable reasoning for research modes with high budgets
    if (mode === ChatMode.Deep) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.DEEP, // 50K tokens - highest effort
            includeThoughts: (_a = userThinkingMode === null || userThinkingMode === void 0 ? void 0 : userThinkingMode.includeThoughts) !== null && _a !== void 0 ? _a : true,
        };
    }
    if (mode === ChatMode.Pro) {
        return {
            enabled: true,
            budget: REASONING_BUDGETS.BALANCED, // 25K tokens - high effort
            includeThoughts: (_b = userThinkingMode === null || userThinkingMode === void 0 ? void 0 : userThinkingMode.includeThoughts) !== null && _b !== void 0 ? _b : true,
        };
    }
    // For other modes, use user settings or defaults
    return (userThinkingMode || {
        enabled: false,
        budget: 0,
        includeThoughts: false,
    });
}
// Handle messages from the main thread
ctx.addEventListener("message", function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, type, payload, mode_1, question_1, threadId_1, threadItemId_1, parentThreadItemId_1, messages, config, newApiKeys, webSearch, mathCalculator, charts, showSuggestions, thinkingMode, _b, userTier, startTask, result, error_1;
    var _c, _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _a = event.data, type = _a.type, payload = _a.payload;
                _f.label = 1;
            case 1:
                _f.trys.push([1, 5, , 6]);
                if (!(type === "START_WORKFLOW")) return [3 /*break*/, 3];
                // If there's an active workflow, abort it before starting a new one
                if (activeWorkflow) {
                    try {
                        (_c = activeWorkflow.abort) === null || _c === void 0 ? void 0 : _c.call(activeWorkflow, false);
                        activeWorkflow = null;
                    }
                    catch (e) {
                        log.error("[Worker] Error aborting previous workflow:", { data: e });
                    }
                }
                mode_1 = payload.mode, question_1 = payload.question, threadId_1 = payload.threadId, threadItemId_1 = payload.threadItemId, parentThreadItemId_1 = payload.parentThreadItemId, messages = payload.messages, config = payload.config, newApiKeys = payload.apiKeys, webSearch = payload.webSearch, mathCalculator = payload.mathCalculator, charts = payload.charts, showSuggestions = payload.showSuggestions, thinkingMode = payload.thinkingMode, _b = payload.userTier, userTier = _b === void 0 ? UserTier.FREE : _b;
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
                    log.info({
                        mode: mode_1,
                        hasOpenAiKey: !!apiKeys.OPENAI_API_KEY,
                        openAiKeyLength: ((_d = apiKeys.OPENAI_API_KEY) === null || _d === void 0 ? void 0 : _d.length) || 0,
                        apiKeySetupCompleted: true,
                    }, "Worker API keys configured");
                }
                // Initialize the workflow
                activeWorkflow = runWorkflow({
                    mode: mode_1,
                    question: question_1,
                    threadId: threadId_1,
                    threadItemId: threadItemId_1,
                    messages: messages,
                    config: config,
                    apiKeys: newApiKeys,
                    webSearch: webSearch,
                    mathCalculator: mathCalculator,
                    charts: charts,
                    showSuggestions: showSuggestions,
                    thinkingMode: getThinkingModeForChatMode(mode_1, thinkingMode),
                    userTier: userTier,
                    onFinish: function (_data) { },
                });
                // Forward workflow events to the main thread
                activeWorkflow.onAll(function (event, payload) {
                    var _a;
                    ctx.postMessage((_a = {
                            event: event,
                            threadId: threadId_1,
                            threadItemId: threadItemId_1,
                            parentThreadItemId: parentThreadItemId_1,
                            mode: mode_1,
                            query: question_1
                        },
                        _a[event] = payload,
                        _a));
                });
                startTask = mode_1 === ChatMode.Deep ? "router" : "router";
                return [4 /*yield*/, activeWorkflow.start(startTask, {
                        question: question_1,
                    })];
            case 2:
                result = _f.sent();
                // Send completion message
                ctx.postMessage({
                    type: "done",
                    status: "complete",
                    threadId: threadId_1,
                    threadItemId: threadItemId_1,
                    parentThreadItemId: parentThreadItemId_1,
                    result: result,
                });
                // Clear the active workflow reference
                activeWorkflow = null;
                return [3 /*break*/, 4];
            case 3:
                if (type === "ABORT_WORKFLOW") {
                    // Abort handling
                    if (activeWorkflow) {
                        try {
                            (_e = activeWorkflow.abort) === null || _e === void 0 ? void 0 : _e.call(activeWorkflow, payload.graceful);
                            activeWorkflow = null;
                        }
                        catch (e) {
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
                _f.label = 4;
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _f.sent();
                log.error("[Worker] Error in worker:", { data: error_1 });
                ctx.postMessage({
                    type: "done",
                    status: "error",
                    error: error_1 instanceof Error ? error_1.message : String(error_1),
                    threadId: payload === null || payload === void 0 ? void 0 : payload.threadId,
                    threadItemId: payload === null || payload === void 0 ? void 0 : payload.threadItemId,
                    parentThreadItemId: payload === null || payload === void 0 ? void 0 : payload.parentThreadItemId,
                });
                // Clear the active workflow reference on error
                activeWorkflow = null;
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
