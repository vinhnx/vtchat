import { SandboxManager } from '@anthropic-ai/sandbox-runtime';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { spawn } from 'node:child_process';
import { realpath, stat } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const requestSchema = z.object({
    command: z
        .string()
        .min(1)
        .max(8000)
        .describe('Shell command to execute inside the sandbox.'),
    timeoutMs: z
        .number()
        .int()
        .min(1000)
        .max(120000)
        .optional(),
    cwd: z.string().optional(),
    stdin: z.string().optional(),
});

const MAX_OUTPUT_LENGTH = 256 * 1024;
let sandboxInitPromise: Promise<void> | null = null;
let cachedProjectRoot: string | null = null;

function appendWithLimit(current: string, chunk: string): string {
    const combined = current + chunk;
    if (combined.length > MAX_OUTPUT_LENGTH) {
        return combined.slice(combined.length - MAX_OUTPUT_LENGTH);
    }
    return combined;
}

async function ensureSandboxInitialized(): Promise<void> {
    if (!SandboxManager.isSupportedPlatform()) {
        throw new Error('Sandbox runtime is only supported on Linux or macOS hosts.');
    }

    if (!sandboxInitPromise) {
        sandboxInitPromise = SandboxManager.initialize().catch((error) => {
            sandboxInitPromise = null;
            throw error;
        });
    }

    await sandboxInitPromise;
}

async function getProjectRoot(): Promise<string> {
    if (cachedProjectRoot) {
        return cachedProjectRoot;
    }

    try {
        cachedProjectRoot = await realpath(process.cwd());
    } catch {
        cachedProjectRoot = process.cwd();
    }

    return cachedProjectRoot;
}

async function resolveWorkingDirectory(requestedCwd?: string): Promise<string | undefined> {
    if (!requestedCwd) {
        return undefined;
    }

    const projectRoot = await getProjectRoot();
    const resolvedPath = resolve(projectRoot, requestedCwd);
    let normalizedPath: string;

    try {
        normalizedPath = await realpath(resolvedPath);
    } catch {
        throw new Error('Requested working directory does not exist.');
    }

    const stats = await stat(normalizedPath);
    if (!stats.isDirectory()) {
        throw new Error('Working directory must reference a directory.');
    }

    const relativePath = relative(projectRoot, normalizedPath);
    const isOutsideProject = relativePath === ''
        ? false
        : relativePath.startsWith('..') || relativePath.split(sep).includes('..');

    if (isOutsideProject) {
        throw new Error('Working directory must be within the project workspace.');
    }

    return normalizedPath;
}

async function runSandboxedCommand(
    command: string,
    options: { cwd?: string; stdin?: string; timeoutMs: number; },
): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    timedOut: boolean;
    durationMs: number;
}> {
    const wrapped = await SandboxManager.wrapWithSandbox(command);

    return new Promise((resolve, reject) => {
        const child = spawn(wrapped, {
            cwd: options.cwd,
            shell: true,
            env: process.env,
        });

        let stdout = '';
        let stderr = '';
        let timedOut = false;
        const start = Date.now();

        const timer = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, options.timeoutMs);

        child.stdout?.setEncoding('utf8');
        child.stderr?.setEncoding('utf8');

        child.stdout?.on('data', (chunk: string) => {
            stdout = appendWithLimit(stdout, chunk);
        });

        child.stderr?.on('data', (chunk: string) => {
            stderr = appendWithLimit(stderr, chunk);
        });

        child.on('error', (error) => {
            clearTimeout(timer);
            reject(error);
        });

        child.on('close', (code) => {
            clearTimeout(timer);
            const annotatedStderr = SandboxManager.annotateStderrWithSandboxFailures(
                command,
                stderr,
            );
            resolve({
                stdout,
                stderr: annotatedStderr,
                exitCode: typeof code === 'number' ? code : -1,
                timedOut,
                durationMs: Date.now() - start,
            });
        });

        if (options.stdin) {
            child.stdin?.write(options.stdin);
        }
        child.stdin?.end();
    });
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.json();
        const { command, timeoutMs, cwd, stdin } = requestSchema.parse(rawBody);

        try {
            await ensureSandboxInitialized();
        } catch (sandboxError) {
            const message = sandboxError instanceof Error
                ? sandboxError.message
                : 'Failed to initialize sandbox runtime.';
            return NextResponse.json({ error: message }, { status: 500 });
        }

        let workingDirectory: string | undefined;

        try {
            workingDirectory = await resolveWorkingDirectory(cwd);
        } catch (validationError) {
            const message = validationError instanceof Error
                ? validationError.message
                : 'Invalid working directory requested for sandbox execution.';
            return NextResponse.json({ error: message }, { status: 400 });
        }

        const timeout = timeoutMs ?? 60_000;
        const commandLine = `bash -lc ${JSON.stringify(command)}`;
        const result = await runSandboxedCommand(commandLine, {
            cwd: workingDirectory,
            stdin,
            timeoutMs: timeout,
        });

        let sandboxed = false;
        try {
            sandboxed = SandboxManager.isSandboxingEnabled();
        } catch {
            // If dependency checks fail, fall back to reporting unsandboxed execution.
            sandboxed = false;
        }

        return NextResponse.json({ ...result, sandboxed });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const message = error instanceof Error
            ? error.message
            : 'Unexpected sandbox execution error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
