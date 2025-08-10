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
import { Sandbox } from "@e2b/code-interpreter";
import { tool } from "ai";
import { z } from "zod";
import { openSandbox } from "./open-sandbox";
// E2B Code Sandbox - Premium Feature for VT+ Users Only
// Removed client-side sandbox implementations (Sandpack/Pyodide) to focus on E2B
// E2B Code Sandbox - Premium Feature for VT+ Users Only
export var startSandbox = function () {
    return tool({
        description: "Create and run code in a secure E2B cloud sandbox. Premium feature for VT+ users only. Limited to 2 successful runs per day.",
        parameters: z.object({
            files: z
                .record(z.string(), z.string())
                .describe("Files to create in the sandbox (path -> content)"),
            language: z
                .enum(["python", "javascript", "typescript", "bash", "html", "css"])
                .default("python")
                .describe("Primary programming language"),
            cmd: z
                .string()
                .optional()
                .describe("Command to execute (e.g., 'python main.py', 'npm start')"),
            port: z.number().optional().describe("Port for web servers (e.g., 3000, 8000)"),
            internetAccess: z
                .boolean()
                .default(false)
                .describe("Allow internet access (disabled by default for security)"),
            timeoutMinutes: z
                .number()
                .min(1)
                .max(30)
                .default(10)
                .describe("Sandbox timeout in minutes (max 30 for cost efficiency)"),
        }),
        // NOTE: keep this server-side so it can use E2B_API_KEY
        execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var _c, checkSandboxRateLimit, requireVTPlusUser, sbx, returnFiles, processedFiles_1, installError_1, actualCmd, mainPyContent, isServerCommand, proc, testResult, testError_1, proc, host, _d, trackSandboxUsage, error_1;
            var _e, _f, _g;
            var files = _b.files, language = _b.language, cmd = _b.cmd, port = _b.port, internetAccess = _b.internetAccess, timeoutMinutes = _b.timeoutMinutes;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, import("../utils/sandbox-limits")];
                    case 1:
                        _c = _h.sent(), checkSandboxRateLimit = _c.checkSandboxRateLimit, requireVTPlusUser = _c.requireVTPlusUser;
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 26, , 27]);
                        // 1. PREMIUM GATING: Only VT+ users can access sandbox
                        return [4 /*yield*/, requireVTPlusUser()];
                    case 3:
                        // 1. PREMIUM GATING: Only VT+ users can access sandbox
                        _h.sent();
                        // 2. RATE LIMITING: Check daily usage limits (2 successful runs per day for VT+)
                        return [4 /*yield*/, checkSandboxRateLimit()];
                    case 4:
                        // 2. RATE LIMITING: Check daily usage limits (2 successful runs per day for VT+)
                        _h.sent();
                        return [4 /*yield*/, Sandbox.create({
                                // Use minimal timeout for cost efficiency (convert minutes to milliseconds)
                                timeoutMs: timeoutMinutes * 60 * 1000,
                                // Disable internet access by default for security and cost
                                allowInternetAccess: internetAccess,
                                // Add metadata for tracking and management
                                metadata: {
                                    userTier: "VT_PLUS",
                                    language: language,
                                    createdAt: new Date().toISOString(),
                                    source: "vtchat-ai-tool",
                                },
                                // Minimal environment variables
                                envs: {
                                    PYTHONUNBUFFERED: "1",
                                    NODE_ENV: "development",
                                },
                            })];
                    case 5:
                        sbx = _h.sent();
                        returnFiles = __assign({}, files);
                        if (!(files && Object.keys(files).length)) return [3 /*break*/, 7];
                        processedFiles_1 = [];
                        Object.entries(files).forEach(function (_a) {
                            var path = _a[0], data = _a[1];
                            var processedData = data;
                            // Fix network binding for E2B compatibility
                            if (path.endsWith(".py")) {
                                processedData = processedData
                                    .replace(/HTTPServer\(\("", (\d+)\)/g, 'HTTPServer(("0.0.0.0", $1)')
                                    .replace(/HTTPServer\(\('' ?, ?(\d+)\)/g, 'HTTPServer(("0.0.0.0", $1)')
                                    .replace(/HTTPServer\(\("127\.0\.0\.1", (\d+)\)/g, 'HTTPServer(("0.0.0.0", $1)')
                                    .replace(/HTTPServer\(\("localhost", (\d+)\)/g, 'HTTPServer(("0.0.0.0", $1)');
                            }
                            if (path.endsWith(".js") || path.endsWith(".ts")) {
                                processedData = processedData
                                    .replace(/listen\((\d+), ?['"]127\.0\.0\.1['"]\)/g, 'listen($1, "0.0.0.0")')
                                    .replace(/listen\((\d+), ?['"]localhost['"]\)/g, 'listen($1, "0.0.0.0")');
                            }
                            processedFiles_1.push({ path: path, data: processedData });
                        });
                        return [4 /*yield*/, sbx.files.write(processedFiles_1)];
                    case 6:
                        _h.sent();
                        _h.label = 7;
                    case 7:
                        if (!(language === "python" &&
                            Object.keys(files).some(function (path) { return path.endsWith(".py"); }))) return [3 /*break*/, 11];
                        _h.label = 8;
                    case 8:
                        _h.trys.push([8, 10, , 11]);
                        // Only install essential packages to reduce startup time
                        return [4 /*yield*/, sbx.commands.run("pip install --no-cache-dir requests", {
                                background: false,
                            })];
                    case 9:
                        // Only install essential packages to reduce startup time
                        _h.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        installError_1 = _h.sent();
                        // Log but don't fail - dependencies are optional
                        console.warn("Optional dependency installation failed:", installError_1);
                        return [3 /*break*/, 11];
                    case 11:
                        if (!cmd) return [3 /*break*/, 20];
                        actualCmd = cmd;
                        // Smart command detection for Python HTTP servers
                        if (cmd.includes("python -m http.server") && files["/main.py"]) {
                            mainPyContent = files["/main.py"];
                            if (mainPyContent.includes("HTTPServer") ||
                                mainPyContent.includes("serve_forever")) {
                                actualCmd = "python /main.py";
                            }
                        }
                        isServerCommand = actualCmd.includes("http.server") ||
                            actualCmd.includes("serve") ||
                            actualCmd.includes("npm start") ||
                            actualCmd.includes("python /main.py");
                        if (!isServerCommand) return [3 /*break*/, 18];
                        return [4 /*yield*/, sbx.commands.run(actualCmd, { background: true })];
                    case 12:
                        proc = _h.sent();
                        // Wait for server to start
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 3000); })];
                    case 13:
                        // Wait for server to start
                        _h.sent();
                        _h.label = 14;
                    case 14:
                        _h.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, sbx.commands.run("curl -s --max-time 5 http://localhost:".concat(port || 8000, " || echo \"Server not responding\""), { background: false })];
                    case 15:
                        testResult = _h.sent();
                        returnFiles["/SANDBOX_INFO.md"] = "# Sandbox Information\n\n## Status\n\u2705 Server started successfully\n\n## Command\n`".concat(actualCmd, "`\n\n## Port\n").concat(port || 8000, "\n\n## Server Response\n").concat(testResult.stdout || "No response", "\n\n## Initial Output\nSTDOUT: ").concat(proc.stdout || "No output", "\nSTDERR: ").concat(proc.stderr || "No errors", "\n\n## Access URL\nYour server is accessible at the provided host URL.\n");
                        return [3 /*break*/, 17];
                    case 16:
                        testError_1 = _h.sent();
                        returnFiles["/SANDBOX_INFO.md"] = "# Sandbox Information\n\n## Status\n\u26A0\uFE0F Server may not be responding\n\n## Command\n`".concat(actualCmd, "`\n\n## Error\n").concat(testError_1, "\n\n## Initial Output\nSTDOUT: ").concat(proc.stdout || "No output", "\nSTDERR: ").concat(proc.stderr || "No errors", "\n");
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 20];
                    case 18: return [4 /*yield*/, sbx.commands.run(actualCmd, {
                            background: false,
                        })];
                    case 19:
                        proc = _h.sent();
                        returnFiles["/OUTPUT.md"] = "# Command Output\n\n## Command\n`".concat(actualCmd, "`\n\n## STDOUT\n```\n").concat(proc.stdout || "No output", "\n```\n\n## STDERR\n```\n").concat(proc.stderr || "No errors", "\n```\n\n## Exit Code\n").concat(proc.exitCode || 0, "\n");
                        _h.label = 20;
                    case 20:
                        if (!port) return [3 /*break*/, 22];
                        return [4 /*yield*/, sbx.getHost(port)];
                    case 21:
                        _d = _h.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        _d = null;
                        _h.label = 23;
                    case 23:
                        host = _d;
                        return [4 /*yield*/, import("../utils/sandbox-limits")];
                    case 24:
                        trackSandboxUsage = (_h.sent()).trackSandboxUsage;
                        return [4 /*yield*/, trackSandboxUsage()];
                    case 25:
                        _h.sent();
                        return [2 /*return*/, {
                                sandboxId: sbx.sandboxId,
                                host: host ? "https://".concat(host) : null,
                                files: returnFiles,
                                language: language,
                                timeoutMinutes: timeoutMinutes,
                                internetAccess: internetAccess,
                                success: true,
                                message: "Sandbox created successfully! This counts as 1 of your 2 daily sandbox runs.",
                            }];
                    case 26:
                        error_1 = _h.sent();
                        // Handle specific E2B errors
                        if (error_1.name === "RateLimitError" || ((_e = error_1.message) === null || _e === void 0 ? void 0 : _e.includes("rate limit"))) {
                            throw new Error("E2B rate limit exceeded. Please try again later.");
                        }
                        if ((_f = error_1.message) === null || _f === void 0 ? void 0 : _f.includes("VT+ required")) {
                            throw new Error("Sandbox feature requires VT+ subscription. Upgrade to access code execution.");
                        }
                        if ((_g = error_1.message) === null || _g === void 0 ? void 0 : _g.includes("daily limit")) {
                            throw new Error("Daily sandbox limit reached (2/2). Limit resets at midnight UTC.");
                        }
                        // Generic error handling
                        throw new Error("Sandbox creation failed: ".concat(error_1.message || "Unknown error"));
                    case 27: return [2 /*return*/];
                }
            });
        }); },
    });
};
// E2B Sandbox Management - Stop/cleanup sandbox
export var stopSandbox = function () {
    return tool({
        description: "Stop and cleanup an E2B sandbox by ID. Helps manage costs by terminating unused sandboxes.",
        parameters: z.object({
            sandboxId: z.string().describe("The E2B sandbox ID to stop"),
        }),
        execute: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
            var sbx, isRunning, error_2;
            var _c, _d, _e;
            var sandboxId = _b.sandboxId;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Sandbox.connect(sandboxId)];
                    case 1:
                        sbx = _f.sent();
                        return [4 /*yield*/, ((_c = sbx.isRunning) === null || _c === void 0 ? void 0 : _c.call(sbx))];
                    case 2:
                        isRunning = (_f.sent()) || true;
                        if (!isRunning) return [3 /*break*/, 4];
                        // Gracefully stop the sandbox
                        return [4 /*yield*/, sbx.kill()];
                    case 3:
                        // Gracefully stop the sandbox
                        _f.sent();
                        return [2 /*return*/, {
                                success: true,
                                message: "Sandbox ".concat(sandboxId, " stopped successfully."),
                                sandboxId: sandboxId,
                            }];
                    case 4: return [2 /*return*/, {
                            success: true,
                            message: "Sandbox ".concat(sandboxId, " was already stopped."),
                            sandboxId: sandboxId,
                        }];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _f.sent();
                        // Handle case where sandbox doesn't exist or is already stopped
                        if (((_d = error_2.message) === null || _d === void 0 ? void 0 : _d.includes("not found")) || ((_e = error_2.message) === null || _e === void 0 ? void 0 : _e.includes("404"))) {
                            return [2 /*return*/, {
                                    success: true,
                                    message: "Sandbox ".concat(sandboxId, " not found (may already be stopped)."),
                                    sandboxId: sandboxId,
                                }];
                        }
                        throw new Error("Failed to stop sandbox ".concat(sandboxId, ": ").concat(error_2.message));
                    case 7: return [2 /*return*/];
                }
            });
        }); },
    });
};
// E2B Sandbox Management - List active sandboxes
export var listSandboxes = function () {
    return tool({
        description: "List all active E2B sandboxes for the current user. Helps manage costs by showing running sandboxes.",
        parameters: z.object({}),
        execute: function () { return __awaiter(void 0, void 0, void 0, function () {
            var sandboxes, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Sandbox.list()];
                    case 1:
                        sandboxes = _a.sent();
                        return [2 /*return*/, {
                                success: true,
                                count: sandboxes.length,
                                sandboxes: sandboxes.map(function (sb) { return ({
                                    id: sb.sandboxId || sb.id,
                                    template: sb.template || "base",
                                    createdAt: sb.startedAt || sb.createdAt,
                                    metadata: sb.metadata || {},
                                }); }),
                                message: "Found ".concat(sandboxes.length, " active sandbox").concat(sandboxes.length !== 1 ? "es" : "", "."),
                            }];
                    case 2:
                        error_3 = _a.sent();
                        throw new Error("Failed to list sandboxes: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        }); },
    });
};
// Export openSandbox for client-side usage
export { openSandbox };
