import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "VT Chat - Minimal AI Chat with Deep Research Features",
        short_name: "VT",
        description:
            "Minimal AI chat application with advanced conversational capabilities. Chat with multiple AI models including OpenAI, Anthropic, Google, and more.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "hsl(60 20% 99%)",
        theme_color: "hsl(60 1% 10%)",
        categories: ["productivity", "utilities", "education"],
        lang: "en",
        icons: [
            {
                src: "/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icon-256x256.png",
                sizes: "256x256",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-384x384.png",
                sizes: "384x384",
                type: "image/png",
                purpose: "any",
            },
            {
                src: "/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
        ],
        screenshots: [
            {
                src: "/og-image-v3.jpg",
                sizes: "1200x630",
                type: "image/jpeg",
                form_factor: "wide",
                label: "VT Chat Interface",
            },
        ],
        shortcuts: [
            {
                name: "New Chat",
                short_name: "New Chat",
                description: "Start a new conversation",
                url: "/chat",
                icons: [
                    {
                        src: "/icon-192x192.png",
                        sizes: "192x192",
                    },
                ],
            },
            {
                name: "Settings",
                short_name: "Settings",
                description: "Open app settings",
                url: "/settings",
                icons: [
                    {
                        src: "/icon-192x192.png",
                        sizes: "192x192",
                    },
                ],
            },
        ],
        prefer_related_applications: false,
    };
}
