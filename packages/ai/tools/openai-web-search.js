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
import { openai } from "@ai-sdk/openai";
import { log } from "@repo/shared/lib/logger";
import { generateText, tool } from "ai";
import { z } from "zod";
// Cache for web search results to prevent multiple identical requests
var webSearchCache = new Map();
var CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// In-flight request tracking to prevent multiple concurrent requests for the same query
var inFlightRequests = new Map();
/**
 * OpenAI Web Search Tool using the Responses API
 *
 * This tool provides web search capabilities using OpenAI's built-in web_search_preview tool
 * available through the Responses API. It requires OpenAI models that support the Responses API.
 *
 * @example
 * ```ts
 * import { openaiWebSearchTool } from '@repo/ai/tools/openai-web-search';
 *
 * const tools = {
 *   web_search: openaiWebSearchTool(),
 * };
 * ```
 */
export var openaiWebSearchTool = function () {
    return tool({
        description: "Search the web for current information and return relevant results with sources",
        parameters: z.object({
            query: z.string().describe("The search query to find information about"),
        }),
        execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var cacheKey_1, cachedResult, timestamp, result_1, requestPromise, result, error_1;
            var query = _b.query;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        cacheKey_1 = "openai-web-search:".concat(query);
                        cachedResult = webSearchCache.get(cacheKey_1);
                        if (cachedResult) {
                            timestamp = cachedResult.timestamp, result_1 = cachedResult.result;
                            if (Date.now() - timestamp < CACHE_TTL) {
                                log.info({ query: query }, "Returning cached OpenAI web search result");
                                return [2 /*return*/, result_1];
                            }
                            else {
                                // Expired cache, remove it
                                webSearchCache.delete(cacheKey_1);
                            }
                        }
                        if (!inFlightRequests.has(cacheKey_1)) return [3 /*break*/, 2];
                        log.info({ query: query }, "Returning existing in-flight OpenAI web search request");
                        return [4 /*yield*/, inFlightRequests.get(cacheKey_1)];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2:
                        requestPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, text, sources, validSources, result_2, error_2;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, generateText({
                                                model: openai.responses("gpt-4o-mini"),
                                                prompt: query,
                                                tools: {
                                                    web_search_preview: openai.tools.webSearchPreview(),
                                                },
                                            })];
                                    case 1:
                                        _a = _b.sent(), text = _a.text, sources = _a.sources;
                                        // Add detailed logging for debugging source issues
                                        log.info({
                                            query: query,
                                            sourcesReceived: (sources === null || sources === void 0 ? void 0 : sources.length) || 0,
                                            sourcesData: (sources === null || sources === void 0 ? void 0 : sources.map(function (source) {
                                                var _a;
                                                return ({
                                                    title: source === null || source === void 0 ? void 0 : source.title,
                                                    url: source === null || source === void 0 ? void 0 : source.url,
                                                    snippet: ((_a = source === null || source === void 0 ? void 0 : source.snippet) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + "...",
                                                });
                                            })) || [],
                                        }, "OpenAI web search sources received");
                                        validSources = (sources || []).filter(function (source) {
                                            var _a;
                                            var hasValidUrl = (source === null || source === void 0 ? void 0 : source.url) &&
                                                typeof source.url === "string" &&
                                                source.url.trim().length > 0;
                                            if (!hasValidUrl) {
                                                log.warn({
                                                    source: source,
                                                    hasUrl: !!(source === null || source === void 0 ? void 0 : source.url),
                                                    urlType: typeof (source === null || source === void 0 ? void 0 : source.url),
                                                    urlLength: ((_a = source === null || source === void 0 ? void 0 : source.url) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                                }, "Invalid source detected - missing or invalid URL");
                                            }
                                            return hasValidUrl;
                                        });
                                        log.info({
                                            originalCount: (sources === null || sources === void 0 ? void 0 : sources.length) || 0,
                                            validCount: validSources.length,
                                            filteredOut: ((sources === null || sources === void 0 ? void 0 : sources.length) || 0) - validSources.length,
                                        }, "Source validation results");
                                        result_2 = {
                                            success: true,
                                            text: text,
                                            sources: validSources,
                                            query: query,
                                        };
                                        // Cache the result
                                        webSearchCache.set(cacheKey_1, {
                                            timestamp: Date.now(),
                                            result: result_2,
                                        });
                                        return [2 /*return*/, result_2];
                                    case 2:
                                        error_2 = _b.sent();
                                        log.error({ error: error_2 }, "Error in OpenAI web search");
                                        throw error_2;
                                    case 3:
                                        // Remove the in-flight request when done
                                        inFlightRequests.delete(cacheKey_1);
                                        return [7 /*endfinally*/];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })();
                        // Store the in-flight request
                        inFlightRequests.set(cacheKey_1, requestPromise);
                        return [4 /*yield*/, requestPromise];
                    case 3:
                        result = _c.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_1.message || "Failed to perform web search",
                                query: query,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        }); },
    });
};
/**
 * Checks if a model supports OpenAI's Responses API web search
 * Currently available for GPT-4o Mini and other supported models
 */
export var supportsOpenAIWebSearch = function (modelId) {
    var supportedModels = ["gpt-4o-mini", "gpt-4o"];
    return supportedModels.includes(modelId);
};
/**
 * Advanced web search with custom model selection for Responses API
 */
export var openaiWebSearchWithModel = function (modelId) {
    if (modelId === void 0) { modelId = "gpt-4o-mini"; }
    return tool({
        description: "Search the web using OpenAI's ".concat(modelId, " model with built-in web search capabilities"),
        parameters: z.object({
            query: z.string().describe("The search query to find information about"),
            maxResults: z
                .number()
                .optional()
                .describe("Maximum number of results to return (if supported)"),
        }),
        execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var cacheKey_2, cachedResult, timestamp, result_3, requestPromise, result, error_3;
            var query = _b.query, maxResults = _b.maxResults;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        cacheKey_2 = "openai-web-search-".concat(modelId, ":").concat(query, ":").concat(maxResults);
                        cachedResult = webSearchCache.get(cacheKey_2);
                        if (cachedResult) {
                            timestamp = cachedResult.timestamp, result_3 = cachedResult.result;
                            if (Date.now() - timestamp < CACHE_TTL) {
                                log.info({ query: query, modelId: modelId }, "Returning cached OpenAI web search result with model");
                                return [2 /*return*/, result_3];
                            }
                            else {
                                // Expired cache, remove it
                                webSearchCache.delete(cacheKey_2);
                            }
                        }
                        if (!inFlightRequests.has(cacheKey_2)) return [3 /*break*/, 2];
                        log.info({ query: query, modelId: modelId }, "Returning existing in-flight OpenAI web search request with model");
                        return [4 /*yield*/, inFlightRequests.get(cacheKey_2)];
                    case 1: return [2 /*return*/, _c.sent()];
                    case 2:
                        if (!supportsOpenAIWebSearch(modelId)) {
                            throw new Error("Model ".concat(modelId, " does not support OpenAI Responses API web search"));
                        }
                        requestPromise = (function () { return __awaiter(void 0, void 0, void 0, function () {
                            var _a, text, sources, result_4, error_4;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, 3, 4]);
                                        return [4 /*yield*/, generateText({
                                                model: openai.responses(modelId),
                                                prompt: query,
                                                tools: {
                                                    web_search_preview: openai.tools.webSearchPreview(),
                                                },
                                                maxSteps: 5, // Allow multiple search steps if needed
                                            })];
                                    case 1:
                                        _a = _b.sent(), text = _a.text, sources = _a.sources;
                                        result_4 = {
                                            success: true,
                                            text: text,
                                            sources: sources || [],
                                            query: query,
                                            modelUsed: modelId,
                                            maxResults: maxResults,
                                        };
                                        // Cache the result
                                        webSearchCache.set(cacheKey_2, {
                                            timestamp: Date.now(),
                                            result: result_4,
                                        });
                                        return [2 /*return*/, result_4];
                                    case 2:
                                        error_4 = _b.sent();
                                        log.error({ modelId: modelId, error: error_4 }, "Error in OpenAI web search with model ".concat(modelId));
                                        throw error_4;
                                    case 3:
                                        // Remove the in-flight request when done
                                        inFlightRequests.delete(cacheKey_2);
                                        return [7 /*endfinally*/];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); })();
                        // Store the in-flight request
                        inFlightRequests.set(cacheKey_2, requestPromise);
                        return [4 /*yield*/, requestPromise];
                    case 3:
                        result = _c.sent();
                        return [2 /*return*/, result];
                    case 4:
                        error_3 = _c.sent();
                        return [2 /*return*/, {
                                success: false,
                                error: error_3.message || "Failed to perform web search",
                                query: query,
                                modelUsed: modelId,
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        }); },
    });
};
