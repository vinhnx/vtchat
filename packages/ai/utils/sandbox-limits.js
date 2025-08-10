/**
 * E2B Sandbox Rate Limiting and Premium Gating Utilities
 * Implements cost-efficient sandbox management for VT Chat
 */
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
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
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "../../../apps/web/lib/database";
import { sandboxUsage } from "../../../apps/web/lib/database/schema";
// Rate limiting constants based on E2B documentation
var RATE_LIMITS = {
    VT_PLUS: {
        dailyLimit: 2, // 2 successful sandbox runs per day
        maxConcurrent: 1, // 1 concurrent sandbox to minimize costs
        maxTimeoutMinutes: 30, // Max 30 minutes to control costs
    },
    VT_FREE: {
        dailyLimit: 0, // No access for free users
        maxConcurrent: 0,
        maxTimeoutMinutes: 0,
    },
};
/**
 * Check if user has VT+ subscription
 * Throws error if user is not VT+ subscriber
 */
export function requireVTPlusUser() {
    return __awaiter(this, void 0, void 0, function () {
        var userTier;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUserTier()];
                case 1:
                    userTier = _a.sent();
                    if (userTier !== "VT_PLUS") {
                        throw new Error("VT+ required: Sandbox feature is only available for VT+ subscribers. Upgrade to access secure code execution.");
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check sandbox rate limits for the current user
 * Throws error if daily limit exceeded
 */
export function checkSandboxRateLimit() {
    return __awaiter(this, void 0, void 0, function () {
        var userId, today, usageToday, todayCount;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getCurrentUserId()];
                case 1:
                    userId = _b.sent();
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, db
                            .select({ count: sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(sandboxUsage)
                            .where(and(eq(sandboxUsage.userId, userId), eq(sandboxUsage.success, true), gte(sandboxUsage.createdAt, today)))];
                case 2:
                    usageToday = _b.sent();
                    todayCount = ((_a = usageToday[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                    if (todayCount >= RATE_LIMITS.VT_PLUS.dailyLimit) {
                        throw new Error("Daily sandbox limit reached (".concat(todayCount, "/").concat(RATE_LIMITS.VT_PLUS.dailyLimit, "). Limit resets at midnight UTC."));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Track successful sandbox usage
 * Increments the daily counter
 */
export function trackSandboxUsage() {
    return __awaiter(this, void 0, void 0, function () {
        var userId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCurrentUserId()];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, db.insert(sandboxUsage).values({
                            userId: userId,
                            success: true,
                            createdAt: new Date(),
                            metadata: {
                                source: "vtchat-ai-tool",
                                tier: "VT_PLUS",
                            },
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get current user's subscription tier
 * This should integrate with your existing user/subscription system
 */
function getUserTier() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Implement actual user tier checking
            // This should check the user's subscription status from your database
            // For now, returning VT_PLUS for development
            return [2 /*return*/, "VT_PLUS"];
        });
    });
}
/**
 * Get current user ID from context
 * This should integrate with your existing auth system
 */
function getCurrentUserId() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // TODO: Implement actual user ID retrieval
            // This should get the user ID from the current request context
            // For now, returning a placeholder
            return [2 /*return*/, "current-user-id"];
        });
    });
}
/**
 * Get sandbox usage statistics for the current user
 */
export function getSandboxUsageStats() {
    return __awaiter(this, void 0, void 0, function () {
        var userId, today, usageToday, todayCount, dailyLimit;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getCurrentUserId()];
                case 1:
                    userId = _b.sent();
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, db
                            .select({ count: sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["count(*)"], ["count(*)"]))) })
                            .from(sandboxUsage)
                            .where(and(eq(sandboxUsage.userId, userId), eq(sandboxUsage.success, true), gte(sandboxUsage.createdAt, today)))];
                case 2:
                    usageToday = _b.sent();
                    todayCount = ((_a = usageToday[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                    dailyLimit = RATE_LIMITS.VT_PLUS.dailyLimit;
                    return [2 /*return*/, {
                            todayUsage: todayCount,
                            dailyLimit: dailyLimit,
                            remainingToday: Math.max(0, dailyLimit - todayCount),
                        }];
            }
        });
    });
}
var templateObject_1, templateObject_2;
