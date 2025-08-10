"use client";

import { useMemo, useState, useEffect } from "react";
import { executeCode, getRemainingExecutions } from "../app/actions/sandbox";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { PlayIcon, RotateCcw, TerminalSquare } from "lucide-react";

export function SandboxPanel({
    lang,
    files,
}: {
    lang: "js" | "html" | "python";
    files: Record<string, string>;
}) {
    const isDev = process.env.NODE_ENV === "development";
    const [output, setOutput] = useState<{ stdout?: string; stderr?: string; error?: string } | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [remainingExecutions, setRemainingExecutions] = useState<number>(isDev ? Number.MAX_SAFE_INTEGER : 0);
    const [editorLang, setEditorLang] = useState<"js" | "html" | "python">(lang);
    const [codeText, setCodeText] = useState<string>("");

    // Prepare initial code from files
    useEffect(() => {
        const initial = Object.values(files).join("\n");
        setCodeText(initial);
    }, [files]);

    // Fetch remaining executions (no-op meaningful in dev)
    useEffect(() => {
        if (!isDev) {
            getRemainingExecutions().then((n) => setRemainingExecutions(n)).catch(() => setRemainingExecutions(0));
        }
    }, [isDev]);

    const handleExecute = async () => {
        setIsRunning(true);
        setOutput(null);
        const result = await executeCode(codeText, editorLang);
        setOutput(result);
        if (!isDev) {
            getRemainingExecutions().then((n) => setRemainingExecutions(n)).catch(() => {});
        }
        setIsRunning(false);
    };

    const handleReset = () => {
        setCodeText(Object.values(files).join("\n"));
        setOutput(null);
    };

    const statusText = isDev
        ? "Unlimited in dev"
        : `${remainingExecutions} execution${remainingExecutions === 1 ? "" : "s"} remaining today`;

    return (
        <Card className="w-full border-border/60 bg-background/80 backdrop-blur-sm">
            <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TerminalSquare className="h-5 w-5" />
                        <CardTitle>E2B Sandbox</CardTitle>
                    </div>
                    <div className="text-xs text-muted-foreground">{statusText}</div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex items-center gap-2">
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

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={isRunning}
                            className="h-8"
                        >
                            <RotateCcw className="mr-1 h-4 w-4" /> Reset
                        </Button>
                        <Button
                            onClick={handleExecute}
                            disabled={!isDev && (isRunning || remainingExecutions <= 0)}
                            className="h-8"
                        >
                            <PlayIcon className="mr-1 h-4 w-4" /> {isRunning ? "Running..." : "Run"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Code</label>
                        <textarea
                            value={codeText}
                            onChange={(e) => setCodeText(e.target.value)}
                            className="min-h-[280px] w-full rounded border bg-background/60 p-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Write or paste your code here..."
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Output</label>
                        <div className="min-h-[280px] w-full rounded border bg-muted/40 p-3">
                            {!output && (
                                <div className="text-sm text-muted-foreground">Run code to see output</div>
                            )}
                            {output?.stdout && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold mb-1">Stdout</div>
                                    <pre className="whitespace-pre-wrap break-words text-sm">{output.stdout}</pre>
                                </div>
                            )}
                            {output?.stderr && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold mb-1">Stderr</div>
                                    <pre className="whitespace-pre-wrap break-words text-sm text-red-500">{output.stderr}</pre>
                                </div>
                            )}
                            {output?.error && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold mb-1">Error</div>
                                    <pre className="whitespace-pre-wrap break-words text-sm text-red-500">{output.error}</pre>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}