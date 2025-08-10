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
import { log } from "@repo/shared/lib/logger";
/**
 * Validates web search configuration for production environment
 */
export function validateWebSearchConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var errors, warnings, recommendations, environment, isProduction, hasGeminiKey, hasJinaKey, geminiKey, isValid, result;
        return __generator(this, function (_a) {
            errors = [];
            warnings = [];
            recommendations = [];
            environment = process.env.NODE_ENV || "development";
            isProduction = environment === "production";
            hasGeminiKey = !!process.env.GEMINI_API_KEY;
            hasJinaKey = !!process.env.JINA_API_KEY;
            // Validate Gemini API key
            if (!hasGeminiKey) {
                if (isProduction) {
                    errors.push("GEMINI_API_KEY is required for production web search");
                    recommendations.push("Set GEMINI_API_KEY environment variable in production");
                }
                else {
                    warnings.push("GEMINI_API_KEY not set - web search will require user API keys");
                }
            }
            else {
                geminiKey = process.env.GEMINI_API_KEY;
                if (!geminiKey.startsWith("AIza") || geminiKey.length !== 39) {
                    errors.push("GEMINI_API_KEY appears to have invalid format");
                    recommendations.push("Verify GEMINI_API_KEY format (should be 39 characters starting with 'AIza')");
                }
            }
            // Check Jina API key (optional but recommended)
            if (!hasJinaKey) {
                warnings.push("JINA_API_KEY not set - may affect web search quality");
                recommendations.push("Consider setting JINA_API_KEY for better web search results");
            }
            // Check budget service availability
            try {
                // Note: Budget service is only available in the web app context
                // This validation runs in the AI package context, so we skip budget checks
                warnings.push("Budget status check skipped - not available in AI package context");
            }
            catch (error) {
                warnings.push("Could not check budget status");
                log.warn({ error: error }, "Budget service unavailable during validation");
            }
            // Production-specific checks
            if (isProduction) {
                if (!hasGeminiKey) {
                    errors.push("Production environment missing required GEMINI_API_KEY");
                }
                // Check for common production issues
                if (process.env.FLY_APP_NAME && !hasGeminiKey) {
                    errors.push("Fly.io deployment missing GEMINI_API_KEY secret");
                    recommendations.push("Set GEMINI_API_KEY secret in Fly.io dashboard");
                }
                if (process.env.VERCEL && !hasGeminiKey) {
                    errors.push("Vercel deployment missing GEMINI_API_KEY environment variable");
                    recommendations.push("Set GEMINI_API_KEY in Vercel project settings");
                }
            }
            isValid = errors.length === 0;
            result = {
                isValid: isValid,
                errors: errors,
                warnings: warnings,
                recommendations: recommendations,
                config: {
                    hasGeminiKey: hasGeminiKey,
                    hasJinaKey: hasJinaKey,
                    environment: environment,
                    isProduction: isProduction,
                },
            };
            // Log validation results
            if (isValid) {
                log.info(result, "Web search configuration validation passed");
            }
            else {
                log.error(result, "Web search configuration validation failed");
            }
            return [2 /*return*/, result];
        });
    });
}
/**
 * Quick check if web search is available
 */
export function isWebSearchAvailable() {
    var hasGeminiKey = !!process.env.GEMINI_API_KEY;
    var isProduction = process.env.NODE_ENV === "production";
    // In production, require system API key
    if (isProduction) {
        return hasGeminiKey;
    }
    // In development, web search can work with user API keys
    return true;
}
/**
 * Get user-friendly error message for web search failures
 */
export function getWebSearchErrorMessage(error, userTier, hasUserApiKey) {
    var isVtPlus = userTier === "PLUS";
    var hasSystemKey = !!process.env.GEMINI_API_KEY;
    // API key related errors
    if (error.message.includes("API key") || error.message.includes("unauthorized")) {
        if (isVtPlus && !hasUserApiKey && !hasSystemKey) {
            return "Web search is temporarily unavailable. Please add your own Gemini API key in settings for unlimited usage.";
        }
        if (!hasUserApiKey && !hasSystemKey) {
            return "Web search requires an API key. Please add your own Gemini API key in settings for unlimited usage.";
        }
        return "Invalid API key. Please check your Gemini API key in settings.";
    }
    // Rate limiting errors
    if (error.message.includes("rate limit") || error.message.includes("429")) {
        if (isVtPlus && !hasUserApiKey) {
            return "Web search rate limit reached. Add your own Gemini API key in settings for unlimited usage.";
        }
        return "Rate limit exceeded. Please try again in a few moments.";
    }
    // Budget errors
    if (error.message.includes("budget") || error.message.includes("quota")) {
        return "Web search is temporarily unavailable due to budget constraints. Please try again later or add your own API key.";
    }
    // Generic error
    return "Web search failed: ".concat(error.message, ". Please try again or contact support if the issue persists.");
}
