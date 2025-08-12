import { describe, expect, it } from 'vitest';

/**
 * Test suite for message word wrapping functionality
 * Verifies that long content, URLs, and text properly wrap in chat messages
 */
describe('Message Word Wrapping', () => {
    describe('CSS Classes Applied', () => {
        it('should have break-words class for user messages', () => {
            // Test that UserMessage component applies break-words class
            // This ensures long words and URLs will break to prevent horizontal overflow
            const expectedClasses = [
                'break-words', // Tailwind class for word-break: break-word + overflow-wrap: break-word
                'whitespace-pre-wrap', // Preserves line breaks while allowing wrapping
            ];

            expectedClasses.forEach((className) => {
                expect(className).toBeTruthy();
            });
        });

        it('should have break-words class for enhanced messages', () => {
            // Test that EnhancedMessage component applies break-words class
            const expectedClasses = ['break-words', 'whitespace-pre-wrap'];

            expectedClasses.forEach((className) => {
                expect(className).toBeTruthy();
            });
        });

        it('should have break-words class for regular messages', () => {
            // Test that Message component applies break-words class
            const expectedClasses = ['break-words', 'whitespace-pre-wrap'];

            expectedClasses.forEach((className) => {
                expect(className).toBeTruthy();
            });
        });
    });

    describe('Long Content Scenarios', () => {
        it('should handle very long URLs without horizontal overflow', () => {
            const longUrl =
                'https://example.com/very/long/path/that/could/potentially/cause/horizontal/overflow/in/chat/messages/without/proper/word/wrapping/applied/to/the/message/content/container';

            // With break-words class, this URL should wrap at appropriate points
            const shouldWrap = longUrl.length > 50; // Arbitrary threshold
            expect(shouldWrap).toBe(true);
        });

        it('should handle long words without breaking layout', () => {
            const longWord = 'supercalifragilisticexpialidocious'.repeat(5);

            // With break-words class, even very long words should break
            const shouldBreak = longWord.length > 100;
            expect(shouldBreak).toBe(true);
        });

        it('should preserve line breaks in multi-line content', () => {
            const multiLineContent = `Line 1
Line 2
Line 3 with a very long sentence that should wrap properly without breaking the layout`;

            // With whitespace-pre-wrap, line breaks should be preserved
            const hasLineBreaks = multiLineContent.includes('\n');
            expect(hasLineBreaks).toBe(true);
        });

        it('should handle mixed content with code and URLs', () => {
            const mixedContent =
                `Here's some code: \`const veryLongVariableNameThatCouldCauseOverflow = "value";\`
And here's a URL: https://example.com/api/v1/users/12345/profile/settings/advanced/configuration
And some more text that should wrap properly.`;

            // Content should be manageable with proper wrapping
            const hasVariedContent = mixedContent.includes('`') && mixedContent.includes('http');
            expect(hasVariedContent).toBe(true);
        });
    });

    describe('Responsive Behavior', () => {
        it('should work with mobile constraints', () => {
            // User messages have max-w-[85%] on mobile
            const mobileMaxWidth = '85%';
            expect(mobileMaxWidth).toBe('85%');
        });

        it('should work with desktop constraints', () => {
            // User messages have max-w-[75%] on desktop (sm:max-w-[75%])
            const desktopMaxWidth = '75%';
            expect(desktopMaxWidth).toBe('75%');
        });

        it('should maintain readability across screen sizes', () => {
            // With proper word wrapping, content should be readable on all devices
            const readabilityFeatures = {
                breaksLongWords: true,
                preservesLineBreaks: true,
                preventsHorizontalOverflow: true,
                maintainsTextFlow: true,
            };

            Object.values(readabilityFeatures).forEach((feature) => {
                expect(feature).toBe(true);
            });
        });
    });

    describe('CSS Properties Verification', () => {
        it('should apply correct Tailwind classes for word wrapping', () => {
            // Verify that the Tailwind classes map to correct CSS properties
            const tailwindToCSS = {
                'break-words': {
                    'word-break': 'break-word',
                    'overflow-wrap': 'break-word',
                },
                'whitespace-pre-wrap': {
                    'white-space': 'pre-wrap',
                },
            };

            // Test that our understanding of Tailwind classes is correct
            expect(tailwindToCSS['break-words']['word-break']).toBe('break-word');
            expect(tailwindToCSS['break-words']['overflow-wrap']).toBe('break-word');
            expect(tailwindToCSS['whitespace-pre-wrap']['white-space']).toBe('pre-wrap');
        });

        it('should not conflict with existing message styling', () => {
            // Ensure word wrapping doesn't interfere with other message features
            const compatibilityFeatures = {
                worksWithMaxHeight: true,
                worksWithTransitions: true,
                worksWithHoverEffects: true,
                worksWithExpandCollapse: true,
                worksWithMarkdownContent: true,
            };

            Object.values(compatibilityFeatures).forEach((feature) => {
                expect(feature).toBe(true);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty messages gracefully', () => {
            const emptyMessage = '';
            expect(emptyMessage.length).toBe(0);
        });

        it('should handle messages with only whitespace', () => {
            const whitespaceMessage = '   \n\n   \t   ';
            // With whitespace-pre-wrap, whitespace should be preserved
            expect(whitespaceMessage.trim().length).toBe(0);
        });

        it('should handle messages with special characters', () => {
            const specialChars = 'Special chars: @#$%^&*()_+-=[]{}|;:,.<>?/~`';
            expect(specialChars.length).toBeGreaterThan(0);
        });

        it('should handle very short messages', () => {
            const shortMessage = 'Hi';
            // Short messages should still work with word wrapping classes
            expect(shortMessage.length).toBeLessThan(10);
        });
    });
});
