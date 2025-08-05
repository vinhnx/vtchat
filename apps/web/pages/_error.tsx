// Custom error page to override Next.js default and avoid context issues
import type { NextPageContext } from "next";

interface ErrorProps {
    statusCode?: number;
    hasGetInitialProps?: boolean;
    err?: Error;
}

function Error({ statusCode }: ErrorProps) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{statusCode ? `${statusCode} - Server Error` : "Client Error"} | VT</title>
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
                        <h1 className="title">
                            {statusCode ? `${statusCode} - Server Error` : "Client Error"}
                        </h1>
                        <p className="description">
                            {statusCode === 404
                                ? "Sorry, we couldn't find the page you're looking for."
                                : "An unexpected error occurred. Please try again."}
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

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
