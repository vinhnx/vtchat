import { NextRequest, NextResponse } from 'next/server';
import { log } from '@repo/shared/logger';

/**
 * Handle return from Creem portal
 * This route is called when users return from the portal
 */
export async function GET(request: NextRequest) {
    try {
        log.info('[Portal Return] User returned from portal');

        // Get the return URL from query params or default to chat
        const searchParams = request.nextUrl.searchParams;
        const returnTo = searchParams.get('returnTo') || '/chat';

        // Log the return for debugging
        log.info('[Portal Return] Redirecting to:', { data: returnTo });

        // Send a message to the parent window to refresh subscription status
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Returning from Portal...</title>
    <script>
        // If this page is opened in the portal tab, send message to parent and close
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage({
                    type: 'PORTAL_COMPLETE',
                    timestamp: Date.now()
                }, window.location.origin);
                window.close();
            } catch (e) {
                log.info('Could not message parent window:', { data: e });
                // Fallback: redirect to main app
                window.location.href = '${returnTo}';
            }
        } else {
            // Direct access, redirect to main app
            window.location.href = '${returnTo}';
        }
    </script>
</head>
<body>
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: system-ui;">
        <div style="text-align: center;">
            <h2>Returning to VT...</h2>
            <p>Please wait while we redirect you back to the app.</p>
        </div>
    </div>
</body>
</html>
        `;

        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        log.error('[Portal Return] Error handling return:', { error });

        // Fallback redirect
        return NextResponse.redirect(new URL('/chat', request.url));
    }
}
