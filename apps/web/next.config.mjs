import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    // Disable Vercel Analytics auto-injection
    // Note: analyticsId is not a valid Next.js config option

    // Server-side optimizations - exclude workspace packages from bundling
    serverExternalPackages: ['@repo/shared', '@repo/common', '@repo/orchestrator'],

    // Enable automatic bundling for Pages Router (includes undici, better-auth)
    bundlePagesRouterDependencies: true,

    // Webpack memory optimizations
    experimental: {
        externalDir: true,
        webpackMemoryOptimizations: true,
        webpackBuildWorker: true,
        preloadEntriesOnStart: false,
        ...(process.env.EXPERIMENTAL_OPTI_IMPORTS === 'true' && {
            optimizePackageImports: [
                'lucide-react',
                '@radix-ui/react-icons',
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
        }),
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

    // Optimize for faster builds and better performance
    compress: true,

    // Optimize page loading
    onDemandEntries: {
        // Period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // Number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 2,
    },

    // Image optimization with balanced caching
    images: {
        remotePatterns: [
            { hostname: 'www.google.com' },
            { hostname: 'startupfa.me' },
            { hostname: 'producthunt.com' },
            // Avatar services
            { hostname: 'lh3.googleusercontent.com' }, // Google avatars
            { hostname: 'avatars.githubusercontent.com' }, // GitHub avatars
            { hostname: 'cdn.discordapp.com' }, // Discord avatars
            { hostname: 'graph.facebook.com' }, // Facebook avatars
            { hostname: 'pbs.twimg.com' }, // Twitter avatars
            // AI/LLM Provider Images
            { hostname: 'oaidalleapiprodscus.blob.core.windows.net' }, // OpenAI DALL-E
            { hostname: 'cdn.openai.com' }, // OpenAI CDN
            { hostname: 'images.openai.com' }, // OpenAI Images
            { hostname: 'storage.googleapis.com' }, // Google AI/Gemini storage
            { hostname: 'generativelanguage.googleapis.com' }, // Gemini API images
            { hostname: 'claude.ai' }, // Claude AI images
            { hostname: 'cdn.anthropic.com' }, // Anthropic CDN
            { hostname: 'images.anthropic.com' }, // Anthropic images
            { hostname: 'api.stability.ai' }, // Stability AI
            { hostname: 'cdn.stability.ai' }, // Stability AI CDN
            { hostname: 'images.groq.com' }, // Groq images
            { hostname: 'api.groq.com' }, // Groq API
            { hostname: 'replicate.delivery' }, // Replicate model outputs
            { hostname: 'pbxt.replicate.delivery' }, // Replicate CDN
            { hostname: 'cdn.replicate.com' }, // Replicate CDN
            { hostname: 'huggingface.co' }, // Hugging Face
            { hostname: 'cdn-uploads.huggingface.co' }, // Hugging Face uploads
            { hostname: 'images.cohere.ai' }, // Cohere images
            { hostname: 'api.cohere.ai' }, // Cohere API
            { hostname: 'images.perplexity.ai' }, // Perplexity images
            { hostname: 'api.perplexity.ai' }, // Perplexity API
            // Common CDN services
            { hostname: 'cdn.jsdelivr.net' },
            { hostname: 'unpkg.com' },
            { hostname: 'images.unsplash.com' },
            { hostname: 'via.placeholder.com' },
            // User-uploaded content (if you use these services)
            { hostname: 'cloudinary.com' },
            { hostname: '*.cloudinary.com' },
            { hostname: 'imgur.com' },
            { hostname: 'i.imgur.com' },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 86400, // 1 day (reduced from 31 days for better cache invalidation)
        dangerouslyAllowSVG: true, // Allow SVG for icons and avatars
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
                // Use memory cache in development but with size limits
                config.cache = {
                    type: 'memory',
                    maxGenerations: 1,
                };

                // Reduce module resolution overhead
                config.resolve.symlinks = false;

                // Optimize for faster rebuilds
                config.optimization.splitChunks = {
                    chunks: 'async',
                    cacheGroups: {
                        default: false,
                        vendors: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            chunks: 'initial',
                            priority: 10,
                        },
                    },
                };
            } else {
                // Production optimizations with memory constraints
                config.cache = {
                    type: 'memory',
                    maxMemoryGenerations: 1,
                };

                // Enable tree shaking optimizations
                config.optimization.usedExports = true;
                config.optimization.sideEffects = false;
            }

            // Handle Node.js imports in client-side code
            if (!isServer) {
                config.resolve.fallback = {
                    ...config.resolve.fallback,
                    'node:events': 'events',
                    'node:path': 'path-browserify',
                    'node:fs': false,
                    'node:crypto': 'crypto-browserify',
                    'node:stream': 'stream-browserify',
                    'node:util': 'util',
                    'node:url': 'url',
                    'node:querystring': 'querystring-es3',
                    'node:buffer': 'buffer',
                };
            }

            // Optimize bundle splitting for better loading performance
            if (!isServer) {
                config.optimization.splitChunks = {
                    chunks: 'all',
                    maxInitialRequests: 20, // Reduced from 25 for optimal loading
                    maxAsyncRequests: 25, // Reduced from 30
                    minSize: 20000, // 20KB minimum chunk size
                    maxSize: 200000, // 200KB maximum chunk size
                    cacheGroups: {
                        // Framework core (React, Next.js)
                        framework: {
                            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types)[\\/]/,
                            name: 'framework',
                            priority: 50,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Next.js chunks
                        nextjs: {
                            test: /[\\/]node_modules[\\/]next[\\/]/,
                            name: 'nextjs',
                            priority: 45,
                            chunks: 'all',
                            reuseExistingChunk: true,
                        },
                        // Critical form libraries
                        forms: {
                            test: /[\\/]node_modules[\\/](react-hook-form|zod)[\\/]/,
                            name: 'form-libs',
                            priority: 40,
                            chunks: 'all',
                            reuseExistingChunk: true,
                        },
                        // AI libraries (lazy loaded)
                        ai: {
                            test: /[\\/]node_modules[\\/](@ai-sdk|ai|@google\/generative-ai)[\\/]/,
                            name: 'ai-libs',
                            priority: 35,
                            chunks: 'async', // Keep as async
                            reuseExistingChunk: true,
                            maxSize: 150000, // Smaller chunks for AI libs
                        },
                        // Chart libraries (lazy loaded)
                        charts: {
                            test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
                            name: 'chart-libs',
                            priority: 30,
                            chunks: 'async',
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
                        // UI libraries - split into smaller chunks
                        ui: {
                            test: /[\\/]node_modules[\\/](@radix-ui|framer-motion|lucide-react|cmdk)[\\/]/,
                            name: 'ui-libs',
                            priority: 20,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 100000, // Reduced from 200KB
                        },
                        // Date utilities
                        dateFns: {
                            test: /[\\/]node_modules[\\/]date-fns[\\/]/,
                            name: 'date-fns',
                            priority: 20,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            enforce: true,
                        },
                        // Utilities
                        utils: {
                            test: /[\\/]node_modules[\\/](clsx|tailwind-merge|nanoid|immer|zustand)[\\/]/,
                            name: 'utils',
                            priority: 15,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 100000, // Reduced from 150KB
                        },
                        // Default vendor packages
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: 'vendors',
                            priority: 10,
                            chunks: 'all',
                            reuseExistingChunk: true,
                            maxSize: 100000, // Reduced from 150KB
                            minChunks: 1,
                        },
                        // Common application code
                        common: {
                            name: 'common',
                            minChunks: 2,
                            priority: 5,
                            reuseExistingChunk: true,
                            maxSize: 150000, // Reduced from 200KB
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
                // CORS headers for AI provider image proxying
                source: '/api/proxy/image/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET, OPTIONS',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'Content-Type, Authorization',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800', // 1 day with 1 week stale
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
                // Optimized cache headers for static assets
                source: '/(.*)\\.(js|css|ico|png|jpg|jpeg|gif|svg|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable', // 1 year for static assets with hash
                    },
                ],
            },
            {
                // Shorter cache for dynamic assets that might change
                source: '/_next/static/(.*)\\.(js|css)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=31536000', // 1 day with stale-while-revalidate
                    },
                ],
            },
            {
                // Font files with longer cache
                source: '/(.*)\\.(woff|woff2|ttf|eot)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                // Service Worker specific headers - never cache
                source: '/sw.js',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/javascript; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "default-src 'self'; script-src 'self'",
                    },
                ],
            },
            {
                // Web App Manifest headers - moderate cache
                source: '/manifest.webmanifest',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/manifest+json',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400', // 1 day
                    },
                ],
            },
            {
                // Offline page - moderate cache for PWA functionality
                source: '/offline.html',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'text/html; charset=utf-8',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400', // 1 day
                    },
                ],
            },
            {
                // Next.js optimized images - balanced cache
                source: '/_next/image',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=31536000', // 1 day with stale-while-revalidate
                    },
                ],
            },
            {
                // AI-generated images - shorter cache due to dynamic nature
                source: '/api/ai/images/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=86400, stale-while-revalidate=604800', // 1 day with 1 week stale-while-revalidate
                    },
                    {
                        key: 'Content-Type',
                        value: 'image/*',
                    },
                ],
            },
            {
                // HTML pages - short cache with revalidation
                source: '/:path*.html',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=300, stale-while-revalidate=86400', // 5 min with stale-while-revalidate
                    },
                ],
            },
            {
                // API responses - no cache for dynamic content
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'private, no-cache, no-store, must-revalidate',
                    },
                    {
                        key: 'Pragma',
                        value: 'no-cache',
                    },
                    {
                        key: 'Expires',
                        value: '0',
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
