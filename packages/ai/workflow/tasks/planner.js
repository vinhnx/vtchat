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
import { ChatMode } from "@repo/shared/config";
import { getVTPlusFeatureFromChatMode } from "@repo/shared/utils/access-control";
import { z } from "zod";
import { getModelFromChatMode, ModelEnum } from "../../models";
import { generateObject, getHumanizedDate, handleError, selectAvailableModel, sendEvents, } from "../utils";
export var plannerTask = createTask({
    name: "planner",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var messages, question, _currentYear, _c, updateStep, nextStepId, stepId, prompt, mode, baseModel, model, chatMode, vtplusFeature, object;
        var events = _b.events, context = _b.context, signal = _b.signal;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    messages = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    _currentYear = new Date().getFullYear();
                    _c = sendEvents(events), updateStep = _c.updateStep, nextStepId = _c.nextStepId;
                    stepId = nextStepId();
                    prompt = "\n                        You're a strategic research planner. Your job is to analyze research questions and develop an initial approach to find accurate information through web searches.\n\n                        **Research Question**:\n                        <question>\n                        ".concat(question, "\n                        </question>\n\n                        **Your Task**:\n                        1. Identify the 1-2 most important initial aspects of this question to research first\n                        2. Formulate 1-2 precise search queries that will yield the most relevant initial information\n                        3. Focus on establishing a foundation of knowledge before diving into specifics\n\n                        **Search Strategy Guidelines**:\n                        - Create targeted queries using search operators when appropriate\n                        - Prioritize broad, foundational information for initial searches\n                        - Ensure queries cover different high-priority aspects of the research question\n\n                        ## Query Generation Rules\n\n- DO NOT broaden the scope beyond the original research question\n- DO NOT suggest queries that would likely yield redundant information\n- Each query must explore a distinct aspect\n- Limit to 1-2 highly targeted queries maximum\n- Format queries as direct search terms, NOT as questions\n- DO NOT start queries with \"how\", \"what\", \"when\", \"where\", \"why\", or \"who\"\n- Use concise keyword phrases instead of full sentences\n- Use time period in queries when needed\n- Maximum 8 words per query\n- If user question is clear and concise, you can use it as one of the queries\n\n**Current date and time: **").concat(getHumanizedDate(), "**\n\n## Examples of Bad Queries:\n- \"How long does a Tesla Model 3 battery last?\"\n- \"What are the economic impacts of climate change?\"\n- \"When should I use async await in JavaScript?\"\n- \"Why is remote work increasing productivity?\"\n\n**Important**:\n- Use current date and time for the queries unless speciffically asked for a different time period\n\n                        **Output Format (JSON)**:\n                        - reasoning: A brief explanation of your first step to research the question\n                        - queries: 2 well-crafted search queries (4-8 words) that targets the most important aspects\n                ");
                    mode = (context === null || context === void 0 ? void 0 : context.get("mode")) || "";
                    baseModel = mode === ChatMode.Deep ? ModelEnum.GEMINI_2_5_PRO : getModelFromChatMode(mode);
                    model = selectAvailableModel(baseModel, context === null || context === void 0 ? void 0 : context.get("apiKeys"));
                    chatMode = context === null || context === void 0 ? void 0 : context.get("mode");
                    vtplusFeature = getVTPlusFeatureFromChatMode(chatMode);
                    return [4 /*yield*/, generateObject({
                            prompt: prompt,
                            model: model,
                            schema: z.object({
                                reasoning: z.string(),
                                queries: z.array(z.string()),
                            }),
                            byokKeys: context === null || context === void 0 ? void 0 : context.get("apiKeys"),
                            messages: messages,
                            signal: signal,
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            feature: vtplusFeature || undefined,
                        })];
                case 1:
                    object = _d.sent();
                    context === null || context === void 0 ? void 0 : context.update("queries", function (current) { return __spreadArray(__spreadArray([], (current !== null && current !== void 0 ? current : []), true), ((object === null || object === void 0 ? void 0 : object.queries) || []), true); });
                    // Update flow event with initial goal
                    updateStep({
                        stepId: stepId,
                        text: object.reasoning,
                        stepStatus: "PENDING",
                        subSteps: {
                            search: {
                                status: "COMPLETED",
                                data: object.queries,
                            },
                        },
                    });
                    return [2 /*return*/, {
                            queries: object.queries,
                            stepId: stepId,
                        }];
            }
        });
    }); },
    onError: handleError,
    route: function () { return "gemini-web-search"; },
});
