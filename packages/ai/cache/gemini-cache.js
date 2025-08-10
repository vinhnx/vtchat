/**
 * Gemini Explicit Caching Implementation
 *
 * Provides cost-effective caching for Gemini 2.5 and 2.0 models using GoogleAICacheManager.
 * This feature is exclusive to VT+ subscribers.
 */
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
import { GoogleAICacheManager } from "@google/generative-ai/server";
import { log } from "@repo/shared/logger";
/**
 * Cache manager wrapper for Gemini explicit caching
 */
var GeminiCacheManager = /** @class */ (function () {
    function GeminiCacheManager(apiKey) {
        this.cacheManager = new GoogleAICacheManager(apiKey);
    }
    /**
     * Get singleton instance of cache manager
     */
    GeminiCacheManager.getInstance = function (apiKey) {
        if (!GeminiCacheManager.instance) {
            GeminiCacheManager.instance = new GeminiCacheManager(apiKey);
        }
        return GeminiCacheManager.instance;
    };
    /**
     * Create a new cache entry
     */
    GeminiCacheManager.prototype.createCache = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedContent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cacheManager.create({
                                model: config.model,
                                contents: config.contents,
                                ttlSeconds: config.ttlSeconds,
                            })];
                    case 1:
                        cachedContent = (_a.sent()).name;
                        return [2 /*return*/, cachedContent];
                    case 2:
                        error_1 = _a.sent();
                        log.error("Failed to create Gemini cache:", { data: error_1 });
                        throw new Error("Gemini cache creation failed");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * List all cached contents
     */
    GeminiCacheManager.prototype.listCaches = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cacheManager.list()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        log.error("Failed to list Gemini caches:", { data: error_2 });
                        throw new Error("Failed to retrieve cache list");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete a cached content by name
     */
    GeminiCacheManager.prototype.deleteCache = function (cacheName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cacheManager.delete(cacheName)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        log.error("Failed to delete Gemini cache:", { data: error_3 });
                        throw new Error("Failed to delete cache");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a cached content by name
     */
    GeminiCacheManager.prototype.getCache = function (cacheName) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.cacheManager.get(cacheName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        log.error("Failed to get Gemini cache:", { data: error_4 });
                        throw new Error("Failed to retrieve cache");
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return GeminiCacheManager;
}());
export { GeminiCacheManager };
/**
 * Check if a model supports explicit caching
 */
export function isModelCacheable(modelId) {
    var cacheableModels = [
        "models/gemini-2.5-pro",
        "models/gemini-2.5-flash",
        "models/gemini-1.5-flash-001",
        "models/gemini-1.5-pro-001",
    ];
    return cacheableModels.includes(modelId);
}
/**
 * Convert VTChat model enum to cacheable model ID
 */
export function getGeminiCacheableModelId(modelEnum) {
    switch (modelEnum) {
        case "gemini-2.5-pro":
            return "models/gemini-2.5-pro";
        case "gemini-2.5-flash":
            return "models/gemini-2.5-flash";
        case "gemini-2.5-flash-lite":
            return "models/gemini-2.5-flash-lite";
        default:
            return null;
    }
}
/**
 * Default cache settings for VT+ users
 */
export var DEFAULT_CACHE_SETTINGS = {
    /** Default TTL: 5 minutes */
    DEFAULT_TTL_SECONDS: 300,
    /** Maximum TTL: 1 hour */
    MAX_TTL_SECONDS: 3600,
    /** Minimum TTL: 1 minute */
    MIN_TTL_SECONDS: 60,
    /** Maximum number of cached conversations per user */
    MAX_CACHED_CONVERSATIONS: 10,
};
