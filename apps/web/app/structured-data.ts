import type { Organization, Product, WebSite, WithContext } from 'schema-dts';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vtchat.io.vn';

export const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VT',
    url: baseUrl,
    logo: `${baseUrl}/og-image-v3.jpg`,
    description: 'Privacy-first AI chat application with advanced AI capabilities',
    foundingDate: '2025',
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@vtchat.io.vn',
        contactType: 'customer service',
    },
    sameAs: ['https://github.com/vinhnx/vtchat', 'https://x.com/vinhnx'],
};

export const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VT',
    url: baseUrl,
    description: 'Privacy-first AI chat application with advanced AI capabilities',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/chat?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

export const productSchema: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'VT+',
    description: 'Premium AI chat features with exclusive research capabilities',
    brand: {
        '@type': 'Brand',
        name: 'VT',
    },
    offers: {
        '@type': 'Offer',
        price: '5.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        url: `${baseUrl}/pricing`,
    },
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1',
    },
};

export function generateStructuredData(type: 'organization' | 'website' | 'product') {
    const schemas = {
        organization: organizationSchema,
        website: websiteSchema,
        product: productSchema,
    };

    return JSON.stringify(schemas[type]);
}
