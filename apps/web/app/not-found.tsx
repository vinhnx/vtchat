"use client";

import { MinimalErrorPage } from "../components/minimal-error-page";

export default function NotFound() {
    return (
        <MinimalErrorPage
            code="404"
            title="Page Not Found"
            description="Sorry, we couldn't find the page you're looking for."
            actionButton={{
                text: "Go back home",
                href: "/",
            }}
        />
    );
}
