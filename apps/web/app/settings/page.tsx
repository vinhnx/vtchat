import { Footer } from "@repo/common/components";
import { Button, TypographyH1 } from "@repo/ui";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth-server";
import { SettingsContent } from "./settings-content";

export const metadata: Metadata = {
    title: "Settings - VT",
    description:
        "Customize your VT experience and manage your account settings, API keys, preferences, and more.",
    openGraph: {
        title: "Settings - VT",
        description:
            "Customize your VT experience and manage your account settings, API keys, preferences, and more.",
        type: "website",
    },
    robots: {
        index: false, // Settings pages should not be indexed
        follow: false,
    },
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    // Check if user is authenticated
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login?redirect=/settings");
    }
    return (
        <div className="bg-background min-h-screen">
            {/* Header */}
            <header className="border-border/50 bg-background sticky top-0 z-50 border-b backdrop-blur-sm">
                <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
                    <Link href="/">
                        <Button className="gap-2" size="sm" variant="ghost">
                            <ArrowLeft size={16} />
                            Back to VT
                        </Button>
                    </Link>
                    <div className="text-muted-foreground text-sm">Settings</div>
                </div>
            </header>

            {/* Main Content */}
            <main className="bg-background w-full px-4 py-12">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 text-center">
                        <TypographyH1 className="mb-4 text-3xl font-semibold md:text-4xl">
                            Settings
                        </TypographyH1>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
                            Customize your VT experience and manage your account settings
                        </p>
                    </div>
                    <SettingsContent />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto w-full max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </div>
    );
}
