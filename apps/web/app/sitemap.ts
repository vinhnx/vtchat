import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    // Use environment variable with fallback to production URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://vtchat.io.vn";

    // Define static routes with appropriate metadata
    const staticRoutes = [
        {
            url: baseUrl,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "daily" as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/help`,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "yearly" as const,
            priority: 0.5,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date("2025-07-18"),
            changeFrequency: "yearly" as const,
            priority: 0.5,
        },
    ];

    return staticRoutes;
}
