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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { neon } from "@neondatabase/serverless";
import { log } from "@repo/shared/logger";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
}
// Use Neon HTTP client instead of Pool for better Bun compatibility
// This avoids the unref() function issues with connection pooling
var sql = neon(process.env.DATABASE_URL);
// Create drizzle instance with Neon HTTP adapter (more compatible with Bun)
export var db = drizzle(sql, {
    schema: schema,
    // Disable drizzle's built-in logger to prevent connection object dumps
    logger: false,
});
// Simple connection test function
export var testConnection = function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
            case 1:
                _a.sent();
                log.info({}, "Database connection test successful");
                return [2 /*return*/, true];
            case 2:
                error_1 = _a.sent();
                log.error({ error: error_1 instanceof Error ? error_1.message : String(error_1) }, "Database connection test failed");
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
// Helper function to handle database connection errors gracefully
export var withDatabaseErrorHandling = function (operation_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([operation_1], args_1, true), void 0, function (operation, operationName) {
        var error_2, err;
        if (operationName === void 0) { operationName = "Database operation"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, operation()];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    err = error_2;
                    log.error({
                        error: err.message || String(error_2),
                        code: err.code,
                        severity: err.severity,
                        detail: err.detail,
                    }, "".concat(operationName, " failed"));
                    // Handle specific Neon/PostgreSQL error codes
                    if (err.code === "57P01") {
                        throw new Error("Database connection was terminated. Please try again.");
                    }
                    if (err.code === "ECONNRESET" || err.code === "ETIMEDOUT") {
                        throw new Error("Database connection timeout. Please try again.");
                    }
                    if (err.code === "53300") {
                        throw new Error("Too many database connections. Please try again in a moment.");
                    }
                    // Re-throw original error for other cases
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
var templateObject_1;
