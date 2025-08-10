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
import { createTask } from "@repo/orchestrator";
import { getVTPlusFeatureFromChatMode } from "@repo/shared/utils/access-control";
import { z } from "zod";
import { ModelEnum } from "../../models";
import { generateObject, getHumanizedDate, handleError, selectAvailableModel, sendEvents, } from "../utils";
var ClarificationResponseSchema = z.object({
    needsClarification: z.boolean(),
    reasoning: z.string().optional(),
    clarifyingQuestion: z
        .object({
        question: z.string(),
        choiceType: z.enum(["multiple", "single"]),
        options: z.array(z.string()).min(1).max(3),
    })
        .optional(),
    refinedQuery: z.string().optional(),
});
export var refineQueryTask = createTask({
    name: "refine-query",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var messages, question, _c, updateStatus, updateAnswer, updateObject, prompt, byokKeys, selectedModel, chatMode, vtplusFeature, object;
        var events = _b.events, context = _b.context, signal = _b.signal;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    messages = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    _c = sendEvents(events), updateStatus = _c.updateStatus, updateAnswer = _c.updateAnswer, updateObject = _c.updateObject;
                    prompt = "You are a professional research assistant for DEEP RESEARCH - a comprehensive, multi-step analysis workflow.\n\n                CURRENT DATE: ".concat(getHumanizedDate(), "\n\n                CONTEXT: You are the first stage of Deep Research, which differs from Pro Search:\n\n                **Deep Research Workflow**: refine-query \u2192 planner \u2192 web-search \u2192 analysis \u2192 writer\n                - For complex topics requiring comprehensive analysis\n                - Multi-angle investigation with strategic planning\n                - Synthesis of findings into detailed reports\n                - Examples: \"impact of AI on future employment\", \"comprehensive analysis of renewable energy adoption\"\n\n                **Pro Search** (not your workflow): direct web-search\n                - For quick factual lookups and current information\n                - Examples: \"current Bitcoin price\", \"weather in Tokyo today\"\n\n                Your task: Determine if the query needs clarification before proceeding with Deep Research.\n\n                CRITICAL INSTRUCTION: BE EXTREMELY AGGRESSIVE about proceeding with Deep Research. Even broad topics can be turned into comprehensive research projects.\n\n                BIAS: 95% of queries should proceed WITHOUT clarification. Only ask for clarification if IMPOSSIBLY vague.\n\n                For well-formed queries (DEFAULT - 95% of cases):\n                - Return needsClarification: false\n                - Provide a refinedQuery optimized for comprehensive research\n                - Transform broad topics into multi-angle research projects\n                - Enhance scope, specificity, and research angles\n\n                For impossibly vague queries (EXTREMELY RARE - only when literally no research direction is possible):\n                - Return needsClarification: true\n                - Provide reasoning explaining the ambiguity\n                - Include clarifying questions with 2-3 specific options\n                - The choiceType should be single or multiple based on the question\n\n                Examples of Deep Research queries that DON'T need clarification (PROCEED WITH ALL OF THESE):\n                - \"who is Albert Einstein?\" -> comprehensive biography, scientific contributions, historical context, impact on modern physics\n                - \"explain large language models\" \u2192 comprehensive analysis of architecture, training, applications, limitations, ethical considerations\n                - \"artificial intelligence\" \u2192 multi-angle research on current state, applications, future implications, ethical concerns\n                - \"climate change\" \u2192 comprehensive analysis of causes, effects, mitigation strategies, global responses\n                - \"cryptocurrency\" \u2192 deep dive into technology, economics, regulation, future prospects\n                - \"impact of remote work on urban planning and city development\"\n                - \"comprehensive analysis of CRISPR gene editing ethical implications\"\n                - \"economic and social effects of cryptocurrency adoption in developing countries\"\n                - \"climate change mitigation strategies and their effectiveness\"\n                - \"AI safety research progress and remaining challenges\"\n                - \"renewable energy transition challenges in Europe\"\n                - \"machine learning\" \u2192 comprehensive research on algorithms, applications, challenges, future directions\n                - \"blockchain technology\" \u2192 deep analysis of technical foundations, use cases, limitations, future potential\n\n                Examples that DO need clarification (ONLY THESE TYPES - extremely vague with no research direction):\n                - \"help me with my project\" (no topic specified)\n                - \"research something interesting\" (no topic specified)\n                - \"what should I write about?\" (no topic specified)\n                - \"I need help\" (no topic specified)\n\n                Query Enhancement Guidelines for broad topics:\n                - Transform single concepts into multi-dimensional research projects\n                - Add comprehensive research angles (technical, economic, social, ethical, historical, future implications)\n                - Include scope indicators (global perspective, industry analysis, current state and future trends)\n                - Suggest comparative and evolutionary elements\n                - Add temporal context when relevant (e.g., \"recent developments\", \"2024 trends\", \"historical evolution\")\n\n                EXAMPLES OF QUERY ENHANCEMENT:\n                - \"explain large language models\" \u2192 \"Comprehensive analysis of large language models: technical architecture, training methodologies, current applications, limitations, ethical considerations, and future implications for society and technology\"\n                - \"artificial intelligence\" \u2192 \"Deep research on artificial intelligence: current state of technology, major applications across industries, societal impacts, ethical considerations, regulatory challenges, and future development trends\"\n                - \"climate change\" \u2192 \"Comprehensive analysis of climate change: scientific evidence, causes and effects, global mitigation strategies, policy responses, economic implications, and future projections\"\n\n                If the user has already responded to previous clarifying questions:\n                - Return needsClarification: false\n                - Provide a refinedQuery incorporating their response\n\n                ");
                    byokKeys = context === null || context === void 0 ? void 0 : context.get("apiKeys");
                    selectedModel = selectAvailableModel(ModelEnum.GEMINI_2_5_PRO, byokKeys);
                    chatMode = context === null || context === void 0 ? void 0 : context.get("mode");
                    vtplusFeature = getVTPlusFeatureFromChatMode(chatMode);
                    return [4 /*yield*/, generateObject({
                            prompt: prompt,
                            model: selectedModel,
                            schema: ClarificationResponseSchema,
                            messages: messages,
                            signal: signal,
                            byokKeys: byokKeys,
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            feature: vtplusFeature || undefined,
                        })];
                case 1:
                    object = _d.sent();
                    if (object === null || object === void 0 ? void 0 : object.needsClarification) {
                        updateAnswer({
                            text: object.reasoning,
                            finalText: object.reasoning,
                            status: "COMPLETED",
                        });
                        (object === null || object === void 0 ? void 0 : object.clarifyingQuestion) &&
                            updateObject({
                                clarifyingQuestion: object === null || object === void 0 ? void 0 : object.clarifyingQuestion,
                            });
                        updateStatus("COMPLETED");
                    }
                    else {
                        context === null || context === void 0 ? void 0 : context.update("question", function (_current) { return (object === null || object === void 0 ? void 0 : object.refinedQuery) || question; });
                    }
                    return [2 /*return*/, {
                            needsClarification: object === null || object === void 0 ? void 0 : object.needsClarification,
                            refinedQuery: (object === null || object === void 0 ? void 0 : object.refinedQuery) || question,
                        }];
            }
        });
    }); },
    onError: handleError,
    route: function (_a) {
        var result = _a.result;
        if ((result === null || result === void 0 ? void 0 : result.needsClarification) === true) {
            return "end";
        }
        return "planner";
    },
});
