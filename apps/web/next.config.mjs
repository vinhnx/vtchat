import { createMDX } from 'fumadocs-mdx/next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withMDX = createMDX();

// Bundle analyzer configuration
const withBundleAnalyzer = process.env.ANALYZE === 'true'
    ? (await import('@next/bundle-analyzer')).default({
        enabled: true,
        openAnalyzer: true,
    })
    : (config) => config;

const nextConfig = {
    // Now stable in Next 15.5
    typedRoutes: true,
    transpilePackages: [
        'next-mdx-remote',
        '@repo/shared',
        '@repo/common',
        '@repo/ui',
        '@repo/ai',
        '@repo/actions',
        '@repo/orchestrator',
    ],

    // Disable Vercel Analytics auto-injection
    // Note: analyticsId is not a valid Next.js config option

    // Server-side optimizations - exclude only external packages from bundling
    serverExternalPackages: [],

    // Enable automatic bundling for Pages Router (includes undici, better-auth)
    bundlePagesRouterDependencies: true, // Next.js 15.4 experimental features

    experimental: {
        // Re-enable externalDir for monorepo support now that Turbopack works
        externalDir: true,

        // Aggressive memory optimizations for Next.js 15
        webpackMemoryOptimizations: true, // Re-enable for memory savings
        webpackBuildWorker: false, // Keep disabled to reduce memory usage
        preloadEntriesOnStart: false,

        // Improve stability for SWC/Turbopack
        swcTraceProfiling: false,

        // Disable browser debug info to save memory during build
        browserDebugInfoInTerminal: false,

        // Development optimizations
        typedEnv: true,
        inlineCss: true,
        optimizeCss: true,
        // typedRoutes moved to top-level in Next 15.5

        // Additional memory optimizations
        optimizePackageImports: ['@repo/shared', '@repo/common', '@repo/ui'],
        serverMinification: true,
    },

    // Turbopack-specific aliases to work around upstream package exports.
    // htmlparser2@8 imports `entities/lib/decode.js`, which is not exported by entities@6
    // Map it to the public subpath that exists in v6.
    turbopack: {
        resolveAlias: {
            'entities/lib/decode.js': 'entities/decode.js',
            'entities/lib/decode': 'entities/decode.js',
        },
    },

    // Temporarily remove outputFileTracingRoot for Turbopack compatibility
    // Next.js 15+ - moved from experimental to root level
    // outputFileTracingRoot: path.join(__dirname, "../../"),

    // Disable static generation completely for React 19 compatibility
    trailingSlash: false,
    skipTrailingSlashRedirect: true,

    // Performance optimizations
    compiler: {
        // Remove console.logs in production - only keep errors for compatibility
        removeConsole: process.env.NODE_ENV === 'production'
            ? {
                exclude: ['error'],
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

    // Additional development optimizations
    ...(process.env.NODE_ENV === 'development' && {
        // Optimize file watching
        useFileSystemPublicRoutes: true,
    }),

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
        // Prepare for Next 16: explicitly allow the qualities used in code
        qualities: [75, 80, 90],
        minimumCacheTTL: 86400, // 1 day (reduced from 31 days for better cache invalidation)
        dangerouslyAllowSVG: true, // Allow SVG for icons and avatars
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    // Webpack optimizations (only when not using Turbopack)
    ...(process.env.TURBOPACK !== '1' && {
        webpack: (config, { dev, isServer }) => {
            // Memory-optimized settings for constrained environments
            config.stats = 'errors-only';
            config.performance = {
                hints: false,
            };

            // Enhanced memory optimizations for Next.js 15
            if (!dev) {
                // Disable cache completely to save memory during build
                config.cache = false;
            }

            // Minimize parallel processing to reduce memory usage
            config.parallelism = 1;

            // Additional memory optimizations
            config.optimization = {
                ...config.optimization,
                // Reduce memory usage during build
                minimize: true,
                // Use single-threaded optimization
                minimizer: config.optimization.minimizer?.slice(0, 1),
            };

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
                    if (typeof external === 'string') {
                        return external !== 'undici';
                    }
                    return external;
                });
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

                // Minimal chunk splitting for low-memory environments
                if (!dev) {
                    config.optimization.splitChunks = {
                        chunks: 'all',
                        maxInitialRequests: 10,
                        maxAsyncRequests: 15,
                        minSize: 50000,
                        maxSize: 200000,
                        cacheGroups: {
                            // Single vendor chunk
                            vendor: {
                                test: /[\\/]node_modules[\\/]/,
                                name: 'vendor',
                                priority: 20,
                                chunks: 'all',
                                reuseExistingChunk: true,
                            },
                            // Default chunk - omit name to auto-generate
                            default: {
                                minChunks: 2,
                                priority: 10,
                                reuseExistingChunk: true,
                            },
                        },
                    };
                }
            }

            // Alias for webpack builds as well (prod or when Turbopack is disabled)
            config.resolve = config.resolve || {};
            config.resolve.alias = config.resolve.alias || {};
            config.resolve.alias = {
                ...config.resolve.alias,
                'entities/lib/decode.js': 'entities/decode.js',
                'entities/lib/decode': 'entities/decode.js',
            };

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
                        value: process.env.NEXT_PUBLIC_BASE_URL || 'https://vtchat.io.vn',
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
                    {
                        key: 'Link',
                        value:
                            '</icon-192x192.png>; rel=preload; as=image, </icons/peerlist_badge.svg>; rel=preload; as=image',
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
        return [
            {
                source: '/plus',
                destination: '/pricing',
                permanent: true,
            },
        ];
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
        // Additional memory optimizations for production
        experimental: {
            // Disable source maps in production to save memory
            serverSourceMaps: false,
            // Optimize for memory-constrained environments
            optimizeServerReact: true,
        },
    }),

    // Disable problematic features for initial deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Skip middleware URL normalization for better performance
    skipMiddlewareUrlNormalize: true,
    // Note: Static page generation is disabled via layout.tsx exports
    // (dynamic = "force-dynamic", revalidate = 0, dynamicParams = true)
};

export default withMDX(withBundleAnalyzer(nextConfig));
