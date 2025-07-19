import { log } from "@repo/shared/lib/logger";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "../auth-server";
import { db } from "../database";
import { users } from "../database/schema";

export interface AdminAuthResult {
    success: true;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export interface AdminAuthError {
    success: false;
    response: NextResponse;
}

/**
 * Middleware to handle admin authentication for API routes
 * Validates session, checks admin role, and returns standardized responses
 */
export async function requireAdminAuth(request: NextRequest): Promise<AdminAuthResult | AdminAuthError> {
    try {
        // Get session from request headers
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // Check if session exists and has user
        if (!session || !session.user) {
            log.debug("Admin auth failed: No session or user");
            return {
                success: false,
                response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            };
        }

        // Get user from database to check role
        const user = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
        });

        // Check if user exists and has admin role
        if (!user || user.role !== "admin") {
            log.debug(
                {
                    userId: session.user.id,
                    userRole: user?.role,
                },
                "Admin auth failed: User not admin",
            );
            return {
                success: false,
                response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
            };
        }

        // Check if user is banned
        if (user.banned) {
            log.debug(
                {
                    userId: session.user.id,
                    banned: user.banned,
                },
                "Admin auth failed: User is banned",
            );
            return {
                success: false,
                response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
            };
        }

        log.debug(
            {
                userId: session.user.id,
                email: session.user.email,
            },
            "Admin auth successful",
        );

        return {
            success: true,
            user: {
                id: session.user.id,
                email: session.user.email || "",
                role: user.role,
            },
        };
    } catch (error) {
        log.error({ error }, "Admin authentication error");
        return {
            success: false,
            response: NextResponse.json({ error: "Internal server error" }, { status: 500 }),
        };
    }
}

/**
 * Simplified admin auth check that returns boolean
 * Useful for routes that need to check admin status without full middleware
 */
export async function isRequestFromAdmin(request: NextRequest): Promise<boolean> {
    const result = await requireAdminAuth(request);
    return result.success;
}
