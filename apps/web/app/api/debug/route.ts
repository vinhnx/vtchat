import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Basic environment check without dependencies
        const envStatus = {
            NODE_ENV: process.env.NODE_ENV,
            CREEM_ENVIRONMENT: process.env.CREEM_ENVIRONMENT,
            DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
            BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "Set" : "Missing",
            BASE_URL: process.env.BASE_URL,
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            PORT: process.env.PORT,
            HOSTNAME: process.env.HOSTNAME,
        };

        return NextResponse.json(
            {
                status: "ok",
                timestamp: new Date().toISOString(),
                service: "vtchat-debug",
                environment: envStatus,
                platform: {
                    arch: process.arch,
                    platform: process.platform,
                    version: process.version,
                },
            },
            { status: 200 },
        );
    } catch (error) {
        return NextResponse.json(
            {
                status: "error",
                error: error instanceof Error ? error.message : "Unknown error",
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        );
    }
}
