const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
        ],
    },

    experimental: {
        externalDir: true,
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
