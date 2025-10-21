import { type Tool, tool } from 'ai';
import { z } from 'zod';

const sandboxCommandSchema = z.object({
    command: z
        .string()
        .min(1)
        .max(8000)
        .describe('Shell command to execute inside an isolated bash environment.'),
    timeoutMs: z
        .number()
        .int()
        .min(1000)
        .max(120000)
        .optional()
        .describe('Optional timeout in milliseconds before the command is terminated.'),
    cwd: z
        .string()
        .optional()
        .describe('Optional working directory for the command.'),
    stdin: z
        .string()
        .optional()
        .describe('Optional standard input to provide to the command.'),
});

export const sandboxTools = (): Partial<Record<'bash', Tool>> => ({
    bash: tool({
        description:
            'Execute a bash command with Anthropic sandbox runtime isolation. Use for file or system operations when enabled.',
        parameters: sandboxCommandSchema,
        execute: async ({ command, timeoutMs, cwd, stdin }) => {
            const response = await fetch('/api/tools/sandbox', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ command, timeoutMs, cwd, stdin }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Sandboxed bash command failed: ${errorText}`);
            }

            const result = await response.json();
            return result;
        },
    }),
});
