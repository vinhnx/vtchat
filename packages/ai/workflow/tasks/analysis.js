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
import { ChatMode } from "@repo/shared/config";
import { getFormattingInstructions } from "../../config/formatting-guidelines";
import { getModelFromChatMode, ModelEnum } from "../../models";
import { ChunkBuffer, generateText, getHumanizedDate, handleError, selectAvailableModel, sendEvents, } from "../utils";
export var analysisTask = createTask({
    name: "analysis",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var messages, question, prevSummaries, _c, updateStep, nextStepId, addSources, stepId, prompt, chunkBuffer, mode, baseModel, model, text;
        var events = _b.events, context = _b.context, signal = _b.signal;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    messages = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    prevSummaries = (context === null || context === void 0 ? void 0 : context.get("summaries")) || [];
                    _c = sendEvents(events), updateStep = _c.updateStep, nextStepId = _c.nextStepId, addSources = _c.addSources;
                    stepId = nextStepId();
                    prompt = "\n\n\n                # Research Analysis Framework\n\nToday is ".concat(getHumanizedDate(), ".\n\nYou are a Research Analyst tasked with thoroughly analyzing findings related to \"").concat(question, "\" before composing a comprehensive report.\n\nYou gonna perform pre-writing analysis of the research findings.\n\n\n## Research Materials\n\n<research_findings>\n").concat(prevSummaries === null || prevSummaries === void 0 ? void 0 : prevSummaries.map(function (s, index) { return "\n\n## Finding ".concat(index + 1, "\n\n").concat(s, "\n\n"); }).join("\n\n\n"), "\n</research_findings>\n\n\n## Analysis Instructions\n- Analyze the research findings one by one and highlight the most important information which will be used to compose a comprehensive report.\n- Document your analysis in a structured format that will serve as the foundation for creating a comprehensive report.\n\n").concat(getFormattingInstructions("analysis"), "\n\n                ");
                    chunkBuffer = new ChunkBuffer({
                        threshold: 200,
                        breakOn: ["\n\n"],
                        onFlush: function (chunk, fullText) {
                            updateStep({
                                stepId: stepId,
                                stepStatus: "PENDING",
                                text: chunk,
                                subSteps: {
                                    reasoning: { status: "PENDING", data: fullText },
                                },
                            });
                        },
                    });
                    mode = (context === null || context === void 0 ? void 0 : context.get("mode")) || "";
                    baseModel = mode === ChatMode.Deep ? ModelEnum.GEMINI_2_5_PRO : getModelFromChatMode(mode);
                    model = selectAvailableModel(baseModel, context === null || context === void 0 ? void 0 : context.get("apiKeys"));
                    return [4 /*yield*/, generateText({
                            prompt: prompt,
                            model: model,
                            messages: messages,
                            signal: signal,
                            byokKeys: context === null || context === void 0 ? void 0 : context.get("apiKeys"),
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: context === null || context === void 0 ? void 0 : context.get("userTier"),
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                            mode: context === null || context === void 0 ? void 0 : context.get("mode"),
                            onReasoning: function (reasoning) {
                                chunkBuffer.add(reasoning);
                            },
                            onReasoningDetails: function (details) {
                                updateStep({
                                    stepId: stepId,
                                    stepStatus: "COMPLETED",
                                    subSteps: {
                                        reasoningDetails: {
                                            status: "COMPLETED",
                                            data: details,
                                        },
                                    },
                                });
                            },
                        })];
                case 1:
                    text = _d.sent();
                    chunkBuffer.flush();
                    updateStep({
                        stepId: stepId,
                        stepStatus: "COMPLETED",
                        subSteps: {
                            reasoning: { status: "COMPLETED" },
                        },
                    });
                    addSources((context === null || context === void 0 ? void 0 : context.get("sources")) || []);
                    return [2 /*return*/, {
                            queries: [],
                            analysis: text,
                            stepId: stepId,
                        }];
            }
        });
    }); },
    onError: handleError,
    route: function () { return "writer"; },
});
