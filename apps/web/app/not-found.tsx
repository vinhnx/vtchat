// Simple 404 page without React context dependencies for Next.js 15.4 + React 19 compatibility
export const dynamic = "force-dynamic";

export const metadata = {
    title: "404 - Page Not Found | VT",
    description:
        "The page you're looking for doesn't exist. Return to VT to continue chatting with AI.",
    robots: {
        index: false,
        follow: false,
        noarchive: true,
        nosnippet: true,
    },
};

export default function NotFound() {
    return (
        <div className="bg-background text-foreground flex min-h-screen flex-col items-center justify-center">
            <div className="w-full max-w-md p-6 text-center">
                <h1 className="mb-3 text-lg font-medium">404 - Page Not Found</h1>
                <p className="text-muted-foreground mb-4 text-sm">
                    Sorry, we couldn't find the page you're looking for.
                </p>
                <div className="flex justify-center space-x-3">
                    <a
                        href="/"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Back to VT
                    </a>
                </div>
            </div>
        </div>
    );
}
