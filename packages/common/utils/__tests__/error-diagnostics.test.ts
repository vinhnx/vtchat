import { describe, expect, it } from 'vitest';
import {
    formatErrorMessage,
    generateErrorDiagnostic,
    getErrorDiagnosticMessage,
} from '../error-diagnostics';

describe('Error Diagnostics', () => {
    describe('generateErrorDiagnostic', () => {
        it('should detect VT+ quota exceeded errors', () => {
            const error =
                'Daily Deep Research limit reached (5/5). Try Pro Search or regular chat. Your quota will reset tomorrow.';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('rate_limit');
            expect(diagnostic.message).toBe(error);
            expect(diagnostic.suggestions).toContain('Your daily/monthly quota has been reached');
            expect(diagnostic.suggestions).toContain(
                'Try using a different VT+ feature with remaining quota'
            );
            expect(diagnostic.suggestions).toContain('Use regular chat models which are unlimited');
        });

        it('should detect general rate limit errors', () => {
            const error = 'You have reached the daily limit of requests';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('rate_limit');
            expect(diagnostic.message).toBe(error);
            expect(diagnostic.suggestions).toContain('Wait a few minutes before trying again');
            expect(diagnostic.suggestions).toContain('Consider upgrading to VT+ for higher limits');
        });

        it('should detect API key errors', () => {
            const error = 'Invalid API key provided';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('auth');
            expect(diagnostic.message).toContain('API key issue detected');
            expect(diagnostic.suggestions).toContain('Check your API keys in Settings → API Keys');
            expect(diagnostic.suggestions).toContain(
                'Verify your API key is valid and not expired'
            );
        });

        it('should detect network errors', () => {
            const error = 'Network timeout occurred';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('connection');
            expect(diagnostic.message).toContain('Network connectivity issue detected');
            expect(diagnostic.suggestions).toContain('Check your internet connection');
            expect(diagnostic.suggestions).toContain('Try refreshing the page');
        });

        it('should detect model errors', () => {
            const error = 'Model not available for this request';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('model');
            expect(diagnostic.message).toContain('Model or feature compatibility issue detected');
            expect(diagnostic.suggestions).toContain('Try switching to a different AI model');
        });

        it('should handle unknown errors gracefully', () => {
            const error = 'Some random unexpected error';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('unknown');
            expect(diagnostic.message).toContain('An unexpected error occurred');
            expect(diagnostic.suggestions).toContain('Try submitting your request again');
            expect(diagnostic.suggestions).toContain('Contact support if the problem continues');
        });

        it('should handle Error objects', () => {
            const error = new Error('Connection refused');
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('connection');
            expect(diagnostic.suggestions).toContain('Check your internet connection');
        });

        it('should handle non-string errors', () => {
            const error = { code: 500, message: 'Internal server error' };
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('unknown');
            expect(diagnostic.suggestions.length).toBeGreaterThan(0);
        });
    });

    describe('formatErrorMessage', () => {
        it('should format error message with numbered suggestions', () => {
            const diagnostic = {
                message: 'Test error occurred',
                suggestions: ['First suggestion', 'Second suggestion'],
                category: 'unknown' as const,
            };

            const formatted = formatErrorMessage(diagnostic);

            expect(formatted).toContain('Test error occurred');
            expect(formatted).toContain('🔧 Try these steps:');
            expect(formatted).toContain('1. First suggestion');
            expect(formatted).toContain('2. Second suggestion');
        });
    });

    describe('getErrorDiagnosticMessage', () => {
        it('should return a complete formatted diagnostic message', () => {
            const error = 'API key is invalid';
            const message = getErrorDiagnosticMessage(error);

            expect(message).toContain('API key issue detected');
            expect(message).toContain('🔧 Try these steps:');
            expect(message).toContain('1. Check your API keys');
            expect(message).toContain('2. Verify your API key is valid');
        });

        it('should handle complex error objects', () => {
            const error = {
                name: 'NetworkError',
                message: 'Failed to fetch',
                stack: 'Error: Failed to fetch...',
            };

            const message = getErrorDiagnosticMessage(error);

            expect(message).toContain('Network connectivity issue detected');
            expect(message).toContain('🔧 Try these steps:');
        });
    });

    describe('Specific Error Patterns', () => {
        it('should detect quota errors', () => {
            const error = 'Quota exceeded for this billing period';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('rate_limit');
            expect(diagnostic.suggestions).toContain('Check your usage limits in Settings → Usage');
        });

        it('should detect cancelled requests', () => {
            const error = 'Request was aborted by the user';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('connection');
            expect(diagnostic.suggestions).toContain('Try submitting your request again');
        });

        it('should detect configuration errors', () => {
            const error = 'Environment configuration is missing';
            const diagnostic = generateErrorDiagnostic(error);

            expect(diagnostic.category).toBe('config');
            expect(diagnostic.suggestions).toContain('Contact support if the issue persists');
        });
    });
});
