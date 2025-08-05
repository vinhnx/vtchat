// Standalone 404 page without any imports to avoid context issues during build
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
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>404 - Page Not Found | VT</title>
                <style>{`
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        background-color: hsl(0 0% 100%);
                        color: hsl(0 0% 3.9%);
                        line-height: 1.5;
                    }

                    @media (prefers-color-scheme: dark) {
                        body {
                            background-color: hsl(0 0% 3.9%);
                            color: hsl(0 0% 98%);
                        }
                    }

                    .container {
                        display: flex;
                        min-height: 100vh;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                    }

                    .content {
                        width: 100%;
                        max-width: 28rem;
                        padding: 1.5rem;
                        text-align: center;
                    }

                    .title {
                        margin-bottom: 0.75rem;
                        font-size: 1.125rem;
                        font-weight: 500;
                    }

                    .description {
                        margin-bottom: 1rem;
                        font-size: 0.875rem;
                        color: hsl(0 0% 45.1%);
                    }

                    @media (prefers-color-scheme: dark) {
                        .description {
                            color: hsl(0 0% 63.9%);
                        }
                    }

                    .button {
                        display: inline-flex;
                        height: 2.25rem;
                        align-items: center;
                        justify-content: center;
                        border-radius: 0.375rem;
                        padding: 0.5rem 1rem;
                        font-size: 0.875rem;
                        font-weight: 500;
                        text-decoration: none;
                        background-color: hsl(0 0% 9%);
                        color: hsl(0 0% 98%);
                        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                        transition: background-color 0.2s;
                    }

                    .button:hover {
                        background-color: hsl(0 0% 9% / 0.9);
                    }

                    @media (prefers-color-scheme: dark) {
                        .button {
                            background-color: hsl(0 0% 98%);
                            color: hsl(0 0% 9%);
                        }

                        .button:hover {
                            background-color: hsl(0 0% 98% / 0.9);
                        }
                    }
                `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="content">
                        <h1 className="title">404 - Page Not Found</h1>
                        <p className="description">
                            Sorry, we couldn't find the page you're looking for.
                        </p>
                        <a href="/" className="button">
                            Back to VT
                        </a>
                    </div>
                </div>
            </body>
        </html>
    );
}
