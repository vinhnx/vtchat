import { Sandbox } from "@e2b/code-interpreter";
import { tool } from "ai";
import { z } from "zod";
import { openSandbox } from "./open-sandbox";

// E2B Code Sandbox - Premium Feature for VT+ Users Only
// Removed client-side sandbox implementations (Sandpack/Pyodide) to focus on E2B

// E2B Code Sandbox - Premium Feature for VT+ Users Only
export const startSandbox = () =>
    tool({
        description:
            "Create and run code in a secure E2B cloud sandbox. Premium feature for VT+ users only. Limited to 2 successful runs per day.",
        parameters: z.object({
            files: z
                .record(z.string(), z.string())
                .describe("Files to create in the sandbox (path -> content)"),
            language: z
                .enum(["python", "javascript", "typescript", "bash", "html", "css"])
                .default("python")
                .describe("Primary programming language"),
            cmd: z
                .string()
                .optional()
                .describe("Command to execute (e.g., 'python main.py', 'npm start')"),
            port: z.number().optional().describe("Port for web servers (e.g., 3000, 8000)"),
            internetAccess: z
                .boolean()
                .default(false)
                .describe("Allow internet access (disabled by default for security)"),
            timeoutMinutes: z
                .number()
                .min(1)
                .max(30)
                .default(10)
                .describe("Sandbox timeout in minutes (max 30 for cost efficiency)"),
        }),
        // NOTE: keep this server-side so it can use E2B_API_KEY
        execute: async ({ files, language, cmd, port, internetAccess, timeoutMinutes }) => {
            // Import rate limiting and user tier checking utilities
            const { checkSandboxRateLimit, requireVTPlusUser } = await import(
                "../utils/sandbox-limits"
            );

            try {
                // 1. PREMIUM GATING: Only VT+ users can access sandbox
                await requireVTPlusUser();

                // 2. RATE LIMITING: Check daily usage limits (2 successful runs per day for VT+)
                await checkSandboxRateLimit();

                // 3. COST OPTIMIZATION: Create sandbox with minimal resources and timeout
                const sbx = await Sandbox.create({
                    // Use minimal timeout for cost efficiency (convert minutes to milliseconds)
                    timeoutMs: timeoutMinutes * 60 * 1000,
                    // Disable internet access by default for security and cost
                    allowInternetAccess: internetAccess,
                    // Add metadata for tracking and management
                    metadata: {
                        userTier: "VT_PLUS",
                        language: language,
                        createdAt: new Date().toISOString(),
                        source: "vtchat-ai-tool",
                    },
                    // Minimal environment variables
                    envs: {
                        PYTHONUNBUFFERED: "1",
                        NODE_ENV: "development",
                    },
                });

                const returnFiles: Record<string, string> = { ...files };

                // 4. FILE PROCESSING: Write files with network binding fixes
                if (files && Object.keys(files).length) {
                    const processedFiles: { path: string; data: string }[] = [];

                    Object.entries(files).forEach(([path, data]) => {
                        let processedData = data;

                        // Fix network binding for E2B compatibility
                        if (path.endsWith(".py")) {
                            processedData = processedData
                                .replace(/HTTPServer\(\("", (\d+)\)/g, 'HTTPServer(("0.0.0.0", $1)')
                                .replace(
                                    /HTTPServer\(\('' ?, ?(\d+)\)/g,
                                    'HTTPServer(("0.0.0.0", $1)',
                                )
                                .replace(
                                    /HTTPServer\(\("127\.0\.0\.1", (\d+)\)/g,
                                    'HTTPServer(("0.0.0.0", $1)',
                                )
                                .replace(
                                    /HTTPServer\(\("localhost", (\d+)\)/g,
                                    'HTTPServer(("0.0.0.0", $1)',
                                );
                        }

                        if (path.endsWith(".js") || path.endsWith(".ts")) {
                            processedData = processedData
                                .replace(
                                    /listen\((\d+), ?['"]127\.0\.0\.1['"]\)/g,
                                    'listen($1, "0.0.0.0")',
                                )
                                .replace(
                                    /listen\((\d+), ?['"]localhost['"]\)/g,
                                    'listen($1, "0.0.0.0")',
                                );
                        }

                        processedFiles.push({ path, data: processedData });
                    });

                    await sbx.files.write(processedFiles as any);
                }

                // 5. DEPENDENCY INSTALLATION: Install minimal required dependencies
                if (
                    language === "python" &&
                    Object.keys(files).some((path) => path.endsWith(".py"))
                ) {
                    try {
                        // Only install essential packages to reduce startup time
                        await sbx.commands.run("pip install --no-cache-dir requests", {
                            background: false,
                        } as any);
                    } catch (installError) {
                        // Log but don't fail - dependencies are optional
                        console.warn("Optional dependency installation failed:", installError);
                    }
                }

                // 6. COMMAND EXECUTION: Run user code with proper error handling
                if (cmd) {
                    let actualCmd = cmd;

                    // Smart command detection for Python HTTP servers
                    if (cmd.includes("python -m http.server") && files["/main.py"]) {
                        const mainPyContent = files["/main.py"];
                        if (
                            mainPyContent.includes("HTTPServer") ||
                            mainPyContent.includes("serve_forever")
                        ) {
                            actualCmd = "python /main.py";
                        }
                    }

                    // Determine if this is a server command
                    const isServerCommand =
                        actualCmd.includes("http.server") ||
                        actualCmd.includes("serve") ||
                        actualCmd.includes("npm start") ||
                        actualCmd.includes("python /main.py");

                    if (isServerCommand) {
                        // Use provided port or default to 8000 for server processes
                        const effectivePort = port || 8000;
                        // Run server commands in background
                        const proc = await sbx.commands.run(actualCmd, { background: true } as any);

                        // Give the server some time to boot
                        await new Promise((resolve) => setTimeout(resolve, 1200));

                        // Test server connectivity with a brief retry loop
                        try {
                            let lastStdout = "";
                            let success = false;
                            for (let attempt = 1; attempt <= 3; attempt++) {
                                const probe = await sbx.commands.run(
                                    `curl -s --max-time 2 http://localhost:${effectivePort} || echo "Server not responding"`,
                                    { background: false } as any,
                                );
                                lastStdout = probe.stdout || "";
                                if (lastStdout && !lastStdout.includes("Server not responding")) {
                                    success = true;
                                    break;
                                }
                                // small backoff before next probe
                                await new Promise((r) => setTimeout(r, 1000));
                            }

                            returnFiles["/SANDBOX_INFO.md"] = `# Sandbox Information

## Status
${success ? "✅ Server started successfully" : "⚠️ Server may not be responding"}

## Command
\`${actualCmd}\`

## Port
${effectivePort}

## Server Response
${lastStdout || "No response"}

## Initial Output
STDOUT: ${proc.stdout || "No output"}
STDERR: ${proc.stderr || "No errors"}

## Access URL
Your server is accessible at the provided host URL.
`;
                        } catch (testError) {
                            returnFiles["/SANDBOX_INFO.md"] = `# Sandbox Information

## Status
⚠️ Server may not be responding

## Command
\`${actualCmd}\`

## Error
${testError}

## Initial Output
STDOUT: ${proc.stdout || "No output"}
STDERR: ${proc.stderr || "No errors"}
`;
                        }
                    } else {
                        // Run regular commands in foreground
                        const proc = await sbx.commands.run(actualCmd, {
                            background: false,
                        } as any);

                        returnFiles["/OUTPUT.md"] = `# Command Output

## Command
\`${actualCmd}\`

## STDOUT
\`\`\`
${proc.stdout || "No output"}
\`\`\`

## STDERR
\`\`\`
${proc.stderr || "No errors"}
\`\`\`

## Exit Code
${proc.exitCode || 0}
`;
                    }
                }

                // 7. GENERATE PUBLIC URL: Get host URL for web servers
                let host: string | null = null;
                try {
                    // If a server command is being run, use the effective port (default 8000)
                    const effectivePort = port || 8000;
                    host = await (sbx as any).getHost(effectivePort);
                } catch (hostErr) {
                    console.warn("[sandbox] getHost failed; continuing without host URL", hostErr);
                    host = null;
                }

                // 8. TRACK SUCCESSFUL USAGE: Increment rate limit counter
                const { trackSandboxUsage } = await import("../utils/sandbox-limits");
                await trackSandboxUsage();

                return {
                    sandboxId: (sbx as any).sandboxId,
                    host: host ? `https://${host}` : null,
                    port: (typeof port === "number" && port) ? port : 8000,
                    files: returnFiles,
                    language,
                    timeoutMinutes,
                    internetAccess,
                    success: true,
                    message:
                        "Sandbox created successfully! This counts as 1 of your 2 daily sandbox runs.",
                };
            } catch (error: any) {
                // Handle specific E2B errors
                if (error.name === "RateLimitError" || error.message?.includes("rate limit")) {
                    throw new Error("E2B rate limit exceeded. Please try again later.");
                }

                if (error.message?.includes("VT+ required")) {
                    throw new Error(
                        "Sandbox feature requires VT+ subscription. Upgrade to access code execution.",
                    );
                }

                if (error.message?.includes("daily limit")) {
                    throw new Error(
                        "Daily sandbox limit reached (2/2). Limit resets at midnight UTC.",
                    );
                }

                // Generic error handling
                throw new Error(`Sandbox creation failed: ${error.message || "Unknown error"}`);
            }
        },
    });

// E2B Sandbox Management - Stop/cleanup sandbox
export const stopSandbox = () =>
    tool({
        description:
            "Stop and cleanup an E2B sandbox by ID. Helps manage costs by terminating unused sandboxes.",
        parameters: z.object({
            sandboxId: z.string().describe("The E2B sandbox ID to stop"),
        }),
        execute: async ({ sandboxId }) => {
            try {
                // Connect to the existing sandbox
                const sbx = await (Sandbox as any).connect(sandboxId);

                // Check if sandbox is still running
                const isRunning = (await sbx.isRunning?.()) || true; // Fallback to true if method doesn't exist

                if (isRunning) {
                    // Gracefully stop the sandbox
                    await sbx.kill();

                    return {
                        success: true,
                        message: `Sandbox ${sandboxId} stopped successfully.`,
                        sandboxId,
                    };
                } else {
                    return {
                        success: true,
                        message: `Sandbox ${sandboxId} was already stopped.`,
                        sandboxId,
                    };
                }
            } catch (error: any) {
                // Handle case where sandbox doesn't exist or is already stopped
                if (error.message?.includes("not found") || error.message?.includes("404")) {
                    return {
                        success: true,
                        message: `Sandbox ${sandboxId} not found (may already be stopped).`,
                        sandboxId,
                    };
                }

                throw new Error(`Failed to stop sandbox ${sandboxId}: ${error.message}`);
            }
        },
    });

// E2B Sandbox Management - List active sandboxes
export const listSandboxes = () =>
    tool({
        description:
            "List all active E2B sandboxes for the current user. Helps manage costs by showing running sandboxes.",
        parameters: z.object({}),
        execute: async () => {
            try {
                // List all running sandboxes
                const sandboxes = await Sandbox.list();

                return {
                    success: true,
                    count: sandboxes.length,
                    sandboxes: sandboxes.map((sb: any) => ({
                        id: sb.sandboxId || sb.id,
                        template: sb.template || "base",
                        createdAt: sb.startedAt || sb.createdAt,
                        metadata: sb.metadata || {},
                    })),
                    message: `Found ${sandboxes.length} active sandbox${sandboxes.length !== 1 ? "es" : ""}.`,
                };
            } catch (error: any) {
                throw new Error(`Failed to list sandboxes: ${error.message}`);
            }
        },
    });

// Export openSandbox for client-side usage
export { openSandbox };
