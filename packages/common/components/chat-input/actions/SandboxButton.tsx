"use client";

import { Button } from "@repo/ui/components/button";
import { Terminal } from "lucide-react";
import { useState } from "react";
import { SandboxDisplay } from "../../sandbox/SandboxDisplay";

export function SandboxButton() {
    const [isSandboxOpen, setIsSandboxOpen] = useState(false);

    // This is a placeholder for the files and lang. In a real implementation,
    // you would get this from the chat message or some other source.
    const files = { "index.js": "console.log('hello world')" };
    const lang = "js";

    return (
        <>
            <Button variant="outline" size="icon" onClick={() => setIsSandboxOpen(true)}>
                <Terminal className="h-4 w-4" />
            </Button>
            <SandboxDisplay
                files={files}
                lang={lang}
                open={isSandboxOpen}
                onOpenChange={setIsSandboxOpen}
            />
        </>
    );
}