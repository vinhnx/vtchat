"use client";
import { useTheme } from "next-themes";
import type React from "react";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = "system" } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by not rendering on server
    if (!mounted) {
        return null;
    }

    return (
        <Sonner
            className="toaster group"
            theme={theme as ToasterProps["theme"]}
            closeButton={true}
            toastOptions={{
                dismissible: true,
                classNames: {
                    toast: "group group-[.toaster]:rounded-2xl toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton: "group-[.toast]:bg-foreground group-[.toast]:text-background",
                    cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
                    closeButton:
                        "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted/80",
                },
            }}
            {...props}
        />
    );
};

export { Toaster as SonnerToaster, Toaster };
