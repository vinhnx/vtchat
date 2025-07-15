import { getModelFromChatMode, type ModelEnum } from "@repo/ai/models";
import { ChatMode, ChatModeConfig } from "@repo/shared/config";
import { RATE_LIMIT_MESSAGES } from "@repo/shared/constants";
import { log } from "@repo/shared/logger";

import { isGeminiModel } from "@repo/shared/utils";
import { type Geo, geolocation } from "@vercel/functions";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth-server";
import { shouldDisableGemini } from "@/lib/services/budget-monitor";
import { checkRateLimit, recordRequest } from "@/lib/services/rate-limit";
import { checkSignedInFeatureAccess, checkVTPlusAccess } from "../subscription/access-control";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";

import { HEARTBEAT_COMMENT, HEARTBEAT_INTERVAL_MS, HEARTBEAT_JITTER_MS } from "./constants";
import { executeStream } from "./stream-handlers";
import { registerStream, unregisterStream } from "./stream-registry";
import { completionRequestSchema, SSE_HEADERS } from "./types";
import { getIp } from "./utils";

export async function POST(request: NextRequest) {
    if (request.method === "OPTIONS") {
        return new Response(null, { headers: SSE_HEADERS });
    }

    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });
        const userId = session?.user?.id ?? undefined;

        const parsed = await request.json().catch(() => ({}));

        const validatedBody = completionRequestSchema.safeParse(parsed);

        if (!validatedBody.success) {
            log.warn(
                { validationError: validatedBody.error.format() },
                "Request validation failed",
            );
            return new Response(
                JSON.stringify({
                    error: "Invalid request body",
                    details: validatedBody.error.format(),
                }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        const { data } = validatedBody;
        const ip = getIp(request);

        if (!ip) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!!ChatModeConfig[data.mode]?.isAuthRequired && !userId) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Rate limiting for Gemini models
        const selectedModel = getModelFromChatMode(data.mode);

        // Check if the selected model is a Gemini model that needs rate limiting
        const isGeminiModelResult = isGeminiModel(selectedModel);

        // BYOK bypass: If user has their own Gemini API key, skip rate limiting entirely
        const geminiApiKey = data.apiKeys?.GEMINI_API_KEY;
        const hasByokGeminiKey = !!(geminiApiKey && geminiApiKey.trim().length > 0);

        // Declare vtPlusAccess in outer scope for access in onFinish callback
        let vtPlusAccess: { hasAccess: boolean; reason?: string } | undefined;

        if (isGeminiModelResult) {
            if (!hasByokGeminiKey) {
                // Check budget limits before rate limiting
                const budgetCheck = await shouldDisableGemini();
                if (budgetCheck.shouldDisable) {
                    return new Response(
                        JSON.stringify({
                            error: "Service temporarily unavailable",
                            message:
                                "Gemini models are temporarily unavailable due to budget constraints. Please try again next month or use your own API key.",
                            reason: "budget_exceeded",
                            upgradeUrl: "/pricing",
                            usageSettingsAction: "open_usage_settings",
                        }),
                        {
                            status: 503,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }
                // Require authentication for server-funded model access
                if (!userId) {
                    return new Response(
                        JSON.stringify({
                            error: "Authentication required",
                            message:
                                "Please register to use Gemini models or provide your own API key.",
                            redirect: "/auth/login",
                        }),
                        {
                            status: 401,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }

                // VT+ REQUIRED for server-funded Gemini access
                vtPlusAccess = await checkVTPlusAccess({ userId, ip });
                if (!vtPlusAccess.hasAccess) {
                    return new Response(
                        JSON.stringify({
                            error: "VT+ subscription required",
                            message:
                                "Free users must provide their own Gemini API key. Upgrade to VT+ for server-side access to Gemini models.",
                            upgradeUrl: "/pricing",
                            usageSettingsAction: "open_usage_settings",
                        }),
                        {
                            status: 403,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                }

                // Check rate limits for VT+ users (guaranteed by access check above)
                let rateLimitResult;
                try {
                    rateLimitResult = await checkRateLimit(userId, selectedModel, true);
                } catch (error) {
                    log.error({ error }, "Rate limit check failed");
                    // Continue without rate limiting if check fails (graceful degradation)
                    rateLimitResult = { allowed: true };
                }

                if (!rateLimitResult.allowed) {
                    const resetTime =
                        rateLimitResult.reason === "daily_limit_exceeded"
                            ? rateLimitResult.resetTime.daily
                            : rateLimitResult.resetTime.minute;

                    // VT+ users are guaranteed at this point (since we gated above)
                    const isVTPlusUser = true;

                    const message =
                        rateLimitResult.reason === "daily_limit_exceeded"
                            ? isVTPlusUser
                                ? RATE_LIMIT_MESSAGES.DAILY_LIMIT_VT_PLUS
                                : RATE_LIMIT_MESSAGES.DAILY_LIMIT_SIGNED_IN
                            : isVTPlusUser
                              ? RATE_LIMIT_MESSAGES.MINUTE_LIMIT_VT_PLUS
                              : RATE_LIMIT_MESSAGES.MINUTE_LIMIT_SIGNED_IN;

                    return new Response(
                        JSON.stringify({
                            error: "Rate limit exceeded",
                            message,
                            limitType: rateLimitResult.reason,
                            remainingDaily: rateLimitResult.remainingDaily,
                            remainingMinute: rateLimitResult.remainingMinute,
                            resetTime: resetTime.toISOString(),
                            upgradeUrl: "/pricing",
                            usageSettingsAction: "open_usage_settings",
                        }),
                        {
                            status: 429,
                            headers: {
                                "Content-Type": "application/json",
                                "Retry-After": Math.ceil(
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
        let actualUserTier: "FREE" | "PLUS" = "FREE";
        const accessResult = await checkVTPlusAccess({ userId, ip });
        if (accessResult.hasAccess) {
            actualUserTier = "PLUS";
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
                    // Free user, check for BYOK
                    const geminiApiKey = data.apiKeys?.GEMINI_API_KEY;
                    const hasByokGeminiKey = !!(geminiApiKey && geminiApiKey.trim().length > 0);

                    if (!hasByokGeminiKey) {
                        return new Response(
                            JSON.stringify({
                                error: "VT+ subscription or API key required",
                                message:
                                    "This feature requires VT+ subscription or your own Gemini API key.",
                                requiredPlan: modeConfig.requiredPlan,
                                requiredFeature: modeConfig.requiredFeature,
                            }),
                            {
                                status: 403,
                                headers: { "Content-Type": "application/json" },
                            },
                        );
                    }
                }
            } else {
                // For other modes, use regular subscription check
                if (!accessResult.hasAccess) {
                    return new Response(
                        JSON.stringify({
                            error: "VT+ subscription required",
                            reason: accessResult.reason,
                            requiredPlan: modeConfig.requiredPlan,
                            requiredFeature: modeConfig.requiredFeature,
                        }),
                        {
                            status: 403,
                            headers: { "Content-Type": "application/json" },
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
                        error: "Sign in required for thinking mode",
                        reason: "Thinking mode requires you to be signed in",
                        requiredFeature: "THINKING_MODE",
                    }),
                    {
                        status: 403,
                        headers: { "Content-Type": "application/json" },
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
        const requestId = crypto.randomUUID();

        // Register stream for memory leak prevention
        registerStream(requestId, abortController, {
            userId,
            threadId: data.threadId,
        });

        request.signal.addEventListener("abort", () => {
            abortController.abort();
            unregisterStream(requestId);
        });

        const gl = geolocation(request);

        // Override userTier with server-validated value to prevent spoofing
        const safeData = {
            ...data,
            userTier: actualUserTier,
        };

        const stream = createCompletionStream({
            data: safeData,
            userId,
            _ip: ip,
            abortController,
            requestId,
            gl,
            selectedModel,
            hasByokGeminiKey: !!(
                data.apiKeys?.GEMINI_API_KEY && data.apiKeys.GEMINI_API_KEY.trim().length > 0
            ),
            isGeminiModelResult,
            vtPlusAccess,
        });

        return new Response(stream, { headers: enhancedHeaders });
    } catch (error) {
        log.error({ error }, "Error in POST handler");

        // Provide specific error messages based on error type
        let errorMessage = "Internal server error";
        let statusCode = 500;

        if (error instanceof Error) {
            const errorString = error.message.toLowerCase();

            if (errorString.includes("unauthorized") || errorString.includes("forbidden")) {
                errorMessage = "Authentication required. Please sign in and try again.";
                statusCode = 401;
            } else if (errorString.includes("rate limit") || errorString.includes("429")) {
                errorMessage = "Rate limit exceeded. Please wait a moment before trying again.";
                statusCode = 429;
            } else if (errorString.includes("network") || errorString.includes("fetch")) {
                errorMessage = "Network connection error. Please check your internet connection.";
                statusCode = 503;
            } else if (errorString.includes("timeout")) {
                errorMessage = "Request timed out. Please try again.";
                statusCode = 408;
            } else if (errorString.includes("parse") || errorString.includes("invalid")) {
                errorMessage = "Invalid request format. Please refresh the page and try again.";
                statusCode = 400;
            }
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
                details: process.env.NODE_ENV === "development" ? String(error) : undefined,
            }),
            { status: statusCode, headers: { "Content-Type": "application/json" } },
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
    _ip?: string;
    abortController: AbortController;
    requestId: string;
    gl: Geo;
    selectedModel: ModelEnum;
    hasByokGeminiKey: boolean;
    isGeminiModelResult: boolean;
    vtPlusAccess: { hasAccess: boolean; reason?: string } | undefined;
}) {
    const _encoder = new TextEncoder();
    let heartbeatInterval: NodeJS.Timeout | null = null;
    let isControllerClosed = false;

    return new ReadableStream({
        async start(controller) {
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
                        if ((error as any)?.code === "ERR_INVALID_STATE" && heartbeatInterval) {
                            isControllerClosed = true;
                            clearInterval(heartbeatInterval);
                            heartbeatInterval = null;
                            // Abort the request to clean up resources
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
                                    "Rate limit recorded via server-side safety net",
                                );
                            } catch (error) {
                                log.error(
                                    { error, userId, model: _selectedModel },
                                    "Failed to record request in onFinish",
                                );
                            }
                        }
                    },
                });
            } catch (error) {
                const { handleStreamError } = await import("./stream-error-handler");
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
                unregisterStream(requestId);
                controller.close();

                // Break object references to help GC
                // @ts-ignore
                data = null;
            }
        },
        cancel() {
            log.info("cancelling stream");
            isControllerClosed = true;
            if (heartbeatInterval) {
                clearInterval(heartbeatInterval);
                heartbeatInterval = null;
            }
            unregisterStream(requestId);
            abortController.abort();
        },
    });
}
