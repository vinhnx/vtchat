import { auth } from '@/lib/auth-server';
import { shouldDisableGemini } from '@/lib/services/budget-monitor';
import { checkRateLimit, recordRequest } from '@/lib/services/rate-limit';
import { getModelFromChatMode, type ModelEnum, models } from '@repo/ai/models';
import { apiKeyMapper } from '@repo/ai/services/api-key-mapper';
import { ChatMode, ChatModeConfig } from '@repo/shared/config';
import { RATE_LIMIT_MESSAGES } from '@repo/shared/constants';
import {
    createSecureHeaders,
    extractApiKeysFromHeaders,
    validateHTTPS,
} from '@repo/shared/constants/security-headers';
import { log } from '@repo/shared/logger';
import { isGeminiModel } from '@repo/shared/utils';
import { type Geo, geolocation } from '@vercel/functions';
import type { NextRequest } from 'next/server';
import { checkSignedInFeatureAccess, checkVTPlusAccess } from '../subscription/access-control';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

import { hasImageAttachments, validateByokForImageAnalysis } from '@repo/shared/utils';
import { HEARTBEAT_COMMENT, HEARTBEAT_INTERVAL_MS, HEARTBEAT_JITTER_MS } from './constants';
import { executeStream, markControllerClosed } from './stream-handlers';
import { registerStream, unregisterStream } from './stream-registry';
import { completionRequestSchema, SSE_HEADERS } from './types';
import { getIp } from './utils';

export async function POST(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: SSE_HEADERS });
    }

    try {
        // SECURITY: Check request size before processing
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
            // 10MB limit
            return new Response(JSON.stringify({ error: 'Request too large' }), {
                status: 413,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id ?? undefined;

        // SECURITY: Validate HTTPS in production
        if (process.env.NODE_ENV === 'production' && !validateHTTPS(request)) {
            log.warn('SECURITY: Non-HTTPS request rejected', {
                url: new URL(request.url).pathname,
            });
            return new Response(
                JSON.stringify({
                    error: 'HTTPS required',
                    message: 'All API requests must use HTTPS for security.',
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        ...createSecureHeaders(),
                    },
                },
            );
        }

        const parsed = await request.json().catch(() => ({}));

        const validatedBody = completionRequestSchema.safeParse(parsed);

        if (!validatedBody.success) {
            log.warn(
                { validationError: validatedBody.error.format() },
                'Request validation failed',
            );
            return new Response(
                JSON.stringify({
                    error: 'Invalid request body',
                    details: validatedBody.error.format(),
                }),
                { status: 400, headers: { 'Content-Type': 'application/json' } },
            );
        }

        const { data } = validatedBody;
        const ip = getIp(request);

        // SECURITY: Validate IP format and reject invalid IPs
        if (!ip) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // SECURITY: Basic IP format validation
        const ipv4Regex =
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip) && ip !== '::1' && ip !== '127.0.0.1') {
            log.warn('Invalid IP format detected', { ip: `${ip.substring(0, 10)}...` });
        }

        // SECURITY: Extract API keys from secure headers first, then fallback to body
        let apiKeysFromHeaders: Record<string, string> = {};
        try {
            apiKeysFromHeaders = extractApiKeysFromHeaders(request.headers);
        } catch {
            log.debug('No API keys found in headers', {
                url: new URL(request.url).pathname,
            });
        }

        // Combine API keys from headers and body (headers take precedence for security)
        const combinedApiKeys = {
            ...data.apiKeys,
            ...apiKeysFromHeaders,
        };

        // Transform and validate API keys using centralized mapping service
        let transformedApiKeys: Record<string, string> | undefined;
        if (Object.keys(combinedApiKeys).length > 0) {
            // SECURITY: Log API key processing without exposing key names or metadata
            log.info('Processing API keys', {
                keyCount: Object.keys(combinedApiKeys).length,
                fromHeaders: Object.keys(apiKeysFromHeaders).length,
                fromBody: Object.keys(data.apiKeys || {}).length,
            });

            try {
                transformedApiKeys = apiKeyMapper.mapFrontendToProvider(combinedApiKeys);

                // SECURITY: Log transformation success without exposing key details
                log.info('API key transformation completed', {
                    transformedKeyCount: Object.keys(transformedApiKeys).length,
                });

                // Validate API keys for the selected model's provider
                const selectedModel = getModelFromChatMode(data.mode);

                // Get the model object to access its provider property
                const modelObject = models.find((m) => m.id === selectedModel);
                const modelProvider = modelObject?.provider;

                if (modelProvider && transformedApiKeys) {
                    // Import validation functions at build time to avoid initialization issues during build
                    const apiMapperModule = await import('@repo/ai/services/api-key-mapper');
                    const errorModule = await import('@repo/ai/services/error-messages');
                    const { validateProviderKey } = apiMapperModule;
                    const { generateErrorMessage } = errorModule;

                    // Use the provider directly from model configuration
                    const providerName = modelProvider;

                    if (
                        providerName
                        && [
                            'openai',
                            'anthropic',
                            'google',
                            'xai',
                            'fireworks',
                            'openrouter',
                        ].includes(providerName)
                    ) {
                        const validation = validateProviderKey(
                            providerName as any,
                            transformedApiKeys,
                        );

                        if (!validation.isValid) {
                            const errorMsg = generateErrorMessage('API key required', {
                                provider: providerName as any,
                                hasApiKey: validation.hasApiKey,
                                isVtPlus: false, // Will be determined later
                                originalError: validation.error,
                            });

                            return new Response(
                                JSON.stringify({
                                    error: errorMsg.title,
                                    message: errorMsg.message,
                                    action: errorMsg.action,
                                    helpUrl: errorMsg.helpUrl,
                                    settingsAction: errorMsg.settingsAction,
                                    provider: providerName,
                                }),
                                { status: 400, headers: { 'Content-Type': 'application/json' } },
                            );
                        }
                    }
                }
            } catch (error) {
                log.error({ error }, 'Failed to transform or validate API keys');

                // Provide more specific error message
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                let userMessage = 'Failed to process API keys. Please check your key format.';
                const statusCode = 400;

                if (errorMessage.includes('Invalid API keys object')) {
                    userMessage =
                        'Invalid API key format. Please ensure all API keys are properly formatted strings.';
                } else if (errorMessage.includes('validation')) {
                    userMessage =
                        'API key validation failed. Please check your API key format and try again.';
                } else if (errorMessage.includes('mapping')) {
                    userMessage = 'API key mapping failed. Please refresh the page and try again.';
                }

                return new Response(
                    JSON.stringify({
                        error: 'API Key Configuration Error',
                        message: userMessage,
                        action: 'Check your API keys in Settings → API Keys',
                        settingsAction: 'open_api_keys',
                    }),
                    { status: statusCode, headers: { 'Content-Type': 'application/json' } },
                );
            }
        } else {
            log.info('No API keys provided in request');
        }

        if (!!ChatModeConfig[data.mode]?.isAuthRequired && !userId) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Rate limiting for Gemini models
        const selectedModel = getModelFromChatMode(data.mode);

        // Check if the selected model is a Gemini model that needs rate limiting
        const isGeminiModelResult = isGeminiModel(selectedModel);

        // BYOK bypass: If user has their own Gemini API key, skip rate limiting entirely
        // Use transformed API keys if available, otherwise use original keys
        const effectiveApiKeys = transformedApiKeys || data.apiKeys;

        // Update data.apiKeys with the effective (transformed) API keys for the workflow
        data.apiKeys = effectiveApiKeys;

        const geminiApiKey = effectiveApiKeys?.GEMINI_API_KEY;
        const hasByokGeminiKey = !!(geminiApiKey && geminiApiKey.trim().length > 0);

        // Declare vtPlusAccess in outer scope for access in onFinish callback
        let vtPlusAccess: { hasAccess: boolean; reason?: string; } | undefined;

        // BYOK validation for image analysis - ALL users must provide their own API keys for image processing
        const hasImages = hasImageAttachments({
            imageAttachment: data.imageAttachment,
            attachments: data.attachments,
            messages: data.messages || [],
        });

        if (hasImages) {
            const validation = validateByokForImageAnalysis({
                chatMode: data.mode,
                apiKeys: effectiveApiKeys || {},
                hasImageAttachments: hasImages,
            });

            if (!validation.isValid) {
                return new Response(
                    JSON.stringify({
                        error: 'API Key Required for Image Analysis',
                        message: validation.errorMessage,
                        requiredApiKey: validation.requiredApiKey,
                        providerName: validation.providerName,
                        settingsAction: 'open_api_keys_settings',
                    }),
                    {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            }
        }

        if (isGeminiModelResult) {
            if (!hasByokGeminiKey) {
                // Check budget limits before rate limiting
                const budgetCheck = await shouldDisableGemini();
                if (budgetCheck.shouldDisable) {
                    return new Response(
                        JSON.stringify({
                            error: 'Service temporarily unavailable',
                            message:
                                'Gemini models are temporarily unavailable due to budget constraints. Please try again next month or use your own API key.',
                            reason: 'budget_exceeded',
                            upgradeUrl: '/pricing',
                            usageSettingsAction: 'open_usage_settings',
                        }),
                        {
                            status: 503,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    );
                }
                // Require authentication for managed model access
                if (!userId) {
                    // Special case: GEMINI_2_5_FLASH_LITE is free for all users, no auth required
                    if (data.mode !== ChatMode.GEMINI_2_5_FLASH_LITE) {
                        return new Response(
                            JSON.stringify({
                                error: 'Authentication required',
                                message:
                                    'Please register to use Gemini models or provide your own API key.',
                                redirect: '/auth/login',
                            }),
                            {
                                status: 401,
                                headers: { 'Content-Type': 'application/json' },
                            },
                        );
                    }
                }

                // SPECIAL CASES:
                // 1. GEMINI_2_5_FLASH_LITE is free for all users (no VT+ required)
                // 2. Deep Research and Pro Search modes have their own access control logic below
                // 3. Other Gemini models require VT+ subscription for server-side access
                const isDeepResearchOrProSearch = data.mode === ChatMode.Deep
                    || data.mode === ChatMode.Pro;
                const isFlashLite = data.mode === ChatMode.GEMINI_2_5_FLASH_LITE;

                if (
                    !isFlashLite && data.mode !== ChatMode.GEMINI_2_5_FLASH_LITE
                    && !isDeepResearchOrProSearch
                ) {
                    // VT+ REQUIRED for managed Gemini access (Flash Lite always requires BYOK)
                    vtPlusAccess = await checkVTPlusAccess({ userId, ip });
                    if (!vtPlusAccess.hasAccess) {
                        const errorResponse = {
                            error: 'VT+ subscription required',
                            message:
                                'Free users must provide their own Gemini API key. Upgrade to VT+ for server-side access to Gemini models.',
                            upgradeUrl: '/pricing',
                            usageSettingsAction: 'open_usage_settings',
                        };
                        return new Response(JSON.stringify(errorResponse), {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        });
                    }
                } else {
                    // For GEMINI_2_5_FLASH_LITE, Deep Research, and Pro Search modes
                    vtPlusAccess = await checkVTPlusAccess({ userId, ip });
                    // Note: We still check VT+ status for rate limiting purposes
                    // Deep Research and Pro Search have their own access control logic below
                }

                // Check rate limits based on user tier
                // For GEMINI_2_5_FLASH_LITE: both VT+ and free users can access it
                // For other Gemini models: only VT+ users can access them (guaranteed by access check above)
                const isVTPlusUser = vtPlusAccess?.hasAccess ?? false;
                let rateLimitResult;
                try {
                    rateLimitResult = await checkRateLimit(userId, selectedModel, isVTPlusUser);
                } catch (error) {
                    log.error({ error }, 'Rate limit check failed');
                    // Continue without rate limiting if check fails (graceful degradation)
                    rateLimitResult = { allowed: true };
                }

                if (!rateLimitResult.allowed) {
                    const resetTime = rateLimitResult.reason === 'daily_limit_exceeded'
                        ? rateLimitResult.resetTime.daily
                        : rateLimitResult.resetTime.minute;

                    const message = rateLimitResult.reason === 'daily_limit_exceeded'
                        ? isVTPlusUser
                            ? RATE_LIMIT_MESSAGES.DAILY_LIMIT_VT_PLUS
                            : RATE_LIMIT_MESSAGES.DAILY_LIMIT_SIGNED_IN
                        : isVTPlusUser
                        ? RATE_LIMIT_MESSAGES.MINUTE_LIMIT_VT_PLUS
                        : RATE_LIMIT_MESSAGES.MINUTE_LIMIT_SIGNED_IN;

                    return new Response(
                        JSON.stringify({
                            error: 'Rate limit exceeded',
                            message,
                            limitType: rateLimitResult.reason,
                            remainingDaily: rateLimitResult.remainingDaily,
                            remainingMinute: rateLimitResult.remainingMinute,
                            resetTime: resetTime.toISOString(),
                            upgradeUrl: '/pricing',
                            usageSettingsAction: 'open_usage_settings',
                        }),
                        {
                            status: 429,
                            headers: {
                                'Content-Type': 'application/json',
                                'Retry-After': Math.ceil(
                                    (resetTime.getTime() - Date.now()) / 1000,
                                ).toString(),
                            },
                        },
                    );
                }

                // Rate limiting will be recorded after successful completion
                // Keep rate limit check to prevent exceeding limits
            }
        }

        // Validate userTier against actual subscription status and check chart access
        let actualUserTier: 'FREE' | 'PLUS' = 'FREE';
        const accessResult = await checkVTPlusAccess({ userId, ip });
        if (accessResult.hasAccess) {
            actualUserTier = 'PLUS';
        }

        // Charts are now available to all users - no restriction needed

        // Check VT+ access for gated features
        const modeConfig = ChatModeConfig[data.mode];
        if (modeConfig?.requiredFeature || modeConfig?.requiredPlan) {
            // For Deep Research and Pro Search: VT+ users bypass BYOK, free users need BYOK
            const isByokEligibleMode = data.mode === ChatMode.Deep || data.mode === ChatMode.Pro;

            if (isByokEligibleMode) {
                // If user has VT+ access, allow without BYOK
                if (accessResult.hasAccess) {
                    // VT+ user, no BYOK needed
                } else {
                    // Free user, check for BYOK using transformed keys
                    const geminiApiKey = effectiveApiKeys?.GEMINI_API_KEY;
                    const hasByokGeminiKeyForMode = !!(
                        geminiApiKey && geminiApiKey.trim().length > 0
                    );

                    if (!hasByokGeminiKeyForMode) {
                        return new Response(
                            JSON.stringify({
                                error: 'VT+ subscription or API key required',
                                message:
                                    'This feature requires VT+ subscription or your own Gemini API key.',
                                requiredPlan: modeConfig.requiredPlan,
                                requiredFeature: modeConfig.requiredFeature,
                            }),
                            {
                                status: 403,
                                headers: { 'Content-Type': 'application/json' },
                            },
                        );
                    }
                }
            } else {
                // For other modes, use regular subscription check
                if (!accessResult.hasAccess) {
                    return new Response(
                        JSON.stringify({
                            error: 'VT+ subscription required',
                            reason: accessResult.reason,
                            requiredPlan: modeConfig.requiredPlan,
                            requiredFeature: modeConfig.requiredFeature,
                        }),
                        {
                            status: 403,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    );
                }
            }
        }

        // Backend enforcement: Thinking mode is now available to all signed-in users
        if (data.thinkingMode?.enabled) {
            const accessResult = await checkSignedInFeatureAccess({ userId, ip });
            if (!accessResult.hasAccess) {
                return new Response(
                    JSON.stringify({
                        error: 'Sign in required for thinking mode',
                        reason: 'Thinking mode requires you to be signed in',
                        requiredFeature: 'THINKING_MODE',
                    }),
                    {
                        status: 403,
                        headers: { 'Content-Type': 'application/json' },
                    },
                );
            }
        }

        // Rate limiting removed - no longer needed

        const enhancedHeaders = {
            ...SSE_HEADERS,
        };

        const _encoder = new TextEncoder();
        const abortController = new AbortController();
        const requestId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Register stream for memory leak prevention
        registerStream(requestId, abortController, {
            userId,
            threadId: data.threadId,
        });

        request.signal.addEventListener('abort', () => {
            abortController.abort();
            unregisterStream(requestId);
        });

        const gl = geolocation(request);

        // Override userTier with server-validated value to prevent spoofing
        // Use transformed API keys if available, otherwise use original keys
        const safeData = {
            ...data,
            userTier: actualUserTier,
            apiKeys: transformedApiKeys || data.apiKeys,
        };

        const stream = createCompletionStream({
            data: safeData,
            userId,
            ip: ip,
            abortController,
            requestId,
            gl,
            selectedModel,
            hasByokGeminiKey: hasByokGeminiKey,
            isGeminiModelResult,
            vtPlusAccess,
        });

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        log.error({ error }, 'Error in POST handler');

        // Use centralized error message service for consistent error handling
        // Import at build time to avoid initialization issues during build
        const errorModule = await import('@repo/ai/services/error-messages');
        const { generateErrorMessage } = errorModule;

        let errorMessage = 'Internal server error';
        let statusCode = 500;

        if (error instanceof Error) {
            // Extract provider context from the request data if available
            const errorContext = {
                provider: data?.provider,
                model: data?.model,
                userId: userId ?? undefined,
                hasApiKey: !!data?.apiKeys?.[data?.provider as keyof typeof data.apiKeys],
                isVtPlus: vtPlusAccess?.hasAccess ?? false,
                originalError: error.message,
            };

            const structuredError = generateErrorMessage(error, errorContext);
            errorMessage = structuredError.message;

            // Map error types to appropriate HTTP status codes
            const errorString = error.message.toLowerCase();
            if (
                errorString.includes('unauthorized')
                || errorString.includes('forbidden')
                || structuredError.title.toLowerCase().includes('authentication')
            ) {
                statusCode = 401;
            } else if (
                errorString.includes('rate limit')
                || errorString.includes('429')
                || structuredError.title.toLowerCase().includes('rate limit')
            ) {
                statusCode = 429;
            } else if (errorString.includes('network') || errorString.includes('fetch')) {
                statusCode = 503;
            } else if (errorString.includes('timeout')) {
                statusCode = 408;
            } else if (errorString.includes('parse') || errorString.includes('invalid')) {
                statusCode = 400;
            }
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
                // SECURITY: Never expose stack traces, even in development
                ...(process.env.NODE_ENV === 'development' && {
                    debugInfo: error instanceof Error ? error.message : 'Unknown error',
                }),
            }),
            { status: statusCode, headers: { 'Content-Type': 'application/json' } },
        );
    }
}

function createCompletionStream({
    data,
    userId,
    ip: _ip,
    abortController,
    requestId,
    gl,
    selectedModel: _selectedModel,
    hasByokGeminiKey: _hasByokGeminiKey,
    isGeminiModelResult,
    vtPlusAccess,
}: {
    data: any;
    userId?: string;
    ip?: string;
    abortController: AbortController;
    requestId: string;
    gl: Geo;
    selectedModel: ModelEnum;
    hasByokGeminiKey: boolean;
    isGeminiModelResult: boolean;
    vtPlusAccess: { hasAccess: boolean; reason?: string; } | undefined;
}) {
    const _encoder = new TextEncoder();
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let isControllerClosed: boolean = false;
    let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;

    return new ReadableStream({
        async start(controller) {
            streamController = controller;
            heartbeatInterval = setInterval(
                () => {
                    if (isControllerClosed) {
                        if (heartbeatInterval) {
                            clearInterval(heartbeatInterval);
                            heartbeatInterval = null;
                        }
                        return;
                    }

                    try {
                        controller.enqueue(_encoder.encode(HEARTBEAT_COMMENT));
                    } catch (error) {
                        // Controller is closed, clear interval
                        if ((error as any)?.code === 'ERR_INVALID_STATE' && heartbeatInterval) {
                            isControllerClosed = true;
                            clearInterval(heartbeatInterval);
                            heartbeatInterval = null;
                            // Abort the request to clean up resources
                            markControllerClosed(controller);
                            abortController.abort();
                            unregisterStream(requestId);
                        }
                    }
                },
                HEARTBEAT_INTERVAL_MS + Math.random() * HEARTBEAT_JITTER_MS,
            );

            try {
                await executeStream({
                    controller,
                    encoder: _encoder,
                    data,
                    abortController,
                    gl,
                    userId: userId ?? undefined,
                    onFinish: async () => {
                        // Server-side safety net: record usage if client doesn't
                        if (userId && isGeminiModelResult && !_hasByokGeminiKey) {
                            try {
                                await recordRequest(
                                    userId,
                                    _selectedModel,
                                    vtPlusAccess?.hasAccess ?? false,
                                );
                                log.info(
                                    { userId, model: _selectedModel },
                                    'Rate limit recorded via server-side safety net',
                                );
                            } catch (error) {
                                log.error(
                                    { error, userId, model: _selectedModel },
                                    'Failed to record request in onFinish',
                                );
                            }
                        }
                    },
                });
            } catch (error) {
                const { handleStreamError } = await import('./stream-error-handler');
                await handleStreamError({
                    error,
                    controller,
                    encoder: _encoder,
                    data,
                    userId,
                    abortController,
                });
            } finally {
                isControllerClosed = true;
                if (heartbeatInterval) {
                    clearInterval(heartbeatInterval);
                    heartbeatInterval = null;
                }
                markControllerClosed(controller);
                unregisterStream(requestId);
                controller.close();

                // Break object references to help GC
                // @ts-ignore
                data = null;
            }
        },
        cancel() {
            log.info('cancelling stream');
            isControllerClosed = true;
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }
            if (streamController) {
                markControllerClosed(streamController);
            }
            unregisterStream(requestId);
            abortController.abort();
        },
    });
}
