export const dynamic = "force-dynamic";

export default function NotFound() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>404 - Page Not Found | VT</title>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background-color: #ffffff;
                            color: #000000;
                            display: flex;
                            min-height: 100vh;
                            align-items: center;
                            justify-content: center;
                        }
                        .container {
                            text-align: center;
 max-width: 400px;
                            padding: 24px;
                        }
                        h1 {
                            font-size: 18px;
                            font-weight: 500;
                            margin-bottom: 12px;
                        }
                        p {
                            color: #666666;
                            font-size: 14px;
                            margin-bottom: 16px;
                        }
                        a {
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            height: 36px;
                            padding: 0 16px;
                            background-color: #000000;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 6px;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background-color 0.2s;
                        }
                        a:hover {
                            background-color: #333333;
                        }
                    `,
                    }}
                />
            </head>
            <body>
                <div className="container">
                    <h1>404 - Page Not Found</h1>
                    <p>Sorry, we couldn't find the page you're looking for.</p>
                    <a href="/">Back to VT</a>
                </div>
            </body>
        </html>
    );
}
