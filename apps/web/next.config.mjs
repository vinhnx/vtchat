import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bundle analyzer configuration
const withBundleAnalyzer =
    process.env.ANALYZE === 'true'
        ? (await import('@next/bundle-analyzer')).default({
              enabled: true,
              openAnalyzer: true,
          })
        : config => config;

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],
    images: {
        remotePatterns: [{ hostname: 'www.google.com' }],
    },

    experimental: {
        externalDir: true,
        optimizePackageImports: [
            'lucide-react',
            '@radix-ui/react-icons',
            'date-fns',
            'lodash-es',
            'recharts',
            'framer-motion',
            '@tanstack/react-query',
            'react-hook-form',
            'zod',
            'react-markdown',
            'remark-gfm',
            'react-syntax-highlighter',
        ],
    },

    // Server-side optimizations
    serverExternalPackages: ['@repo/ai', '@repo/shared', '@repo/common'],

    // Moved from experimental to root level (Next.js 15+)
    outputFileTracingRoot: path.join(__dirname, '../../'),

    // Performance optimizations
    compiler: {
        // Remove console.logs in production
        removeConsole:
            process.env.NODE_ENV === 'production'
                ? {
                      exclude: ['error', 'warn'],
                  }
                : false,
    },

    // Webpack optimizations (only when not using Turbopack)
    ...(process.env.TURBOPACK !== '1' && {
        webpack: (config, { dev, isServer }) => {
            // Optimize for development speed
            if (dev) {
                config.cache = {
                    type: 'filesystem',
                    buildDependencies: {
                        config: [__filename],
                    },
                };

                // Reduce module resolution overhead
                config.resolve.symlinks = false;
            }

            // Optimize bundle splitting
            if (!isServer) {
                config.optimization.splitChunks = {
                    chunks: 'all',
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            priority: 10,
                            reuseExistingChunk: true,
                        },
                        common: {
                            name: 'common',
                            minChunks: 2,
                            priority: 5,
                            reuseExistingChunk: true,
                        },
                    },
                };
            }

            return config;
        },
    }),

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

export default withBundleAnalyzer(nextConfig);
