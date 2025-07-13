/**
 * Cache Management Component - For settings page
 */

"use client";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui";
import { AlertCircle, Database, HardDrive, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useServiceWorker } from "../lib/hooks/use-service-worker";

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function formatCacheName(name: string): string {
    return name
        .replace("vtchat-", "")
        .replace("-v3.0", "")
        .replace(/^\w/, (c) => c.toUpperCase());
}

export function CacheManagement() {
    const {
        isSupported,
        isRegistered,
        isOnline,
        hasUpdate,
        cacheStats,
        isLoading,
        updateServiceWorker,
        clearCache,
        forceSync,
        refreshCacheStats,
    } = useServiceWorker();

    const [clearing, setClearing] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    if (!isSupported) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        Service Worker Not Supported
                    </CardTitle>
                    <CardDescription>
                        Your browser doesn't support service workers. Some offline features may not
                        be available.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const handleClearCache = async (cacheName?: string) => {
        setClearing(cacheName || "all");
        try {
            await clearCache(cacheName);
        } finally {
            setClearing(null);
        }
    };

    const handleRefreshStats = async () => {
        setRefreshing(true);
        try {
            await refreshCacheStats();
        } finally {
            setRefreshing(false);
        }
    };

    const totalSize = cacheStats
        ? Object.values(cacheStats).reduce((sum, cache) => sum + (cache.size || 0), 0)
        : 0;

    const totalEntries = cacheStats
        ? Object.values(cacheStats).reduce((sum, cache) => sum + (cache.entries || 0), 0)
        : 0;

    return (
        <div className="space-y-6">
            {/* Service Worker Status */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Service Worker Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span>Connection Status</span>
                        <Badge
                            variant={isOnline ? "default" : "destructive"}
                            className="flex items-center gap-1"
                        >
                            {isOnline ? (
                                <Wifi className="h-3 w-3" />
                            ) : (
                                <WifiOff className="h-3 w-3" />
                            )}
                            {isOnline ? "Online" : "Offline"}
                        </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                        <span>Registration</span>
                        <Badge variant={isRegistered ? "default" : "secondary"}>
                            {isRegistered ? "Active" : "Not Registered"}
                        </Badge>
                    </div>

                    {hasUpdate && (
                        <div className="flex items-center justify-between">
                            <span>Update Available</span>
                            <Button size="sm" onClick={updateServiceWorker}>
                                Update Now
                            </Button>
                        </div>
                    )}

                    {!isOnline && (
                        <div className="flex items-center justify-between">
                            <span>Offline Sync</span>
                            <Button size="sm" variant="outline" onClick={forceSync}>
                                Force Sync
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cache Statistics */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        Cache Statistics
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRefreshStats}
                            disabled={refreshing || isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                        </Button>
                    </CardTitle>
                    <CardDescription>
                        Manage cached content to optimize performance and storage
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Loading cache statistics...
                        </div>
                    ) : cacheStats ? (
                        <div className="space-y-4">
                            {/* Total Summary */}
                            <div className="p-4 rounded-lg bg-muted/50 border">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="font-medium">Total Size</div>
                                        <div className="text-2xl font-bold">
                                            {formatBytes(totalSize)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="font-medium">Total Entries</div>
                                        <div className="text-2xl font-bold">{totalEntries}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Cache Breakdown */}
                            <div className="space-y-3">
                                {Object.entries(cacheStats).map(([name, cache]) => {
                                    if (cache.error) {
                                        return (
                                            <div
                                                key={name}
                                                className="p-3 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium text-red-900 dark:text-red-100">
                                                            {formatCacheName(name)}
                                                        </div>
                                                        <div className="text-sm text-red-700 dark:text-red-300">
                                                            Error: {cache.error}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const usagePercentSize = cache.maxSize
                                        ? (cache.size / cache.maxSize) * 100
                                        : 0;
                                    const usagePercentEntries = cache.maxEntries
                                        ? (cache.entries / cache.maxEntries) * 100
                                        : 0;

                                    return (
                                        <div key={name} className="p-3 rounded-lg border">
                                            <div className="flex items-center justify-between mb-2">
                                                <div>
                                                    <div className="font-medium">
                                                        {formatCacheName(name)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {formatBytes(cache.size)} • {cache.entries}{" "}
                                                        entries
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleClearCache(
                                                            `vtchat-${name.toLowerCase()}-v3.0`,
                                                        )
                                                    }
                                                    disabled={
                                                        clearing ===
                                                        `vtchat-${name.toLowerCase()}-v3.0`
                                                    }
                                                >
                                                    {clearing ===
                                                    `vtchat-${name.toLowerCase()}-v3.0` ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Usage bars */}
                                            {cache.maxSize && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Size Usage</span>
                                                        <span>{usagePercentSize.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${
                                                                usagePercentSize > 80
                                                                    ? "bg-red-500"
                                                                    : usagePercentSize > 60
                                                                      ? "bg-yellow-500"
                                                                      : "bg-green-500"
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(usagePercentSize, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {cache.maxEntries && (
                                                <div className="space-y-1 mt-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Entry Usage</span>
                                                        <span>
                                                            {usagePercentEntries.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all ${
                                                                usagePercentEntries > 80
                                                                    ? "bg-red-500"
                                                                    : usagePercentEntries > 60
                                                                      ? "bg-yellow-500"
                                                                      : "bg-green-500"
                                                            }`}
                                                            style={{
                                                                width: `${Math.min(usagePercentEntries, 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Clear All Button */}
                            <div className="pt-4 border-t">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleClearCache()}
                                    disabled={clearing === "all"}
                                    className="w-full"
                                >
                                    {clearing === "all" ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Clearing All Caches...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Clear All Caches
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            No cache data available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
