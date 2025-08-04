import { Footer } from "@repo/common/components";
import type { Metadata } from "next";
import { PricingClient } from "./pricing-client";

// This page can be statically generated for better SEO
export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Pricing - VT",
    description:
        "VT pricing: Most AI features free with BYOK. VT+ ($10/month) adds professional research tools: Enhanced Pro Search (50/day), Deep Research (25/day), advanced document processing, priority access, custom workflows, and premium exports.",
    keywords: [
        "VT pricing",
        "AI chat pricing",
        "BYOK AI",
        "free AI models",
        "premium AI features",
        "research tools",
        "AI subscription",
        "professional AI tools",
        "custom workflows",
        "priority access",
    ],
    openGraph: {
        title: "Pricing - VT",
        description:
            "Most powerful AI features free with BYOK. VT+ adds professional research capabilities and advanced productivity tools.",
        type: "website",
        images: [
            {
                url: "https://vtchat.io.vn/og-image-v3.jpg",
                width: 1200,
                height: 630,
                alt: "VT Pricing",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pricing - VT",
        description:
            "Most powerful AI features free with BYOK. VT+ adds professional research capabilities and advanced productivity tools.",
        images: ["https://vtchat.io.vn/twitter-image-v3.jpg"],
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
        canonical: "https://vtchat.io.vn/pricing",
    },
};

export default function PricingPage() {
    return (
        <>
            <h1
                style={{
                    position: "absolute",
                    left: "-10000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                }}
            >
                VT Pricing - Minimal AI Chat with Deep Research Features
            </h1>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Product",
                        name: "VT+",
                        description:
                            "Premium AI chat features with exclusive research capabilities",
                        brand: {
                            "@type": "Brand",
                            name: "VT",
                        },
                        offers: {
                            "@type": "Offer",
                            price: "10",
                            priceCurrency: "USD",
                            availability: "https://schema.org/InStock",
                            priceValidUntil: "2025-12-31",
                            url: "https://vtchat.io.vn/pricing",
                        },
                        aggregateRating: {
                            "@type": "AggregateRating",
                            ratingValue: "4.8",
                            reviewCount: "150",
                            bestRating: "5",
                            worstRating: "1",
                        },
                    }),
                }}
            />
            <PricingClient />
            {/* Footer */}
            <footer className="border-border/50 bg-background border-t">
                <div className="mx-auto max-w-7xl">
                    <Footer />
                </div>
            </footer>
        </>
    );
}
