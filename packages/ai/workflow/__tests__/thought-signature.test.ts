import { describe, expect, test } from 'vitest';

describe('Thought Signature Support', () => {
    describe('Thought Signature Capture', () => {
        test('should handle thought signature from tool call chunk (OpenAI compatibility format)', () => {
            const mockChunk = {
                type: 'tool-call' as const,
                toolCallId: 'test-call-1',
                toolName: 'test_function',
                args: { param: 'value' },
                extra_content: {
                    google: {
                        thought_signature: 'test-signature-abc123',
                    },
                },
            };

            const thoughtSignature =
                (mockChunk as any)?.extraContent?.google?.thoughtSignature ||
                (mockChunk as any)?.extra_content?.google?.thought_signature ||
                (mockChunk as any)?.thoughtSignature ||
                undefined;

            expect(thoughtSignature).toBe('test-signature-abc123');
        });

        test('should handle thought signature from tool call chunk (alternative format)', () => {
            const mockChunk = {
                type: 'tool-call' as const,
                toolCallId: 'test-call-2',
                toolName: 'test_function',
                args: { param: 'value' },
                thoughtSignature: 'alternative-signature-xyz789',
            };

            const thoughtSignature =
                (mockChunk as any)?.extraContent?.google?.thoughtSignature ||
                (mockChunk as any)?.extra_content?.google?.thought_signature ||
                (mockChunk as any)?.thoughtSignature ||
                undefined;

            expect(thoughtSignature).toBe('alternative-signature-xyz789');
        });

        test('should return undefined when no thought signature present', () => {
            const mockChunk = {
                type: 'tool-call' as const,
                toolCallId: 'test-call-3',
                toolName: 'test_function',
                args: { param: 'value' },
            };

            const thoughtSignature =
                (mockChunk as any)?.extraContent?.google?.thoughtSignature ||
                (mockChunk as any)?.extra_content?.google?.thought_signature ||
                (mockChunk as any)?.thoughtSignature ||
                undefined;

            expect(thoughtSignature).toBeUndefined();
        });

        test('should collect multiple thought signatures from sequential tool calls', () => {
            const thoughtSignatures: string[] = [];

            const mockChunks = [
                {
                    type: 'tool-call' as const,
                    toolCallId: 'call-1',
                    extra_content: {
                        google: {
                            thought_signature: 'signature-A',
                        },
                    },
                },
                {
                    type: 'tool-call' as const,
                    toolCallId: 'call-2',
                    extra_content: {
                        google: {
                            thought_signature: 'signature-B',
                        },
                    },
                },
                {
                    type: 'tool-call' as const,
                    toolCallId: 'call-3',
                    extra_content: {
                        google: {
                            thought_signature: 'signature-C',
                        },
                    },
                },
            ];

            for (const chunk of mockChunks) {
                const thoughtSignature =
                    (chunk as any)?.extraContent?.google?.thoughtSignature ||
                    (chunk as any)?.extra_content?.google?.thought_signature ||
                    (chunk as any)?.thoughtSignature ||
                    undefined;

                if (thoughtSignature) {
                    thoughtSignatures.push(thoughtSignature);
                }
            }

            expect(thoughtSignatures).toHaveLength(3);
            expect(thoughtSignatures).toEqual(['signature-A', 'signature-B', 'signature-C']);
        });

        test('should capture thought signatures for parallel function calls', () => {
            const thoughtSignatures: string[] = [];

            const mockChunks = [
                {
                    type: 'tool-call' as const,
                    toolCallId: 'parallel-1',
                    toolName: 'get_weather',
                    args: { city: 'Paris' },
                    extra_content: {
                        google: {
                            thought_signature: 'parallel-signature-A',
                        },
                    },
                },
                {
                    type: 'tool-call' as const,
                    toolCallId: 'parallel-2',
                    toolName: 'get_weather',
                    args: { city: 'London' },
                    extra_content: {
                        google: {
                            thought_signature: 'parallel-signature-B',
                        },
                    },
                },
            ];

            for (const chunk of mockChunks) {
                const thoughtSignature =
                    (chunk as any)?.extraContent?.google?.thoughtSignature ||
                    (chunk as any)?.extra_content?.google?.thought_signature ||
                    (chunk as any)?.thoughtSignature ||
                    undefined;

                if (thoughtSignature) {
                    thoughtSignatures.push(thoughtSignature);
                }
            }

            expect(thoughtSignatures).toHaveLength(2);
        });
    });
});
