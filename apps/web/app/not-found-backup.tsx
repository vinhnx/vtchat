import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Not Found | VT Chat",
    description: "The page you're looking for doesn't exist.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
            <div className="max-w-md space-y-6">
                <div className="space-y-2">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        404
                    </h1>
                    <h2 className="text-xl font-semibold text-muted-foreground">Page Not Found</h2>
                </div>

                <p className="leading-7 text-muted-foreground">
                    Sorry, we couldn't find the page you're looking for. The page might have been
                    moved, deleted, or you entered the wrong URL.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <a
                        href="/"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        Back to Home
                    </a>
                    <a
                        href="/recent"
                        className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        View Recent Chats
                    </a>
                </div>

                <div className="mt-8 text-sm text-muted-foreground">
                    <p>
                        If you believe this is an error, please check our FAQ or try refreshing the
                        page.
                    </p>
                </div>
            </div>
        </div>
    );
}
