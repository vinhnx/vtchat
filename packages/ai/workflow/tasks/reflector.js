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
import { getVTPlusFeatureFromChatMode } from "@repo/shared/utils/access-control";
import { z } from "zod";
import { ModelEnum } from "../../models";
import { generateObject, getHumanizedDate, handleError, selectAvailableModel, sendEvents, } from "../utils";
export var reflectorTask = createTask({
    name: "reflector",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var question, messages, prevQueries, stepId, prevSummaries, currentYear, updateStep, prompt, byokKeys, selectedModel, chatMode, vtplusFeature, object, newStepId;
        var _c;
        var data = _b.data, events = _b.events, context = _b.context, signal = _b.signal, redirectTo = _b.redirectTo;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    messages = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
                    prevQueries = (context === null || context === void 0 ? void 0 : context.get("queries")) || [];
                    stepId = data === null || data === void 0 ? void 0 : data.stepId;
                    prevSummaries = (context === null || context === void 0 ? void 0 : context.get("summaries")) || [];
                    currentYear = new Date().getFullYear();
                    updateStep = sendEvents(events).updateStep;
                    prompt = "\nYou are a research progress evaluator analyzing how effectively a research question has been addressed. Your primary responsibility is to identify remaining knowledge gaps and determine if additional targeted queries are necessary.\n\n## Current Research State\n\nResearch Question: \"".concat(question, "\"\n\nPrevious Search Queries:\n").concat(prevQueries === null || prevQueries === void 0 ? void 0 : prevQueries.join("\n"), "\n\nResearch Findings So Far:\n").concat(prevSummaries === null || prevSummaries === void 0 ? void 0 : prevSummaries.join("\n---\n"), "\n\nCurrent date: ").concat(getHumanizedDate(), "\n\n## Evaluation Framework\n\n1. Comprehensively assess how well the current findings answer the original research question\n2. Identify specific information gaps that prevent fully answering the research question\n3. Determine if these gaps warrant additional queries or if the question has been sufficiently addressed\n\n## Query Generation Rules\n\n- DO NOT suggest queries similar to previous ones - review each previous query carefully\n- DO NOT broaden the scope beyond the original research question\n- DO NOT suggest queries that would likely yield redundant information\n- ONLY suggest queries that address identified information gaps\n- Each query must explore a distinct aspect not covered by previous searches\n- Limit to 1-2 highly targeted queries maximum\n- Format queries as direct search terms, NOT as questions\n- DO NOT start queries with \"how\", \"what\", \"when\", \"where\", \"why\", or \"who\"\n- Use concise keyword phrases instead of full sentences\n- Maximum 8 words per query\n\n## Examples of Bad Queries:\n- \"How long does a Tesla Model 3 battery last?\"\n- \"What are the economic impacts of climate change?\"\n- \"When should I use async await in JavaScript?\"\n- \"Why is remote work increasing productivity?\"\n\n## Examples of When to Return Null for Queries:\n- When all aspects of the research question have been comprehensively addressed\n- When additional queries would only yield redundant information\n- When the search has reached diminishing returns with sufficient information gathered\n- When all reasonable angles of the question have been explored\n- When the findings provide a complete answer despite minor details missing\n\n**Important**:\n- Use current date and time for the queries unless speciffically asked for a different time period\n\n## Output Format\n{\n  \"reasoning\": \"Your analysis of current research progress, specifically identifying what aspects of the question remain unanswered and why additional queries would provide valuable new information (or why the research is complete).\",\n  \"queries\": [\"direct search term 1\", \"direct search term 2\"] // Return null if research is sufficient or if no non-redundant queries can be formulated\n}\n\n## Example Outputs\n\n### When Additional Queries Are Needed:\n\n{\n  \"reasoning\": \"The current findings provide substantial information about Tesla Model 3 performance metrics and owner satisfaction, but lack specific data on battery degradation rates over time. This gap is critical as battery longevity directly impacts the vehicle's long-term value proposition and maintenance costs.\",\n  \"queries\": [\"tesla model 3 battery degradation rates ").concat(currentYear, "\"]\n}\n\n\n### When Research Is Complete:\n{\n  \"reasoning\": \"The research question 'What are the benefits of intermittent fasting?' has been comprehensively addressed. The findings cover metabolic effects, weight management outcomes, cellular repair mechanisms, and potential risks for different populations. Additional research angles would likely yield redundant information or explore tangential topics beyond the scope of the original question.\",\n  \"queries\": null\n}\n\n**CRITICAL: Your primary goal is to avoid redundancy. If you cannot identify genuinely new angles to explore that would yield different information, return null for queries.**\n");
                    byokKeys = context === null || context === void 0 ? void 0 : context.get("apiKeys");
                    selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_PRO, byokKeys);
                    chatMode = context === null || context === void 0 ? void 0 : context.get("mode");
                    vtplusFeature = getVTPlusFeatureFromChatMode(chatMode);
                    return [4 /*yield*/, generateObject({
                            prompt: prompt,
                            model: selectedModel,
                            schema: z.object({
                                reasoning: z.string(),
                                queries: z.array(z.string()).optional().nullable(),
                            }),
                            byokKeys: byokKeys,
                            messages: messages,
                            signal: signal,
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            feature: vtplusFeature || undefined,
                        })];
                case 1:
                    object = _d.sent();
                    newStepId = stepId + 1;
                    context === null || context === void 0 ? void 0 : context.update("queries", function (current) { var _a; return __spreadArray(__spreadArray([], (current !== null && current !== void 0 ? current : []), true), ((_a = object === null || object === void 0 ? void 0 : object.queries) !== null && _a !== void 0 ? _a : []), true); });
                    if (object === null || object === void 0 ? void 0 : object.reasoning) {
                        updateStep({
                            stepId: newStepId,
                            stepStatus: "PENDING",
                            text: object === null || object === void 0 ? void 0 : object.reasoning,
                            subSteps: {
                                search: { status: "COMPLETED", data: object === null || object === void 0 ? void 0 : object.queries },
                            },
                        });
                    }
                    if (!(((_c = object === null || object === void 0 ? void 0 : object.queries) === null || _c === void 0 ? void 0 : _c.length) && (object === null || object === void 0 ? void 0 : object.reasoning))) {
                        redirectTo("analysis");
                    }
                    return [2 /*return*/, {
                            queries: object === null || object === void 0 ? void 0 : object.queries,
                            stepId: newStepId,
                        }];
            }
        });
    }); },
    onError: handleError,
    route: function (_a) {
        var _b, _c;
        var result = _a.result;
        if (((_c = (_b = result === null || result === void 0 ? void 0 : result.queries) === null || _b === void 0 ? void 0 : _b.filter(Boolean)) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            return "gemini-web-search";
        }
        return "analysis";
    },
});
