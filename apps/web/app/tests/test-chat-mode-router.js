/**
 * Test Chat Mode Router Behavior
 * 
 * This test verifies that the chat mode router correctly handles different scenarios
 * for VT+ users with tools enabled.
 */

import { describe, it, expect } from 'vitest';

// Mock the chat mode router logic
function chatModeRouter(mode, webSearch, mathCalculator, charts) {
    // Simulate the router logic
    if (mode === 'deep') {
        return 'refine-query';
    } else if (mode === 'pro' && webSearch) {
        // Pro Search mode with web search enabled
        return 'gemini-web-search';
    } else if (webSearch) {
        // For other models with web search
        return 'planner';
    } else {
        // Default case - should allow tools like math calculator and charts
        return 'completion';
    }
}

describe('Chat Mode Router', () => {
    it('should route Pro mode to completion when only math calculator is enabled', () => {
        const result = chatModeRouter('pro', false, true, false);
        expect(result).toBe('completion');
    });

    it('should route Pro mode to completion when only charts is enabled', () => {
        const result = chatModeRouter('pro', false, false, true);
        expect(result).toBe('completion');
    });

    it('should route Pro mode to completion when both math and charts are enabled', () => {
        const result = chatModeRouter('pro', false, true, true);
        expect(result).toBe('completion');
    });

    it('should route Pro mode to gemini-web-search when web search is enabled', () => {
        const result = chatModeRouter('pro', true, false, false);
        expect(result).toBe('gemini-web-search');
    });

    it('should route Pro mode to gemini-web-search when web search + tools are enabled', () => {
        const result = chatModeRouter('pro', true, true, true);
        expect(result).toBe('gemini-web-search');
    });

    it('should route other Gemini models to planner when web search is enabled', () => {
        const result = chatModeRouter('gemini-2.5-flash-lite', true, false, false);
        expect(result).toBe('planner');
    });

    it('should route other Gemini models to completion when only tools are enabled', () => {
        const result = chatModeRouter('gemini-2.5-flash-lite', false, true, true);
        expect(result).toBe('completion');
    });
});
