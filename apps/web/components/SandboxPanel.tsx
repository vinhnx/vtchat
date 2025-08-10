"use client";

import { useMemo, useState, useEffect } from "react";
import { executeCode, getRemainingExecutions } from "../app/actions/sandbox";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { PlayIcon } from "lucide-react";

export function SandboxPanel({
    lang,
    files,
}: {
    lang: "js" | "html" | "python";
    files: Record<string, string>;
}) {
    const [output, setOutput] = useState<{ stdout?: string; stderr?: string; error?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [remainingExecutions, setRemainingExecutions] = useState(0);

    useEffect(() => {
        getRemainingExecutions().then(setRemainingExecutions);
    }, []);

    const code = useMemo(() => {
        return Object.values(files).join("\n");
    }, [files]);

    const handleExecute = async () => {
        setIsLoading(true);
        const result = await executeCode(code, lang);
        setOutput(result);
        getRemainingExecutions().then(setRemainingExecutions);
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Button onClick={handleExecute} disabled={isLoading || remainingExecutions <= 0}>
                    <PlayIcon className="mr-2 h-4 w-4" />
                    {isLoading ? "Executing..." : "Run"}
                </Button>
                <p className="text-sm text-muted-foreground">
                    {remainingExecutions} executions remaining today
                </p>
            </div>
            {output && (
                <Card>
                    <CardHeader>
                        <CardTitle>Output</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {output.stdout && (
                            <div>
                                <h3 className="font-semibold">Stdout:</h3>
                                <pre className="bg-muted p-2 rounded-md">{output.stdout}</pre>
                            </div>
                        )}
                        {output.stderr && (
                            <div className="mt-2">
                                <h3 className="font-semibold">Stderr:</h3>
                                <pre className="bg-muted p-2 rounded-md text-red-500">{output.stderr}</pre>
                            </div>
                        )}
                        {output.error && (
                            <div className="mt-2">
                                <h3 className="font-semibold">Error:</h3>
                                <pre className="bg-muted p-2 rounded-md text-red-500">{output.error}</pre>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}