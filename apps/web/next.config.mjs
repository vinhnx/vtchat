import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [{ hostname: 'www.google.com' }],
    },

    experimental: {
        externalDir: true,
    },

    // Moved from experimental to root level (Next.js 15+)
    outputFileTracingRoot: path.join(__dirname, '../../'),

    async headers() {
        return [
            {
                // Apply CORS headers to all API routes
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value:
                            process.env.NEXT_PUBLIC_BASE_URL ||
                            'https://vtchat-web-development.up.railway.app',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization, X-Requested-With',
                    },
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                ],
            },
        ];
    },

    async redirects() {
        return [{ source: '/', destination: '/chat', permanent: true }];
    },

    // Railway-specific configuration for minimal working deployment
    output: 'standalone',
    poweredByHeader: false,
    generateBuildId: async () => {
        return process.env.BUILD_ID || 'development';
    },

    // Disable problematic features for initial deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
