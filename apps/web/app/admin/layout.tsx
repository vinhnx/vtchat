"use client";

import { useAdmin } from "@repo/common/hooks";
import { Button, LoadingSpinner } from "@repo/ui";
import { motion } from "framer-motion";
import { Activity, ArrowLeft, Shield, Terminal, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { MinimalErrorPage } from "../../components/minimal-error-page";

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const router = useRouter();
    const { isAdmin, loading, error } = useAdmin();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <LoadingSpinner size="lg" text="Loading admin dashboard..." />
            </div>
        );
    }

    if (error) {
        return (
            <MinimalErrorPage
                code="401"
                title="Authentication Error"
                description={error}
                actionButton={{
                    text: "Retry",
                    onClick: () => typeof window !== "undefined" && window.location.reload(),
                }}
            />
        );
    }

    if (!isAdmin) {
        return (
            <MinimalErrorPage
                code="403"
                title="Admin Access Required"
                description="You need admin privileges to access this dashboard."
                actionButton={{
                    text: "Back to VT",
                    href: "/",
                }}
            />
        );
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Header with increased top offset */}
            <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
                <div className="container mx-auto px-6 py-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push("/")}
                                className="mr-2"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/admin")}
                            >
                                <Terminal className="mr-2 h-4 w-4" />
                                VT Terminal
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/admin/users")}
                            >
                                <Users className="mr-2 h-4 w-4" />
                                Users
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/admin/logs")}
                            >
                                <Activity className="mr-2 h-4 w-4" />
                                Logs
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push("/admin/security")}
                            >
                                <Shield className="mr-2 h-4 w-4" />
                                Security
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
}
