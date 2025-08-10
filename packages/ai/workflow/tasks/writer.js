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
import { formatDate } from "@repo/shared/utils";
import { getFormattingInstructions } from "../../config/formatting-guidelines";
import { getModelFromChatMode, ModelEnum } from "../../models";
import { ContentMonitor } from "../../utils/content-monitor";
import { ChunkBuffer, generateText, handleError, selectAvailableModel, sendEvents } from "../utils";
export var writerTask = createTask({
    name: "writer",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var analysis, question, summaries, messages, _c, updateStep, nextStepId, updateAnswer, updateStatus, stepId, currentDate, humanizedDate, prompt, contentMonitor, fullContent, chunkBuffer, mode, baseModel, model, answer;
        var _d;
        var events = _b.events, context = _b.context, data = _b.data, signal = _b.signal;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    analysis = (data === null || data === void 0 ? void 0 : data.analysis) || "";
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    summaries = (context === null || context === void 0 ? void 0 : context.get("summaries")) || [];
                    messages = (context === null || context === void 0 ? void 0 : context.get("messages")) || [];
                    _c = sendEvents(events), updateStep = _c.updateStep, nextStepId = _c.nextStepId, updateAnswer = _c.updateAnswer, updateStatus = _c.updateStatus;
                    stepId = nextStepId();
                    currentDate = new Date();
                    humanizedDate = formatDate(currentDate, "MMMM dd, yyyy, h:mm a");
                    prompt = "\n\n    Today is ".concat(humanizedDate, ".\nYou are a Comprehensive Research Writer tasked with providing an extremely detailed and thorough writing about \"").concat(question, "\".\nYour goal is to create a comprehensive report based on the research information provided.\n\nFirst, carefully read and analyze the following research information:\n\n<research_findings>\n").concat(summaries.map(function (summary) { return "<finding>".concat(summary, "</finding>"); }).join("\n"), "\n</research_findings>\n\n<analysis>\n").concat(analysis, "\n</analysis>\n\n## Report Requirements:\n1. Structure and Organization:\n   - Begin with a concise executive summary highlighting key developments\n   - Organize content thematically with clear progression between topics, Group related information into coherent categories\n   - Use a consistent hierarchical structure throughout\n   - Conclude with analytical insights identifying patterns, implications, and future directions\n\n2. Content and Analysis:\n   - Provide specific details, data points, and technical information where relevant\n   - Analyze the significance of key findings within the broader context\n   - Make connections between related information across different sources\n   - Maintain an objective, analytical tone throughout\n\n\n3. Formatting Standards:\n   - Highlight key figures, critical statistics, and significant findings with bold text\n   - Construct balanced continuous paragraphs (4-5 sentences per paragraph not more than that) with logical flow instead of shorter sentences.\n   - Use headings strategically only for thematic shifts depending on the question asked and content\n   - Ensure proper spacing between sections for optimal readability\n\n4. Citations:\n   - Based on provided references in each findings, you must cite the sources in the report.\n   - Use inline citations like [1] to reference the source\n   - For example: According to recent findings [1][3], progress in this area has accelerated\n   - When information appears in multiple findings, cite all relevant findings using multiple numbers\n   - Integrate citations naturally without disrupting reading flow\n\nNote: **Reference list at the end is not required.**\n\n").concat(getFormattingInstructions("writer"), "\n    ");
                    if (stepId) {
                        updateStep({
                            stepId: stepId + 1,
                            stepStatus: "COMPLETED",
                            subSteps: {
                                wrapup: { status: "COMPLETED" },
                            },
                        });
                    }
                    contentMonitor = new ContentMonitor({
                        onStuckDetected: function (content, issue) {
                            updateAnswer({
                                text: "\n\n**Note**: Switching to alternative formatting to improve readability...\n\n",
                                status: "PENDING",
                            });
                        },
                    });
                    fullContent = "";
                    chunkBuffer = new ChunkBuffer({
                        threshold: 150,
                        breakOn: ["\n\n", ".", "!", "?"],
                        onFlush: function (text) {
                            fullContent += text;
                            // Monitor content for issues
                            var check = contentMonitor.checkContent(fullContent);
                            if (check.isStuck && check.suggestion) {
                                // Add suggestion to help redirect the AI
                                text += "\n\n*[Formatting note: ".concat(check.suggestion, "]*\n\n");
                            }
                            updateAnswer({
                                text: text,
                                status: "PENDING",
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
                            onChunk: function (chunk, _fullText) {
                                chunkBuffer.add(chunk);
                            },
                        })];
                case 1:
                    answer = _e.sent();
                    // Make sure to flush any remaining content
                    chunkBuffer.flush();
                    updateAnswer({
                        text: "",
                        finalText: answer,
                        status: "COMPLETED",
                    });
                    (_d = context === null || context === void 0 ? void 0 : context.get("onFinish")) === null || _d === void 0 ? void 0 : _d({
                        answer: answer,
                        threadId: context === null || context === void 0 ? void 0 : context.get("threadId"),
                        threadItemId: context === null || context === void 0 ? void 0 : context.get("threadItemId"),
                    });
                    updateStatus("COMPLETED");
                    context === null || context === void 0 ? void 0 : context.update("answer", function (_) { return answer; });
                    return [2 /*return*/, answer];
            }
        });
    }); },
    onError: handleError,
    route: function (_a) {
        var context = _a.context;
        if ((context === null || context === void 0 ? void 0 : context.get("showSuggestions")) && !!(context === null || context === void 0 ? void 0 : context.get("answer"))) {
            return "suggestions";
        }
        return "end";
    },
});
