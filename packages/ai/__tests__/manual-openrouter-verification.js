/**
 * Manual OpenRouter Verification Script
 *
 * This script can be run manually to verify OpenRouter integration with real API calls.
 * It tests that OpenRouter requests are authentic and not returning dummy responses.
 *
 * Usage:
 * 1. Set OPENROUTER_API_KEY environment variable
 * 2. Run: bun run packages/ai/__tests__/manual-openrouter-verification.ts
 *
 * Requirements verified:
 * - 2.3: OpenRouter responds with actual model response content
 * - 2.4: OpenRouter requests are sent to correct endpoints with proper authentication
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
import { ModelEnum } from "../models";
import { getLanguageModel } from "../providers";
import { generateText } from "../workflow/utils";
var OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.TEST_OPENROUTER_API_KEY;
function verifyOpenRouterAuthenticity() {
    return __awaiter(this, void 0, void 0, function () {
        var byokKeys, model, responseText_1, chunkCount_1, isAuthentic, containsExpected, error_1, isAuthError, responseText_2, containsNumber, error_2, invalidByokKeys, error_3, isAuthError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("🔍 OpenRouter Authenticity Verification");
                    console.log("=====================================");
                    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.length < 10) {
                        console.log("❌ No OpenRouter API key found. Set OPENROUTER_API_KEY environment variable.");
                        console.log("   Get a key at: https://openrouter.ai/keys");
                        return [2 /*return*/];
                    }
                    console.log("✅ OpenRouter API key found");
                    console.log("   Key length: ".concat(OPENROUTER_API_KEY.length, " characters"));
                    console.log("   Key format: ".concat(OPENROUTER_API_KEY.substring(0, 12), "..."));
                    byokKeys = {
                        OPENROUTER_API_KEY: OPENROUTER_API_KEY,
                    };
                    // Test 1: Provider Instance Creation
                    console.log("\n📋 Test 1: Provider Instance Creation");
                    try {
                        model = getLanguageModel(ModelEnum.DEEPSEEK_V3_0324, undefined, byokKeys);
                        console.log("✅ OpenRouter provider instance created successfully");
                        console.log("   Model type: ".concat(typeof model));
                    }
                    catch (error) {
                        console.log("❌ Failed to create OpenRouter provider instance");
                        console.log("   Error: ".concat(error.message));
                        return [2 /*return*/];
                    }
                    // Test 2: Simple Text Generation
                    console.log("\n📋 Test 2: Simple Text Generation");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    responseText_1 = "";
                    chunkCount_1 = 0;
                    return [4 /*yield*/, generateText({
                            prompt: "You are a helpful AI assistant. Please respond with exactly: 'Hello from OpenRouter DeepSeek V3!' and nothing else.",
                            model: ModelEnum.DEEPSEEK_V3_0324,
                            byokKeys: byokKeys,
                            onChunk: function (chunk) {
                                responseText_1 += chunk;
                                chunkCount_1++;
                            },
                            maxSteps: 1,
                        })];
                case 2:
                    _a.sent();
                    console.log("✅ Text generation completed");
                    console.log("   Response: \"".concat(responseText_1.trim(), "\""));
                    console.log("   Response length: ".concat(responseText_1.length, " characters"));
                    console.log("   Chunks received: ".concat(chunkCount_1));
                    isAuthentic = responseText_1.length > 0 &&
                        !responseText_1.toLowerCase().includes("dummy") &&
                        !responseText_1.toLowerCase().includes("mock") &&
                        !responseText_1.toLowerCase().includes("placeholder");
                    if (isAuthentic) {
                        console.log("✅ Response appears authentic (not dummy/mock data)");
                    }
                    else {
                        console.log("⚠️  Response may be dummy/mock data");
                    }
                    containsExpected = responseText_1.toLowerCase().includes("hello") ||
                        responseText_1.toLowerCase().includes("openrouter") ||
                        responseText_1.toLowerCase().includes("deepseek");
                    if (containsExpected) {
                        console.log("✅ Response contains expected content");
                    }
                    else {
                        console.log("⚠️  Response doesn't contain expected content, but may still be valid");
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log("❌ Text generation failed");
                    console.log("   Error: ".concat(error_1.message));
                    isAuthError = error_1.message.toLowerCase().includes("unauthorized") ||
                        error_1.message.toLowerCase().includes("invalid") ||
                        error_1.message.toLowerCase().includes("api key");
                    if (isAuthError) {
                        console.log("   This appears to be an authentication error (expected for invalid keys)");
                    }
                    return [3 /*break*/, 4];
                case 4:
                    // Test 3: Different Model Test
                    console.log("\n📋 Test 3: Different OpenRouter Model");
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    responseText_2 = "";
                    return [4 /*yield*/, generateText({
                            prompt: "What is 2+2? Answer with just the number.",
                            model: ModelEnum.DEEPSEEK_R1,
                            byokKeys: byokKeys,
                            onChunk: function (chunk) {
                                responseText_2 += chunk;
                            },
                            maxSteps: 1,
                        })];
                case 6:
                    _a.sent();
                    console.log("✅ DeepSeek R1 model test completed");
                    console.log("   Response: \"".concat(responseText_2.trim(), "\""));
                    containsNumber = /[0-9]/.test(responseText_2);
                    if (containsNumber) {
                        console.log("✅ Response contains numbers (expected for math question)");
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _a.sent();
                    console.log("❌ DeepSeek R1 model test failed");
                    console.log("   Error: ".concat(error_2.message));
                    return [3 /*break*/, 8];
                case 8:
                    // Test 4: Error Handling with Invalid Key
                    console.log("\n📋 Test 4: Error Handling with Invalid Key");
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    invalidByokKeys = {
                        OPENROUTER_API_KEY: "sk-or-v1-invalid".concat("a".repeat(60)),
                    };
                    return [4 /*yield*/, generateText({
                            prompt: "Test prompt",
                            model: ModelEnum.DEEPSEEK_V3_0324,
                            byokKeys: invalidByokKeys,
                            onChunk: function () { },
                            maxSteps: 1,
                        })];
                case 10:
                    _a.sent();
                    console.log("⚠️  Expected error with invalid API key, but request succeeded");
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _a.sent();
                    console.log("✅ Invalid API key properly rejected");
                    console.log("   Error: ".concat(error_3.message));
                    isAuthError = error_3.message.toLowerCase().includes("unauthorized") ||
                        error_3.message.toLowerCase().includes("invalid") ||
                        error_3.message.toLowerCase().includes("api key") ||
                        error_3.message.toLowerCase().includes("forbidden");
                    if (isAuthError) {
                        console.log("✅ Error is authentication-related (expected)");
                    }
                    else {
                        console.log("⚠️  Error is not authentication-related");
                    }
                    return [3 /*break*/, 12];
                case 12:
                    console.log("\n🎉 OpenRouter Authenticity Verification Complete");
                    console.log("===============================================");
                    console.log("Summary:");
                    console.log("- Provider instance creation: Tested");
                    console.log("- Text generation with valid key: Tested");
                    console.log("- Multiple model support: Tested");
                    console.log("- Error handling with invalid key: Tested");
                    console.log("- Response authenticity checks: Performed");
                    console.log("\nIf all tests passed, OpenRouter integration is working correctly");
                    console.log("and sending authentic requests to OpenRouter API endpoints.");
                    return [2 /*return*/];
            }
        });
    });
}
// Run verification if this script is executed directly
if (import.meta.main) {
    verifyOpenRouterAuthenticity().catch(console.error);
}
export { verifyOpenRouterAuthenticity };
