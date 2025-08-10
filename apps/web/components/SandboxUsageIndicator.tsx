"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Card, Progress } from "@repo/ui";
import { Terminal, Play, Square, RotateCcw } from "lucide-react";
import { useSandboxManager } from "@/hooks/use-sandbox-manager";

export function SandboxUsageIndicator() {
  const [usage, setUsage] = useState<{ remaining: number; limit: number; used: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getSandboxUsage } = useSandboxManager();

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const usageData = await getSandboxUsage();
        setUsage(usageData);
      } catch (error) {
        console.error("Failed to fetch sandbox usage", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [getSandboxUsage]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Terminal className="w-4 h-4" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const percentage = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {usage.remaining} / {usage.limit} runs
        </span>
      </div>
      <Progress value={percentage} className="w-24" />
    </div>
  );
}