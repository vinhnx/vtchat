import type { Organization, Product, SoftwareApplication, WebSite, WithContext } from 'schema-dts';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vtchat.io.vn';

export const organizationSchema: WithContext<Organization> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VT - Advanced AI Platform',
    alternateName: 'VT AI',
    url: baseUrl,
    logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon-512x512.png`,
        width: 512,
        height: 512,
        caption: 'VT AI Platform Logo',
    },
    description:
        'Minimal AI Chat Platform with generative AI, deep learning, natural language processing (NLP), and large language models (LLMs). Privacy-first artificial intelligence systems for real-time AI processing.',
    foundingDate: '2025',
    contactPoint: {
        '@type': 'ContactPoint',
        email: 'hello@vtchat.io.vn',
        contactType: 'customer service',
        areaServed: 'Worldwide',
        availableLanguage: 'English',
    },
    sameAs: ['https://github.com/vinhnx/vtchat', 'https://x.com/vinhnx'],
    keywords:
        'artificial intelligence, AI, generative AI, deep learning, machine learning, natural language processing, large language models, computer vision, AI systems',
    industry: 'Artificial Intelligence',
    numberOfEmployees: {
        '@type': 'QuantitativeValue',
        value: '1-10',
    },
};

export const websiteSchema: WithContext<WebSite> = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VT - Advanced AI Platform',
    alternateName: 'VT AI Chat Platform',
    url: baseUrl,
    description:
        'Minimal AI Chat Platform with generative AI, deep learning, and natural language processing capabilities. Experience artificial intelligence with large language models and machine learning.',
    inLanguage: 'en-US',
    isAccessibleForFree: true,
    keywords:
        'artificial intelligence, AI chat, generative AI, deep learning, natural language processing, large language models, machine learning, computer vision, AI systems',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/chat?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
    mainEntity: {
        '@type': 'SoftwareApplication',
        name: 'VT AI Chat Platform',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web Browser, Cross-platform',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            description: 'Free AI chat with premium models',
        },
    },
};

export const productSchema: WithContext<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'VT+ - Premium AI Research Tools',
    description:
        'Premium AI chat features with exclusive research capabilities including Deep Research, Pro Search, and enhanced AI tools for professionals.',
    category: 'AI Software',
    brand: {
        '@type': 'Brand',
        name: 'VT - Advanced AI Platform',
    },
    offers: {
        '@type': 'Offer',
        price: '5.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        priceValidUntil: '2025-12-31',
        url: `${baseUrl}/pricing`,
        validFrom: '2025-01-01',
        seller: {
            '@type': 'Organization',
            name: 'VT',
        },
    },
    features: [
        'Deep Research capabilities',
        'Pro Search functionality',
        'Google Dynamic Retrieval',
        'All Gemini Models without BYOK',
        'Flexible database-driven quotas',
    ],
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        reviewCount: '150',
        bestRating: '5',
        worstRating: '1',
    },
};

export const softwareApplicationSchema: WithContext<SoftwareApplication> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VT - Minimal AI Chat Platform',
    alternateName: 'VT AI',
    url: baseUrl,
    description:
        'Advanced artificial intelligence chat platform with generative AI, deep learning, and natural language processing. Features large language models (LLMs), machine learning capabilities, and real-time AI processing.',
    applicationCategory: 'AI Chat Application',
    operatingSystem: 'Web Browser, Cross-platform',
    softwareVersion: '1.0',
    datePublished: '2025-01-01',
    author: {
        '@type': 'Person',
        name: 'Vinh Nguyen',
        url: 'https://vinhnx.github.io/',
    },
    publisher: {
        '@type': 'Organization',
        name: 'VT - Advanced AI Platform',
    },
    offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        description: 'Free AI chat with premium models',
        availability: 'https://schema.org/InStock',
    },
    featureList: [
        'Generative AI',
        'Deep Learning',
        'Natural Language Processing (NLP)',
        'Large Language Models (LLMs)',
        'Machine Learning Models',
        'Computer Vision',
        'Real-time AI Processing',
        'Privacy-first AI Systems',
    ],
    screenshot: {
        '@type': 'ImageObject',
        url: `${baseUrl}/og-image-v3.jpg`,
        caption: 'VT AI Chat Interface Screenshot',
    },
    downloadUrl: baseUrl,
    installUrl: baseUrl,
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '200',
        bestRating: '5',
        worstRating: '1',
    },
};

export function generateStructuredData(type: 'organization' | 'website' | 'product' | 'software') {
    const schemas = {
        organization: organizationSchema,
        website: websiteSchema,
        product: productSchema,
        software: softwareApplicationSchema,
    };

    return JSON.stringify(schemas[type]);
}
