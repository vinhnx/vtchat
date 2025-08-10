"use client";
import { UserTier } from "@repo/shared/constants/user-tiers";
import { useEffect, useRef, useState } from "react";
export function useWorkflowWorker(onMessage, _onAbort) {
    var _a = useState("idle"), status = _a[0], setStatus = _a[1];
    var _b = useState(null), error = _b[0], setError = _b[1];
    var _c = useState(null), flowState = _c[0], setFlowState = _c[1];
    var workerRef = useRef(null);
    var onMessageRef = useRef(onMessage);
    // Keep the callback ref updated
    useEffect(function () {
        onMessageRef.current = onMessage;
    }, [onMessage]);
    // Initialize worker once on mount
    useEffect(function () {
        if (typeof window === "undefined")
            return;
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL("./worker.ts", import.meta.url), {
                type: "module",
            });
            // Set up message handler
            workerRef.current.onmessage = function (event) {
                var data = event.data;
                if (onMessageRef.current) {
                    onMessageRef.current(data);
                }
            };
        }
        // Clean up worker when component unmounts
        return function () {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);
    var startWorkflow = function (_a) {
        var mode = _a.mode, question = _a.question, threadId = _a.threadId, threadItemId = _a.threadItemId, parentThreadItemId = _a.parentThreadItemId, customInstructions = _a.customInstructions, messages = _a.messages, config = _a.config, apiKeys = _a.apiKeys, mcpConfig = _a.mcpConfig, webSearch = _a.webSearch, mathCalculator = _a.mathCalculator, charts = _a.charts, showSuggestions = _a.showSuggestions, thinkingMode = _a.thinkingMode, _b = _a.userTier, userTier = _b === void 0 ? UserTier.FREE : _b;
        // Reset state
        setError(null);
        setFlowState(null);
        try {
            if (typeof window === "undefined") {
                throw new Error("Workers can only be used in the browser environment");
            }
            // Ensure worker exists
            if (!workerRef.current) {
                workerRef.current = new Worker(new URL("./worker.ts", import.meta.url), {
                    type: "module",
                });
                // Set up message handler
                workerRef.current.onmessage = function (event) {
                    var data = event.data;
                    if (onMessageRef.current) {
                        onMessageRef.current(data);
                    }
                };
            }
            // Start workflow with existing worker
            workerRef.current.postMessage({
                type: "START_WORKFLOW",
                payload: {
                    mode: mode,
                    question: question,
                    threadId: threadId,
                    threadItemId: threadItemId,
                    parentThreadItemId: parentThreadItemId,
                    customInstructions: customInstructions,
                    messages: messages,
                    config: config,
                    apiKeys: apiKeys || {},
                    mcpConfig: mcpConfig,
                    webSearch: webSearch,
                    mathCalculator: mathCalculator,
                    charts: charts,
                    showSuggestions: showSuggestions,
                    thinkingMode: thinkingMode,
                    userTier: userTier,
                },
            });
            setStatus("running");
        }
        catch (err) {
            setStatus("error");
            setError(err instanceof Error ? err : new Error("Failed to start workflow"));
        }
    };
    var abortWorkflow = function (graceful) {
        if (graceful === void 0) { graceful = false; }
        if (!workerRef.current) {
            return;
        }
        // Signal the worker to abort
        workerRef.current.postMessage({
            type: "ABORT_WORKFLOW",
            payload: { graceful: graceful },
        });
        setStatus("aborted");
    };
    return {
        status: status,
        error: error,
        flowState: flowState,
        startWorkflow: startWorkflow,
        abortWorkflow: abortWorkflow,
    };
}
