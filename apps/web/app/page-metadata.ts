import type { Metadata, Viewport } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vtchat.io.vn";

export const defaultMetadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: {
        default: "VT - Minimal AI Chat",
        template: "%s | VT",
    },
    description:
        "Privacy-first AI chat with all premium models free (BYOK). Advanced features: document processing, web search, chart visualization, thinking mode.",
    keywords: [
        "AI chat",
        "privacy-first AI",
        "BYOK AI",
        "free AI models",
        "Claude 4",
        "GPT-4",
        "Gemini Pro",
        "local AI",
        "document processing",
        "web search AI",
        "chart visualization",
        "thinking mode",
        "AI assistant",
    ],
    authors: [{ name: "Vinh Nguyen", url: "https://vinhnx.github.io/" }],
    creator: "Vinh Nguyen",
    publisher: "VT",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: baseUrl,
        siteName: "VT",
        title: "VT - Minimal AI Chat",
        description:
            "Privacy-first AI chat with all premium models free (BYOK). Advanced AI capabilities for everyone.",
        images: [
            {
                url: `${baseUrl}/og-image-v3.jpg?v=5`,
                width: 1200,
                height: 630,
                alt: "VT - Minimal AI Chat",
                type: "image/jpeg",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "VT - Minimal AI Chat",
        description:
            "Privacy-first AI chat with all premium models free (BYOK). Advanced AI capabilities for everyone.",
        images: [`${baseUrl}/twitter-image-v3.jpg?v=5`],
        creator: "@vinhnx",
        site: "@vinhnx",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: baseUrl,
    },
    category: "Technology",
    classification: "AI Chat Application",
    referrer: "origin-when-cross-origin",
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#000000" },
    ],
    verification: {
        // Add your verification codes here when you get them
        // google: "your-google-verification-code",
        // yandex: "your-yandex-verification-code",
        // yahoo: "your-yahoo-verification-code",
    },
};

export const defaultViewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    userScalable: true,
    interactiveWidget: "resizes-content",
    colorScheme: "light dark",
};
