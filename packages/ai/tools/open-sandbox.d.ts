import { z } from "zod";
/**
 * Client-side sandbox tool for lightweight code execution
 * Available to all users for simple code snippets
 */
export declare const openSandbox: () => import("ai").Tool<z.ZodObject<{
    files: z.ZodRecord<z.ZodString, z.ZodString>;
    language: z.ZodDefault<z.ZodEnum<["python", "javascript", "typescript", "html", "css"]>>;
}, "strip", z.ZodTypeAny, {
    files: Record<string, string>;
    language: "python" | "javascript" | "typescript" | "html" | "css";
}, {
    files: Record<string, string>;
    language?: "python" | "javascript" | "typescript" | "html" | "css" | undefined;
}>, {
    files: Record<string, string>;
    language: "python" | "javascript" | "typescript" | "html" | "css";
    success: boolean;
    message: string;
}> & {
    execute: (args: {
        files: Record<string, string>;
        language: "python" | "javascript" | "typescript" | "html" | "css";
    }, options: import("ai").ToolExecutionOptions) => PromiseLike<{
        files: Record<string, string>;
        language: "python" | "javascript" | "typescript" | "html" | "css";
        success: boolean;
        message: string;
    }>;
};
//# sourceMappingURL=open-sandbox.d.ts.map