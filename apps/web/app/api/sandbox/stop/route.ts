import type { NextRequest } from "next/server";
import { Sandbox } from "@e2b/code-interpreter";

export async function POST(req: NextRequest) {
    try {
        const { sandboxId } = await req.json();
        if (!sandboxId || typeof sandboxId !== "string") {
            return new Response(JSON.stringify({ error: "sandboxId required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const sbx = await Sandbox.connect(sandboxId as any);
        await sbx.close();
        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error?.message || "Failed to stop sandbox" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
