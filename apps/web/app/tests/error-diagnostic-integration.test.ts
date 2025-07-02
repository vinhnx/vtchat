import { describe, it, expect } from 'vitest';
import { getErrorDiagnosticMessage, generateErrorDiagnostic } from '../../../../packages/common/utils/error-diagnostics';

describe('Error Diagnostic Integration', () => {
    describe('Thread Item Error Handling', () => {
        it('should replace generic errors with diagnostic messages', () => {
            // Simulate various error objects that might come from the API
            const testErrors = [
                // API key error
                new Error('Invalid API key provided'),
                
                // Network error
                { message: 'Network timeout occurred', code: 'NETWORK_ERROR' },
                
                // Model error
                'Model gemini-2.5-flash-lite-preview-06-17 is not available',
                
                // Generic object error
                { status: 500, error: 'Internal server error' },
                
                // String error
                'Something unexpected happened',
            ];

            testErrors.forEach(error => {
                const diagnosticMessage = getErrorDiagnosticMessage(error);
                
                // Should not be the old generic message
                expect(diagnosticMessage).not.toBe('Something went wrong while processing your request. Please try again.');
                
                // Should contain diagnostic elements
                expect(diagnosticMessage).toContain('🔧 Try these steps:');
                
                // Should have numbered suggestions
                expect(diagnosticMessage).toMatch(/\d+\./);
                
                // Should be longer and more helpful than generic message
                expect(diagnosticMessage.length).toBeGreaterThan(50);
            });
        });

        it('should categorize errors correctly', () => {
            const testCases = [
                { error: 'API key is invalid', expectedCategory: 'auth' },
                { error: 'Network connection failed', expectedCategory: 'connection' },
                { error: 'Model not supported', expectedCategory: 'model' },
                { error: 'Rate limit exceeded', expectedCategory: 'rate_limit' },
                { error: 'Configuration missing', expectedCategory: 'config' },
                { error: 'Random error message', expectedCategory: 'unknown' },
            ];

            testCases.forEach(({ error, expectedCategory }) => {
                const diagnostic = generateErrorDiagnostic(error);
                expect(diagnostic.category).toBe(expectedCategory);
            });
        });

        it('should provide actionable suggestions for each category', () => {
            const categoryTests = [
                {
                    error: 'Invalid API key',
                    expectedSuggestions: [
                        'Check your API keys in Settings',
                        'Verify your API key is valid',
                    ],
                },
                {
                    error: 'Connection timeout',
                    expectedSuggestions: [
                        'Check your internet connection',
                        'Try refreshing the page',
                    ],
                },
                {
                    error: 'Model not available',
                    expectedSuggestions: [
                        'Try switching to a different AI model',
                        'Check if the selected model supports',
                    ],
                },
            ];

            categoryTests.forEach(({ error, expectedSuggestions }) => {
                const diagnostic = generateErrorDiagnostic(error);
                
                expectedSuggestions.forEach(expectedSuggestion => {
                    const hasSuggestion = diagnostic.suggestions.some(suggestion =>
                        suggestion.toLowerCase().includes(expectedSuggestion.toLowerCase())
                    );
                    expect(hasSuggestion).toBe(true);
                });
            });
        });

        it('should handle edge cases gracefully', () => {
            const edgeCases = [
                null,
                undefined,
                '',
                {},
                [],
                0,
                false,
            ];

            edgeCases.forEach(edgeCase => {
                const diagnosticMessage = getErrorDiagnosticMessage(edgeCase);
                
                // Should still provide a helpful message
                expect(diagnosticMessage).toContain('🔧 Try these steps:');
                expect(diagnosticMessage.length).toBeGreaterThan(0);
                
                // Should not crash or return empty
                expect(typeof diagnosticMessage).toBe('string');
            });
        });

        it('should preserve rate limit errors for special handling', () => {
            const rateLimitErrors = [
                'You have reached the daily limit of requests',
                'Rate limit exceeded for this minute',
                'Daily quota exhausted',
            ];

            rateLimitErrors.forEach(error => {
                const diagnostic = generateErrorDiagnostic(error);
                
                // Rate limit errors should keep their original message
                expect(diagnostic.message).toBe(error);
                expect(diagnostic.category).toBe('rate_limit');
                
                // Should still provide upgrade suggestions
                expect(diagnostic.suggestions.some(s => 
                    s.includes('upgrading to VT+') || s.includes('own API key')
                )).toBe(true);
            });
        });
    });

    describe('Message Formatting', () => {
        it('should format messages consistently', () => {
            const error = 'API key error';
            const message = getErrorDiagnosticMessage(error);
            
            // Should have proper structure
            const parts = message.split('\n\n🔧 Try these steps:\n');
            expect(parts).toHaveLength(2);
            
            const [errorMessage, suggestionsList] = parts;
            expect(errorMessage.trim().length).toBeGreaterThan(0);
            expect(suggestionsList.trim().length).toBeGreaterThan(0);
            
            // Suggestions should be numbered
            const suggestions = suggestionsList.split('\n');
            suggestions.forEach((suggestion, index) => {
                if (suggestion.trim()) {
                    expect(suggestion).toMatch(new RegExp(`^${index + 1}\\.`));
                }
            });
        });
    });
});
