import { z } from "zod";
import { openSandbox } from "./open-sandbox";
export declare const startSandbox: () => import("ai").Tool<z.ZodObject<{
    files: z.ZodRecord<z.ZodString, z.ZodString>;
    language: z.ZodDefault<z.ZodEnum<["python", "javascript", "typescript", "bash", "html", "css"]>>;
    cmd: z.ZodOptional<z.ZodString>;
    port: z.ZodOptional<z.ZodNumber>;
    internetAccess: z.ZodDefault<z.ZodBoolean>;
    timeoutMinutes: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    files: Record<string, string>;
    language: "python" | "javascript" | "typescript" | "html" | "css" | "bash";
    timeoutMinutes: number;
    internetAccess: boolean;
    cmd?: string | undefined;
    port?: number | undefined;
}, {
    files: Record<string, string>;
    language?: "python" | "javascript" | "typescript" | "html" | "css" | "bash" | undefined;
    timeoutMinutes?: number | undefined;
    internetAccess?: boolean | undefined;
    cmd?: string | undefined;
    port?: number | undefined;
}>, {
    sandboxId: any;
    host: string | null;
    files: Record<string, string>;
    language: "python" | "javascript" | "typescript" | "html" | "css" | "bash";
    timeoutMinutes: number;
    internetAccess: boolean;
    success: boolean;
    message: string;
}> & {
    execute: (args: {
        files: Record<string, string>;
        language: "python" | "javascript" | "typescript" | "html" | "css" | "bash";
        timeoutMinutes: number;
        internetAccess: boolean;
        cmd?: string | undefined;
        port?: number | undefined;
    }, options: import("ai").ToolExecutionOptions) => PromiseLike<{
        sandboxId: any;
        host: string | null;
        files: Record<string, string>;
        language: "python" | "javascript" | "typescript" | "html" | "css" | "bash";
        timeoutMinutes: number;
        internetAccess: boolean;
        success: boolean;
        message: string;
    }>;
};
export declare const stopSandbox: () => import("ai").Tool<z.ZodObject<{
    sandboxId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sandboxId: string;
}, {
    sandboxId: string;
}>, {
    success: boolean;
    message: string;
    sandboxId: string;
}> & {
    execute: (args: {
        sandboxId: string;
    }, options: import("ai").ToolExecutionOptions) => PromiseLike<{
        success: boolean;
        message: string;
        sandboxId: string;
    }>;
};
export declare const listSandboxes: () => import("ai").Tool<z.ZodObject<{}, "strip", z.ZodTypeAny, {}, {}>, {
    success: boolean;
    count: number;
    sandboxes: {
        id: any;
        template: any;
        createdAt: any;
        metadata: any;
    }[];
    message: string;
}> & {
    execute: (args: {}, options: import("ai").ToolExecutionOptions) => PromiseLike<{
        success: boolean;
        count: number;
        sandboxes: {
            id: any;
            template: any;
            createdAt: any;
            metadata: any;
        }[];
        message: string;
    }>;
};
export { openSandbox };
//# sourceMappingURL=sandbox.d.ts.map