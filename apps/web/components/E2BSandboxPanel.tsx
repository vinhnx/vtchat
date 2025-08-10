"use client";

import { useState, useEffect } from "react";
import { Button, Card, CodeBlock } from "@repo/ui";
import { Terminal, Play, Square, RotateCcw } from "lucide-react";
import type { ToolResult } from "@repo/shared/types";
import { useSandboxManager } from "@/hooks/use-sandbox-manager";

export function E2BSandboxPanel({
  toolResult,
}: {
  toolResult?: ToolResult;
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [sandboxId, setSandboxId] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState<string>("javascript");
  const { startSandbox, stopSandbox } = useSandboxManager();

  // Extract files and sandbox info from tool result
  useEffect(() => {
    if (toolResult?.result) {
      const result = toolResult.result as any;
      
      // Handle startSandbox result
      if (result.sandboxId) {
        setSandboxId(result.sandboxId);
        setIsRunning(true);
        setOutput(result.message || "Sandbox started successfully");
      }
      
      // Handle openSandbox result
      if (result.files) {
        setFiles(result.files);
        setLanguage(result.language || "javascript");
      }
      
      // Handle execution results
      if (result.files?.["/OUTPUT.md"]) {
        setOutput(result.files["/OUTPUT.md"]);
      } else if (result.files?.["/SANDBOX_INFO.md"]) {
        setOutput(result.files["/SANDBOX_INFO.md"]);
      }
    }
  }, [toolResult]);

  const handleRun = async () => {
    try {
      const result = await startSandbox({
        files,
        language,
      });
      
      setSandboxId(result.sandboxId);
      setIsRunning(true);
      setOutput(result.message || "Sandbox started successfully");
      
      // If there are output files, display them
      if (result.files?.["/OUTPUT.md"]) {
        setOutput(result.files["/OUTPUT.md"]);
      } else if (result.files?.["/SANDBOX_INFO.md"]) {
        setOutput(result.files["/SANDBOX_INFO.md"]);
      }
    } catch (error: any) {
      setOutput(`Error: ${error.message || "Failed to start sandbox"}`);
    }
  };

  const handleStop = async () => {
    if (sandboxId) {
      try {
        await stopSandbox(sandboxId);
        setIsRunning(false);
        setSandboxId(null);
        setOutput("Sandbox stopped");
      } catch (error: any) {
        setOutput(`Error: ${error.message || "Failed to stop sandbox"}`);
      }
    }
  };

  const handleReset = () => {
    setFiles({});
    setLanguage("javascript");
    setOutput("");
    setSandboxId(null);
    setIsRunning(false);
  };

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
            <CodeBlock
              code={content}
              lang={path.split('.').pop() || "text"}
              showHeader={false}
              className="border-0 rounded-none"
            />
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
      <CodeBlock
        code={output}
        lang="markdown"
        showHeader={false}
        className="border-0 rounded-none"
      />
    );
  };

  return (
    <Card className="w-full border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row">
        {/* File Panel */}
        <div className="w-full md:w-1/2 border-r p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Code Files
            </h3>
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
          <div className="max-h-96 overflow-y-auto">
            {renderFiles()}
          </div>
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
                disabled={isRunning || Object.keys(files).length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
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
          <div className="max-h-96 overflow-y-auto">
            {renderOutput()}
          </div>
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
        </div>
        <div className="text-muted-foreground">
          {language.toUpperCase()} Sandbox
        </div>
      </div>
    </Card>
  );
}