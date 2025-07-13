"use client";

import { SecurityOverviewChart } from "@repo/common/components/admin/security-overview-chart";
import { log } from "@repo/shared/lib/logger";
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    LoadingSpinner,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TypographyH1,
    TypographyH2,
} from "@repo/ui";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, UserX } from "lucide-react";
import { useEffect, useState } from "react";

interface SecurityData {
    securityMetrics: {
        totalBannedUsers: number;
        activeBans: number;
        recentBans: number;
        totalSessions: number;
        activeSessions: number;
        impersonatedSessions: number;
        suspiciousSessions: number;
        unverifiedEmails: number;
        protectedUsers: number;
    };
    bannedUsers: Array<{
        id: string;
        name: string;
        email: string;
        banReason: string;
        banExpires: string | null;
        updatedAt: string;
    }>;
    suspiciousActivity: Array<{
        userId: string;
        userName: string;
        userEmail: string;
        requestCount: number;
        totalCostCents: number;
    }>;
    ipAnalysis: Array<{
        ipAddress: string;
        uniqueUsers: number;
        totalSessions: number;
        recentSessions: number;
    }>;
    impersonationActivity: Array<{
        sessionId: string;
        targetUserId: string;
        targetUserName: string;
        targetUserEmail: string;
        impersonatedBy: string;
        createdAt: string;
        ipAddress: string;
    }>;
}

export default function AdminSecurityPage() {
    const [data, setData] = useState<SecurityData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSecurityData = async () => {
            try {
                const response = await fetch("/api/admin/security");
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                log.error({ error }, "Failed to fetch security data");
            } finally {
                setLoading(false);
            }
        };

        fetchSecurityData();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <TypographyH1>Security Dashboard</TypographyH1>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <LoadingSpinner />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <TypographyH1>Security Dashboard</TypographyH1>

            {/* Security Overview Cards */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <TypographyH2 className="mb-6">Security Overview</TypographyH2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Banned Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {data.securityMetrics.totalBannedUsers}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    {data.securityMetrics.activeBans} active bans
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Active Sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {data.securityMetrics.activeSessions}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    of {data.securityMetrics.totalSessions} total
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Impersonated Sessions
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">
                                    {data.securityMetrics.impersonatedSessions}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    Admin sessions active
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Suspicious Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-600">
                                    {data.securityMetrics.suspiciousSessions}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    High-frequency IPs
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Unverified Emails
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                    {data.securityMetrics.unverifiedEmails}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    Users pending verification
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-muted-foreground text-sm font-medium">
                                    Protected Users
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {data.securityMetrics.protectedUsers}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                    Admin accounts protected
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            )}

            {/* Security Overview Charts */}
            {data && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <TypographyH2 className="mb-6">Security Analytics</TypographyH2>
                    <SecurityOverviewChart securityMetrics={data.securityMetrics} />
                </motion.div>
            )}

            {/* Banned Users Table */}
            {data?.bannedUsers && data.bannedUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <UserX className="mr-2 h-5 w-5" />
                                Recently Banned Users
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Expires</TableHead>
                                        <TableHead>Banned At</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.bannedUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{user.name}</div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{user.banReason}</TableCell>
                                            <TableCell>
                                                {user.banExpires ? (
                                                    <Badge variant="destructive">
                                                        {formatDate(user.banExpires)}
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline">Permanent</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(user.updatedAt)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Suspicious Activity */}
            {data?.suspiciousActivity && data.suspiciousActivity.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="mr-2 h-5 w-5" />
                                High Activity Users (Last 24h)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Requests</TableHead>
                                        <TableHead>Cost</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.suspiciousActivity.map((activity) => (
                                        <TableRow key={activity.userId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {activity.userName}
                                                    </div>
                                                    <div className="text-muted-foreground text-sm">
                                                        {activity.userEmail}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="destructive">
                                                    {activity.requestCount.toLocaleString()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                ${(activity.totalCostCents / 100).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            `/admin/users?search=${activity.userEmail}`,
                                                            "_blank",
                                                        )
                                                    }
                                                >
                                                    Investigate
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* IP Analysis */}
            {data?.ipAnalysis && data.ipAnalysis.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Globe className="mr-2 h-5 w-5" />
                                Suspicious IP Addresses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Unique Users</TableHead>
                                        <TableHead>Total Sessions</TableHead>
                                        <TableHead>Recent Sessions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.ipAnalysis.map((ip, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-mono">
                                                {ip.ipAddress}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        ip.uniqueUsers > 10
                                                            ? "destructive"
                                                            : "secondary"
                                                    }
                                                >
                                                    {ip.uniqueUsers}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{ip.totalSessions}</TableCell>
                                            <TableCell>{ip.recentSessions}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
