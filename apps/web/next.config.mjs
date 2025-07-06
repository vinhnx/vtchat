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
        : (config) => config;

const nextConfig = {
    transpilePackages: ['next-mdx-remote'],

    // Disable Vercel Analytics auto-injection (we use Vemetric)
    // Note: analyticsId is not a valid Next.js config option

    // Server-side optimizations - exclude workspace packages from bundling
    serverExternalPackages: ['@repo/ai', '@repo/shared', '@repo/common'],

    // Enable automatic bundling for Pages Router (includes undici, better-auth)
    bundlePagesRouterDependencies: true,

    // Webpack memory optimizations
    experimental: {
        externalDir: true,
        webpackMemoryOptimizations: true,
        webpackBuildWorker: true,
        preloadEntriesOnStart: false,
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
            '@google/generative-ai',
            'ai',
            'immer',
            'nanoid',
            'sonner',
            'zustand',
        ],
    },

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
        // Enable SWC minification
        styledComponents: true,
    },

    // Image optimization
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
            { hostname: 'startupfa.me' },
            { hostname: 'producthunt.com' },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 2_678_400, // 31 days
    },

    // Webpack optimizations (only when not using Turbopack)
    ...(process.env.TURBOPACK !== '1' && {
        webpack: (config, { dev, isServer }) => {
            // Ensure undici is bundled for standalone production builds
            if (isServer && !dev) {
                config.externals = config.externals || [];
                const externals = Array.isArray(config.externals)
                    ? config.externals
                    : [config.externals];
                config.externals = externals.filter((external) => {
                    if (typeof external === 'function') {
                        return (context, request, callback) => {
                            if (request === 'undici' || request.startsWith('undici/')) {
                                return callback(); // Include in bundle
                            }
                            return external(context, request, callback);
                        };
                    }
                    return external !== 'undici';
                });
            }

            // Optimize for development speed
            if (dev) {
                // Disable webpack cache in development to prevent bloating
                config.cache = false;

                // Reduce module resolution overhead
                config.resolve.symlinks = false;

                // Disable optimizations that slow down dev builds
                config.optimization.minimize = false;
                config.optimization.splitChunks = {
                    chunks: 'async',
                    cacheGroups: {
                        default: false,
                        vendors: false,
                    },
                };
            } else {
                // Production memory optimization: disable webpack cache
                if (config.cache && !dev) {
                    config.cache = Object.freeze({
                        type: 'memory',
                    });
                }
            }

            // Optimize bundle splitting
            if (!isServer) {
                config.optimization.splitChunks = {
                    chunks: 'all',
                    maxInitialRequests: 25,
                    maxAsyncRequests: 30,
                    cacheGroups: {
                        // React ecosystem
                        react: {
                            test: /[\\/]node_modules[\\/](react|react-dom|react-hook-form)[\\/]/,
                            name: 'react-core',
                            priority: 40,
                            chunks: 'all',
                            reuseExistingChunk: true,
                        },
                        // Heavy AI libraries
                        ai: {
                            test: /[\\/]node_modules[\\/](@ai-sdk|ai|@google\/generative-ai)[\\/]/,
                            name: 'ai-libs',
                            priority: 35,
                            chunks: 'async', // Only load when needed
                            reuseExistingChunk: true,
                        },
                        // Chart libraries (lazy loaded)
                        charts: {
                            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
                            name: 'chart-libs',
                            priority: 30,
                            chunks: 'async', // Only load when charts are rendered
                            reuseExistingChunk: true,
                        },
                        // Database libraries
                        database: {
                            test: /[\\/]node_modules[\\/](@neondatabase|drizzle-orm|better-auth)[\\/]/,
                            name: 'database',
                            priority: 25,
                            chunks: 'all',
                            reuseExistingChunk: true,
                        },
                        // UI libraries
                        ui: {
                            test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react|cmdk)[\\/]/,
                            name: 'ui-libs',
                            priority: 20,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 200_000, // ~200KB limit
                        },
                        // Utilities
                        utils: {
                            test: /[\\/]node_modules[\\/](date-fns|clsx|tailwind-merge|zod|nanoid)[\\/]/,
                            name: 'utils',
                            priority: 15,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 150_000, // ~150KB limit
                        },
                        // Remaining vendor packages
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            priority: 10,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 244_000, // ~240KB limit per chunk
                        },
                        // Common application code
                        common: {
                            name: 'common',
                            minChunks: 2,
                            priority: 5,
                            reuseExistingChunk: true,
                            maxSize: 200_000, // ~200KB limit
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
                        value: process.env.NEXT_PUBLIC_BASE_URL,
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
            {
                // Block sensitive areas completely
                source: '/(profile|rag)/:path*',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=n, search=n, inference=n',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                ],
            },
            {
                // Content-Usage headers for public pages (allow AI training)
                source: '/(about|faq|privacy|terms)/:path*',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=y',
                    },
                ],
            },
            {
                // Block all API routes from indexing
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=n, search=n, inference=n',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'private, no-store',
                    },
                ],
            },
            {
                // Block all chat routes from indexing (PII protection)
                source: '/chat',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=n, search=n, inference=n',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'private, no-store',
                    },
                ],
            },
            {
                // Block all chat thread pages from indexing (PII protection)
                source: '/chat/:path*',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=n, search=n, inference=n',
                    },
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex, nofollow',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'private, no-store',
                    },
                ],
            },
            {
                // Default Content-Usage header for all other pages
                source: '/((?!api|_next|static|favicon\\.ico|robots\\.txt|profile|rag|chat).*)',
                headers: [
                    {
                        key: 'Content-Usage',
                        value: 'tdm=n, search=y, inference=y',
                    },
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                // Cache static assets
                source: '/(.*)\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    async redirects() {
        return [];
    },

    // Fly.io-specific configuration for deployment
    output: 'standalone',
    poweredByHeader: false,
    generateBuildId: async () => {
        return process.env.BUILD_ID || 'development';
    },

    // Production-specific optimizations
    ...(process.env.NODE_ENV === 'production' && {
        productionBrowserSourceMaps: false,
        experimental: {
            serverMinification: false,
            serverSourceMaps: false,
        },
    }),

    // Disable problematic features for initial deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default withBundleAnalyzer(nextConfig);
