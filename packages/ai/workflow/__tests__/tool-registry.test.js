import { UserTier } from "@repo/shared/constants/user-tiers";
import { describe, expect, test, vi } from "vitest";
import { getAllToolDescriptions, getAvailableTools, getToolById, hasToolAccess, TOOL_REGISTRY, } from "../tool-registry";
describe("Tool Registry", function () {
    test("should have all expected tools", function () {
        expect(TOOL_REGISTRY).toHaveLength(6);
        var toolIds = TOOL_REGISTRY.map(function (tool) { return tool.id; });
        expect(toolIds).toContain("web-search");
        expect(toolIds).toContain("calculator");
        expect(toolIds).toContain("charts");
    });
    test("should have proper tool structure", function () {
        for (var _i = 0, TOOL_REGISTRY_1 = TOOL_REGISTRY; _i < TOOL_REGISTRY_1.length; _i++) {
            var tool = TOOL_REGISTRY_1[_i];
            expect(tool).toHaveProperty("id");
            expect(tool).toHaveProperty("name");
            expect(tool).toHaveProperty("description");
            expect(tool).toHaveProperty("tier");
            expect(tool).toHaveProperty("activate");
            expect(tool).toHaveProperty("keywords");
            expect(tool).toHaveProperty("examples");
            expect(typeof tool.id).toBe("string");
            expect(typeof tool.name).toBe("string");
            expect(typeof tool.description).toBe("string");
            expect([UserTier.FREE, UserTier.PLUS]).toContain(tool.tier);
            expect(typeof tool.activate).toBe("function");
            expect(Array.isArray(tool.keywords)).toBe(true);
            expect(Array.isArray(tool.examples)).toBe(true);
        }
    });
    describe("getToolById", function () {
        test("should return tool when found", function () {
            var tool = getToolById("calculator");
            expect(tool).toBeDefined();
            expect(tool === null || tool === void 0 ? void 0 : tool.id).toBe("calculator");
            expect(tool === null || tool === void 0 ? void 0 : tool.name).toBe("Math Calculator");
        });
        test("should return undefined when not found", function () {
            var tool = getToolById("nonexistent");
            expect(tool).toBeUndefined();
        });
    });
    describe("getAvailableTools", function () {
        test("should return only FREE tools for free tier", function () {
            var tools = getAvailableTools(UserTier.FREE);
            expect(tools.every(function (tool) { return tool.tier === UserTier.FREE; })).toBe(true);
            var toolIds = tools.map(function (tool) { return tool.id; });
            expect(toolIds).toContain("web-search");
            expect(toolIds).toContain("calculator");
            expect(toolIds).toContain("charts"); // Charts now FREE
        });
        test("should return all tools for PLUS tier", function () {
            var tools = getAvailableTools(UserTier.PLUS);
            expect(tools).toHaveLength(TOOL_REGISTRY.length);
            var toolIds = tools.map(function (tool) { return tool.id; });
            expect(toolIds).toContain("web-search");
            expect(toolIds).toContain("calculator");
            expect(toolIds).toContain("charts");
        });
        test("should default to FREE tier when no tier specified", function () {
            var tools = getAvailableTools();
            expect(tools.every(function (tool) { return tool.tier === UserTier.FREE; })).toBe(true);
        });
    });
    describe("hasToolAccess", function () {
        test("should allow FREE tools for free users", function () {
            expect(hasToolAccess("web-search", UserTier.FREE)).toBe(true);
            expect(hasToolAccess("calculator", UserTier.FREE)).toBe(true);
        });
        test("should allow charts for free users (charts now FREE)", function () {
            expect(hasToolAccess("charts", UserTier.FREE)).toBe(true);
        });
        test("should allow all tools for PLUS users", function () {
            expect(hasToolAccess("web-search", UserTier.PLUS)).toBe(true);
            expect(hasToolAccess("calculator", UserTier.PLUS)).toBe(true);
            expect(hasToolAccess("charts", UserTier.PLUS)).toBe(true);
        });
        test("should return false for nonexistent tools", function () {
            expect(hasToolAccess("nonexistent", UserTier.FREE)).toBe(false);
            expect(hasToolAccess("nonexistent", UserTier.PLUS)).toBe(false);
        });
        test("should default to FREE tier when no tier specified", function () {
            expect(hasToolAccess("charts")).toBe(true); // Charts now FREE tier
            expect(hasToolAccess("calculator")).toBe(true); // FREE tool
        });
    });
    describe("getAllToolDescriptions", function () {
        test("should return descriptions for all tools", function () {
            var descriptions = getAllToolDescriptions();
            expect(descriptions).toHaveLength(TOOL_REGISTRY.length);
            for (var _i = 0, descriptions_1 = descriptions; _i < descriptions_1.length; _i++) {
                var desc = descriptions_1[_i];
                expect(desc).toHaveProperty("id");
                expect(desc).toHaveProperty("text");
                expect(typeof desc.id).toBe("string");
                expect(typeof desc.text).toBe("string");
                expect(desc.text.length).toBeGreaterThan(0);
            }
        });
        test("should combine description, keywords, and examples", function () {
            var descriptions = getAllToolDescriptions();
            var calculatorDesc = descriptions.find(function (d) { return d.id === "calculator"; });
            expect(calculatorDesc).toBeDefined();
            expect(calculatorDesc === null || calculatorDesc === void 0 ? void 0 : calculatorDesc.text).toContain("mathematical calculations");
            expect(calculatorDesc === null || calculatorDesc === void 0 ? void 0 : calculatorDesc.text).toContain("calculate"); // keyword
            expect(calculatorDesc === null || calculatorDesc === void 0 ? void 0 : calculatorDesc.text).toContain("solve"); // keyword
            expect(calculatorDesc === null || calculatorDesc === void 0 ? void 0 : calculatorDesc.text).toContain("15% of 1000"); // example
        });
    });
    describe("tool activation functions", function () {
        test("should properly activate tools on context", function () {
            var mockContext = {
                set: vi.fn(),
            };
            var webSearchTool = getToolById("web-search");
            var calculatorTool = getToolById("calculator");
            var chartsTool = getToolById("charts");
            webSearchTool === null || webSearchTool === void 0 ? void 0 : webSearchTool.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith("webSearch", true);
            calculatorTool === null || calculatorTool === void 0 ? void 0 : calculatorTool.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith("mathCalculator", true);
            chartsTool === null || chartsTool === void 0 ? void 0 : chartsTool.activate(mockContext);
            expect(mockContext.set).toHaveBeenCalledWith("charts", true);
        });
    });
});
