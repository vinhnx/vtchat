"use client";

import { SandboxPanel } from "@/components/SandboxPanel";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";

export function SandboxDisplay({ files, lang, open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>E2B Sandbox</DialogTitle>
                </DialogHeader>
                <SandboxPanel files={files} lang={lang} />
            </DialogContent>
        </Dialog>
    );
}
