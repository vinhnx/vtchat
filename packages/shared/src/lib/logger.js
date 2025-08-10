// Simple logger implementation to replace console.log usage
// This is a minimal implementation to ensure build compatibility
/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
// Helper to determine parameter order and handle both patterns
var logMessage = function (consoleMethod, defaultPrefix) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (args.length === 0) {
        consoleMethod(defaultPrefix);
        return;
    }
    if (args.length === 1) {
        var arg = args[0];
        if (typeof arg === "string") {
            consoleMethod(arg);
        }
        else {
            consoleMethod(defaultPrefix, arg);
        }
        return;
    }
    if (args.length === 2) {
        var first = args[0], second = args[1];
        // Pattern: log.info({data}, "message")
        if (typeof first === "object" && typeof second === "string") {
            consoleMethod(second, first);
        }
        // Pattern: log.info("message", {data})
        else if (typeof first === "string" && typeof second === "object") {
            consoleMethod(first, second);
        }
        // Default: treat as message, data
        else {
            consoleMethod(first, second);
        }
        return;
    }
    // More than 2 args, just pass through
    consoleMethod.apply(void 0, args);
};
// Simple logger that wraps console methods
var createLogger = function () {
    var info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        logMessage.apply(void 0, __spreadArray([console.log, "Info:"], args, false));
    };
    var warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        logMessage.apply(void 0, __spreadArray([console.warn, "Warn:"], args, false));
    };
    var error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // In development, use console.warn to avoid triggering error overlay for non-critical errors
        var logMethod = process.env.NODE_ENV === "development" ? console.warn : console.error;
        logMessage.apply(void 0, __spreadArray([logMethod, "Error:"], args, false));
    };
    var debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (process.env.NODE_ENV === "development") {
            logMessage.apply(void 0, __spreadArray([console.debug, "Debug:"], args, false));
        }
    };
    return { info: info, warn: warn, error: error, debug: debug };
};
export var log = createLogger();
// For compatibility with existing code
export default log;
