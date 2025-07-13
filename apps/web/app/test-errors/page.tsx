import type { NextPage } from "next";
import { MinimalErrorPage } from "../../components/minimal-error-page";

// Force dynamic rendering to prevent SSR issues during build
export const dynamic = "force-dynamic";

const TestErrorPage: NextPage = () => {
    return (
        <div className="space-y-8 p-8">
            <h1 className="text-2xl font-bold">Error Page Style Tests</h1>

            <div>
                <h2 className="text-lg font-semibold mb-4">404 Error (with code)</h2>
                <MinimalErrorPage
                    code="404"
                    title="Page Not Found"
                    description="Sorry, we couldn't find the page you're looking for."
                    actionButton={{
                        text: "Go back home",
                        href: "/",
                    }}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">401 Error (Auth Error)</h2>
                <MinimalErrorPage
                    code="401"
                    title="Authentication Error"
                    description="Please refresh the page or try again later."
                    actionButton={{
                        text: "Refresh Page",
                        onClick: () => window.location.reload(),
                    }}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">403 Error (Admin Access)</h2>
                <MinimalErrorPage
                    code="403"
                    title="Admin Access Required"
                    description="You need admin privileges to access this dashboard."
                    actionButton={{
                        text: "Go back home",
                        href: "/",
                    }}
                />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-4">500 Error (Global Error)</h2>
                <MinimalErrorPage
                    code="500"
                    title="Something went wrong"
                    description="It seems we encountered an unexpected error. Please try refreshing the page or check back later."
                    actionButton={{
                        text: "Go back home",
                        href: "/",
                    }}
                />
            </div>
        </div>
    );
};

export default TestErrorPage;
