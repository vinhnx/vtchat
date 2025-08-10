/**
 * Manual OpenRouter Verification Script
 *
 * This script can be run manually to verify OpenRouter integration with real API calls.
 * It tests that OpenRouter requests are authentic and not returning dummy responses.
 *
 * Usage:
 * 1. Set OPENROUTER_API_KEY environment variable
 * 2. Run: bun run packages/ai/__tests__/manual-openrouter-verification.ts
 *
 * Requirements verified:
 * - 2.3: OpenRouter responds with actual model response content
 * - 2.4: OpenRouter requests are sent to correct endpoints with proper authentication
 */
declare function verifyOpenRouterAuthenticity(): Promise<void>;
export { verifyOpenRouterAuthenticity };
//# sourceMappingURL=manual-openrouter-verification.d.ts.map