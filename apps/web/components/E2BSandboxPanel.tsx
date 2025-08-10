"use client";

import { useMemo, useState, useEffect } from "react";
import { Button, Card } from "@repo/ui";
import { TerminalSquare, Play as PlayIcon, Square, RotateCcw } from "lucide-react";
import type { ToolResult } from "@repo/shared/types";
import { useSandboxManager } from "@/hooks/use-sandbox-manager";

export function E2BSandboxPanel({
  toolResult,
}: {
  toolResult?: ToolResult;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<{ stdout?: string; stderr?: string; error?: string } | null>(null);
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [hostUrl, setHostUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<string>("javascript");
  const [editorLang, setEditorLang] = useState<"js" | "html" | "python">("javascript" as any);
  const [codeText, setCodeText] = useState<string>("");
  const [portInput, setPortInput] = useState<string>("");
  const [effectivePort, setEffectivePort] = useState<number | null>(null);
  const [timeoutMinutesInput, setTimeoutMinutesInput] = useState<string>("10");
  const [autoStopTimer, setAutoStopTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { startSandbox, stopSandbox } = useSandboxManager();

  // Extract files and sandbox info from tool result
  useEffect(() => {
    if (toolResult?.result) {
      const result = toolResult.result as any;

      // Handle startSandbox result
      if (result.sandboxId) {
        setSandboxId(result.sandboxId);
        setIsRunning(true);
        setOutput({ stdout: result.message || "Sandbox started successfully" });
        if (result.host) setHostUrl(result.host);
        if (typeof (result as any).port === "number") setEffectivePort((result as any).port);
      }

      // Handle openSandbox or tool-provided files
      if (result.files) {
        setFiles(result.files);
        const detectedLang = (result.language as string) || "javascript";
        setLanguage(detectedLang);
        const firstFilePath = Object.keys(result.files)[0];
        const initial = firstFilePath ? String(result.files[firstFilePath]) : "";
        setCodeText(initial);
        const ext = firstFilePath?.split(".").pop();
        const mapped: any = ext === "py" ? "python" : ext === "html" ? "html" : "js";
        setEditorLang(mapped);
      }

      // Handle execution results (markdown outputs)
      if (result.files?.["/OUTPUT.md"]) {
        setOutput({ stdout: result.files["/OUTPUT.md"] });
      } else if (result.files?.["/SANDBOX_INFO.md"]) {
        setOutput({ stdout: result.files["/SANDBOX_INFO.md"] });
      }
      if ((result as any).host) setHostUrl((result as any).host);
      if (typeof (result as any).port === "number") setEffectivePort((result as any).port);
    }
  }, [toolResult]);

  const handleRun = async () => {
    try {
      setIsRunning(true);
      // If there is a single file and user edited content, pass the edited content
      const nextFiles = { ...files };
      const filePaths = Object.keys(nextFiles);
      if (filePaths.length === 1) {
        nextFiles[filePaths[0]] = codeText;
      }

      const requestedPort = portInput.trim() ? parseInt(portInput.trim(), 10) : undefined;
      const requestedTimeout = timeoutMinutesInput.trim() ? Math.max(1, Math.min(30, parseInt(timeoutMinutesInput.trim(), 10))) : undefined;
      const result = await startSandbox({
        files: nextFiles,
        language: editorLang === "python" ? "python" : editorLang === "html" ? "html" : "javascript",
        ...(requestedPort ? { port: requestedPort } : {}),
        ...(requestedTimeout ? { timeoutMinutes: requestedTimeout } : {}),
      });
      
      setSandboxId(result.sandboxId);
      setIsRunning(true);
      setOutput({ stdout: result.message || "Sandbox started successfully" });
      if ((result as any).host) setHostUrl((result as any).host);
      if (typeof (result as any).port === "number") setEffectivePort((result as any).port);
      else if (requestedPort) setEffectivePort(requestedPort);

      // Schedule auto-stop timer to save costs
      if (autoStopTimer) {
        clearTimeout(autoStopTimer);
        setAutoStopTimer(null);
      }
      const minutes = requestedTimeout ?? 10;
      const t = setTimeout(() => {
        if (sandboxId) {
          stopSandbox(sandboxId).catch(() => {});
        }
        setIsRunning(false);
      }, minutes * 60 * 1000);
      setAutoStopTimer(t);
      
      // If there are output files, display them
      if (result.files?.["/OUTPUT.md"]) {
        setOutput({ stdout: result.files["/OUTPUT.md"] });
      } else if (result.files?.["/SANDBOX_INFO.md"]) {
        setOutput({ stdout: result.files["/SANDBOX_INFO.md"] });
      }
    } catch (error: any) {
      setOutput({ error: error.message || "Failed to start sandbox" });
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    if (sandboxId) {
      try {
        await stopSandbox(sandboxId);
        setIsRunning(false);
        setSandboxId(null);
        setOutput({ stdout: "Sandbox stopped" });
        if (autoStopTimer) {
          clearTimeout(autoStopTimer);
          setAutoStopTimer(null);
        }
      } catch (error: any) {
        setOutput({ error: error.message || "Failed to stop sandbox" });
      }
    }
  };

  const handleReset = () => {
    setFiles({});
    setLanguage("javascript");
    setEditorLang("js");
    setCodeText("");
    setOutput(null);
    setSandboxId(null);
    setHostUrl(null);
    setIsRunning(false);
    if (autoStopTimer) {
      clearTimeout(autoStopTimer);
      setAutoStopTimer(null);
    }
  };

  // Gracefully stop sandbox when navigating away (component unmount)
  useEffect(() => {
    return () => {
      if (autoStopTimer) clearTimeout(autoStopTimer);
      if (sandboxId) {
        stopSandbox(sandboxId).catch(() => {});
      }
    };
  }, [sandboxId, autoStopTimer, stopSandbox]);

  // Render file content for display
  const renderFiles = () => {
    if (Object.keys(files).length === 0) {
      return <div className="text-muted-foreground p-4">No files to display</div>;
    }

    return (
      <div className="space-y-4">
        {Object.entries(files).map(([path, content]) => (
          <div key={path} className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 text-sm font-medium flex items-center justify-between">
              <span>{path}</span>
              <span className="text-xs bg-background px-2 py-1 rounded">
                {path.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <pre className="m-0 p-3 bg-background/60 text-sm overflow-x-auto">
              <code>{String(content)}</code>
            </pre>
          </div>
        ))}
      </div>
    );
  };

  // Render output
  const renderOutput = () => {
    if (!output) {
      return <div className="text-muted-foreground p-4">Run code to see output</div>;
    }

    return (
      <div className="min-h-[280px] w-full rounded border bg-muted/40 p-3">
        {output.stdout && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1">Stdout</div>
            <pre className="whitespace-pre-wrap break-words text-sm">{output.stdout}</pre>
          </div>
        )}
        {output.stderr && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1">Stderr</div>
            <pre className="whitespace-pre-wrap break-words text-sm text-red-500">{output.stderr}</pre>
          </div>
        )}
        {output.error && (
          <div className="mb-3">
            <div className="text-xs font-semibold mb-1">Error</div>
            <pre className="whitespace-pre-wrap break-words text-sm text-red-500">{output.error}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full border-border/60 bg-background/80 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-5 w-5" />
          <div className="text-base font-semibold">E2B Sandbox</div>
        </div>
        <div className="flex items-center gap-3">
          {hostUrl && (
            <a
              href={hostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline text-primary hover:opacity-90"
            >
              Open Server
            </a>
          )}
          <span
            className={`text-[10px] px-2 py-1 rounded-full border ${
              isRunning ? "bg-green-500/10 border-green-500/40 text-green-600" : "bg-red-500/10 border-red-500/40 text-red-600"
            }`}
          >
            {isRunning ? "Running" : "Stopped"}
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {isDev ? "Unlimited in dev" : `${language.toUpperCase()} Sandbox`}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* File Panel */}
        <div className="w-full md:w-1/2 border-r p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Code</span>
              <div className="flex items-center gap-2 ml-3">
                <label className="text-sm text-muted-foreground">Language</label>
                <select
                  className="bg-background border rounded px-2 py-1 text-sm"
                  value={editorLang}
                  onChange={(e) => setEditorLang(e.target.value as any)}
                >
                  <option value="js">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <label className="text-sm text-muted-foreground">Port</label>
                <input
                  type="number"
                  min={1}
                  max={65535}
                  placeholder="8000"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  className="bg-background border rounded px-2 py-1 text-sm w-24"
                />
              </div>
              <div className="flex items-center gap-2 ml-3">
                <label className="text-sm text-muted-foreground">Timeout (min)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder="10"
                  value={timeoutMinutesInput}
                  onChange={(e) => setTimeoutMinutesInput(e.target.value)}
                  className="bg-background border rounded px-2 py-1 text-sm w-20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
                disabled={isRunning}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          {/* If a single file, allow inline editing. Otherwise show read-only files */}
          {Object.keys(files).length === 1 ? (
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              className="min-h-[280px] w-full rounded border bg-background/60 p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Write or paste your code here..."
            />
          ) : (
            <div className="max-h-96 overflow-y-auto">{renderFiles()}</div>
          )}
        </div>

        {/* Output Panel */}
        <div className="w-full md:w-1/2">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Output</h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRun}
                disabled={isRunning || (Object.keys(files).length === 0 && !codeText)}
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                {isRunning ? "Running..." : "Run"}
              </Button>
              {sandboxId && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleStop}
                  disabled={!isRunning}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">{renderOutput()}</div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 text-sm border-t bg-muted/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500" : "bg-red-500"}`} />
            {isRunning ? "Running" : "Stopped"}
          </span>
          {sandboxId && (
            <span className="text-muted-foreground">
              ID: {sandboxId.substring(0, 8)}...
            </span>
          )}
          {hostUrl && (
            <a
              href={hostUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline text-primary hover:opacity-90"
            >
              {hostUrl}
            </a>
          )}
          {effectivePort && (
            <span className="text-muted-foreground">Port: {effectivePort}</span>
          )}
        </div>
        <div className="text-muted-foreground">
          {isDev ? "Unlimited in dev" : `${language.toUpperCase()} Sandbox`}
        </div>
      </div>
    </Card>
  );
}