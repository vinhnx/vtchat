/**
 * Test for web search auto-trigger bug fix
 * Ensures web search is only triggered when user explicitly clicks the toggle button
 */

import { modeRoutingTask } from "@repo/ai/workflow/tasks/chat-mode-router";
import { ChatMode } from "@repo/shared/config";
import { describe, expect, it, vi } from "vitest";

describe("Web Search Auto-Trigger Fix", () => {
    const createMockEvents = () => ({
        emit: vi.fn(),
        update: vi.fn(),
    });

    it("should NOT auto-trigger web search for VT+ users without explicit webSearch flag", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return false; // User has NOT enabled web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should redirect to 'completion' NOT to 'planner' or 'gemini-web-search'
        expect(mockRedirectTo).toHaveBeenCalledWith("completion");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("planner");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("gemini-web-search");
    });

    it("should trigger web search when user explicitly enables it", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should redirect to 'planner' when web search is explicitly enabled
        expect(mockRedirectTo).toHaveBeenCalledWith("planner");
    });

    it("should handle Pro mode with web search enabled", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.Pro;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Pro mode with web search should redirect to gemini-web-search
        expect(mockRedirectTo).toHaveBeenCalledWith("gemini-web-search");
    });

    it("should NOT trigger web search for Pro mode without user enabling it", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.Pro;
                if (key === "messages") return [];
                if (key === "webSearch") return false; // User has NOT enabled web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should redirect to 'completion' NOT to 'gemini-web-search'
        expect(mockRedirectTo).toHaveBeenCalledWith("completion");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("gemini-web-search");
    });

    it("should skip web search for simple identity queries even when web search is enabled", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                if (key === "question") return "who are you?"; // Simple identity query
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should skip web search and redirect to 'completion' for simple queries
        expect(mockRedirectTo).toHaveBeenCalledWith("completion");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("planner");
    });

    it("should skip web search for math queries even when web search is enabled", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                if (key === "question") return "what is 2 + 2?"; // Simple math query
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should skip web search and redirect to 'completion' for math queries
        expect(mockRedirectTo).toHaveBeenCalledWith("completion");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("planner");
    });

    it("should trigger web search for complex queries that need external information", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                if (key === "question") return "what is the current weather in New York?"; // Needs web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should trigger web search for queries that need external information
        expect(mockRedirectTo).toHaveBeenCalledWith("planner");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("completion");
    });

    it("should trigger web search for statistical queries that need current data", async () => {
        const mockEvents = createMockEvents();

        const mockContext = {
            get: vi.fn((key: string) => {
                if (key === "mode") return ChatMode.GEMINI_2_5_FLASH_LITE;
                if (key === "messages") return [];
                if (key === "webSearch") return true; // User has enabled web search
                if (key === "question") return "percentage of US population vaccinated in 2024"; // Needs web search
                return undefined;
            }),
            set: vi.fn(),
        };

        const mockRedirectTo = vi.fn();

        await modeRoutingTask.execute({
            events: mockEvents,
            context: mockContext,
            redirectTo: mockRedirectTo,
        });

        // Should trigger web search for statistical queries that need current data
        expect(mockRedirectTo).toHaveBeenCalledWith("planner");
        expect(mockRedirectTo).not.toHaveBeenCalledWith("completion");
    });
});
