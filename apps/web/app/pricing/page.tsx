import { Footer } from "@repo/common/components";
import type { Metadata } from "next";
import { PricingClient } from "./pricing-client";

// This page can be statically generated for better SEO
export const dynamic = "force-static";

export const metadata: Metadata = {
    title: "Pricing - VT",
    description:
        "VT pricing: Most AI features free with BYOK. VT+ ($5.99/month) adds 3 exclusive research features: Deep Research, Pro Search, and RAG Personal AI Assistant.",
    keywords: [
        "VT pricing",
        "AI chat pricing",
        "BYOK AI",
        "free AI models",
        "premium AI features",
        "research tools",
        "AI subscription",
    ],
    openGraph: {
        title: "Pricing - VT",
        description:
            "Most powerful AI features free with BYOK. VT+ adds exclusive research capabilities.",
        type: "website",
        images: [
            {
                url: "https://vtchat.io.vn/og-image-v2.jpg",
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
            "Most powerful AI features free with BYOK. VT+ adds exclusive research capabilities.",
        images: ["https://vtchat.io.vn/twitter-image-v2.jpg"],
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
                            price: "5.99",
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
