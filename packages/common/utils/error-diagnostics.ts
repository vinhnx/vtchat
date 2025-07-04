/**
 * Error diagnostics utility for providing helpful error messages and troubleshooting steps
 */

interface ErrorDiagnostic {
    message: string;
    suggestions: string[];
    category: 'connection' | 'auth' | 'rate_limit' | 'model' | 'config' | 'unknown';
}

export const generateErrorDiagnostic = (error: unknown): ErrorDiagnostic => {
    // Convert error to string for analysis
    const errorString =
        typeof error === 'string'
            ? error
            : error instanceof Error
              ? error.message
              : error === null || error === undefined
                ? 'Unknown error occurred'
                : JSON.stringify(error);

    const errorLower = errorString.toLowerCase();

    // Rate limit errors
    if (
        errorLower.includes('rate limit') ||
        errorLower.includes('daily limit') ||
        errorLower.includes('per minute') ||
        errorLower.includes('minute') ||
        errorLower.includes('quota')
    ) {
        return {
            message: errorString,
            suggestions: [
                'Wait a few minutes before trying again',
                'Check your usage limits in Settings → Usage',
                'Consider upgrading to VT+ for higher limits',
                'Add your own API key for unlimited usage',
            ],
            category: 'rate_limit',
        };
    }

    // API key related errors
    if (
        errorLower.includes('api key') ||
        errorLower.includes('unauthorized') ||
        errorLower.includes('invalid key') ||
        errorLower.includes('forbidden')
    ) {
        return {
            message:
                'API key issue detected. This could be due to missing, invalid, or expired API keys.',
            suggestions: [
                'Check your API keys in Settings → API Keys',
                'Verify your API key is valid and not expired',
                'Try regenerating your API key from the provider',
                'For free models, try again later if limits are reached',
                'Contact support if you continue having issues',
            ],
            category: 'auth',
        };
    }

    // Network/connection errors
    if (
        errorLower.includes('network') ||
        errorLower.includes('timeout') ||
        errorLower.includes('connection') ||
        errorLower.includes('fetch') ||
        errorLower.includes('cors')
    ) {
        return {
            message:
                'Network connectivity issue detected. The request failed to reach the AI service.',
            suggestions: [
                'Check your internet connection',
                'Try refreshing the page',
                'Disable any VPN or proxy temporarily',
                'Clear your browser cache and cookies',
                'Try again in a few minutes',
            ],
            category: 'connection',
        };
    }

    // Model specific errors
    if (
        errorLower.includes('model') ||
        errorLower.includes('unsupported') ||
        errorLower.includes('not available')
    ) {
        return {
            message: 'Model or feature compatibility issue detected.',
            suggestions: [
                'Try switching to a different AI model',
                'Check if the selected model supports your request',
                'Update your browser to the latest version',
                'Try again with a simpler request',
            ],
            category: 'model',
        };
    }

    // Configuration errors
    if (
        errorLower.includes('config') ||
        errorLower.includes('setup') ||
        errorLower.includes('environment')
    ) {
        return {
            message: 'Configuration issue detected. The system may need to be set up properly.',
            suggestions: [
                'Try refreshing the page',
                'Clear your browser data and try again',
                'Contact support if the issue persists',
                'Check if you have the required permissions',
            ],
            category: 'config',
        };
    }

    // Specific known error patterns
    if (errorLower.includes('aborted') || errorLower.includes('cancelled')) {
        return {
            message: 'Request was cancelled or interrupted.',
            suggestions: [
                'Try submitting your request again',
                'Check your internet connection stability',
                'Avoid navigating away while processing',
            ],
            category: 'connection',
        };
    }

    if (errorLower.includes('billing')) {
        return {
            message: 'Service quota or billing issue detected.',
            suggestions: [
                'Check your account billing status',
                'Verify your subscription is active',
                'Contact support for quota-related issues',
                'Try using a different model or feature',
            ],
            category: 'auth',
        };
    }

    // Generic fallback with helpful diagnostics
    return {
        message: 'An unexpected error occurred while processing your request.',
        suggestions: [
            'Try submitting your request again',
            'Refresh the page and try once more',
            'Try using a different AI model from the dropdown',
            'Check your internet connection',
            'Clear your browser cache if issues persist',
            'Contact support if the problem continues',
        ],
        category: 'unknown',
    };
};

export const formatErrorMessage = (diagnostic: ErrorDiagnostic): string => {
    const suggestions = diagnostic.suggestions
        .map((suggestion, index) => `${index + 1}. ${suggestion}`)
        .join('\n');

    return `${diagnostic.message}\n\n🔧 Try these steps:\n${suggestions}`;
};

export const getErrorDiagnosticMessage = (error: unknown): string => {
    const diagnostic = generateErrorDiagnostic(error);
    return formatErrorMessage(diagnostic);
};
