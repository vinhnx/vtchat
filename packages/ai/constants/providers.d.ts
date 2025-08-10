/**
 * AI Provider constants and types
 * Separated to avoid circular dependencies
 */
export declare const Providers: {
    readonly OPENAI: "openai";
    readonly ANTHROPIC: "anthropic";
    readonly TOGETHER: "together";
    readonly GOOGLE: "google";
    readonly FIREWORKS: "fireworks";
    readonly XAI: "xai";
    readonly OPENROUTER: "openrouter";
    readonly LMSTUDIO: "lmstudio";
    readonly OLLAMA: "ollama";
};
export type ProviderEnumType = (typeof Providers)[keyof typeof Providers];
//# sourceMappingURL=providers.d.ts.map