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
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/lib/logger";
import { getModelFromChatMode, ModelEnum } from "../../models";
import { generateTextWithGeminiSearch, getHumanizedDate, handleError, sendEvents } from "../utils";
export var geminiWebSearchTask = createTask({
    name: "gemini-web-search",
    execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var question, stepId, gl, updateStep, mode, isProSearch, prompt, userTier, userApiKeys, isVtPlusUser, model, result_1, error_1, userTier, userApiKeys, model, isFreeModel, hasUserApiKey, hasSystemApiKey, isVtPlusUser;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var data = _b.data, events = _b.events, context = _b.context, signal = _b.signal;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    question = (context === null || context === void 0 ? void 0 : context.get("question")) || "";
                    stepId = data === null || data === void 0 ? void 0 : data.stepId;
                    gl = context === null || context === void 0 ? void 0 : context.get("gl");
                    updateStep = sendEvents(events).updateStep;
                    mode = (context === null || context === void 0 ? void 0 : context.get("mode")) || "gemini-2.5-flash-lite-preview-06-17";
                    isProSearch = mode === "pro";
                    prompt = isProSearch
                        ? "You are conducting a PRO SEARCH - an advanced, intelligent web search with enhanced grounding capabilities.\n\n**Research Question**: \"".concat(question, "\"\n\n**Current Context**:\n- Date: ").concat(getHumanizedDate(), "\n").concat((gl === null || gl === void 0 ? void 0 : gl.country) ? "- Location: ".concat(gl === null || gl === void 0 ? void 0 : gl.country) : "", "\n\n**Pro Search Instructions**:\n1. **Multi-angle Analysis**: Search from multiple perspectives and angles\n2. **Deep Fact-checking**: Cross-reference information across multiple sources\n3. **Current Information Priority**: Focus on the most recent and up-to-date information\n4. **Expert Sources**: Prioritize authoritative, expert, and official sources\n5. **Comprehensive Coverage**: Provide thorough analysis with nuanced insights\n6. **Source Quality**: Include high-quality citations with credibility assessment\n\n**Deliverables**:\n- Comprehensive, well-researched answer with multiple viewpoints\n- Recent developments and current status\n- Expert opinions and authoritative sources\n- Fact-checked information with source credibility notes\n- Actionable insights where applicable")
                        : "Please search for and provide comprehensive information to answer this question: \"".concat(question, "\"\n\nThe current date is: ").concat(getHumanizedDate(), "\n").concat((gl === null || gl === void 0 ? void 0 : gl.country) ? "Location: ".concat(gl === null || gl === void 0 ? void 0 : gl.country) : "", "\n\nPlease include:\n- Current and relevant information\n- Specific facts and recent developments\n- Source citations when available\n- A comprehensive answer that directly addresses the question");
                    _p.label = 1;
                case 1:
                    _p.trys.push([1, 3, , 4]);
                    userTier = (context === null || context === void 0 ? void 0 : context.get("userTier")) || UserTier.FREE;
                    userApiKeys = (context === null || context === void 0 ? void 0 : context.get("apiKeys")) || {};
                    isVtPlusUser = userTier === UserTier.PLUS;
                    log.info("=== gemini-web-search EXECUTE START ===");
                    log.info("Chat mode:", { data: mode });
                    log.info("User tier:", { userTier: userTier, isVtPlusUser: isVtPlusUser });
                    log.info("Search type:", {
                        isProSearch: isProSearch,
                        searchCapabilities: isProSearch ? "Enhanced Pro Search" : "Basic Web Search",
                    });
                    log.info("Context data:", {
                        hasQuestion: !!question,
                        questionLength: question === null || question === void 0 ? void 0 : question.length,
                        hasStepId: stepId !== undefined,
                        hasGl: !!gl,
                        hasApiKeys: !!userApiKeys,
                        apiKeysKeys: userApiKeys ? Object.keys(userApiKeys) : undefined,
                        isVtPlusUser: isVtPlusUser,
                    });
                    model = getModelFromChatMode(mode);
                    log.info("Selected model result:", {
                        model: model,
                        modelType: typeof model,
                    });
                    if (!model) {
                        log.error("No model found for mode:", { data: mode });
                        throw new Error("Invalid model for mode: ".concat(mode));
                    }
                    log.info("Calling generateTextWithGeminiSearch with:", {
                        model: model,
                        promptLength: prompt.length,
                        hasByokKeys: !!userApiKeys,
                        hasSignal: !!signal,
                        isVtPlusUser: isVtPlusUser,
                        hasUserApiKey: !!userApiKeys.GEMINI_API_KEY,
                    });
                    return [4 /*yield*/, generateTextWithGeminiSearch({
                            model: model,
                            prompt: prompt,
                            byokKeys: userApiKeys,
                            signal: signal,
                            thinkingMode: context === null || context === void 0 ? void 0 : context.get("thinkingMode"),
                            userTier: userTier,
                            userId: context === null || context === void 0 ? void 0 : context.get("userId"),
                        })];
                case 2:
                    result_1 = _p.sent();
                    log.info("generateTextWithGeminiSearch result:", {
                        hasResult: !!result_1,
                        hasText: !!(result_1 === null || result_1 === void 0 ? void 0 : result_1.text),
                        textLength: (_c = result_1 === null || result_1 === void 0 ? void 0 : result_1.text) === null || _c === void 0 ? void 0 : _c.length,
                        hasSources: !!(result_1 === null || result_1 === void 0 ? void 0 : result_1.sources),
                        sourcesLength: (_d = result_1 === null || result_1 === void 0 ? void 0 : result_1.sources) === null || _d === void 0 ? void 0 : _d.length,
                        hasGroundingMetadata: !!(result_1 === null || result_1 === void 0 ? void 0 : result_1.groundingMetadata),
                    });
                    // Update sources if available with proper deduplication
                    if (result_1.sources && result_1.sources.length > 0) {
                        context === null || context === void 0 ? void 0 : context.update("sources", function (current) {
                            var _a;
                            var existingSources = current !== null && current !== void 0 ? current : [];
                            // Filter out duplicates within the new sources first
                            var uniqueNewSources = [];
                            var seenUrls = new Set(existingSources.map(function (source) { return source.link; }));
                            for (var _i = 0, _b = result_1.sources || []; _i < _b.length; _i++) {
                                var source = _b[_i];
                                if ((source === null || source === void 0 ? void 0 : source.url) &&
                                    typeof source.url === "string" &&
                                    source.url.trim() !== "" &&
                                    !seenUrls.has(source.url)) {
                                    seenUrls.add(source.url);
                                    uniqueNewSources.push(source);
                                }
                            }
                            var newSources = uniqueNewSources.map(function (source, index) { return ({
                                title: source.title || "Web Search Result",
                                link: source.url,
                                snippet: source.description || "",
                                index: index + ((existingSources === null || existingSources === void 0 ? void 0 : existingSources.length) || 0) + 1,
                            }); });
                            log.info({
                                existingCount: existingSources.length,
                                originalNewCount: ((_a = result_1.sources) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                filteredNewCount: (newSources === null || newSources === void 0 ? void 0 : newSources.length) || 0,
                                totalCount: (existingSources.length || 0) + ((newSources === null || newSources === void 0 ? void 0 : newSources.length) || 0),
                            }, "Updated sources from Gemini web search with deduplication");
                            return __spreadArray(__spreadArray([], existingSources, true), newSources, true);
                        });
                    }
                    context === null || context === void 0 ? void 0 : context.update("summaries", function (current) { return __spreadArray(__spreadArray([], (current !== null && current !== void 0 ? current : []), true), [result_1.text], false); });
                    // Mark step as completed
                    if (stepId !== undefined) {
                        updateStep({
                            stepId: stepId,
                            stepStatus: "COMPLETED",
                            text: "Web search completed successfully",
                            subSteps: {},
                        });
                    }
                    log.info("=== gemini-web-search EXECUTE END ===");
                    return [2 /*return*/, {
                            stepId: stepId,
                            summary: result_1.text,
                            sources: result_1.sources,
                            groundingMetadata: result_1.groundingMetadata,
                        }];
                case 3:
                    error_1 = _p.sent();
                    userTier = (context === null || context === void 0 ? void 0 : context.get("userTier")) || UserTier.FREE;
                    userApiKeys = (context === null || context === void 0 ? void 0 : context.get("apiKeys")) || {};
                    model = getModelFromChatMode(mode);
                    log.error("=== gemini-web-search ERROR ===");
                    log.error("Error details:", {
                        message: error_1.message,
                        name: error_1.name,
                        stack: error_1.stack,
                        errorType: typeof error_1,
                    });
                    // Mark step as failed if there's an error
                    if (stepId !== undefined) {
                        updateStep({
                            stepId: stepId,
                            stepStatus: "COMPLETED",
                            text: "Web search failed: ".concat(error_1.message || "Unknown error"),
                            subSteps: {},
                        });
                    }
                    isFreeModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
                    hasUserApiKey = userApiKeys === null || userApiKeys === void 0 ? void 0 : userApiKeys.GEMINI_API_KEY;
                    hasSystemApiKey = !!process.env.GEMINI_API_KEY;
                    isVtPlusUser = userTier === UserTier.PLUS;
                    // Log detailed error information for debugging
                    log.error({
                        error: error_1.message,
                        model: model,
                        isFreeModel: isFreeModel,
                        hasUserApiKey: !!hasUserApiKey,
                        hasSystemApiKey: hasSystemApiKey,
                        isVtPlusUser: isVtPlusUser,
                        environment: process.env.NODE_ENV,
                        errorType: error_1.constructor.name,
                    }, "Web search failed with detailed context");
                    if ((_e = error_1.message) === null || _e === void 0 ? void 0 : _e.includes("Web search requires an API key")) {
                        // Free user needs to provide their own API key for web search
                        throw new Error("Web search requires an API key. Please add your own Gemini API key in settings for unlimited usage.");
                    }
                    if ((_f = error_1.message) === null || _f === void 0 ? void 0 : _f.includes("API key")) {
                        if (isVtPlusUser && !hasUserApiKey && !hasSystemApiKey) {
                            throw new Error("Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.");
                        }
                        if (isFreeModel && !hasUserApiKey) {
                            throw new Error("Web search requires an API key. You can either:\n1. Add your own Gemini API key in settings for unlimited usage\n2. Try again later if you've reached the daily limit for free usage");
                        }
                        throw new Error("Gemini API key is required for web search. Please configure your API key in settings.");
                    }
                    if (((_g = error_1.message) === null || _g === void 0 ? void 0 : _g.includes("unauthorized")) || ((_h = error_1.message) === null || _h === void 0 ? void 0 : _h.includes("401"))) {
                        if (isVtPlusUser && !hasUserApiKey) {
                            throw new Error("Web search service encountered an authentication issue. Please add your own Gemini API key in settings for unlimited usage.");
                        }
                        if (isFreeModel && !hasUserApiKey) {
                            throw new Error("Free web search limit reached. Add your own Gemini API key in settings for unlimited usage.");
                        }
                        throw new Error("Invalid Gemini API key. Please check your API key in settings.");
                    }
                    if (((_j = error_1.message) === null || _j === void 0 ? void 0 : _j.includes("forbidden")) || ((_k = error_1.message) === null || _k === void 0 ? void 0 : _k.includes("403"))) {
                        throw new Error("Gemini API access denied. Please check your API key permissions.");
                    }
                    if (((_l = error_1.message) === null || _l === void 0 ? void 0 : _l.includes("rate limit")) || ((_m = error_1.message) === null || _m === void 0 ? void 0 : _m.includes("429"))) {
                        if (isVtPlusUser && !hasUserApiKey) {
                            throw new Error("Web search rate limit reached. Add your own Gemini API key in settings for unlimited usage.");
                        }
                        if (isFreeModel && !hasUserApiKey) {
                            throw new Error("Daily free web search limit reached. Add your own Gemini API key in settings for unlimited usage.");
                        }
                        throw new Error("Gemini API rate limit exceeded. Please try again in a few moments.");
                    }
                    if ((_o = error_1.message) === null || _o === void 0 ? void 0 : _o.includes("undefined to object")) {
                        throw new Error("Web search configuration error. Please try using a different model or check your settings.");
                    }
                    throw new Error("Web search failed: ".concat(error_1.message || "Please try again or use a different model."));
                case 4: return [2 /*return*/];
            }
        });
    }); },
    onError: handleError,
    route: function () { return "analysis"; },
});
