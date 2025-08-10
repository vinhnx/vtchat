import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { log } from "@repo/shared/logger";

/**
 * Higher-order function to wrap API routes with authentication
 */
export function withAuth(
  handler: (req: NextRequest, session: any) => Promise<NextResponse>
) {
  return async function (req: NextRequest) {
    try {
      // Get the current session
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session?.user?.id) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }

      // Pass the request and session to the handler
      return await handler(req, session);
    } catch (error) {
      log.error("Authentication error", { error });
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
    }
  };
}