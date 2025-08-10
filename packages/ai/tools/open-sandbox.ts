import { tool } from "ai";
import { z } from "zod";

/**
 * Client-side sandbox tool for lightweight code execution
 * Available to all users for simple code snippets
 */
export const openSandbox = () =>
  tool({
    description:
      "Create and run code in a lightweight client-side sandbox. Available to all users for simple code execution.",
    parameters: z.object({
      files: z
        .record(z.string(), z.string())
        .describe("Files to create in the sandbox (path -> content)"),
      language: z
        .enum(["python", "javascript", "typescript", "html", "css"])
        .default("javascript")
        .describe("Primary programming language"),
    }),
    execute: async ({ files, language }) => {
      // For client-side sandbox, we'll return the files and language
      // The actual execution will happen in the browser
      return {
        files,
        language,
        success: true,
        message: "Sandbox ready for client-side execution",
      };
    },
  });