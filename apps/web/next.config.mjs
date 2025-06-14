const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
            { hostname: 'zyqdiwxgffuy8ymd.public.blob.vercel-storage.com' },
        ],
    },

    experimental: {
        externalDir: true,
    },
    webpack: (config, options) => {
        if (!options.isServer) {
            config.resolve.fallback = { fs: false, module: false, path: false };
        }
        // Experimental features
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
            layers: true,
        };

        // Optimize webpack cache handling for large strings
        if (config.cache) {
            config.cache = {
                ...config.cache,
                compression: 'brotli',
                maxMemoryGenerations: 1,
                memoryCacheUnaffected: true,
            };
        }

        return config;
    },
    async redirects() {
        return [{ source: '/', destination: '/chat', permanent: true }];
    },

    // Disable static generation for error pages to prevent SSR issues
    output: 'standalone',
    poweredByHeader: false,

    // Skip error page generation during build
    generateBuildId: async () => {
        return process.env.BUILD_ID || 'development';
    },
};

export default nextConfig;
