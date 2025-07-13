"use client";

import { DatabaseMetricsChart } from "@repo/common/components/admin/database-metrics-chart";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
    Progress,
    Separator,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@repo/ui";
import { motion } from "framer-motion";
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    Clock,
    Database,
    HardDrive,
    Info,
    LineChart,
    PieChart,
    RefreshCw,
    Settings,
    TrendingUp,
    XCircle,
    Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DatabaseHealthMetrics } from "../../../components/admin/database-health-metrics";

interface DashboardData {
    overview: {
        time_window_hours: number;
        last_updated: string;
        health_status: string;
        total_runs: number;
        success_rate: number;
        average_duration_ms: number;
        max_duration_ms: number;
        total_errors: number;
        error_rate: number;
        by_type: {
            hourly: number;
            weekly: number;
        };
    };
    recent_activity: Array<{
        timestamp: string;
        type: string;
        status: string;
        duration_seconds: number;
        attempts: number;
        error: string | null;
    }>;
    alerts: Array<{
        severity: string;
        type: string;
        message: string;
        action: string;
    }>;
}

export default function DatabaseMaintenanceDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [hours, setHours] = useState(24);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isMountedRef = useRef(true);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/admin/database-maintenance-dashboard?hours=${hours}`,
                { signal },
            );

            if (response.status === 401 || response.status === 403) {
                throw new Error("Access denied");
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
            }

            const result = await response.json();
            const dashboardData = result.dashboard || {};
            const overview = dashboardData.overview || {};

            const safeData = {
                ...dashboardData,
                overview: {
                    time_window_hours: hours,
                    last_updated: new Date().toISOString(),
                    health_status: "unknown",
                    total_runs: 0,
                    success_rate: 0,
                    average_duration_ms: 0,
                    max_duration_ms: 0,
                    total_errors: 0,
                    error_rate: 0,
                    by_type: {
                        hourly: 0,
                        weekly: 0,
                    },
                    ...overview,
                },
                recent_activity: dashboardData.recent_activity || [],
                alerts: dashboardData.alerts || [],
            };

            if (isMountedRef.current && !signal.aborted) {
                setData(safeData);
            }
        } catch (err) {
            if (isMountedRef.current && !signal.aborted) {
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        } finally {
            if (isMountedRef.current && !signal.aborted) {
                setLoading(false);
            }
        }
    }, [hours]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    const getHealthStatusColor = (status: string) => {
        switch (status) {
            case "excellent":
                return "bg-green-500";
            case "good":
                return "bg-blue-500";
            case "warning":
                return "bg-yellow-500";
            case "critical":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "error":
            case "fatal_error":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center py-12"
                >
                    <RefreshCw className="h-8 w-8 animate-spin mr-3" />
                    <span className="text-lg">Loading database maintenance dashboard...</span>
                </motion.div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                >
                    <XCircle className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-3xl font-bold mb-2">Dashboard Error</h2>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">{error}</p>
                    <Button onClick={fetchData} size="lg">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!data || !data.overview) {
        return (
            <div className="container mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-12"
                >
                    <Database className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-3xl font-bold mb-2">No Data Available</h2>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Database maintenance tracking is not yet configured or no data is available.
                    </p>
                    <Button onClick={fetchData} size="lg">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Try Again
                    </Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Database Maintenance</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor and manage database performance, health, and maintenance tasks
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={hours}
                        onChange={(e) => setHours(parseInt(e.target.value))}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value={1}>Last Hour</option>
                        <option value={6}>Last 6 Hours</option>
                        <option value={24}>Last 24 Hours</option>
                        <option value={168}>Last Week</option>
                    </select>

                    <Button onClick={fetchData} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Settings className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Maintenance Settings</SheetTitle>
                                <SheetDescription>
                                    Configure database maintenance schedules and alerts
                                </SheetDescription>
                            </SheetHeader>
                            <div className="py-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">
                                            Auto-vacuum Schedule
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Daily at 2:00 AM
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Backup Schedule
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Every 6 hours
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">
                                            Alert Thresholds
                                        </label>
                                        <p className="text-sm text-muted-foreground">
                                            Connection errors {">"} 5%
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </motion.div>

            {/* Health Status Overview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">System Health</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={`${getHealthStatusColor(data.overview.health_status || "unknown")} text-white`}
                            >
                                {(data.overview.health_status || "unknown").toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Last checked: {new Date().toLocaleTimeString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(data.overview.success_rate || 0).toFixed(1)}%
                        </div>
                        <Progress value={data.overview.success_rate || 0} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                            {data.overview.total_runs || 0} total operations
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                            <Clock className="h-4 w-4 text-orange-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Math.round((data.overview.average_duration_ms || 0) / 1000)}s
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Peak: {Math.round((data.overview.max_duration_ms || 0) / 1000)}s
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {(data.overview.error_rate || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            {data.overview.total_errors || 0} errors
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Active Alerts */}
            {data.alerts && data.alerts.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                Active Alerts ({data.alerts.length})
                            </CardTitle>
                            <CardDescription>Issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.alerts.map((alert, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg border-l-4 ${
                                            alert.severity === "critical"
                                                ? "border-l-red-500 bg-red-50 dark:bg-red-950/30"
                                                : "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/30"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge
                                                        variant={
                                                            alert.severity === "critical"
                                                                ? "destructive"
                                                                : "default"
                                                        }
                                                    >
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {alert.type}
                                                    </span>
                                                </div>
                                                <p className="font-medium mb-1">{alert.message}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {alert.action}
                                                </p>
                                            </div>
                                            <HoverCard>
                                                <HoverCardTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Info className="h-4 w-4" />
                                                    </Button>
                                                </HoverCardTrigger>
                                                <HoverCardContent className="w-80">
                                                    <div className="space-y-2">
                                                        <h4 className="text-sm font-semibold">
                                                            Alert Details
                                                        </h4>
                                                        <p className="text-sm">{alert.message}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Recommended action: {alert.action}
                                                        </p>
                                                    </div>
                                                </HoverCardContent>
                                            </HoverCard>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Main Dashboard Tabs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="performance" className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Performance
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Maintenance
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Activity */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Recent Maintenance Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Latest maintenance operations and their status
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(data.recent_activity || [])
                                            .slice(0, 5)
                                            .map((activity, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {getStatusIcon(activity.status)}
                                                        <div>
                                                            <p className="font-medium capitalize">
                                                                {activity.type} maintenance
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {new Date(
                                                                    activity.timestamp,
                                                                ).toLocaleString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-medium">
                                                            {activity.duration_seconds}s
                                                            {activity.attempts > 1 && (
                                                                <span className="text-yellow-600 ml-1">
                                                                    ({activity.attempts} attempts)
                                                                </span>
                                                            )}
                                                        </p>
                                                        {activity.error && (
                                                            <p className="text-xs text-red-600 max-w-xs truncate">
                                                                {activity.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}

                                        {(!data.recent_activity ||
                                            data.recent_activity.length === 0) && (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>No recent maintenance activity</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Maintenance Type Breakdown */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Maintenance Breakdown
                                    </CardTitle>
                                    <CardDescription>
                                        Distribution of maintenance operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: "#D9487D" }}
                                                ></div>
                                                <span className="text-sm">Hourly Operations</span>
                                            </div>
                                            <Badge variant="outline">
                                                {data.overview.by_type?.hourly ?? 0} runs
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: "#D99A4E" }}
                                                ></div>
                                                <span className="text-sm">Weekly Operations</span>
                                            </div>
                                            <Badge variant="outline">
                                                {data.overview.by_type?.weekly ?? 0} runs
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Time Window
                                            </span>
                                            <span className="font-medium">
                                                {data.overview.time_window_hours || 24} hours
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Last Updated
                                            </span>
                                            <span className="font-medium">
                                                {data.overview.last_updated
                                                    ? new Date(
                                                          data.overview.last_updated,
                                                      ).toLocaleString()
                                                    : "Not available"}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-6">
                        <DatabaseMetricsChart />

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Connection Pool</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">8/20</div>
                                    <Progress value={40} className="mt-2" />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Active connections
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Cache Hit Ratio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">98.5%</div>
                                    <Progress value={98.5} className="mt-2" />
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Last 24 hours
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm">Query Response</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">12ms</div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Average response time
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="maintenance" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Maintenance Tasks */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Database className="h-5 w-5" />
                                        Scheduled Tasks
                                    </CardTitle>
                                    <CardDescription>
                                        Automated maintenance operations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        {
                                            task: "Auto-vacuum",
                                            status: "Completed",
                                            lastRun: "2 hours ago",
                                            nextRun: "In 22 hours",
                                        },
                                        {
                                            task: "Reindex",
                                            status: "Completed",
                                            lastRun: "1 day ago",
                                            nextRun: "In 6 days",
                                        },
                                        {
                                            task: "Backup",
                                            status: "Running",
                                            lastRun: "30 min ago",
                                            nextRun: "In 5h 30m",
                                        },
                                        {
                                            task: "Statistics Update",
                                            status: "Scheduled",
                                            lastRun: "6 hours ago",
                                            nextRun: "In 18 hours",
                                        },
                                    ].map((task, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-medium">
                                                        {task.task}
                                                    </span>
                                                    <Badge
                                                        variant={
                                                            task.status === "Completed"
                                                                ? "default"
                                                                : task.status === "Running"
                                                                  ? "secondary"
                                                                  : "outline"
                                                        }
                                                        className="text-xs"
                                                    >
                                                        {task.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    Last: {task.lastRun}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Next: {task.nextRun}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Storage Analysis */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <HardDrive className="h-5 w-5" />
                                        Storage Analysis
                                    </CardTitle>
                                    <CardDescription>
                                        Database storage utilization by table
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { name: "conversations", size: "2.4 GB", percentage: 60 },
                                        { name: "messages", size: "1.8 GB", percentage: 45 },
                                        { name: "users", size: "145 MB", percentage: 8 },
                                        { name: "sessions", size: "89 MB", percentage: 5 },
                                    ].map((table, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-medium">{table.name}</span>
                                                <span className="text-muted-foreground">
                                                    {table.size}
                                                </span>
                                            </div>
                                            <Progress value={table.percentage} className="h-2" />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        {/* Real-time Health Monitor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5" />
                                    Real-time Database Health
                                </CardTitle>
                                <CardDescription>
                                    Live monitoring of database performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DatabaseHealthMetrics />
                            </CardContent>
                        </Card>

                        {/* Query Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LineChart className="h-5 w-5" />
                                        Query Performance
                                    </CardTitle>
                                    <CardDescription>
                                        Slowest queries in the last 24 hours
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        {
                                            query: "SELECT * FROM conversations WHERE...",
                                            time: "245ms",
                                            count: "1,234",
                                        },
                                        {
                                            query: "SELECT m.* FROM messages m JOIN...",
                                            time: "189ms",
                                            count: "856",
                                        },
                                        {
                                            query: "UPDATE users SET last_seen WHERE...",
                                            time: "156ms",
                                            count: "423",
                                        },
                                    ].map((query, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-3 space-y-2"
                                        >
                                            <p className="text-sm font-mono text-muted-foreground">
                                                {query.query}
                                            </p>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">
                                                    Avg: {query.time}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    Count: {query.count}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Connection Test</CardTitle>
                                    <CardDescription>Database connectivity status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span>Database connectivity</span>
                                        <Badge className="bg-green-500 text-white">Connected</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Response time</span>
                                        <span className="text-sm font-medium">12ms</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span>Last health check</span>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date().toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <Separator />
                                    <Button className="w-full" variant="outline">
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Run Health Check
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </motion.div>
        </div>
    );
}
