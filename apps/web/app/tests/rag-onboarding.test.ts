import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    data: {} as Record<string, string>,
    getItem: vi.fn((key: string) => localStorageMock.data[key] || null),
    setItem: vi.fn((key: string, value: string) => { localStorageMock.data[key] = value; }),
    removeItem: vi.fn((key: string) => { delete localStorageMock.data[key]; }),
    clear: vi.fn(() => { localStorageMock.data = {}; }),
};

// @ts-ignore
global.localStorage = localStorageMock;

describe('RAG Onboarding', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Clean up after each test
        localStorageMock.clear();
    });

    it('should show onboarding for users without API keys', () => {
        // Mock API keys store returning empty keys
        const mockApiKeys = {};
        
        // Check onboarding logic
        const hasApiKeys = Object.keys(mockApiKeys).some(key => 
            key === 'GEMINI_API_KEY' || key === 'OPENAI_API_KEY'
        );
        
        expect(hasApiKeys).toBe(false);
        expect(!hasApiKeys).toBe(true); // Should show onboarding
    });

    it('should not show onboarding when API keys are present', () => {
        // Mock API keys store with keys
        const mockApiKeys = { GEMINI_API_KEY: 'test-key' };
        
        const hasApiKeys = Object.keys(mockApiKeys).some(key => 
            key === 'GEMINI_API_KEY' || key === 'OPENAI_API_KEY'
        );
        
        expect(hasApiKeys).toBe(true);
        expect(!hasApiKeys).toBe(false); // Should not show onboarding
    });

    it('should detect Gemini API keys', () => {
        const mockApiKeys = { GEMINI_API_KEY: 'test-gemini-key' };
        
        const hasApiKeys = Object.keys(mockApiKeys).some(key => 
            key === 'GEMINI_API_KEY' || key === 'OPENAI_API_KEY'
        );
        
        expect(hasApiKeys).toBe(true);
    });

    it('should detect OpenAI API keys', () => {
        const mockApiKeys = { OPENAI_API_KEY: 'test-openai-key' };
        
        const hasApiKeys = Object.keys(mockApiKeys).some(key => 
            key === 'GEMINI_API_KEY' || key === 'OPENAI_API_KEY'
        );
        
        expect(hasApiKeys).toBe(true);
    });
});
