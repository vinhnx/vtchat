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
import { getModelFromChatMode, supportsNativeWebSearch, supportsOpenAIWebSearch, trimMessageHistoryEstimated, } from "@repo/ai/models";
import { createTask } from "@repo/orchestrator";
import { ChatMode } from "@repo/shared/config";
import { log } from "@repo/shared/lib/logger";
import { handleError, sendEvents } from "../utils";
/**
 * Check if a query should skip web search regardless of user toggle
 * These are queries that can be answered without external information
 */
function shouldSkipWebSearch(question) {
    var query = question.toLowerCase().trim();
    // Identity and capability questions
    var identityPatterns = [
        /^(who are you|what are you|tell me about yourself|describe yourself)[?.]?$/,
        /^(what can you do|what are your capabilities|what's your purpose)[?.]?$/,
        /^(how can you help|what can you help with|how do you work)[?.]?$/,
        /^(introduce yourself|can you introduce yourself)[?.]?$/,
        /^(are you|can you|do you)\s+(ai|artificial|intelligence|chatbot|bot|assistant)[?.]?$/,
        /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)[!?.]?$/,
    ];
    // Mathematical/computational queries that don't need web search
    var mathPatterns = [
        /^(calculate|compute|solve|what is|what's)\s*[\d+\-*/.()%\s]+[?.]?$/,
        /^\d+\s*[+\-*/.%]\s*\d+.*[?.]?$/,
        /^(square root|sqrt|factorial|sum|add|subtract|multiply|divide)/,
        /^\d+\s*(plus|minus|times|divided by)\s*\d+/,
        /^what.*(is|equals?)\s*\d+.*[\d+\-*/.%()]/,
        /^(percentage|percent)\s+of\s+\d+/, // "percentage of 100" but not "percentage of US population"
    ];
    // Programming and general knowledge that doesn't need current info
    var generalPatterns = [
        /^(explain|define|what is|what's|describe)\s+(programming|coding|javascript|python|react|css|html|algorithm|function|variable|array|object)/,
        /^(how to|how do i|how can i)\s+(code|program|write|create|implement|build)\s+(a|an|the)?\s*(function|component|class|algorithm)/,
        /^(what is the difference between|compare|difference between)\s+\w+\s+(and|vs|versus)\s+\w+/,
        /^(help|assist|support)\s*(me)?\s*(with)?\s*(coding|programming|development)/,
        /^explain how \w+ hooks? work$/,
        /^explain how \w+ works?$/,
    ];
    // Simple conversational queries (narrow patterns to avoid false positives)
    var conversationalPatterns = [
        /^(yes|no|okay|ok|sure|alright|fine)[!?.]?$/,
        /^(sorry|excuse me|pardon)/,
        /^(thank you|thanks|bye|goodbye|see you|farewell)[!?.]?$/,
        /^hello,?\s+how are you\??$/,
    ];
    // IMPORTANT: Do NOT skip web search for queries that likely need current information
    // These patterns identify queries that should NEVER skip web search
    var needsWebSearchPatterns = [
        /\b(current|latest|recent|today|now|this week|this month|this year)\b/,
        /\b(weather|temperature|forecast)\b/,
        /\b(news|breaking|update|announcement)\b/,
        /\b(stock|price|market|exchange rate|cryptocurrency|bitcoin)\b/,
        /\b(score|game|match|tournament|championship)\b/,
        /\b(status|available|open|closed|schedule|hours)\b/,
        /what.*(happening|going on|new)/,
        /\b(in.*vietnam|in.*tri ton|in.*an giang|in.*ho chi minh|in.*hanoi|in.*saigon)\b/,
        /\b(restaurant|hotel|business|company|store|shop)\b.*\b(near|in|at)\b/,
    ];
    // If the query needs web search, don't skip it
    if (needsWebSearchPatterns.some(function (pattern) { return pattern.test(query); })) {
        return false;
    }
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray([], identityPatterns, true), mathPatterns, true), generalPatterns, true), conversationalPatterns, true).some(function (pattern) { return pattern.test(query); });
}
export var modeRoutingTask = createTask({
    name: "router",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var mode, updateStatus, messageHistory, trimmedMessageHistory, webSearch, question, model, shouldSkip;
        var _c;
        var events = _b.events, context = _b.context, redirectTo = _b.redirectTo;
        return __generator(this, function (_d) {
            mode = (context === null || context === void 0 ? void 0 : context.get("mode")) || ChatMode.GEMINI_2_5_FLASH_LITE;
            updateStatus = sendEvents(events).updateStatus;
            // Debug logging to track what's happening with mode
            log.info("🔍 Router Debug - Context mode:", { contextMode: context === null || context === void 0 ? void 0 : context.get("mode") });
            log.info("🔍 Router Debug - Final mode:", { finalMode: mode });
            log.info("🔍 Router Debug - Mode defaulted?", {
                modeDefaulted: (context === null || context === void 0 ? void 0 : context.get("mode")) === undefined,
            });
            messageHistory = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
            trimmedMessageHistory = trimMessageHistoryEstimated(messageHistory, mode);
            context === null || context === void 0 ? void 0 : context.set("messages", (_c = trimmedMessageHistory.trimmedMessages) !== null && _c !== void 0 ? _c : []);
            if (!(trimmedMessageHistory === null || trimmedMessageHistory === void 0 ? void 0 : trimmedMessageHistory.trimmedMessages)) {
                throw new Error("Maximum message history reached");
            }
            updateStatus("PENDING");
            webSearch = context === null || context === void 0 ? void 0 : context.get("webSearch");
            question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
            model = getModelFromChatMode(mode);
            // Debug logging for model selection
            log.info("🔍 Router Debug - Model from mode:", { model: model });
            log.info("🔍 Router Debug - getModelFromChatMode called with:", { mode: mode });
            shouldSkip = shouldSkipWebSearch(question);
            if (mode === ChatMode.Deep) {
                redirectTo("refine-query");
            }
            else if (mode === ChatMode.Pro) {
                // Pro Search mode - ALWAYS trigger web search unless it's a query that definitely doesn't need it
                if (shouldSkip) {
                    // For queries that don't need web search, use completion
                    redirectTo("completion");
                }
                else {
                    // For all other queries, use web search (default behavior for Pro Search)
                    redirectTo("gemini-web-search");
                }
            }
            else if (webSearch === true && !shouldSkip) {
                // Only trigger web search when explicitly enabled AND query needs external info
                // Support web search for both Gemini and OpenAI models
                if (supportsNativeWebSearch(model)) {
                    // Route all web search requests directly to gemini-web-search for optimal performance
                    // This bypasses the planner layer and provides direct execution
                    redirectTo("gemini-web-search");
                }
                else if (supportsOpenAIWebSearch(model)) {
                    // For OpenAI models with web search, use completion with OpenAI web search tools
                    redirectTo("completion");
                }
                else {
                    // For non-supported models with web search, redirect to completion with a note
                    redirectTo("completion");
                }
            }
            else {
                redirectTo("completion");
            }
            return [2 /*return*/];
        });
    }); },
    onError: handleError,
});
