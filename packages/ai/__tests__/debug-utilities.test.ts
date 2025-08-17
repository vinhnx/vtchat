import { describe, expect, it } from 'vitest';
import { inspectWarnings, inspectRequestBody } from '../utils/debug-utils';

describe('Debug Utilities', () => {
  it('should inspect warnings from AI SDK responses', () => {
    // Mock AI SDK response with warnings
    const mockResponse = {
      warnings: [
        'Unsupported feature: tool_choice',
        'Max tokens exceeded, truncating input'
      ],
      text: 'Hello, world!'
    };

    // Capture console output
    const originalWarn = console.warn;
    const warnings: string[] = [];
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
      // Test the inspectWarnings function
      const hasWarnings = inspectWarnings(mockResponse, 'Test Operation');
      
      // Verify it detected warnings
      expect(hasWarnings).toBe(true);
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.includes('Test Operation'))).toBe(true);
    } finally {
      // Restore console
      console.warn = originalWarn;
    }
  });

  it('should handle responses without warnings', () => {
    // Mock AI SDK response without warnings
    const mockResponse = {
      text: 'Hello, world!'
    };

    // Test the inspectWarnings function
    const hasWarnings = inspectWarnings(mockResponse, 'Test Operation');
    
    // Verify it didn't find warnings
    expect(hasWarnings).toBe(false);
  });

  it('should inspect request bodies from AI SDK responses', () => {
    // Mock AI SDK response with request body
    const mockResponse = {
      request: {
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }]
        })
      },
      text: 'Hello, world!'
    };

    // Capture console output
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => logs.push(args.join(' '));

    try {
      // Test the inspectRequestBody function
      const hasRequestBody = inspectRequestBody(mockResponse, 'Test Operation');
      
      // Verify it found the request body
      expect(hasRequestBody).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some(log => log.includes('Test Operation'))).toBe(true);
    } finally {
      // Restore console
      console.log = originalLog;
    }
  });

  it('should handle responses without request bodies', () => {
    // Mock AI SDK response without request body
    const mockResponse = {
      text: 'Hello, world!'
    };

    // Test the inspectRequestBody function
    const hasRequestBody = inspectRequestBody(mockResponse, 'Test Operation');
    
    // Verify it didn't find a request body
    expect(hasRequestBody).toBe(false);
  });
});