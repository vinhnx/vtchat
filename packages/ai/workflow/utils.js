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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
import { UserTier } from "@repo/shared/constants/user-tiers";
import { log } from "@repo/shared/logger";
import { formatDate } from "@repo/shared/utils";
import { ACCESS_CONTROL, getVTPlusFeatureFromChatMode, isEligibleForQuotaConsumption, } from "@repo/shared/utils/access-control";
import { extractReasoningMiddleware, generateObject as generateObjectAi, streamText, } from "ai";
import { CLAUDE_4_CONFIG, ReasoningType } from "../constants/reasoning";
import { ModelEnum } from "../models";
import { getLanguageModel } from "../providers";
import { generateErrorMessage as centralizedGenerateErrorMessage, } from "../services/error-messages";
import { generateErrorMessage } from "./tasks/utils";
var ChunkBuffer = /** @class */ (function () {
    function ChunkBuffer(options) {
        this.buffer = "";
        this.fullText = "";
        this.threshold = options.threshold;
        this.breakPatterns = options.breakOn || ["\n\n", ".", "!", "?"];
        this.onFlush = options.onFlush;
    }
    ChunkBuffer.prototype.add = function (chunk) {
        this.fullText += chunk;
        this.buffer += chunk;
        var shouldFlush = (this.threshold && this.buffer.length >= this.threshold) ||
            this.breakPatterns.some(function (pattern) { return chunk.includes(pattern) || chunk.endsWith(pattern); });
        if (shouldFlush) {
            this.flush();
        }
    };
    ChunkBuffer.prototype.flush = function () {
        if (this.buffer.length > 0) {
            this.onFlush(this.buffer, this.fullText);
            this.buffer = "";
        }
    };
    ChunkBuffer.prototype.end = function () {
        this.flush();
        this.fullText = "";
    };
    return ChunkBuffer;
}());
export { ChunkBuffer };
export var generateTextWithGeminiSearch = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var hasUserGeminiKey, hasSystemGeminiKey, isFreeGeminiModel, isVtPlusUser, windowApiKey, useSystemKey, effectiveByokKeys, selectedModel, filteredMessages, streamResult, _c, supportsReasoning, getReasoningType, providerOptions, reasoningType, streamTextConfig, user, isByokKey, streamTextWithQuota, isUsingByokKeys, VtPlusFeature, streamTextFn, error_1, ProviderErrorExtractor, errorResult, providerError, enhancedError, fullStream, fullText, _d, fullStream_1, fullStream_1_1, chunk, e_1_1, error_2, resolvedSources, groundingMetadata, error_3, metadata, error_4, reasoning, reasoningDetails, error_5, error_6, result, error_7, errorContext, errorMsg, quotaError;
    var _e, e_1, _f, _g;
    var _h, _j, _k, _l, _m, _o;
    var prompt = _b.prompt, model = _b.model, onChunk = _b.onChunk, messages = _b.messages, signal = _b.signal, byokKeys = _b.byokKeys, thinkingMode = _b.thinkingMode, userTier = _b.userTier, userId = _b.userId;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                // Add comprehensive runtime logging
                log.info("=== generateTextWithGeminiSearch START ===");
                log.info({
                    prompt: "".concat(prompt === null || prompt === void 0 ? void 0 : prompt.slice(0, 100), "..."),
                    model: model,
                    hasOnChunk: !!onChunk,
                    messagesLength: messages === null || messages === void 0 ? void 0 : messages.length,
                    hasSignal: !!signal,
                    byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
                }, "generateTextWithGeminiSearch parameters"); // Declare variables outside try block so they're available in catch block
                hasUserGeminiKey = false;
                hasSystemGeminiKey = false;
                isFreeGeminiModel = false;
                isVtPlusUser = false;
                _p.label = 1;
            case 1:
                _p.trys.push([1, 47, , 48]);
                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                    throw new Error("Operation aborted");
                }
                windowApiKey = false;
                try {
                    windowApiKey = typeof window !== "undefined" && !!((_h = window.AI_API_KEYS) === null || _h === void 0 ? void 0 : _h.google);
                }
                catch (_q) {
                    // window is not available in this environment
                    windowApiKey = false;
                }
                hasUserGeminiKey = !!((byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.GEMINI_API_KEY) && byokKeys.GEMINI_API_KEY.trim().length > 0);
                hasSystemGeminiKey = !!((typeof process !== "undefined" && ((_j = process.env) === null || _j === void 0 ? void 0 : _j.GEMINI_API_KEY)) ||
                    windowApiKey);
                // For GEMINI_2_5_FLASH_LITE model, allow using system API key when user doesn't have BYOK
                isFreeGeminiModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
                isVtPlusUser = userTier === UserTier.PLUS;
                // Handle different scenarios for API key requirements
                if (!hasUserGeminiKey && !hasSystemGeminiKey) {
                    log.warn({
                        isFreeGeminiModel: isFreeGeminiModel,
                        isVtPlusUser: isVtPlusUser,
                        hasUserGeminiKey: hasUserGeminiKey,
                        hasSystemGeminiKey: hasSystemGeminiKey,
                        environment: process.env.NODE_ENV,
                    }, "Web search failed: No API key available");
                    if (isFreeGeminiModel && !isVtPlusUser) {
                        // Free tier user with free model - require BYOK for web search
                        throw new Error("Web search requires an API key. Please add your own Gemini API key in settings for unlimited usage.");
                    }
                    if (isVtPlusUser) {
                        throw new Error("Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.");
                    }
                    throw new Error("Gemini API key is required for web search functionality");
                }
                useSystemKey = !hasUserGeminiKey && hasSystemGeminiKey && (isFreeGeminiModel || isVtPlusUser);
                log.info("API key usage decision:", {
                    hasUserKey: hasUserGeminiKey,
                    hasSystemKey: hasSystemGeminiKey,
                    isFreeModel: isFreeGeminiModel,
                    isVtPlusUser: isVtPlusUser,
                    useSystemKey: useSystemKey,
                });
                log.info("Getting language model for:", { data: model });
                effectiveByokKeys = useSystemKey ? undefined : byokKeys;
                selectedModel = getLanguageModel(model, undefined, effectiveByokKeys, true, undefined, thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.claude4InterleavedThinking, isVtPlusUser);
                log.info("Selected model result:", {
                    selectedModel: selectedModel ? "object" : selectedModel,
                    modelType: typeof selectedModel,
                    modelKeys: selectedModel ? Object.keys(selectedModel) : undefined,
                });
                if (!selectedModel) {
                    throw new Error("Failed to initialize Gemini model");
                }
                // Additional validation for the model object
                if (typeof selectedModel !== "object" || selectedModel === null) {
                    log.error("Invalid model object:", { data: selectedModel });
                    throw new Error("Invalid model configuration. Model must be a valid object.");
                }
                log.info("Preparing streamText call with:", {
                    hasMessages: !!(messages === null || messages === void 0 ? void 0 : messages.length),
                    messagesCount: messages === null || messages === void 0 ? void 0 : messages.length,
                    promptLength: prompt === null || prompt === void 0 ? void 0 : prompt.length,
                });
                filteredMessages = messages;
                if (messages === null || messages === void 0 ? void 0 : messages.length) {
                    filteredMessages = messages.filter(function (message) {
                        var hasContent = message.content &&
                            (typeof message.content === "string"
                                ? message.content.trim() !== ""
                                : Array.isArray(message.content)
                                    ? message.content.length > 0
                                    : true);
                        if (!hasContent) {
                            log.warn("Filtering out message with empty content in GeminiSearch:", {
                                role: message.role,
                                contentType: typeof message.content,
                            });
                        }
                        return hasContent;
                    });
                    log.info("GeminiSearch message filtering:", {
                        originalCount: messages.length,
                        filteredCount: filteredMessages.length,
                        removedCount: messages.length - filteredMessages.length,
                    });
                }
                streamResult = void 0;
                _p.label = 2;
            case 2:
                _p.trys.push([2, 11, , 13]);
                return [4 /*yield*/, import("../models")];
            case 3:
                _c = _p.sent(), supportsReasoning = _c.supportsReasoning, getReasoningType = _c.getReasoningType;
                providerOptions = {};
                reasoningType = getReasoningType(model);
                if (supportsReasoning(model) && (thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.enabled) && thinkingMode.budget > 0) {
                    switch (reasoningType) {
                        case ReasoningType.GEMINI_THINKING:
                            // Gemini models use thinkingConfig
                            providerOptions.google = {
                                thinkingConfig: {
                                    includeThoughts: (_k = thinkingMode.includeThoughts) !== null && _k !== void 0 ? _k : true,
                                    maxOutputTokens: thinkingMode.budget,
                                },
                            };
                            break;
                        case ReasoningType.ANTHROPIC_REASONING:
                            // Anthropic Claude 4 models support reasoning with extended thinking
                            providerOptions.anthropic = {
                                thinking: {
                                    type: "enabled",
                                    budgetTokens: CLAUDE_4_CONFIG.DEFAULT_THINKING_BUDGET,
                                },
                            };
                            break;
                        case ReasoningType.DEEPSEEK_REASONING:
                            // DeepSeek reasoning models work through middleware extraction
                            // No special provider options needed as middleware handles <think> tags
                            break;
                    }
                }
                streamTextConfig = (filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length)
                    ? __assign({ model: selectedModel, messages: __spreadArray([
                            {
                                role: "system",
                                content: prompt,
                            }
                        ], filteredMessages, true), abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions })) : __assign({ prompt: prompt, model: selectedModel, abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions }));
                log.info("StreamText config:", {
                    configType: (filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length) ? "with-messages" : "prompt-only",
                    hasSystem: !!streamTextConfig.system,
                    hasPrompt: !!streamTextConfig.prompt,
                    hasModel: !!streamTextConfig.model,
                    hasAbortSignal: !!streamTextConfig.abortSignal,
                    hasProviderOptions: Object.keys(providerOptions).length > 0,
                });
                user = { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN };
                isByokKey = !!(byokKeys && Object.keys(byokKeys).length > 0);
                if (!(userId && userTier === "PLUS" && isEligibleForQuotaConsumption(user, isByokKey))) return [3 /*break*/, 8];
                return [4 /*yield*/, import("@repo/common/lib/geminiWithQuota")];
            case 4:
                streamTextWithQuota = (_p.sent()).streamTextWithQuota;
                return [4 /*yield*/, import("@repo/common/lib/geminiWithQuota")];
            case 5:
                isUsingByokKeys = (_p.sent()).isUsingByokKeys;
                return [4 /*yield*/, import("@repo/common/config/vtPlusLimits")];
            case 6:
                VtPlusFeature = (_p.sent()).VtPlusFeature;
                return [4 /*yield*/, streamTextWithQuota(streamTextConfig, {
                        user: { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN },
                        feature: VtPlusFeature.PRO_SEARCH,
                        amount: 1,
                        isByokKey: isUsingByokKeys(byokKeys),
                    })];
            case 7:
                streamResult = _p.sent();
                return [3 /*break*/, 10];
            case 8:
                // Import streamText dynamically to ensure proper loading
                log.info("Importing streamText function...");
                return [4 /*yield*/, import("ai")];
            case 9:
                streamTextFn = (_p.sent()).streamText;
                log.info("StreamText imported successfully:", { hasFunction: typeof streamTextFn });
                // Validate model before passing to streamText
                if (!streamTextConfig.model) {
                    throw new Error("Model is required for streamText configuration");
                }
                log.info("Calling streamText with config:", {
                    hasModel: !!streamTextConfig.model,
                    modelType: typeof streamTextConfig.model,
                    configKeys: Object.keys(streamTextConfig),
                });
                streamResult = streamTextFn(streamTextConfig);
                _p.label = 10;
            case 10:
                log.info("StreamText call successful, result type:", {
                    data: typeof streamResult,
                });
                return [3 /*break*/, 13];
            case 11:
                error_1 = _p.sent();
                log.error("Error creating streamText:", { data: error_1 });
                log.error("Error stack:", { data: error_1.stack });
                return [4 /*yield*/, import("../services/provider-error-extractor")];
            case 12:
                ProviderErrorExtractor = (_p.sent()).ProviderErrorExtractor;
                errorResult = ProviderErrorExtractor.extractError(error_1, model === null || model === void 0 ? void 0 : model.provider);
                if (errorResult.success && errorResult.error) {
                    providerError = errorResult.error;
                    log.error("Provider error extracted:", {
                        provider: providerError.provider,
                        errorCode: providerError.errorCode,
                        userMessage: providerError.userMessage,
                        isRetryable: providerError.isRetryable,
                    });
                    enhancedError = new Error(providerError.userMessage);
                    enhancedError.provider = providerError.provider;
                    enhancedError.errorCode = providerError.errorCode;
                    enhancedError.isRetryable = providerError.isRetryable;
                    enhancedError.suggestedAction = providerError.suggestedAction;
                    enhancedError.originalError = providerError.originalError;
                    throw enhancedError;
                }
                // Fallback for legacy error handling
                if ((_l = error_1.message) === null || _l === void 0 ? void 0 : _l.includes("undefined to object")) {
                    throw new Error("Google Generative AI configuration error. This may be due to missing API key or invalid model configuration.");
                }
                throw error_1;
            case 13:
                if (!streamResult) {
                    log.error("StreamResult is null/undefined");
                    throw new Error("Failed to initialize text stream");
                }
                log.info("StreamResult properties:", { data: Object.keys(streamResult) });
                // Don't destructure sources and providerMetadata immediately
                log.info("Accessing fullStream...");
                fullStream = streamResult.fullStream;
                log.info("FullStream extracted:", {
                    hasFullStream: !!fullStream,
                    fullStreamType: typeof fullStream,
                });
                if (!fullStream) {
                    log.error("FullStream is null/undefined");
                    throw new Error("Failed to get fullStream from streamText result");
                }
                fullText = "";
                log.info("Starting to iterate over fullStream...");
                _p.label = 14;
            case 14:
                _p.trys.push([14, 27, , 28]);
                _p.label = 15;
            case 15:
                _p.trys.push([15, 20, 21, 26]);
                _d = true, fullStream_1 = __asyncValues(fullStream);
                _p.label = 16;
            case 16: return [4 /*yield*/, fullStream_1.next()];
            case 17:
                if (!(fullStream_1_1 = _p.sent(), _e = fullStream_1_1.done, !_e)) return [3 /*break*/, 19];
                _g = fullStream_1_1.value;
                _d = false;
                chunk = _g;
                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                    throw new Error("Operation aborted");
                }
                if (chunk.type === "text-delta") {
                    fullText += chunk.textDelta;
                    onChunk === null || onChunk === void 0 ? void 0 : onChunk(chunk.textDelta, fullText);
                }
                _p.label = 18;
            case 18:
                _d = true;
                return [3 /*break*/, 16];
            case 19: return [3 /*break*/, 26];
            case 20:
                e_1_1 = _p.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 26];
            case 21:
                _p.trys.push([21, , 24, 25]);
                if (!(!_d && !_e && (_f = fullStream_1.return))) return [3 /*break*/, 23];
                return [4 /*yield*/, _f.call(fullStream_1)];
            case 22:
                _p.sent();
                _p.label = 23;
            case 23: return [3 /*break*/, 25];
            case 24:
                if (e_1) throw e_1.error;
                return [7 /*endfinally*/];
            case 25: return [7 /*endfinally*/];
            case 26: return [3 /*break*/, 28];
            case 27:
                error_2 = _p.sent();
                log.error("Error iterating over fullStream:", { data: error_2 });
                log.error("Error stack:", { data: error_2.stack });
                throw error_2;
            case 28:
                log.info("Stream iteration completed, fullText length:", {
                    data: fullText.length,
                });
                // Safely handle potentially undefined sources and metadata
                log.info("Resolving sources and metadata...");
                resolvedSources = [];
                groundingMetadata = null;
                _p.label = 29;
            case 29:
                _p.trys.push([29, 32, , 33]);
                log.info("Checking streamResult.sources:", {
                    hasSources: !!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.sources),
                    sourcesType: typeof (streamResult === null || streamResult === void 0 ? void 0 : streamResult.sources),
                });
                if (!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.sources)) return [3 /*break*/, 31];
                return [4 /*yield*/, streamResult.sources];
            case 30:
                resolvedSources = (_p.sent()) || [];
                log.info("Sources resolved:", { data: resolvedSources.length });
                _p.label = 31;
            case 31: return [3 /*break*/, 33];
            case 32:
                error_3 = _p.sent();
                log.warn("Failed to resolve sources:", { data: error_3 });
                resolvedSources = [];
                return [3 /*break*/, 33];
            case 33:
                _p.trys.push([33, 36, , 37]);
                log.info("Checking streamResult.providerMetadata:", {
                    hasProviderMetadata: !!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.providerMetadata),
                    providerMetadataType: typeof (streamResult === null || streamResult === void 0 ? void 0 : streamResult.providerMetadata),
                });
                if (!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.providerMetadata)) return [3 /*break*/, 35];
                return [4 /*yield*/, streamResult.providerMetadata];
            case 34:
                metadata = _p.sent();
                log.info("ProviderMetadata resolved:", {
                    hasMetadata: !!metadata,
                    hasGoogle: !!(metadata === null || metadata === void 0 ? void 0 : metadata.google),
                    hasGroundingMetadata: !!((_m = metadata === null || metadata === void 0 ? void 0 : metadata.google) === null || _m === void 0 ? void 0 : _m.groundingMetadata),
                });
                groundingMetadata = ((_o = metadata === null || metadata === void 0 ? void 0 : metadata.google) === null || _o === void 0 ? void 0 : _o.groundingMetadata) || null;
                _p.label = 35;
            case 35: return [3 /*break*/, 37];
            case 36:
                error_4 = _p.sent();
                log.warn("Failed to resolve provider metadata:", { data: error_4 });
                groundingMetadata = null;
                return [3 /*break*/, 37];
            case 37:
                reasoning = "";
                reasoningDetails = [];
                _p.label = 38;
            case 38:
                _p.trys.push([38, 41, , 42]);
                if (!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.reasoning)) return [3 /*break*/, 40];
                return [4 /*yield*/, streamResult.reasoning];
            case 39:
                reasoning = (_p.sent()) || "";
                log.info("Reasoning extracted:", { data: reasoning.length });
                _p.label = 40;
            case 40: return [3 /*break*/, 42];
            case 41:
                error_5 = _p.sent();
                log.warn("Failed to resolve reasoning:", { data: error_5 });
                return [3 /*break*/, 42];
            case 42:
                _p.trys.push([42, 45, , 46]);
                if (!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.reasoningDetails)) return [3 /*break*/, 44];
                return [4 /*yield*/, streamResult.reasoningDetails];
            case 43:
                reasoningDetails = (_p.sent()) || [];
                log.info("ReasoningDetails extracted:", {
                    data: reasoningDetails.length,
                });
                _p.label = 44;
            case 44: return [3 /*break*/, 46];
            case 45:
                error_6 = _p.sent();
                log.warn("Failed to resolve reasoningDetails:", { data: error_6 });
                return [3 /*break*/, 46];
            case 46:
                result = {
                    text: fullText,
                    sources: resolvedSources,
                    groundingMetadata: groundingMetadata,
                    reasoning: reasoning,
                    reasoningDetails: reasoningDetails,
                };
                log.info("=== generateTextWithGeminiSearch END ===");
                log.info("Returning result:", {
                    textLength: result.text.length,
                    sourcesCount: result.sources.length,
                    hasGroundingMetadata: !!result.groundingMetadata,
                    hasReasoning: !!result.reasoning,
                    reasoningDetailsCount: result.reasoningDetails.length,
                });
                return [2 /*return*/, result];
            case 47:
                error_7 = _p.sent();
                log.error("Error in generateTextWithGeminiSearch:", { data: error_7 });
                errorContext = {
                    provider: "google",
                    model: model.toString(),
                    userId: userId,
                    hasApiKey: hasUserGeminiKey,
                    isVtPlus: isVtPlusUser,
                    originalError: error_7.message,
                };
                errorMsg = centralizedGenerateErrorMessage(error_7, errorContext);
                // Preserve QuotaExceededError type for proper frontend handling
                if (error_7.name === "QuotaExceededError") {
                    quotaError = new Error(errorMsg.message);
                    quotaError.name = "QuotaExceededError";
                    quotaError.cause = error_7;
                    throw quotaError;
                }
                throw new Error(errorMsg.message);
            case 48: return [2 /*return*/];
        }
    });
}); };
// Cache for generated text to prevent multiple identical requests
var textGenerationCache = new Map();
var CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// In-flight request tracking to prevent multiple concurrent requests
var inFlightRequests = new Map();
export var generateText = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var cacheKey_1, cachedResult, timestamp, result, requestPromise, error_8;
    var prompt = _b.prompt, model = _b.model, onChunk = _b.onChunk, messages = _b.messages, onReasoning = _b.onReasoning, onReasoningDetails = _b.onReasoningDetails, tools = _b.tools, onToolCall = _b.onToolCall, onToolResult = _b.onToolResult, signal = _b.signal, _c = _b.toolChoice, toolChoice = _c === void 0 ? "auto" : _c, _d = _b.maxSteps, maxSteps = _d === void 0 ? 2 : _d, byokKeys = _b.byokKeys, _e = _b.useSearchGrounding, useSearchGrounding = _e === void 0 ? false : _e, thinkingMode = _b.thinkingMode, userTier = _b.userTier, userId = _b.userId, mode = _b.mode;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 4, , 5]);
                cacheKey_1 = "generateText:".concat(model, ":").concat(prompt, ":").concat(JSON.stringify(messages || []), ":").concat(JSON.stringify(tools || {}), ":").concat(toolChoice, ":").concat(maxSteps);
                cachedResult = textGenerationCache.get(cacheKey_1);
                if (cachedResult) {
                    timestamp = cachedResult.timestamp, result = cachedResult.result;
                    if (Date.now() - timestamp < CACHE_TTL) {
                        log.info({ model: model, prompt: prompt.substring(0, 50) }, "Returning cached generateText result");
                        return [2 /*return*/, result];
                    }
                    else {
                        // Expired cache, remove it
                        textGenerationCache.delete(cacheKey_1);
                    }
                }
                if (!inFlightRequests.has(cacheKey_1)) return [3 /*break*/, 2];
                log.info({ model: model, prompt: prompt.substring(0, 50) }, "Returning existing in-flight generateText request");
                return [4 /*yield*/, inFlightRequests.get(cacheKey_1)];
            case 1: return [2 /*return*/, _f.sent()];
            case 2:
                requestPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                    var filteredMessages, _a, supportsReasoning, getReasoningType, getReasoningTagName, middleware, reasoningTagName, isGeminiModel, isVtPlusUser, hasUserGeminiKey, hasSystemGeminiKey, selectedModel, providerOptions, reasoningType, streamConfig, streamResult, user, isByokKey, vtplusFeature, requiresQuotaConsumption, streamTextWithQuota, isUsingByokKeys, VtPlusFeature, feature, error_9, ProviderErrorExtractor, errorResult, providerError, enhancedError, modelInfo, providerName, hasApiKey, fullStream, fullText, reasoning, _b, fullStream_2, fullStream_2_1, chunk, e_2_1, reasoningDetails, error_10, error_11;
                    var _c, e_2, _d, _e;
                    var _f, _g, _h, _j;
                    return __generator(this, function (_k) {
                        switch (_k.label) {
                            case 0:
                                _k.trys.push([0, 26, 27, 28]);
                                log.info({
                                    model: model.toString(),
                                    hasAnthropicKey: !!(byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.ANTHROPIC_API_KEY),
                                    anthropicKeyLength: (_f = byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.ANTHROPIC_API_KEY) === null || _f === void 0 ? void 0 : _f.length,
                                    mode: mode,
                                    userTier: userTier,
                                }, "generateText called");
                                // Debug logging for generateText
                                log.info({
                                    model: model.toString(),
                                    hasAnthropicKey: !!(byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.ANTHROPIC_API_KEY),
                                    anthropicKeyLength: (_g = byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.ANTHROPIC_API_KEY) === null || _g === void 0 ? void 0 : _g.length,
                                    mode: mode,
                                    userTier: userTier,
                                }, "🤖 generateText called");
                                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                                    throw new Error("Operation aborted");
                                }
                                filteredMessages = messages;
                                if (messages === null || messages === void 0 ? void 0 : messages.length) {
                                    filteredMessages = messages.filter(function (message) {
                                        var hasContent = message.content &&
                                            (typeof message.content === "string"
                                                ? message.content.trim() !== ""
                                                : Array.isArray(message.content)
                                                    ? message.content.length > 0
                                                    : true);
                                        return hasContent;
                                    });
                                }
                                return [4 /*yield*/, import("../models")];
                            case 1:
                                _a = _k.sent(), supportsReasoning = _a.supportsReasoning, getReasoningType = _a.getReasoningType, getReasoningTagName = _a.getReasoningTagName;
                                middleware = void 0;
                                reasoningTagName = getReasoningTagName(model);
                                if (reasoningTagName && supportsReasoning(model)) {
                                    middleware = extractReasoningMiddleware({
                                        tagName: reasoningTagName,
                                        separator: "\n",
                                    });
                                }
                                isGeminiModel = model.toString().toLowerCase().includes("gemini");
                                isVtPlusUser = userTier === UserTier.PLUS;
                                if (isGeminiModel && isVtPlusUser) {
                                    hasUserGeminiKey = (byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.GEMINI_API_KEY) && byokKeys.GEMINI_API_KEY.trim().length > 0;
                                    hasSystemGeminiKey = typeof process !== "undefined" && !!((_h = process.env) === null || _h === void 0 ? void 0 : _h.GEMINI_API_KEY);
                                    if (!hasUserGeminiKey && hasSystemGeminiKey) {
                                        // VT+ user without BYOK - use system key
                                        byokKeys = undefined;
                                        log.info("VT+ user without BYOK - using system API key for generateText");
                                    }
                                }
                                selectedModel = getLanguageModel(model, middleware, byokKeys, useSearchGrounding, undefined, thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.claude4InterleavedThinking, isVtPlusUser);
                                providerOptions = {};
                                reasoningType = getReasoningType(model);
                                if (supportsReasoning(model) && (thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.enabled) && thinkingMode.budget > 0) {
                                    switch (reasoningType) {
                                        case "gemini-thinking":
                                            // Gemini models use thinkingConfig
                                            providerOptions.google = {
                                                thinkingConfig: {
                                                    includeThoughts: (_j = thinkingMode.includeThoughts) !== null && _j !== void 0 ? _j : true,
                                                    maxOutputTokens: thinkingMode.budget,
                                                },
                                            };
                                            break;
                                        case "anthropic-reasoning":
                                            // Anthropic Claude 4 models support reasoning through beta features
                                            providerOptions.anthropic = {
                                                reasoning: true,
                                            };
                                            break;
                                        case "deepseek-reasoning":
                                            // DeepSeek reasoning models work through middleware extraction
                                            // No special provider options needed as middleware handles <think> tags
                                            break;
                                    }
                                }
                                streamConfig = (filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length)
                                    ? __assign({ model: selectedModel, messages: __spreadArray([
                                            {
                                                role: "system",
                                                content: prompt,
                                            }
                                        ], filteredMessages, true), tools: tools, maxSteps: maxSteps, toolChoice: toolChoice, abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions })) : __assign({ prompt: prompt, model: selectedModel, tools: tools, maxSteps: maxSteps, toolChoice: toolChoice, abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions }));
                                streamResult = void 0;
                                user = { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN };
                                isByokKey = !!(byokKeys && Object.keys(byokKeys).length > 0);
                                vtplusFeature = getVTPlusFeatureFromChatMode(mode);
                                requiresQuotaConsumption = userId &&
                                    userTier === "PLUS" &&
                                    isEligibleForQuotaConsumption(user, isByokKey) &&
                                    vtplusFeature !== null;
                                if (!requiresQuotaConsumption) return [3 /*break*/, 6];
                                return [4 /*yield*/, import("@repo/common/lib/geminiWithQuota")];
                            case 2:
                                streamTextWithQuota = (_k.sent()).streamTextWithQuota;
                                return [4 /*yield*/, import("@repo/common/lib/geminiWithQuota")];
                            case 3:
                                isUsingByokKeys = (_k.sent()).isUsingByokKeys;
                                return [4 /*yield*/, import("@repo/common/config/vtPlusLimits")];
                            case 4:
                                VtPlusFeature = (_k.sent()).VtPlusFeature;
                                feature = vtplusFeature === "DR"
                                    ? VtPlusFeature.DEEP_RESEARCH
                                    : VtPlusFeature.PRO_SEARCH;
                                return [4 /*yield*/, streamTextWithQuota(streamConfig, {
                                        user: { id: userId, planSlug: ACCESS_CONTROL.VT_PLUS_PLAN },
                                        feature: feature,
                                        amount: 1,
                                        isByokKey: isUsingByokKeys(byokKeys),
                                    })];
                            case 5:
                                streamResult = _k.sent();
                                return [3 /*break*/, 9];
                            case 6:
                                _k.trys.push([6, 7, , 9]);
                                streamResult = streamText(streamConfig);
                                return [3 /*break*/, 9];
                            case 7:
                                error_9 = _k.sent();
                                log.error("Error in streamText call:", { error: error_9.message });
                                return [4 /*yield*/, import("../services/provider-error-extractor")];
                            case 8:
                                ProviderErrorExtractor = (_k.sent()).ProviderErrorExtractor;
                                errorResult = ProviderErrorExtractor.extractError(error_9, model === null || model === void 0 ? void 0 : model.provider);
                                if (errorResult.success && errorResult.error) {
                                    providerError = errorResult.error;
                                    log.error("Provider error extracted:", {
                                        provider: providerError.provider,
                                        errorCode: providerError.errorCode,
                                        userMessage: providerError.userMessage,
                                        isRetryable: providerError.isRetryable,
                                    });
                                    enhancedError = new Error(providerError.userMessage);
                                    enhancedError.provider = providerError.provider;
                                    enhancedError.errorCode = providerError.errorCode;
                                    enhancedError.isRetryable = providerError.isRetryable;
                                    enhancedError.suggestedAction = providerError.suggestedAction;
                                    enhancedError.originalError = providerError.originalError;
                                    throw enhancedError;
                                }
                                // Fallback to more descriptive error message if we can determine the provider
                                if (model) {
                                    modelInfo = models.find(function (m) { return m.id === model; });
                                    if (modelInfo) {
                                        providerName = modelInfo.provider;
                                        hasApiKey = byokKeys && Object.keys(byokKeys).length > 0;
                                        if (!hasApiKey) {
                                            throw new Error("API key required for ".concat(modelInfo.name, ". Please add your ").concat(providerName, " API key in Settings."));
                                        }
                                    }
                                }
                                throw error_9;
                            case 9:
                                fullStream = streamResult.fullStream;
                                fullText = "";
                                reasoning = "";
                                _k.label = 10;
                            case 10:
                                _k.trys.push([10, 15, 16, 21]);
                                _b = true, fullStream_2 = __asyncValues(fullStream);
                                _k.label = 11;
                            case 11: return [4 /*yield*/, fullStream_2.next()];
                            case 12:
                                if (!(fullStream_2_1 = _k.sent(), _c = fullStream_2_1.done, !_c)) return [3 /*break*/, 14];
                                _e = fullStream_2_1.value;
                                _b = false;
                                chunk = _e;
                                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                                    throw new Error("Operation aborted");
                                }
                                if (chunk.type === "text-delta") {
                                    fullText += chunk.textDelta;
                                    onChunk === null || onChunk === void 0 ? void 0 : onChunk(chunk.textDelta, fullText);
                                }
                                if (chunk.type === "reasoning") {
                                    reasoning += chunk.textDelta;
                                    onReasoning === null || onReasoning === void 0 ? void 0 : onReasoning(chunk.textDelta, reasoning);
                                }
                                if (chunk.type === "tool-call") {
                                    onToolCall === null || onToolCall === void 0 ? void 0 : onToolCall(chunk);
                                }
                                if (chunk.type === "tool-result") {
                                    onToolResult === null || onToolResult === void 0 ? void 0 : onToolResult(chunk);
                                }
                                if (chunk.type === "error") {
                                    log.error(chunk.error);
                                    return [2 /*return*/, Promise.reject(chunk.error)];
                                }
                                _k.label = 13;
                            case 13:
                                _b = true;
                                return [3 /*break*/, 11];
                            case 14: return [3 /*break*/, 21];
                            case 15:
                                e_2_1 = _k.sent();
                                e_2 = { error: e_2_1 };
                                return [3 /*break*/, 21];
                            case 16:
                                _k.trys.push([16, , 19, 20]);
                                if (!(!_b && !_c && (_d = fullStream_2.return))) return [3 /*break*/, 18];
                                return [4 /*yield*/, _d.call(fullStream_2)];
                            case 17:
                                _k.sent();
                                _k.label = 18;
                            case 18: return [3 /*break*/, 20];
                            case 19:
                                if (e_2) throw e_2.error;
                                return [7 /*endfinally*/];
                            case 20: return [7 /*endfinally*/];
                            case 21:
                                _k.trys.push([21, 24, , 25]);
                                if (!(streamResult === null || streamResult === void 0 ? void 0 : streamResult.reasoningDetails)) return [3 /*break*/, 23];
                                return [4 /*yield*/, streamResult.reasoningDetails];
                            case 22:
                                reasoningDetails = (_k.sent()) || [];
                                if (reasoningDetails.length > 0) {
                                    onReasoningDetails === null || onReasoningDetails === void 0 ? void 0 : onReasoningDetails(reasoningDetails);
                                }
                                _k.label = 23;
                            case 23: return [3 /*break*/, 25];
                            case 24:
                                error_10 = _k.sent();
                                log.warn("Failed to resolve reasoningDetails:", { data: error_10 });
                                return [3 /*break*/, 25];
                            case 25:
                                // Cache the result before returning
                                textGenerationCache.set(cacheKey_1, {
                                    timestamp: Date.now(),
                                    result: fullText,
                                });
                                return [2 /*return*/, fullText];
                            case 26:
                                error_11 = _k.sent();
                                log.error("Error in generateText:", error_11);
                                throw error_11;
                            case 27:
                                // Remove the in-flight request when done
                                inFlightRequests.delete(cacheKey_1);
                                return [7 /*endfinally*/];
                            case 28: return [2 /*return*/];
                        }
                    });
                }); })();
                // Store the in-flight request
                inFlightRequests.set(cacheKey_1, requestPromise);
                return [4 /*yield*/, requestPromise];
            case 3: 
            // Wait for the request to complete and return the result
            return [2 /*return*/, _f.sent()];
            case 4:
                error_8 = _f.sent();
                log.error(error_8);
                return [2 /*return*/, Promise.reject(error_8)];
            case 5: return [2 /*return*/];
        }
    });
}); };
export var generateObject = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var filteredMessages, _c, supportsReasoning, getReasoningType, isGeminiModel, isVtPlusUser, isFreeGeminiModel, hasUserGeminiKey, hasSystemGeminiKey, selectedModel, providerOptions, reasoningType, generateConfig, consumeQuota, VtPlusFeature, vtPlusFeature, object, error_12, errorContext, errorMsg, quotaError;
    var _d, _e;
    var prompt = _b.prompt, model = _b.model, schema = _b.schema, messages = _b.messages, signal = _b.signal, byokKeys = _b.byokKeys, thinkingMode = _b.thinkingMode, userTier = _b.userTier, userId = _b.userId, feature = _b.feature;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 7, , 8]);
                if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                    throw new Error("Operation aborted");
                }
                log.info("=== generateObject START ===");
                log.info("Input parameters:", {
                    prompt: "".concat(prompt === null || prompt === void 0 ? void 0 : prompt.slice(0, 100), "..."),
                    model: model,
                    hasSchema: !!schema,
                    messagesLength: messages === null || messages === void 0 ? void 0 : messages.length,
                    hasSignal: !!signal,
                    byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
                });
                filteredMessages = messages;
                if (messages === null || messages === void 0 ? void 0 : messages.length) {
                    filteredMessages = messages.filter(function (message) {
                        var hasContent = message.content &&
                            (typeof message.content === "string"
                                ? message.content.trim() !== ""
                                : Array.isArray(message.content)
                                    ? message.content.length > 0
                                    : true);
                        if (!hasContent) {
                            log.warn("Filtering out message with empty content:", {
                                role: message.role,
                                contentType: typeof message.content,
                                contentLength: Array.isArray(message.content)
                                    ? message.content.length
                                    : typeof message.content === "string"
                                        ? message.content.length
                                        : 0,
                            });
                        }
                        return hasContent;
                    });
                    log.info("Message filtering:", {
                        originalCount: messages.length,
                        filteredCount: filteredMessages.length,
                        removedCount: messages.length - filteredMessages.length,
                    });
                }
                return [4 /*yield*/, import("../models")];
            case 1:
                _c = _f.sent(), supportsReasoning = _c.supportsReasoning, getReasoningType = _c.getReasoningType;
                isGeminiModel = model.toString().toLowerCase().includes("gemini");
                isVtPlusUser = userTier === UserTier.PLUS;
                isFreeGeminiModel = model === ModelEnum.GEMINI_2_5_FLASH_LITE;
                if (isGeminiModel) {
                    hasUserGeminiKey = (byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys.GEMINI_API_KEY) && byokKeys.GEMINI_API_KEY.trim().length > 0;
                    hasSystemGeminiKey = typeof process !== "undefined" && !!((_d = process.env) === null || _d === void 0 ? void 0 : _d.GEMINI_API_KEY);
                    // Handle different scenarios for API key requirements
                    if (!hasUserGeminiKey && !hasSystemGeminiKey) {
                        if (isFreeGeminiModel && !isVtPlusUser) {
                            // Free tier user with free model - require BYOK for planning
                            throw new Error("Planning requires an API key. Please add your own Gemini API key in settings for unlimited usage.");
                        }
                        if (isVtPlusUser) {
                            throw new Error("Planning is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.");
                        }
                        throw new Error("Gemini API key is required for planning functionality");
                    }
                    // Use system key when available and user doesn't have BYOK
                    if (!hasUserGeminiKey && hasSystemGeminiKey) {
                        byokKeys = undefined;
                        log.info("Using system API key for generateObject");
                    }
                }
                selectedModel = getLanguageModel(model, undefined, byokKeys, undefined, undefined, thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.claude4InterleavedThinking, isVtPlusUser);
                log.info("Selected model for generateObject:", {
                    hasModel: !!selectedModel,
                    modelType: typeof selectedModel,
                });
                providerOptions = {};
                reasoningType = getReasoningType(model);
                if (supportsReasoning(model) && (thinkingMode === null || thinkingMode === void 0 ? void 0 : thinkingMode.enabled) && thinkingMode.budget > 0) {
                    switch (reasoningType) {
                        case ReasoningType.GEMINI_THINKING:
                            // Gemini models use thinkingConfig
                            providerOptions.google = {
                                thinkingConfig: {
                                    includeThoughts: (_e = thinkingMode.includeThoughts) !== null && _e !== void 0 ? _e : true,
                                    maxOutputTokens: thinkingMode.budget,
                                },
                            };
                            break;
                        case ReasoningType.ANTHROPIC_REASONING:
                            // Anthropic Claude 4 models support reasoning through beta features
                            providerOptions.anthropic = {
                                reasoning: true,
                            };
                            break;
                        case ReasoningType.DEEPSEEK_REASONING:
                            // DeepSeek reasoning models work through middleware extraction
                            // No special provider options needed as middleware handles <think> tags
                            break;
                    }
                }
                log.info("Calling generateObjectAi with:", {
                    configType: (filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length) ? "with-messages" : "prompt-only",
                    hasPrompt: !!prompt,
                    hasSchema: !!schema,
                    messagesCount: filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length,
                    hasProviderOptions: Object.keys(providerOptions).length > 0,
                });
                generateConfig = (filteredMessages === null || filteredMessages === void 0 ? void 0 : filteredMessages.length)
                    ? __assign({ model: selectedModel, schema: schema, messages: __spreadArray([
                            {
                                role: "system",
                                content: prompt,
                            }
                        ], filteredMessages, true), abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions })) : __assign({ prompt: prompt, model: selectedModel, schema: schema, abortSignal: signal }, (Object.keys(providerOptions).length > 0 && { providerOptions: providerOptions }));
                if (!(userId && userTier === "PLUS" && !byokKeys && feature)) return [3 /*break*/, 5];
                return [4 /*yield*/, import("@repo/common/lib/vtplusRateLimiter")];
            case 2:
                consumeQuota = (_f.sent()).consumeQuota;
                return [4 /*yield*/, import("@repo/common/config/vtPlusLimits")];
            case 3:
                VtPlusFeature = (_f.sent()).VtPlusFeature;
                vtPlusFeature = feature === "DR"
                    ? VtPlusFeature.DEEP_RESEARCH
                    : feature === "PS"
                        ? VtPlusFeature.PRO_SEARCH
                        : null;
                if (!vtPlusFeature) return [3 /*break*/, 5];
                log.info({
                    userId: userId,
                    feature: vtPlusFeature,
                    amount: 1,
                }, "Consuming VT+ quota for generateObject");
                return [4 /*yield*/, consumeQuota({
                        userId: userId,
                        feature: vtPlusFeature,
                        amount: 1,
                    })];
            case 4:
                _f.sent();
                _f.label = 5;
            case 5: return [4 /*yield*/, generateObjectAi(generateConfig)];
            case 6:
                object = (_f.sent()).object;
                log.info("generateObjectAi successful, result:", {
                    hasObject: !!object,
                    objectType: typeof object,
                });
                log.info("=== generateObject END ===");
                return [2 /*return*/, JSON.parse(JSON.stringify(object))];
            case 7:
                error_12 = _f.sent();
                log.error("Error in generateObject:", {
                    error: error_12 instanceof Error ? error_12.message : String(error_12),
                    stack: error_12 instanceof Error ? error_12.stack : undefined,
                    data: error_12,
                });
                errorContext = {
                    provider: model.toString().toLowerCase().includes("gemini")
                        ? "google"
                        : model.toString().toLowerCase().includes("claude")
                            ? "anthropic"
                            : model.toString().toLowerCase().includes("gpt")
                                ? "openai"
                                : undefined,
                    model: model.toString(),
                    userId: userId,
                    hasApiKey: !!(byokKeys && Object.keys(byokKeys).length > 0),
                    isVtPlus: userTier === UserTier.PLUS,
                    originalError: error_12.message,
                };
                errorMsg = centralizedGenerateErrorMessage(error_12, errorContext);
                // Preserve QuotaExceededError type for proper frontend handling
                if (error_12.name === "QuotaExceededError") {
                    quotaError = new Error(errorMsg.message);
                    quotaError.name = "QuotaExceededError";
                    quotaError.cause = error_12;
                    throw quotaError;
                }
                throw new Error(errorMsg.message);
            case 8: return [2 /*return*/];
        }
    });
}); };
var EventEmitter = /** @class */ (function () {
    function EventEmitter(initialState) {
        this.listeners = new Map();
        this.state = {};
        this.state = initialState || {};
    }
    EventEmitter.prototype.on = function (event, callback) {
        var _a;
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        (_a = this.listeners.get(event)) === null || _a === void 0 ? void 0 : _a.push(callback);
        return this;
    };
    EventEmitter.prototype.off = function (event, callback) {
        var callbacks = this.listeners.get(event);
        if (callbacks) {
            var index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
        return this;
    };
    EventEmitter.prototype.emit = function (event, data) {
        var callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(function (callback) { return callback(data); });
        }
        return this;
    };
    EventEmitter.prototype.getState = function () {
        return __assign({}, this.state);
    };
    EventEmitter.prototype.updateState = function (key, updater) {
        this.state[key] = updater(this.state[key]);
        return this;
    };
    return EventEmitter;
}());
export { EventEmitter };
export function createEventManager(initialState, _schema) {
    var emitter = new EventEmitter(initialState);
    return {
        on: emitter.on.bind(emitter),
        off: emitter.off.bind(emitter),
        emit: emitter.emit.bind(emitter),
        getState: emitter.getState.bind(emitter),
        update: function (key, value) {
            var updater = typeof value === "function"
                ? value
                : function () { return value; };
            emitter.updateState(key, updater);
            emitter.emit("stateChange", {
                key: key,
                value: emitter.getState()[key],
            });
            return emitter.getState();
        },
    };
}
export var getHumanizedDate = function () {
    return formatDate(new Date(), "MMMM dd, yyyy, h:mm a");
};
export var getWebPageContent = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var result, title, description, sourceUrl, content, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, readURL(url)];
            case 1:
                result = _a.sent();
                title = (result === null || result === void 0 ? void 0 : result.title) ? "# ".concat(result.title, "\n\n") : "";
                description = (result === null || result === void 0 ? void 0 : result.description)
                    ? "".concat(result.description, "\n\n ").concat(result.markdown, "\n\n")
                    : "";
                sourceUrl = (result === null || result === void 0 ? void 0 : result.url) ? "Source: [".concat(result.url, "](").concat(result.url, ")\n\n") : "";
                content = (result === null || result === void 0 ? void 0 : result.markdown) || "";
                if (!content)
                    return [2 /*return*/, ""];
                return [2 /*return*/, "".concat(title).concat(description).concat(content).concat(sourceUrl)];
            case 2:
                error_13 = _a.sent();
                log.error(error_13);
                return [2 /*return*/, "No Result Found for ".concat(url)];
            case 3: return [2 /*return*/];
        }
    });
}); };
var processContent = function (content, maxLength) {
    if (maxLength === void 0) { maxLength = 10000; }
    if (!content)
        return "";
    var chunks = content.split("\n\n");
    var result = "";
    for (var _i = 0, chunks_1 = chunks; _i < chunks_1.length; _i++) {
        var chunk = chunks_1[_i];
        if ((result + chunk).length > maxLength)
            break;
        result += "".concat(chunk, "\n\n");
    }
    return result.trim();
};
var fetchWithJina = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var response, data, error_14;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("https://r.jina.ai/".concat(url), {
                        method: "GET",
                        headers: {
                            Authorization: "Bearer ".concat(process.env.JINA_API_KEY),
                            Accept: "application/json",
                            "X-Engine": "browser",
                            // 'X-Md-Link-Style': 'referenced',
                            "X-No-Cache": "true",
                            "X-Retain-Images": "none",
                            "X-Return-Format": "markdown",
                            "X-Robots-Txt": "JinaReader",
                            // 'X-With-Links-Summary': 'true',
                        },
                        signal: AbortSignal.timeout(15000),
                    })];
            case 1:
                response = _b.sent();
                if (!response.ok) {
                    throw new Error("Jina API responded with status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
            case 2:
                data = _b.sent();
                if (!((_a = data.data) === null || _a === void 0 ? void 0 : _a.content)) {
                    return [2 /*return*/, { success: false, error: "No content found" }];
                }
                return [2 /*return*/, {
                        success: true,
                        title: data.data.title,
                        description: data.data.description,
                        url: data.data.url,
                        markdown: processContent(data.data.content),
                        source: "jina",
                    }];
            case 3:
                error_14 = _b.sent();
                return [2 /*return*/, {
                        success: false,
                        error: error_14 instanceof Error ? error_14.message : "Unknown error",
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var readURL = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                if (!process.env.JINA_API_KEY) return [3 /*break*/, 2];
                return [4 /*yield*/, fetchWithJina(url)];
            case 1: return [2 /*return*/, _a.sent()];
            case 2:
                log.info("No Jina API key found");
                return [2 /*return*/, { success: false }];
            case 3:
                error_15 = _a.sent();
                log.error("Error in readURL:", { data: error_15 });
                return [2 /*return*/, {
                        success: false,
                        error: error_15 instanceof Error ? error_15.message : "Unknown error",
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
export var processWebPages = function (results_1, signal_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([results_1, signal_1], args_1, true), void 0, function (results, signal, options) {
        var processedResults, timeoutSignal, combinedSignal, abortHandler, timeoutAbortHandler, startTime, i, batch, batchPromises, batchResults, validResults, error_16;
        if (options === void 0) { options = { batchSize: 4, maxPages: 8, timeout: 30000 }; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    processedResults = [];
                    timeoutSignal = AbortSignal.timeout(options.timeout);
                    combinedSignal = new AbortController();
                    abortHandler = function () { return combinedSignal.abort(); };
                    timeoutAbortHandler = function () { return combinedSignal.abort(); };
                    signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", abortHandler);
                    timeoutSignal.addEventListener("abort", timeoutAbortHandler);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    startTime = Date.now();
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < results.length)) return [3 /*break*/, 5];
                    if (processedResults.length >= options.maxPages)
                        return [3 /*break*/, 5];
                    if (combinedSignal.signal.aborted)
                        return [3 /*break*/, 5];
                    if (Date.now() - startTime > options.timeout)
                        return [3 /*break*/, 5];
                    batch = results.slice(i, i + options.batchSize);
                    batchPromises = batch.map(function (result) {
                        return getWebPageContent(result.link)
                            .then(function (content) { return ({
                            title: result.title,
                            link: result.link,
                            content: content,
                        }); })
                            .catch(function () { return null; });
                    });
                    return [4 /*yield*/, Promise.all(batchPromises)];
                case 3:
                    batchResults = _a.sent();
                    validResults = batchResults.filter(function (r) { return r !== null; });
                    processedResults.push.apply(processedResults, validResults);
                    _a.label = 4;
                case 4:
                    i += options.batchSize;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, processedResults.slice(0, options.maxPages)];
                case 6:
                    error_16 = _a.sent();
                    log.error("Error in processWebPages:", { data: error_16 });
                    return [2 /*return*/, processedResults.slice(0, options.maxPages)];
                case 7:
                    // Clean up event listeners to prevent memory leaks
                    signal === null || signal === void 0 ? void 0 : signal.removeEventListener("abort", abortHandler);
                    timeoutSignal.removeEventListener("abort", timeoutAbortHandler);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
};
export var handleError = function (error, _a) {
    var events = _a.events;
    var errorMessage = generateErrorMessage(error);
    log.error("Task failed", { data: error });
    events === null || events === void 0 ? void 0 : events.update("error", function (prev) { return (__assign(__assign({}, prev), { error: errorMessage, status: "ERROR" })); });
    return Promise.resolve({
        retry: false,
        result: "error",
    });
};
export var sendEvents = function (events) {
    var nextStepId = function () { return Object.keys((events === null || events === void 0 ? void 0 : events.getState("steps")) || {}).length; };
    var updateStep = function (params) {
        var stepId = params.stepId, text = params.text, stepStatus = params.stepStatus, subSteps = params.subSteps;
        events === null || events === void 0 ? void 0 : events.update("steps", function (prev) {
            var _a;
            var _b, _c;
            return (__assign(__assign({}, prev), (_a = {}, _a[stepId] = __assign(__assign({}, prev === null || prev === void 0 ? void 0 : prev[stepId]), { id: stepId, text: text || ((_b = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _b === void 0 ? void 0 : _b.text), status: stepStatus, steps: __assign(__assign({}, (_c = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _c === void 0 ? void 0 : _c.steps), Object.entries(subSteps).reduce(function (acc, _a) {
                    var _b;
                    var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
                    var key = _a[0], value = _a[1];
                    return __assign(__assign({}, acc), (_b = {}, _b[key] = __assign(__assign(__assign({}, (_d = (_c = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _c === void 0 ? void 0 : _c.steps) === null || _d === void 0 ? void 0 : _d[key]), value), { data: Array.isArray(value === null || value === void 0 ? void 0 : value.data)
                            ? __spreadArray(__spreadArray([], (((_g = (_f = (_e = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _e === void 0 ? void 0 : _e.steps) === null || _f === void 0 ? void 0 : _f[key]) === null || _g === void 0 ? void 0 : _g.data) || []), true), value.data, true) : typeof (value === null || value === void 0 ? void 0 : value.data) === "object"
                            ? __assign(__assign({}, (_k = (_j = (_h = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _h === void 0 ? void 0 : _h.steps) === null || _j === void 0 ? void 0 : _j[key]) === null || _k === void 0 ? void 0 : _k.data), value.data) : (value === null || value === void 0 ? void 0 : value.data)
                            ? value.data
                            : (_o = (_m = (_l = prev === null || prev === void 0 ? void 0 : prev[stepId]) === null || _l === void 0 ? void 0 : _l.steps) === null || _m === void 0 ? void 0 : _m[key]) === null || _o === void 0 ? void 0 : _o.data }), _b));
                }, {})) }), _a)));
        });
    };
    var addSources = function (sources) {
        events === null || events === void 0 ? void 0 : events.update("sources", function (prev) {
            var newSources = sources === null || sources === void 0 ? void 0 : sources.filter(function (result) { return !(prev === null || prev === void 0 ? void 0 : prev.some(function (source) { return source.link === result.link; })); }).map(function (result, index) { return ({
                title: result === null || result === void 0 ? void 0 : result.title,
                link: result === null || result === void 0 ? void 0 : result.link,
                snippet: result === null || result === void 0 ? void 0 : result.snippet,
                index: index + ((prev === null || prev === void 0 ? void 0 : prev.length) || 1),
            }); });
            return __spreadArray(__spreadArray([], (prev || []), true), newSources, true);
        });
    };
    var updateAnswer = function (_a) {
        var text = _a.text, finalText = _a.finalText, status = _a.status;
        events === null || events === void 0 ? void 0 : events.update("answer", function (prev) { return (__assign(__assign({}, prev), { text: text || (prev === null || prev === void 0 ? void 0 : prev.text), finalText: finalText || (prev === null || prev === void 0 ? void 0 : prev.finalText), status: status || (prev === null || prev === void 0 ? void 0 : prev.status) })); });
    };
    var updateStatus = function (status) {
        events === null || events === void 0 ? void 0 : events.update("status", function (_prev) { return status; });
    };
    var updateObject = function (object) {
        events === null || events === void 0 ? void 0 : events.update("object", function (_prev) { return object; });
    };
    return {
        updateStep: updateStep,
        addSources: addSources,
        updateAnswer: updateAnswer,
        nextStepId: nextStepId,
        updateStatus: updateStatus,
        updateObject: updateObject,
    };
};
/**
 * Selects an appropriate model based on available API keys
 * Provides fallback mechanism when primary model isn't available
 */
export var selectAvailableModel = function (preferredModel, byokKeys) {
    var _a;
    log.info("=== selectAvailableModel START ===");
    // Safe window/self checks for debugging
    var hasSelfApiKeys = false;
    var hasWindowApiKeys = false;
    try {
        hasSelfApiKeys = typeof self !== "undefined" && !!self.AI_API_KEYS;
    }
    catch (_b) {
        // self not available
    }
    try {
        hasWindowApiKeys = typeof window !== "undefined" && !!window.AI_API_KEYS;
    }
    catch (_c) {
        // window not available
    }
    log.info("Input:", {
        preferredModel: preferredModel,
        availableKeys: byokKeys ? Object.keys(byokKeys).filter(function (key) { return byokKeys[key]; }) : [],
        byokKeys: byokKeys ? Object.keys(byokKeys) : undefined,
        hasSelf: typeof self !== "undefined",
        hasWindow: (function () {
            try {
                return typeof window !== "undefined";
            }
            catch (_a) {
                return false;
            }
        })(),
        hasSelfApiKeys: hasSelfApiKeys,
        hasWindowApiKeys: hasWindowApiKeys,
    });
    // Check if preferred model's provider has an API key
    var hasApiKeyForModel = function (model) {
        var _a;
        var providers = (_a = {},
            // Gemini models
            _a[ModelEnum.GEMINI_2_5_FLASH] = "GEMINI_API_KEY",
            _a[ModelEnum.GEMINI_2_5_FLASH_LITE] = "GEMINI_API_KEY",
            _a[ModelEnum.GEMINI_2_5_PRO] = "GEMINI_API_KEY",
            // OpenAI models
            _a[ModelEnum.GPT_5] = "OPENAI_API_KEY",
            _a[ModelEnum.GPT_4o_Mini] = "OPENAI_API_KEY",
            _a[ModelEnum.GPT_4o] = "OPENAI_API_KEY",
            _a[ModelEnum.GPT_4_1] = "OPENAI_API_KEY",
            _a[ModelEnum.GPT_4_1_Mini] = "OPENAI_API_KEY",
            _a[ModelEnum.GPT_4_1_Nano] = "OPENAI_API_KEY",
            _a[ModelEnum.O1] = "OPENAI_API_KEY",
            _a[ModelEnum.O1_MINI] = "OPENAI_API_KEY",
            _a[ModelEnum.O3] = "OPENAI_API_KEY",
            _a[ModelEnum.O3_Mini] = "OPENAI_API_KEY",
            _a[ModelEnum.O4_Mini] = "OPENAI_API_KEY",
            // Anthropic models
            _a[ModelEnum.CLAUDE_4_1_OPUS] = "ANTHROPIC_API_KEY",
            _a[ModelEnum.CLAUDE_4_SONNET] = "ANTHROPIC_API_KEY",
            _a[ModelEnum.CLAUDE_4_OPUS] = "ANTHROPIC_API_KEY",
            // Fireworks models
            _a[ModelEnum.DEEPSEEK_R1_FIREWORKS] = "FIREWORKS_API_KEY",
            _a[ModelEnum.KIMI_K2_INSTRUCT_FIREWORKS] = "FIREWORKS_API_KEY",
            // xAI models
            _a[ModelEnum.GROK_3] = "XAI_API_KEY",
            _a[ModelEnum.GROK_3_MINI] = "XAI_API_KEY",
            _a[ModelEnum.GROK_4] = "XAI_API_KEY",
            // OpenRouter models
            _a[ModelEnum.DEEPSEEK_V3_0324] = "OPENROUTER_API_KEY",
            _a[ModelEnum.DEEPSEEK_R1] = "OPENROUTER_API_KEY",
            _a[ModelEnum.QWEN3_235B_A22B] = "OPENROUTER_API_KEY",
            _a[ModelEnum.QWEN3_32B] = "OPENROUTER_API_KEY",
            _a[ModelEnum.MISTRAL_NEMO] = "OPENROUTER_API_KEY",
            _a[ModelEnum.QWEN3_14B] = "OPENROUTER_API_KEY",
            _a[ModelEnum.KIMI_K2] = "OPENROUTER_API_KEY",
            _a[ModelEnum.GPT_OSS_120B] = "OPENROUTER_API_KEY",
            _a[ModelEnum.GPT_OSS_20B] = "OPENROUTER_API_KEY",
            _a);
        var requiredApiKey = providers[model];
        if (!requiredApiKey)
            return false;
        var apiKey = byokKeys === null || byokKeys === void 0 ? void 0 : byokKeys[requiredApiKey];
        return !!(apiKey && apiKey.trim().length > 0);
    };
    // Try preferred model first
    if (hasApiKeyForModel(preferredModel)) {
        log.info("Using preferred model:", { data: preferredModel });
        return preferredModel;
    }
    // Fallback priority list - most reliable and cost-effective models first
    var fallbackModels = [
        ModelEnum.GEMINI_2_5_FLASH_LITE, // Free Gemini model
        ModelEnum.GEMINI_2_5_FLASH, // Newer Gemini
        ModelEnum.GPT_5, // GPT-5 as top priority for OpenAI models
        ModelEnum.GPT_4o, // More expensive but reliable
        ModelEnum.GPT_4o_Mini, // Most cost-effective OpenAI model
        ModelEnum.CLAUDE_4_SONNET, // Anthropic fallback
    ];
    for (var _i = 0, fallbackModels_1 = fallbackModels; _i < fallbackModels_1.length; _i++) {
        var model = fallbackModels_1[_i];
        if (hasApiKeyForModel(model)) {
            log.info("Using fallback model:", { data: model });
            return model;
        }
    }
    // Check if we have server-funded keys available for free models
    var hasServerFundedGeminiKey = typeof process !== "undefined" && !!((_a = process.env) === null || _a === void 0 ? void 0 : _a.GEMINI_API_KEY);
    if (hasServerFundedGeminiKey) {
        log.info("Using server-funded Gemini model");
        return ModelEnum.GEMINI_2_5_FLASH_LITE;
    }
    log.warn("No API key found for any model, will fail with clear error message");
    // Return the preferred model to let the provider give a clear error message
    return preferredModel;
};
