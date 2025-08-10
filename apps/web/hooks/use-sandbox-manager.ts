"use client";

import { useCallback } from "react";
import { useChatStore } from "@repo/common/store";
import { log } from "@repo/shared/logger";

/**
 * Hook to manage E2B sandbox functionality
 */
export function useSandboxManager() {
  const currentThreadId = useChatStore((state) => state.currentThreadId);
  const threadItems = useChatStore((state) => state.threadItems);

  /**
   * Get sandbox usage stats for the current user
   */
  const getSandboxUsage = useCallback(async () => {
    try {
      const response = await fetch("/api/sandbox/usage");
      if (!response.ok) {
        throw new Error("Failed to fetch sandbox usage");
      }
      return await response.json();
    } catch (error) {
      log.error("Failed to fetch sandbox usage", { error });
      return { remaining: 0, limit: 0 };
    }
  }, []);

  /**
   * Start a new E2B sandbox
   */
  const startSandbox = useCallback(async (params: {
    files: Record<string, string>;
    language?: string;
    cmd?: string;
    port?: number;
    internetAccess?: boolean;
    timeoutMinutes?: number;
  }) => {
    try {
      const response = await fetch("/api/sandbox/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId: currentThreadId,
          ...params,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start sandbox");
      }

      return await response.json();
    } catch (error) {
      log.error("Failed to start sandbox", { error });
      throw error;
    }
  }, [currentThreadId]);

  /**
   * Stop an E2B sandbox
   */
  const stopSandbox = useCallback(async (sandboxId: string) => {
    try {
      const response = await fetch("/api/sandbox/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sandboxId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to stop sandbox");
      }

      return await response.json();
    } catch (error) {
      log.error("Failed to stop sandbox", { error });
      throw error;
    }
  }, []);

  /**
   * Get the most recent sandbox result from thread items
   */
  const getLatestSandboxResult = useCallback(() => {
    if (!currentThreadId) return null;

    // Find the most recent thread item with sandbox results
    const threadItem = threadItems
      .filter(item => item.threadId === currentThreadId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .find(item => 
        item.toolResults && 
        Object.values(item.toolResults).some(result => 
          result.toolName === "startSandbox" || result.toolName === "openSandbox"
        )
      );

    if (!threadItem || !threadItem.toolResults) return null;

    // Find the sandbox tool result
    const sandboxResult = Object.values(threadItem.toolResults).find(result => 
      result.toolName === "startSandbox" || result.toolName === "openSandbox"
    );

    return sandboxResult || null;
  }, [currentThreadId, threadItems]);

  return {
    getSandboxUsage,
    startSandbox,
    stopSandbox,
    getLatestSandboxResult,
  };
}